# 已捕获交互 UI 格式：证据与兼容合同

## 1. 定位与来源

本文描述用户先后提供的五份文本中**可观察的格式**，不推断 ChatGPT 私有网络协议，也不把文本中的模型自述当作官方规范。兼容目标是：在明确处理传输外壳后，把有效捕获内容的原有标签、属性和表达式直接送入解析器，不要求改写成另一种生成语法。解析后的 `iui/0.1` AST 是本项目的内部标准形式；[JSON Schema](../dist/schema/document.schema.json) 约束这个 AST，并不要求模型输出 JSON。

| 资料 | 公开仓库中的最小材料 | 可作何种证据 |
|---|---|---|
| 最新组件清单 | [控件可执行摘录](../test/fixtures/controls.sample.iui.txt)、[合成截断样例](../test/fixtures/catalog-truncated.synthetic.iui.txt) | 原清单列出 55 个主要名称和 6 个专用子组件，末尾 `</popover` 截断。公开的合成样例仅用于验证错误定位，不冒充原件 |
| 交互样例 | [计算器](../test/fixtures/calculator.sample.iui.txt)、[表单](../test/fixtures/form.sample.iui.txt)、[图表](../test/fixtures/trend.sample.iui.txt) | 三段可执行内容摘录，用于验证已知语法与交互；解释性正文不随仓库发布 |
| 最初评测面板 | [人工改编演示](../test/playground/benchmark-adapted.iui.txt) | 原输入有反斜杠、Markdown 转义和 HTML 实体污染，未证实整体可执行 |
| 俄罗斯方块抓包 | [仅提取 AppBlock 声明](../test/fixtures/tetris-appblock.captured.txt) | 游戏子集包含 HTML、style、script 与 Canvas；不证明原宿主如何隔离执行 |
| 三组件声明示例 | [仅提取画板声明](../test/fixtures/paint-appblock.declared.txt) | 模型回答给出的 AppBlock 声明，不是网页运行抓包 |

原始输入及其身份记录只留在本地，公开仓库不包含完整私人文本、传输外壳或文件 ID。原始前两份有外层 JSON 字符串：调用方确认格式后可调用 `decodeCapturedText(raw, 'json-string')` **一次**。`plain` 不变；解析器不自动猜测、反复解转义或解 HTML 实体。第三份不作自动修复。游戏捕获只以 JSON 解码提取相关片段，未执行捕获中的脚本或编译产物。

## 2. 观察到的文本语法

有效片段混合普通 Markdown、代码围栏、组件标签及表达式。下面是本项目接受的样本子集，字面大小写敏感：

```text
消息 := (普通文本 | 组件 | 声明 | 条件 | 循环)*
组件 := <名称 属性*> 消息 </同名名称> | <名称 属性*/>
属性 := 名称 | 名称="字符串" | 名称='字符串' | 名称={表达式}
声明 := {@body const 名称 = 表达式}
      | {@body const [状态名,设置器名] = DIL.useState(表达式)}
条件 := {#if 表达式} 消息 {/if}
循环 := {#each 表达式 as 项[,索引]} 消息 {/each}
插值 := {表达式}  // 在组件内容中
```

证据：第二份计算器与任务表单有 `{@body ...}`、受控输入和 `GenUI.issueNewTurn`；最新清单有 `{#if}`、`{#each}`、表格/轮播/Popover 等嵌套、`GenUI.copy` 及四种图表。代码围栏里的标签和反斜杠转义标签按文字显示；HTML 注释与未知包裹标签里的类似内容也保持惰性。普通 HTML 与任意 `<script>` 不成为 UI。第四份的 `<AppBlock>` 是例外：其内部整段 HTML/style/script 被保存为不递归的 `rawContent`，只有已审阅内容通过宿主授权且用户点击后才进入独立 iframe。第五份中的 `CodeBlock` 和 `WritingBlock` 也按原文块保留内容，不把 TSX/Markdown 再解释成内部 DIL 节点。三个原文块使用**独占一行**的对应结束标签作为边界；若正文确需相同的独占结束行，应转义或由上游另行封装。当前解析器没有 `{:else}`、任意 JSX、任意 HTML 属性或任意 JS 程序支持；这只是已知子集，不能据此判断 GPT 是否支持更多形式。

