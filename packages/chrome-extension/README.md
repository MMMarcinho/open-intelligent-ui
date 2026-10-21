# Chrome MV3 扩展（未打包）

## DeepSeek 网页适配范围

本适配器从 `https://chat.deepseek.com/*` 的**助手正文**提取文本，不把用户消息、思考区或网页按钮当作 DSL。默认站点规则以外，只能对用户明确配置的 URL 使用相同的 DeepSeek DOM 适配器；这不代表其它网站已兼容。具体 DOM 依据与回放范围见[验证记录](../../docs/DEEPSEEK_EXTENSION.zh-CN.md)，通用 DSL 语义和标签分组见[能力总览](../../docs/CAPABILITIES.zh-CN.md)。

| 能力 | 当前行为 |
| --- | --- |
| 标签 | [46 个本地 React 名称](../../docs/COMPATIBILITY.zh-CN.md)具有各自的参考子集实现；不能把注册表里的宿主名称视为已接服务。`CodeBlock` 展示原文，`Chart` 仅基础图表。 |
| 表达式和状态 | `{@body}`、组件内插值、`{#if}` / `{#each}` 与受限表达式；控件操作更新当前消息的 `DIL.useState`，回复正文更新时保留同实例状态。 |
| 混排和流式 | 在原文位置投影完整安全前缀；普通文字和多个 UI 根按顺序保留。关闭扩展后恢复网站原文。 |
| 宿主资源 | 只将 `AsyncImage` 的两个精确查询映射到项目自有图片；图片组可复用单图组件，但无任意图片搜索。`AppBlock` 无授权宿主，不能运行。 |
| 宿主动作 | 无 `requestAction`；`GenUI.copy`、`GenUI.issueNewTurn` 不执行。不会发送聊天消息或控制用户机器。 |

保存页 DOM 和隔离浏览器回放有测试；它们不能证明在线 DeepSeek 页面后续 DOM 版本、账号页注入和真实模型输出都兼容。

在仓库根目录运行 `npm run build:extension`，然后在 Chrome 的 `chrome://extensions` 打开开发者模式，选择“加载已解压的扩展程序”，指向 `dist/chrome-extension/`。本轮没有向用户的 Chrome 安装扩展或替用户批准权限。生成目录由 Git 忽略，包含本地打包的脚本和样式，不依赖 CDN。

默认只在 `https://chat.deepseek.com/*` 注入。点击扩展图标可切换持久化总开关，并查看当前标签页是否已启用协议渲染；这里不显示已渲染回复数量，也没有单页关闭开关。点击“打开设置”会通过 Chrome 的 `options_ui` 在独立标签页打开设置页。默认 DeepSeek 页面、自定义规则、适配器和权限说明都在设置页。关闭总开关会停止渲染并恢复原文；页内开关保留，方便重新启用。

DeepSeek 输入框的“智能 UI”与 popup、设置页共用原有全局 `iuiSettings.enabled`，不会新建单条或会话开关。开启时，DeepSeek 实际发送会在严格请求校验后附加现有规则，同时渲染匹配页面中的 IUI 回复；关闭时停止后续附加、恢复原文并停止渲染。发送成功不自动关闭，刷新、切换会话后保留原设置。作用范围沿用全局总开关：渲染影响所有已配置匹配页面，注入仅限已适配的 DeepSeek；原有站点规则保留。已发送的规则不能撤回。

MAIN 桥缺失、两侧版本不一致、请求格式不支持或转发自检失败时给出具体诊断；正常转发到桥的其他监测包装不会因函数身份不同被误判。重新加载扩展后需刷新 DeepSeek。扩展不主动发送对话。详见[使用、真实接口和限制](../../docs/CHROME_INTELLIGENT_LAYOUT.zh-CN.md)。

## 自定义页面

设置页“自定义页面规则”接受完整 URL 或路径通配规则，并选择页面结构适配器。当前只有 **DeepSeek 回复结构**，适用于保留同样 DOM 结构的保存页或本地静态重放；选它不会让任意网站自动兼容。例子：

- `file:///Users/me/Desktop/DeepSeek.html`：只匹配这个文件。添加规则时 Chrome 会请求文件来源权限；还需到该扩展的详情页手动打开“允许访问文件网址”，再刷新文件页。
- `http://127.0.0.1:8080/replay/*`：匹配该本地服务的指定路径。Chrome 请求该主机来源权限；规则本身仍按端口和路径判断是否渲染。

`*` 只能用于路径、查询或片段，域名需完整填写。每次添加新来源时，Chrome 自己显示授权提示；不授权就不保存该规则。移除规则会停止未来注入，已打开的页面恢复原文；Chrome 中已授予的来源权限需在扩展详情页自行撤销。规则和总开关存于 `chrome.storage.local`。

新站点需先在 `services/` 实现 `SiteAdapter`（消息发现、角色、正文提取、来源字符到安全 DOM 片段的映射、身份和流式状态），然后在 `content.ts` 注册，并在 `services/extension-rules.ts` 加入可选适配器。共享协调层、解析器和 React 视图无需知道站点选择器或排版类名。URL 路由规则与站点 DOM 适配器是两个独立步骤。

构建验证：`npm run typecheck`、`npm test`、`npm run build:extension`、`npm run verify:deepseek-snapshot -- '<保存的HTML路径>'`。混排保存页另用 `npm run build:lib && node test/verify-deepseek-mixed-snapshot.mjs '<保存的HTML路径>'` 回放。当前 Mac 使用指向另一项目的 `node_modules` 软链且无独立 lockfile，因此还没有验证全新环境的独立依赖安装。静态保存页分析、受限回放、Chrome 截图和真实站点限制见 [验证记录](../../docs/DEEPSEEK_EXTENSION.zh-CN.md)。

扩展未授权执行 `AppBlock` 任意脚本。`Runtime` 不提供真实聊天宿主动作。DeepSeek 回复支持普通 Markdown 与多个独立 UI 区段混排：正文格式和顺序保留，只有明确的协议区段被替换；同一回复中的 `{@body}` 声明由各 UI 区段共享一个运行时，应使用不重复的名称。代码围栏、行内代码和普通文字示例保持惰性。流式协议在首个安全组件出现前显示原文，之后只增量展示已完整的语法片段；末尾半截内容暂存并保留上一帧。关闭总开关时恢复网站原始正文。

图片宿主只识别 `<AsyncImage query="iui:readme-banner"/>`、`<AsyncImage query="iui:extension-icon"/>` 以及这些查询组成的 `<AsyncImageGroup query={[...]}/>`。两张图片随扩展打包为本地数据，不请求远端图片，也不会把官网网页 URL 当图片 URL。其他查询显示失败提示；这是项目素材演示，不提供 OpenAI 公司照片或通用搜图。完整协议示例见 `test/playground/media-local.iui.txt`。
