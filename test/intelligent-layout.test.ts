import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { buildSync } from 'esbuild';
import { updateExtensionEnabled } from '../services/extension-mode.js';
import { readFileSync } from 'node:fs';
import { sha256 } from '../services/intelligent-layout/checksum.js';
import { LayoutEnvelope, readProvenance, rememberPrepared } from '../services/intelligent-layout/envelope.js';
import { IntelligentLayoutController } from '../services/intelligent-layout/controller.js';
import { LayoutBridgeClient } from '../services/intelligent-layout/bridge-client.js';
import type { BridgeStatus, SendIntent } from '../services/intelligent-layout/bridge-protocol.js';
import { deepSeekSendPath, DeepSeekReadyProbe, rewriteDeepSeekSend } from '../services/adapters/deepseek-send.js';
import { installDeepSeekSendBridge, type PageWindow } from '../services/adapters/deepseek-send-bridge.js';
import { deepSeekComposer } from '../services/adapters/deepseek-composer.js';
const require = createRequire(import.meta.url);
try { const id = require.resolve('canvas'); require.cache[id] = { id, filename: id, loaded: true, exports: {} } as any; } catch {}
const { JSDOM } = require('jsdom') as typeof import('jsdom');
const rules = readFileSync(new URL('../docs/prompts/recommended.en.txt', import.meta.url), 'utf8');
const fixture = readFileSync(new URL('./fixtures/deepseek.composer.sanitized.html', import.meta.url), 'utf8');
const envelope = new LayoutEnvelope(rules);
const id = 'a'.repeat(32), url = 'https://chat.deepseek.com/a/chat/local-only';
const original = '用户原文\n<box>这是用户自己的代码</box>';
const body = (prompt = original) => JSON.stringify({ chat_session_id: 'session', parent_message_id: null, model_type: 'deepseek', prompt,
  ref_file_ids: ['file-id'], thinking_enabled: true, search_enabled: false, action: null, source: 'web', preempt: false, future: { preserve: 1 } });
const intent = (enabled = true): SendIntent => ({ attemptId: id, route: url, enabled, operation:'send', prepared: envelope.prepare(original, id) });
const ready = 'event: ready\ndata: {"request_message_id":1,"response_message_id":2}\n\n';
const tick = () => new Promise(resolve => setTimeout(resolve, 5));

