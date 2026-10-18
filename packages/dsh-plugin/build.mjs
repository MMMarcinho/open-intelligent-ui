import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';

await mkdir(new URL('./lib/', import.meta.url), { recursive: true });
await build({
  entryPoints: [new URL('./src/index.ts', import.meta.url).pathname],
  outfile: new URL('./lib/index.js', import.meta.url).pathname,
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node24',
});
const result = await build({
  entryPoints: [new URL('./src/client.tsx', import.meta.url).pathname],
  bundle: true,
  platform: 'browser',
  format: 'cjs',
  target: 'es2022',
  write: false,
  loader: { '.css': 'text' },
  external: ['react', 'react/jsx-runtime', 'react-dom', '@deepseek-ai/dsh-client-ui-primitives'],
});
const bundled = result.outputFiles[0].text;
const wrapped = `window.__ModuleLoader__.load({\n  id: 'open-intelligent-ui-dsh-plugin',\n  factory: (require) => {\n    const module = { exports: {} };\n    const exports = module.exports;\n${bundled}\n    return module.exports;\n  },\n});\n`;
await writeFile(new URL('./lib/client.js', import.meta.url), wrapped);