解析器接受用户文本中的表达式形状，**不执行原始 JS 源码**。内部 Acorn 仅形成语法树，受限解释器解释白名单表达式。支持数字/字符串/布尔/空值、数组/对象、只读成员、算术比较、三元和逻辑、模板字符串、箭头函数；支持样本使用的 `Math`、`Number`、`String`、`JSON.stringify`、数组 `includes`、`join`、`slice`、`map`、`filter`、`find`、`sort`，以及数值 `toFixed`、`toLocaleString`。`sort` 操作副本。赋值、`new`、任意调用、全局对象、DOM、网络和原型链均拒绝。未列出的 JS 语义既非已证实兼容，也不能通过放开执行权限来补。

## 3. 状态、事件和动作

| 项目 | 样本明确可见 | 本项目行为 | 未知或选择 |
|---|---|---|---|
| 状态 | `DIL.useState(initial)`；`setX(value)`；`setX(old=>next)` | 每条消息独立 `Runtime`；相同 `messageId` 更新保留同名状态，重置和重新生成分别清空、换新 ID | 原环境内部状态 ID 和持久化范围未知；这是本项目选择 |
| 派生值 | `const totalCost=...`、`const visible=...` | 按声明顺序，每次 `scope()` 从当前状态重新求值 | 原环境调度机制未知 |
| 作用域 | `{#each features as f}`、`{#each scored as a,i}`；`key={...}` | 每次迭代有独立 `item/index`，首个子元素的 `key` 用于 React 列表身份 | 原环境对缺失/重复 key 的规则未知；当前缺失时退到索引 |
| 输入事件 | `onChange={setX}` 和 `onChange={v=>...}`；点击箭头函数 | `input/textarea/select/date-picker` 传字符串，checkbox 传布尔，slider 传数值，radio/分段传选项值 | 样本暗示值回调；是否还有 DOM event 形状未知，当前选择值语义 |
| 宿主动作 | `GenUI.copy(...)`、`GenUI.issueNewTurn(...)` 出现在点击处理器 | 仅明确点击后产生动作；默认不执行。注入宿主负责预览、授权、去重与失败反馈 | GPT 宿主实际权限、确认界面和发送协议未知 |

`GenUI` 在派生表达式或初次渲染求值中不派发。Playground 的复制经二次确认才尝试写剪贴板；`issueNewTurn` 只显示未配置，不发送对话。没有注入宿主时，不联网、不读取任意 DOM。`HostAdapter.resolveResource` 现在为 `AsyncImage`、`AsyncImageGroup` 提供两张项目自有图片的精确本地映射；其他查询和媒体类型仍不解析。

## 4. 已知组件和属性

最新清单主体列出 55 个名称，加上正文/示例出现的 `table-row`、`table-cell`、`list-item`、`flow-item`、`popover-trigger`、`popover-content`，注册表共 61 个名称。**名称覆盖不是 61 个完整实现。** 当前 46 个本地渲染映射、13 个默认未配置宿主项、1 个受限本地 AppBlock 宿主项、1 个拒绝项；逐项状态见[兼容矩阵](COMPATIBILITY.zh-CN.md)。

