import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { SiteAdapterRegistry } from '../services/adapter-registry.js';
import { DeepSeekAdapter, readDeepSeekReply } from '../services/adapters/deepseek.js';
import { ReplyCoordinator, parseReply, parseReplyParts, type CreateReplyView } from '../services/reply-coordinator.js';
import { Runtime } from '../protocol/index.js';
import { normalizeSettings, selectPageAdapter, urlMatchesPattern, validateUrlRule } from '../services/extension-rules.js';

// This Mac's shared jsdom resolves an optional canvas package with a missing native
// binary. jsdom uses canvas only if createCanvas exists; the tests require no canvas.
const require = createRequire(import.meta.url);
try {
  const canvasId = require.resolve('canvas');
  require.cache[canvasId] = { id: canvasId, filename: canvasId, loaded: true, exports: {} } as any;
} catch { /* A clean install without optional canvas needs no stub. */ }
const { JSDOM } = require('jsdom') as typeof import('jsdom');
const fixture = readFileSync(new URL('./fixtures/deepseek.reply.sanitized.html', import.meta.url), 'utf8');
const url = 'https://chat.deepseek.com/a/chat/sanitized';

function setup(html = fixture) {
  // Scripts are disabled and external resources are never enabled.
  const dom = new JSDOM(html, { url });
  const adapter = new DeepSeekAdapter();
  const registry = new SiteAdapterRegistry();
  registry.register(adapter);
  const sessions: { runtime: Runtime; updates: number; disposed: boolean }[] = [];
  const createView: CreateReplyView = (_host, document) => {
    const session = { runtime: new Runtime(document), updates: 0, disposed: false };
    session.runtime.scope();
    sessions.push(session);
    return { update(next) { session.runtime.update(next); session.updates++; }, dispose() { session.disposed = true; } };
  };
  const coordinator = new ReplyCoordinator(dom.window.document, registry, createView, 0);
  return { dom, adapter, coordinator, sessions, close() { coordinator.stop(); dom.window.close(); } };
}
const tick = () => new Promise(resolve => setTimeout(resolve, 10));

