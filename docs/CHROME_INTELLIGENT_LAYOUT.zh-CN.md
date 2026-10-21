# DeepSeek 网页：统一智能 UI 开关

修复分支 `fix/chrome-layout-toggle`，基于 `origin/main` 的 `bd14f69`。固定工作树：`/Users/marco/github/open-intelligent-ui-fix-chrome-layout-toggle`。不改变 Muse / dsh，不增加新 DSL 或扩展权限。

## 开关含义与范围

输入框“智能 UI”、扩展 popup 和设置页共用**原有全局 `iuiSettings.enabled`**；没有单条开关或额外会话状态。沿用已保存设置及原默认值，不强制把用户状态改开或改关。

- 开启：DeepSeek 实际发送时，严格校验匹配的请求并附加完整现有 IUI 规则；匹配页面里的有效 IUI 回复使用既有解析器、渲染器和主题显示。
- 关闭：立即清除未发送的注入意图，之后不附加规则；停止渲染，已有预览及历史折叠恢复网页原文。输入框按钮保持可见，可重新开启。
- 成功、失败、换会话、SPA 导航和刷新均不自动改变开关；关闭过程中晚到的响应不能重新开启 UI。
- 范围沿用已有总开关：渲染影响所有已配置的匹配页面；规则注入仅支持 DeepSeek 官方网页。原有站点规则、默认 DeepSeek 选择和权限仍决定哪些页面适配，不另建站点或会话开关。
- 已开始传输的数据无法撤回；关闭不删除历史规则，也不会消除它们对模型上下文已有的影响。

## 使用与重载

1. 在上述工作树运行 `npm run build:extension`。
2. 用户 Chrome 详情页已确认实际加载目录为 `/Users/marco/github/open-intelligent-ui/dist/chrome-extension`，扩展 ID 为 `pjmhmojekpinoffjnbkhmcofmcbgldbe`。0.4.0 构建已同步并逐文件核对，旧构建备份保留；真实重载验收仍待完成。
3. `chrome://extensions` → Open Intelligent UI Preview → 重新加载；再刷新 DeepSeek 标签页。只重载扩展不能替旧文档更新 MAIN 桥。
4. “深度思考 / 智能搜索”右侧、附件之前显示带线性布局图标的“智能 UI”。它反映同一全局设置，输入为空也可切换；是否发送由站点控制。

输入框平时只显示原文。开启时每条匹配发送都附加全文，重试不会叠加。关闭时恢复已确认本机封装的编辑原文；编辑重发遵循同一全局状态。

## 真实禁用原因与桥边界

2026-10-19 在用户真实 Chrome 首页复现旧版灰色禁用按钮，title 为“当前 DeepSeek 版本或发送桥未验证，请重新加载；本条不会附加规则”。只读诊断确认：

- 当前资源仍为 `main.a0ce88b684.js`、`default-vendors.3473f64207.js`，MAIN 桥存在；**本次不是资源文件名变化**。
- 另一注入脚本在桥外包装了 `XHR.send` 和 `fetch`；实际代码分别转发到 `originalSend.call(this,data)` 和 `_o_fetch.apply(this,arguments)`。旧版用函数引用相等作为能力条件，误判正常包装链不可用。
- 原按钮缺少原生局部 class、图标，并有额外 CSS 覆盖。修复复用同排原生 class、未选中态字体和图标尺寸，移除自定义边框、背景与 padding，不照搬左侧开启态。

新版使用真实 MAIN 握手校验协议版本、规则摘要和请求契约，并验证转发可达性。自检不发网络请求：open 在内部探针处短路且从不 send；send 探针保持 UNSENT，绕过桥时原生应抛错；fetch 探针的 signal 预先 abort，桥内直接拒绝，绕过时也不能联网。普通包装仍可达桥则可用；绕过桥、版本不匹配或缺桥仍给出具体失败原因。并未移除 disabled 来掩盖故障。

真实请求仍逐条校验：同源精确 POST 路径、用户发送手势、当前路由、send/edit 操作、JSON 字段类型、精确原文及可验证封装。仅更改 `prompt`，保留其他字段、附件 ID、取消与原流，不读改凭据或请求头。

已核实路径是 `/api/v0/chat/completion` 和 `/api/v0/chat/edit_message`，原生 XHR 消费 `text/event-stream`；`ready` 包含请求/回复 ID。普通发送宿主会 trim，编辑传原值。不支持 regenerate/continue/resume、未匹配编辑器、其他来源或未经核实的 fetch 发送；不匹配时透传原请求并报告。实际发送前不宣称端到端已验证。

## 历史展示

开启时，仅对精确 v1 边界、原文长度、当前规则摘要、整条 SHA256 和本机来源记录同时匹配的附加段提供“智能 UI · 附加规则”折叠，可展开全文。关闭时恢复原 DOM；未知、篡改、无来源和用户代码不隐藏。

来源记录只存随机 ID、摘要、版本和时间，最多 500 条，不另存用户原文。规则更新、清理记录、跨设备或来源不明时显示完整原文。DeepSeek 服务器收到完整规则；其他设备和复制功能可能显示全文。

## 验证与未完成项

已通过类型检查、17 项专项回归、完整 83 项测试及扩展构建。完整结果保存在本机忽略的 `dist/verification/toggle-fix-results.json`，不会随 Git 提交。共享依赖的可选 canvas 缺少原生二进制，完整测试使用已有临时 require shim，未修改共享依赖。 本次通过的检查使用项目 npm 环境的 Node 20.20.2；直接使用系统 Node 24 时，既有 dsh 浏览器测试会因只读 navigator 失败，本次未修改该无关测试。

专项回归包括真实监测包装链、无网络自检、缺桥/构建不符/绕过桥、空输入开关、请求去重和严格契约。另直接运行生产 content bundle，验证与 popup 同一存储源、ON 注入及渲染、OFF 恢复原文、不自动复位、晚到流响应、刷新/SPA、保留站点规则。

用户真实 Chrome 的旧故障与加载路径已核实。0.4.0 统一语义的修复后开关、popup 一致性、样式截图仍待浏览器可安全操作时验证；检测到用户操作时停止。未发送真实模型消息，未改深度思考/智能搜索开关，未读 Chrome Preferences 或绕过锁屏。离线夹具不代表真实发送验证。
