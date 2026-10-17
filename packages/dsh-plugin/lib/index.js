// packages/dsh-plugin/src/index.ts
import { readFileSync } from "node:fs";
var inject = ["systemPrompt"];
function apply(ctx) {
  const text = readFileSync(new URL("../prompt.txt", import.meta.url), "utf8");
  ctx.systemPrompt.section({
    name: "open-intelligent-ui:v0.1",
    order: ctx.systemPrompt.getSectionOrder("WEB_SURFACE") + 1,
    text,
    interpolate: false
  });
}
export {
  apply,
  inject
};
