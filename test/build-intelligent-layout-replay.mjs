import { build } from 'esbuild';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..'), out=resolve(root,'dist/verification');
await mkdir(out,{recursive:true});
const bundled=await build({entryPoints:[resolve(root,'test/replay-intelligent-layout.ts')],bundle:true,write:false,format:'iife',platform:'browser',target:'chrome120',loader:{'.txt':'text','.css':'text'},define:{'process.env.NODE_ENV':'"production"'}});
const fixture=await readFile(resolve(root,'test/fixtures/deepseek.composer.sanitized.html'),'utf8');
const hidden=await readFile(resolve(root,'packages/chrome-extension/hidden.css'),'utf8');
const css=`body{margin:0;background:#fff;color:#242424;font:15px/1.6 -apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif}main{max-width:820px;margin:40px auto;padding:0 32px}.notice{font-size:12px;color:#777;letter-spacing:.02em}h1{font-size:26px;margin:6px 0 26px}.user{margin-left:110px;padding:16px 20px;border-radius:20px;background:#f4f4f4}.assistant{margin:24px 0}.ds-toggle-button{display:inline-flex;align-items:center;border:1px solid #ddd;border-radius:999px;padding:4px 10px;font-size:12px;white-space:nowrap}#composer{margin-top:32px;padding:16px;background:#fafafa;border:1px solid #eee;border-radius:24px}textarea{width:100%;box-sizing:border-box;min-height:72px;border:0;resize:none;background:none;font:15px/1.6 inherit;outline:none}#toolbar{display:flex;gap:8px;align-items:center}.ds-button{cursor:pointer}.ds-button--circle{border-radius:50%;width:32px;height:32px;background:#4d6bfe;color:white;display:grid;place-items:center;font-size:20px}#result{font-size:12px;margin-top:24px;color:#657161}`;
const html=fixture.replace(/<script src=[^>]+><\/script>/g,'').replace('</head>',`<style>${css}\n${hidden}</style></head>`)
 .replace('<main>','<main><div class="notice">Open Intelligent UI · 本地离线回放（模拟发送桥，不连接 DeepSeek）</div><h1>把回复变成可交互的界面</h1>')
 .replace('</main>','<div id="result">检查中</div></main>').replace('</body>',`<script>${bundled.outputFiles[0].text.replaceAll('</script','<\\/script')}</script></body>`);
await writeFile(resolve(out,'intelligent-layout.html'),html);
console.log(resolve(out,'intelligent-layout.html'));
