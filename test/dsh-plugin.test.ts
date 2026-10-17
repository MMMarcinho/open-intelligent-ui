import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import React from 'react';
import { JSDOM } from 'jsdom';
import { splitReply } from '../packages/dsh-plugin/src/segments.js';

const require = createRequire(import.meta.url);
const source = '{@body const [n,setN]=DIL.useState(0)}\n<box><text>{n}</text><button onClick={()=>setN(v=>v+1)}>Add</button></box>';

test('host bundle registers IUI guidance in dsh system prompt', async () => {
  const bundleUrl = new URL('../packages/dsh-plugin/lib/index.js', import.meta.url).href;
  const host = await import(bundleUrl);
  let section: { name: string; order: number; text: string; interpolate: boolean } | undefined;
  host.apply({ systemPrompt: {
    getSectionOrder(name: string) { assert.equal(name, 'WEB_SURFACE'); return 100; },
    section(value: typeof section) { section = value; },
  } } as never);
  assert.equal(section?.name, 'open-intelligent-ui:v0.1');
  assert.equal(section.order, 101);
  assert.equal(section.interpolate, false);
  assert.match(section.text, /DIL\.useState/);
});

test('dsh text projection preserves Markdown order and previews a streaming IUI root', () => {
  const mixed = splitReply(`Before\n${source}\nAfter`, 'dsh-test');
  assert.ok(mixed);
  assert.equal(mixed.document.children.length, 1);
  assert.deepEqual(mixed.segments.map(part => part.kind), ['markdown', 'ui', 'markdown']);
  assert.match((mixed.segments[0] as { text: string }).text, /Before/);
  assert.match((mixed.segments[2] as { text: string }).text, /After/);
  assert.ok(splitReply(source.slice(0, source.indexOf('</box>')), 'dsh-test'));
  assert.equal(splitReply('`<box>example</box>`', 'dsh-test'), null);
});

test('built browser bundle registers the dsh assistant-step renderer and keeps local state', async () => {
  const dom = new JSDOM('<!doctype html><body></body>', { url: 'http://localhost/' });
  const previous = {
    window: globalThis.window,
    document: globalThis.document,
    MutationObserver: globalThis.MutationObserver,
    navigator: globalThis.navigator,
  };
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    MutationObserver: dom.window.MutationObserver,
    navigator: dom.window.navigator,
  });
  try {
    let entry: { id: string; factory: (require: (name: string) => unknown) => { apply: (ctx: unknown) => void } } | undefined;
    runInNewContext(readFileSync(new URL('../packages/dsh-plugin/lib/client.js', import.meta.url), 'utf8'), {
      window: { __ModuleLoader__: { load: (value: typeof entry) => { entry = value; } } },
      document: dom.window.document,
      MutationObserver: dom.window.MutationObserver,
      TextEncoder, TextDecoder, URL,
    });
    assert.equal(entry?.id, 'open-intelligent-ui-dsh-plugin');
    const plugin = entry!.factory((name: string) => name === '@deepseek-ai/dsh-client-ui-primitives'
      ? { MarkdownText: ({ text }: { text: string }) => React.createElement('span', null, text) }
      : require(name));
    let renderer: React.ComponentType<Record<string, unknown>> | undefined;
    plugin.apply({ slots: {
      inject(key: string, callback: () => void) { assert.equal(key, 'conversation.chat.node'); callback(); return () => {}; },
      register(options: { name: string; key: string }, component: typeof renderer) {
        assert.deepEqual({ name: options.name, key: options.key }, { name: 'conversation.chat.node', key: 'assistant-step' });
        renderer = component;
        return () => {};
      },
    } });
    assert.ok(renderer);
    const { createRoot } = await import('react-dom/client');
    const { act } = React;
    const mount = dom.window.document.createElement('div');
    dom.window.document.body.append(mount);
    const root = createRoot(mount);
    const node = { key: 'reply-1', data: { blocks: [{ kind: 'text', text: source }], status: 'running' } };
    await act(async () => root.render(React.createElement(React.StrictMode, null,
      React.createElement(renderer!, { node, renderMessageImages: () => null }))));
    const shadow = mount.querySelector('[data-iui-dsh-root]')?.shadowRoot;
    assert.ok(shadow);
    assert.equal(shadow.querySelector('button')?.textContent, 'Add');
    assert.match(shadow.textContent ?? '', /0/);
    await act(async () => shadow.querySelector('button')!.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })));
    assert.match(shadow.textContent ?? '', /1/);
    await act(async () => root.render(React.createElement(React.StrictMode, null, React.createElement(renderer!, {
      node: { ...node, data: { ...node.data, blocks: [{ kind: 'text', text: `${source}\nDone` }] } },
      renderMessageImages: () => null,
    }))));
    assert.match(shadow.textContent ?? '', /1/);
    await act(async () => root.unmount());
  } finally {
    Object.assign(globalThis, previous);
    dom.window.close();
  }
});
