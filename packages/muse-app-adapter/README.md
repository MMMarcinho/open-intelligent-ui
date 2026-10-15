# Muse App 宿主适配器

把 open-intelligent-ui DSL 文档编译成可在 **Muse 聊天（App / 网页）** 里渲染的 HTML widget 片段。零产品改动：Muse 团队不需要为此发版。

## 架构

```
DSL 文本 --parseDsl--> AST --compileDslToWidget--> HTML 片段 --widget.create_html_widget--> App 渲染
                              |                                            |
                        状态:DIL.useState <----------------------> window.hatchWidget (消息级持久)
                        表达式:{...}      <----------------------> widget 端白名单求值器(无 eval)
                        宿主动作:GenUI.issueNewTurn <------------> send_message 原生行 / 读 widget.state
```

在这个模型里，**agent 本人就是宿主适配器**：解析、编译、创建 widget 都由 agent 完成，DSL 是 agent 内部的中转格式，用户永远看不到它。这和 `packages/chrome-extension` 正好互补：扩展是"注入进不合作的宿主（第三方网页）"，本适配器是"在合作的沙盒（Muse App）里渲染"。

## 快速开始

```ts
import { compileDslToWidget } from 'open-intelligent-ui/muse-app-adapter';

const dsl = `{@body const [count,setCount]=DIL.useState(0)}
<box>
  <title>计数器</title>
  <text>当前 {count}</text>
  <button onClick={()=>setCount(previous=>previous+1)}>增加</button>
</box>`;

const { html, warnings } = compileDslToWidget(dsl, { messageId: 'msg-1' });
// html 传给 widget.create_html_widget / create_html_file_widget 即可渲染
```

完整可运行示例见 `examples/`（token 价格计算器：12 个模型、滑杆、预设按钮、实时计价）。

## API

### compileDslToWidget(dsl, options?)

- `messageId?: string` — 消息实例 id，默认 `'muse-widget-1'`。
- `hostData?: Record<string, unknown>` — 宿主静态数据（价格表、选项列表等），必须 JSON 可序列化，DSL 里按标识符引用。`select` 的 `options={IDENT}` 在编译期从这里解析。
- `themeCss?: string` — 覆盖默认 `muse` 主题映射层。
- `componentCss?: string` — 覆盖默认组件样式。
- `extraCss?: string` — 追加自定义样式。

返回 `{ html, stateDefaults, derived, warnings }`。`warnings` 是非致命问题（未知组件、不支持的事件形状、解析诊断），调用方应展示或记录。

## 支持的组件

| DSL | 说明 |
|---|---|
| `box` | 内容卡片 |
| `row` / `col` | 横向 / 纵向 flex 布局 |
| `title` / `text` | 标题 / 正文，`{expr}` 内联表达式 |
| `select` | 下拉，`options={IDENT}` 取自 `hostData` |
| `slider` | 滑杆，传数值（`min/max/step`） |
| `button` | `onClick` 只接受 `()=>setX(字面量)` 与 `()=>setX(prev=>prev±n)`，其他降级为禁用按钮 + warning |
| `divider` / `spacer` | 分隔线 / 留白 |

`{#if}` / `{#each}`、`input`、`checkbox` 等暂不支持（见路线图），遇到会记 warning 并跳过。

## 主题

`theme.ts` 导出两层：

1. `MUSE_APP_THEME_CSS` — 语义 token（`--iui-*`）到 Muse App 宿主变量（`--hatch-widget-*`）的映射层。换一个宿主，只需换这一层。
2. `DEFAULT_COMPONENT_CSS` — 组件默认样式，只引用 `--iui-*`，不直接碰宿主变量，深浅色自动适配。

`theme/muse-app.css` 与 `theme/components.css` 是生成的镜像文件（`tsx packages/muse-app-adapter/theme/export-css.ts`），单测会断言镜像与常量一致。

设计原则：accent 只用在小面积（徽标、滑杆填充、选中态），大面积靠文字层级与边框——浅色模式下大面积 pastel 容易显脏。

## 状态与反向通道

- `DIL.useState` 映射到 `window.hatchWidget.getState/setState`：消息级隔离、服务端持久化、随聊天历史回放。`setState` 是整体替换。
- 运行时以 bridge 为唯一真相源，不读 JS 闭包；监听 `hatch-widget-state` 事件重绘。
- agent 可用 `widget.state` 读取用户操作后的最新状态，形成"用户操作 → 发消息 → agent 读 state → 继续"的闭环。
- 更新 widget 没有热更新 API：创建新实例，旧 state 由 agent 读出后作为新实例种子迁移。

## 安全模型

- 编译器不执行 DSL 中的任何代码；文本全部转义后走 `textContent` 语义。
- 表达式走手写递归下降求值器（`expr.ts`），无 `eval`/`new Function`；拒绝方法调用、`constructor`/`__proto__`/`prototype`、未知标识符。`expr.ts` 的函数均为纯函数，经 `Function.toString` 序列化内联进 widget，无需打包器（约束见文件头注释）。
- 产物不含 `<form>`、localStorage/IndexedDB、外链可执行资源；远端图片需使用稳定的公开 URL（widget 随历史回放）。

## 限制

- HTML 1MB 上限，widget 必须自包含。
- HTML widget 没有直接发消息的 JS API；需要新一轮对话时，配 `send_message` 原生行，或等用户发消息后读 `widget.state`。
- 流式场景下更新等于重建，状态迁移由 agent 完成。

## 路线图

- `{#if}` / `{#each}`、条件渲染的增量更新
- `input` / `checkbox` / `segmented-control` 组件
- 图表组件的轻量 SVG 渲染
- 流式编译辅助（按 `StreamParser` 切片渐进创建 widget）

## 分发

给朋友用的入口是 `SKILL.md`：任何 Muse 用户说"照着这个 SKILL.md 用 open-intelligent-ui 做个 X"，他的 agent 读完就会了，不需要安装任何东西。
