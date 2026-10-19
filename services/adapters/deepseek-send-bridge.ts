import { LayoutEnvelope } from '../intelligent-layout/envelope.js';
import { controlEvent, statusEvent, parseBridgeMessage, type BridgeCommand, type BridgeStatus, type SendIntent, type WithoutChannel } from '../intelligent-layout/bridge-protocol.js';
import { deepSeekOrigin, deepSeekSendPath, DeepSeekReadyProbe, rewriteDeepSeekSend, deepSeekRequestContract } from './deepseek-send.js';

export type PageWindow = Window & typeof globalThis;
const marker = '__oiuiLayoutPageBridgeV1';
type Installation = { dispose(): void; status(): { available: boolean; protocol: number; rulesDigest: string; contract: string; reason?: string } };

/** MAIN-world bridge: never reads request headers, credentials, files, or unrelated response bodies. */
export function installDeepSeekSendBridge(win: PageWindow, envelope: LayoutEnvelope,
  now: () => number = Date.now): Installation {
  const scope = win as PageWindow & { [marker]?: Installation };
  if (scope[marker]) return scope[marker]!;
  const proto = win.XMLHttpRequest?.prototype;
  if (!proto) return { dispose() {}, status: () => ({ available: false, protocol: 1, rulesDigest: envelope.rulesDigest, contract: deepSeekRequestContract, reason: '浏览器 XHR 接口不可用' }) };
  const nativeOpen = proto.open, nativeSend = proto.send, nativeFetch = win.fetch;
  let channel = '', lastSeen = 0, active: { intent: SendIntent; at: number } | null = null;
  const requests = new WeakMap<XMLHttpRequest, { method: string; url: string; async: boolean }>();
  // A monitor may wrap our functions while still forwarding to them. Prove reachability,
  // never by guessing at Function.toString, and never by making an actual request.
  const openProbes = new WeakSet<XMLHttpRequest>(), opened = new WeakSet<XMLHttpRequest>();
  const sendProbes = new WeakSet<XMLHttpRequest>(), sent = new WeakSet<XMLHttpRequest>();
  const fetchProbes = new WeakSet<Request>(), fetched = new WeakSet<Request>();
  const openReachable = () => {
    if (proto.open === open) return true;
    const probe = new win.XMLHttpRequest(); openProbes.add(probe);
    try { probe.open('POST', `${deepSeekOrigin}/api/v0/chat/completion`, true); }
    catch { return false; }
    finally { probe.abort(); } // open never sends, even when a wrapper bypasses us.
    return opened.has(probe);
  };
  const sendReachable = () => {
    if (proto.send === send) return true;
    const probe = new win.XMLHttpRequest(); sendProbes.add(probe);
    // Deliberately UNSENT: native send must throw if a wrapper bypasses our short circuit.
    try { probe.send(null); } catch { return false; }
    return sent.has(probe);
  };
  const fetchReachable = () => {
    if (win.fetch === fetch) return true;
    try {
      const abort = new win.AbortController(); abort.abort();
      const probe = new win.Request(`${deepSeekOrigin}/api/v0/chat/completion`, { method: 'POST', signal: abort.signal });
      fetchProbes.add(probe);
      // An already-aborted request cannot reach the network even if our guard is bypassed.
      void win.fetch(probe).catch(() => {});
      return fetched.has(probe);
    } catch { return false; }
  };
  const status = () => {
    const reason = win.location.origin !== deepSeekOrigin ? '当前来源不支持智能布局' :
      !openReachable() || !sendReachable() ? 'XHR 发送桥转发自检失败，请刷新页面；本条不会附加规则' :
      !fetchReachable() ? 'fetch 发送监测转发自检失败，请刷新页面；本条不会附加规则' : undefined;
    return { available: !reason, protocol: 1, rulesDigest: envelope.rulesDigest, contract: deepSeekRequestContract, reason };
  };
  const available = () => status().available;
  const emit = (status: WithoutChannel<BridgeStatus>, target = channel) => {
    win.dispatchEvent(new win.CustomEvent(statusEvent, { detail: JSON.stringify({ ...status, channel: target }) }));
  };
  const current = () => active && now() - lastSeen < 4_000 && now() - active.at < 120_000 && available() ? active.intent : null;
  const control = (event: Event) => {
    const message = parseBridgeMessage<BridgeCommand>(event);
    if (!message || !/^[a-f0-9]{32}$/.test(message.channel)) return;
    if (message.kind === 'hello') {
      if (channel !== message.channel) active = null;
      channel = message.channel; lastSeen = now();
      emit({ kind: 'ready', ...status() });
      return;
    }
    if (message.channel !== channel) return;
    if (message.kind === 'heartbeat') { lastSeen = now(); return; }
    if (message.kind === 'clear' || message.kind === 'stop') { active = null; if (message.kind === 'stop') lastSeen = 0; return; }
    if (message.kind === 'arm' && available()) {
      const i = message.intent;
      if (i && /^[a-f0-9]{32}$/.test(i.attemptId) && typeof i.route === 'string' && typeof i.enabled === 'boolean' && (i.operation === 'send' || i.operation === 'edit') &&
          envelope.validatePrepared(i.prepared) && (i.alias === undefined || typeof i.alias === 'string' && i.alias.length < 250_000)) {
        active = { intent: i, at: now() }; lastSeen = now();
      }
    }
  };
  const open = function(this: XMLHttpRequest, ...args: unknown[]) {
    if (openProbes.has(this)) { opened.add(this); return; }
    const result = Reflect.apply(nativeOpen, this, args);
    requests.set(this, { method: String(args[0]), url: String(args[1]), async: args[2] !== false });
    return result;
  } as typeof proto.open;
  const send = function(this: XMLHttpRequest, body?: Document | XMLHttpRequestBodyInit | null) {
    if (sendProbes.has(this)) { sent.add(this); return; }
    const info = requests.get(this), intent = current(), replyChannel = channel;
    if (!info?.async || !intent) {
      if (info?.async && active && info.method.toUpperCase() === 'POST' && deepSeekSendPath(info.url, win.location.href)) {
        const stale = active.intent; active = null;
        emit({ kind: 'unsupported', attemptId: stale.attemptId, reason: '发送等待过久或桥接条件已变化，本条未附加规则；请刷新页面' }, replyChannel);
      }
      return Reflect.apply(nativeSend, this, arguments);
    }
    const rewritten = rewriteDeepSeekSend(info.method, info.url, body, intent, win.location.href);
    if (rewritten.kind === 'ignored') return Reflect.apply(nativeSend, this, arguments);
    if (rewritten.kind === 'unsupported') {
      active = null;
      emit({ kind: 'unsupported', attemptId: intent.attemptId, reason: rewritten.reason }, replyChannel);
      return Reflect.apply(nativeSend, this, arguments);
    }
    emit({ kind: 'sending', attemptId: intent.attemptId }, replyChannel);
    let settled = false;
    const probe = new DeepSeekReadyProbe();
    const finish = (kind: 'accepted' | 'failed', reason?: string) => {
      if (settled) return;
      settled = true;
      if (kind === 'accepted' && active?.intent.attemptId === intent.attemptId) active = null;
      emit({ kind, attemptId: intent.attemptId, reason }, replyChannel);
    };
    const progress = () => {
      if (settled || this.readyState < 2) return;
      if (this.status < 200 || this.status >= 300) return;
      try {
        if ((this.getResponseHeader('content-type') ?? '').includes('text/event-stream') &&
            (this.responseType === '' || this.responseType === 'text') && probe.update(this.responseText)) finish('accepted');
      } catch { /* Unsupported response modes are never read or altered. */ }
    };
    const load = () => { progress(); if (!settled) finish('failed', '未收到已验证的发送成功事件；请检查发送状态，智能 UI 全局设置不变'); };
    const fail = () => finish('failed', '发送取消、超时或失败；智能 UI 全局设置不变');
    const cleanup = () => {
      this.removeEventListener('progress', progress); this.removeEventListener('readystatechange', progress);
      this.removeEventListener('load', load); this.removeEventListener('error', fail); this.removeEventListener('abort', fail);
      this.removeEventListener('timeout', fail); this.removeEventListener('loadend', cleanup);
    };
    this.addEventListener('progress', progress); this.addEventListener('readystatechange', progress);
    this.addEventListener('load', load); this.addEventListener('error', fail); this.addEventListener('abort', fail);
    this.addEventListener('timeout', fail); this.addEventListener('loadend', cleanup);
    try { return Reflect.apply(nativeSend, this, [rewritten.body]); }
    catch (error) { fail(); cleanup(); throw error; }
  } as typeof proto.send;
  const fetch = function(this: unknown, input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    if (input && typeof input === 'object' && fetchProbes.has(input as Request)) {
      fetched.add(input as Request);
      return Promise.reject(new win.DOMException('OIUI no-network bridge probe', 'AbortError'));
    }
    const intent = current();
    if (intent) try {
      const url = typeof input === 'string' || input instanceof win.URL ? String(input) : input.url;
      const method = init?.method ?? (input && typeof input === 'object' && 'method' in input ? input.method : 'GET');
      if (typeof method === 'string' && method.toUpperCase() === 'POST' && deepSeekSendPath(url, win.location.href)) {
        active = null;
        emit({ kind: 'unsupported', attemptId: intent.attemptId, reason: '站点已改用未验证的 fetch 发送，本条未附加规则' });
      }
    } catch { /* Preserve native validation and exceptions for unusual fetch arguments. */ }
    return Reflect.apply(nativeFetch, this, arguments);
  } as typeof win.fetch;
  try { proto.open = open; proto.send = send; win.fetch = fetch; }
  catch {
    if (proto.open === open) proto.open = nativeOpen;
    if (proto.send === send) proto.send = nativeSend;
    if (nativeFetch && win.fetch === fetch) win.fetch = nativeFetch;
    return { dispose() {}, status: () => ({ available: false, protocol: 1, rulesDigest: envelope.rulesDigest, contract: deepSeekRequestContract, reason: '无法安装发送桥，请刷新扩展和页面' }) };
  }
  win.addEventListener(controlEvent, control);
  const installation = { status, dispose() {
    active = null; channel = ''; lastSeen = 0;
    win.removeEventListener(controlEvent, control);
    if (proto.open === open) proto.open = nativeOpen;
    if (proto.send === send) proto.send = nativeSend;
    if (nativeFetch && win.fetch === fetch) win.fetch = nativeFetch;
    delete scope[marker];
  } };
  scope[marker] = installation;
  return installation;
}
