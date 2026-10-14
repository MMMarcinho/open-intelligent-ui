# Chrome MV3 扩展（未打包）

在仓库根目录运行 `npm run build:extension`，然后在 Chrome 的 `chrome://extensions` 打开开发者模式，选择“加载已解压的扩展程序”，指向 `dist/chrome-extension/`。本轮没有向用户的 Chrome 安装扩展或替用户批准权限。生成目录由 Git 忽略，包含本地打包的脚本和样式，不依赖 CDN。

默认只在 `https://chat.deepseek.com/*` 注入。点击扩展图标可切换持久化总开关，并查看当前标签页是否已启用协议渲染；这里不显示已渲染回复数量，也没有单页关闭开关。点击“打开设置”会通过 Chrome 的 `options_ui` 在独立标签页打开设置页。默认 DeepSeek 页面、自定义规则、适配器和权限说明都在设置页。关闭总开关会断开页面观察并恢复原文。扩展只读取已出现的助手正文，不发送对话、不拦截请求。

## 自定义页面

设置页“自定义页面规则”接受完整 URL 或路径通配规则，并选择页面结构适配器。当前只有 **DeepSeek 回复结构**，适用于保留同样 DOM 结构的保存页或本地静态重放；选它不会让任意网站自动兼容。例子：

- `file:///Users/me/Desktop/DeepSeek.html`：只匹配这个文件。添加规则时 Chrome 会请求文件来源权限；还需到该扩展的详情页手动打开“允许访问文件网址”，再刷新文件页。
- `http://127.0.0.1:8080/replay/*`：匹配该本地服务的指定路径。Chrome 请求该主机来源权限；规则本身仍按端口和路径判断是否渲染。

`*` 只能用于路径、查询或片段，域名需完整填写。每次添加新来源时，Chrome 自己显示授权提示；不授权就不保存该规则。移除规则会停止未来注入，已打开的页面恢复原文；Chrome 中已授予的来源权限需在扩展详情页自行撤销。规则和总开关存于 `chrome.storage.local`。

新站点需先在 `services/` 实现 `SiteAdapter`（消息发现、角色、正文提取、身份和流式状态），然后在 `content.ts` 注册，并在 `services/extension-rules.ts` 加入可选适配器。共享协调层、解析器和 React 视图无需知道站点选择器。URL 路由规则与站点 DOM 适配器是两个独立步骤。

构建验证：`npm run typecheck`、`npm test`、`npm run build:extension`、`npm run verify:deepseek-snapshot -- '<保存的HTML路径>'`。当前 Mac 使用指向另一项目的 `node_modules` 软链且无独立 lockfile，因此还没有验证全新环境的独立依赖安装。静态保存页分析、受限回放、Chrome 截图和真实站点限制见 [验证记录](../../docs/DEEPSEEK_EXTENSION.zh-CN.md)。

扩展未授权执行 `AppBlock` 任意脚本。`Runtime` 不提供真实聊天宿主动作；代码围栏和普通文本保持原文。流式协议在首个安全组件出现前显示原文，之后只增量展示已完整的语法片段；末尾半截内容暂存并保留上一帧。
