import { deepSeekComposer, type Composer, type SendTarget } from '../adapters/deepseek-composer.js';
import { isNewSessionNavigation } from '../adapters/deepseek-send.js';
import { LayoutBridgeClient } from './bridge-client.js';
import type { BridgeStatus, SendIntent } from './bridge-protocol.js';
import { LayoutEnvelope, maximumPromptLength, randomLayoutId, readProvenance, rememberPrepared, type Provenance } from './envelope.js';

export type LayoutStorage = { load(): Promise<unknown>; save(records: Provenance[]): Promise<void> };
type Fold = { source: HTMLElement; view: HTMLElement; text: string };

/** Content-world UI. The editor contains only the original text; MAIN handles the verified request. */
export class IntelligentLayoutController {
  private readonly bridge: LayoutBridgeClient;
  private records = new Map<string, Provenance>();
  private composer: Composer | null = null;
  private button: HTMLButtonElement | null = null;
  private observer?: MutationObserver;
  private timer?: number;
  private running = false;
  private loaded = false;
  private available = false;
  private unsupported = false;
  private enabled = false;
  private pending = false;
  private composing = false;
  private reason = '发送桥接检查中';
  private route: string;
  private intent: SendIntent | null = null;
  private folds = new Map<HTMLElement, Fold>();
  private scheduled = false;
  private restoring = false;
  private switching = false;
  private aliases = new WeakMap<HTMLTextAreaElement, { original: string; wrapped: string }>();
  constructor(private readonly win: Window & typeof globalThis, private readonly envelope: LayoutEnvelope,
    private readonly storage: LayoutStorage, private readonly changeMode: (enabled: boolean) => Promise<void>) {
    this.route = win.location.href;
    this.bridge = new LayoutBridgeClient(win, status => this.receive(status), envelope.rulesDigest);
  }
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.intent = null; this.pending = false; this.bridge.clear();
      for (const fold of this.folds.values()) this.unfold(fold);
      this.folds.clear();
    }
    if (this.running) this.refresh(); else this.updateButton();
  }
  get status() { return { enabled: this.enabled, available: this.available && this.loaded, reason: this.reason }; }
  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;
    this.bridge.start();
    this.observer = new this.win.MutationObserver(() => this.schedule());
    this.observer.observe(this.win.document.body, { childList: true, subtree: true, characterData: true });
    this.timer = this.win.setInterval(() => this.refresh(), 500);
    const doc = this.win.document;
    doc.addEventListener('keydown', this.keydown, true);
    doc.addEventListener('click', this.click, true);
    doc.addEventListener('input', this.input, true);
    doc.addEventListener('compositionstart', this.compositionStart, true);
    doc.addEventListener('compositionend', this.compositionEnd, true);
    this.refresh();
    try { this.records = readProvenance(await this.storage.load()); this.loaded = true; }
    catch { this.reason = '本地来源记录不可用；智能布局未启用'; }
    if (this.running) this.refresh();
  }
  stop(): void {
    this.running = false;
    this.bridge.stop(); this.observer?.disconnect();
    if (this.timer !== undefined) this.win.clearInterval(this.timer);
    const doc = this.win.document;
    doc.removeEventListener('keydown', this.keydown, true); doc.removeEventListener('click', this.click, true);
    doc.removeEventListener('input', this.input, true);
    doc.removeEventListener('compositionstart', this.compositionStart, true); doc.removeEventListener('compositionend', this.compositionEnd, true);
    this.button?.remove(); this.button = null; this.composer = null;
    for (const fold of this.folds.values()) this.unfold(fold);
    this.folds.clear(); this.enabled = false; this.pending = false; this.intent = null;
  }
  private schedule(): void {
    if (this.scheduled || !this.running) return;
    this.scheduled = true;
    this.win.queueMicrotask(() => { this.scheduled = false; if (this.running) this.refresh(); });
  }
  private receive(status: BridgeStatus): void {
    if (status.kind === 'ready') {
      this.available = status.available && !this.unsupported;
      if (!status.available && !this.unsupported) this.reason = status.reason ?? '发送桥接不可用';
    } else if (status.attemptId === this.intent?.attemptId) {
      if (status.kind === 'sending') this.pending = true;
      if (status.kind === 'accepted') { this.pending = false; this.intent = null; this.reason = ''; }
      if (status.kind === 'failed') { this.pending = false; this.reason = status.reason ?? '发送失败，可重试'; }
      if (status.kind === 'unsupported') { this.pending = false; this.available = false; this.unsupported = true; this.reason = status.reason ?? '发送格式未验证'; }
    }
    this.updateButton();
  }
  private reset(): void {
    this.pending = false; this.intent = null; this.bridge.clear(); if (this.available) this.reason = '';
  }
  refresh(): void {
    if (!this.running) return;
    const nextRoute = this.win.location.href;
    if (nextRoute !== this.route) {
      if (!this.intent || !isNewSessionNavigation(this.intent.route, nextRoute)) this.reset();
      this.route = nextRoute;
    }
    const composer = deepSeekComposer.find(this.win.document);
    if (composer?.editor !== this.composer?.editor || !this.button?.isConnected) {
      this.button?.remove(); this.button = null;
      if (this.composer && !this.pending && !this.intent) this.reset();
      this.composer = composer;
      if (composer) {
        const button = deepSeekComposer.createLayoutToggle(this.win.document, composer.search);
        button.addEventListener('click', () => {
          if (button.disabled) return;
          this.switching = true; this.updateButton();
          void this.changeMode(!this.enabled).catch(() => {
            this.reason = '智能 UI 设置保存失败，已恢复原设置';
          }).finally(() => { this.switching = false; this.updateButton(); });
        });
        composer.search.after(button); this.button = button;
      }
    } else this.composer = composer;
    for (const target of deepSeekComposer.targets(this.win.document,composer)) this.restoreEditor(target.editor);
    this.updateButton(); this.foldHistory();
  }
  private updateButton(): void {
    const button = this.button;
    if (!button) return;
    button.disabled = this.switching || !this.loaded || (!this.available && !this.enabled);
    const pressed = String(this.enabled);
    if (button.getAttribute('aria-pressed') !== pressed) button.setAttribute('aria-pressed', pressed);
    if (this.composer) deepSeekComposer.styleLayoutToggle(button, this.composer.search, this.enabled);
    button.title = this.switching ? '正在保存全局智能 UI 设置' : !this.available || !this.loaded ? this.reason || '发送桥接或本地来源记录不可用，请刷新页面' : this.pending ? '发送中；全局智能 UI 开关保持开启，可随时关闭后续注入和渲染' :
      `${this.reason ? this.reason + '。' : ''}${this.enabled ? '智能 UI 已开启：DeepSeek 发送附加 IUI 规则，回复渲染为界面；发送后保持开启' : '智能 UI 已关闭：不附加规则、不渲染，显示原文'}。与扩展弹窗共用全局开关；作用于所有匹配页面的渲染。规则 ${this.envelope.rules.length} 字符；服务器收到的历史规则无法撤回`;
  }
  private restoreEditor(editor: HTMLTextAreaElement): string | undefined {
    if (!this.loaded || this.restoring) return;
    const recognized = this.envelope.recognize(editor.value, this.records);
    if (!recognized) return;
    const alias = editor.value;
    this.aliases.set(editor, {original: recognized.original, wrapped: alias});
    this.restoring = true;
    const setter = Object.getOwnPropertyDescriptor(this.win.HTMLTextAreaElement.prototype, 'value')?.set;
    setter?.call(editor, recognized.original);
    editor.dispatchEvent(new this.win.Event('input', { bubbles: true }));
    this.restoring = false;
    return alias;
  }
  private readonly compositionStart = () => { this.composing = true; };
  private readonly compositionEnd = () => { this.composing = false; };
  private readonly input = (event: Event) => {
    const target = deepSeekComposer.targets(this.win.document,this.composer).find(t => t.editor === event.target);
    if (!target || this.restoring) return;
    this.restoreEditor(target.editor);
    if (this.aliases.get(target.editor)?.original !== target.editor.value) this.aliases.delete(target.editor);
    if (!this.pending) { this.intent = null; this.bridge.clear(); }
  };
  private readonly keydown = (event: KeyboardEvent) => {
    if (event.key !== 'Enter' || event.shiftKey || event.ctrlKey || event.metaKey || event.altKey ||
        event.isComposing || event.keyCode === 229 || this.composing || event.defaultPrevented) return;
    const target = deepSeekComposer.targets(this.win.document,this.composer).find(t => t.editor === event.target);
    if (target) this.prepare(target);
  };
  private readonly click = (event: MouseEvent) => {
    const target = event.target;
    if (target instanceof this.win.Node) {
      const composer = deepSeekComposer.targets(this.win.document,this.composer).find(t => t.send.contains(target));
      if (composer) this.prepare(composer);
    }
  };
  private prepare(composer: SendTarget): void {
    if (this.route !== this.win.location.href) this.refresh();
    if (!this.available || !this.loaded || !deepSeekComposer.canSend(composer)) return;
    this.restoreEditor(composer.editor);
    const alias = this.aliases.get(composer.editor)?.wrapped;
    const original = deepSeekComposer.prompt(composer);
    if (!original.trim()) return;
    if (original.length > maximumPromptLength) { this.intent = null; this.bridge.clear(); this.reason = '草稿超过智能布局处理上限，本条未附加规则'; this.updateButton(); return; }
    if (!this.enabled && !alias) { this.intent = null; this.bridge.clear(); return; }
    const previous = this.intent;
    const prepared = previous?.enabled === this.enabled && previous.operation === composer.operation && previous.prepared.original === original && previous.route === this.route ?
      previous.prepared : this.envelope.prepare(original, randomLayoutId(this.win.crypto));
    this.intent = { attemptId: prepared.id, route: this.route, enabled: this.enabled, operation: composer.operation, prepared, ...(alias ? { alias } : {}) };
    if (this.enabled) {
      rememberPrepared(this.records, prepared);
      void this.storage.save([...this.records.values()]).catch(() => { /* Without persistence, later visits show full text. */ });
    }
    this.bridge.arm(this.intent);
  }
  private unfold(fold: Fold): void { fold.source.removeAttribute('data-iui-layout-source-hidden'); fold.view.remove(); }
  private foldHistory(): void {
    for (const [source, fold] of this.folds) {
      if (!source.isConnected || deepSeekComposer.text(source) !== fold.text) { this.unfold(fold); this.folds.delete(source); }
    }
    if (!this.loaded || !this.enabled) return;
    for (const source of deepSeekComposer.userBodies(this.win.document)) {
      if (this.folds.has(source)) continue;
      const text = deepSeekComposer.text(source), recognized = this.envelope.recognize(text, this.records);
      if (!recognized) continue;
      const view = this.win.document.createElement('div'); view.dataset.iuiLayoutHistory = '';
      const original = this.win.document.createElement('div'); original.dataset.iuiLayoutOriginal = ''; original.textContent = recognized.original;
      const details = this.win.document.createElement('details');
      const summary = this.win.document.createElement('summary'); summary.textContent = '智能 UI · 附加规则';
      const pre = this.win.document.createElement('pre'); pre.textContent = recognized.suffix;
      details.append(summary, pre); view.append(original, details);
      source.setAttribute('data-iui-layout-source-hidden', ''); source.after(view);
      this.folds.set(source, { source, view, text });
    }
  }
}
