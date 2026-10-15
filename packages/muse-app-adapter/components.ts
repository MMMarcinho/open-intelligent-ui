/**
 * DSL AST -> HTML 片段的组件渲染器。
 *
 * v1 支持的白名单组件:box row col title text select slider button divider spacer。
 * 未知组件与 {#if}/{#each} 记 warning 并跳过(路线图见 README)。
 *
 * 约定:
 * - 所有文本走 esc() 转义,表达式走 <span data-expr> 由 widget 端求值器计算。
 * - value={ident} 绑定状态,data-bind 由运行时接线;onChange 只做结构确认。
 * - button 的 onClick 只接受白名单形状,其他一律降级为禁用按钮 + warning。
 */
import type { Node as AstNode, Attribute } from '../../protocol/types.js';
import { evalNode, parseExpr } from './expr.js';

export interface RenderContext {
  hostData: Record<string, unknown>;
  warnings: string[];
}

export function esc(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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

function renderButton(node: El, ctx: RenderContext): string {
  const kids = (node.children || []).map(n => renderNode(n, ctx)).join('');
  const oc = (exprAttr(node, 'onClick') || '').replace(/\s+/g, '');
  const m = /^\(\)=>set([A-Za-z_]\w*)\(([\s\S]*)\)$/.exec(oc);
  const disabled = litAttr(node, 'disabled') === 'true' || node.attributes?.['disabled']?.value === true;
  if (!m) {
    ctx.warnings.push(`button onClick 形状不支持,已降级为禁用按钮:${oc.slice(0, 60)}`);
    return `<button class="tui-chip" disabled>${kids}</button>`;
  }
  const key = m[1].charAt(0).toLowerCase() + m[1].slice(1);
  const arg = m[2];
  const delta = /^(prev|previous)=>(prev|previous)([+-])(\d+(?:\.\d+)?)$/.exec(arg);
  if (delta) {
    const sign = delta[3] === '+' ? 1 : -1;
    const step = Number(delta[4]) * sign;
    return `<button class="tui-chip" data-set="${esc(key)}" data-delta="${step}"${disabled ? ' disabled' : ''}>${kids}</button>`;
  }
  const value = evalLiteral(arg);
  if (value === undefined || typeof value === 'object') {
    ctx.warnings.push(`button onClick 参数不支持,已降级为禁用按钮:${arg.slice(0, 60)}`);
    return `<button class="tui-chip" disabled>${kids}</button>`;
  }
  return `<button class="tui-chip" data-set="${esc(key)}" data-val='${esc(JSON.stringify(value))}'${disabled ? ' disabled' : ''}>${kids}</button>`;
}

function renderSelect(node: El, ctx: RenderContext): string {
  const bind = exprAttr(node, 'value') || '';
  const optsKey = exprAttr(node, 'options') || '';
  const opts = ctx.hostData[optsKey];
  const disabled = node.attributes?.['disabled']?.value === true;
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
  return `<select class="tui-select" data-bind="${esc(bind)}"${disabled ? ' disabled' : ''}>${options}</select>`;
}

function renderSlider(node: El, ctx: RenderContext): string {
  const bind = exprAttr(node, 'value') || '';
  const num = (n: string): string => {
    const e = exprAttr(node, n);
    if (e === null) return '';
    const v = evalLiteral(e);
    return typeof v === 'number' ? String(v) : '';
  };
  const disabled = node.attributes?.['disabled']?.value === true;
  return `<input type="range" class="tui-slider" data-bind="${esc(bind)}" min="${num('min')}" max="${num('max')}" step="${num('step') || '1'}"${disabled ? ' disabled' : ''}/>`;
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
