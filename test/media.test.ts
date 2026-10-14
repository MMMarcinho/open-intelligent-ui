import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseDsl } from '../protocol/index.js';
import { createProjectMediaHost, projectImageQueries } from '../services/project-media-host.js';

const request = (query: string) => ({ kind: 'AsyncImage', query, props: {}, messageId: 'media-test' });

test('project image host resolves only the two reviewed local assets', async () => {
  const host = createProjectMediaHost({ banner: 'https://localhost.test/banner.png', icon: 'https://localhost.test/icon.png' });
  const banner = await host.resolveResource!(request(projectImageQueries.banner));
  assert.equal(banner.ok, true);
  assert.equal((banner.value as { src: string }).src, 'https://localhost.test/banner.png');
  assert.match((banner.value as { alt: string }).alt, /README/);
  assert.equal((await host.resolveResource!(request(projectImageQueries.icon))).ok, true);
  for (const query of ['https://openai.com', 'https://example.org/photo.jpg', 'OpenAI office', 'iui:missing-example']) {
    assert.equal((await host.resolveResource!(request(query))).ok, false, query);
  }
  assert.equal((await host.resolveResource!({ ...request(projectImageQueries.banner), kind: 'AsyncVideo' })).ok, false);
});

test('media demo is valid known protocol with single and grouped image queries', () => {
  const source = readFileSync(new URL('./playground/media-local.iui.txt', import.meta.url), 'utf8');
  const document = parseDsl(source, 'media-demo');
  assert.equal(document.complete, true, JSON.stringify(document.diagnostics));
  const names: string[] = [];
  const visit = (nodes: typeof document.children) => nodes.forEach(node => {
    if (node.kind === 'element') names.push(node.name);
    if ('children' in node) visit(node.children);
  });
  visit(document.children);
  assert.equal(names.filter(name => name === 'AsyncImage').length, 2);
  assert.equal(names.filter(name => name === 'AsyncImageGroup').length, 1);
  assert.match(source, /iui:readme-banner/);
  assert.match(source, /iui:extension-icon/);
});