test('DeepSeek adapter selects assistant body, restores entities, breaks, and split nodes', () => {
  const { dom, adapter, close } = setup();
  try {
    assert.equal([...adapter.findMessages(dom.window.document)].length, 2);
    const assistant = [...adapter.findMessages(dom.window.document)].map(node => adapter.readMessage(node, new URL(url))).filter(Boolean);
    assert.equal(assistant.length, 1);
    const message = assistant[0]!;
    assert.match(message.text, /\{@body const \[count,setCount\]/);
    assert.match(message.text, /\n<box>/);
    assert.match(message.text, /Count & total/);
    assert.doesNotMatch(message.text, /Thinking example|User example|Copy reply/);
    assert.equal(message.stream, 'unknown');
    assert.ok(parseReply(message.text, message.identity));
    assert.equal(adapter.readMessage(dom.window.document.querySelector('.ds-message')!, new URL(url)), null);
  } finally { close(); }
});

test('plain text, a fenced code example, and incomplete DSL remain original', () => {
  assert.equal(parseReply('A normal answer', 'plain'), null);
  assert.equal(parseReply('Explanation: <title>this is a tag</title>', 'inline-example'), null);
  assert.equal(parseReply('```html\n<title>Example</title>\n```', 'fenced'), null);
  assert.equal(parseReply('<box><title>', 'empty-open-component'), null);
  assert.equal(parseReply('<box>\n  ', 'whitespace-only-open-component'), null);
  assert.ok(parseReply('<box><title>partial', 'partial'));
  const { dom, coordinator, close } = setup('<div class="ds-message"><div class="ds-markdown ds-assistant-message-main-content"><pre><code>&lt;title&gt;Example&lt;/title&gt;</code></pre></div></div>');
  try {
    const body = dom.window.document.querySelector('.ds-assistant-message-main-content')!;
    assert.equal(parseReply(readDeepSeekReply(body), 'code'), null);
    coordinator.start();
    assert.equal(coordinator.status.rendered, 0);
    assert.equal(body.hasAttribute('data-iui-original-hidden'), false);
  } finally { close(); }
});

test('mixed Markdown keeps its formatted prose in order and mounts only explicit UI regions', () => {
  const html = `<div class="ds-message"><div class="ds-markdown ds-assistant-message-main-content">
    <p><strong>Before</strong> &amp; <a href="https://example.org/info">source</a><img src="https://example.org/pixel" onerror="alert(1)"><a href="javascript:alert(1)" onclick="alert(1)">unsafe link</a></p>
    <p>{@body const [n,setN]=DIL.useState(1)}</p>
    <p>&lt;box&gt;&lt;title&gt;{n}&lt;/title&gt;&lt;/box&gt;</p>
    <p>Between <em>formatted</em> paragraphs.</p>
    <p>&lt;box&gt;&lt;button onClick={()=&gt;setN(n+1)}&gt;Next&lt;/button&gt;&lt;/box&gt;</p>
    <p>After <code>&lt;box&gt;code example&lt;/box&gt;</code> remains text.</p>
    <pre><code>&lt;box&gt;&lt;title&gt;fenced example&lt;/title&gt;&lt;/box&gt;</code></pre>
  </div><button>Copy</button></div>`;
  const { dom, adapter, coordinator, sessions, close } = setup(html);
  try {
    const body = dom.window.document.querySelector('.ds-assistant-message-main-content')!;
    const message = adapter.readMessage(dom.window.document.querySelector('.ds-message')!, new URL(url))!;
    const parts = parseReplyParts(message.text, message.identity);
    assert.ok(parts);
    assert.equal(parts.document.children.length, 2);
    assert.equal(parts.document.declarations.length, 1);
    coordinator.start();
    assert.equal(coordinator.status.rendered, 1);
    assert.equal(sessions.length, 1, 'Both UI islands share one runtime');
    const projection = dom.window.document.querySelector('[data-iui-projection]')!;
    const hosts = projection.querySelectorAll('[data-iui-preview]');
    assert.equal(hosts.length, 2);
    assert.match(projection.innerHTML, /<strong>Before<\/strong>/);
    assert.match(projection.innerHTML, /<em>formatted<\/em>/);
    assert.equal(projection.querySelector('img'), null);
    assert.equal(projection.querySelector('[onclick]'), null);
    assert.equal(projection.querySelector('a[href^="javascript:"]'), null);
    assert.match(projection.innerHTML, /<code>&lt;box&gt;code example&lt;\/box&gt;<\/code>/);
    assert.ok(projection.textContent!.indexOf('Before') < projection.textContent!.indexOf('Between'));
    assert.ok(projection.textContent!.indexOf('Between') < projection.textContent!.indexOf('After'));
    assert.ok(hosts[0].compareDocumentPosition(projection.querySelector('em')!) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING);
    assert.ok(projection.querySelector('em')!.compareDocumentPosition(hosts[1]) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING);
    assert.ok(body.hasAttribute('data-iui-original-hidden'));
    assert.ok(dom.window.document.querySelector('button')!.isConnected);
    coordinator.setEnabled(false);
    assert.equal(body.hasAttribute('data-iui-original-hidden'), false);
    assert.equal(projection.isConnected, false);
  } finally { close(); }
});

test('mixed protocol detection leaves prose examples inert, including code fences and inline code', () => {
  for (const source of [
    'Example: <box><title>demo</title></box>',
    'Use `<box><title>demo</title></box>` in a prompt.',
    '```xml\n<box><title>demo</title></box>\n```',
    'Explanation: <title>not a standalone UI</title>',
  ]) assert.equal(parseReplyParts(source, 'example'), null, source);
  const source = 'Intro\n{@body const [n,setN]=DIL.useState(2)}\n<box><text>{n}</text></box>\nOutro';
  assert.equal(parseReply(source, 'strict'), null);
  assert.equal(parseReplyParts(source, 'mixed')?.document.children.length, 1);
  assert.equal(parseReplyParts('Intro\n<box><title>Ready</title></box>\nOutro', 'no-state')?.document.children.length, 1);
});

test('mixed stream commits a safe UI prefix and reuses its runtime through later prose and UI', () => {
  const { dom, coordinator, sessions, close } = setup('<div class="ds-message"><div class="ds-markdown ds-assistant-message-main-content"></div></div>');
  const body = dom.window.document.querySelector('.ds-assistant-message-main-content')!;
  const source = 'Intro\n{@body const [n,setN]=DIL.useState(1)}\n<box><title>Ready</title><text>{n}</text></box>\nBetween\n<box><button onClick={()=>setN(n+1)}>Go</button></box>\nAfter';
  try {
    coordinator.start();
    const ready = source.indexOf('</title>') + '</title>'.length;
    for (let index = 1; index <= source.length; index++) {
      body.textContent = source.slice(0, index);
      coordinator.scan();
      if (index === ready) {
        assert.equal(coordinator.status.rendered, 1);
        sessions[0].runtime.state.set('n', 7);
      }
    }
    assert.equal(sessions.length, 1);
    assert.equal(sessions[0].runtime.state.get('n'), 7);
    assert.equal(sessions[0].runtime.document.children.length, 2);
    assert.equal(dom.window.document.querySelectorAll('[data-iui-preview]').length, 2);
    assert.match(dom.window.document.querySelector('[data-iui-projection]')!.textContent!, /Intro[\s\S]*Between[\s\S]*After/);
  } finally { close(); }
});


test('mounts once, preserves runtime on incremental update, and restores original on toggle', () => {
  const { dom, coordinator, sessions, close } = setup();
  try {
    coordinator.start();
    const body = dom.window.document.querySelector('.ds-assistant-message-main-content')!;
    const think = dom.window.document.querySelector('.ds-think-content')!;
    const copy = dom.window.document.querySelector('button')!;
    assert.equal(coordinator.status.rendered, 1);
    assert.equal(sessions.length, 1);
    assert.equal(body.hasAttribute('data-iui-original-hidden'), true);
    assert.equal(think.isConnected, true);
    assert.equal(copy.isConnected, true);
    sessions[0].runtime.state.set('count', 7);
    coordinator.scan();
    assert.equal(sessions.length, 1);
    assert.equal(sessions[0].updates, 0);
    body.append(dom.window.document.createTextNode('\n<caption>Added</caption>'));
    coordinator.scan();
    assert.equal(sessions.length, 1);
    assert.equal(sessions[0].updates, 1);
    assert.equal(sessions[0].runtime.state.get('count'), 7);
    coordinator.setEnabled(false);
    assert.equal(body.hasAttribute('data-iui-original-hidden'), false);
    assert.equal(dom.window.document.querySelector('[data-iui-preview]'), null);
    assert.equal(sessions[0].disposed, true);
  } finally { close(); }
});

test('open containers display committed text, and a different reply starts a new generation', () => {
  const { dom, coordinator, sessions, close } = setup();
  try {
    coordinator.start();
    const body = dom.window.document.querySelector('.ds-assistant-message-main-content')!;
    body.textContent = '<box><title>partial';
    coordinator.scan();
    assert.equal(coordinator.status.rendered, 1);
    assert.equal(body.hasAttribute('data-iui-original-hidden'), true);
    assert.equal(sessions.length, 2);
    assert.equal(sessions[0].disposed, true);
    assert.equal(sessions[1].runtime.document.children[0]?.kind, 'element');
    body.textContent = '<box><title>partial</title></box>';
    coordinator.scan();
    assert.equal(coordinator.status.rendered, 1);
    assert.equal(sessions.length, 2); // Finishing the open reply reuses its runtime.
  } finally { close(); }
});

test('an incomplete prefix extension keeps its runtime and prior UI', () => {
  const { dom, coordinator, sessions, close } = setup();
  try {
    coordinator.start();
    const body = dom.window.document.querySelector('.ds-assistant-message-main-content')!;
    sessions[0].runtime.state.set('count', 9);
    body.append(dom.window.document.createTextNode('\n<caption>Later'));
    coordinator.scan();
    assert.equal(coordinator.status.rendered, 1);
    assert.equal(sessions.length, 1);
    body.append(dom.window.document.createTextNode('</caption>'));
    coordinator.scan();
    assert.equal(coordinator.status.rendered, 1);
    assert.equal(sessions.length, 1);
    assert.equal(sessions[0].runtime.state.get('count'), 9);
  } finally { close(); }
});

test('stream projection commits open containers but holds half tags, attributes, expressions, and declarations', () => {
  const base = '{@body const [n,setN]=DIL.useState(2)}<box><title>Ready</title>';
  const first = parseReply(base, 'stream-safe');
  assert.ok(first);
  assert.equal(first.complete, false);
  assert.equal(first.children[0]?.kind, 'element');
  assert.equal(first.children[0]?.kind === 'element' ? first.children[0].children[0]?.kind : '', 'element');
  const cases = [
    `${base}<slider value={n`,
    `${base}<text>{n +`,
    `${base}{@body const later = n +`,
    `${base}</`,
  ];
  for (const source of cases) {
    const partial = parseReply(source, 'stream-safe');
    assert.ok(partial, source);
    assert.equal(partial.children[0]?.kind, 'element');
    assert.equal(partial.children[0]?.kind === 'element' ? partial.children[0].children.length : 0, 1);
  }
  assert.equal(parseReply('<box><text>{later}</text>', 'missing-declaration'), null);
  assert.ok(parseReply('<box><text>{later}</text>{@body const later = 7}', 'resolved-declaration'));
  assert.equal(parseReply('<box><button onClick={later}>Run</button>', 'missing-event-dependency'), null);
  assert.ok(parseReply('<box><button onClick={later}>Run</button>{@body const later = 7}', 'ready-event-dependency'));
  assert.equal(parseReply('```xml\n<box><title>Example</title></box>\n```', 'code-example'), null);
  assert.equal(parseReply('Normal Markdown: <box><title>Example</title>', 'mixed-prose'), null);
});

test('DeepSeek body replacement and Markdown emphasis reflow reuse the running preview', () => {
  const { dom, coordinator, sessions, close } = setup();
  try {
    coordinator.start();
    const message = dom.window.document.querySelectorAll('.ds-message')[1];
    const oldBody = message.querySelector('.ds-assistant-message-main-content')!;
    sessions[0].runtime.state.set('count', 17);
    const replacement = oldBody.cloneNode(true) as Element;
    oldBody.replaceWith(replacement);
    coordinator.scan();
    assert.equal(coordinator.status.rendered, 1);
    assert.equal(sessions.length, 1);
    assert.equal(sessions[0].runtime.state.get('count'), 17);
    assert.equal(oldBody.hasAttribute('data-iui-original-hidden'), false);
    assert.equal(replacement.hasAttribute('data-iui-original-hidden'), true);
    const originalText = replacement.textContent!;
    replacement.textContent = originalText.slice(0, 12); // Transient Markdown rerender.
    coordinator.scan();
    assert.equal(coordinator.status.rendered, 1);
    replacement.textContent = originalText;
    coordinator.scan();
    assert.equal(coordinator.status.rendered, 1);
    assert.equal(sessions.length, 1);
    assert.equal(sessions[0].runtime.state.get('count'), 17);
  } finally { close(); }
});

test('observer handles insertion, removal, and replacement without self-write loops', async () => {
  const { dom, coordinator, sessions, close } = setup('<html><head></head><body></body></html>');
  try {
    coordinator.start();
    const message = dom.window.document.createElement('div');
    message.className = 'ds-message';
    const body = dom.window.document.createElement('div');
    body.className = 'ds-markdown ds-assistant-message-main-content';
    body.textContent = '<title>Sanitized</title>';
    message.append(body);
    dom.window.document.body.append(message);
    await tick();
    assert.equal(coordinator.status.rendered, 1);
    assert.equal(sessions.length, 1);
    await tick();
    assert.equal(sessions.length, 1);
    message.remove();
    await tick();
    assert.equal(coordinator.status.rendered, 0);
    assert.equal(sessions[0].disposed, true);
    assert.equal(body.hasAttribute('data-iui-original-hidden'), false);
    const replacement = message.cloneNode(true) as Element;
    dom.window.document.body.append(replacement);
    await tick();
    assert.equal(coordinator.status.rendered, 1);
    assert.equal(sessions.length, 2);
  } finally { close(); }
});

test('continuous sub-60ms DOM writes render before the writer stops', async () => {
  const { dom, adapter, close } = setup('<html><head></head><body><div class="ds-message"><div class="ds-markdown ds-assistant-message-main-content"></div></div></body></html>');
  const registry = new SiteAdapterRegistry(); registry.register(adapter);
  const coordinator = new ReplyCoordinator(dom.window.document, registry, () => ({ update() {}, dispose() {} }), 60);
  const body = dom.window.document.querySelector('.ds-assistant-message-main-content')!;
  let writes = 0;
  let interval: ReturnType<typeof setInterval> | null = null;
  try {
    coordinator.start();
    interval = setInterval(() => { body.textContent = `<box><title>Streaming ${++writes}`; }, 8);
    await new Promise(resolve => setTimeout(resolve, 155));
    assert.ok(writes >= 8, `Writer made only ${writes} writes`);
    assert.equal(coordinator.status.rendered, 1, 'Preview must appear while DOM writes continue');
    assert.equal(body.hasAttribute('data-iui-original-hidden'), true);
    const before = writes;
    await new Promise(resolve => setTimeout(resolve, 40));
    assert.ok(writes > before, 'Writer must still be active after first render');
  } finally {
    if (interval) clearInterval(interval);
    coordinator.stop(); close();
  }
});

test('SPA route change and reenable create fresh instances without leaving hidden originals', () => {
  const { dom, coordinator, sessions, close } = setup();
  try {
    coordinator.start();
    const body = dom.window.document.querySelector('.ds-assistant-message-main-content')!;
    dom.window.history.pushState({}, '', '/a/chat/other-sanitized');
    coordinator.scan();
    assert.equal(sessions.length, 2);
    assert.equal(sessions[0].disposed, true);
    assert.equal(coordinator.status.rendered, 1);
    coordinator.setEnabled(false);
    assert.equal(body.hasAttribute('data-iui-original-hidden'), false);
    coordinator.setEnabled(true);
    coordinator.scan();
    assert.equal(sessions.length, 3);
    assert.equal(coordinator.status.rendered, 1);
  } finally { close(); }
});

test('URL rules validate narrow origins and match file and local HTTP routes', () => {
  const file = validateUrlRule('file:///Users/me/Desktop/DeepSeek saved.html', 'deepseek');
  assert.equal(file.ok, true);
  if (!file.ok) return;
  assert.equal(file.hostPattern, 'file:///*');
  assert.equal(file.pattern, 'file:///Users/me/Desktop/DeepSeek%20saved.html');
  assert.equal(urlMatchesPattern(new URL(file.pattern), file.pattern), true);
  assert.equal(urlMatchesPattern(new URL('file:///Users/me/Desktop/other.html'), file.pattern), false);
  const local = validateUrlRule('http://127.0.0.1:8080/chat/*', 'deepseek');
  assert.equal(local.ok, true);
  if (!local.ok) return;
  assert.equal(local.hostPattern, 'http://127.0.0.1/*');
  assert.equal(urlMatchesPattern(new URL('http://127.0.0.1:8080/chat/one'), local.pattern), true);
  assert.equal(urlMatchesPattern(new URL('http://127.0.0.1:8081/chat/one'), local.pattern), false);
  for (const bad of ['javascript:alert(1)', 'https://*.example.com/*', 'https://user:secret@example.com/*', 'file://server/share/page.html']) {
    assert.equal(validateUrlRule(bad, 'deepseek').ok, false, bad);
  }
  assert.equal(validateUrlRule('https://example.com/*', 'missing-adapter').ok, false);
});

test('stored global switch, legacy migration and route changes restore the original', () => {
  const { dom, adapter, close } = setup();
  const registry = new SiteAdapterRegistry(); registry.register(adapter);
  let settings = normalizeSettings(null, false);
  assert.equal(settings.enabled, false);
  settings = normalizeSettings({ enabled: true, defaultDeepSeek: false, rules: [
    { id: 'local', pattern: 'file:///tmp/snapshot.html', adapterId: 'deepseek' },
    { id: 'bad', pattern: 'javascript:alert(1)', adapterId: 'deepseek' },
  ] });
  assert.equal(settings.rules.length, 1);
  const coordinator = new ReplyCoordinator(dom.window.document, registry, () => ({ update() {}, dispose() {} }), 0,
    url => registry.get(selectPageAdapter(url, settings) ?? ''));
  try {
    coordinator.start();
    const body = dom.window.document.querySelector('.ds-assistant-message-main-content')!;
    assert.equal(coordinator.status.rendered, 0); // Built-in host disabled.
    settings.defaultDeepSeek = true;
    coordinator.refresh();
    assert.equal(coordinator.status.rendered, 1);
    coordinator.setEnabled(false);
    assert.equal(body.hasAttribute('data-iui-original-hidden'), false);
    settings.defaultDeepSeek = false;
    coordinator.setEnabled(true);
    assert.equal(coordinator.status.rendered, 0);
    dom.reconfigure({ url: 'file:///tmp/snapshot.html' });
    coordinator.refresh();
    assert.equal(coordinator.status.rendered, 1);
    settings.rules = [];
    coordinator.refresh();
    assert.equal(coordinator.status.rendered, 0);
    assert.equal(body.hasAttribute('data-iui-original-hidden'), false);
  } finally { coordinator.stop(); close(); }
});
