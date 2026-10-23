import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { JSDOM } from 'jsdom';
import { createRoot } from 'react-dom/client';
import { absoluteFileAddress, sessionFileAddress } from '@deepseek-ai/dsh-util-workspace-path';
import type { MessageImageLoader } from '@deepseek-ai/dsh-client-ui-conversation/client';
import { createDshMediaAdapter } from '../packages/dsh-plugin/src/media.js';

const attachment = { attachmentId: 'image-1', mediaType: 'image/png', bytes: 4, width: 10, height: 20, name: 'native.png' } as Parameters<MessageImageLoader>[0];
const request = (query: string, messageId = 'reply:0', kind = 'AsyncImage') => ({ kind, query, props: {}, messageId });
const src = (result: Awaited<ReturnType<NonNullable<ReturnType<typeof createDshMediaAdapter>['resolveResource']>>>) =>
  (result.value as { src?: string } | undefined)?.src;

test('DSH images resolve explicit session paths, absolute file references, and HTTP(S) URLs', async () => {
  const host = createDshMediaAdapter({ base: 'http://localhost/chat/', cwd: '/workspace', messageId: 'reply:0', attachments: [], loadImage: async () => '' });
  const resolve = host.resolveResource!;
  assert.equal(src(await resolve(request('images/first%20slide.png'))), 'http://localhost/chat/api/file?path=%2Fworkspace%2Fimages%2Ffirst%20slide.png');
  assert.equal(src(await resolve(request('/tmp/second.webp'))), 'http://localhost/chat/api/file?path=%2Ftmp%2Fsecond.webp');
  assert.equal(src(await resolve(request(absoluteFileAddress('/tmp/third.gif')))), 'http://localhost/chat/api/file?path=%2Ftmp%2Fthird.gif');
  assert.equal(src(await resolve(request('https://images.example.org/a?id=2'))), 'https://images.example.org/a?id=2');
  assert.equal((await resolve(request(sessionFileAddress('other', 'a.png')))).ok, false);
  const noCwd = createDshMediaAdapter({ base: 'dsh-app://app/', messageId: 'reply:0', attachments: [], loadImage: async () => '' }).resolveResource!;
  assert.equal((await noCwd(request('relative.png'))).ok, false);
  assert.equal(src(await noCwd(request('/tmp/absolute.png'))), 'dsh-app://app/api/file?path=%2Ftmp%2Fabsolute.png');
});

test('DSH images reject searches, unsafe schemes, foreign message ids and unknown attachments', async () => {
  let loads = 0;
  const host = createDshMediaAdapter({ base: 'http://localhost/', cwd: '/workspace', messageId: 'reply:0', attachments: [attachment], loadImage: async () => { loads++; return 'blob:http://localhost/native'; } });
  const resolve = host.resolveResource!;
  for (const query of ['a pretty landscape', 'javascript:alert(1).png', 'javascript%3Aalert.png', 'data:image/png;base64,AAAA', 'blob:http://localhost/x.png', '//evil.example/a.png', 'file:///tmp/a.png', 'https://user:pass@example.org/a.png', 'vector.svg'])
    assert.equal((await resolve(request(query))).ok, false, query);
  assert.equal((await resolve(request('attachment:missing'))).ok, false);
  assert.equal((await resolve(request('attachment:image-1', 'other:0'))).ok, false);
  assert.equal((await resolve(request('attachment:image-1', 'reply:0', 'AsyncVideo'))).ok, false);
  assert.equal(loads, 0);
  const native = await resolve(request('attachment:image-1'));
  assert.equal(src(native), 'blob:http://localhost/native');
  assert.equal((native.value as { nativeAttachment?: boolean }).nativeAttachment, true);
  assert.equal(loads, 1);
});

test('late image results cannot replace a new message, and only native attachments may use blob URLs', async () => {
  const { AsyncImage } = await import(new URL('../dist/lib/packages/react-ui/index.js', import.meta.url).href);
  const dom = new JSDOM('<!doctype html><body><div id="mount"></div></body>', { url: 'http://localhost/' });
  const previous = { window: globalThis.window, document: globalThis.document, IS_REACT_ACT_ENVIRONMENT: (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT };
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true });
  const root = createRoot(dom.window.document.getElementById('mount')!);
  const { act } = React;
  let finishOld!: (result: { ok: boolean; value: { src: string; alt: string } }) => void;
  const oldAdapter = { resolveResource: () => new Promise(resolve => { finishOld = resolve; }) };
  const newAdapter = { resolveResource: async () => ({ ok: true, value: { src: 'dsh-app://app/api/file?path=%2Fnew.png', alt: 'new' } }) };
  try {
    await act(async () => root.render(React.createElement(AsyncImage, { query: 'old.png', messageId: 'old', adapter: oldAdapter })));
    await act(async () => root.render(React.createElement(AsyncImage, { query: 'new.png', messageId: 'new', adapter: newAdapter })));
    assert.equal(dom.window.document.querySelector('img')?.getAttribute('src'), 'dsh-app://app/api/file?path=%2Fnew.png');
    await act(async () => finishOld({ ok: true, value: { src: 'https://example.org/old.png', alt: 'old' } }));
    assert.equal(dom.window.document.querySelector('img')?.getAttribute('src'), 'dsh-app://app/api/file?path=%2Fnew.png');
    await act(async () => root.render(React.createElement(AsyncImage, { query: 'attachment:image-1', messageId: 'native',
      adapter: { resolveResource: async () => ({ ok: true, value: { src: 'blob:http://localhost/native', alt: 'native', nativeAttachment: true } }) } })));
    assert.equal(dom.window.document.querySelector('img')?.getAttribute('src'), 'blob:http://localhost/native');
    await act(async () => root.render(React.createElement(AsyncImage, { query: 'untrusted', messageId: 'untrusted',
      adapter: { resolveResource: async () => ({ ok: true, value: { src: 'blob:http://localhost/untrusted', alt: 'untrusted' } }) } })));
    assert.equal(dom.window.document.querySelector('img'), null);
    await act(async () => root.render(React.createElement(AsyncImage, { query: 'foreign', messageId: 'foreign',
      adapter: { resolveResource: async () => ({ ok: true, value: { src: 'dsh-app://other/api/file?path=%2Ftmp%2Fa.png', alt: 'foreign' } }) } })));
    assert.equal(dom.window.document.querySelector('img'), null);
  } finally {
    await act(async () => root.unmount());
    Object.assign(globalThis, previous);
    dom.window.close();
  }
});