test('SHA256 matches standard implementation for empty, UTF8, and multiblock content', () => {
  for (const value of ['', 'abc', '中文😀\n', rules, 'x'.repeat(200_000)]) assert.equal(sha256(value), createHash('sha256').update(value).digest('hex'));
});
test('only exact complete locally recorded versioned suffixes fold, including after refresh', () => {
  const p = envelope.prepare(original, id), records = readProvenance([]);
  assert.equal(envelope.recognize(p.wrapped, records), null);
  rememberPrepared(records, p);
  assert.equal(envelope.recognize(p.wrapped, readProvenance([...records.values()]))?.original, original);
  for (const text of [p.wrapped + '\n', p.wrapped.replace('用户', '别的用户'), p.wrapped.replace('v1', 'v2'), p.wrapped.replace('Use', 'Changed'), original, '```\n' + p.wrapped + '\n```']) {
    assert.equal(envelope.recognize(text, records), null);
  }
  const nested = envelope.prepare(p.wrapped, 'b'.repeat(32)); rememberPrepared(records, nested);
  assert.equal(envelope.recognize(nested.wrapped, records)?.original, p.wrapped, 'exact boundaries preserve original content');
  assert.equal(envelope.validatePrepared({ ...p, wrapped: p.wrapped + 'tamper' }), false);
  assert.equal(JSON.stringify([...records.values()]).includes(original), false);
});
test('provenance is bounded and schema checked', () => {
  const records = readProvenance([null, {version: 2}, {version: 1, id, digest: 'bad', createdAt: 0}]);
  for (let i = 0; i < 510; i++) rememberPrepared(records, envelope.prepare('test', i.toString(16).padStart(32,'0')), i);
  assert.equal(records.size, 500); assert.equal(records.has('0'.repeat(32)), false);
});
test('verified request changes only prompt and is idempotent on retries; unknown requests pass', () => {
  const active = intent(), request = body();
  const changed = rewriteDeepSeekSend('POST', '/api/v0/chat/completion', request, active, url);
  assert.equal(changed.kind, 'matched'); if (changed.kind !== 'matched') return;
  const before = JSON.parse(request), after = JSON.parse(changed.body);
  assert.equal(after.prompt, active.prepared.wrapped); delete before.prompt; delete after.prompt; assert.deepEqual(after, before);
  assert.deepEqual(rewriteDeepSeekSend('POST', '/api/v0/chat/completion', changed.body, active, url), changed);
  assert.equal(deepSeekSendPath('/api/v0/chat/completion?x=1', url), null);
  for (const target of ['https://example.com/api/v0/chat/completion', '/api/v0/chat/regenerate', '/api/v0/chat/resume_stream', '/api/v0/chat/continue']) {
    assert.equal(rewriteDeepSeekSend('POST', target, request, active, url).kind, 'ignored');
  }
  assert.equal(rewriteDeepSeekSend('GET', '/api/v0/chat/completion', request, active, url).kind, 'ignored');
  assert.equal(rewriteDeepSeekSend('POST', '/api/v0/chat/completion', '{}', active, url).kind, 'unsupported');
  assert.equal(rewriteDeepSeekSend('POST', '/api/v0/chat/completion', body('other draft'), active, url).kind, 'unsupported');
  assert.equal(rewriteDeepSeekSend('POST', '/api/v0/chat/completion', request, active, url + '-other').kind, 'ignored');
  assert.equal(rewriteDeepSeekSend('POST', '/api/v0/chat/completion', request, {...active, route:'https://chat.deepseek.com/'}, url).kind, 'matched');
  const edit = JSON.stringify({ ...JSON.parse(request), message_id: 123, prompt: active.prepared.wrapped });
  const disabled = rewriteDeepSeekSend('POST', '/api/v0/chat/edit_message', edit, {...active, enabled:false, operation:'edit'}, url);
  assert.equal(disabled.kind, 'matched'); if(disabled.kind === 'matched') assert.equal(JSON.parse(disabled.body).prompt, original);
});
test('ready observer waits for complete valid SSE, without consuming partial streams', () => {
  const probe = new DeepSeekReadyProbe();
  const head = 'event: delta\ndata: {"v":"partial"}\n\n';
  assert.equal(probe.update(head + ready.slice(0,-2)), false);
  assert.equal(probe.update(head + ready), true);
  assert.equal(probe.update(head + ready + 'event: delta\ndata: more'), true);
  assert.equal(new DeepSeekReadyProbe().update('event: ready\ndata: {"ok":true}\n\n'), false);
  assert.equal(new DeepSeekReadyProbe().update(ready.replaceAll('\n','\r\n')), true);
});

