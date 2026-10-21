/** Offline replay of a user-supplied saved DeepSeek page. Never runs its scripts or fetches assets. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const input = process.argv[2];
if (!input) throw new Error('Pass the saved DeepSeek HTML path as the final argument.');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(resolve(root, 'package.json'));
try {
  const canvasId = require.resolve('canvas');
  require.cache[canvasId] = { id: canvasId, filename: canvasId, loaded: true, exports: {} };
} catch { /* jsdom does not need optional canvas for this replay. */ }
const { JSDOM } = require('jsdom');
// jsdom's defaults leave page scripts and external resources disabled.
const source = new JSDOM(readFileSync(input, 'utf8'), { url: 'https://chat.deepseek.com/' });
const answer = source.window.document.querySelector('.ds-message .ds-markdown.ds-assistant-message-main-content');
assert.ok(answer, 'Saved page has no recognized assistant body');

// Replay only the assistant body, not account UI, conversation metadata or page assets.
const replay = new JSDOM('<!doctype html><html><head></head><body><div class="ds-message"><div class="ds-think-content">[redacted]</div><button type="button">Copy</button></div></body></html>', { url: 'https://chat.deepseek.com/local-static-replay' });
const message = replay.window.document.querySelector('.ds-message');
const copy = replay.window.document.querySelector('button');
const body = replay.window.document.importNode(answer, true);
for (const node of body.querySelectorAll('script,style,link,img,iframe,video,audio,form')) node.remove();
for (const node of [body, ...body.querySelectorAll('*')]) {
  for (const attribute of [...node.attributes]) {
    if (/^on/i.test(attribute.name) || ['src', 'href', 'srcset', 'style'].includes(attribute.name)) node.removeAttribute(attribute.name);
  }
}
message.insertBefore(body, copy);
source.window.close();

globalThis.window = replay.window;
globalThis.document = replay.window.document;
const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
Object.defineProperty(globalThis, 'navigator', { value: replay.window.navigator, configurable: true });
const fromBuild = async relative => import(pathToFileURL(resolve(root, 'dist/lib', relative)).href);
const { SiteAdapterRegistry } = await fromBuild('services/adapter-registry.js');
const { DeepSeekAdapter } = await fromBuild('services/adapters/deepseek.js');
const { ReplyCoordinator, parseReply } = await fromBuild('services/reply-coordinator.js');
const { createReactReplyView } = await fromBuild('services/reply-view.js');
const { Runtime } = await fromBuild('protocol/runtime.js');
const adapter = new DeepSeekAdapter();
const extracted = adapter.readMessage(message, new URL(replay.window.location.href));
assert.ok(extracted, 'Adapter did not recognize the saved message structure');
const protocol = parseReply(extracted.text, extracted.identity);
assert.ok(protocol, 'Saved assistant body did not parse as a complete protocol reply');
assert.equal(protocol.declarations.find(item => item.name === 'totalCost')?.expression,
  '(inputTokens*inputPrice+outputTokens*outputPrice)/1000000',
  'Markdown emphasis must not erase multiplication operators');
function costFor(overrides = {}) {
  const runtime = new Runtime(protocol);
  runtime.scope();
  for (const [name, value] of Object.entries(overrides)) runtime.state.set(name, value);
  const scope = runtime.scope();
  return { cost: scope.totalCost, inputTokens: scope.inputTokens, outputTokens: scope.outputTokens };
}
assert.deepEqual(costFor(), { cost: 380, inputTokens: 70_000_000, outputTokens: 30_000_000 });
assert.equal(costFor({ tokens: 200 }).cost, 760);
assert.equal(costFor({ inputPrice: 3 }).cost, 450);
assert.equal(costFor({ outputPrice: 10 }).cost, 440);
assert.equal(costFor({ ratio: 50 }).cost, 500);
assert.equal(costFor({ tokens: 250, ratio: 40, inputPrice: 3, outputPrice: 9 }).cost, 1350);
const registry = new SiteAdapterRegistry(); registry.register(adapter);
// Replay the actual recovered source as growing text, before its outer box closes.
let firstPreviewAt = -1;
for (let index = 1; index <= extracted.text.length; index++) {
  const partial = parseReply(extracted.text.slice(0, index).trim(), 'saved-stream');
  if (partial && firstPreviewAt < 0) firstPreviewAt = index;
}
const finalCloseAt = extracted.text.lastIndexOf('</box>');
assert.ok(firstPreviewAt > 0 && firstPreviewAt < finalCloseAt - 80,
  `First preview ${firstPreviewAt} must precede final box close ${finalCloseAt}`);
