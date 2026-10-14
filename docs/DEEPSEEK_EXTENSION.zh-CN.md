# DeepSeek 回复渲染扩展：静态依据与验证

## 保存页依据

只读检查用户指定的 `直接输出文本 - DeepSeek.html` 与同名 `_files` 目录，没有扫描其他桌面文件内容，也没有执行保存页的脚本。保存页含两个 `.ds-message`：用户文本在 `.ds-collapsible-text`；助手正文是 `.ds-markdown.ds-assistant-message-main-content`，思考区另在 `.ds-think-content .ds-markdown`。助手正文的协议跨 `p`、`span`、`br` 和直接子节点 `.ds-markdown-html`。适配器按 DOM 文本节点恢复实体和换行，并把 Markdown 的 `em`/`strong` 标记还原成 `*`/`**`，否则乘号会从 `totalCost` 表达式消失。

快照没有可靠的 `data-message-id` 或流式完成信号。DeepSeek 适配器为同一 DOM 消息节点分配临时身份，报告 `stream: 'unknown'`。节点替换视为新实例，真实站点如有不同的虚拟列表或流式机制仍需单独验证。

## 实现边界

- `services/adapters/deepseek.ts` 只选择助手正文；用户消息、思考区、正文外复制/反馈控件不是协议源。代码围栏保留为惰性文本。
- `protocol/parser.ts` 的预览入口只投影语法完整的节点，并让未闭合容器承载已有的完整子节点与安全文本。半截标签、属性、表达式、声明和原始代码块不补写闭合符，也不提交执行；声明和组件表达式的依赖未就绪时先等待。
- `services/reply-coordinator.ts` 节流观察、按文本和可见 AST 去重、维护每条回复的运行时、处理路由切换和节点更替。首个安全 UI 片段出现前保留网站原文；流式尾部暂缺时保留上一帧预览。DeepSeek 在同一消息节点内替换正文时移动原预览，不重建运行时。关闭后断开观察器、清理预览并恢复原文。
- `services/reply-view.tsx` 在 Shadow DOM 内沿用真实 parser、`Runtime`、`UIRenderer` 和项目样式。移除了 `showPlainText`，协议声明前的空白不再撑出大块空隙。原正文只在有效预览可见时隐藏，始终保留在 DOM 中。
- `services/extension-rules.ts` 独立管理持久化总开关、默认站点和自定义 URL/路由规则。`services/adapter-registry.ts` 可注册更多站点 DOM 适配器；目前只提供 DeepSeek。MV3 service worker 只为用户授权的自定义来源注册内容脚本，默认静态匹配仍限于 DeepSeek。
- 不配置真实聊天宿主动作，不执行模型提供的任意脚本，不使用 `eval`、`new Function` 或 CDN 代码。

## 验证

`npm run verify:deepseek-snapshot -- '<保存的HTML路径>'` 用 jsdom 的禁脚本、禁外部资源默认行为读取原页，只复制助手正文到新文档，并移除资源元素、事件属性及 `src`/`href`。不复制账号侧栏、私有会话信息或思考文本；原文件及 `_files` 不提交仓库。`test/fixtures/deepseek.reply.sanitized.html` 是另写的最小脱敏结构样本。

本机首份保存页提取协议 1,991 字节（1,945 个字符），含 7 条声明和 1 个顶层组件。逐字符解析在第 **517** 个字符取得首个有内容的安全 UI，最外层 `</box>` 从第 **1,939** 个字符才开始；第 **856** 个字符时第一个滑块已可交互。把滑块调至 200 后继续补全，并把流式纯文本换成保存页的 Markdown DOM，费用仍为 **$760**，运行时状态保持。完整回复初始值 **$380**；继续改变 token、比例、输入价格、输出价格后依次检查 **$760、$1,000、$1,100、$1,300**。关闭后原文重新可见。

## 普通文字与 UI 混排回归

用户提供的第二份保存页 `OpenAI 公司介绍 - DeepSeek.html` 含一段 97 字的普通说明、5 条 `{@body}` 声明和一个顶层 `<box>`。旧整条协议检测拒绝了说明文字；新协调层只投影声明和 UI 所在的 DOM 区间，按原位置复制并过滤普通正文的富文本节点。多个 UI 根共享一份回复级声明和运行时；声明名必须唯一。代码围栏、行内代码、说明中的标签例子仍不挂载。逐字符输出只提交安全前缀，半截表达式不会运行。

`node test/verify-deepseek-mixed-snapshot.mjs '<第二份保存页路径>'` 只读加载原文件，禁用脚本和外部资源，仅将脱敏助手正文导入新文档。回放确认旧检测失败、新检测识别 3,710 字正文、说明文字和 UI 同时可见、关闭恢复原文；随后用合成第二段 UI 验证点击后两段共享状态。另以隔离的无账号 Chrome 配置运行打包后的 `content.js`，对静态脱敏正文取得截图；只使用自制页面脚本模拟设置 API，未安装扩展，也未载入保存页脚本或资源。截图作为本地任务产物交付，未放入公开仓库。`npm test` 现有 **45 项通过**，覆盖混排顺序、富文本、代码示例、逐字符更新和原有站点适配回归。真实 DeepSeek 页面仍未验证。

另用独立临时 Chrome 配置和由保存页**仅提取助手 DOM**构造的脱敏页面回放实际打包的 `content.js`（Chrome API 在回放页中模拟，不安装扩展）。验证 `file://` 规则命中后挂载、总开关关闭恢复原文、重新打开再挂载、无匹配规则保持原文；同一脱敏页面由 `127.0.0.1` 提供时，本地 HTTP 规则也命中。固定截图在本地被 Git 忽略的 `dist/verification/deepseek-file-replay-fixed.png`。截图可见卡片紧接脱敏思考占位，费用为 $380。这个浏览器回放证明布局和内容脚本行为；真实 DeepSeek 网站、Chrome 扩展授权/注入流程及账号页面仍未验证。

同一独立 Chrome 环境还回放了打包后的弹窗 `popup.js`：用模拟 Chrome API 验证文件规则添加时请求 `file:///*`、开关设置持久化、规则移除，以及三个操作后的页面状态。模拟授权只证明弹窗流程调用了相应 API，不代表用户已在 Chrome 中授予权限。

最新打包的 `content.js` 还在隔离 Chrome 中按保存页真实协议的前缀分别截图：第 546 个字符已有标题、第 856 个字符已有滑块、第 1,939 个字符费用为 $380，此时外层闭合仍未输出。脱敏截图分别保存在本地忽略目录 `dist/verification/deepseek-stream-early.png`、`deepseek-stream-mid.png`、`deepseek-stream-late.png`。这验证本地浏览器中的首屏增量渲染，但不能证明在线 DeepSeek 的 DOM 更新节奏、真实扩展注入时序或账号页面行为；保存页本身也没有可靠的流式完成信号。

用户附加的两张 Library 截图无法通过当前材料下载工具取得，所以这里的原因判断基于保存页 DOM、计算表达式和我们自己的前后 Chrome 回放，没有宣称逐像素比对用户截图。