function setup(withBridge = true, now: () => number = Date.now, contentRuntime = false) {
  const dom = new JSDOM(fixture, { url, runScripts:contentRuntime ? 'outside-only' : undefined }); const win = dom.window as unknown as PageWindow;
  const sent: unknown[] = [], fetchCalls: unknown[][] = [];
  class FakeXHR extends win.EventTarget {
    readyState = 0; status = 0; responseText = ''; responseType = ''; contentType = 'text/event-stream'; headers: [string,string][] = []; aborted = false;
    open(...args: unknown[]) { (this as any).openArgs = args; this.readyState=1; }
    setRequestHeader(k: string,v: string) { this.headers.push([k,v]); }
    send(value: unknown) { if (this.readyState===0) throw new win.DOMException('UNSENT','InvalidStateError'); sent.push(value); if (value === 'throw') throw new Error('native failure'); }
    abort() { this.aborted = true; this.dispatchEvent(new win.Event('abort')); this.dispatchEvent(new win.Event('loadend')); }
    getResponseHeader(name: string) { assert.equal(name, 'content-type'); return this.contentType; }
    chunk(text: string, status = 200) { this.status = status; this.readyState = 3; this.responseText += text; this.dispatchEvent(new win.Event('progress')); }
    finish() { this.readyState = 4; this.dispatchEvent(new win.Event('load')); this.dispatchEvent(new win.Event('loadend')); }
  }
  win.XMLHttpRequest = FakeXHR as any;
  win.Request=globalThis.Request; win.AbortController=globalThis.AbortController;
  win.fetch = function(...args: unknown[]) { fetchCalls.push(args); return Promise.resolve({ untouched: true } as any); } as any;
  const nativeOpen = FakeXHR.prototype.open, nativeSend = FakeXHR.prototype.send, nativeFetch = win.fetch;
  const bridge = withBridge ? installDeepSeekSendBridge(win, envelope, now) : null;
  const xhr = () => new win.XMLHttpRequest() as unknown as FakeXHR;
  return { dom, win, sent, fetchCalls, bridge, xhr, nativeOpen, nativeSend, nativeFetch,
    close() { bridge?.dispose(); dom.window.close(); } };
}
function standalone(s: ReturnType<typeof setup>, storage: {load():Promise<unknown>;save(records:any):Promise<void>}, enabled=false) {
  const controller: IntelligentLayoutController=new IntelligentLayoutController(s.win,envelope,storage,async next=>{controller.setEnabled(next)});
  controller.setEnabled(enabled);return controller;
}
test('bridge forwards exact native XHR, preserves headers/cancellation/partial responses and retries', () => {
  const s = setup(); const statuses: BridgeStatus[] = []; const client = new LayoutBridgeClient(s.win, value => statuses.push(value), envelope.rulesDigest);
  try {
    assert.equal(s.bridge?.status().available, true); client.start(); assert.equal((statuses.at(-1) as any).available, true);
    client.arm(intent()); const request = s.xhr(); request.open('POST','/api/v0/chat/completion',true); request.setRequestHeader('x-test','preserved');
    request.send(body()); assert.equal(JSON.parse(s.sent[0] as string).prompt, intent().prepared.wrapped);
    let observed = ''; request.addEventListener('progress', () => { observed = request.responseText; });
    request.chunk(ready.slice(0,20)); assert.equal(statuses.at(-1)?.kind,'sending'); assert.equal(observed, ready.slice(0,20));
    request.abort(); assert.equal(statuses.at(-1)?.kind,'failed'); assert.equal(request.aborted,true);
    const retry = s.xhr(); retry.open('POST','/api/v0/chat/completion',true); retry.send(s.sent[0]);
    assert.equal(s.sent[1],s.sent[0]); retry.chunk(ready); assert.equal(statuses.at(-1)?.kind,'accepted'); retry.finish();
    assert.deepEqual(request.headers,[['x-test','preserved']]);
    const unrelated = s.xhr(); unrelated.open('POST','/api/v0/chat/regenerate',true); unrelated.send('unchanged'); assert.equal(s.sent.at(-1),'unchanged');
    client.arm(intent()); const failure = s.xhr(); failure.open('POST','/api/v0/chat/completion',true); failure.send(body()); failure.contentType='application/json'; failure.chunk('{"error":1}'); failure.finish();
    assert.equal(statuses.at(-1)?.kind,'failed');
    client.clear(); const untouched = s.xhr(); untouched.open('POST','/api/v0/chat/completion',true); untouched.send(body()); assert.equal(s.sent.at(-1),body());
    client.arm(intent()); const args = ['/api/v0/chat/completion', {method:'POST',body:body(),signal:new s.win.AbortController().signal}] as const;
    void s.win.fetch(...args); assert.equal(statuses.at(-1)?.kind,'unsupported'); assert.deepEqual(s.fetchCalls[0],args);
  } finally { client.stop(); s.bridge?.dispose(); assert.equal(s.win.XMLHttpRequest.prototype.send,s.nativeSend); assert.equal(s.win.fetch,s.nativeFetch); s.close(); }
});
test('bridge rejects malformed bodies; never reports HTTP error or timeout as success', () => {
  const s = setup(), statuses: BridgeStatus[] = [], client = new LayoutBridgeClient(s.win, v => statuses.push(v), envelope.rulesDigest);
  try {
    client.start(); client.arm(intent()); const invalid = s.xhr(); invalid.open('POST','/api/v0/chat/completion',true); invalid.send('{}');
    assert.equal(s.sent[0],'{}'); assert.equal(statuses.at(-1)?.kind,'unsupported');
    client.arm(intent()); const error = s.xhr(); error.open('POST','/api/v0/chat/completion',true); error.send(body()); error.chunk(ready,500); error.finish(); assert.equal(statuses.at(-1)?.kind,'failed');
    client.arm(intent()); const timeout = s.xhr(); timeout.open('POST','/api/v0/chat/completion',true); timeout.send(body()); timeout.dispatchEvent(new s.win.Event('timeout')); assert.equal(statuses.at(-1)?.kind,'failed');
    s.win.document.scripts[0].remove(); assert.equal(s.bridge?.status().available,true, 'asset names do not prove the request contract');
  } finally { client.stop(); s.close(); }
});
test('expired send intent passes the original request and reports unavailable explicitly', () => {
  let clock=1; const s=setup(true,()=>clock), statuses: BridgeStatus[]=[];
  const client=new LayoutBridgeClient(s.win,v=>statuses.push(v),envelope.rulesDigest);
  try {
    client.start(); client.arm(intent()); clock=5001;
    const request=s.xhr(); request.open('POST','/api/v0/chat/completion',true); request.send(body());
    assert.equal(s.sent[0],body()); assert.equal(statuses.at(-1)?.kind,'unsupported');
  } finally {client.stop();s.close();}
});

