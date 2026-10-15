/**
 * @module muse-app-adapter
 *
 * open-intelligent-ui 的 Muse App 宿主适配器:把 DSL 文档编译成可在 Muse 聊天里
 * 渲染的 HTML widget 片段,状态经 window.hatchWidget 持久化。
 *
 * 用法见 README.md 与 packages/muse-app-adapter/SKILL.md。
 */
export { compileDslToWidget } from './compiler.js';
export type { CompileOptions, CompileResult, DerivedDecl } from './compiler.js';
export { MUSE_APP_THEME_CSS, DEFAULT_COMPONENT_CSS } from './theme.js';
export { createWidgetRuntime } from './runtime.js';
export type { WidgetRuntimeOptions } from './runtime.js';
export { evalNode, parseExpr, tokenize, fmt, fmtK, fmtCny } from './expr.js';
export type { ExprNode, ExprToken } from './expr.js';