const firstSlider = extracted.text.indexOf('<slider');
assert.ok(firstSlider > firstPreviewAt, 'Saved reply must contain a slider after the first UI fragment');
const sliderEnd = extracted.text.indexOf('/>', firstSlider) + 2;
assert.ok(sliderEnd > firstSlider && sliderEnd < finalCloseAt);
const savedNodes = [...body.childNodes].map(node => node.cloneNode(true));
const createView = createReactReplyView(readFileSync(resolve(root, 'ui/styles.css'), 'utf8'));
const streamCoordinator = new ReplyCoordinator(replay.window.document, registry, createView, 0);
try {
  body.textContent = '';
  streamCoordinator.start();
  body.textContent = extracted.text.slice(0, firstPreviewAt);
  streamCoordinator.scan();
  await new Promise(resolve => setTimeout(resolve, 40));
  let streamShadow = replay.window.document.querySelector('[data-iui-preview]')?.shadowRoot;
  assert.ok(streamShadow?.querySelector('.iui-root'), JSON.stringify({
    error: 'No UI before the outer box closed', firstPreviewAt, status: streamCoordinator.status,
    recoveredLength: adapter.readMessage(message, new URL(replay.window.location.href))?.text.length,
    directPreview: !!parseReply(adapter.readMessage(message, new URL(replay.window.location.href))?.text ?? '', 'saved-stream'),
  }));
  assert.equal(streamCoordinator.status.rendered, 1);
  body.textContent = extracted.text.slice(0, firstSlider + 8); // Partial slider opening tag.
  streamCoordinator.scan();
  assert.equal(streamCoordinator.status.rendered, 1);
  assert.equal(replay.window.document.querySelector('[data-iui-preview]')?.shadowRoot, streamShadow);
  body.textContent = extracted.text.slice(0, sliderEnd); // Complete control, still open box.
  streamCoordinator.scan();
  await new Promise(resolve => setTimeout(resolve, 40));
  streamShadow = replay.window.document.querySelector('[data-iui-preview]')?.shadowRoot;
  const earlySlider = streamShadow?.querySelector('input[type=range]');
  assert.ok(earlySlider, 'The first complete slider did not render before final close');
  const setValue = Object.getOwnPropertyDescriptor(replay.window.HTMLInputElement.prototype, 'value').set;
  setValue.call(earlySlider, '200');
  earlySlider.dispatchEvent(new replay.window.Event('input', { bubbles: true }));
  earlySlider.dispatchEvent(new replay.window.Event('change', { bubbles: true }));
  await new Promise(resolve => setTimeout(resolve, 40));
  body.textContent = extracted.text.slice(0, finalCloseAt); // Everything except </box>.
  streamCoordinator.scan();
  await new Promise(resolve => setTimeout(resolve, 40));
  assert.match(streamShadow.querySelector('.iui-root').textContent, /\$760(?!\d)/);
  body.replaceChildren(...savedNodes); // DeepSeek Markdown structure replaces streamed text.
  streamCoordinator.scan();
  await new Promise(resolve => setTimeout(resolve, 40));
  assert.equal(replay.window.document.querySelector('[data-iui-preview]')?.shadowRoot, streamShadow);
  assert.match(streamShadow.querySelector('.iui-root').textContent, /\$760(?!\d)/);
} finally { streamCoordinator.stop(); }
const coordinator = new ReplyCoordinator(replay.window.document, registry, createReactReplyView(readFileSync(resolve(root, 'ui/styles.css'), 'utf8')), 0);
try {
  coordinator.start();
  await new Promise(resolve => setTimeout(resolve, 60));
  const shadow = replay.window.document.querySelector('[data-iui-preview]')?.shadowRoot;
  assert.ok(shadow?.querySelector('.iui-root'), 'React preview was not mounted');
  assert.equal(coordinator.status.rendered, 1);
  assert.ok(body.hasAttribute('data-iui-original-hidden'));
  assert.ok(copy.isConnected);
  const ranges = [...shadow.querySelectorAll('input[type=range]')];
  const fields = [...shadow.querySelectorAll('input[type=text],input[type=number]')];
  const visibleText = () => shadow.querySelector('.iui-root').textContent;
  assert.match(visibleText(), /\$380(?!\d)/);
  const setInput = async (element, value) => {
    Object.getOwnPropertyDescriptor(replay.window.HTMLInputElement.prototype, 'value').set.call(element, String(value));
    element.dispatchEvent(new replay.window.Event('input', { bubbles: true }));
    element.dispatchEvent(new replay.window.Event('change', { bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, 40));
  };
  assert.equal(ranges.length, 2);
  assert.equal(fields.length, 2);
  await setInput(ranges[0], 200);
  assert.match(visibleText(), /\$760(?!\d)/);
  await setInput(ranges[1], 50);
  assert.match(visibleText(), /\$1,000(?!\d)/);
  await setInput(fields[0], 3);
  assert.match(visibleText(), /\$1,100(?!\d)/);
  await setInput(fields[1], 10);
  assert.match(visibleText(), /\$1,300(?!\d)/);
  const selectedValue = shadow.querySelectorAll('input[type=range]')[0].value;
  body.append(replay.window.document.createTextNode('\n<caption>Replay update</caption>'));
  coordinator.scan();
  await new Promise(resolve => setTimeout(resolve, 40));
  // A newly appended UI region can have its own shadow host after mixed-prose support.
  const updatedText = [...replay.window.document.querySelectorAll('[data-iui-preview]')]
    .map(host => host.shadowRoot?.querySelector('.iui-root')?.textContent ?? '').join('\n');
  assert.match(updatedText, /Replay update/);
  assert.equal(shadow.querySelectorAll('input[type=range]')[0].value, selectedValue);
  coordinator.setEnabled(false);
  assert.equal(body.hasAttribute('data-iui-original-hidden'), false);
  assert.equal(replay.window.document.querySelector('[data-iui-preview]'), null);
  assert.ok(body.isConnected);
  console.log(JSON.stringify({ result: 'pass', sourceBytes: Buffer.byteLength(extracted.text), declarations: protocol.declarations.length, rootComponents: protocol.children.filter(node => node.kind === 'element').length, ranges: ranges.length, fields: fields.length, firstPreviewAt, finalCloseAt, earlySliderAt: sliderEnd, streamedStatePreserved: true, initialCost: 380, changedCosts: [760, 1000, 1100, 1300], incrementalStatePreserved: true, originalRestored: true }));
} finally {
  coordinator.stop();
  replay.window.close();
  delete globalThis.window;
  delete globalThis.document;
  if (previousNavigator) Object.defineProperty(globalThis, 'navigator', previousNavigator);
  else delete globalThis.navigator;
}
