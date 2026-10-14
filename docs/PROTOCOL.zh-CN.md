# Open Intelligent UI 协议 v0.1

用户提供文本的逐项证据、兼容边界与未知项见[已捕获格式说明](CAPTURED_FORMAT.zh-CN.md)。本协议的 JSON AST 是内部归一化结果；有效捕获文本无需改写成 JSON 才能解析。

## 目标与边界

这是我们自己的版本化协议。外部可以生成严格 JSON AST，也可由当前适配器读取 Markdown 与受限标签 DSL，再归一化为同一个 `Document`。输入一律视为不可信数据。参考文本中的模型自述只说明样例意图，不定义本协议语法或真实 ChatGPT 接口。

消息实例采用 `messageId` 隔离；文档根为 `protocol: "iui/0.1"`、`messageId`、`declarations`、`children`、`diagnostics`、`complete`。节点为 `text`、`expression`、`element`、`if`、`each`。属性为字面量或表达式；所有节点与属性带原文 `span.start/end`（UTF-16 字符偏移）。导出的 [JSON Schema](../dist/schema/document.schema.json) 描述结构，`validateDocument` 另做运行时结构检查。语义错误须在表达式解释和组件注册表阶段反馈。

## DSL 语法

```text
文档 := (Markdown文本 | 组件 | 状态声明 | 条件 | 循环)*
组件 := <白名单名称 属性*> 文档 </同名> | <白名单名称 属性*/>
属性 := 名称 | 名称="文本" | 名称={受限表达式}
状态声明 := {@body const [name,setName]=DIL.useState(表达式)}
派生声明 := {@body const name=表达式}
条件 := {#if 表达式} 文档 {/if}
循环 := {#each 表达式 as item[,index]} 文档 {/each}
表达式文本 := {表达式}   // 在组件内部
```

普通 Markdown 代码围栏、行内代码、HTML 注释、未知标签包裹内容和反斜杠转义的标签保持惰性。不会执行 HTML、脚本或不在注册表内的组件。Markdown 渲染只实现安全子集：粗体、斜体、删除线、行内/围栏代码和经过 URL 过滤的绝对 http(s) 链接；其余文本按字面显示。属性中的 `{@body ...}` 不合法。v0.1 没有 `{:else}`、可变变量、完整 JSX/JS、任意 CSS、任意 SVG 或浏览器脚本。

外层字符串封装可由输入调用方明确做**一次** `JSON.parse`。解析器不会自动猜测多层转义，不会解码 HTML 实体，更不会 `eval`。污染样例需由来源修正或人工确认后再适配。

## 语义与状态

声明按出现顺序求值。`DIL.useState` 在同一消息首次挂载时初始化，之后由状态仓库保存；派生值每次渲染依据最新状态重新计算。`setX(value)` 与 `setX(previous => next)` 支持。循环的 `item,index` 只在本次迭代子树可见；子节点 `key` 优先作为 React 身份，缺失时使用迭代序号，列表重排宜提供稳定 key。

编辑或追加**同一** `messageId` 的源文本时，已有同名状态保留；新增状态按声明初始化。显式“重置状态”清空当前实例后重新初始化。重新生成使用新 `messageId`，从初始状态开始。切换会话或消息创建独立 `Runtime`；不能在站点适配器中把不同消息复用同一实例。主题切换不改变这些规则。

输入事件传值：`input`、`textarea`、`select`、`date-picker` 为字符串；`checkbox` 为布尔值；`slider` 为数值；`radio`、`segmented-control` 为选项值。事件只在用户实际操作后交给运行时。派生值中的 `GenUI` 不会派发宿主动作。

## 受限表达式与动作

使用 Acorn **只解析** JS 形状的表达式，随后由 `SafeEvaluator` 解释白名单 AST。支持字面量、数组和对象、只读属性、算术/比较/逻辑/三元、模板字符串、箭头函数、数组 `includes/join/slice/map/filter/find/sort`、数值格式化、`Math.max/min/round/floor/ceil/abs`、`Number`、`String`、`JSON.stringify`。`sort` 操作副本。拒绝 `new`、赋值、任意函数调用、原型链、`constructor`、全局对象、DOM 和网络 API。最大输入 200 KB、2000 节点、32 层、每次表达式 5000 步、数组 1000 项、动作字符串 8 KB。资源预算错误产生诊断或运行时反馈；未来部署可按宿主需要进一步收紧。

`GenUI.copy(text)`、`GenUI.issueNewTurn(text)` 只在事件中生成 `HostAction`。默认适配器不执行；宿主提供 `requestAction` 并负责预览、用户确认、按 `id` 去重、权限、失败反馈。playground 的 copy 在用户再次确认后尝试写剪贴板；发起新对话仅显示未配置，不发送消息。资源查询由 `resolveResource` 合同交给授权宿主；无解析器时显示“宿主未配置”。当前项目图片宿主仅接受 `iui:readme-banner` 与 `iui:extension-icon` 两个精确查询，返回项目自有素材；不得从其他查询词推断或伪造来源。这是本项目的受限 host 实现，并不声称与原宿主的完整图片搜索等价。

## 流式与诊断

`StreamParser.append(chunk, final)` 可接收任意跨字符切分。每次从累计原文重新解析，未闭合子树在非最终状态不提交，避免半个标签变成交互控件。`final=true` 时保留已完成内容，并标记不完整标签、声明、指令或未闭合节点的范围；补齐后可重新解析恢复。v0.1 的复杂度随流入字符数增加；大规模长消息可后续改为真正增量词法器，不改变 AST 合同。

## 宿主适配与安全

`services/site-adapter.ts` 定义站点适配器及消息正文合同，`services/adapter-registry.ts` 注册多站点适配器，`services/reply-coordinator.ts` 管理 DOM 观察、去重、实例与恢复；`services/reply-view.tsx` 独立装配 React 渲染。DeepSeek 的 DOM 识别与富文本还原仅在 `services/adapters/deepseek.ts`。当前 Chrome MV3 扩展只基于保存页静态证据适配 DeepSeek，尚未在真实账号页面验证；`services/interception.ts` 仍是未配置的请求拦截合同。每条有效回复使用独立运行时，完整更新保留状态，重新生成与会话切换重建实例。细节见 [DeepSeek 扩展验证记录](DEEPSEEK_EXTENSION.zh-CN.md)。

`AppBlock`、`CodeBlock`、`WritingBlock` 可携带不递归的 `rawContent` 字符串；其结束标签须独占一行。`CodeBlock` 只按原文展示，`WritingBlock` 默认待宿主接入。`AppBlock` 需要用户点击后由 `HostAdapter.authorizeAppBlock` 返回已审阅 HTML；默认没有适配器时不创建 iframe。本地两份样本、CSP 和剩余安全边界见 [AppBlock 说明](APPBLOCK.zh-CN.md)。

模型提供的 URL 只接受绝对 http(s)，拒绝 `javascript:`、`data:`、`blob:` 和相对地址。受信任的图片宿主可以返回构建时打包的 PNG data URL；模型无法把任意 data URL 直接变成图片。模型的任意 `svg` 标记不渲染；图表和固定图标内部生成受控 SVG。颜色/尺寸属性限于白名单语义值或严格格式；主题覆盖另有校验。React 不使用 `dangerouslySetInnerHTML`。
