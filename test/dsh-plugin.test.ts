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

test('host prompt includes IUI guidance only while the live mode is enabled', async () => {
  const bundleUrl = new URL('../packages/dsh-plugin/lib/index.js', import.meta.url).href;
  const host = await import(bundleUrl);
  let section: { name: string; order: number; text: () => string; interpolate: boolean } | undefined;
  let enabled = false;
  host.apply({ systemPrompt: {
    getSectionOrder(name: string) { assert.equal(name, 'WEB_SURFACE'); return 100; },
    section(value: typeof section) { section = value; },
  } } as never, { enabled: { get: () => enabled } } as never);
  assert.equal(section?.name, 'open-intelligent-ui:v0.1');
  assert.equal(section.order, 101);
  assert.equal(section.interpolate, false);
  assert.equal(section.text(), '');
  enabled = true;
  assert.match(section.text(), /DIL\.useState/);
  assert.match(section.text(), /AsyncImageGroup/);
  assert.match(section.text(), /no image search/i);
  assert.doesNotMatch(section.text(), /Do not generate AppBlock, AsyncImage/);
  enabled = false;
  assert.equal(section.text(), '');
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

test('browser composer mode controls rendering and persists across assistant updates', async () => {
  const dom = new JSDOM('<!doctype html><body></body>', { url: 'http://localhost/' });
  const previous = {
    window: globalThis.window,
    document: globalThis.document,
    MutationObserver: globalThis.MutationObserver,
    navigator: globalThis.navigator,
    IS_REACT_ACT_ENVIRONMENT: (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT,
  };
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    MutationObserver: dom.window.MutationObserver,
    navigator: dom.window.navigator,
    IS_REACT_ACT_ENVIRONMENT: true,
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
      ? {
          MarkdownText: ({ text }: { text: string }) => React.createElement('span', { 'data-markdown': '' }, text),
          Button: ({ children, variant: _variant, size: _size, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; size?: string }) => React.createElement('button', props, children),
        }
      : require(name));
    let renderer: React.ComponentType<Record<string, unknown>> | undefined;
    let button: React.ComponentType<Record<string, unknown>> | undefined;
    let snapshot = { status: 'ready', value: { enabled: false }, writable: true, mode: 'host' };
    const listeners = new Set<() => void>();
    const form = {
      getSnapshot: () => snapshot,
      subscribe: (listener: () => void) => { listeners.add(listener); return () => listeners.delete(listener); },
      async set(field: string, value: boolean) {
        assert.equal(field, 'enabled');
        snapshot = { ...snapshot, value: { enabled: value } };
        for (const listener of listeners) listener();
        return true;
      },
    };
    plugin.apply({ slots: {
      inject(_key: string, callback: () => void) { callback(); return () => {}; },
      register(options: { name: string; key?: string }, component: typeof renderer) {
        if (options.name === 'conversation.chat.node') {
          assert.equal(options.key, 'assistant-step');
          renderer = component;
        } else if (options.name === 'conversation.input.left') button = component;
        else assert.fail(`unexpected slot ${options.name}`);
        return () => {};
      },
    }, configForms: { get(name: string) { assert.equal(name, 'open-intelligent-ui'); return form; } } });
    assert.ok(renderer && button);
    const { createRoot } = await import('react-dom/client');
    const { act } = React;
    const mount = dom.window.document.createElement('div');
    dom.window.document.body.append(mount);
    const root = createRoot(mount);
    const node = { key: 'reply-1', data: { blocks: [{ kind: 'text', text: source }], status: 'running' } };
    await act(async () => root.render(React.createElement(React.StrictMode, null,
      React.createElement(button!), React.createElement(renderer!, { node, renderMessageImages: () => null }))));
    const toggle = mount.querySelector<HTMLButtonElement>('[data-iui-dsh-toggle]')!;
    assert.equal(toggle.getAttribute('aria-pressed'), 'false');
    assert.equal(mount.querySelector('[data-iui-dsh-root]'), null);
    assert.match(mount.textContent ?? '', /<box>/);
    await act(async () => toggle.click());
    assert.equal(toggle.getAttribute('aria-pressed'), 'true');
    const shadow = mount.querySelector('[data-iui-dsh-root]')?.shadowRoot;
    assert.ok(shadow);
    assert.equal(shadow.querySelector('button')?.textContent, 'Add');
    assert.match(shadow.textContent ?? '', /0/);
    await act(async () => shadow.querySelector('button')!.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })));
    assert.match(shadow.textContent ?? '', /1/);
    await act(async () => root.render(React.createElement(React.StrictMode, null, React.createElement(button!), React.createElement(renderer!, {
      node: { ...node, data: { ...node.data, blocks: [{ kind: 'text', text: `${source}\nDone` }] } },
      renderMessageImages: () => null,
    }))));
    assert.match(shadow.textContent ?? '', /1/);
    assert.equal(mount.querySelector<HTMLButtonElement>('[data-iui-dsh-toggle]')?.getAttribute('aria-pressed'), 'true');
    const carousel = '<box><AsyncImageGroup query={["images/first.png","images/second.png"]} layout="carousel"/></box>';
    const loadImage = async () => '';
    await act(async () => root.render(React.createElement(React.StrictMode, null, React.createElement(button!), React.createElement(renderer!, {
      node: { ...node, data: { ...node.data, blocks: [{ kind: 'text', text: carousel }] } }, cwd: '/workspace', loadImage, renderMessageImages: () => null,
    }))));
    assert.equal(shadow.querySelector<HTMLImageElement>('.iui-image-carousel img')?.src, 'http://localhost/api/file?path=%2Fworkspace%2Fimages%2Ffirst.png');
    await act(async () => shadow.querySelector<HTMLButtonElement>('[aria-label="下一张图片"]')!.click());
    assert.equal(shadow.querySelector<HTMLImageElement>('.iui-image-carousel img')?.src, 'http://localhost/api/file?path=%2Fworkspace%2Fimages%2Fsecond.png');
    await act(async () => root.render(React.createElement(React.StrictMode, null, React.createElement(button!), React.createElement(renderer!, {
      node: { ...node, data: { ...node.data, blocks: [{ kind: 'text', text: `${carousel}\nDone` }] } }, cwd: '/workspace', loadImage, renderMessageImages: () => null,
    }))));
    assert.match(shadow.querySelector('.iui-image-controls')?.textContent ?? '', /2 \/ 2/);
    await act(async () => shadow.querySelector<HTMLButtonElement>('[aria-label="上一张图片"]')!.click());
    assert.equal(shadow.querySelector<HTMLImageElement>('.iui-image-carousel img')?.src, 'http://localhost/api/file?path=%2Fworkspace%2Fimages%2Ffirst.png');
    const native = '<box><AsyncImage query="attachment:image-1"/></box>';
    const nativeRef = { attachmentId: 'image-1', mediaType: 'image/png', bytes: 4, width: 10, height: 20, name: 'native.png' };
    const nativeLoader = async () => 'blob:http://localhost/native';
    await act(async () => root.render(React.createElement(React.StrictMode, null, React.createElement(button!), React.createElement(renderer!, {
      node: { ...node, data: { ...node.data, blocks: [{ kind: 'text', text: native }, { kind: 'image', attachment: nativeRef }] } },
      cwd: '/workspace', loadImage: nativeLoader, renderMessageImages: () => null,
    }))));
    assert.equal(shadow.querySelector<HTMLImageElement>('img')?.src, 'blob:http://localhost/native');
    await act(async () => root.render(React.createElement(React.StrictMode, null, React.createElement(button!), React.createElement(renderer!, {
      node: { ...node, key: 'reply-2', data: { ...node.data, blocks: [{ kind: 'text', text: native }] } },
      cwd: '/workspace', loadImage: nativeLoader, renderMessageImages: () => null,
    }))));
    assert.equal(shadow.querySelector('img'), null);
    await act(async () => root.render(React.createElement(React.StrictMode, null, React.createElement(button!), React.createElement(renderer!, {
      node: { ...node, key: 'reply-2', data: { ...node.data, blocks: [{ kind: 'text', text: native }, { kind: 'image', attachment: nativeRef }] } },
      cwd: '/workspace', loadImage: nativeLoader, renderMessageImages: () => null,
    }))));
    assert.equal(shadow.querySelector<HTMLImageElement>('img')?.src, 'blob:http://localhost/native');
    await act(async () => mount.querySelector<HTMLButtonElement>('[data-iui-dsh-toggle]')!.click());
    assert.equal(mount.querySelector('[data-iui-dsh-root]'), null);
    assert.match(mount.textContent ?? '', /<box>/);
    await act(async () => root.unmount());
  } finally {
    Object.assign(globalThis, previous);
    dom.window.close();
  }
});
