import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseDsl, StreamParser, Runtime, SafeEvaluator, safeUrl, validateDocument, registry } from '../protocol';
import { mergeTheme, themes } from '../ui/theme';
const calculator=readFileSync(new URL('./fixtures/calculator.sample.iui.txt',import.meta.url),'utf8');
const form=readFileSync(new URL('./fixtures/form.sample.iui.txt',import.meta.url),'utf8');
const chart=readFileSync(new URL('./fixtures/trend.sample.iui.txt',import.meta.url),'utf8');
const latest=readFileSync(new URL('./fixtures/catalog-truncated.synthetic.iui.txt',import.meta.url),'utf8');
test('三个交互样例摘录均解析为完整 UI 树和声明',()=>{
  for(const [source,count] of [[calculator,7],[form,4],[chart,3]] as const){const d=parseDsl(source,'original');assert.equal(d.complete,true,JSON.stringify(d.diagnostics));assert.equal(d.declarations.length,count);assert.equal(d.children.filter(n=>n.kind==='element'&&n.name==='box').length,1);assert.equal(validateDocument(d).ok,true);}
});
test('计算器派生值和函数式 setter 更新',async()=>{
  const r=new Runtime(parseDsl(calculator,'calc'));assert.equal(r.scope().totalCost,380);
  await r.event('v=>setTokens(Math.max(0,Number(v)||0))','200');assert.equal(r.scope().totalCost,760);
  await r.event('()=>setTokens(v=>v+1)');assert.equal(r.scope().tokens,201);
});
test('表单数组操作、循环作用域和宿主动作需显式点击',async()=>{
  const actions:string[]=[];const r=new Runtime(parseDsl(form,'form'),{requestAction:async a=>{actions.push(a.payload);return {ok:true};}});
  assert.deepEqual(r.scope().features,['virtual']);assert.equal(actions.length,0);
  await r.event('v=>setFeatures(old=>v?[...old,f.id]:old.filter(x=>x!==f.id))',true,{...r.scope(),f:{id:'streaming'}});
  assert.deepEqual(r.scope().features,['virtual','streaming']);
  await r.event('()=>GenUI.issueNewTurn(`请使用 ${framework}，要求：${features.join("、")}`)');
  assert.equal(actions.length,1);assert.match(actions[0],/streaming/);
});
test('图表切换重算 visible，原数据未变',async()=>{
  const r=new Runtime(parseDsl(chart,'chart'));assert.equal((r.scope().visible as unknown[]).length,8);
  await r.event('setRange','recent');assert.equal((r.scope().visible as unknown[]).length,4);assert.equal((r.scope().points as unknown[]).length,8);
});
test('合成截断清单定位错误并可恢复',()=>{
  const d=parseDsl(latest,'latest');assert.equal(d.complete,false);const x=d.diagnostics.find(x=>x.code==='incomplete_tag');assert.ok(x);assert.equal(latest.slice(x.span.start).startsWith('</popover'),true);
  const repaired=parseDsl(latest+'>','latest');assert.equal(repaired.diagnostics.some(x=>x.code==='incomplete_tag'),false);
});
test('代码围栏、行内代码和转义标签惰性',()=>{
  const s='```jsx\n<button onClick={()=>GenUI.issueNewTurn("bad")}>X</button>\n```\n`<input/>` \\<button/> <text>safe</text>';
  const d=parseDsl(s,'inert');assert.equal(d.children.filter(n=>n.kind==='element').length,1);assert.equal(d.children.find(n=>n.kind==='element')?.kind,'element');assert.equal(d.declarations.length,0);
});
test('逐字符流式输入与完整解析一致，未闭合结构不提交',()=>{
  const s='{@body const [n,setN]=DIL.useState(1)}<box><text>{n}</text></box>',stream=new StreamParser('stream');let interim=stream.append('<b');assert.equal(interim.children.length,0);stream.reset();for(let i=0;i<s.length-1;i++)interim=stream.append(s[i]);assert.equal(interim.complete,false);const final=stream.append(s.at(-1)!,true);assert.deepEqual(final.children,parseDsl(s,'stream').children);assert.equal(final.complete,true);
});
test('表达式禁止全局、原型、构造器、赋值和无限资源',()=>{
  const e=new SafeEvaluator();for(const s of ['globalThis','window','({}).constructor','({})["__proto__"]','(()=>{}).constructor','new Function("return 1")','fetch("https://example.com")','a=1','[1,2].push(3)'])assert.throws(()=>e.evaluate(s),s);
  assert.throws(()=>e.evaluate('Array(1000000)'));
  assert.equal(e.evaluate('Math.max(2,4)'),4);
});
test('危险 URL 与任意 SVG 不进入可执行路径',()=>{
  for(const x of ['javascript:alert(1)','data:image/svg+xml,<svg onload=alert(1)>','blob:abc','/relative'])assert.equal(safeUrl(x),null);
  assert.equal(safeUrl('https://example.com/a'),'https://example.com/a');assert.equal(registry.find(x=>x.name==='svg')?.support,'unsupported');
});
test('组件注册表覆盖最新清单的全部名称与专用子组件',()=>{
  const names='text title caption badge code math label bold italic underline strikethrough icon box row col grid flow card carousel table list divider spacer pressable popover blockquote carousel-item grid-item table-row table-cell list-item flow-item popover-trigger popover-content button input textarea select checkbox radio-group radio slider date-picker segmented-control AsyncImage AsyncImageGroup AsyncVideo Chart MapWidgetV2 svg favicon Entity Cite Link FollowUp FileCite FileNavList MemoryCite CodeBlock WritingBlock AppBlock'.split(' ');
  for(const name of names)assert.ok(registry.some(x=>x.name===name),name);
});
test('默认宿主不派发动作，渲染求值不会偷跑动作',async()=>{
  const r=new Runtime(parseDsl('{@body const [v,setV]=DIL.useState("x")}<button onClick={()=>GenUI.copy(v)}>Copy</button>','unconfigured'));
  r.scope();assert.equal(r.feedback.length,0);assert.equal(r.value('GenUI.copy("x")'),undefined);assert.equal(r.feedback.length,0);
  await r.event('()=>GenUI.copy(v)');assert.match(r.feedback.at(-1)!,/宿主未配置/);
  await r.event('()=>GenUI.issueNewTurn("x")');assert.match(r.feedback.at(-1)!,/宿主未配置/);
});
test('受污染文本不会自动连环解码为可信组件',()=>{
  const raw='&#x3C;box&#x3E;\\<button onClick={setX}&#x3E;bad\\</button&#x3E;&#x3C;/box&#x3E;';
  assert.match(raw,/&#x/);const d=parseDsl(raw,'polluted');assert.equal(d.children.some(x=>x.kind==='element'&&x.name==='box'),false);
});
test('消息实例隔离、更新保留输入、重置和重新生成',async()=>{
  const d=parseDsl('{@body const [v,setV]=DIL.useState("start")}<input value={v} onChange={setV}/>','m1');const a=new Runtime(d),b=new Runtime(d);
  await a.event('setV','changed');assert.equal(a.scope().v,'changed');assert.equal(b.scope().v,'start');a.update(parseDsl('{@body const [v,setV]=DIL.useState("other")}<input value={v} onChange={setV}/>','m1'));assert.equal(a.scope().v,'changed');a.reset();assert.equal(a.scope().v,'other');a.update({...d,messageId:'m2'});assert.equal(a.scope().v,'start');
});
test('主题明暗、运行时切换和覆盖校验不触碰状态',async()=>{
  const r=new Runtime(parseDsl('{@body const [n,setN]=DIL.useState(1)}<button onClick={()=>setN(n+1)}>+</button>','theme'));
  await r.event('()=>setN(n+1)');const before=r.scope().n;assert.notEqual(themes.studio.light.background,themes.studio.dark.background);assert.notEqual(themes.studio.light.fontFamily,themes.citrus.light.fontFamily);
  const custom=mergeTheme('citrus','dark',{primary:'#b2396c',radius:20,background:'url(javascript:bad)' as string,fontFamily:'url(bad)' as string});assert.equal(custom.primary,'#b2396c');assert.equal(custom.radius,20);assert.equal(custom.background,themes.citrus.dark.background);assert.equal(custom.fontFamily,themes.citrus.dark.fontFamily);assert.equal(r.scope().n,before);
});
