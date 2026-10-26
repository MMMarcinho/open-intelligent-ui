# 当前能力与适配范围

本文以当前源码和测试为准。**能识别标签**、**能渲染组件**、**能调用宿主能力**是三件不同的事；[完整组件清单](COMPATIBILITY.zh-CN.md)中的“本地”只表示 React 参考实现，不表示每个适配器都实现了相应宿主服务。协议细节见[协议说明](PROTOCOL.zh-CN.md)。

## 通用 IUI v0.1

- 解析消息里的白名单标签及属性、组件内 `{表达式}`、`{@body const x=表达式}`、`{@body const [x,setX]=DIL.useState(初值)}`、`{#if}` 和 `{#each}`。普通 Markdown 可与多个 UI 根混排；代码围栏、行内代码、注释、转义标签和未知标签内容保持惰性。原始 `AppBlock`、`CodeBlock`、`WritingBlock` 的内容不递归解析。
- React 运行时按消息实例保存状态，支持直接和函数式 setter；受限表达式解释器支持常见运算、条件、数组处理与格式化，拒绝任意 JS、DOM、网络和 shell。控件的事件仅在用户操作时求值。`StreamParser` 可投影语法完整的前缀，未完成的标签或表达式不执行。
- React 渲染器实现[兼容矩阵](COMPATIBILITY.zh-CN.md)所列 46 个本地名称的**当前子集行为**，包括文本、布局、表单控件、基础 `Chart` 和只展示原文的 `CodeBlock`。这不是完整的同名产品组件，也不保证全部属性、动画或无障碍行为等价。
- `GenUI.copy(text)` 与 `GenUI.issueNewTurn(text)` 只能在事件中形成宿主动作；是否执行取决于适配器是否提供 `HostAdapter.requestAction`。`resolveResource` 和 `authorizeAppBlock` 也必须由宿主单独提供。解析器识别宿主类名称不代表能查询图片、操作文件、运行代码或发送消息。

## 各环境实际接线

| 能力 | DeepSeek 网页 + Chrome 扩展 | DeepSeek Harness Web / Desktop | Muse App / Web widget |
| --- | --- | --- | --- |
| 消息中的 DSL 与普通文字混排 | 支持，依据 DeepSeek 助手正文 DOM | 支持，按 dsh 助手文本块渲染 | 由 agent 编译 DSL 为独立 widget；不是自动替换聊天正文 |
| React 本地组件与状态 | 支持当前子集，消息实例内保存 | 支持当前子集，文本块内保存 | **仅 10 个标签的编译子集**；状态由 `hatchWidget` 桥保存 |
| 流式 UI | 完整安全前缀预览 | 完整安全前缀预览，保留已有状态 | 无同一 widget 的增量更新；重建需迁移状态 |
| 异步媒体 | 两个精确项目图片查询，非通用搜索 | 明确的本地 PNG/JPEG/WebP/GIF 路径、HTTP(S) URL、当前助手消息的原生图片附件；`AsyncImageGroup` 支持本地轮播，不搜索图片 | 未实现 IUI 异步媒体合同 |
| `AppBlock` | 未接授权宿主，不能运行 | 未接授权宿主，不能运行 | 未实现 |
| 复制、回传会话、本机系统动作 | 未接 | 未接 | widget 不直接发消息；未接系统动作 |

DeepSeek 扩展的图片映射只通过 `AsyncImage` 的 `resolveResource` 合同；`AsyncImageGroup` 会复用内部图片渲染，但不是通用图片搜索。Playground 是另外的参考宿主，支持受限的已审阅 `AppBlock` 与经再次确认的复制动作，不能据此推断上述适配器也支持。

具体安装、限制和验证范围见 [DeepSeek 网页适配器](../packages/chrome-extension/README.md)、[dsh 插件](../packages/dsh-plugin/README.md)、[Muse 适配器](../packages/muse-app-adapter/README.md)。
