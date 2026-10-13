import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registry } from '../protocol';
import { categories, coverageComplete, galleryDocument, hintFor, usageFor } from './gallery-data';

test('参考名称逐项映射到可展示卡和属性说明',()=>{
  assert.equal(coverageComplete,true);
  assert.equal(new Set(categories.flatMap(c=>c.names)).size,registry.length);
  for(const spec of registry){
    assert.ok(categories.some(c=>c.names.includes(spec.name)),spec.name);
    assert.ok(hintFor(spec.name).length>0,spec.name);
    assert.ok(usageFor(spec.name).includes(`<${spec.name}`),spec.name);
    const doc=galleryDocument(spec.name);assert.equal(doc.messageId,`gallery-${spec.name}-standard`);assert.ok(doc.children.length>0,spec.name);
  }
});
test('组件展示的禁用、长文本和空值由标准 AST 构造，不调用 DSL 解析器',()=>{
  const disabled=galleryDocument('button','disabled');
  const serialized=JSON.stringify(disabled);
  assert.match(serialized,/"disabled"/);
  const long=galleryDocument('text','long');assert.ok(JSON.stringify(long).length>300);
  const empty=galleryDocument('input','empty');assert.equal(empty.declarations[0].expression,'""');
});
