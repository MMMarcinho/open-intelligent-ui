import { randomLayoutId } from './envelope.js';
import { deepSeekRequestContract } from '../adapters/deepseek-send.js';
import { controlEvent, statusEvent, parseBridgeMessage, type BridgeCommand, type BridgeStatus, type SendIntent, type WithoutChannel } from './bridge-protocol.js';

export class LayoutBridgeClient {
  readonly channel: string;
  private timer?: number;
  private seen = false;
  constructor(private readonly window: Window & typeof globalThis, private readonly receive: (status: BridgeStatus) => void, private readonly rulesDigest: string) {
    this.channel = randomLayoutId(window.crypto);
  }
  private send(message: WithoutChannel<BridgeCommand>) {
    this.window.dispatchEvent(new this.window.CustomEvent(controlEvent, { detail: JSON.stringify({ ...message, channel: this.channel }) }));
  }
  private readonly onStatus = (event: Event) => {
    const s = parseBridgeMessage<BridgeStatus>(event);
    if (s?.channel !== this.channel) return;
    if (s.kind === 'ready') {
      this.seen = true;
      if (s.protocol !== 1 || s.rulesDigest !== this.rulesDigest || s.contract !== deepSeekRequestContract) {
        this.receive({ channel: this.channel, kind: 'ready', available: false, reason: '扩展界面与 MAIN 发送桥版本不一致，请重新加载扩展后刷新页面' });
        return;
      }
    }
    this.receive(s);
  };
  start(): void {
    this.window.addEventListener(statusEvent, this.onStatus);
    this.send({ kind: 'hello' });
    this.timer = this.window.setInterval(() => {
      this.send({ kind: 'hello' }); // Rechecks the actual installed bridge and compiled contract.
      this.send({ kind: 'heartbeat' });
      if (!this.seen) this.receive({ channel: this.channel, kind: 'ready', available: false, reason: '发送桥接不可用，请重新加载扩展和页面' });
      this.seen = false;
    }, 1000);
  }
  arm(intent: SendIntent): void { this.send({ kind: 'arm', intent }); }
  clear(): void { this.send({ kind: 'clear' }); }
  stop(): void {
    this.send({ kind: 'stop' });
    if (this.timer !== undefined) this.window.clearInterval(this.timer);
    this.window.removeEventListener(statusEvent, this.onStatus);
  }
}
