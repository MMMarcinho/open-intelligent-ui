import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseDsl, Runtime } from '../protocol';
const benchmark=readFileSync(new URL('./playground/benchmark-adapted.iui.txt',import.meta.url),'utf8');
const controls=readFileSync(new URL('./fixtures/controls.sample.iui.txt',import.meta.url),'utf8');

test('Agent 评测改编 demo 有效且状态驱动排名与详情',async()=>{
  const doc=parseDsl(benchmark,'benchmark');assert.equal(doc.complete,true,JSON.stringify(doc.diagnostics));
  const run=new Runtime(doc);assert.equal(run.feedback.length,0);
  const before=run.scope();assert.equal((before.scored as unknown[]).length,4);assert.equal(before.selected,'Claude Code');
  await run.event('setMode','quality');assert.equal(run.scope().mode,'quality');
  await run.event('()=>setSelected("Codex")');assert.equal((run.scope().current as {name:string}).name,'Codex');
});
test('交互控件可执行摘录可作为完整 demo',()=>{
  const doc=parseDsl(controls,'controls');
  assert.equal(doc.complete,true,JSON.stringify(doc.diagnostics));
  const run=new Runtime(doc);assert.equal(run.scope().demoSlider,65);
});
