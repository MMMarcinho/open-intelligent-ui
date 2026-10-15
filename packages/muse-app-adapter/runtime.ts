/**
 * Widget 浏览器端运行时构建器。
 *
 * createWidgetRuntime() 返回一段可直接放进 <script> 的 JS 字符串,职责:
 * 1. 内联受限表达式求值器(来自 ./expr,经 Function.toString 序列化,无打包器依赖);
 * 2. 从 window.hatchWidget 读取/写入消息级持久状态(DIL.useState 的宿主实现);
 * 3. 按声明顺序求值派生量,渲染所有 [data-expr] 占位;
 * 4. 接线控件:select / slider / 预设按钮,同步控件值与滑杆填充;
 * 5. 监听 hatch-widget-state 事件,宿主状态变化时重绘(单真相源,不读闭包)。
 *
 * 安全:运行时不含 eval / new Function / innerHTML;所有文本经 textContent 写入。
 */
import { serializeEvaluator } from './expr.js';

export interface DerivedDecl { name: string; src: string }

export interface WidgetRuntimeOptions {
  /** 宿主静态数据(PRICES/FX/MODEL_OPTIONS 等),必须 JSON 可序列化。 */
  hostData: Record<string, unknown>;
  /** {@body const x=expr} 派生声明,按 DSL 出现顺序。 */
  derived: DerivedDecl[];
  /** DIL.useState 初始值,作为 getState 的种子。 */
  defaults: Record<string, unknown>;
}

export function createWidgetRuntime(opts: WidgetRuntimeOptions): string {
  const evaluatorSrc = serializeEvaluator();
  const hostJson = JSON.stringify(opts.hostData);
  const derivedJson = JSON.stringify(opts.derived);
  const defaultsJson = JSON.stringify(opts.defaults);

  return `(function(){
"use strict";
${evaluatorSrc}
var HOST = ${hostJson};
var DERIVED = ${derivedJson};
var DEFAULTS = ${defaultsJson};
DERIVED.forEach(function(d){ try { d.ast = parseExpr(d.src); } catch(e){ d.ast = null; } });

function get(){ return window.hatchWidget.getState(DEFAULTS); }
function set(patch){ var s = get(); for (var k in patch) s[k] = patch[k]; window.hatchWidget.setState(s); }

function paint(){
  var s = get(), scope = {};
  for (var k in HOST) scope[k] = HOST[k];
  scope.fmt = fmt; scope.fmtK = fmtK; scope.fmtCny = fmtCny;
  for (var k in s) scope[k] = s[k];
  for (var i = 0; i < DERIVED.length; i++) {
    try { scope[DERIVED[i].name] = evalNode(DERIVED[i].ast, scope); }
    catch(e){ scope[DERIVED[i].name] = NaN; }
  }
  var els = document.querySelectorAll('[data-expr]');
  for (var i = 0; i < els.length; i++) {
    var v;
    try { v = evalNode(els[i]._ast, scope); } catch(e){ v = NaN; }
    els[i].textContent = (typeof v === 'number' && !isFinite(v)) ? '\\u2013' : String(v);
  }
  var binds = document.querySelectorAll('[data-bind]');
  for (var i = 0; i < binds.length; i++) {
    var b = binds[i], key = b.getAttribute('data-bind'), v = s[key];
    if (b.tagName === 'SELECT') { b.value = v; }
    else if (b.type === 'range') {
      b.value = v;
      var p = (v - parseFloat(b.min)) / (parseFloat(b.max) - parseFloat(b.min)) * 100;
      b.style.background = 'linear-gradient(90deg, var(--iui-accent) ' + p + '%, var(--iui-surface-2) ' + p + '%)';
    }
  }
  var chips = document.querySelectorAll('[data-set][data-val]');
  for (var i = 0; i < chips.length; i++) {
    var c = chips[i], v;
    try { v = JSON.parse(c.getAttribute('data-val')); } catch(e){ continue; }
    if (s[c.getAttribute('data-set')] === v) c.classList.add('on');
    else c.classList.remove('on');
  }
}

var sels = document.querySelectorAll('select[data-bind]');
for (var i = 0; i < sels.length; i++) (function(el){
  el.addEventListener('change', function(){ var p = {}; p[el.getAttribute('data-bind')] = el.value; set(p); });
})(sels[i]);
var rngs = document.querySelectorAll('input[type=range][data-bind]');
for (var i = 0; i < rngs.length; i++) (function(el){
  el.addEventListener('input', function(){ var p = {}; p[el.getAttribute('data-bind')] = Number(el.value); set(p); });
})(rngs[i]);
var btns = document.querySelectorAll('[data-set]');
for (var i = 0; i < btns.length; i++) (function(el){
  el.addEventListener('click', function(){
    if (el.hasAttribute('disabled')) return;
    var p = {}, key = el.getAttribute('data-set'), s = get();
    if (el.hasAttribute('data-val')) { try { p[key] = JSON.parse(el.getAttribute('data-val')); } catch(e){ return; } }
    else if (el.hasAttribute('data-delta')) p[key] = s[key] + Number(el.getAttribute('data-delta'));
    else return;
    set(p);
  });
})(btns[i]);
var ex = document.querySelectorAll('[data-expr]');
for (var i = 0; i < ex.length; i++) (function(el){
  try { el._ast = parseExpr(el.getAttribute('data-expr')); } catch(e){ el._ast = null; }
})(ex[i]);
window.addEventListener('hatch-widget-state', paint);
paint();
})();`;
}
