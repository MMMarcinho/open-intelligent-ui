/**
 * compileDslToWidget:把 open-intelligent-ui DSL 文档编译成 Muse HTML widget 片段。
 *
 * 流程:
 * 1. parseDsl(项目自带) 解析并校验,未 complete 或有 diagnostics 时记 warning。
 * 2. 提取 DIL.useState 声明 -> widget 状态种子;{@body const x=expr} -> 派生声明。
 * 3. AST -> HTML(components.ts),表达式保留为 <span data-expr> 由 widget 端求值。
 * 4. 组装 <style>(主题 + 组件样式)+ <div class="tui"> + <script>(运行时)。
 *
 * 安全:本函数不执行 DSL 中的任何代码;事件形状由白名单校验;文本全部转义。
 */
import { parseDsl } from '../../protocol/parser.js';
import type { Document } from '../../protocol/types.js';
import { evalLiteral, renderNode, type RenderContext } from './components.js';
import { createWidgetRuntime } from './runtime.js';
import { DEFAULT_COMPONENT_CSS, MUSE_APP_THEME_CSS } from './theme.js';

export interface CompileOptions {
  /** 消息实例 id,默认 'muse-widget-1'。 */
  messageId?: string;
  /** 宿主静态数据(PRICES/FX/选项列表等),必须 JSON 可序列化,DSL 按标识符引用。 */
  hostData?: Record<string, unknown>;
  /** 覆盖默认 muse 主题映射层。 */
  themeCss?: string;
  /** 覆盖默认组件样式。 */
  componentCss?: string;
  /** 追加的自定义样式(示例的特殊排版放这里)。 */
  extraCss?: string;
}

export interface DerivedDecl { name: string; src: string }

export interface CompileResult {
  /** 完整的 widget HTML 片段,可直接传给 widget.create_html_widget。 */
  html: string;
  /** DIL.useState 初值,即 getState 的种子。 */
  stateDefaults: Record<string, unknown>;
  /** 派生声明(按 DSL 顺序),widget 端依次求值。 */
  derived: DerivedDecl[];
  /** 非致命问题(未知组件、不支持的事件形状、解析诊断等)。 */
  warnings: string[];
}

export function compileDslToWidget(dsl: string, options: CompileOptions = {}): CompileResult {
  const warnings: string[] = [];
  const doc: Document = parseDsl(dsl, options.messageId ?? 'muse-widget-1');
  if (!doc.complete) warnings.push('DSL 解析未 complete,输出可能不完整');
  for (const d of doc.diagnostics) warnings.push(`parse ${d.code}: ${d.message}`);

  const stateDefaults: Record<string, unknown> = {};
  const derived: DerivedDecl[] = [];
  for (const decl of doc.declarations) {
    if (decl.state && decl.setter) {
      const v = evalLiteral(decl.expression);
      if (v === undefined) warnings.push(`useState 初值无法求值:${decl.name},已用 null 代替`);
      stateDefaults[decl.name] = v === undefined ? null : v;
    } else if (!decl.state) {
      derived.push({ name: decl.name, src: decl.expression });
    }
  }

  const ctx: RenderContext = { hostData: options.hostData ?? {}, warnings };
  const body = doc.children.map(n => renderNode(n, ctx)).join('');

  const script = createWidgetRuntime({
    hostData: options.hostData ?? {},
    derived,
    defaults: stateDefaults,
  });

  const html =
    `<style>${options.themeCss ?? MUSE_APP_THEME_CSS}\n${options.componentCss ?? DEFAULT_COMPONENT_CSS}` +
    `${options.extraCss ? '\n' + options.extraCss : ''}</style>\n` +
    `<div class="tui"><div class="tui-bar"></div><div class="tui-body">${body}</div></div>\n` +
    `<script>\n${script}\n</script>`;

  return { html, stateDefaults, derived, warnings };
}
