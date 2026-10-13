# 主题与安全覆盖

`ui/theme/` 提供语义化 `ThemeTokens`、`ThemeProvider`、`mergeTheme`。内置 `studio` 与视觉明显不同的 `citrus`，各有浅色/深色模式。默认主题仅借鉴参考样例的清爽界面风格，不代表官方完整设计系统。

Tokens：`background`、`surface`、`surfaceMuted`、`surfaceTertiary`、`text`、`textMuted`、`border`、`primary`、`success`、`warning`、`danger`、`info`、`fontFamily`、`radius`、`spacing`、`shadow`、`chart[4]`。组件经 `--iui-*` CSS 变量取色，图表调色板同样取变量。主题不属于协议 AST，也不重置 Runtime；playground 可直接验证在滑块/表单状态保留时切换主题。

```tsx
import { ThemeProvider, UIRenderer } from 'open-intelligent-ui/react-ui';
import 'open-intelligent-ui/styles.css';

<ThemeProvider name="citrus" mode="dark" overrides={{ primary:'#b2396c', radius:20 }}>
  <UIRenderer runtime={runtime} />
</ThemeProvider>
```

覆盖只接受 3/6 位十六进制颜色、限定数值圆角与间距、两个内置安全字体栈、枚举阴影及 4 个合法图表颜色。`url(...)`、任意 CSS、脚本和远程字体均被拒绝。扩展主题时在 `themes` 中增加预先审核的静态定义；不要动态执行远程主题代码。