test('persistent mode Enter/click/IME, failure retry, edit, history folding, refresh, SPA and disable', async () => {
  const s = setup(); let saved: unknown = [];
  const storage = { async load() { return saved; }, async save(records: unknown) { saved = structuredClone(records); } };
  let controller = standalone(s,storage); await controller.start();
  const editor = s.win.document.querySelector('textarea')!, send = s.win.document.querySelector('[aria-label="发送"]')!;
  const toggle = () => s.win.document.querySelector<HTMLButtonElement>('[data-iui-layout-toggle]')!;
  const key = (init: KeyboardEventInit = {}) => editor.dispatchEvent(new s.win.KeyboardEvent('keydown',{key:'Enter',bubbles:true,...init}));
  const request = (prompt = editor.value, path = '/api/v0/chat/completion') => { const x = s.xhr(); x.open('POST',path,true); x.send(path.endsWith('edit_message') ? JSON.stringify({...JSON.parse(body(prompt)),message_id:4}) : body(prompt)); return x; };
  try {
    assert.equal(toggle().getAttribute('aria-pressed'),'false'); assert.equal(toggle().previousElementSibling?.textContent,'智能搜索');
    editor.value = original; key(); request(); assert.equal(s.sent.at(-1),body());
    editor.value='  '+original+'\n';
    assert.equal(deepSeekComposer.prompt({...deepSeekComposer.find(s.win.document)!,operation:'send'}),original);
    assert.equal(editor.value,'  '+original+'\n','Host trimming must not mutate the visible editor');
    editor.value=original;
    toggle().click(); await tick(); assert.equal(toggle().getAttribute('aria-pressed'),'true'); assert.equal(editor.value,original);
    for (const init of [{isComposing:true},{shiftKey:true},{keyCode:229}]) { key(init); request(); assert.equal(s.sent.at(-1),body()); }
    editor.dispatchEvent(new s.win.CompositionEvent('compositionstart',{bubbles:true})); key(); request(); assert.equal(s.sent.at(-1),body()); editor.dispatchEvent(new s.win.CompositionEvent('compositionend',{bubbles:true}));
    key(); const failed = request(); const wrapped = JSON.parse(s.sent.at(-1) as string).prompt;
    assert.ok(wrapped.includes(rules)); assert.equal(editor.value,original); failed.abort(); assert.equal(toggle().getAttribute('aria-pressed'),'true');
    key(); const retry = request(); assert.equal(JSON.parse(s.sent.at(-1) as string).prompt,wrapped); retry.chunk(ready); assert.equal(toggle().getAttribute('aria-pressed'),'true'); retry.finish();
    const message = s.win.document.createElement('div'); message.className='ds-message'; const source = s.win.document.createElement('div'); source.className='ds-collapsible-text'; source.textContent=wrapped; message.append(source); s.win.document.querySelector('#messages')!.append(message); await tick();
    assert.ok(source.hasAttribute('data-iui-layout-source-hidden')); const projection = source.nextElementSibling!;
    assert.equal(projection.querySelector('[data-iui-layout-original]')?.textContent,original); assert.equal(projection.querySelector('details')?.open,false); assert.ok(projection.querySelector('pre')?.textContent?.includes(rules));
    editor.value = wrapped; editor.dispatchEvent(new s.win.Event('input',{bubbles:true})); assert.equal(editor.value,original);
    toggle().click(); await tick(); // OFF uses the same mode for editing and future sends.
    const editRoot=s.win.document.createElement('div'); editRoot.innerHTML='<textarea name="user query"></textarea><div><div role="button" class="ds-button">取消</div><div role="button" class="ds-button ds-button--primary">发送</div></div>';
    s.win.document.body.append(editRoot); const editEditor=editRoot.querySelector('textarea')!, editSend=editRoot.querySelectorAll('[role="button"]')[1];
    editEditor.value=wrapped; controller.refresh(); assert.equal(editEditor.value,original);
    editSend.dispatchEvent(new s.win.MouseEvent('click',{bubbles:true})); const plainEdit=request(editEditor.value,'/api/v0/chat/edit_message'); assert.equal(JSON.parse(s.sent.at(-1) as string).prompt,original); plainEdit.chunk(ready); plainEdit.finish();
    toggle().click(); await tick(); editSend.dispatchEvent(new s.win.MouseEvent('click',{bubbles:true})); const edited = request(editEditor.value,'/api/v0/chat/edit_message'); const editedPrompt=JSON.parse(s.sent.at(-1) as string).prompt; assert.equal(editedPrompt.split(rules).length,2); edited.chunk(ready); edited.finish();
    controller.stop(); assert.equal(source.hasAttribute('data-iui-layout-source-hidden'),false); assert.equal(s.win.document.querySelector('[data-iui-layout-history]'),null);
    controller = standalone(s,storage,true); await controller.start(); assert.ok(source.hasAttribute('data-iui-layout-source-hidden')); assert.equal(toggle().getAttribute('aria-pressed'),'true');
    source.textContent=wrapped+'edited'; await tick(); assert.equal(source.hasAttribute('data-iui-layout-source-hidden'),false);
    s.dom.reconfigure({url:url+'-next'}); controller.refresh(); assert.equal(toggle().getAttribute('aria-pressed'),'true');
    assert.equal(editor.value,original);
  } finally { controller.stop(); s.close(); }
});
test('missing bridge disables toggle with explanation; unknown user code is never hidden', async () => {
  const s = setup(false), controller = standalone(s,{async load(){return []},async save(){}});
  await controller.start();
  try {
    const button=s.win.document.querySelector<HTMLButtonElement>('[data-iui-layout-toggle]')!; assert.equal(button.disabled,true);
    const source=s.win.document.createElement('div'); source.className='ds-collapsible-text'; source.textContent=envelope.prepare(original,id).wrapped;
    const message=s.win.document.createElement('div'); message.className='ds-message'; message.append(source); s.win.document.body.append(message); await tick(); assert.equal(source.hasAttribute('data-iui-layout-source-hidden'),false);
  } finally {controller.stop();s.close();}
});

