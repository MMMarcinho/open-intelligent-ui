import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({ cacheDir: '.vite-cache', build: { outDir: 'dist/playground', rollupOptions:{input:{main:resolve('index.html'),components:resolve('test/index.html')}} }, server: { host: '127.0.0.1' } });
