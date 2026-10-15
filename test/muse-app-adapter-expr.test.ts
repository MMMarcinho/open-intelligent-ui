import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evalNode, fmt, fmtCny, fmtK, parseExpr } from '../packages/muse-app-adapter/expr.js';

function ev(src: string, scope: Record<string, unknown> = {}) {
  return evalNode(parseExpr(src), { fmt, fmtK, fmtCny, ...scope });
}

test('四则运算与成员访问求值正确', () => {
  assert.equal(ev('1+2*3'), 7);
  assert.equal(ev('(1+2)*3'), 9);
  assert.equal(ev('inK*m.input/1000', { inK: 50, m: { input: 2 } }), 0.1);
  assert.equal(ev('PRICES[model].output', { PRICES: { a: { output: 10 } }, model: 'a' }), 10);
  assert.equal(ev('-x', { x: 5 }), -5);
  assert.equal(ev('"a"+"b"'), 'ab');
});

test('格式化函数输出符合预期', () => {
  assert.equal(ev('fmt(0.1)'), '$0.10');
  assert.equal(ev('fmt(1234.5)'), '$1,234.50');
  assert.equal(ev('fmt(0)'), '$0');
  assert.equal(ev('fmtK(50)'), '50K');
  assert.equal(ev('fmtK(1500)'), '1.5M');
  assert.equal(ev('fmtCny(1.0035)'), '¥1.00');
});

test('拒绝方法调用与原型链访问', () => {
  assert.throws(() => ev('m.slice(0)', { m: 'abc' }), /method calls blocked/);
  assert.throws(() => ev('m.constructor', { m: {} }), /blocked prop/);
  assert.throws(() => ev('m["__proto__"]', { m: {} }), /blocked prop/);
  assert.throws(() => ev('m["con"+"structor"]', { m: {} }), /blocked prop/);
  assert.throws(() => ev('fetch("/x")'), /blocked call/);
  assert.throws(() => ev('nope(1)'), /blocked call/);
  assert.throws(() => ev('unknownIdent'), /unknown ident/);
});

test('畸形表达式解析失败不崩溃', () => {
  assert.throws(() => parseExpr('1+'));
  assert.throws(() => parseExpr('(1'));
  assert.throws(() => parseExpr('1 2'));
});

test('booleans and escaped strings retain their literal values', () => {
  assert.equal(ev('false'), false);
  assert.equal(ev('true'), true);
  for (const value of ['New York', "O'Reilly", 'a\nb\tc', 'C:\\new\\test', '"quoted"', '\u0000']) {
    assert.equal(ev(JSON.stringify(value)), value);
  }
  assert.equal(ev("'it\\'s fine'"), "it's fine");
  assert.equal(ev('"\\u0041\\x42"'), 'AB');
  assert.throws(() => ev('"unterminated'));
  assert.throws(() => ev('"\\uZZZZ"'));
});