test('renamed deployed assets: genuine installed bridge enables preselection on an empty, unsendable composer', async () => {
  const s=setup();
  s.win.document.scripts[0].src='https://fe-static.deepseek.com/chat/static/main.new-build.js';
  s.win.document.scripts[1].remove();
  const search=deepSeekComposer.find(s.win.document)!.search;
  search.classList.add('ds-toggle-button--selected','native-theme-class');
  search.innerHTML='<span class="ds-icon" style="font-size:18px;width:18px;height:18px"><svg></svg></span><span>智能搜索</span>';
  const beforeSearch=search.outerHTML;
  const editor=s.win.document.querySelector('textarea')!, send=s.win.document.querySelector('[aria-label="发送"]')!;
  send.classList.add('ds-button--disabled');
  const controller=standalone(s,{async load(){return []},async save(){}});
  await controller.start();
  try {
    const button=s.win.document.querySelector<HTMLButtonElement>('[data-iui-layout-toggle]')!;
    assert.equal(editor.value,''); assert.equal(button.disabled,false);
    assert.equal(button.getAttribute('aria-pressed'),'false');
    assert.equal(button.classList.contains('native-theme-class'),true);
    assert.equal(button.classList.contains('ds-toggle-button--selected'),false,'do not copy the native ON state');
    assert.ok(button.querySelector('svg[stroke="currentColor"]')); assert.equal(button.querySelector('.ds-icon')?.getAttribute('aria-hidden'),'true');
    button.click(); await tick(); assert.equal(button.getAttribute('aria-pressed'),'true'); assert.equal(button.classList.contains('ds-toggle-button--selected'),true);
    button.click(); await tick(); assert.equal(button.getAttribute('aria-pressed'),'false'); assert.equal(button.classList.contains('ds-toggle-button--selected'),false);
    assert.equal(search.outerHTML,beforeSearch,'never modify the neighboring native control');
    assert.equal(editor.value,''); assert.equal(s.sent.length,0,'preselection must not send a request');
    button.focus(); assert.equal(s.win.document.activeElement,button);
  } finally {controller.stop();s.close();}
});
test('genuine bridge with mismatched compiled rules stays disabled with a reload instruction', async () => {
  const s=setup(false), bridge=installDeepSeekSendBridge(s.win,new LayoutEnvelope('different build'));
  const controller=standalone(s,{async load(){return []},async save(){}});
  await controller.start();
  try {
    const button=s.win.document.querySelector<HTMLButtonElement>('[data-iui-layout-toggle]')!;
    assert.equal(button.disabled,true); assert.match(button.title,/版本不一致/);
    button.click(); await tick(); assert.equal(button.getAttribute('aria-pressed'),'false'); assert.equal(s.sent.length,0);
  } finally {controller.stop();bridge.dispose();s.close();}
});
test('real transport hook replacement reports the concrete cause instead of a fake ready', () => {
  const s=setup(), statuses: BridgeStatus[]=[];
  const client=new LayoutBridgeClient(s.win,v=>statuses.push(v),envelope.rulesDigest);
  try {
    s.win.XMLHttpRequest.prototype.send=s.nativeSend as any;
    client.start(); const status=statuses.at(-1)!;
    assert.equal(status.kind,'ready'); if(status.kind!=='ready') return;
    assert.equal(status.available,false); assert.match(status.reason!,/XHR.*自检失败/);
  } finally {client.stop();s.close();}
});
test('manifest installs MAIN bridge before isolated UI; permissions are unchanged', () => {
  const manifest=JSON.parse(readFileSync(new URL('../packages/chrome-extension/manifest.json',import.meta.url),'utf8'));
  const main=manifest.content_scripts.find((s:any)=>s.js.includes('page-bridge.js'));
  const content=manifest.content_scripts.find((s:any)=>s.js.includes('content.js'));
  assert.equal(main.world,'MAIN');assert.equal(main.run_at,'document_start');assert.equal(content.run_at,'document_idle');
  assert.deepEqual(manifest.permissions,['storage','scripting','activeTab']);
});

