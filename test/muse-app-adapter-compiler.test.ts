import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileDslToWidget } from '../packages/muse-app-adapter/index.js';
import { renderNode, type RenderContext } from '../packages/muse-app-adapter/components.js';
import { DEFAULT_COMPONENT_CSS, MUSE_APP_THEME_CSS } from '../packages/muse-app-adapter/theme.js';

const counterDsl = `{@body const [count,setCount]=DIL.useState(0)}
{@body const doubled=count*2}
<box border padding={3} gap={2}>
  <title>计数器</title>
  <text>当前 {count} · 两倍 {doubled}</text>
  <button onClick={()=>setCount(previous=>previous+1)}>增加</button>
</box>`;

test('计数器 DSL 编译零警告,产物不含危险写法', () => {
  const r = compileDslToWidget(counterDsl, { messageId: 't1' });
  assert.deepEqual(r.warnings, []);
  assert.deepEqual(r.stateDefaults, { count: 0 });
  assert.deepEqual(r.derived.map(d => d.name), ['doubled']);
  assert.match(r.html, /data-expr="count"/);
  assert.match(r.html, /data-set="count" data-delta="1"/);
  for (const banned of ['eval(', 'new Function', 'innerHTML', '<form', 'localStorage', 'IndexedDB']) {
    assert.ok(!r.html.includes(banned), `不应含有 ${banned}`);
  }
});

test('不支持的 onClick 形状降级为禁用按钮并记 warning', () => {
  const r = compileDslToWidget(`{@body const [x,setX]=DIL.useState(1)}\n<button onClick={()=>alert(x)}>点我</button>`);
  assert.ok(r.warnings.some(w => w.includes('onClick')), r.warnings.join(';'));
  assert.match(r.html, /<button class="tui-chip" disabled>/);
});

test('未知组件记 warning 并跳过(直接构造 AST,解析器会把未知标签当惰性文本)', () => {
  const ctx: RenderContext = { hostData: {}, warnings: [] };
  const out = renderNode(
    { kind: 'element', name: 'fancything', attributes: {}, children: [], span: { start: 0, end: 1 } },
    ctx,
  );
  assert.equal(out, '');
  assert.ok(ctx.warnings.some(w => w.includes('fancything')));
});

test('select 的 options 从 hostData 解析', () => {
  const r = compileDslToWidget(
    `{@body const [m,setM]=DIL.useState("a")}\n<select value={m} onChange={setM} options={OPTS}/>`,
    { hostData: { OPTS: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }] } },
  );
  assert.deepEqual(r.warnings, []);
  assert.ok(r.html.includes('<option value="a">A</option>'));
  assert.ok(r.html.includes('<option value="b">B</option>'));
});

test('token 计算器示例编译零警告', () => {
  const dir = dirname(fileURLToPath(import.meta.url));
  const dsl = readFileSync(resolve(dir, '../packages/muse-app-adapter/examples/token-calculator.dsl.txt'), 'utf8');
  const css = readFileSync(resolve(dir, '../packages/muse-app-adapter/examples/token-calculator.css'), 'utf8');
  const r = compileDslToWidget(dsl, {
    messageId: 'calc-test',
    hostData: { PRICES: { x: { input: 1, output: 2 } }, MODEL_OPTIONS: [{ value: 'x', label: 'X' }], FX: 6.69 },
    extraCss: css,
  });
  assert.deepEqual(r.warnings, []);
  assert.equal((r.html.match(/<option/g) || []).length, 1);
  assert.ok(r.html.length < 1024 * 1024, '产物必须小于 widget 1MB 上限');
});

test('主题镜像文件与常量一致', () => {
  const dir = dirname(fileURLToPath(import.meta.url));
  const museCss = readFileSync(resolve(dir, '../packages/muse-app-adapter/theme/muse-app.css'), 'utf8');
  const compCss = readFileSync(resolve(dir, '../packages/muse-app-adapter/theme/components.css'), 'utf8');
  assert.ok(museCss.includes(MUSE_APP_THEME_CSS.trim()));
  assert.ok(compCss.includes(DEFAULT_COMPONENT_CSS.trim()));
});
