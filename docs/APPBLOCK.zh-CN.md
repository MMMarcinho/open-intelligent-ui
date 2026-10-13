# AppBlock 受限本地宿主

## 证据与结论

第四份资料的抓包流中，assistant 消息明确给出 `<AppBlock title="俄罗斯方块" …>`，内部是 HTML、CSS 和 JavaScript：Canvas 绘制、`requestAnimationFrame` 自动下落、键盘与指针按钮、碰撞/旋转、消行计分、暂停与重开。捕获外壳还有 DIL 编译相关字段，但本项目没有执行它们，也不能据此推断 GPT 私有渲染链路。网页能运行这个游戏，是因为浏览器提供 Canvas、计时帧、事件和隔离文档；基础 DIL 标签本身不会自动赋予游戏循环。

第五份资料是一条模型回答，其中 CodeBlock、WritingBlock 与画板 AppBlock **都包在 Markdown 代码围栏**，用作可复制的声明示例。整条回答输入解析器时只会显示代码，不会运行画板。工作台显式提取画板声明作为第二个样本；它证明本地受限宿主可处理另一个原文应用块，**不证明**原网页曾运行这个声明，也不证明这是官方协议。

公开仓库只保留两段必要声明：[游戏声明](../test/fixtures/tetris-appblock.captured.txt)、[画板声明](../test/fixtures/paint-appblock.declared.txt)。完整私人输入、Library 身份和传输外壳仅留本地。这些声明是只读内容提取的子集，不能称为下载原件。

## 解析与授权

`AppBlock`、`CodeBlock`、`WritingBlock` 在本项目 AST 中保留 `rawContent`，内部标签、JS 花括号和 Markdown 不再递归解析。结束标签必须独占一行。流式输入缺结束标签时不提交原文块；普通围栏、转义标签及 AppBlock 外的 `<script>` 保持惰性。`CodeBlock editable interactive` 和 Mermaid `model_previewable` 仅是可见声明属性，当前不会运行 TSX/Mermaid；`WritingBlock id/variant` 只保留属性与内容，未实现编辑保存。

`UIRenderer` 的 AppBlock 组件默认不创建 iframe。用户点击“运行”后才调用 `HostAdapter.authorizeAppBlock`；工作台适配器仅接受与上述两段声明内容及身份精确相同的请求。编辑原文后不会自动执行，修改后的源码也无法通过当前适配器。运行、停止、重启按钮分别创建、销毁、重新创建 iframe；普通消息更新不使未审阅脚本执行。没有账号、站点或网络桥接，也没有父窗口 `postMessage` 接收器。

## 沙箱边界

iframe 使用 `sandbox="allow-scripts"`，不含 `allow-same-origin`、弹窗、表单或顶部导航授权；`referrerPolicy="no-referrer"`。`srcDoc` 在应用正文前设置 CSP：`default-src 'none'`，`connect-src 'none'`，禁止外链脚本、字体、媒体、worker、子框架、表单等；只允许隔离文档内的 inline script/style 和 data 图片。宿主还检查内容大小与外链标签。`--viz-*` 变量和少量 Tailwind 风格类由本项目内联 CSS 提供，不依赖 CDN，**不是已知的 GPT 内部样式实现**。

这是本地参考沙箱，不是运行任意模型代码的通用许可。浏览器沙箱与 CSP 不能可靠限制恶意死循环造成的 CPU/内存占用；没有任务超时或进程级配额。因此真实站点接入前仍需独立代码审阅、隔离进程与资源预算，不能把 `authorizeAppBlock` 改成无条件接受远程 HTML。

## 对样本做的改动

游戏沿用原始 HTML、Canvas 绘制、键盘和指针事件、7-bag、计分、暂停与重开。为可测试性，碰撞、旋转和消行三个函数被本地等价纯函数替换；[函数源码](../ui/components/media/app-block/tetris-core.ts)由宿主内联进隔离文档。其余游戏逻辑未宣称逐字不变。画板声明的 `resize()` 在 iframe 初始布局前可能得到 0×0 画布，使绘制无法继续；宿主改为下一帧与 ResizeObserver 触发，并跳过零尺寸/空旧画布。所有改动在[审阅适配器](../test/playground/reviewed-apps.ts)中明确记录，左侧仍展示用户给的声明文本。

## 运行与验证

运行 `npm run dev` 后打开 `/`，选择第 06 个“俄罗斯方块”或第 07 个“交互式画板”，点击运行。游戏先点内部“开始游戏”；←/→ 移动、↑ 旋转、↓ 软降、空格硬降、P 暂停，屏幕按钮同样可用。画板可选颜色和笔刷，在画布中用指针绘制并清空。两者都可用外层“停止”“重启”控制独立 iframe。自动化测试覆盖原文块解析、围栏惰性、截断、CSP 和游戏核心；浏览器验证记录应单独报告，不以单元测试代替真实运行。
