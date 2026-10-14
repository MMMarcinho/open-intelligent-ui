# 受限图片宿主与演示

用户展示的 DeepSeek 回复只有文字、徽标和网页入口，没有 `AsyncImage` / `AsyncImageGroup`，也没有可核验的图片资源。`https://openai.com` 是网页地址，不是图片地址，因此那条回复本身不会出现图片。模型所说的联网能力只能视为该次回答的自述，不能当作站点权限的证据。与此同时，本项目此前也确实只给这两个已知图片组件显示“宿主未配置”。

现在 `HostAdapter.resolveResource` 为这两个组件接入**仅限项目素材**的受限实现：`iui:readme-banner` 对应仓库里的 README 手绘横幅，`iui:extension-icon` 对应扩展图标。查询必须精确匹配；任意搜索词、网页地址和其他媒体类型均不会联网解析。扩展把这两张 PNG 随 `content.js` 打包，不新增远端图片域名或通用权限。图片组件提供加载、失败、替代文本、宽度和比例适配；图片组支持基础网格与轮播。这是本项目根据已记录的 `query`、`aspectRatio`、`width`、`layout` 属性做的受限 host 适配，**不声称完整复刻原宿主的异步搜图能力**。

最小有效示例：

```iui
<box gap={2}>
  <title>Open Intelligent UI 项目素材</title>
  <AsyncImage query="iui:readme-banner" aspectRatio="3:1" width="100%"/>
  <AsyncImageGroup query={["iui:extension-icon","iui:readme-banner"]} aspectRatio="3:1" layout="carousel"/>
</box>
```

若要展示 OpenAI 公司照片，还需单独接入取得授权并能证明来源的图片资源解析器；不能用上述项目横幅冒充公司照片，也不能把模型提供的任意 URL 直接塞进 `<img>`。未授权查询会显示明确的失败提示。

运行 `npm run dev` 后打开 `http://127.0.0.1:5173/?demo=media-local`，左侧是可编辑协议文本，右侧是真实 React 图片效果。完整示例见 [media-local.iui.txt](../test/playground/media-local.iui.txt)。离线构建的 `dist/playground/` 也可由本地 HTTP 服务打开；Chrome 扩展产物在 `dist/chrome-extension/`。隔离 Chrome 已验证两个图片节点成功加载、未知查询失败，以及打包后的 `content.js` 在 DeepSeek 结构的静态页面显示横幅。真实 DeepSeek 网站与浏览器扩展安装流程尚未验证。
