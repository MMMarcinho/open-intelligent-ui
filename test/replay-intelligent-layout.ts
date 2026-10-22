/** Offline visual fixture only: this deliberately mocks the bridge, never calls a chat endpoint. */
import rules from '../docs/prompts/recommended.en.txt';
import styles from '../ui/styles.css';
import { IntelligentLayoutController } from '../services/intelligent-layout/controller.js';
import { LayoutEnvelope } from '../services/intelligent-layout/envelope.js';
import { controlEvent, statusEvent, type BridgeCommand, type SendIntent } from '../services/intelligent-layout/bridge-protocol.js';
import { SiteAdapterRegistry } from '../services/adapter-registry.js';
import { DeepSeekAdapter } from '../services/adapters/deepseek.js';
import { ReplyCoordinator } from '../services/reply-coordinator.js';
import { createReactReplyView } from '../services/reply-view.js';

void (async () => {
  let active: SendIntent | null = null, channel = '';
  const status = (kind: string, extra: object = {}) => window.dispatchEvent(new CustomEvent(statusEvent, {detail:JSON.stringify({channel,kind,...extra})}));
  window.addEventListener(controlEvent, event => {
    const message = JSON.parse((event as CustomEvent).detail) as BridgeCommand; channel=message.channel;
    if (message.kind === 'hello') status('ready',{available:true,protocol:1,rulesDigest:new LayoutEnvelope(rules).rulesDigest,contract:'deepseek-prompt-json-v1'});
    if (message.kind === 'arm') active=message.intent;
    if (message.kind === 'clear' || message.kind === 'stop') active=null;
  });
  const controller=new IntelligentLayoutController(window,new LayoutEnvelope(rules),{async load(){return []},async save(){}},async next=>{controller.setEnabled(next);coordinator.setEnabled(next)});
  await controller.start();
  const registry=new SiteAdapterRegistry(); registry.register(new DeepSeekAdapter());
  const coordinator=new ReplyCoordinator(document,registry,createReactReplyView(styles),0,()=>registry.get('deepseek')); coordinator.start();
  const editor=document.querySelector('textarea')!, send=document.querySelector<HTMLElement>('[aria-label="发送"]')!;
  const button=document.querySelector<HTMLButtonElement>('[data-iui-layout-toggle]')!;
  const check=(condition: unknown, message: string) => {
    if (!condition) {document.documentElement.dataset.replayResult='fail';document.querySelector('#result')!.textContent=message;throw new Error(message);}
  };
  check(!button.disabled && button.getAttribute('aria-pressed')==='false','Default must be off');
  editor.value='做一个可交互的差旅预算卡片，展示交通、住宿和餐饮。';
  button.click(); await Promise.resolve(); check(editor.value.indexOf(rules)<0,'Editor must contain only original text');
  send.addEventListener('click',() => {
    check(active?.enabled,'Gesture must arm the mock bridge');
    const intent=active!; status('sending',{attemptId:intent.attemptId});
    const message=document.createElement('div'); message.className='ds-message user';
    const source=document.createElement('div'); source.className='ds-collapsible-text'; source.textContent=intent.prepared.wrapped; message.append(source); document.querySelector('#messages')!.append(message);
    status('accepted',{attemptId:intent.attemptId});
    const assistant=document.createElement('div'); assistant.className='ds-message assistant';
    const answer=document.createElement('div'); answer.className='ds-markdown ds-assistant-message-main-content'; assistant.append(answer); document.querySelector('#messages')!.append(assistant);
    answer.textContent='{@body const [days,setDays]=DIL.useState(3)}\n<card><title>差旅预算（模拟数据）</title><text>按天调整，预算即时更新。</text>';
    coordinator.scan(); check(coordinator.status.rendered===1,'Partial response must render');
    answer.textContent+='\n<row justify="between"><label>出差天数</label><badge>{days + " 天"}</badge></row><slider value={days} min={1} max={14} step={1} onChange={setDays} /><row justify="between"><text>预计合计</text><title>{"¥" + (days * 560 + 800)}</title></row><caption>交通 ¥800 · 住宿 ¥420/天 · 餐饮 ¥140/天</caption></card>';
    coordinator.scan(); controller.refresh();
    check(source.hasAttribute('data-iui-layout-source-hidden'),'Known local suffix must fold');
    check(button.getAttribute('aria-pressed')==='true','Success must keep unified mode enabled');
    check(document.querySelector('details')?.open===false,'Rules must be collapsed initially');
    editor.value='再比较一下不同出差天数的预算。';
    document.documentElement.dataset.replayResult='pass';
    document.querySelector('#result')!.textContent='本地断言通过：原文保留 · 统一开关 · 持续生效 · 规则可展开 · 流式界面';
  });
  send.click();
})().catch(error => {document.documentElement.dataset.replayResult='fail';document.querySelector('#result')!.textContent=String(error);});
