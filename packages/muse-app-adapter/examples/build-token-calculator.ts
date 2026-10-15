/**
 * token-calculator 示例构建脚本。
 * 运行: ./node_modules/.bin/tsx packages/muse-app-adapter/examples/build-token-calculator.ts
 * 输出: /tmp/oiu-calc-v3.html (可用 widget.create_html_file_widget 预览)
 *
 * 价格为 2026-10-15 查验的公开 API 标准价(美元/每百万 tokens),仅作示例。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileDslToWidget } from '../index.js';

const dir = dirname(fileURLToPath(import.meta.url));

const PRICES: Record<string, { name: string; input: number; output: number }> = {
  'gpt6-sol':      { name: 'GPT-6 Sol',         input: 2,    output: 10   },
  'sonnet55':      { name: 'Claude Sonnet 5.5', input: 2,    output: 10   },
  'gpt6-astra':    { name: 'GPT-6 Astra',       input: 10,   output: 50   },
  'opus55':        { name: 'Claude Opus 5.5',   input: 4,    output: 20   },
  'ds-v4pro':      { name: 'DeepSeek V4 Pro',   input: 1.32, output: 3.96 },
  'gemini31pro':   { name: 'Gemini 3.1 Pro',    input: 2,    output: 12   },
  'gpt6-luna':     { name: 'GPT-6 Luna',        input: 0.10, output: 0.50 },
  'ds-v4flash':    { name: 'DeepSeek V4 Flash', input: 0.44, output: 1.32 },
  'gemini38flash': { name: 'Gemini 3.8 Flash',  input: 0.75, output: 3.75 },
  'haiku45':       { name: 'Claude Haiku 4.5',  input: 1,    output: 5    },
  'gpt56-terra':   { name: 'GPT-5.6 Terra',     input: 2,    output: 12   },
  'gpt4o-mini':    { name: 'GPT-4o mini',       input: 0.15, output: 0.60 },
};
const MODEL_OPTIONS = Object.entries(PRICES).map(([value, p]) => ({ value, label: p.name }));
const FX = 6.69;

const dsl = readFileSync(resolve(dir, 'token-calculator.dsl.txt'), 'utf8');
const extraCss = readFileSync(resolve(dir, 'token-calculator.css'), 'utf8');

const result = compileDslToWidget(dsl, {
  messageId: 'token-calc-1',
  hostData: { PRICES, MODEL_OPTIONS, FX },
  extraCss,
});

if (result.warnings.length) console.warn('warnings:', result.warnings);
console.log('state defaults:', JSON.stringify(result.stateDefaults));
console.log('derived:', result.derived.map(d => d.name).join(','));
console.log('html bytes:', result.html.length);

const out = '/tmp/oiu-calc-v3.html';
writeFileSync(out, result.html);
console.log('written to', out);
