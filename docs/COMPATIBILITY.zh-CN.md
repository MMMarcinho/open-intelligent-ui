# 组件兼容矩阵 v0.1

状态说明：**本地** = 有独立导出的 React 参考组件及当前已知子集行为，并非与原环境完整等价；**宿主** = 解析并保留名称/通用资源合同，默认显示未配置，未接真实服务；**未支持** = 明确拒绝或只按字面显示。名称来自用户提供的最新清单，包括列出的专用子组件。61 是注册表名称及画廊展示项数量，不是 61 个完成的组件。

本地 46 个名称分为 [文字](../ui/components/text/index.ts) 14、[布局](../ui/components/layout/index.ts) 20、[交互](../ui/components/interaction/index.ts) 11、[图表](../ui/components/visualization/index.ts) 1；由 [React 包入口](../packages/react-ui/index.ts)单独导出。导出名通常是协议名的 PascalCase；`col → Column`、`math → MathText`。`UIRenderer` 负责 AST 属性求值、事件绑定与组件分派。14 个宿主类名称中 13 个默认仅展示未配置，`AppBlock` 有独立的受限本地宿主接口；`svg` 1 项拒绝。

| 类别 | 名称 | 状态与限制 |
|---|---|---|
| 文本与排版 | `text`, `title`, `caption`, `badge`, `code`, `math`, `label`, `bold`, `italic`, `underline`, `strikethrough`, `icon`, `blockquote` | 本地。`math` 仅文本展示；`icon` 是固定符号集，不加载外部 SVG。Markdown 为安全子集。 |
| 布局与容器 | `box`, `row`, `col`, `grid`, `flow`, `card`, `carousel`, `table`, `list`, `divider`, `spacer`, `pressable`, `popover` | 本地。轮播使用活动索引，弹出框使用原生 details；复杂动画、虚拟滚动和完整无障碍行为未实现。 |
| 布局子组件 | `carousel-item`, `grid-item`, `table-row`, `table-cell`, `list-item`, `flow-item`, `popover-trigger`, `popover-content` | 本地。`popover-trigger` 由容器转为 summary。 |
| 交互输入 | `button`, `input`, `textarea`, `select`, `checkbox`, `radio-group`, `radio`, `slider`, `date-picker`, `segmented-control` | 本地受控组件。事件值语义和授权动作见协议文档。 |
| 可视化 | `Chart` | 本地折线、柱、散点、饼图，最多 100 数据点、4 series；基础坐标/图例，无完整 Tooltip 或复杂轴配置。 |
| 特殊内容 | `CodeBlock` | 本地代码原文展示；不执行 TSX 或 Mermaid。新增样本中的 `editable`、`interactive`、`model_previewable` 属性仅保留，不代表编辑器或预览能力已实现。 |
| 特殊宿主块 | `WritingBlock` | 宿主。参考仅有名称；编辑与保存合同待定义，默认未配置。 |
| 媒体与地理 | `AsyncImage`, `AsyncImageGroup`, `AsyncVideo`, `MapWidgetV2`, `favicon` | 宿主。需可信资源解析；默认未配置，不伪造图片、地图或视频。 |
| 数据与引用 | `Entity`, `Cite`, `Link`, `FollowUp`, `FileCite`, `FileNavList`, `MemoryCite` | 宿主。需实体/引用/文件标识与权限解析；默认未配置。 |
| 特殊宿主块 | `AppBlock` | 本地受限宿主已实现：不递归保存 HTML/style/script，明确点击后，只有精确匹配两份已审阅样本才提供隔离 iframe；默认无授权或修改后不运行。`sandbox="allow-scripts"` 且无 `allow-same-origin`，CSP 拒网；停止/重启销毁并重建。样式是本项目适配，不声称还原 GPT 内部实现；无法严格限制恶意 CPU 循环。详见 [AppBlock 说明](APPBLOCK.zh-CN.md)。 |
| 原始矢量 | `svg` | 未支持模型提供的 SVG。固定图标与 `Chart` 自行生成安全 SVG。 |

组件注册表在 `protocol/registry.ts` 可读、可扩展。新增组件应先决定本地/宿主/未支持状态、属性白名单与安全处理，再更新 schema、测试和矩阵；不可用静态外观替代真实交互并标记为成功。