test('observed response-monitor wrappers forward to the genuine bridge; readiness probes make zero requests', async () => {
  const s=setup(), statuses: BridgeStatus[]=[];
  const originalOpen=s.win.XMLHttpRequest.prototype.open, originalSend=s.win.XMLHttpRequest.prototype.send, originalFetch=s.win.fetch;
  s.win.XMLHttpRequest.prototype.open=function(this: XMLHttpRequest,...args: any[]) {return Reflect.apply(originalOpen,this,args)} as any;
  s.win.XMLHttpRequest.prototype.send=function(data: any) {this.addEventListener('load',()=>{});return originalSend.call(this,data)};
  s.win.fetch=function(...args: any[]) {return Reflect.apply(originalFetch,this,args).then((response: Response)=>response.clone())};
  const client=new LayoutBridgeClient(s.win,v=>statuses.push(v),envelope.rulesDigest);
  try {
    client.start(); const status=statuses.at(-1)!; assert.equal(status.kind,'ready');
    if(status.kind!=='ready')return; assert.equal(status.available,true);
    assert.equal(s.sent.length,0); assert.equal(s.fetchCalls.length,0,'aborted guard probes must short circuit before native fetch');
    client.arm(intent()); const xhr=s.xhr(); xhr.open('POST','/api/v0/chat/completion',true); xhr.send(body());
    assert.equal(s.sent.length,1); assert.equal(JSON.parse(s.sent[0] as string).prompt,intent().prepared.wrapped);
    xhr.chunk(ready); assert.equal(statuses.at(-1)?.kind,'accepted'); xhr.finish();
  } finally {client.stop();s.close();}
});
test('a fetch wrapper that bypasses the bridge remains unavailable and sees only an already-aborted probe', () => {
  const s=setup(),statuses:BridgeStatus[]=[];let aborted=false;
  s.win.fetch=function(input:any) {aborted=input.signal.aborted;return Promise.reject(new Error('probe aborted'))};
  const client=new LayoutBridgeClient(s.win,v=>statuses.push(v),envelope.rulesDigest);
  try {
    client.start();const status=statuses.at(-1)!;assert.equal(status.kind,'ready');
    if(status.kind!=='ready')return;assert.equal(status.available,false);assert.match(status.reason!,/fetch.*自检失败/);
    assert.equal(aborted,true);assert.equal(s.sent.length,0);assert.equal(s.fetchCalls.length,0);
  } finally {client.stop();s.close();}
});

