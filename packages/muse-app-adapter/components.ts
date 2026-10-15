/**
 * DSL AST -> HTML 片段的组件渲染器。
 *
 * v1 支持的白名单组件:box row col title text select slider button divider spacer。
 * 未知组件与 {#if}/{#each} 记 warning 并跳过(路线图见 README)。
 *
 * 约定:
 * - 所有文本走 esc() 转义,表达式走 <span data-expr> 由 widget 端求值器计算。
 * - value={ident} 绑定显示状态,onChange 按声明的 setter 映射接线。
 * - button 的 onClick 只接受白名单形状,其他一律降级为禁用按钮 + warning。
 */
import type { Node as AstNode, Attribute } from '../../protocol/types.js';
import { parseExpressionAt } from 'acorn';
import { evalNode, parseExpr } from './expr.js';

export interface RenderContext {
  hostData: Record<string, unknown>;
  warnings: string[];
  setters?: ReadonlyMap<string, string>;
}

export function esc(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function litAttr(node: Extract<AstNode, { kind: 'element' }>, name: string): string {
  const a: Attribute | undefined = node.attributes?.[name];
  return a && a.kind === 'literal' ? String(a.value) : '';
}

function exprAttr(node: Extract<AstNode, { kind: 'element' }>, name: string): string | null {
  const a: Attribute | undefined = node.attributes?.[name];
  return a && a.kind === 'expression' ? String(a.value) : null;
}

/** 编译期求字面量初值(字符串/数字/布尔),失败返回 undefined。 */
export function evalLiteral(src: string): unknown {
  try {
    return evalNode(parseExpr(src), {});
  } catch {
    return undefined;
  }
}

type El = Extract<AstNode, { kind: 'element' }>;

/** Parse event syntax without executing it. Only explicitly supported shapes are wired. */
function eventExpr(source: string): any {
  const node = parseExpressionAt(source, 0, { ecmaVersion: 'latest' });
  if (source.slice(node.end).trim()) throw new Error('unexpected event suffix');
  return node;
}

function disabledAttr(node: El): boolean {
  const attr = node.attributes?.disabled;
  return !!attr && (attr.kind === 'expression' ? evalLiteral(String(attr.value)) === true : attr.value === true || attr.value === 'true');
}

function changeBinding(node: El, ctx: RenderContext): string {
  const bind = (exprAttr(node, 'value') || '').trim();
  try {
    const handler = eventExpr(exprAttr(node, 'onChange') || '');
    let setter = handler;
    if (handler.type === 'ArrowFunctionExpression' && !handler.async && handler.params.length === 1 &&
        handler.params[0].type === 'Identifier' && handler.body.type === 'CallExpression' &&
        handler.body.arguments.length === 1 && handler.body.arguments[0].type === 'Identifier' &&
        handler.body.arguments[0].name === handler.params[0].name) setter = handler.body.callee;
    const key = setter.type === 'Identifier' ? ctx.setters?.get(setter.name) : undefined;
    if (key === undefined || ![...(ctx.setters?.values() || [])].includes(bind)) throw new Error('unsupported binding');
    return ` data-change="${esc(key)}"`;
  } catch {
    ctx.warnings.push(`${node.name} onChange 形状不支持,已禁用控件`);
    return ' disabled';
  }
}

function renderButton(node: El, ctx: RenderContext): string {
  const kids = (node.children || []).map(n => renderNode(n, ctx)).join('');
  const source = exprAttr(node, 'onClick') || '';
  const disabled = disabledAttr(node) ? ' disabled' : '';
  try {
    const handler = eventExpr(source);
    if (handler.type !== 'ArrowFunctionExpression' || handler.async || handler.params.length !== 0 ||
        handler.body.type !== 'CallExpression') throw new Error('unsupported handler');
    const call = handler.body;
    const key = call.callee.type === 'Identifier' ? ctx.setters?.get(call.callee.name) : undefined;
    if (key === undefined || call.arguments.length !== 1) throw new Error('unknown setter');
    const arg = call.arguments[0];
    if (arg.type === 'ArrowFunctionExpression' && !arg.async && arg.params.length === 1 &&
        arg.params[0].type === 'Identifier' && arg.body.type === 'BinaryExpression' &&
        arg.body.left.type === 'Identifier' && arg.body.left.name === arg.params[0].name &&
        ['+', '-'].includes(arg.body.operator) && arg.body.right.type === 'Literal' &&
        typeof arg.body.right.value === 'number' && Number.isFinite(arg.body.right.value)) {
      const step = arg.body.right.value * (arg.body.operator === '+' ? 1 : -1);
      return `<button class="tui-chip" data-set="${esc(key)}" data-delta="${step}"${disabled}>${kids}</button>`;
    }
    const value = evalLiteral(source.slice(arg.start, arg.end));
    if (value === undefined || typeof value === 'object' || (typeof value === 'number' && !Number.isFinite(value))) throw new Error('unsupported value');
    return `<button class="tui-chip" data-set="${esc(key)}" data-val='${esc(JSON.stringify(value))}'${disabled}>${kids}</button>`;
  } catch {
    ctx.warnings.push(`button onClick 形状或参数不支持,已降级为禁用按钮:${source.slice(0, 60)}`);
    return `<button class="tui-chip" disabled>${kids}</button>`;
  }
}

function renderSelect(node: El, ctx: RenderContext): string {
  const bind = (exprAttr(node, 'value') || '').trim();
  const optsKey = (exprAttr(node, 'options') || '').trim();
  const opts = ctx.hostData[optsKey];
  const disabled = disabledAttr(node);
  const change = changeBinding(node, ctx);
  let options = '';
  if (Array.isArray(opts)) {
    options = opts
      .map(o => {
        const v = (o as Record<string, unknown>)['value'];
        const l = (o as Record<string, unknown>)['label'];
        return `<option value="${esc(String(v))}">${esc(String(l))}</option>`;
      })
      .join('');
  } else {
    ctx.warnings.push(`select options="${optsKey}" 在 hostData 中不是数组,下拉为空`);
  }
  return `<select class="tui-select" data-bind="${esc(bind)}"${change}${disabled ? ' disabled' : ''}>${options}</select>`;
}

function renderSlider(node: El, ctx: RenderContext): string {
  const bind = (exprAttr(node, 'value') || '').trim();
  const num = (n: string): string => {
    const attr = node.attributes?.[n];
    if (!attr) return '';
    const v = attr.kind === 'expression' ? evalLiteral(String(attr.value)) : Number(attr.value);
    return typeof v === 'number' ? String(v) : '';
  };
  const disabled = disabledAttr(node);
  const change = changeBinding(node, ctx);
  return `<input type="range" class="tui-slider" data-bind="${esc(bind)}"${change} min="${num('min')}" max="${num('max')}" step="${num('step') || '1'}"${disabled ? ' disabled' : ''}/>`;
}

function renderElement(node: El, ctx: RenderContext): string {
  const kids = (node.children || []).map(n => renderNode(n, ctx)).join('');
  const cls = litAttr(node, 'class');
  const extra = cls ? ` ${esc(cls)}` : '';
  switch (node.name) {
    case 'box':
      return `<div class="tui-card${extra}">${kids}</div>`;
    case 'row':
      return `<div class="tui-row${extra}">${kids}</div>`;
    case 'col':
      return `<div class="tui-col${extra}">${kids}</div>`;
    case 'title':
      return `<h3 class="tui-title${extra}">${kids}</h3>`;
    case 'text':
      return `<div class="tui-text${extra}">${kids}</div>`;
    case 'divider':
      return `<div class="tui-divider${extra}"></div>`;
    case 'spacer':
      return `<div class="tui-spacer${extra}"></div>`;
    case 'select':
      return renderSelect(node, ctx);
    case 'slider':
      return renderSlider(node, ctx);
    case 'button':
      return renderButton(node, ctx);
    default:
      ctx.warnings.push(`未知组件 <${node.name}>,已跳过`);
      return '';
  }
}

export function renderNode(node: AstNode, ctx: RenderContext): string {
  switch (node.kind) {
    case 'text':
      return node.text.trim() === '' ? '' : esc(node.text);
    case 'expression':
      return `<span class="tui-x" data-expr="${esc(node.source)}"></span>`;
    case 'element':
      return renderElement(node, ctx);
    case 'if':
    case 'each':
      ctx.warnings.push(`<${node.kind}> 暂不支持,已跳过(路线图见 README)`);
      return '';
  }
}
