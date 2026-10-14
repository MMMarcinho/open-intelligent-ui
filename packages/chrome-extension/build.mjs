import { build } from 'esbuild';
import { copyFile, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const out = resolve(root, 'dist/chrome-extension');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const name of ['manifest.json', 'popup.html', 'popup.css', 'options.html', 'options.css', 'hidden.css']) {
  await copyFile(resolve(import.meta.dirname, name), resolve(out, name));
}
await mkdir(resolve(out, 'icons'), { recursive: true });
for (const size of [16, 32, 48, 128]) {
  await copyFile(resolve(import.meta.dirname, `icons/icon-${size}.png`), resolve(out, `icons/icon-${size}.png`));
}
for (const name of ['content', 'popup', 'options', 'background']) {
  await build({
    entryPoints: [resolve(import.meta.dirname, `${name}.ts`)],
    outfile: resolve(out, `${name}.js`),
    bundle: true, platform: 'browser', format: 'iife', target: 'chrome120',
    define: { 'process.env.NODE_ENV': '"production"' },
    loader: { '.css': 'text' },
    minify: true, legalComments: 'none',
  });
}
console.log(`Unpacked MV3 extension: ${out}`);
