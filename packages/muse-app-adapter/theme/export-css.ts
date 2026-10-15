/**
 * 生成 theme/*.css 镜像文件:内容必须与 theme.ts 常量一致。
 * 运行: ./node_modules/.bin/tsx packages/muse-app-adapter/theme/export-css.ts
 * test/muse-app-adapter-theme.test.ts 会断言镜像与常量一致,防止漂移。
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_COMPONENT_CSS, MUSE_APP_THEME_CSS } from '../theme.js';

const dir = resolve(dirname(fileURLToPath(import.meta.url)));
mkdirSync(dir, { recursive: true });
writeFileSync(resolve(dir, 'muse-app.css'), `/* 由 theme.ts 生成,请勿手改,改完运行 export-css.ts */\n${MUSE_APP_THEME_CSS}\n`);
writeFileSync(resolve(dir, 'components.css'), `/* 由 theme.ts 生成,请勿手改,改完运行 export-css.ts */\n${DEFAULT_COMPONENT_CSS}\n`);
console.log('theme css exported to', dir);