test('production content bundle shares one persistent switch with popup storage: injection, render, OFF restore, stream, SPA and refresh', async () => {
  const content=buildSync({entryPoints:['packages/chrome-extension/content.ts'],bundle:true,write:false,platform:'browser',format:'iife',target:'chrome120',loader:{'.txt':'text','.css':'text','.png':'dataurl'},define:{'process.env.NODE_ENV':'"production"'}}).outputFiles[0].text;
  const values:Record<string,any>={iuiSettings:{enabled:false,defaultDeepSeek:true,rules:[{id:'saved',pattern:'file:///safe.html',adapterId:'deepseek'}]}};
  const settle=()=>new Promise(r=>setTimeout(r,30));
  const boot=async()=>{
    const s=setup(true,Date.now,true);(s.win as any).TextEncoder=globalThis.TextEncoder;
    const listeners:((changes:Record<string,unknown>,area:string)=>void)[]=[];
    const local={async get(defaults:any){if(typeof defaults==='string')return {[defaults]:values[defaults]};return {...defaults,...values}},async set(next:Record<string,any>){const changes=Object.fromEntries(Object.keys(next).map(k=>[k,{oldValue:values[k],newValue:next[k]}]));Object.assign(values,structuredClone(next));listeners.forEach(l=>l(changes,'local'))}};
    (s.win as any).chrome={storage:{local,onChanged:{addListener:(l:any)=>listeners.push(l)}},runtime:{onMessage:{addListener(){}}}};
    const message=s.win.document.createElement('div');message.className='ds-message';
    const answer=s.win.document.createElement('div');answer.className='ds-markdown ds-assistant-message-main-content';answer.textContent='<box><title>Existing interactive reply</title></box>';message.append(answer);s.win.document.querySelector('#messages')!.append(message);
    s.win.eval(content);await settle();
    return {...s,local,answer,toggle:()=>s.win.document.querySelector<HTMLButtonElement>('[data-iui-layout-toggle]')!,editor:s.win.document.querySelector('textarea')!};
  };
  let s=await boot();
  const send=()=>{s.editor.value=original;s.editor.dispatchEvent(new s.win.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));const xhr=s.xhr();xhr.open('POST','/api/v0/chat/completion',true);xhr.send(body());return xhr};
  try {
    assert.equal(s.toggle().getAttribute('aria-pressed'),'false');assert.equal(s.win.document.querySelector('[data-iui-preview]'),null);assert.equal(s.answer.hasAttribute('data-iui-original-hidden'),false);
    send();assert.equal(s.sent.at(-1),body(),'OFF does not append rules');
    s.toggle().click();await settle();assert.equal(values.iuiSettings.enabled,true);assert.equal(s.toggle().getAttribute('aria-pressed'),'true');assert.ok(s.win.document.querySelector('[data-iui-preview]'));assert.ok(s.answer.hasAttribute('data-iui-original-hidden'));
    const accepted=send();const wrapped=JSON.parse(s.sent.at(-1) as string).prompt;assert.ok(wrapped.includes(rules));accepted.chunk(ready);accepted.finish();await settle();assert.equal(s.toggle().getAttribute('aria-pressed'),'true','success must keep unified mode ON');assert.equal(values.iuiSettings.enabled,true);
    s.toggle().click();await settle();assert.equal(values.iuiSettings.enabled,false);assert.equal(s.win.document.querySelector('[data-iui-preview]'),null);assert.equal(s.answer.hasAttribute('data-iui-original-hidden'),false);send();assert.equal(s.sent.at(-1),body());
    // This is the same helper and key used by popup, not a separate content-script mode.
    await updateExtensionEnabled(s.local,true);await settle();assert.equal(s.toggle().getAttribute('aria-pressed'),'true');assert.ok(s.win.document.querySelector('[data-iui-preview]'));
    s.dom.reconfigure({url:url+'-spa'});await new Promise(r=>setTimeout(r,550));assert.equal(s.toggle().getAttribute('aria-pressed'),'true','SPA must retain global mode');
    const pending=send();s.toggle().click();await settle();assert.equal(values.iuiSettings.enabled,false);pending.chunk(ready);pending.finish();await settle();assert.equal(s.toggle().getAttribute('aria-pressed'),'false');assert.equal(s.win.document.querySelector('[data-iui-preview]'),null,'a late stream cannot re-enable rendering');
    assert.deepEqual(values.iuiSettings.rules,[{id:'saved',pattern:'file:///safe.html',adapterId:'deepseek'}],'toggle must preserve routing settings');
    s.win.dispatchEvent(new s.win.Event('pagehide'));s.close();s=await boot();assert.equal(s.toggle().getAttribute('aria-pressed'),'false');assert.equal(s.win.document.querySelector('[data-iui-preview]'),null,'OFF survives refresh');
    await updateExtensionEnabled(s.local,true);await settle();s.win.dispatchEvent(new s.win.Event('pagehide'));s.close();s=await boot();assert.equal(s.toggle().getAttribute('aria-pressed'),'true');assert.ok(s.win.document.querySelector('[data-iui-preview]'),'ON survives refresh');
  } finally {s.win.dispatchEvent(new s.win.Event('pagehide'));s.close();}
});
