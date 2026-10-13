import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { decodeCapturedText, parseDsl, registry, Runtime, type Document, type Node } from '../protocol';
// Exercise the package's emitted ESM entry; this old local tsx loader cannot resolve .js specifiers to .tsx sources.
const builtEntry=new URL('../dist/lib/packages/react-ui/index.js',import.meta.url).href;
const builtUi=await import(builtEntry);
const { UIRenderer }=builtUi;

const fixture=(name:string)=>readFileSync(new URL(`./fixtures/${name}`,import.meta.url),'utf8');
const latest=fixture('catalog-truncated.synthetic.iui.txt');
const samples=[
  {name:'计算器',source:fixture('calculator.sample.iui.txt'),markup:/LLM API Cost Simulator/},
  {name:'任务表单',source:fixture('form.sample.iui.txt'),markup:/Frontend Task Builder/},
  {name:'趋势图',source:fixture('trend.sample.iui.txt'),markup:/line 图表/}
];
function elements(document:Document){const out:Extract<Node,{kind:'element'}>[]=[];const visit=(nodes:Node[])=>nodes.forEach(node=>{if(node.kind==='element')out.push(node);if('children'in node)visit(node.children);});visit(document.children);return out;}

test('46 个本地名称均有公开的独立 React 组件入口',()=>{
  const aliases:Record<string,string>={col:'Column',math:'MathText'};
  const local=registry.filter(x=>x.support==='local');assert.equal(local.length,46);
  for(const spec of local){
    const exportName=aliases[spec.name]??spec.name.split('-').map(x=>x[0].toUpperCase()+x.slice(1)).join('');
    assert.equal(typeof builtUi[exportName],'function',`${spec.name} → ${exportName}`);
  }
});

test('文档里的最小协议例子可解析、渲染并响应真实按钮表达式',async()=>{
  const guide=readFileSync(new URL('../docs/CAPTURED_FORMAT.zh-CN.md',import.meta.url),'utf8');
  const source=/```iui\n([\s\S]*?)\n```/.exec(guide)?.[1];assert.ok(source);
  const document=parseDsl(source,'guide');assert.equal(document.complete,true);
  const runtime=new Runtime(document);
  const first=renderToStaticMarkup(React.createElement(UIRenderer,{runtime}));assert.match(first,/计数：0/);
  const button=elements(document).find(n=>n.name==='button');assert.ok(button?.attributes.onClick);
  await runtime.event(String(button.attributes.onClick.value));
  const second=renderToStaticMarkup(React.createElement(UIRenderer,{runtime}));assert.match(second,/计数：1/);
});

test('只按显式传输层做一次解封装，污染实体保持惰性',()=>{
  const plain=samples[0].source;
  assert.equal(decodeCapturedText(JSON.stringify(plain),'json-string'),plain);
  assert.equal(decodeCapturedText(plain,'plain'),plain);
  assert.throws(()=>decodeCapturedText(plain,'json-string'));
  const polluted='&#x3C;button onClick={setCount}&#x3E;不应激活&#x3C;/button&#x3E;';
  assert.equal(elements(parseDsl(polluted)).length,0);
});

test('三个交互样例的可执行摘录经 React 渲染，不使用手造 AST',()=>{
  for(const sample of samples){
    const document=parseDsl(sample.source,sample.name);
    assert.equal(document.complete,true,`${sample.name}: ${JSON.stringify(document.diagnostics)}`);
    const html=renderToStaticMarkup(React.createElement(UIRenderer,{runtime:new Runtime(document)}));
    assert.match(html,sample.markup,sample.name);
    assert.match(html,/iui-/,sample.name);
    if(sample.name==='趋势图')assert.match(html,/<svg[^>]+aria-label="line 图表"/);
    if(sample.name==='任务表单')assert.match(html,/type="radio"/);
  }
});

test('样本中真实的函数回调、复合 setter 与宿主动作保持值语义',async()=>{
  const form=parseDsl(samples[1].source,'form-captured'),actions:string[]=[];
  const runtime=new Runtime(form,{requestAction:async action=>{actions.push(action.payload);return {ok:true};}});
  const button=elements(form).find(n=>n.name==='button'&&String(n.attributes.onClick?.value).includes('issueNewTurn'));
  assert.ok(button?.attributes.onClick);
  assert.equal(actions.length,0);
  await runtime.event(String(button.attributes.onClick.value));
  assert.equal(actions.length,1);assert.match(actions[0],/react/);
  const latestDoc=parseDsl(latest,'latest-captured');
  const latestRuntime=new Runtime(latestDoc);
  await latestRuntime.event('setClickCount',4);await latestRuntime.event('setDemoSlider',25);
  const reset=elements(latestDoc).find(n=>n.name==='button'&&String(n.attributes.onClick?.value).includes('setClickCount(0)'));
  assert.ok(reset?.attributes.onClick);
  await latestRuntime.event(String(reset.attributes.onClick.value));
  assert.equal(latestRuntime.scope().clickCount,0);assert.equal(latestRuntime.scope().demoSlider,65);
});

test('合成截断样例可渲染完整前缀，截断不被宣称为完整程序',()=>{
  const document=parseDsl(latest,'catalog-synthetic');
  assert.equal(document.complete,false);
  assert.ok(document.diagnostics.some(d=>d.code==='incomplete_tag'&&latest.slice(d.span.start).startsWith('</popover')));
  assert.ok(elements(document).length>20);
  const html=renderToStaticMarkup(React.createElement(UIRenderer,{runtime:new Runtime(document)}));
  assert.match(html,/Interactive Components/);
  assert.match(html,/AsyncImage.*宿主未配置/);
  assert.match(html,/aria-label="pie 图表"|aria-label="饼图"/);
});

test('代码围栏、HTML 注释、未知包裹和转义标签内不激活 UI',()=>{
  for(const source of ['```jsx\n<button onClick={()=>GenUI.copy("x")}>x</button>\n```','<!-- <input value="x"/> -->','<script><button>bad</button></script>','<foreign><slider value={1}/></foreign>','\\<button>bad</button>']){
    const doc=parseDsl(source,'inert');assert.equal(elements(doc).length,0,source);
  }
  const code='```jsx\n<button onClick={()=>GenUI.copy("x")}>x</button>\n```';
  assert.equal(elements(parseDsl(code)).length,0);
});
