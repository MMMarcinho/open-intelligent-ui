/** Read-only replay of a supplied DeepSeek snapshot; scripts and assets are never loaded. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const input = process.argv[2];
if (!input) throw new Error('Pass the saved DeepSeek HTML path.');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(resolve(root, 'package.json'));
try {
  const canvasId = require.resolve('canvas');
  require.cache[canvasId] = { id: canvasId, filename: canvasId, loaded: true, exports: {} };
} catch { /* Optional canvas is unnecessary. */ }
const { JSDOM } = require('jsdom');
const source = new JSDOM(readFileSync(input, 'utf8'), { url: 'https://chat.deepseek.com/' });
const answer = source.window.document.querySelector('.ds-message .ds-markdown.ds-assistant-message-main-content');
assert.ok(answer, 'No assistant body in the supplied snapshot');
const replay = new JSDOM('<!doctype html><html><head></head><body><div class="ds-message"><div class="ds-think-content">[redacted]</div><button>Copy</button></div></body></html>',
  { url: 'https://chat.deepseek.com/local-mixed-replay' });
const body = replay.window.document.importNode(answer, true);
for (const node of body.querySelectorAll('script,style,link,img,iframe,video,audio,form,object,embed')) node.remove();
for (const node of [body, ...body.querySelectorAll('*')]) for (const attribute of [...node.attributes]) {
  if (/^on/i.test(attribute.name) || ['src', 'href', 'srcset', 'style'].includes(attribute.name)) node.removeAttribute(attribute.name);
}
const message = replay.window.document.querySelector('.ds-message');
message.insertBefore(body, message.querySelector('button'));
source.window.close();

globalThis.window = replay.window;
globalThis.document = replay.window.document;
const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
Object.defineProperty(globalThis, 'navigator', { value: replay.window.navigator, configurable: true });
const built = async relative => import(pathToFileURL(resolve(root, 'dist/lib', relative)).href);
const { SiteAdapterRegistry } = await built('services/adapter-registry.js');
const { DeepSeekAdapter } = await built('services/adapters/deepseek.js');
const { ReplyCoordinator, parseReply, parseReplyParts } = await built('services/reply-coordinator.js');
const { createReactReplyView } = await built('services/reply-view.js');
const adapter = new DeepSeekAdapter();
const extracted = adapter.readMessage(message, new URL(replay.window.location.href));
assert.ok(extracted);
assert.equal(parseReply(extracted.text, extracted.identity), null, 'The old whole-reply detector must reproduce the reported failure');
const parts = parseReplyParts(extracted.text, extracted.identity);
assert.ok(parts, 'Mixed reply was not recognized');
assert.ok(parts.regions.some(region => region.kind === 'ui' && region.start > 0));
assert.ok(extracted.text.slice(0, parts.regions.find(region => region.kind === 'ui').start).trim());
const registry = new SiteAdapterRegistry(); registry.register(adapter);
const coordinator = new ReplyCoordinator(replay.window.document, registry,
  createReactReplyView(readFileSync(resolve(root, 'ui/styles.css'), 'utf8')), 0);
try {
  coordinator.start();
  await new Promise(resolve => setTimeout(resolve, 80));
  const projection = replay.window.document.querySelector('[data-iui-projection]');
  const shadow = projection?.querySelector('[data-iui-preview]')?.shadowRoot;
  assert.ok(shadow?.querySelector('.iui-root'), 'The real reply did not render into the UI shadow root');
  assert.ok(projection.textContent.trim().length > 0, 'The explanation vanished');
  assert.equal(coordinator.status.rendered, 1);
  assert.ok(body.hasAttribute('data-iui-original-hidden'));
  coordinator.setEnabled(false);
  assert.equal(body.hasAttribute('data-iui-original-hidden'), false);
  assert.equal(projection.isConnected, false);
  // A synthetic second section exercises the same production React view and
  // shared reply state without adding user content to a committed fixture.
  body.textContent = 'Intro\n{@body const [n,setN]=DIL.useState(1)}\n<box><button onClick={()=>setN(n+1)}>Add</button></box>\nBetween\n<box><text>{n}</text></box>\nAfter';
  coordinator.setEnabled(true);
  await new Promise(resolve => setTimeout(resolve, 60));
  const hosts = [...replay.window.document.querySelectorAll('[data-iui-preview]')];
  assert.equal(hosts.length, 2);
  assert.match(hosts[1].shadowRoot.querySelector('.iui-root').textContent, /1/);
  hosts[0].shadowRoot.querySelector('button').dispatchEvent(new replay.window.MouseEvent('click', { bubbles: true, composed: true }));
  await new Promise(resolve => setTimeout(resolve, 60));
  assert.match(hosts[1].shadowRoot.querySelector('.iui-root').textContent, /2/);
  coordinator.setEnabled(false);
  console.log(JSON.stringify({ result: 'pass', sourceCharacters: extracted.text.length,
    sharedDeclarations: parts.document.declarations.length, uiRegions: parts.document.children.length,
    formattedProseVisible: true, originalRestored: true, crossRegionState: true }));
} finally {
  coordinator.stop(); replay.window.close();
  delete globalThis.window; delete globalThis.document;
  if (previousNavigator) Object.defineProperty(globalThis, 'navigator', previousNavigator);
  else delete globalThis.navigator;
}
