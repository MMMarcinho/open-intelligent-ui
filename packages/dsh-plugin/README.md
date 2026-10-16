# Open Intelligent UI for DeepSeek Harness Web / Desktop

This package adds IUI v0.1 to assistant messages in the **DSH Web and Desktop profiles**. It uses DSH's system prompt section and keyed `conversation.chat.node` slot; it does not change the conversation transport. Ordinary Markdown remains in the reply, and IUI roots render in place. The Desktop shell loads the plugin's `web` client bundle through its own carrier. The integration was built against `@deepseek-ai/dsh` `0.2.0-rc.2`. See the [shared capability guide](../../docs/CAPABILITIES.zh-CN.md) and [component matrix](../../docs/COMPATIBILITY.zh-CN.md); a registry name alone is not a host capability.

## Build and install from this checkout

From the OIUI repository root, with Node 24 and the repository dependencies installed:

```sh
npm run build:dsh-plugin
dsh plugin --profile web add ./packages/dsh-plugin
dsh --profile web --dump-config
dsh web
```

For Desktop, substitute `desktop` for `web` in the install and config-check commands, then launch your normal Desktop profile. The config dump should contain an `open-intelligent-ui` row. `dsh plugin add` links a local directory and appends its `dsh.bundle` to that profile; the package's `cordis.patch.yml` inserts its host row, and `dsh.client` loads the UI half. If `dsh` is already running, open a new session after installing. The terminal/TUI profile has no assistant-message card renderer from this package.

To remove it:

```sh
dsh plugin --profile web remove open-intelligent-ui-dsh-plugin
```

## Try it

Paste this into a DSH Web chat:

```text
请直接输出下面的内容，不要使用代码围栏，不要调用工具，也不要解释标签。普通 Markdown 要留在卡片前后；IUI 标签必须原样输出。

这是卡片前的普通 Markdown。**拖动滑块或点击按钮**，观察数字变化。

{@body const [level,setLevel]=DIL.useState(30)}
<box padding={3} gap={2}><title>音量实验</title><text>当前音量：{level}%</text><slider min={0} max={100} step={1} value={level} onChange={setLevel}/><button onClick={()=>setLevel(v=>Math.min(100,v+10))}>增加 10</button></box>

这是卡片后的普通 Markdown。交互只改变本地显示，不发送新消息。
```

Expected: Markdown above and below the card remains visible; the card appears while the message streams; slider and button update the number locally, including after the reply finishes streaming.

## Supported host capabilities

| Capability | Behavior |
| --- | --- |
| Prompt guidance | `ctx.systemPrompt.section()` advertises the supported IUI syntax. |
| Message rendering | The `assistant-step` slot projects text blocks through OIUI's existing `parseReplyParts`, `Runtime`, and `UIRenderer`; plain text uses DSH's `MarkdownText`. |
| Streaming | Valid IUI prefixes preview during streaming. The same runtime persists across subsequent text updates so local `DIL.useState` survives. An incomplete suffix keeps the last valid prefix. |
| Interaction state | Local controls such as button, slider, and input use the OIUI runtime. |
| Send back to conversation | Not provided. This integration does not configure `GenUI.issueNewTurn`, `GenUI.copy`, or another host action. |

The React renderer handles the [46 local tag names and their documented subset behavior](../../docs/COMPATIBILITY.zh-CN.md): text and layout, form controls, basic `Chart`, and raw-text `CodeBlock`. The parser also understands declarations, component expressions, `{#if}` and `{#each}`. This plugin supplies no `HostAdapter`, so **host-class tags are not working integrations**: no `AppBlock` authorization, `AsyncImage` / `AsyncImageGroup` resource lookup, file/citation resolution, chat submission, or local-system action. Recognized host tags show an unconfigured state. No model-provided JS or shell command is run. Each DSH text block has its own IUI document and state; state is local to the mounted client and is not stored in the dsh session log. DSH's separate image and tool lifecycle blocks remain handled by DSH. The replacement assistant renderer displays reasoning in a simple disclosure element, so its presentation can differ from DSH's built-in renderer.

The Web profile's message renderer and local interactions have automated tests. Web and Desktop profile activation and UI appearance were checked on the local `0.2.0-rc.2` installation; broad operating-system and dsh-version compatibility has not been established. In particular, a card labelled “volume” only changes its own state: there is currently no RPC from a card to the Host's macOS volume control.

## Development

```sh
npm run typecheck
npm test
```

The DSH packages used for TypeScript declarations are supplied by the local DSH installation during development. The browser output is a CJS module wrapped in DSH's `window.__ModuleLoader__.load()` handoff. React and DSH's UI primitives remain external to use the Web shell's copies. Rebuild before installing after source edits.

The first-release candidate is `open-intelligent-ui-dsh-plugin@0.1.0` under MIT. The npm package includes its [license](LICENSE) and [Acorn notice](THIRD_PARTY_NOTICES.md); `publishConfig` pins the public npmjs.org registry. The name's availability and publisher access still need an authenticated registry check when network access works. Inspect a fresh tarball before release. Publishing requires a separately authorized npmjs.org identity: do not put npm credentials in this repository or send tokens in chat. A public repository can add the `dsh-plugin` GitHub topic for discovery.
