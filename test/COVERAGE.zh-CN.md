# 参考清单 → 组件展示覆盖表

来源：用户提供的最新组件清单；专用子组件单列。此表反映 v0.1 展示入口，不宣称原环境完整兼容。

| 组件名称 | 类别 | v0.1 状态 | 属性/限制 | 展示项 |
|---|---|---|---|---|
| `text` | 文字与内容 | 本地可用 | size, color, weight；长文本换行 | [查看](./#component-text) |
| `title` | 文字与内容 | 本地可用 | size: md/lg/xl | [查看](./#component-title) |
| `caption` | 文字与内容 | 本地可用 | color, size | [查看](./#component-caption) |
| `badge` | 文字与内容 | 本地可用 | color；default/success | [查看](./#component-badge) |
| `code` | 文字与内容 | 本地可用 | 内容；仅展示 | [查看](./#component-code) |
| `math` | 文字与内容 | 本地可用 | 内容；纯文本，无公式排版 | [查看](./#component-math) |
| `label` | 文字与内容 | 本地可用 | 内容；表单说明 | [查看](./#component-label) |
| `bold` | 文字与内容 | 本地可用 | 内容 | [查看](./#component-bold) |
| `italic` | 文字与内容 | 本地可用 | 内容 | [查看](./#component-italic) |
| `underline` | 文字与内容 | 本地可用 | 内容 | [查看](./#component-underline) |
| `strikethrough` | 文字与内容 | 本地可用 | 内容 | [查看](./#component-strikethrough) |
| `icon` | 文字与内容 | 本地可用 | name；固定图标集 | [查看](./#component-icon) |
| `box` | 布局与子组件 | 本地可用 | border, padding, gap, radius | [查看](./#component-box) |
| `row` | 布局与子组件 | 本地可用 | gap, justify, align, wrap | [查看](./#component-row) |
| `col` | 布局与子组件 | 本地可用 | gap, align | [查看](./#component-col) |
| `grid` | 布局与子组件 | 本地可用 | columns, gap | [查看](./#component-grid) |
| `flow` | 布局与子组件 | 本地可用 | gap, wrap | [查看](./#component-flow) |
| `card` | 布局与子组件 | 本地可用 | border, radius, padding | [查看](./#component-card) |
| `carousel` | 布局与子组件 | 本地可用 | activeIndex, onChange | [查看](./#component-carousel) |
| `table` | 布局与子组件 | 本地可用 | table-row 子项 | [查看](./#component-table) |
| `list` | 布局与子组件 | 本地可用 | list-item 子项 | [查看](./#component-list) |
| `divider` | 布局与子组件 | 本地可用 | 无 | [查看](./#component-divider) |
| `spacer` | 布局与子组件 | 本地可用 | flex 占位 | [查看](./#component-spacer) |
| `pressable` | 布局与子组件 | 本地可用 | onClick, disabled | [查看](./#component-pressable) |
| `popover` | 布局与子组件 | 本地可用 | trigger/content 子项 | [查看](./#component-popover) |
| `blockquote` | 文字与内容 | 本地可用 | 内容 | [查看](./#component-blockquote) |
| `carousel-item` | 布局与子组件 | 本地可用 | 需 carousel 容器 | [查看](./#component-carousel-item) |
| `grid-item` | 布局与子组件 | 本地可用 | 需 grid 容器 | [查看](./#component-grid-item) |
| `table-row` | 布局与子组件 | 本地可用 | 需 table 容器 | [查看](./#component-table-row) |
| `table-cell` | 布局与子组件 | 本地可用 | 需 table-row 容器 | [查看](./#component-table-cell) |
| `list-item` | 布局与子组件 | 本地可用 | 需 list 容器 | [查看](./#component-list-item) |
| `flow-item` | 布局与子组件 | 本地可用 | 需 flow 容器 | [查看](./#component-flow-item) |
| `popover-trigger` | 布局与子组件 | 本地可用 | 需 popover 容器 | [查看](./#component-popover-trigger) |
| `popover-content` | 布局与子组件 | 本地可用 | 需 popover 容器 | [查看](./#component-popover-content) |
| `button` | 输入与交互 | 本地可用 | onClick, disabled；点击反馈 | [查看](./#component-button) |
| `input` | 输入与交互 | 本地可用 | value, onChange, placeholder, disabled | [查看](./#component-input) |
| `textarea` | 输入与交互 | 本地可用 | value, onChange, rows, disabled | [查看](./#component-textarea) |
| `select` | 输入与交互 | 本地可用 | value, onChange, options | [查看](./#component-select) |
| `checkbox` | 输入与交互 | 本地可用 | checked, onChange, disabled | [查看](./#component-checkbox) |
| `radio-group` | 输入与交互 | 本地可用 | value, onChange, direction | [查看](./#component-radio-group) |
| `radio` | 输入与交互 | 本地可用 | value；需 radio-group | [查看](./#component-radio) |
| `slider` | 输入与交互 | 本地可用 | min, max, step, value, onChange | [查看](./#component-slider) |
| `date-picker` | 输入与交互 | 本地可用 | value, onChange | [查看](./#component-date-picker) |
| `segmented-control` | 输入与交互 | 本地可用 | value, options, onChange | [查看](./#component-segmented-control) |
| `Chart` | 可视化 | 本地可用 | content.chartType；line/bar/scatter/pie | [查看](./#component-Chart) |
| `CodeBlock` | 文字与内容 | 本地可用 | 内容；不执行 | [查看](./#component-CodeBlock) |
| `AsyncImage` | 媒体与地图（宿主） | 需宿主能力 | query, aspectRatio；需宿主可信资源 | [查看](./#component-AsyncImage) |
| `AsyncImageGroup` | 媒体与地图（宿主） | 需宿主能力 | query[]；需宿主可信资源 | [查看](./#component-AsyncImageGroup) |
| `AsyncVideo` | 媒体与地图（宿主） | 需宿主能力 | 参考仅有名称；视频接口待定义 | [查看](./#component-AsyncVideo) |
| `MapWidgetV2` | 媒体与地图（宿主） | 需宿主能力 | 参考仅有名称；地图接口待定义 | [查看](./#component-MapWidgetV2) |
| `favicon` | 媒体与地图（宿主） | 需宿主能力 | 参考仅有名称；图标接口待定义 | [查看](./#component-favicon) |
| `Entity` | 实体与引用（宿主） | 需宿主能力 | category, value；需实体解析 | [查看](./#component-Entity) |
| `Cite` | 实体与引用（宿主） | 需宿主能力 | 参考仅有名称；引用接口待定义 | [查看](./#component-Cite) |
| `Link` | 实体与引用（宿主） | 需宿主能力 | 参考仅有名称；链接接口待定义 | [查看](./#component-Link) |
| `FollowUp` | 实体与引用（宿主） | 需宿主能力 | 参考仅有名称；对话接口待定义 | [查看](./#component-FollowUp) |
| `FileCite` | 实体与引用（宿主） | 需宿主能力 | 参考仅有名称；文件接口待定义 | [查看](./#component-FileCite) |
| `FileNavList` | 实体与引用（宿主） | 需宿主能力 | 参考仅有名称；文件列表接口待定义 | [查看](./#component-FileNavList) |
| `MemoryCite` | 实体与引用（宿主） | 需宿主能力 | 参考仅有名称；记忆接口待定义 | [查看](./#component-MemoryCite) |
| `AppBlock` | 实体与引用（宿主） | 需宿主能力 | 参考仅有名称；应用沙箱接口待定义 | [查看](./#component-AppBlock) |
| `WritingBlock` | 文字与内容 | 需宿主能力 | 参考仅有名称；文稿编辑/保存合同待宿主定义 | [查看](./#component-WritingBlock) |
| `svg` | 可视化 | 未支持 | 任意 SVG 不接受 | [查看](./#component-svg) |

共 61 项；46 本地、14 宿主、1 未支持。
