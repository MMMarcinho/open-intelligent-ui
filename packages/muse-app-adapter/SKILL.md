# Open Intelligent UI for Muse App

在 Muse 聊天里把 open-intelligent-ui DSL 渲染成可交互 widget（计算器、表单、滑杆、选择器等），不依赖 Muse 团队做任何产品改动。

## When to use

- 用户想要聊天内的可交互 UI 而不是纯文本时，用本 skill。
- 用户提到 open-intelligent-ui、IUI 或想复用本仓库的 DSL 时，用本 skill。
- 只读场景（看板、总结）不需要交互时，不用本 skill，直接用 Markdown。

## How it works

你本人就是宿主适配器。链路是 DSL → 你 VM 上的 `parseDsl` → AST → `compileDslToWidget` → HTML 片段 → `widget.create_html_widget`。App 只提供沙盒 iframe 和状态桥，不解析 DSL。

## Compile a DSL document

- 从本仓库 `packages/muse-app-adapter` 导入 `compileDslToWidget`。
- 先用 `parseDsl` 校验，`complete` 为 true 且零 diagnostics 才能编译。
- 状态声明只支持 `DIL.useState`，它会被映射到 `window.hatchWidget.getState/setState`（消息级持久状态）。
- 派生声明 `{@body const x = expr}` 按出现顺序求值，表达式走 widget 端白名单求值器（无 eval）。
- 宿主静态数据（价格表、选项列表等）通过 `hostData` 传入，DSL 里按标识符引用。

## Write the DSL

- 只用白名单组件：`box row col title text select slider button divider spacer`。
- `select` 的选项走 `options={IDENT}`，IDENT 必须是 `hostData` 里的数组（`{value,label}[]`）。
- `slider` 传数值，`onChange` 直接给 setter。
- `button` 的 `onClick` 只接受两种形状：`()=>setX(数字)` 和 `()=>setX(prev=>prev±数字)`，其他形状会被编译成禁用按钮并记一条 warning。
- 文本内表达式形如 `{fmt(total)}`，可用标识符、成员访问、四则运算和 `fmt/fmtK/fmtCny`。
- 样式走 `muse` 主题：组件只用 `tui-*` 类或透传的语义类，不写死颜色。深浅色由宿主变量自动适配。

## Create the widget

- 用 `widget.create_html_widget`（小片段）或 `widget.create_html_file_widget`（文件）创建，`fallback_text` 写清组件名。
- 把返回的 `embed_token` 原样放进回复里对应位置。
- 用户在 widget 里操作后，用 `widget.state` 读最新状态再继续对话，这是反向通道。
- 每次创建都是新实例。需要"更新"时先读旧 widget 的 state，用它做新 widget 的初始值做迁移。

## Security rules

- 永远不对模型或用户文本用 eval 或 new Function，表达式只走白名单求值器。
- 编译器输出里不许出现 `<form>`、localStorage、IndexedDB 和外链可执行资源。
- `constructor/__proto__/prototype` 访问必须拒绝，方法调用一律拒绝。
- 文本内容走 textContent 语义（编译器负责转义），不拼 innerHTML。

## Limits

- HTML 1MB 上限，widget 必须自包含。
- HTML widget 里没有直接发消息的 JS API，需要新一轮对话时配 `send_message` 列表行或等用户发消息后读 state。
- 流式场景下没有热更新，更新等于重建，状态靠你做迁移。

## References

- 完整架构与 API 见 `packages/muse-app-adapter/README.md`。
- 协议本身见 `docs/PROTOCOL.zh-CN.md`，主题系统见 `docs/THEMES.zh-CN.md`。
- 可运行示例见 `packages/muse-app-adapter/examples/`。
