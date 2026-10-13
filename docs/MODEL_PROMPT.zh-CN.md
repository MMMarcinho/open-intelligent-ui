# 给其他模型的 Open Intelligent UI v0.1 提示词

推荐直接注入 [recommended.en.txt](prompts/recommended.en.txt)。它是完整可复制的英文指令，要求模型在交互有价值时输出 Markdown 与当前解析器支持的 DSL；包含状态、事件、条件/循环、图表、宿主限制和三段通过本项目解析器的短样例。输出给用户的正文可以是中文。不要把提示词里的 Example 标签复制进实际 DSL。

只需计数器、简单表单或列表时，用更短的 [core.en.txt](prompts/core.en.txt)；需要全部 61 个注册名称时，用 [full-catalog.en.txt](prompts/full-catalog.en.txt)。也可以按需拼接 [core](prompts/core.en.txt) + [表单/图表增量](prompts/recommended-addon.en.txt) + [完整目录增量](prompts/catalog-addon.en.txt)，避免每次承担完整目录的输入开销。目录名称覆盖不代表宿主资源可用；提示词已明确 AppBlock 只能运行两个本地精确审阅样本，不能让模型自由生成脚本。

## 输入预算

下表只计提示词文件本身，不计用户问题、聊天历史、工具内容或模型输出。字符数按 Unicode 码点、词数按空白分隔统计；这些文件全为 ASCII，所以字符数也等于 UTF-8 字节数。当前本机有 Python tokenizers 库，但没有适合目标模型的本地词表；没有可用的 tiktoken，因此下列均为**估算而非实测 token**。对英文与 DSL 混排，按每 token 约 2.5–4 个字符给出宽区间；具体模型、编码器和注入包装会改变结果。

| 方案 | 文件 | 字符 | 空白分隔词 | 估计输入 token |
|---|---|---:|---:|---:|
| 精简核心，含 2 段例子 | [core.en.txt](prompts/core.en.txt) | 2,949 | 359 | 740–1,180 |
| 推荐版，增加表单/图表指引和第 3 段例子 | [recommended.en.txt](prompts/recommended.en.txt) | 4,672 | 558 | 1,170–1,870 |
| 完整目录版，列出全部 61 个名称及其状态 | [full-catalog.en.txt](prompts/full-catalog.en.txt) | 6,855 | 834 | 1,710–2,750 |

表单/图表增量约 1,723 字符，完整目录增量约 2,183 字符。推荐在需要图表或多控件时用推荐版；只有明确要使用偏门组件时再注入完整目录。提示词不要带入抓包传输外壳、DIL 编译输出或内部 JSON AST；那会增加开销，也可能让模型生成解析器并不接受的内容。

## 使用和验证边界

每次把这段提示词重新发给模型，就会占用该请求的输入 token。若持续把整段历史一起发送，上下文占用还会累积。服务商可能提供输入缓存或账单折扣，但缓存不让这些 token 从上下文窗口消失；这里不估算费用。

三个样例已用当前构建的 parseDsl 解析：均 complete、零 diagnostics；Runtime 初始化零反馈。其功能边界来自 [协议](PROTOCOL.zh-CN.md)与[兼容矩阵](COMPATIBILITY.zh-CN.md)。这只证明提示词中的例子符合当前参考解析器，不保证其他模型总能遵守，也不把参考实现说成 ChatGPT 的私有协议。