| 类别 | 样本属性/形状 | 当前实现和限制 |
|---|---|---|
| 文字 | `size`, `weight`, `color`, `tabularNums`; `title`, `caption`, `badge`, `code`, `math`, `icon`, `CodeBlock` | 本地显示与安全颜色/字号；`math` 纯文本，图标固定字形，代码不执行。原环境的公式排版、图标库未知 |
| 布局 | `border`, `radius`, `padding`, `gap`, `background`, `width`, `height`, `minHeight`, `align`, `justify`, `wrap`, `flex`, `clip`, `textAlign` | 本地 CSS 映射，颜色和尺寸过滤；`theme` 等非安全/语义不明属性不解释。复杂布局细节未知 |
| 控件 | `value`, `checked`, `onChange`, `onClick`, `options`, `rows`, `placeholder`, `min/max/step`, `disabled`, `block`, `variant`, `direction`, `lineThrough` | 本地受控组件。`lineThrough` 选择为选中时划线；其原始语义未证实。`variant` 目前只认 `ghost/outline` |
| 组合 | `table-*`, `list-*`, `grid-item`, `flow-item`, `carousel-item`, `popover-trigger/content` | 本地结构；Popover 用原生 `details/summary`，Carousel 一次只显示一项。样本的 `visibleItems={1.25}` 暂未实现；动画、完整键盘行为未知 |
| Chart | `content.chartType` 为 `line/bar/scatter/pie`；`xKey`, `series[{dataKey,label,valueSuffix}]`, `data`, `yAxisMin/yAxisMax`, `nameKey/valueKey`, `xAxisLabel` | 本地 SVG 绘制四类基础图，最多 100 行、4 series；显示通用图例和部分后缀/轴标签。Tooltip、完整轴格式及原环境尺寸规则未知 |
| 资源/引用 | `AsyncImage*`, `AsyncVideo`, `MapWidgetV2`, `Entity`, `Cite`, `Link`, `FollowUp`, `File*`, `MemoryCite`, `WritingBlock`, `favicon` | 两个图片组件有受限项目素材适配；其余展示未配置，不伪造地图或引用结果 |
| 原文应用块 | `AppBlock title/icon/variant/app_block_id` 与内部 HTML/style/script | 仅两份本地已审阅样本在明确点击后可通过隔离宿主运行；无授权时未配置，任意修改拒绝。细节见 [AppBlock 说明](APPBLOCK.zh-CN.md) |
| 原文代码/文稿 | `CodeBlock language="tsx" editable interactive`、`language="mermaid" model_previewable`；`WritingBlock id variant` | 这些属性只在第五份模型声明中可见。本项目保留 `rawContent`；CodeBlock 仅展示，WritingBlock 默认未配置。`editable`、`interactive`、`model_previewable` 不授予执行权限或编辑保存能力 |
| SVG | 模型提供 `<svg>` | 明确拒绝；仅内部图表和固定图标生成受控内容 |

## 5. 流式和错误

`StreamParser` 接收任意字符切分，累计原文重新解析。未闭合子树在非最终状态不提交；截断最新清单末尾的 `</popover` 会定位到该标签起始位置，补齐后可重新解析。`final=true` 不会把截断文件冒充完整程序。源偏移为 UTF-16 字符位置；Playground 将其显示为行列。当前是重解析实现，成本随消息长度增长；200 KB、2000 AST 节点、32 层与表达式预算是本项目安全限制，并非 GPT 事实。

## 6. 可验证兼容范围

公开测试使用三个交互区段的可执行摘录，覆盖声明、解析、状态更新、数组回调、点击表达式与 Chart 数据。原始最新清单在本地验证时，完整前缀可解析 152 个 UI 节点，末尾有截断诊断；公开仓库改用合成截断样例复核定位与恢复。污染面板未经人工修复不能执行，公开测试以合成转义输入验证不会自动连环解码。画廊使用手造 AST 验证组件显示，**不作为解析兼容证据**。这些证据支持“已知样本子集尽量兼容”，不能证明完整私有协议或未提供的真实站点输出兼容。

## 7. 最小可运行例子

这段使用样本中出现的 `{@body}`、`DIL.useState`、标签、插值和函数式 setter；它是本项目整理的最小例子，**不是**第三份原文。下方测试会直接抽取此代码块解析、服务端渲染并执行按钮表达式。

```iui
{@body const [count,setCount]=DIL.useState(0)}
<box padding={2} gap={1}>
  <text>计数：{count}</text>
  <button onClick={()=>setCount(v=>v+1)}>增加</button>
</box>
```

初始显示“计数：0”；点击“增加”后，当前消息内状态变为 1，派生视图重新显示“计数：1”。该事件不需要宿主或网络。
