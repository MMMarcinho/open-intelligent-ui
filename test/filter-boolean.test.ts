import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseDsl, Runtime, SafeEvaluator } from '../protocol/index.js';
import { parseReply } from '../services/reply-coordinator.js';

const declarations = `{@body const macs=[{id:0},{id:1},{id:2}]}
{@body const [sel,setSel]=DIL.useState([false,false,false])}
{@body const [st,setSt]=DIL.useState([0,0,0])}
{@body const doneCount=st.filter(s=>s===4).length}
{@body const onCount=sel.filter(Boolean).length}`;
const fleet = `<box><title>机队控制台</title>
{#each macs as m}<row><checkbox checked={sel[m.id]} onChange={()=>setSel(v=>v.map((b,i)=>i===m.id?!b:b))}/><text>{st[m.id]===0?'未开始':st[m.id]===-1?'失败':'运行中'}</text></row>{/each}
<button onClick={()=>setSt(v=>v.map((s,i)=>sel[i]&&s===0?1:s))}>启动</button>
<button onClick={()=>setSt(v=>v.map((s,i)=>sel[i]&&s>0&&s<4?s+1:s))}>下一步</button>
<button onClick={()=>setSt(v=>v.map((s,i)=>i===2&&s>0&&s<4?-1:s))}>失败</button>
<button onClick={()=>setSt([0,0,0])}>重置</button>
<badge>已上线 {doneCount} / 3</badge><badge>选中 {onCount} 台</badge></box>`;

test('the exact Boolean predicate filters truthy values within the array budget', () => {
  const evaluator = new SafeEvaluator();
  const values = [false, null, undefined, 0, '', true, 1, 'x', [], {}];
  assert.deepEqual(evaluator.evaluate('values.filter(Boolean)', { values }), [true, 1, 'x', values[8], values[9]]);
  assert.equal(evaluator.evaluate('[false,true,0,"",null,1].filter(Boolean).length'), 2);
  assert.deepEqual(evaluator.evaluate('values.filter(x=>!!x)', { values }), [true, 1, 'x', values[8], values[9]]);
});

test('fleet declarations, each locals and all setter buttons share one safe runtime', async () => {
  const source = `${declarations}\n${fleet}`;
  const document = parseReply(source, 'fleet');
  assert.ok(document, 'the full screenshot-shaped IUI is accepted');
  assert.equal(document.diagnostics.length, 0);
  const runtime = new Runtime(document);
  assert.equal(runtime.scope().onCount, 0);
  await runtime.event('()=>setSel(v=>v.map((b,i)=>i===m.id?!b:b))', undefined, {...runtime.scope(), m:{id:1}});
  assert.deepEqual(runtime.scope().sel, [false,true,false]);
  assert.equal(runtime.scope().onCount, 1);
  await runtime.event('()=>setSt(v=>v.map((s,i)=>sel[i]&&s===0?1:s))');
  assert.deepEqual(runtime.scope().st, [0,1,0]);
  for (let index=0; index<3; index++) await runtime.event('()=>setSt(v=>v.map((s,i)=>sel[i]&&s>0&&s<4?s+1:s))');
  assert.equal(runtime.scope().doneCount, 1);
  await runtime.event('()=>setSel(v=>v.map((b,i)=>i===m.id?!b:b))', undefined, {...runtime.scope(), m:{id:2}});
  await runtime.event('()=>setSt(v=>v.map((s,i)=>sel[i]&&s===0?1:s))');
  await runtime.event('()=>setSt(v=>v.map((s,i)=>i===2&&s>0&&s<4?-1:s))');
  assert.deepEqual(runtime.scope().st, [0,4,-1]);
  await runtime.event('()=>setSt([0,0,0])');
  assert.deepEqual(runtime.scope().st, [0,0,0]);
  assert.equal(runtime.feedback.length, 0);
});

test('a declared Boolean shadows the shorthand and is never replaced by a host function', () => {
  const source = '{@body const Boolean=x=>x>1}{@body const selected=[0,1,2].filter(Boolean)}<box><text>{selected.length}</text></box>';
  assert.ok(parseReply(source, 'local-Boolean'));
  assert.deepEqual(new Runtime(parseDsl(source)).scope().selected, [2]);
  assert.deepEqual(new SafeEvaluator().evaluate('[0,1,2].filter(Boolean)', { Boolean: { $closure: true, node: new SafeEvaluator().parse('x=>x>1'), env: {} } }), [2]);
  assert.throws(() => new SafeEvaluator().evaluate('[1].filter(Boolean)', { Boolean: 0 }), /array callback must be arrow/);
});

test('Boolean shorthand never enables global calls, other callbacks or dangerous members', () => {
  const evaluator = new SafeEvaluator();
  for (const source of [
    'Boolean(1)', '[1].map(Boolean)', '[1].find(Boolean)', '[1].sort(Boolean)',
    '[1]["filter"](Boolean)', '[1].filter(Boolean, 1)', '[1].filter(Boolean.bind(null))',
    '[1].filter(window.Boolean)', '[1].filter(globalThis.Boolean)',
    '[1].filter(Function)', '[1].filter(Boolean.constructor)',
    '[1].filter((x)=>x.constructor)', '[1].filter(x=>fetch("https://example.com"))',
  ]) assert.throws(() => evaluator.evaluate(source), source);
  assert.equal(parseReply('{@body const x=Boolean(1)}<box><text>{x}</text></box>', 'call'), null);
  assert.equal(parseReply('{@body const x=[1].map(Boolean)}<box><text>{x}</text></box>', 'map'), null);
  assert.equal(parseReply('{@body const Boolean=0}{@body const x=[1].filter(Boolean)}<box><text>{x}</text></box>', 'shadowed-invalid'), null);
});

test('DSH prompt explains callback syntax without claiming general Boolean access', () => {
  const prompt = readFileSync(new URL('../packages/dsh-plugin/prompt.txt', import.meta.url), 'utf8');
  assert.match(prompt, /filter\(x=>!!x\)/);
  assert.match(prompt, /Boolean is not a general callable global/);
});
