window.__ModuleLoader__.load({
  id: 'open-intelligent-ui-dsh-plugin',
  factory: (require) => {
    const module = { exports: {} };
    const exports = module.exports;
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/dsh-plugin/src/client.tsx
var client_exports = {};
__export(client_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(client_exports);
var import_react8 = __toESM(require("react"), 1);
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");

// protocol/types.ts
var limits = { sourceBytes: 2e5, nodes: 2e3, depth: 32, expressionSteps: 5e3, arrayItems: 1e3, stringLength: 2e4, actionLength: 8e3 };

// protocol/registry.ts
var local = "\u672C\u5730 React \u5B9E\u73B0";
var host = "\u9700\u5BBF\u4E3B\u8D44\u6E90\u6216\u6388\u6743";
var registry = [
  ..."text title caption badge code math label bold italic underline strikethrough icon box row col grid flow card carousel table list divider spacer pressable popover blockquote carousel-item grid-item table-row table-cell list-item flow-item popover-trigger popover-content button input textarea select checkbox radio-group radio slider date-picker segmented-control Chart CodeBlock".split(" ").map((name) => ({ name, support: "local", description: local })),
  ..."AsyncImage AsyncImageGroup AsyncVideo MapWidgetV2 favicon Entity Cite Link FollowUp FileCite FileNavList MemoryCite WritingBlock".split(" ").map((name) => ({ name, support: "host", description: host })),
  { name: "AppBlock", support: "host", description: "\u672C\u5730\u53D7\u9650\u5BBF\u4E3B\u53EF\u624B\u52A8\u8FD0\u884C\u5DF2\u5BA1\u9605\u6837\u672C\uFF1B\u9ED8\u8BA4\u672A\u914D\u7F6E\uFF0C\u4E0D\u63A5\u53D7\u4EFB\u610F\u4EE3\u7801" },
  { name: "svg", support: "unsupported", description: "v0.1 \u4E0D\u63A5\u53D7\u6A21\u578B\u63D0\u4F9B\u7684\u4EFB\u610F SVG\uFF1B\u4EC5\u56FE\u8868\u4E0E\u5185\u7F6E\u56FE\u6807\u751F\u6210\u56FA\u5B9A SVG" }
];
var componentNames = new Set(registry.map((x) => x.name));
var byName = new Map(registry.map((x) => [x.name, x]));
var safeUrl = (url) => {
  try {
    const u = new URL(url);
    if (!["https:", "http:"].includes(u.protocol))
      return null;
    return u.href;
  } catch {
    return null;
  }
};
var safeCssSize = (value) => {
  if (typeof value === "number" && Number.isFinite(value))
    return `${Math.max(0, Math.min(2e3, value))}px`;
  if (typeof value === "string" && /^(?:\d+(?:\.\d+)?(?:px|%|rem|em|vh|vw)|auto)$/.test(value))
    return value;
  return void 0;
};
var safeColor = (value) => {
  if (typeof value !== "string")
    return void 0;
  if (/^#[0-9a-fA-F]{3,8}$/.test(value))
    return value;
  const colors2 = { primary: "var(--iui-primary)", success: "var(--iui-success)", warning: "var(--iui-warning)", danger: "var(--iui-danger)", info: "var(--iui-info)", secondary: "var(--iui-text-muted)", tertiary: "var(--iui-text-muted)", default: "var(--iui-text)", subtle: "var(--iui-border)", "surface-secondary": "var(--iui-surface-muted)", "surface-tertiary": "var(--iui-surface-tertiary)", surface: "var(--iui-surface)" };
  return colors2[value];
};

// protocol/parser.ts
function balanced(source, start, open = "{", close = "}") {
  let depth = 0, quote = "";
  for (let i = start; i < source.length; i++) {
    const c = source[i];
    if (quote) {
      if (c === "\\") {
        i++;
        continue;
      }
      if (c === quote)
        quote = "";
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      quote = c;
      continue;
    }
    if (c === open)
      depth++;
    if (c === close && --depth === 0)
      return i + 1;
  }
  return -1;
}
function tagEnd(source, start) {
  let quote = "", braces = 0;
  for (let i = start; i < source.length; i++) {
    const c = source[i];
    if (quote) {
      if (c === "\\") {
        i++;
        continue;
      }
      if (c === quote)
        quote = "";
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      quote = c;
      continue;
    }
    if (c === "{")
      braces++;
    else if (c === "}")
      braces--;
    else if (c === ">" && braces === 0)
      return i + 1;
  }
  return -1;
}
function opaqueEnd(source, openingEnd, name) {
  let depth = 1, pos = openingEnd;
  const pattern = new RegExp(`^<(/?)${name}(?=[\\s/>])`);
  while (pos < source.length) {
    const next = source.indexOf("<", pos);
    if (next < 0)
      return source.length;
    const match = pattern.exec(source.slice(next));
    if (!match) {
      pos = next + 1;
      continue;
    }
    const end = tagEnd(source, next);
    if (end < 0)
      return source.length;
    const self = /\/\s*>$/.test(source.slice(next, end));
    if (match[1])
      depth--;
    else if (!self)
      depth++;
    if (depth === 0)
      return end;
    pos = end;
  }
  return source.length;
}
function rawBlockClose(source, openingEnd, name) {
  const pattern = new RegExp(`(?:^|\\n)[ \\t]*<\\/${name}>[ \\t]*(?=\\r?\\n|$)`, "g");
  pattern.lastIndex = openingEnd;
  const match = pattern.exec(source);
  if (!match)
    return null;
  const start = match.index + (match[0].startsWith("\n") ? 1 : 0);
  return { start, end: match.index + match[0].length };
}
function parseAttributes(s, base, diagnostics) {
  const result = {};
  let i = 0;
  while (i < s.length) {
    while (/\s/.test(s[i] || ""))
      i++;
    if (i >= s.length)
      break;
    const start = i, m = /^[\w-]+/.exec(s.slice(i));
    if (!m) {
      diagnostics.push({ code: "attribute_syntax", message: "\u65E0\u6548\u5C5E\u6027", span: { start: base + i, end: base + i + 1 }, severity: "error" });
      i++;
      continue;
    }
    const name = m[0];
    i += name.length;
    while (/\s/.test(s[i] || ""))
      i++;
    let value = { kind: "literal", value: true, span: { start: base + start, end: base + i } };
    if (s[i] === "=") {
      i++;
      while (/\s/.test(s[i] || ""))
        i++;
      if (s[i] === "{") {
        const end = balanced(s, i);
        if (end < 0) {
          diagnostics.push({ code: "incomplete_attribute", message: `\u5C5E\u6027 ${name} \u8868\u8FBE\u5F0F\u672A\u7ED3\u675F`, span: { start: base + i, end: base + s.length }, severity: "error" });
          break;
        }
        value = { kind: "expression", value: s.slice(i + 1, end - 1), span: { start: base + i, end: base + end } };
        i = end;
      } else if (s[i] === '"' || s[i] === "'") {
        const q = s[i++], v = i;
        while (i < s.length && s[i] !== q) {
          if (s[i] === "\\")
            i++;
          i++;
        }
        value = { kind: "literal", value: s.slice(v, i), span: { start: base + v, end: base + i } };
        i++;
      } else {
        const v = i;
        while (i < s.length && !/\s/.test(s[i]))
          i++;
        value = { kind: "literal", value: s.slice(v, i), span: { start: base + v, end: base + i } };
      }
    }
    result[name] = value;
  }
  return result;
}
function declaration(raw, start, end, diagnostics) {
  const s = raw.trim();
  const state = /^const\s*\[\s*([A-Za-z_$][\w$]*)\s*,\s*([A-Za-z_$][\w$]*)\s*\]\s*=\s*DIL\.useState\(([\s\S]*)\)$/.exec(s);
  if (state)
    return { name: state[1], setter: state[2], expression: state[3], state: true, span: { start, end } };
  const derived = /^const\s+([A-Za-z_$][\w$]*)\s*=\s*([\s\S]+)$/.exec(s);
  if (derived)
    return { name: derived[1], expression: derived[2], state: false, span: { start, end } };
  diagnostics.push({ code: "body_syntax", message: "\u4EC5\u5141\u8BB8 const \u6D3E\u751F\u503C\u6216 DIL.useState \u58F0\u660E", span: { start, end }, severity: "error" });
  return null;
}
function committed(nodes, openContainers = false) {
  const result = [];
  for (const n of nodes) {
    if (n.kind === "element" || n.kind === "if" || n.kind === "each") {
      const children = committed(n.children, openContainers);
      if (n.span.end >= 0)
        result.push({ ...n, children });
      else if (openContainers && children.length)
        result.push({ ...n, children });
    } else if (n.span.end >= 0)
      result.push(n);
  }
  return result;
}
function parseDsl(source, messageId = "preview", final = true, openContainers = false) {
  const diagnostics = [], declarations = [], children = [];
  if (new TextEncoder().encode(source).length > limits.sourceBytes) {
    return { protocol: "iui/0.1", messageId, declarations, children, diagnostics: [{ code: "source_budget", message: "\u8F93\u5165\u8D85\u8FC7 200 KB", span: { start: 0, end: source.length }, severity: "error" }], complete: false };
  }
  const stack = [];
  let target = children, i = 0, textStart = 0, count = 0;
  const flush = (end) => {
    if (end > textStart)
      target.push({ kind: "text", text: source.slice(textStart, end), span: { start: textStart, end } });
    textStart = end;
  };
  const add = (node) => {
    if (++count > limits.nodes)
      throw new Error("node budget exceeded");
    target.push(node);
  };
  try {
    while (i < source.length) {
      if (source.startsWith("<!--", i)) {
        const close = source.indexOf("-->", i + 4);
        i = close < 0 ? source.length : close + 3;
        continue;
      }
      if (source.startsWith("```", i) || source.startsWith("~~~", i)) {
        const marker = source.slice(i, i + 3), lineEnd = source.indexOf("\n", i), close = source.indexOf(marker, lineEnd < 0 ? source.length : lineEnd + 1);
        i = close < 0 ? source.length : close + 3;
        continue;
      }
      if (source[i] === "`") {
        let n = 1;
        while (source[i + n] === "`")
          n++;
        const marker = "`".repeat(n), close = source.indexOf(marker, i + n);
        i = close < 0 ? source.length : close + n;
        continue;
      }
      if (source[i] === "\\" && source[i + 1] === "<") {
        const match = /^<([A-Za-z][\w-]*)/.exec(source.slice(i + 1));
        if (match) {
          const end = tagEnd(source, i + 1);
          if (end > 0) {
            i = /\/\s*>$/.test(source.slice(i + 1, end)) ? end : opaqueEnd(source, end, match[1]);
            continue;
          }
        }
        i += 2;
        continue;
      }
      if (source[i] === "\\" && source[i + 1] === "{") {
        i += 2;
        continue;
      }
      if (source.startsWith("{@body", i)) {
        const end = balanced(source, i);
        if (end < 0) {
          diagnostics.push({ code: "incomplete_body", message: "\u72B6\u6001\u58F0\u660E\u672A\u7ED3\u675F", span: { start: i, end: source.length }, severity: openContainers ? "warning" : "error" });
          break;
        }
        flush(i);
        const d = declaration(source.slice(i + 6, end - 1), i, end, diagnostics);
        if (d)
          declarations.push(d);
        i = end;
        textStart = i;
        continue;
      }
      if (source.startsWith("{#if ", i) || source.startsWith("{#each ", i)) {
        const end = balanced(source, i);
        if (end < 0) {
          diagnostics.push({ code: "incomplete_directive", message: "\u63A7\u5236\u6307\u4EE4\u672A\u7ED3\u675F", span: { start: i, end: source.length }, severity: openContainers ? "warning" : "error" });
          break;
        }
        flush(i);
        const raw = source.slice(i + 2, end - 1).trim();
        let node = null;
        if (raw.startsWith("if "))
          node = { kind: "if", test: raw.slice(3).trim(), children: [], span: { start: i, end: -1 } };
        else {
          const m = /^each\s+([\s\S]+)\s+as\s+([\w$]+)(?:\s*,\s*([\w$]+))?$/.exec(raw);
          if (m)
            node = { kind: "each", source: m[1], item: m[2], index: m[3], children: [], span: { start: i, end: -1 } };
        }
        if (node) {
          add(node);
          stack.push({ name: node.kind, node });
          target = node.children;
        } else
          diagnostics.push({ code: "directive_syntax", message: "\u65E0\u6548\u5FAA\u73AF\u6216\u6761\u4EF6\u6307\u4EE4", span: { start: i, end }, severity: "error" });
        i = end;
        textStart = i;
        continue;
      }
      if (source.startsWith("{/if}", i) || source.startsWith("{/each}", i)) {
        const name = source.startsWith("{/if}", i) ? "if" : "each", end = i + name.length + 3;
        flush(i);
        if (stack.at(-1)?.name === name) {
          const entry = stack.pop();
          entry.node.span.end = end;
          target = stack.at(-1)?.node.children || children;
        } else
          diagnostics.push({ code: "mismatched_close", message: `\u610F\u5916\u7684 ${name} \u7ED3\u675F\u6307\u4EE4`, span: { start: i, end }, severity: "error" });
        i = end;
        textStart = i;
        continue;
      }
      if (source[i] === "<" && /^<\/?[A-Za-z][\w-]*/.test(source.slice(i))) {
        const end = tagEnd(source, i);
        if (end < 0) {
          diagnostics.push({ code: "incomplete_tag", message: "\u6807\u7B7E\u672A\u7ED3\u675F", span: { start: i, end: source.length }, severity: openContainers ? "warning" : "error" });
          break;
        }
        const raw = source.slice(i + 1, end - 1), close = raw.startsWith("/"), name = /^\/?([A-Za-z][\w-]*)/.exec(raw)?.[1] || "";
        if (!componentNames.has(name)) {
          i = !close && !/\/\s*$/.test(raw) ? opaqueEnd(source, end, name) : end;
          continue;
        }
        flush(i);
        if ((name === "AppBlock" || name === "CodeBlock" || name === "WritingBlock") && !close) {
          const attrs = parseAttributes(raw.slice(name.length), i + 1 + name.length, diagnostics);
          if (name === "AppBlock") {
            const invalid = Object.entries(attrs).some(([key, value]) => !["title", "icon", "variant", "app_block_id"].includes(key) || value.kind !== "literal" || typeof value.value !== "string");
            if (invalid)
              diagnostics.push({ code: "app_block_attribute", message: "AppBlock \u53EA\u63A5\u53D7 title\u3001icon\u3001variant\u3001app_block_id \u5B57\u7B26\u4E32\u5C5E\u6027", span: { start: i, end }, severity: "error" });
          } else if (Object.values(attrs).some((value) => value.kind === "expression"))
            diagnostics.push({ code: "raw_block_attribute", message: `${name} \u4E0D\u63A5\u53D7\u8868\u8FBE\u5F0F\u5C5E\u6027`, span: { start: i, end }, severity: "error" });
          const closing = rawBlockClose(source, end, name);
          if (!closing) {
            diagnostics.push({ code: "incomplete_raw_block", message: `${name} \u7F3A\u5C11\u72EC\u5360\u4E00\u884C\u7684 </${name}>`, span: { start: i, end: source.length }, severity: final ? "error" : "warning" });
            i = source.length;
            textStart = i;
            break;
          }
          const content = source.slice(end, closing.start);
          if (new TextEncoder().encode(content).length > 32e3)
            diagnostics.push({ code: "raw_block_budget", message: `${name} \u5185\u5BB9\u8D85\u8FC7 32 KB`, span: { start: end, end: closing.start }, severity: "error" });
          add({ kind: "element", name, attributes: attrs, children: [], rawContent: content, span: { start: i, end: closing.end } });
          i = closing.end;
          textStart = i;
          continue;
        }
        if (close) {
          if (stack.at(-1)?.name === name) {
            const entry = stack.pop();
            entry.node.span.end = end;
            target = stack.at(-1)?.node.children || children;
          } else
            diagnostics.push({ code: "mismatched_close", message: `\u7ED3\u675F\u6807\u7B7E </${name}> \u4E0D\u5339\u914D`, span: { start: i, end }, severity: "error" });
        } else {
          const self = /\/\s*$/.test(raw), attrs = raw.slice(name.length, self ? raw.lastIndexOf("/") : void 0);
          const node = { kind: "element", name, attributes: parseAttributes(attrs, i + 1 + name.length, diagnostics), children: [], span: { start: i, end: self ? end : -1 } };
          add(node);
          if (!self) {
            if (stack.length >= limits.depth) {
              diagnostics.push({ code: "depth_budget", message: "\u5D4C\u5957\u8D85\u8FC7 32 \u5C42", span: { start: i, end }, severity: "error" });
              node.span.end = end;
            } else {
              stack.push({ name, node });
              target = node.children;
            }
          }
        }
        i = end;
        textStart = i;
        continue;
      }
      if (stack.length > 0 && source[i] === "{" && !source.startsWith("{@", i) && !source.startsWith("{#", i)) {
        const end = balanced(source, i);
        if (end > i + 2) {
          const expr = source.slice(i + 1, end - 1).trim();
          if (expr && !expr.startsWith("/")) {
            flush(i);
            add({ kind: "expression", source: expr, span: { start: i, end } });
            i = end;
            textStart = i;
            continue;
          }
        }
        if (openContainers && end < 0) {
          diagnostics.push({ code: "incomplete_expression", message: "\u8868\u8FBE\u5F0F\u672A\u7ED3\u675F", span: { start: i, end: source.length }, severity: "warning" });
          break;
        }
      }
      if (openContainers && source[i] === "{" && balanced(source, i) < 0) {
        diagnostics.push({ code: "incomplete_expression", message: "\u7ED3\u6784\u672A\u7ED3\u675F", span: { start: i, end: source.length }, severity: "warning" });
        break;
      }
      if (openContainers && (source.slice(i) === "<" || source.slice(i) === "</")) {
        diagnostics.push({ code: "incomplete_tag", message: "\u6807\u7B7E\u672A\u7ED3\u675F", span: { start: i, end: source.length }, severity: "warning" });
        break;
      }
      i++;
    }
  } catch (e) {
    diagnostics.push({ code: "resource_budget", message: String(e), span: { start: i, end: i }, severity: "error" });
  }
  flush(i);
  if (i < source.length && final) {
    target.push({ kind: "text", text: source.slice(i), span: { start: i, end: source.length } });
  }
  for (const entry of stack) {
    diagnostics.push({ code: "unclosed_tag", message: `\u672A\u95ED\u5408 ${entry.name}`, span: { start: entry.node.span.start, end: source.length }, severity: final ? "error" : "warning" });
    if (final)
      entry.node.span.end = source.length;
  }
  return { protocol: "iui/0.1", messageId, declarations, children: final ? children : committed(children, openContainers), diagnostics, complete: final && diagnostics.every((d) => d.severity !== "error") };
}
function parseDslPreview(source, messageId = "preview") {
  return parseDsl(source, messageId, false, true);
}

// ../../../../../Desktop/code/ai/aima-connect/node_modules/acorn/dist/acorn.mjs
var astralIdentifierCodes = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 574, 3, 9, 9, 7, 9, 32, 4, 318, 1, 78, 5, 71, 10, 50, 3, 123, 2, 54, 14, 32, 10, 3, 1, 11, 3, 46, 10, 8, 0, 46, 9, 7, 2, 37, 13, 2, 9, 6, 1, 45, 0, 13, 2, 49, 13, 9, 3, 2, 11, 83, 11, 7, 0, 3, 0, 158, 11, 6, 9, 7, 3, 56, 1, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 68, 8, 2, 0, 3, 0, 2, 3, 2, 4, 2, 0, 15, 1, 83, 17, 10, 9, 5, 0, 82, 19, 13, 9, 214, 6, 3, 8, 28, 1, 83, 16, 16, 9, 82, 12, 9, 9, 7, 19, 58, 14, 5, 9, 243, 14, 166, 9, 71, 5, 2, 1, 3, 3, 2, 0, 2, 1, 13, 9, 120, 6, 3, 6, 4, 0, 29, 9, 41, 6, 2, 3, 9, 0, 10, 10, 47, 15, 199, 7, 137, 9, 54, 7, 2, 7, 17, 9, 57, 21, 2, 13, 123, 5, 4, 0, 2, 1, 2, 6, 2, 0, 9, 9, 49, 4, 2, 1, 2, 4, 9, 9, 55, 9, 266, 3, 10, 1, 2, 0, 49, 6, 4, 4, 14, 10, 5350, 0, 7, 14, 11465, 27, 2343, 9, 87, 9, 39, 4, 60, 6, 26, 9, 535, 9, 470, 0, 2, 54, 8, 3, 82, 0, 12, 1, 19628, 1, 4178, 9, 519, 45, 3, 22, 543, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 513, 54, 5, 49, 9, 0, 15, 0, 23, 4, 2, 14, 1361, 6, 2, 16, 3, 6, 2, 1, 2, 4, 101, 0, 161, 6, 10, 9, 357, 0, 62, 13, 499, 13, 245, 1, 2, 9, 233, 0, 3, 0, 8, 1, 6, 0, 475, 6, 110, 6, 6, 9, 4759, 9, 787719, 239];
var astralIdentifierStartCodes = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 14, 29, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 19, 35, 5, 35, 5, 39, 9, 51, 13, 10, 2, 14, 2, 6, 2, 1, 2, 10, 2, 14, 2, 6, 2, 1, 4, 51, 13, 310, 10, 21, 11, 7, 25, 5, 2, 41, 2, 8, 70, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 66, 18, 2, 1, 11, 21, 11, 25, 7, 25, 39, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 28, 43, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 56, 50, 14, 50, 14, 35, 39, 27, 10, 22, 251, 41, 7, 1, 17, 5, 57, 28, 11, 0, 9, 21, 43, 17, 47, 20, 28, 22, 13, 52, 58, 1, 3, 0, 14, 44, 33, 24, 27, 35, 30, 0, 3, 0, 9, 34, 4, 0, 13, 47, 15, 3, 22, 0, 2, 0, 36, 17, 2, 24, 20, 1, 64, 6, 2, 0, 2, 3, 2, 14, 2, 9, 8, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 19, 0, 13, 4, 31, 9, 2, 0, 3, 0, 2, 37, 2, 0, 26, 0, 2, 0, 45, 52, 19, 3, 21, 2, 31, 47, 21, 1, 2, 0, 185, 46, 42, 3, 37, 47, 21, 0, 60, 42, 14, 0, 72, 26, 38, 6, 186, 43, 117, 63, 32, 7, 3, 0, 3, 7, 2, 1, 2, 23, 16, 0, 2, 0, 95, 7, 3, 38, 17, 0, 2, 0, 29, 0, 11, 39, 8, 0, 22, 0, 12, 45, 20, 0, 19, 72, 200, 32, 32, 8, 2, 36, 18, 0, 50, 29, 113, 6, 2, 1, 2, 37, 22, 0, 26, 5, 2, 1, 2, 31, 15, 0, 24, 43, 261, 18, 16, 0, 2, 12, 2, 33, 125, 0, 80, 921, 103, 110, 18, 195, 2637, 96, 16, 1071, 18, 5, 26, 3994, 6, 582, 6842, 29, 1763, 568, 8, 30, 18, 78, 18, 29, 19, 47, 17, 3, 32, 20, 6, 18, 433, 44, 212, 63, 33, 24, 3, 24, 45, 74, 6, 0, 67, 12, 65, 1, 2, 0, 15, 4, 10, 7381, 42, 31, 98, 114, 8702, 3, 2, 6, 2, 1, 2, 290, 16, 0, 30, 2, 3, 0, 15, 3, 9, 395, 2309, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 1845, 30, 7, 5, 262, 61, 147, 44, 11, 6, 17, 0, 322, 29, 19, 43, 485, 27, 229, 29, 3, 0, 208, 30, 2, 2, 2, 1, 2, 6, 3, 4, 10, 1, 225, 6, 2, 3, 2, 1, 2, 14, 2, 196, 60, 67, 8, 0, 1205, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42719, 33, 4381, 3, 5773, 3, 7472, 16, 621, 2467, 541, 1507, 4938, 6, 8489];
var nonASCIIidentifierChars = "\u200C\u200D\xB7\u0300-\u036F\u0387\u0483-\u0487\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u0669\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u06F0-\u06F9\u0711\u0730-\u074A\u07A6-\u07B0\u07C0-\u07C9\u07EB-\u07F3\u07FD\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u0897-\u089F\u08CA-\u08E1\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0966-\u096F\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u09E6-\u09EF\u09FE\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A66-\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0AE6-\u0AEF\u0AFA-\u0AFF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B55-\u0B57\u0B62\u0B63\u0B66-\u0B6F\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0BE6-\u0BEF\u0C00-\u0C04\u0C3C\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0CE6-\u0CEF\u0CF3\u0D00-\u0D03\u0D3B\u0D3C\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D66-\u0D6F\u0D81-\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0E50-\u0E59\u0EB1\u0EB4-\u0EBC\u0EC8-\u0ECE\u0ED0-\u0ED9\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1040-\u1049\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109D\u135D-\u135F\u1369-\u1371\u1712-\u1715\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u17E0-\u17E9\u180B-\u180D\u180F-\u1819\u18A9\u1920-\u192B\u1930-\u193B\u1946-\u194F\u19D0-\u19DA\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AB0-\u1ABD\u1ABF-\u1ADD\u1AE0-\u1AEB\u1B00-\u1B04\u1B34-\u1B44\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BF3\u1C24-\u1C37\u1C40-\u1C49\u1C50-\u1C59\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1DC0-\u1DFF\u200C\u200D\u203F\u2040\u2054\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\u30FB\uA620-\uA629\uA66F\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA82C\uA880\uA881\uA8B4-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F1\uA8FF-\uA909\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9D0-\uA9D9\uA9E5\uA9F0-\uA9F9\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA50-\uAA59\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uABF0-\uABF9\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFF10-\uFF19\uFF3F\uFF65";
var nonASCIIidentifierStartChars = "\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088F\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5C\u0C5D\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDC-\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C8A\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7DC\uA7F1-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC";
var reservedWords = {
  3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
  5: "class enum extends super const export import",
  6: "enum",
  strict: "implements interface let package private protected public static yield",
  strictBind: "eval arguments"
};
var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";
var keywords$1 = {
  5: ecma5AndLessKeywords,
  "5module": ecma5AndLessKeywords + " export import",
  6: ecma5AndLessKeywords + " const class extends export import super"
};
var keywordRelationalOperator = /^in(stanceof)?$/;
var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");
function isInAstralSet(code, set) {
  var pos = 65536;
  for (var i = 0; i < set.length; i += 2) {
    pos += set[i];
    if (pos > code) {
      return false;
    }
    pos += set[i + 1];
    if (pos >= code) {
      return true;
    }
  }
  return false;
}
function isIdentifierStart(code, astral) {
  if (code < 65) {
    return code === 36;
  }
  if (code < 91) {
    return true;
  }
  if (code < 97) {
    return code === 95;
  }
  if (code < 123) {
    return true;
  }
  if (code <= 65535) {
    return code >= 170 && nonASCIIidentifierStart.test(String.fromCharCode(code));
  }
  if (astral === false) {
    return false;
  }
  return isInAstralSet(code, astralIdentifierStartCodes);
}
function isIdentifierChar(code, astral) {
  if (code < 48) {
    return code === 36;
  }
  if (code < 58) {
    return true;
  }
  if (code < 65) {
    return false;
  }
  if (code < 91) {
    return true;
  }
  if (code < 97) {
    return code === 95;
  }
  if (code < 123) {
    return true;
  }
  if (code <= 65535) {
    return code >= 170 && nonASCIIidentifier.test(String.fromCharCode(code));
  }
  if (astral === false) {
    return false;
  }
  return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes);
}
var TokenType = function TokenType2(label, conf) {
  if (conf === void 0)
    conf = {};
  this.label = label;
  this.keyword = conf.keyword;
  this.beforeExpr = !!conf.beforeExpr;
  this.startsExpr = !!conf.startsExpr;
  this.isLoop = !!conf.isLoop;
  this.isAssign = !!conf.isAssign;
  this.prefix = !!conf.prefix;
  this.postfix = !!conf.postfix;
  this.binop = conf.binop || null;
  this.updateContext = null;
};
function binop(name, prec) {
  return new TokenType(name, { beforeExpr: true, binop: prec });
}
var beforeExpr = { beforeExpr: true };
var startsExpr = { startsExpr: true };
var keywords = {};
function kw(name, options) {
  if (options === void 0)
    options = {};
  options.keyword = name;
  return keywords[name] = new TokenType(name, options);
}
var types$1 = {
  num: new TokenType("num", startsExpr),
  regexp: new TokenType("regexp", startsExpr),
  string: new TokenType("string", startsExpr),
  name: new TokenType("name", startsExpr),
  privateId: new TokenType("privateId", startsExpr),
  eof: new TokenType("eof"),
  // Punctuation token types.
  bracketL: new TokenType("[", { beforeExpr: true, startsExpr: true }),
  bracketR: new TokenType("]"),
  braceL: new TokenType("{", { beforeExpr: true, startsExpr: true }),
  braceR: new TokenType("}"),
  parenL: new TokenType("(", { beforeExpr: true, startsExpr: true }),
  parenR: new TokenType(")"),
  comma: new TokenType(",", beforeExpr),
  semi: new TokenType(";", beforeExpr),
  colon: new TokenType(":", beforeExpr),
  dot: new TokenType("."),
  question: new TokenType("?", beforeExpr),
  questionDot: new TokenType("?."),
  arrow: new TokenType("=>", beforeExpr),
  template: new TokenType("template"),
  invalidTemplate: new TokenType("invalidTemplate"),
  ellipsis: new TokenType("...", beforeExpr),
  backQuote: new TokenType("`", startsExpr),
  dollarBraceL: new TokenType("${", { beforeExpr: true, startsExpr: true }),
  // Operators. These carry several kinds of properties to help the
  // parser use them properly (the presence of these properties is
  // what categorizes them as operators).
  //
  // `binop`, when present, specifies that this operator is a binary
  // operator, and will refer to its precedence.
  //
  // `prefix` and `postfix` mark the operator as a prefix or postfix
  // unary operator.
  //
  // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
  // binary operators with a very low precedence, that should result
  // in AssignmentExpression nodes.
  eq: new TokenType("=", { beforeExpr: true, isAssign: true }),
  assign: new TokenType("_=", { beforeExpr: true, isAssign: true }),
  incDec: new TokenType("++/--", { prefix: true, postfix: true, startsExpr: true }),
  prefix: new TokenType("!/~", { beforeExpr: true, prefix: true, startsExpr: true }),
  logicalOR: binop("||", 1),
  logicalAND: binop("&&", 2),
  bitwiseOR: binop("|", 3),
  bitwiseXOR: binop("^", 4),
  bitwiseAND: binop("&", 5),
  equality: binop("==/!=/===/!==", 6),
  relational: binop("</>/<=/>=", 7),
  bitShift: binop("<</>>/>>>", 8),
  plusMin: new TokenType("+/-", { beforeExpr: true, binop: 9, prefix: true, startsExpr: true }),
  modulo: binop("%", 10),
  star: binop("*", 10),
  slash: binop("/", 10),
  starstar: new TokenType("**", { beforeExpr: true }),
  coalesce: binop("??", 1),
  // Keyword token types.
  _break: kw("break"),
  _case: kw("case", beforeExpr),
  _catch: kw("catch"),
  _continue: kw("continue"),
  _debugger: kw("debugger"),
  _default: kw("default", beforeExpr),
  _do: kw("do", { isLoop: true, beforeExpr: true }),
  _else: kw("else", beforeExpr),
  _finally: kw("finally"),
  _for: kw("for", { isLoop: true }),
  _function: kw("function", startsExpr),
  _if: kw("if"),
  _return: kw("return", beforeExpr),
  _switch: kw("switch"),
  _throw: kw("throw", beforeExpr),
  _try: kw("try"),
  _var: kw("var"),
  _const: kw("const"),
  _while: kw("while", { isLoop: true }),
  _with: kw("with"),
  _new: kw("new", { beforeExpr: true, startsExpr: true }),
  _this: kw("this", startsExpr),
  _super: kw("super", startsExpr),
  _class: kw("class", startsExpr),
  _extends: kw("extends", beforeExpr),
  _export: kw("export"),
  _import: kw("import", startsExpr),
  _null: kw("null", startsExpr),
  _true: kw("true", startsExpr),
  _false: kw("false", startsExpr),
  _in: kw("in", { beforeExpr: true, binop: 7 }),
  _instanceof: kw("instanceof", { beforeExpr: true, binop: 7 }),
  _typeof: kw("typeof", { beforeExpr: true, prefix: true, startsExpr: true }),
  _void: kw("void", { beforeExpr: true, prefix: true, startsExpr: true }),
  _delete: kw("delete", { beforeExpr: true, prefix: true, startsExpr: true })
};
var lineBreak = /\r\n?|\n|\u2028|\u2029/;
var lineBreakG = new RegExp(lineBreak.source, "g");
function isNewLine(code) {
  return code === 10 || code === 13 || code === 8232 || code === 8233;
}
function nextLineBreak(code, from, end) {
  if (end === void 0)
    end = code.length;
  for (var i = from; i < end; i++) {
    var next = code.charCodeAt(i);
    if (isNewLine(next)) {
      return i < end - 1 && next === 13 && code.charCodeAt(i + 1) === 10 ? i + 2 : i + 1;
    }
  }
  return -1;
}
var nonASCIIwhitespace = /[\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/;
var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;
var ref = Object.prototype;
var hasOwnProperty = ref.hasOwnProperty;
var toString = ref.toString;
var hasOwn = Object.hasOwn || function(obj, propName) {
  return hasOwnProperty.call(obj, propName);
};
var isArray = Array.isArray || function(obj) {
  return toString.call(obj) === "[object Array]";
};
var regexpCache = /* @__PURE__ */ Object.create(null);
function wordsRegexp(words) {
  return regexpCache[words] || (regexpCache[words] = new RegExp("^(?:" + words.replace(/ /g, "|") + ")$"));
}
function codePointToString(code) {
  if (code <= 65535) {
    return String.fromCharCode(code);
  }
  code -= 65536;
  return String.fromCharCode((code >> 10) + 55296, (code & 1023) + 56320);
}
var loneSurrogate = /(?:[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/;
var Position = function Position2(line, col) {
  this.line = line;
  this.column = col;
};
Position.prototype.offset = function offset(n) {
  return new Position(this.line, this.column + n);
};
var SourceLocation = function SourceLocation2(p, start, end) {
  this.start = start;
  this.end = end;
  if (p.sourceFile !== null) {
    this.source = p.sourceFile;
  }
};
function getLineInfo(input, offset2) {
  for (var line = 1, cur = 0; ; ) {
    var nextBreak = nextLineBreak(input, cur, offset2);
    if (nextBreak < 0) {
      return new Position(line, offset2 - cur);
    }
    ++line;
    cur = nextBreak;
  }
}
var defaultOptions = {
  // `ecmaVersion` indicates the ECMAScript version to parse. Must be
  // either 3, 5, 6 (or 2015), 7 (2016), 8 (2017), 9 (2018), 10
  // (2019), 11 (2020), 12 (2021), 13 (2022), 14 (2023), or `"latest"`
  // (the latest version the library supports). This influences
  // support for strict mode, the set of reserved words, and support
  // for new syntax features.
  ecmaVersion: null,
  // `sourceType` indicates the mode the code should be parsed in.
  // Can be either `"script"`, `"module"` or `"commonjs"`. This influences global
  // strict mode and parsing of `import` and `export` declarations.
  sourceType: "script",
  // When set to true, enable strict parsing mode even if `sourceType`
  // is `"script"`.
  strict: false,
  // `onInsertedSemicolon` can be a callback that will be called when
  // a semicolon is automatically inserted. It will be passed the
  // position of the inserted semicolon as an offset, and if
  // `locations` is enabled, it is given the location as a `{line,
  // column}` object as second argument.
  onInsertedSemicolon: null,
  // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
  // trailing commas.
  onTrailingComma: null,
  // By default, reserved words are only enforced if ecmaVersion >= 5.
  // Set `allowReserved` to a boolean value to explicitly turn this on
  // an off. When this option has the value "never", reserved words
  // and keywords can also not be used as property names.
  allowReserved: null,
  // When enabled, a return at the top level is not considered an
  // error.
  allowReturnOutsideFunction: false,
  // When enabled, import/export statements are not constrained to
  // appearing at the top of the program, and an import.meta expression
  // in a script isn't considered an error.
  allowImportExportEverywhere: false,
  // By default, await identifiers are allowed to appear at the top-level scope only if ecmaVersion >= 2022.
  // When enabled, await identifiers are allowed to appear at the top-level scope,
  // but they are still not allowed in non-async functions.
  allowAwaitOutsideFunction: null,
  // When enabled, super identifiers are not constrained to
  // appearing in methods and do not raise an error when they appear elsewhere.
  allowSuperOutsideMethod: null,
  // When enabled, hashbang directive in the beginning of file is
  // allowed and treated as a line comment. Enabled by default when
  // `ecmaVersion` >= 2023.
  allowHashBang: false,
  // By default, the parser will verify that private properties are
  // only used in places where they are valid and have been declared.
  // Set this to false to turn such checks off.
  checkPrivateFields: true,
  // When `locations` is on, `loc` properties holding objects with
  // `start` and `end` properties in `{line, column}` form (with
  // line being 1-based and column 0-based) will be attached to the
  // nodes.
  locations: false,
  // Pass an optional `{line, column}` object to use for the start of
  // the parse. This is mostly useful when using `parseExpressionAt`
  // with `locations: true`, to prevent the parser from having to
  // determine the line position at the start position.
  startLocation: null,
  // A function can be passed as `onToken` option, which will
  // cause Acorn to call that function with object in the same
  // format as tokens returned from `tokenizer().getToken()`. Note
  // that you are not allowed to call the parser from the
  // callback—that will corrupt its internal state.
  onToken: null,
  // A function can be passed as `onComment` option, which will
  // cause Acorn to call that function with `(block, text, start,
  // end)` parameters whenever a comment is skipped. `block` is a
  // boolean indicating whether this is a block (`/* */`) comment,
  // `text` is the content of the comment, and `start` and `end` are
  // character offsets that denote the start and end of the comment.
  // When the `locations` option is on, two more parameters are
  // passed, the full `{line, column}` locations of the start and
  // end of the comments. Note that you are not allowed to call the
  // parser from the callback—that will corrupt its internal state.
  // When this option has an array as value, objects representing the
  // comments are pushed to it.
  onComment: null,
  // Nodes have their start and end characters offsets recorded in
  // `start` and `end` properties (directly on the node, rather than
  // the `loc` object, which holds line/column data. To also add a
  // [semi-standardized][range] `range` property holding a `[start,
  // end]` array with the same numbers, set the `ranges` option to
  // `true`.
  //
  // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
  ranges: false,
  // It is possible to parse multiple files into a single AST by
  // passing the tree produced by parsing the first file as
  // `program` option in subsequent parses. This will add the
  // toplevel forms of the parsed file to the `Program` (top) node
  // of an existing parse tree.
  program: null,
  // When `locations` is on, you can pass this to record the source
  // file in every node's `loc` object.
  sourceFile: null,
  // This value, if given, is stored in every node, whether
  // `locations` is on or off.
  directSourceFile: null,
  // When enabled, parenthesized expressions are represented by
  // (non-standard) ParenthesizedExpression nodes
  preserveParens: false
};
var warnedAboutEcmaVersion = false;
function getOptions(opts) {
  var options = {};
  for (var opt in defaultOptions) {
    options[opt] = opts && hasOwn(opts, opt) ? opts[opt] : defaultOptions[opt];
  }
  if (options.ecmaVersion === "latest") {
    options.ecmaVersion = 1e8;
  } else if (options.ecmaVersion == null) {
    if (!warnedAboutEcmaVersion && typeof console === "object" && console.warn) {
      warnedAboutEcmaVersion = true;
      console.warn("Since Acorn 8.0.0, options.ecmaVersion is required.\nDefaulting to 2020, but this will stop working in the future.");
    }
    options.ecmaVersion = 11;
  } else if (options.ecmaVersion >= 2015) {
    options.ecmaVersion -= 2009;
  }
  if (options.allowReserved == null) {
    options.allowReserved = options.ecmaVersion < 5;
  }
  if (!opts || opts.allowHashBang == null) {
    options.allowHashBang = options.ecmaVersion >= 14;
  }
  if (isArray(options.onToken)) {
    var tokens = options.onToken;
    options.onToken = function(token) {
      return tokens.push(token);
    };
  }
  if (isArray(options.onComment)) {
    options.onComment = pushComment(options, options.onComment);
  }
  if (options.sourceType === "commonjs" && options.allowAwaitOutsideFunction) {
    throw new Error("Cannot use allowAwaitOutsideFunction with sourceType: commonjs");
  }
  return options;
}
function pushComment(options, array) {
  return function(block, text, start, end, startLoc, endLoc) {
    var comment = {
      type: block ? "Block" : "Line",
      value: text,
      start,
      end
    };
    if (options.locations) {
      comment.loc = new SourceLocation(this, startLoc, endLoc);
    }
    if (options.ranges) {
      comment.range = [start, end];
    }
    array.push(comment);
  };
}
var SCOPE_TOP = 1;
var SCOPE_FUNCTION = 2;
var SCOPE_ASYNC = 4;
var SCOPE_GENERATOR = 8;
var SCOPE_ARROW = 16;
var SCOPE_SIMPLE_CATCH = 32;
var SCOPE_SUPER = 64;
var SCOPE_DIRECT_SUPER = 128;
var SCOPE_CLASS_STATIC_BLOCK = 256;
var SCOPE_CLASS_FIELD_INIT = 512;
var SCOPE_SWITCH = 1024;
var SCOPE_VAR = SCOPE_TOP | SCOPE_FUNCTION | SCOPE_CLASS_STATIC_BLOCK;
function functionFlags(async, generator) {
  return SCOPE_FUNCTION | (async ? SCOPE_ASYNC : 0) | (generator ? SCOPE_GENERATOR : 0);
}
var BIND_NONE = 0;
var BIND_VAR = 1;
var BIND_LEXICAL = 2;
var BIND_FUNCTION = 3;
var BIND_SIMPLE_CATCH = 4;
var BIND_OUTSIDE = 5;
var Parser = function Parser2(options, input, startPos) {
  this.options = options = getOptions(options);
  this.sourceFile = options.sourceFile;
  this.keywords = wordsRegexp(keywords$1[options.ecmaVersion >= 6 ? 6 : options.sourceType === "module" ? "5module" : 5]);
  var reserved = "";
  if (options.allowReserved !== true) {
    reserved = reservedWords[options.ecmaVersion >= 6 ? 6 : options.ecmaVersion === 5 ? 5 : 3];
    if (options.sourceType === "module") {
      reserved += " await";
    }
  }
  this.reservedWords = wordsRegexp(reserved);
  var reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict;
  this.reservedWordsStrict = wordsRegexp(reservedStrict);
  this.reservedWordsStrictBind = wordsRegexp(reservedStrict + " " + reservedWords.strictBind);
  this.input = String(input);
  this.containsEsc = false;
  this.pos = startPos || 0;
  this.curLine = 1;
  if (options.startLocation) {
    this.lineStart = this.pos - options.startLocation.column;
    this.curLine = options.startLocation.line;
  } else if (startPos) {
    this.lineStart = this.input.lastIndexOf("\n", startPos - 1) + 1;
    if (this.options.locations) {
      this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length;
    }
  } else {
    this.lineStart = 0;
  }
  this.type = types$1.eof;
  this.value = null;
  this.start = this.end = this.pos;
  this.startLoc = this.endLoc = this.curPosition();
  this.lastTokEndLoc = this.lastTokStartLoc = null;
  this.lastTokStart = this.lastTokEnd = this.pos;
  this.context = this.initialContext();
  this.exprAllowed = true;
  this.inModule = options.sourceType === "module";
  this.strict = this.inModule || options.strict === true || this.strictDirective(this.pos);
  this.potentialArrowAt = -1;
  this.potentialArrowInForAwait = false;
  this.yieldPos = this.awaitPos = this.awaitIdentPos = 0;
  this.labels = [];
  this.undefinedExports = /* @__PURE__ */ Object.create(null);
  if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === "#!") {
    this.skipLineComment(2);
  }
  this.scopeStack = [];
  this.enterScope(
    this.options.sourceType === "commonjs" ? SCOPE_FUNCTION : SCOPE_TOP
  );
  this.regexpState = null;
  this.privateNameStack = [];
};
var prototypeAccessors = { inFunction: { configurable: true }, inGenerator: { configurable: true }, inAsync: { configurable: true }, canAwait: { configurable: true }, allowReturn: { configurable: true }, allowSuper: { configurable: true }, allowDirectSuper: { configurable: true }, treatFunctionsAsVar: { configurable: true }, allowNewDotTarget: { configurable: true }, allowUsing: { configurable: true }, inClassStaticBlock: { configurable: true } };
Parser.prototype.parse = function parse() {
  var this$1$1 = this;
  var node = this.options.program || this.startNode();
  this.nextToken();
  return this.catchStackOverflow(function() {
    return this$1$1.parseTopLevel(node);
  });
};
prototypeAccessors.inFunction.get = function() {
  return (this.currentVarScope().flags & SCOPE_FUNCTION) > 0;
};
prototypeAccessors.inGenerator.get = function() {
  return (this.currentVarScope().flags & SCOPE_GENERATOR) > 0;
};
prototypeAccessors.inAsync.get = function() {
  return (this.currentVarScope().flags & SCOPE_ASYNC) > 0;
};
prototypeAccessors.canAwait.get = function() {
  for (var i = this.scopeStack.length - 1; i >= 0; i--) {
    var ref2 = this.scopeStack[i];
    var flags = ref2.flags;
    if (flags & (SCOPE_CLASS_STATIC_BLOCK | SCOPE_CLASS_FIELD_INIT)) {
      return false;
    }
    if (flags & SCOPE_FUNCTION) {
      return (flags & SCOPE_ASYNC) > 0;
    }
  }
  return this.inModule && this.options.ecmaVersion >= 13 || this.options.allowAwaitOutsideFunction;
};
prototypeAccessors.allowReturn.get = function() {
  if (this.inFunction) {
    return true;
  }
  if (this.options.allowReturnOutsideFunction && this.currentVarScope().flags & SCOPE_TOP) {
    return true;
  }
  return false;
};
prototypeAccessors.allowSuper.get = function() {
  var ref2 = this.currentThisScope();
  var flags = ref2.flags;
  return (flags & SCOPE_SUPER) > 0 || this.options.allowSuperOutsideMethod;
};
prototypeAccessors.allowDirectSuper.get = function() {
  return (this.currentThisScope().flags & SCOPE_DIRECT_SUPER) > 0;
};
prototypeAccessors.treatFunctionsAsVar.get = function() {
  return this.treatFunctionsAsVarInScope(this.currentScope());
};
prototypeAccessors.allowNewDotTarget.get = function() {
  for (var i = this.scopeStack.length - 1; i >= 0; i--) {
    var ref2 = this.scopeStack[i];
    var flags = ref2.flags;
    if (flags & (SCOPE_CLASS_STATIC_BLOCK | SCOPE_CLASS_FIELD_INIT) || flags & SCOPE_FUNCTION && !(flags & SCOPE_ARROW)) {
      return true;
    }
  }
  return false;
};
prototypeAccessors.allowUsing.get = function() {
  var ref2 = this.currentScope();
  var flags = ref2.flags;
  if (flags & SCOPE_SWITCH) {
    return false;
  }
  if (!this.inModule && flags & SCOPE_TOP) {
    return false;
  }
  return true;
};
prototypeAccessors.inClassStaticBlock.get = function() {
  return (this.currentVarScope().flags & SCOPE_CLASS_STATIC_BLOCK) > 0;
};
Parser.extend = function extend() {
  var plugins = [], len = arguments.length;
  while (len--)
    plugins[len] = arguments[len];
  var cls = this;
  for (var i = 0; i < plugins.length; i++) {
    cls = plugins[i](cls);
  }
  return cls;
};
Parser.parse = function parse2(input, options) {
  return new this(options, input).parse();
};
Parser.parseExpressionAt = function parseExpressionAt(input, pos, options) {
  var parser = new this(options, input, pos);
  parser.nextToken();
  return parser.parseExpression();
};
Parser.tokenizer = function tokenizer(input, options) {
  return new this(options, input);
};
Object.defineProperties(Parser.prototype, prototypeAccessors);
var pp$9 = Parser.prototype;
var literal = /^(?:'((?:\\[^]|[^'\\])*?)'|"((?:\\[^]|[^"\\])*?)")/;
pp$9.strictDirective = function(start) {
  if (this.options.ecmaVersion < 5) {
    return false;
  }
  for (; ; ) {
    skipWhiteSpace.lastIndex = start;
    start += skipWhiteSpace.exec(this.input)[0].length;
    var match = literal.exec(this.input.slice(start));
    if (!match) {
      return false;
    }
    if ((match[1] || match[2]) === "use strict") {
      skipWhiteSpace.lastIndex = start + match[0].length;
      var spaceAfter = skipWhiteSpace.exec(this.input), end = spaceAfter.index + spaceAfter[0].length;
      var next = this.input.charAt(end);
      return next === ";" || next === "}" || lineBreak.test(spaceAfter[0]) && !(/[(`.[+\-/*%<>=,?^&]/.test(next) || next === "!" && this.input.charAt(end + 1) === "=");
    }
    start += match[0].length;
    skipWhiteSpace.lastIndex = start;
    start += skipWhiteSpace.exec(this.input)[0].length;
    if (this.input[start] === ";") {
      start++;
    }
  }
};
pp$9.eat = function(type) {
  if (this.type === type) {
    this.next();
    return true;
  } else {
    return false;
  }
};
pp$9.isContextual = function(name) {
  return this.type === types$1.name && this.value === name && !this.containsEsc;
};
pp$9.eatContextual = function(name) {
  if (!this.isContextual(name)) {
    return false;
  }
  this.next();
  return true;
};
pp$9.catchStackOverflow = function(f) {
  try {
    return f();
  } catch (e) {
    if (e instanceof Error && (/\bstack\b.*\b(exceeded|overflow)\b/i.test(e.message) || /\btoo much recursion\b/i.test(e.message))) {
      this.raise(this.start, "Not enough stack space to parse input");
    } else {
      throw e;
    }
  }
};
pp$9.expectContextual = function(name) {
  if (!this.eatContextual(name)) {
    this.unexpected();
  }
};
pp$9.canInsertSemicolon = function() {
  return this.type === types$1.eof || this.type === types$1.braceR || lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
};
pp$9.insertSemicolon = function() {
  if (this.canInsertSemicolon()) {
    if (this.options.onInsertedSemicolon) {
      this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc);
    }
    return true;
  }
};
pp$9.semicolon = function() {
  if (!this.eat(types$1.semi) && !this.insertSemicolon()) {
    this.unexpected();
  }
};
pp$9.afterTrailingComma = function(tokType, notNext) {
  if (this.type === tokType) {
    if (this.options.onTrailingComma) {
      this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc);
    }
    if (!notNext) {
      this.next();
    }
    return true;
  }
};
pp$9.expect = function(type) {
  this.eat(type) || this.unexpected();
};
pp$9.unexpected = function(pos) {
  this.raise(pos != null ? pos : this.start, "Unexpected token");
};
var DestructuringErrors = function DestructuringErrors2() {
  this.shorthandAssign = this.trailingComma = this.parenthesizedAssign = this.parenthesizedBind = this.doubleProto = -1;
};
pp$9.checkPatternErrors = function(refDestructuringErrors, isAssign) {
  if (!refDestructuringErrors) {
    return;
  }
  if (refDestructuringErrors.trailingComma > -1) {
    this.raiseRecoverable(refDestructuringErrors.trailingComma, "Comma is not permitted after the rest element");
  }
  var parens = isAssign ? refDestructuringErrors.parenthesizedAssign : refDestructuringErrors.parenthesizedBind;
  if (parens > -1) {
    this.raiseRecoverable(parens, isAssign ? "Assigning to rvalue" : "Parenthesized pattern");
  }
};
pp$9.checkExpressionErrors = function(refDestructuringErrors, andThrow) {
  if (!refDestructuringErrors) {
    return false;
  }
  var shorthandAssign = refDestructuringErrors.shorthandAssign;
  var doubleProto = refDestructuringErrors.doubleProto;
  if (!andThrow) {
    return shorthandAssign >= 0 || doubleProto >= 0;
  }
  if (shorthandAssign >= 0) {
    this.raise(shorthandAssign, "Shorthand property assignments are valid only in destructuring patterns");
  }
  if (doubleProto >= 0) {
    this.raiseRecoverable(doubleProto, "Redefinition of __proto__ property");
  }
};
pp$9.checkYieldAwaitInDefaultParams = function() {
  if (this.yieldPos && (!this.awaitPos || this.yieldPos < this.awaitPos)) {
    this.raise(this.yieldPos, "Yield expression cannot be a default value");
  }
  if (this.awaitPos) {
    this.raise(this.awaitPos, "Await expression cannot be a default value");
  }
};
pp$9.isSimpleAssignTarget = function(expr) {
  if (expr.type === "ParenthesizedExpression") {
    return this.isSimpleAssignTarget(expr.expression);
  }
  return expr.type === "Identifier" || expr.type === "MemberExpression";
};
var pp$8 = Parser.prototype;
pp$8.parseTopLevel = function(node) {
  var exports$1 = /* @__PURE__ */ Object.create(null);
  if (!node.body) {
    node.body = [];
  }
  while (this.type !== types$1.eof) {
    var stmt = this.parseStatement(null, true, exports$1);
    node.body.push(stmt);
  }
  if (this.inModule) {
    for (var i = 0, list = Object.keys(this.undefinedExports); i < list.length; i += 1) {
      var name = list[i];
      this.raiseRecoverable(this.undefinedExports[name].start, "Export '" + name + "' is not defined");
    }
  }
  this.adaptDirectivePrologue(node.body);
  this.next();
  node.sourceType = this.options.sourceType === "commonjs" ? "script" : this.options.sourceType;
  return this.finishNode(node, "Program");
};
var loopLabel = { kind: "loop" };
var switchLabel = { kind: "switch" };
pp$8.isLet = function(context) {
  if (this.options.ecmaVersion < 6 || !this.isContextual("let")) {
    return false;
  }
  skipWhiteSpace.lastIndex = this.pos;
  var skip = skipWhiteSpace.exec(this.input);
  var next = this.pos + skip[0].length, nextCh = this.fullCharCodeAt(next);
  if (nextCh === 91 || nextCh === 92) {
    return true;
  }
  if (context) {
    return false;
  }
  if (nextCh === 123) {
    return true;
  }
  if (isIdentifierStart(nextCh)) {
    var start = next;
    do {
      next += nextCh <= 65535 ? 1 : 2;
    } while (isIdentifierChar(nextCh = this.fullCharCodeAt(next)));
    if (nextCh === 92) {
      return true;
    }
    var ident = this.input.slice(start, next);
    if (!keywordRelationalOperator.test(ident)) {
      return true;
    }
  }
  return false;
};
pp$8.isAsyncFunction = function() {
  if (this.options.ecmaVersion < 8 || !this.isContextual("async")) {
    return false;
  }
  skipWhiteSpace.lastIndex = this.pos;
  var skip = skipWhiteSpace.exec(this.input);
  var next = this.pos + skip[0].length, after;
  return !lineBreak.test(this.input.slice(this.pos, next)) && this.input.slice(next, next + 8) === "function" && (next + 8 === this.input.length || !(isIdentifierChar(after = this.fullCharCodeAt(next + 8)) || after === 92));
};
pp$8.isUsingKeyword = function(isAwaitUsing, isFor) {
  if (this.options.ecmaVersion < 17 || !this.isContextual(isAwaitUsing ? "await" : "using")) {
    return false;
  }
  skipWhiteSpace.lastIndex = this.pos;
  var skip = skipWhiteSpace.exec(this.input);
  var next = this.pos + skip[0].length;
  if (lineBreak.test(this.input.slice(this.pos, next))) {
    return false;
  }
  if (isAwaitUsing) {
    var usingEndPos = next + 5, after;
    if (this.input.slice(next, usingEndPos) !== "using" || usingEndPos === this.input.length || isIdentifierChar(after = this.fullCharCodeAt(usingEndPos)) || after === 92) {
      return false;
    }
    skipWhiteSpace.lastIndex = usingEndPos;
    var skipAfterUsing = skipWhiteSpace.exec(this.input);
    next = usingEndPos + skipAfterUsing[0].length;
    if (skipAfterUsing && lineBreak.test(this.input.slice(usingEndPos, next))) {
      return false;
    }
  }
  var ch = this.fullCharCodeAt(next);
  if (!isIdentifierStart(ch) && ch !== 92) {
    return false;
  }
  var idStart = next;
  do {
    next += ch <= 65535 ? 1 : 2;
  } while (isIdentifierChar(ch = this.fullCharCodeAt(next)));
  if (ch === 92) {
    return true;
  }
  var id = this.input.slice(idStart, next);
  if (keywordRelationalOperator.test(id)) {
    return false;
  }
  if (isFor && !isAwaitUsing && id === "of") {
    skipWhiteSpace.lastIndex = next;
    var skipAfterOf = skipWhiteSpace.exec(this.input);
    next = next + skipAfterOf[0].length;
    if (this.input.charCodeAt(next) !== 61 || // Check for ==, === and => operators
    (ch = this.input.charCodeAt(next + 1)) === 61 || ch === 62) {
      return false;
    }
  }
  return true;
};
pp$8.isAwaitUsing = function(isFor) {
  return this.isUsingKeyword(true, isFor);
};
pp$8.isUsing = function(isFor) {
  return this.isUsingKeyword(false, isFor);
};
pp$8.parseStatement = function(context, topLevel, exports$1) {
  var starttype = this.type, node = this.startNode(), kind;
  if (this.isLet(context)) {
    starttype = types$1._var;
    kind = "let";
  }
  switch (starttype) {
    case types$1._break:
    case types$1._continue:
      return this.parseBreakContinueStatement(node, starttype.keyword);
    case types$1._debugger:
      return this.parseDebuggerStatement(node);
    case types$1._do:
      return this.parseDoStatement(node);
    case types$1._for:
      return this.parseForStatement(node);
    case types$1._function:
      if (context && (this.strict || context !== "if" && context !== "label") && this.options.ecmaVersion >= 6) {
        this.unexpected();
      }
      return this.parseFunctionStatement(node, false, !context);
    case types$1._class:
      if (context) {
        this.unexpected();
      }
      return this.parseClass(node, true);
    case types$1._if:
      return this.parseIfStatement(node);
    case types$1._return:
      return this.parseReturnStatement(node);
    case types$1._switch:
      return this.parseSwitchStatement(node);
    case types$1._throw:
      return this.parseThrowStatement(node);
    case types$1._try:
      return this.parseTryStatement(node);
    case types$1._const:
    case types$1._var:
      kind = kind || this.value;
      if (context && kind !== "var") {
        this.unexpected();
      }
      return this.parseVarStatement(node, kind);
    case types$1._while:
      return this.parseWhileStatement(node);
    case types$1._with:
      return this.parseWithStatement(node);
    case types$1.braceL:
      return this.parseBlock(true, node);
    case types$1.semi:
      return this.parseEmptyStatement(node);
    case types$1._export:
    case types$1._import:
      if (this.options.ecmaVersion > 10 && starttype === types$1._import) {
        skipWhiteSpace.lastIndex = this.pos;
        var skip = skipWhiteSpace.exec(this.input);
        var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
        if (nextCh === 40 || nextCh === 46) {
          return this.parseExpressionStatement(node, this.parseExpression());
        }
      }
      if (!this.options.allowImportExportEverywhere) {
        if (!topLevel) {
          this.raise(this.start, "'import' and 'export' may only appear at the top level");
        }
        if (!this.inModule) {
          this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'");
        }
      }
      return starttype === types$1._import ? this.parseImport(node) : this.parseExport(node, exports$1);
    default:
      if (this.isAsyncFunction()) {
        if (context) {
          this.unexpected();
        }
        this.next();
        return this.parseFunctionStatement(node, true, !context);
      }
      var usingKind = this.isAwaitUsing(false) ? "await using" : this.isUsing(false) ? "using" : null;
      if (usingKind) {
        if (!this.allowUsing) {
          this.raise(this.start, "Using declaration cannot appear in the top level when source type is `script` or in the bare case statement");
        }
        if (context) {
          this.raise(this.start, "Using declaration is not allowed in single-statement positions");
        }
        if (usingKind === "await using") {
          if (!this.canAwait) {
            this.raise(this.start, "Await using cannot appear outside of async function");
          }
          this.next();
        }
        this.next();
        this.parseVar(node, false, usingKind);
        this.semicolon();
        return this.finishNode(node, "VariableDeclaration");
      }
      var maybeName = this.value, expr = this.parseExpression();
      if (starttype === types$1.name && expr.type === "Identifier" && this.eat(types$1.colon)) {
        return this.parseLabeledStatement(node, maybeName, expr, context);
      } else {
        return this.parseExpressionStatement(node, expr);
      }
  }
};
pp$8.parseBreakContinueStatement = function(node, keyword) {
  var isBreak = keyword === "break";
  this.next();
  if (this.eat(types$1.semi) || this.insertSemicolon()) {
    node.label = null;
  } else if (this.type !== types$1.name) {
    this.unexpected();
  } else {
    node.label = this.parseIdent();
    this.semicolon();
  }
  var i = 0;
  for (; i < this.labels.length; ++i) {
    var lab = this.labels[i];
    if (node.label == null || lab.name === node.label.name) {
      if (lab.kind != null && (isBreak || lab.kind === "loop")) {
        break;
      }
      if (node.label && isBreak) {
        break;
      }
    }
  }
  if (i === this.labels.length) {
    this.raise(node.start, "Unsyntactic " + keyword);
  }
  return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement");
};
pp$8.parseDebuggerStatement = function(node) {
  this.next();
  this.semicolon();
  return this.finishNode(node, "DebuggerStatement");
};
pp$8.parseDoStatement = function(node) {
  this.next();
  this.labels.push(loopLabel);
  node.body = this.parseStatement("do");
  this.labels.pop();
  this.expect(types$1._while);
  node.test = this.parseParenExpression();
  if (this.options.ecmaVersion >= 6) {
    this.eat(types$1.semi);
  } else {
    this.semicolon();
  }
  return this.finishNode(node, "DoWhileStatement");
};
pp$8.parseForStatement = function(node) {
  this.next();
  var awaitAt = this.options.ecmaVersion >= 9 && this.canAwait && this.eatContextual("await") ? this.lastTokStart : -1;
  this.labels.push(loopLabel);
  this.enterScope(0);
  this.expect(types$1.parenL);
  if (this.type === types$1.semi) {
    if (awaitAt > -1) {
      this.unexpected(awaitAt);
    }
    return this.parseFor(node, null);
  }
  var isLet = this.isLet();
  if (this.type === types$1._var || this.type === types$1._const || isLet) {
    var init$1 = this.startNode(), kind = isLet ? "let" : this.value;
    this.next();
    this.parseVar(init$1, true, kind);
    this.finishNode(init$1, "VariableDeclaration");
    return this.parseForAfterInit(node, init$1, awaitAt);
  }
  var startsWithLet = this.isContextual("let"), isForOf = false;
  var usingKind = this.isUsing(true) ? "using" : this.isAwaitUsing(true) ? "await using" : null;
  if (usingKind) {
    var init$2 = this.startNode();
    this.next();
    if (usingKind === "await using") {
      if (!this.canAwait) {
        this.raise(this.start, "Await using cannot appear outside of async function");
      }
      this.next();
    }
    this.parseVar(init$2, true, usingKind);
    this.finishNode(init$2, "VariableDeclaration");
    return this.parseForAfterInit(node, init$2, awaitAt);
  }
  var containsEsc = this.containsEsc;
  var refDestructuringErrors = new DestructuringErrors();
  var initPos = this.start;
  var init = awaitAt > -1 ? this.parseExprSubscripts(refDestructuringErrors, "await") : this.parseExpression(true, refDestructuringErrors);
  if (this.type === types$1._in || (isForOf = this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
    if (awaitAt > -1) {
      if (this.type === types$1._in) {
        this.unexpected(awaitAt);
      }
      node.await = true;
    } else if (isForOf && this.options.ecmaVersion >= 8) {
      if (init.start === initPos && !containsEsc && init.type === "Identifier" && init.name === "async") {
        this.unexpected();
      } else if (this.options.ecmaVersion >= 9) {
        node.await = false;
      }
    }
    if (startsWithLet && isForOf) {
      this.raise(init.start, "The left-hand side of a for-of loop may not start with 'let'.");
    }
    this.toAssignable(init, false, refDestructuringErrors);
    this.checkLValPattern(init);
    return this.parseForIn(node, init);
  } else {
    this.checkExpressionErrors(refDestructuringErrors, true);
  }
  if (awaitAt > -1) {
    this.unexpected(awaitAt);
  }
  return this.parseFor(node, init);
};
pp$8.parseForAfterInit = function(node, init, awaitAt) {
  if ((this.type === types$1._in || this.options.ecmaVersion >= 6 && this.isContextual("of")) && init.declarations.length === 1) {
    if (this.type === types$1._in) {
      if ((init.kind === "using" || init.kind === "await using") && !init.declarations[0].init) {
        this.raise(this.start, "Using declaration is not allowed in for-in loops");
      }
      if (this.options.ecmaVersion >= 9 && awaitAt > -1) {
        this.unexpected(awaitAt);
      }
    } else if (this.options.ecmaVersion >= 9) {
      node.await = awaitAt > -1;
    }
    return this.parseForIn(node, init);
  }
  if (awaitAt > -1) {
    this.unexpected(awaitAt);
  }
  return this.parseFor(node, init);
};
pp$8.parseFunctionStatement = function(node, isAsync, declarationPosition) {
  this.next();
  return this.parseFunction(node, FUNC_STATEMENT | (declarationPosition ? 0 : FUNC_HANGING_STATEMENT), false, isAsync);
};
pp$8.parseIfStatement = function(node) {
  this.next();
  node.test = this.parseParenExpression();
  node.consequent = this.parseStatement("if");
  node.alternate = this.eat(types$1._else) ? this.parseStatement("if") : null;
  return this.finishNode(node, "IfStatement");
};
pp$8.parseReturnStatement = function(node) {
  if (!this.allowReturn) {
    this.raise(this.start, "'return' outside of function");
  }
  this.next();
  if (this.eat(types$1.semi) || this.insertSemicolon()) {
    node.argument = null;
  } else {
    node.argument = this.parseExpression();
    this.semicolon();
  }
  return this.finishNode(node, "ReturnStatement");
};
pp$8.parseSwitchStatement = function(node) {
  this.next();
  node.discriminant = this.parseParenExpression();
  node.cases = [];
  this.expect(types$1.braceL);
  this.labels.push(switchLabel);
  this.enterScope(SCOPE_SWITCH);
  var cur;
  for (var sawDefault = false; this.type !== types$1.braceR; ) {
    if (this.type === types$1._case || this.type === types$1._default) {
      var isCase = this.type === types$1._case;
      if (cur) {
        this.finishNode(cur, "SwitchCase");
      }
      node.cases.push(cur = this.startNode());
      cur.consequent = [];
      this.next();
      if (isCase) {
        cur.test = this.parseExpression();
      } else {
        if (sawDefault) {
          this.raiseRecoverable(this.lastTokStart, "Multiple default clauses");
        }
        sawDefault = true;
        cur.test = null;
      }
      this.expect(types$1.colon);
    } else {
      if (!cur) {
        this.unexpected();
      }
      cur.consequent.push(this.parseStatement(null));
    }
  }
  this.exitScope();
  if (cur) {
    this.finishNode(cur, "SwitchCase");
  }
  this.next();
  this.labels.pop();
  return this.finishNode(node, "SwitchStatement");
};
pp$8.parseThrowStatement = function(node) {
  this.next();
  if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) {
    this.raise(this.lastTokEnd, "Illegal newline after throw");
  }
  node.argument = this.parseExpression();
  this.semicolon();
  return this.finishNode(node, "ThrowStatement");
};
var empty$1 = [];
pp$8.parseCatchClauseParam = function() {
  var param = this.parseBindingAtom();
  var simple = param.type === "Identifier";
  this.enterScope(simple ? SCOPE_SIMPLE_CATCH : 0);
  this.checkLValPattern(param, simple ? BIND_SIMPLE_CATCH : BIND_LEXICAL);
  this.expect(types$1.parenR);
  return param;
};
pp$8.parseTryStatement = function(node) {
  this.next();
  node.block = this.parseBlock();
  node.handler = null;
  if (this.type === types$1._catch) {
    var clause = this.startNode();
    this.next();
    if (this.eat(types$1.parenL)) {
      clause.param = this.parseCatchClauseParam();
    } else {
      if (this.options.ecmaVersion < 10) {
        this.unexpected();
      }
      clause.param = null;
      this.enterScope(0);
    }
    clause.body = this.parseBlock(false);
    this.exitScope();
    node.handler = this.finishNode(clause, "CatchClause");
  }
  node.finalizer = this.eat(types$1._finally) ? this.parseBlock() : null;
  if (!node.handler && !node.finalizer) {
    this.raise(node.start, "Missing catch or finally clause");
  }
  return this.finishNode(node, "TryStatement");
};
pp$8.parseVarStatement = function(node, kind, allowMissingInitializer) {
  this.next();
  this.parseVar(node, false, kind, allowMissingInitializer);
  this.semicolon();
  return this.finishNode(node, "VariableDeclaration");
};
pp$8.parseWhileStatement = function(node) {
  this.next();
  node.test = this.parseParenExpression();
  this.labels.push(loopLabel);
  node.body = this.parseStatement("while");
  this.labels.pop();
  return this.finishNode(node, "WhileStatement");
};
pp$8.parseWithStatement = function(node) {
  if (this.strict) {
    this.raise(this.start, "'with' in strict mode");
  }
  this.next();
  node.object = this.parseParenExpression();
  node.body = this.parseStatement("with");
  return this.finishNode(node, "WithStatement");
};
pp$8.parseEmptyStatement = function(node) {
  this.next();
  return this.finishNode(node, "EmptyStatement");
};
pp$8.parseLabeledStatement = function(node, maybeName, expr, context) {
  for (var i$1 = 0, list = this.labels; i$1 < list.length; i$1 += 1) {
    var label = list[i$1];
    if (label.name === maybeName) {
      this.raise(expr.start, "Label '" + maybeName + "' is already declared");
    }
  }
  var kind = this.type.isLoop ? "loop" : this.type === types$1._switch ? "switch" : null;
  for (var i = this.labels.length - 1; i >= 0; i--) {
    var label$1 = this.labels[i];
    if (label$1.statementStart === node.start) {
      label$1.statementStart = this.start;
      label$1.kind = kind;
    } else {
      break;
    }
  }
  this.labels.push({ name: maybeName, kind, statementStart: this.start });
  node.body = this.parseStatement(context ? context.indexOf("label") === -1 ? context + "label" : context : "label");
  this.labels.pop();
  node.label = expr;
  return this.finishNode(node, "LabeledStatement");
};
pp$8.parseExpressionStatement = function(node, expr) {
  node.expression = expr;
  this.semicolon();
  return this.finishNode(node, "ExpressionStatement");
};
pp$8.parseBlock = function(createNewLexicalScope, node, exitStrict) {
  if (createNewLexicalScope === void 0)
    createNewLexicalScope = true;
  if (node === void 0)
    node = this.startNode();
  node.body = [];
  this.expect(types$1.braceL);
  if (createNewLexicalScope) {
    this.enterScope(0);
  }
  while (this.type !== types$1.braceR) {
    var stmt = this.parseStatement(null);
    node.body.push(stmt);
  }
  if (exitStrict) {
    this.strict = false;
  }
  this.next();
  if (createNewLexicalScope) {
    this.exitScope();
  }
  return this.finishNode(node, "BlockStatement");
};
pp$8.parseFor = function(node, init) {
  node.init = init;
  this.expect(types$1.semi);
  node.test = this.type === types$1.semi ? null : this.parseExpression();
  this.expect(types$1.semi);
  node.update = this.type === types$1.parenR ? null : this.parseExpression();
  this.expect(types$1.parenR);
  node.body = this.parseStatement("for");
  this.exitScope();
  this.labels.pop();
  return this.finishNode(node, "ForStatement");
};
pp$8.parseForIn = function(node, init) {
  var isForIn = this.type === types$1._in;
  this.next();
  if (init.type === "VariableDeclaration" && init.declarations[0].init != null && (!isForIn || this.options.ecmaVersion < 8 || this.strict || init.kind !== "var" || init.declarations[0].id.type !== "Identifier")) {
    this.raise(
      init.start,
      (isForIn ? "for-in" : "for-of") + " loop variable declaration may not have an initializer"
    );
  }
  node.left = init;
  node.right = isForIn ? this.parseExpression() : this.parseMaybeAssign();
  this.expect(types$1.parenR);
  node.body = this.parseStatement("for");
  this.exitScope();
  this.labels.pop();
  return this.finishNode(node, isForIn ? "ForInStatement" : "ForOfStatement");
};
pp$8.parseVar = function(node, isFor, kind, allowMissingInitializer) {
  node.declarations = [];
  node.kind = kind;
  for (; ; ) {
    var decl = this.startNode();
    this.parseVarId(decl, kind);
    if (this.eat(types$1.eq)) {
      decl.init = this.parseMaybeAssign(isFor);
    } else if (!allowMissingInitializer && kind === "const" && !(this.type === types$1._in || this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
      this.unexpected();
    } else if (!allowMissingInitializer && (kind === "using" || kind === "await using") && this.options.ecmaVersion >= 17 && this.type !== types$1._in && !this.isContextual("of")) {
      this.raise(this.lastTokEnd, "Missing initializer in " + kind + " declaration");
    } else if (!allowMissingInitializer && decl.id.type !== "Identifier" && !(isFor && (this.type === types$1._in || this.isContextual("of")))) {
      this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value");
    } else {
      decl.init = null;
    }
    node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
    if (!this.eat(types$1.comma)) {
      break;
    }
  }
  return node;
};
pp$8.parseVarId = function(decl, kind) {
  decl.id = kind === "using" || kind === "await using" ? this.parseIdent() : this.parseBindingAtom();
  this.checkLValPattern(decl.id, kind === "var" ? BIND_VAR : BIND_LEXICAL, false);
};
var FUNC_STATEMENT = 1;
var FUNC_HANGING_STATEMENT = 2;
var FUNC_NULLABLE_ID = 4;
pp$8.parseFunction = function(node, statement, allowExpressionBody, isAsync, forInit) {
  this.initFunction(node);
  if (this.options.ecmaVersion >= 9 || this.options.ecmaVersion >= 6 && !isAsync) {
    if (this.type === types$1.star && statement & FUNC_HANGING_STATEMENT) {
      this.unexpected();
    }
    node.generator = this.eat(types$1.star);
  }
  if (this.options.ecmaVersion >= 8) {
    node.async = !!isAsync;
  }
  if (statement & FUNC_STATEMENT) {
    node.id = statement & FUNC_NULLABLE_ID && this.type !== types$1.name ? null : this.parseIdent();
    if (node.id && !(statement & FUNC_HANGING_STATEMENT)) {
      this.checkLValSimple(node.id, this.strict || node.generator || node.async ? this.treatFunctionsAsVar ? BIND_VAR : BIND_LEXICAL : BIND_FUNCTION);
    }
  }
  var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
  this.yieldPos = 0;
  this.awaitPos = 0;
  this.awaitIdentPos = 0;
  this.enterScope(functionFlags(node.async, node.generator));
  if (!(statement & FUNC_STATEMENT)) {
    node.id = this.type === types$1.name ? this.parseIdent() : null;
  }
  this.parseFunctionParams(node);
  this.parseFunctionBody(node, allowExpressionBody, false, forInit);
  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.awaitIdentPos = oldAwaitIdentPos;
  return this.finishNode(node, statement & FUNC_STATEMENT ? "FunctionDeclaration" : "FunctionExpression");
};
pp$8.parseFunctionParams = function(node) {
  this.expect(types$1.parenL);
  node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
  this.checkYieldAwaitInDefaultParams();
};
pp$8.parseClass = function(node, isStatement) {
  this.next();
  var oldStrict = this.strict;
  this.strict = true;
  this.parseClassId(node, isStatement);
  this.parseClassSuper(node);
  var privateNameMap = this.enterClassBody();
  var classBody = this.startNode();
  var hadConstructor = false;
  classBody.body = [];
  this.expect(types$1.braceL);
  while (this.type !== types$1.braceR) {
    var element = this.parseClassElement(node.superClass !== null);
    if (element) {
      classBody.body.push(element);
      if (element.type === "MethodDefinition" && element.kind === "constructor") {
        if (hadConstructor) {
          this.raiseRecoverable(element.start, "Duplicate constructor in the same class");
        }
        hadConstructor = true;
      } else if (element.key && element.key.type === "PrivateIdentifier" && isPrivateNameConflicted(privateNameMap, element)) {
        this.raiseRecoverable(element.key.start, "Identifier '#" + element.key.name + "' has already been declared");
      }
    }
  }
  this.strict = oldStrict;
  this.next();
  node.body = this.finishNode(classBody, "ClassBody");
  this.exitClassBody();
  return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression");
};
pp$8.parseClassElement = function(constructorAllowsSuper) {
  if (this.eat(types$1.semi)) {
    return null;
  }
  var ecmaVersion = this.options.ecmaVersion;
  var node = this.startNode();
  var keyName = "";
  var isGenerator = false;
  var isAsync = false;
  var kind = "method";
  var isStatic = false;
  if (this.eatContextual("static")) {
    if (ecmaVersion >= 13 && this.eat(types$1.braceL)) {
      this.parseClassStaticBlock(node);
      return node;
    }
    if (this.isClassElementNameStart() || this.type === types$1.star) {
      isStatic = true;
    } else {
      keyName = "static";
    }
  }
  node.static = isStatic;
  if (!keyName && ecmaVersion >= 8 && this.eatContextual("async")) {
    if ((this.isClassElementNameStart() || this.type === types$1.star) && !this.canInsertSemicolon()) {
      isAsync = true;
    } else {
      keyName = "async";
    }
  }
  if (!keyName && (ecmaVersion >= 9 || !isAsync) && this.eat(types$1.star)) {
    isGenerator = true;
  }
  if (!keyName && !isAsync && !isGenerator) {
    var lastValue = this.value;
    if (this.eatContextual("get") || this.eatContextual("set")) {
      if (this.isClassElementNameStart()) {
        kind = lastValue;
      } else {
        keyName = lastValue;
      }
    }
  }
  if (keyName) {
    node.computed = false;
    node.key = this.startNodeAt(this.lastTokStart, this.lastTokStartLoc);
    node.key.name = keyName;
    this.finishNode(node.key, "Identifier");
  } else {
    this.parseClassElementName(node);
  }
  if (ecmaVersion < 13 || this.type === types$1.parenL || kind !== "method" || isGenerator || isAsync) {
    var isConstructor = !node.static && checkKeyName(node, "constructor");
    var allowsDirectSuper = isConstructor && constructorAllowsSuper;
    if (isConstructor && kind !== "method") {
      this.raise(node.key.start, "Constructor can't have get/set modifier");
    }
    node.kind = isConstructor ? "constructor" : kind;
    this.parseClassMethod(node, isGenerator, isAsync, allowsDirectSuper);
  } else {
    this.parseClassField(node);
  }
  return node;
};
pp$8.isClassElementNameStart = function() {
  return this.type === types$1.name || this.type === types$1.privateId || this.type === types$1.num || this.type === types$1.string || this.type === types$1.bracketL || this.type.keyword;
};
pp$8.parseClassElementName = function(element) {
  if (this.type === types$1.privateId) {
    if (this.value === "constructor") {
      this.raise(this.start, "Classes can't have an element named '#constructor'");
    }
    element.computed = false;
    element.key = this.parsePrivateIdent();
  } else {
    this.parsePropertyName(element);
  }
};
pp$8.parseClassMethod = function(method, isGenerator, isAsync, allowsDirectSuper) {
  var key = method.key;
  if (method.kind === "constructor") {
    if (isGenerator) {
      this.raise(key.start, "Constructor can't be a generator");
    }
    if (isAsync) {
      this.raise(key.start, "Constructor can't be an async method");
    }
  } else if (method.static && checkKeyName(method, "prototype")) {
    this.raise(key.start, "Classes may not have a static property named prototype");
  }
  var value = method.value = this.parseMethod(isGenerator, isAsync, allowsDirectSuper);
  if (method.kind === "get" && value.params.length !== 0) {
    this.raiseRecoverable(value.start, "getter should have no params");
  }
  if (method.kind === "set" && value.params.length !== 1) {
    this.raiseRecoverable(value.start, "setter should have exactly one param");
  }
  if (method.kind === "set" && value.params[0].type === "RestElement") {
    this.raiseRecoverable(value.params[0].start, "Setter cannot use rest params");
  }
  return this.finishNode(method, "MethodDefinition");
};
pp$8.parseClassField = function(field) {
  if (checkKeyName(field, "constructor")) {
    this.raise(field.key.start, "Classes can't have a field named 'constructor'");
  } else if (field.static && checkKeyName(field, "prototype")) {
    this.raise(field.key.start, "Classes can't have a static field named 'prototype'");
  }
  if (this.eat(types$1.eq)) {
    this.enterScope(SCOPE_CLASS_FIELD_INIT | SCOPE_SUPER);
    field.value = this.parseMaybeAssign();
    this.exitScope();
  } else {
    field.value = null;
  }
  this.semicolon();
  return this.finishNode(field, "PropertyDefinition");
};
pp$8.parseClassStaticBlock = function(node) {
  node.body = [];
  var oldLabels = this.labels;
  this.labels = [];
  this.enterScope(SCOPE_CLASS_STATIC_BLOCK | SCOPE_SUPER);
  while (this.type !== types$1.braceR) {
    var stmt = this.parseStatement(null);
    node.body.push(stmt);
  }
  this.next();
  this.exitScope();
  this.labels = oldLabels;
  return this.finishNode(node, "StaticBlock");
};
pp$8.parseClassId = function(node, isStatement) {
  if (this.type === types$1.name) {
    node.id = this.parseIdent();
    if (isStatement) {
      this.checkLValSimple(node.id, BIND_LEXICAL, false);
    }
  } else {
    if (isStatement === true) {
      this.unexpected();
    }
    node.id = null;
  }
};
pp$8.parseClassSuper = function(node) {
  node.superClass = this.eat(types$1._extends) ? this.parseExprSubscripts(null, false) : null;
};
pp$8.enterClassBody = function() {
  var element = { declared: /* @__PURE__ */ Object.create(null), used: [] };
  this.privateNameStack.push(element);
  return element.declared;
};
pp$8.exitClassBody = function() {
  var ref2 = this.privateNameStack.pop();
  var declared = ref2.declared;
  var used = ref2.used;
  if (!this.options.checkPrivateFields) {
    return;
  }
  var len = this.privateNameStack.length;
  var parent = len === 0 ? null : this.privateNameStack[len - 1];
  for (var i = 0; i < used.length; ++i) {
    var id = used[i];
    if (!hasOwn(declared, id.name)) {
      if (parent) {
        parent.used.push(id);
      } else {
        this.raiseRecoverable(id.start, "Private field '#" + id.name + "' must be declared in an enclosing class");
      }
    }
  }
};
function isPrivateNameConflicted(privateNameMap, element) {
  var name = element.key.name;
  var curr = privateNameMap[name];
  var next = "true";
  if (element.type === "MethodDefinition" && (element.kind === "get" || element.kind === "set")) {
    next = (element.static ? "s" : "i") + element.kind;
  }
  if (curr === "iget" && next === "iset" || curr === "iset" && next === "iget" || curr === "sget" && next === "sset" || curr === "sset" && next === "sget") {
    privateNameMap[name] = "true";
    return false;
  } else if (!curr) {
    privateNameMap[name] = next;
    return false;
  } else {
    return true;
  }
}
function checkKeyName(node, name) {
  var computed = node.computed;
  var key = node.key;
  return !computed && (key.type === "Identifier" && key.name === name || key.type === "Literal" && key.value === name);
}
pp$8.parseExportAllDeclaration = function(node, exports$1) {
  if (this.options.ecmaVersion >= 11) {
    if (this.eatContextual("as")) {
      node.exported = this.parseModuleExportName();
      this.checkExport(exports$1, node.exported, this.lastTokStart);
    } else {
      node.exported = null;
    }
  }
  this.expectContextual("from");
  if (this.type !== types$1.string) {
    this.unexpected();
  }
  node.source = this.parseExprAtom();
  if (this.options.ecmaVersion >= 16) {
    node.attributes = this.parseWithClause();
  }
  this.semicolon();
  return this.finishNode(node, "ExportAllDeclaration");
};
pp$8.parseExport = function(node, exports$1) {
  this.next();
  if (this.eat(types$1.star)) {
    return this.parseExportAllDeclaration(node, exports$1);
  }
  if (this.eat(types$1._default)) {
    this.checkExport(exports$1, "default", this.lastTokStart);
    node.declaration = this.parseExportDefaultDeclaration();
    return this.finishNode(node, "ExportDefaultDeclaration");
  }
  if (this.shouldParseExportStatement()) {
    node.declaration = this.parseExportDeclaration(node);
    if (node.declaration.type === "VariableDeclaration") {
      this.checkVariableExport(exports$1, node.declaration.declarations);
    } else {
      this.checkExport(exports$1, node.declaration.id, node.declaration.id.start);
    }
    node.specifiers = [];
    node.source = null;
    if (this.options.ecmaVersion >= 16) {
      node.attributes = [];
    }
  } else {
    node.declaration = null;
    node.specifiers = this.parseExportSpecifiers(exports$1);
    if (this.eatContextual("from")) {
      if (this.type !== types$1.string) {
        this.unexpected();
      }
      node.source = this.parseExprAtom();
      if (this.options.ecmaVersion >= 16) {
        node.attributes = this.parseWithClause();
      }
    } else {
      for (var i = 0, list = node.specifiers; i < list.length; i += 1) {
        var spec = list[i];
        this.checkUnreserved(spec.local);
        this.checkLocalExport(spec.local);
        if (spec.local.type === "Literal") {
          this.raise(spec.local.start, "A string literal cannot be used as an exported binding without `from`.");
        }
      }
      node.source = null;
      if (this.options.ecmaVersion >= 16) {
        node.attributes = [];
      }
    }
    this.semicolon();
  }
  return this.finishNode(node, "ExportNamedDeclaration");
};
pp$8.parseExportDeclaration = function(node) {
  return this.parseStatement(null);
};
pp$8.parseExportDefaultDeclaration = function() {
  var isAsync;
  if (this.type === types$1._function || (isAsync = this.isAsyncFunction())) {
    var fNode = this.startNode();
    this.next();
    if (isAsync) {
      this.next();
    }
    return this.parseFunction(fNode, FUNC_STATEMENT | FUNC_NULLABLE_ID, false, isAsync);
  } else if (this.type === types$1._class) {
    var cNode = this.startNode();
    return this.parseClass(cNode, "nullableID");
  } else {
    var declaration2 = this.parseMaybeAssign();
    this.semicolon();
    return declaration2;
  }
};
pp$8.checkExport = function(exports$1, name, pos) {
  if (!exports$1) {
    return;
  }
  if (typeof name !== "string") {
    name = name.type === "Identifier" ? name.name : name.value;
  }
  if (hasOwn(exports$1, name)) {
    this.raiseRecoverable(pos, "Duplicate export '" + name + "'");
  }
  exports$1[name] = true;
};
pp$8.checkPatternExport = function(exports$1, pat) {
  var type = pat.type;
  if (type === "Identifier") {
    this.checkExport(exports$1, pat, pat.start);
  } else if (type === "ObjectPattern") {
    for (var i = 0, list = pat.properties; i < list.length; i += 1) {
      var prop = list[i];
      this.checkPatternExport(exports$1, prop);
    }
  } else if (type === "ArrayPattern") {
    for (var i$1 = 0, list$1 = pat.elements; i$1 < list$1.length; i$1 += 1) {
      var elt = list$1[i$1];
      if (elt) {
        this.checkPatternExport(exports$1, elt);
      }
    }
  } else if (type === "Property") {
    this.checkPatternExport(exports$1, pat.value);
  } else if (type === "AssignmentPattern") {
    this.checkPatternExport(exports$1, pat.left);
  } else if (type === "RestElement") {
    this.checkPatternExport(exports$1, pat.argument);
  }
};
pp$8.checkVariableExport = function(exports$1, decls) {
  if (!exports$1) {
    return;
  }
  for (var i = 0, list = decls; i < list.length; i += 1) {
    var decl = list[i];
    this.checkPatternExport(exports$1, decl.id);
  }
};
pp$8.shouldParseExportStatement = function() {
  return this.type.keyword === "var" || this.type.keyword === "const" || this.type.keyword === "class" || this.type.keyword === "function" || this.isLet() || this.isAsyncFunction();
};
pp$8.parseExportSpecifier = function(exports$1) {
  var node = this.startNode();
  node.local = this.parseModuleExportName();
  node.exported = this.eatContextual("as") ? this.parseModuleExportName() : node.local;
  this.checkExport(
    exports$1,
    node.exported,
    node.exported.start
  );
  return this.finishNode(node, "ExportSpecifier");
};
pp$8.parseExportSpecifiers = function(exports$1) {
  var nodes = [], first = true;
  this.expect(types$1.braceL);
  while (!this.eat(types$1.braceR)) {
    if (!first) {
      this.expect(types$1.comma);
      if (this.afterTrailingComma(types$1.braceR)) {
        break;
      }
    } else {
      first = false;
    }
    nodes.push(this.parseExportSpecifier(exports$1));
  }
  return nodes;
};
pp$8.parseImport = function(node) {
  this.next();
  if (this.type === types$1.string) {
    node.specifiers = empty$1;
    node.source = this.parseExprAtom();
  } else {
    node.specifiers = this.parseImportSpecifiers();
    this.expectContextual("from");
    node.source = this.type === types$1.string ? this.parseExprAtom() : this.unexpected();
  }
  if (this.options.ecmaVersion >= 16) {
    node.attributes = this.parseWithClause();
  }
  this.semicolon();
  return this.finishNode(node, "ImportDeclaration");
};
pp$8.parseImportSpecifier = function() {
  var node = this.startNode();
  node.imported = this.parseModuleExportName();
  if (this.eatContextual("as")) {
    node.local = this.parseIdent();
  } else {
    this.checkUnreserved(node.imported);
    node.local = node.imported;
  }
  this.checkLValSimple(node.local, BIND_LEXICAL);
  return this.finishNode(node, "ImportSpecifier");
};
pp$8.parseImportDefaultSpecifier = function() {
  var node = this.startNode();
  node.local = this.parseIdent();
  this.checkLValSimple(node.local, BIND_LEXICAL);
  return this.finishNode(node, "ImportDefaultSpecifier");
};
pp$8.parseImportNamespaceSpecifier = function() {
  var node = this.startNode();
  this.next();
  this.expectContextual("as");
  node.local = this.parseIdent();
  this.checkLValSimple(node.local, BIND_LEXICAL);
  return this.finishNode(node, "ImportNamespaceSpecifier");
};
pp$8.parseImportSpecifiers = function() {
  var nodes = [], first = true;
  if (this.type === types$1.name) {
    nodes.push(this.parseImportDefaultSpecifier());
    if (!this.eat(types$1.comma)) {
      return nodes;
    }
  }
  if (this.type === types$1.star) {
    nodes.push(this.parseImportNamespaceSpecifier());
    return nodes;
  }
  this.expect(types$1.braceL);
  while (!this.eat(types$1.braceR)) {
    if (!first) {
      this.expect(types$1.comma);
      if (this.afterTrailingComma(types$1.braceR)) {
        break;
      }
    } else {
      first = false;
    }
    nodes.push(this.parseImportSpecifier());
  }
  return nodes;
};
pp$8.parseWithClause = function() {
  var nodes = [];
  if (!this.eat(types$1._with)) {
    return nodes;
  }
  this.expect(types$1.braceL);
  var attributeKeys = {};
  var first = true;
  while (!this.eat(types$1.braceR)) {
    if (!first) {
      this.expect(types$1.comma);
      if (this.afterTrailingComma(types$1.braceR)) {
        break;
      }
    } else {
      first = false;
    }
    var attr = this.parseImportAttribute();
    var keyName = attr.key.type === "Identifier" ? attr.key.name : attr.key.value;
    if (hasOwn(attributeKeys, keyName)) {
      this.raiseRecoverable(attr.key.start, "Duplicate attribute key '" + keyName + "'");
    }
    attributeKeys[keyName] = true;
    nodes.push(attr);
  }
  return nodes;
};
pp$8.parseImportAttribute = function() {
  var node = this.startNode();
  node.key = this.type === types$1.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never");
  this.expect(types$1.colon);
  if (this.type !== types$1.string) {
    this.unexpected();
  }
  node.value = this.parseExprAtom();
  return this.finishNode(node, "ImportAttribute");
};
pp$8.parseModuleExportName = function() {
  if (this.options.ecmaVersion >= 13 && this.type === types$1.string) {
    var stringLiteral = this.parseLiteral(this.value);
    if (loneSurrogate.test(stringLiteral.value)) {
      this.raise(stringLiteral.start, "An export name cannot include a lone surrogate.");
    }
    return stringLiteral;
  }
  return this.parseIdent(true);
};
pp$8.adaptDirectivePrologue = function(statements) {
  for (var i = 0; i < statements.length && this.isDirectiveCandidate(statements[i]); ++i) {
    statements[i].directive = statements[i].expression.raw.slice(1, -1);
  }
};
pp$8.isDirectiveCandidate = function(statement) {
  return this.options.ecmaVersion >= 5 && statement.type === "ExpressionStatement" && statement.expression.type === "Literal" && typeof statement.expression.value === "string" && // Reject parenthesized strings.
  (this.input[statement.start] === '"' || this.input[statement.start] === "'");
};
var pp$7 = Parser.prototype;
pp$7.toAssignable = function(node, isBinding, refDestructuringErrors) {
  if (this.options.ecmaVersion >= 6 && node) {
    switch (node.type) {
      case "Identifier":
        if (this.inAsync && node.name === "await") {
          this.raise(node.start, "Cannot use 'await' as identifier inside an async function");
        }
        break;
      case "ObjectPattern":
      case "ArrayPattern":
      case "AssignmentPattern":
      case "RestElement":
        break;
      case "ObjectExpression":
        node.type = "ObjectPattern";
        if (refDestructuringErrors) {
          this.checkPatternErrors(refDestructuringErrors, true);
        }
        for (var i = 0, list = node.properties; i < list.length; i += 1) {
          var prop = list[i];
          this.toAssignable(prop, isBinding);
          if (prop.type === "RestElement" && (prop.argument.type === "ArrayPattern" || prop.argument.type === "ObjectPattern")) {
            this.raise(prop.argument.start, "Unexpected token");
          }
        }
        break;
      case "Property":
        if (node.kind !== "init") {
          this.raise(node.key.start, "Object pattern can't contain getter or setter");
        }
        this.toAssignable(node.value, isBinding);
        break;
      case "ArrayExpression":
        node.type = "ArrayPattern";
        if (refDestructuringErrors) {
          this.checkPatternErrors(refDestructuringErrors, true);
        }
        this.toAssignableList(node.elements, isBinding);
        break;
      case "SpreadElement":
        node.type = "RestElement";
        this.toAssignable(node.argument, isBinding);
        if (node.argument.type === "AssignmentPattern") {
          this.raise(node.argument.start, "Rest elements cannot have a default value");
        }
        break;
      case "AssignmentExpression":
        if (node.operator !== "=") {
          this.raise(node.left.end, "Only '=' operator can be used for specifying default value.");
        }
        node.type = "AssignmentPattern";
        delete node.operator;
        this.toAssignable(node.left, isBinding);
        break;
      case "ParenthesizedExpression":
        this.toAssignable(node.expression, isBinding, refDestructuringErrors);
        break;
      case "ChainExpression":
        this.raiseRecoverable(node.start, "Optional chaining cannot appear in left-hand side");
        break;
      case "MemberExpression":
        if (!isBinding) {
          break;
        }
      default:
        this.raise(node.start, "Assigning to rvalue");
    }
  } else if (refDestructuringErrors) {
    this.checkPatternErrors(refDestructuringErrors, true);
  }
  return node;
};
pp$7.toAssignableList = function(exprList, isBinding) {
  var end = exprList.length;
  for (var i = 0; i < end; i++) {
    var elt = exprList[i];
    if (elt) {
      this.toAssignable(elt, isBinding);
    }
  }
  if (end) {
    var last = exprList[end - 1];
    if (this.options.ecmaVersion === 6 && isBinding && last && last.type === "RestElement" && last.argument.type !== "Identifier") {
      this.unexpected(last.argument.start);
    }
  }
  return exprList;
};
pp$7.parseSpread = function(refDestructuringErrors) {
  var node = this.startNode();
  this.next();
  node.argument = this.parseMaybeAssign(false, refDestructuringErrors);
  return this.finishNode(node, "SpreadElement");
};
pp$7.parseRestBinding = function() {
  var node = this.startNode();
  this.next();
  if (this.options.ecmaVersion === 6 && this.type !== types$1.name) {
    this.unexpected();
  }
  node.argument = this.parseBindingAtom();
  return this.finishNode(node, "RestElement");
};
pp$7.parseBindingAtom = function() {
  if (this.options.ecmaVersion >= 6) {
    switch (this.type) {
      case types$1.bracketL:
        var node = this.startNode();
        this.next();
        node.elements = this.parseBindingList(types$1.bracketR, true, true);
        return this.finishNode(node, "ArrayPattern");
      case types$1.braceL:
        return this.parseObj(true);
    }
  }
  return this.parseIdent();
};
pp$7.parseBindingList = function(close, allowEmpty, allowTrailingComma, allowModifiers) {
  var elts = [], first = true;
  while (!this.eat(close)) {
    if (first) {
      first = false;
    } else {
      this.expect(types$1.comma);
    }
    if (allowEmpty && this.type === types$1.comma) {
      elts.push(null);
    } else if (allowTrailingComma && this.afterTrailingComma(close)) {
      break;
    } else if (this.type === types$1.ellipsis) {
      var rest = this.parseRestBinding();
      this.parseBindingListItem(rest);
      elts.push(rest);
      if (this.type === types$1.comma) {
        this.raiseRecoverable(this.start, "Comma is not permitted after the rest element");
      }
      this.expect(close);
      break;
    } else {
      elts.push(this.parseAssignableListItem(allowModifiers));
    }
  }
  return elts;
};
pp$7.parseAssignableListItem = function(allowModifiers) {
  var elem = this.parseMaybeDefault(this.start, this.startLoc);
  this.parseBindingListItem(elem);
  return elem;
};
pp$7.parseBindingListItem = function(param) {
  return param;
};
pp$7.parseMaybeDefault = function(startPos, startLoc, left) {
  left = left || this.parseBindingAtom();
  if (this.options.ecmaVersion < 6 || !this.eat(types$1.eq)) {
    return left;
  }
  var node = this.startNodeAt(startPos, startLoc);
  node.left = left;
  node.right = this.parseMaybeAssign();
  return this.finishNode(node, "AssignmentPattern");
};
pp$7.checkLValSimple = function(expr, bindingType, checkClashes) {
  if (bindingType === void 0)
    bindingType = BIND_NONE;
  var isBind = bindingType !== BIND_NONE;
  switch (expr.type) {
    case "Identifier":
      if (this.strict && this.reservedWordsStrictBind.test(expr.name)) {
        this.raiseRecoverable(expr.start, (isBind ? "Binding " : "Assigning to ") + expr.name + " in strict mode");
      }
      if (isBind) {
        if (bindingType === BIND_LEXICAL && expr.name === "let") {
          this.raiseRecoverable(expr.start, "let is disallowed as a lexically bound name");
        }
        if (checkClashes) {
          if (hasOwn(checkClashes, expr.name)) {
            this.raiseRecoverable(expr.start, "Argument name clash");
          }
          checkClashes[expr.name] = true;
        }
        if (bindingType !== BIND_OUTSIDE) {
          this.declareName(expr.name, bindingType, expr.start);
        }
      }
      break;
    case "ChainExpression":
      this.raiseRecoverable(expr.start, "Optional chaining cannot appear in left-hand side");
      break;
    case "MemberExpression":
      if (isBind) {
        this.raiseRecoverable(expr.start, "Binding member expression");
      }
      break;
    case "ParenthesizedExpression":
      if (isBind) {
        this.raiseRecoverable(expr.start, "Binding parenthesized expression");
      }
      return this.checkLValSimple(expr.expression, bindingType, checkClashes);
    default:
      this.raise(expr.start, (isBind ? "Binding" : "Assigning to") + " rvalue");
  }
};
pp$7.checkLValPattern = function(expr, bindingType, checkClashes) {
  if (bindingType === void 0)
    bindingType = BIND_NONE;
  switch (expr.type) {
    case "ObjectPattern":
      for (var i = 0, list = expr.properties; i < list.length; i += 1) {
        var prop = list[i];
        this.checkLValInnerPattern(prop, bindingType, checkClashes);
      }
      break;
    case "ArrayPattern":
      for (var i$1 = 0, list$1 = expr.elements; i$1 < list$1.length; i$1 += 1) {
        var elem = list$1[i$1];
        if (elem) {
          this.checkLValInnerPattern(elem, bindingType, checkClashes);
        }
      }
      break;
    default:
      this.checkLValSimple(expr, bindingType, checkClashes);
  }
};
pp$7.checkLValInnerPattern = function(expr, bindingType, checkClashes) {
  if (bindingType === void 0)
    bindingType = BIND_NONE;
  switch (expr.type) {
    case "Property":
      this.checkLValInnerPattern(expr.value, bindingType, checkClashes);
      break;
    case "AssignmentPattern":
      this.checkLValPattern(expr.left, bindingType, checkClashes);
      break;
    case "RestElement":
      this.checkLValPattern(expr.argument, bindingType, checkClashes);
      break;
    default:
      this.checkLValPattern(expr, bindingType, checkClashes);
  }
};
var TokContext = function TokContext2(token, isExpr, preserveSpace, override, generator) {
  this.token = token;
  this.isExpr = !!isExpr;
  this.preserveSpace = !!preserveSpace;
  this.override = override;
  this.generator = !!generator;
};
var types = {
  b_stat: new TokContext("{", false),
  b_expr: new TokContext("{", true),
  b_tmpl: new TokContext("${", false),
  p_stat: new TokContext("(", false),
  p_expr: new TokContext("(", true),
  q_tmpl: new TokContext("`", true, true, function(p) {
    return p.tryReadTemplateToken();
  }),
  f_stat: new TokContext("function", false),
  f_expr: new TokContext("function", true),
  f_expr_gen: new TokContext("function", true, false, null, true),
  f_gen: new TokContext("function", false, false, null, true)
};
var pp$6 = Parser.prototype;
pp$6.initialContext = function() {
  return [types.b_stat];
};
pp$6.curContext = function() {
  return this.context[this.context.length - 1];
};
pp$6.braceIsBlock = function(prevType) {
  var parent = this.curContext();
  if (parent === types.f_expr || parent === types.f_stat) {
    return true;
  }
  if (prevType === types$1.colon && (parent === types.b_stat || parent === types.b_expr)) {
    return !parent.isExpr;
  }
  if (prevType === types$1._return || prevType === types$1.name && this.exprAllowed) {
    return lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
  }
  if (prevType === types$1._else || prevType === types$1.semi || prevType === types$1.eof || prevType === types$1.parenR || prevType === types$1.arrow) {
    return true;
  }
  if (prevType === types$1.braceL) {
    return parent === types.b_stat;
  }
  if (prevType === types$1._var || prevType === types$1._const || prevType === types$1.name) {
    return false;
  }
  return !this.exprAllowed;
};
pp$6.inGeneratorContext = function() {
  for (var i = this.context.length - 1; i >= 1; i--) {
    var context = this.context[i];
    if (context.token === "function") {
      return context.generator;
    }
  }
  return false;
};
pp$6.updateContext = function(prevType) {
  var update, type = this.type;
  if (type.keyword && prevType === types$1.dot) {
    this.exprAllowed = false;
  } else if (update = type.updateContext) {
    update.call(this, prevType);
  } else {
    this.exprAllowed = type.beforeExpr;
  }
};
pp$6.overrideContext = function(tokenCtx) {
  if (this.curContext() !== tokenCtx) {
    this.context[this.context.length - 1] = tokenCtx;
  }
};
types$1.parenR.updateContext = types$1.braceR.updateContext = function() {
  if (this.context.length === 1) {
    this.exprAllowed = true;
    return;
  }
  var out = this.context.pop();
  if (out === types.b_stat && this.curContext().token === "function") {
    out = this.context.pop();
  }
  this.exprAllowed = !out.isExpr;
};
types$1.braceL.updateContext = function(prevType) {
  this.context.push(this.braceIsBlock(prevType) ? types.b_stat : types.b_expr);
  this.exprAllowed = true;
};
types$1.dollarBraceL.updateContext = function() {
  this.context.push(types.b_tmpl);
  this.exprAllowed = true;
};
types$1.parenL.updateContext = function(prevType) {
  var statementParens = prevType === types$1._if || prevType === types$1._for || prevType === types$1._with || prevType === types$1._while;
  this.context.push(statementParens ? types.p_stat : types.p_expr);
  this.exprAllowed = true;
};
types$1.incDec.updateContext = function() {
};
types$1._function.updateContext = types$1._class.updateContext = function(prevType) {
  if (prevType.beforeExpr && prevType !== types$1._else && !(prevType === types$1.semi && this.curContext() !== types.p_stat) && !(prevType === types$1._return && lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) && !((prevType === types$1.colon || prevType === types$1.braceL) && this.curContext() === types.b_stat)) {
    this.context.push(types.f_expr);
  } else {
    this.context.push(types.f_stat);
  }
  this.exprAllowed = false;
};
types$1.colon.updateContext = function() {
  if (this.curContext().token === "function") {
    this.context.pop();
  }
  this.exprAllowed = true;
};
types$1.backQuote.updateContext = function() {
  if (this.curContext() === types.q_tmpl) {
    this.context.pop();
  } else {
    this.context.push(types.q_tmpl);
  }
  this.exprAllowed = false;
};
types$1.star.updateContext = function(prevType) {
  if (prevType === types$1._function) {
    var index = this.context.length - 1;
    if (this.context[index] === types.f_expr) {
      this.context[index] = types.f_expr_gen;
    } else {
      this.context[index] = types.f_gen;
    }
  }
  this.exprAllowed = true;
};
types$1.name.updateContext = function(prevType) {
  var allowed = false;
  if (this.options.ecmaVersion >= 6 && prevType !== types$1.dot) {
    if (this.value === "of" && !this.exprAllowed || this.value === "yield" && this.inGeneratorContext()) {
      allowed = true;
    }
  }
  this.exprAllowed = allowed;
};
var pp$5 = Parser.prototype;
pp$5.checkPropClash = function(prop, propHash, refDestructuringErrors) {
  if (this.options.ecmaVersion >= 9 && prop.type === "SpreadElement") {
    return;
  }
  if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand)) {
    return;
  }
  var key = prop.key;
  var name;
  switch (key.type) {
    case "Identifier":
      name = key.name;
      break;
    case "Literal":
      name = String(key.value);
      break;
    default:
      return;
  }
  var kind = prop.kind;
  if (this.options.ecmaVersion >= 6) {
    if (name === "__proto__" && kind === "init") {
      if (propHash.proto) {
        if (refDestructuringErrors) {
          if (refDestructuringErrors.doubleProto < 0) {
            refDestructuringErrors.doubleProto = key.start;
          }
        } else {
          this.raiseRecoverable(key.start, "Redefinition of __proto__ property");
        }
      }
      propHash.proto = true;
    }
    return;
  }
  name = "$" + name;
  var other = propHash[name];
  if (other) {
    var redefinition;
    if (kind === "init") {
      redefinition = this.strict && other.init || other.get || other.set;
    } else {
      redefinition = other.init || other[kind];
    }
    if (redefinition) {
      this.raiseRecoverable(key.start, "Redefinition of property");
    }
  } else {
    other = propHash[name] = {
      init: false,
      get: false,
      set: false
    };
  }
  other[kind] = true;
};
pp$5.parseExpression = function(forInit, refDestructuringErrors) {
  var this$1$1 = this;
  return this.catchStackOverflow(function() {
    var startPos = this$1$1.start, startLoc = this$1$1.startLoc;
    var expr = this$1$1.parseMaybeAssign(forInit, refDestructuringErrors);
    if (this$1$1.type === types$1.comma) {
      var node = this$1$1.startNodeAt(startPos, startLoc);
      node.expressions = [expr];
      while (this$1$1.eat(types$1.comma)) {
        node.expressions.push(this$1$1.parseMaybeAssign(forInit, refDestructuringErrors));
      }
      return this$1$1.finishNode(node, "SequenceExpression");
    }
    return expr;
  });
};
pp$5.parseMaybeAssign = function(forInit, refDestructuringErrors, afterLeftParse) {
  if (this.isContextual("yield")) {
    if (this.inGenerator) {
      return this.parseYield(forInit);
    } else {
      this.exprAllowed = false;
    }
  }
  var ownDestructuringErrors = false, oldParenAssign = -1, oldTrailingComma = -1, oldDoubleProto = -1;
  if (refDestructuringErrors) {
    oldParenAssign = refDestructuringErrors.parenthesizedAssign;
    oldTrailingComma = refDestructuringErrors.trailingComma;
    oldDoubleProto = refDestructuringErrors.doubleProto;
    refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = -1;
  } else {
    refDestructuringErrors = new DestructuringErrors();
    ownDestructuringErrors = true;
  }
  var startPos = this.start, startLoc = this.startLoc;
  if (this.type === types$1.parenL || this.type === types$1.name) {
    this.potentialArrowAt = this.start;
    this.potentialArrowInForAwait = forInit === "await";
  }
  var left = this.parseMaybeConditional(forInit, refDestructuringErrors);
  if (afterLeftParse) {
    left = afterLeftParse.call(this, left, startPos, startLoc);
  }
  if (this.type.isAssign) {
    var node = this.startNodeAt(startPos, startLoc);
    node.operator = this.value;
    if (this.type === types$1.eq) {
      left = this.toAssignable(left, false, refDestructuringErrors);
    }
    if (!ownDestructuringErrors) {
      refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = refDestructuringErrors.doubleProto = -1;
    }
    if (refDestructuringErrors.shorthandAssign >= left.start) {
      refDestructuringErrors.shorthandAssign = -1;
    }
    if (this.type === types$1.eq) {
      this.checkLValPattern(left);
    } else {
      this.checkLValSimple(left);
    }
    node.left = left;
    this.next();
    node.right = this.parseMaybeAssign(forInit);
    if (oldDoubleProto > -1) {
      refDestructuringErrors.doubleProto = oldDoubleProto;
    }
    return this.finishNode(node, "AssignmentExpression");
  } else {
    if (ownDestructuringErrors) {
      this.checkExpressionErrors(refDestructuringErrors, true);
    }
  }
  if (oldParenAssign > -1) {
    refDestructuringErrors.parenthesizedAssign = oldParenAssign;
  }
  if (oldTrailingComma > -1) {
    refDestructuringErrors.trailingComma = oldTrailingComma;
  }
  return left;
};
pp$5.parseMaybeConditional = function(forInit, refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseExprOps(forInit, refDestructuringErrors);
  if (this.checkExpressionErrors(refDestructuringErrors)) {
    return expr;
  }
  if (!(expr.type === "ArrowFunctionExpression" && expr.start === startPos) && this.eat(types$1.question)) {
    var node = this.startNodeAt(startPos, startLoc);
    node.test = expr;
    node.consequent = this.parseMaybeAssign();
    this.expect(types$1.colon);
    node.alternate = this.parseMaybeAssign(forInit);
    return this.finishNode(node, "ConditionalExpression");
  }
  return expr;
};
pp$5.parseExprOps = function(forInit, refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseMaybeUnary(refDestructuringErrors, false, false, forInit);
  if (this.checkExpressionErrors(refDestructuringErrors)) {
    return expr;
  }
  return expr.start === startPos && expr.type === "ArrowFunctionExpression" ? expr : this.parseExprOp(expr, startPos, startLoc, -1, forInit);
};
pp$5.parseExprOp = function(left, leftStartPos, leftStartLoc, minPrec, forInit) {
  var prec = this.type.binop;
  if (prec != null && (!forInit || this.type !== types$1._in)) {
    if (prec > minPrec) {
      var logical = this.type === types$1.logicalOR || this.type === types$1.logicalAND;
      var coalesce = this.type === types$1.coalesce;
      if (coalesce) {
        prec = types$1.logicalAND.binop;
      }
      var op = this.value;
      this.next();
      var startPos = this.start, startLoc = this.startLoc;
      var right = this.parseExprOp(this.parseMaybeUnary(null, false, false, forInit), startPos, startLoc, prec, forInit);
      var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical || coalesce);
      if (logical && this.type === types$1.coalesce || coalesce && (this.type === types$1.logicalOR || this.type === types$1.logicalAND)) {
        this.raiseRecoverable(this.start, "Logical expressions and coalesce expressions cannot be mixed. Wrap either by parentheses");
      }
      return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, forInit);
    }
  }
  return left;
};
pp$5.buildBinary = function(startPos, startLoc, left, right, op, logical) {
  if (right.type === "PrivateIdentifier") {
    this.raise(right.start, "Private identifier can only be left side of binary expression");
  }
  var node = this.startNodeAt(startPos, startLoc);
  node.left = left;
  node.operator = op;
  node.right = right;
  return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression");
};
pp$5.parseMaybeUnary = function(refDestructuringErrors, sawUnary, incDec, forInit) {
  var startPos = this.start, startLoc = this.startLoc, expr;
  if (this.isContextual("await") && this.canAwait) {
    expr = this.parseAwait(forInit);
    sawUnary = true;
  } else if (this.type.prefix) {
    var node = this.startNode(), update = this.type === types$1.incDec;
    node.operator = this.value;
    node.prefix = true;
    this.next();
    node.argument = this.parseMaybeUnary(null, true, update, forInit);
    this.checkExpressionErrors(refDestructuringErrors, true);
    if (update) {
      this.checkLValSimple(node.argument);
    } else if (this.strict && node.operator === "delete" && isLocalVariableAccess(node.argument)) {
      this.raiseRecoverable(node.start, "Deleting local variable in strict mode");
    } else if (node.operator === "delete" && isPrivateFieldAccess(node.argument)) {
      this.raiseRecoverable(node.start, "Private fields can not be deleted");
    } else {
      sawUnary = true;
    }
    expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
  } else if (!sawUnary && this.type === types$1.privateId) {
    if ((forInit || this.privateNameStack.length === 0) && this.options.checkPrivateFields) {
      this.unexpected();
    }
    expr = this.parsePrivateIdent();
    if (this.type !== types$1._in) {
      this.unexpected();
    }
  } else {
    expr = this.parseExprSubscripts(refDestructuringErrors, forInit);
    if (this.checkExpressionErrors(refDestructuringErrors)) {
      return expr;
    }
    while (this.type.postfix && !this.canInsertSemicolon()) {
      var node$1 = this.startNodeAt(startPos, startLoc);
      node$1.operator = this.value;
      node$1.prefix = false;
      node$1.argument = expr;
      this.checkLValSimple(expr);
      this.next();
      expr = this.finishNode(node$1, "UpdateExpression");
    }
  }
  if (!incDec && !(expr.type === "ArrowFunctionExpression" && expr.start === startPos) && this.eat(types$1.starstar)) {
    if (sawUnary) {
      this.unexpected(this.lastTokStart);
    } else {
      return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false, false, forInit), "**", false);
    }
  } else {
    return expr;
  }
};
function isLocalVariableAccess(node) {
  return node.type === "Identifier" || node.type === "ParenthesizedExpression" && isLocalVariableAccess(node.expression);
}
function isPrivateFieldAccess(node) {
  return node.type === "MemberExpression" && node.property.type === "PrivateIdentifier" || node.type === "ChainExpression" && isPrivateFieldAccess(node.expression) || node.type === "ParenthesizedExpression" && isPrivateFieldAccess(node.expression);
}
pp$5.parseExprSubscripts = function(refDestructuringErrors, forInit) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseExprAtom(refDestructuringErrors, forInit);
  if (expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")") {
    return expr;
  }
  var result = this.parseSubscripts(expr, startPos, startLoc, false, forInit);
  if (refDestructuringErrors && result.type === "MemberExpression") {
    if (refDestructuringErrors.parenthesizedAssign >= result.start) {
      refDestructuringErrors.parenthesizedAssign = -1;
    }
    if (refDestructuringErrors.parenthesizedBind >= result.start) {
      refDestructuringErrors.parenthesizedBind = -1;
    }
    if (refDestructuringErrors.trailingComma >= result.start) {
      refDestructuringErrors.trailingComma = -1;
    }
  }
  return result;
};
pp$5.parseSubscripts = function(base, startPos, startLoc, noCalls, forInit) {
  var maybeAsyncArrow = this.options.ecmaVersion >= 8 && base.type === "Identifier" && base.name === "async" && this.lastTokEnd === base.end && !this.canInsertSemicolon() && base.end - base.start === 5 && this.potentialArrowAt === base.start;
  var optionalChained = false;
  while (true) {
    var element = this.parseSubscript(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit);
    if (element.optional) {
      optionalChained = true;
    }
    if (element === base || element.type === "ArrowFunctionExpression") {
      if (optionalChained) {
        var chainNode = this.startNodeAt(startPos, startLoc);
        chainNode.expression = element;
        element = this.finishNode(chainNode, "ChainExpression");
      }
      return element;
    }
    base = element;
  }
};
pp$5.shouldParseAsyncArrow = function() {
  return !this.canInsertSemicolon() && this.eat(types$1.arrow);
};
pp$5.parseSubscriptAsyncArrow = function(startPos, startLoc, exprList, forInit) {
  return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, true, forInit);
};
pp$5.parseSubscript = function(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit) {
  var optionalSupported = this.options.ecmaVersion >= 11;
  var optional = optionalSupported && this.eat(types$1.questionDot);
  if (noCalls && optional) {
    this.raise(this.lastTokStart, "Optional chaining cannot appear in the callee of new expressions");
  }
  var computed = this.eat(types$1.bracketL);
  if (computed || optional && this.type !== types$1.parenL && this.type !== types$1.backQuote || this.eat(types$1.dot)) {
    var node = this.startNodeAt(startPos, startLoc);
    node.object = base;
    if (computed) {
      node.property = this.parseExpression();
      this.expect(types$1.bracketR);
    } else if (this.type === types$1.privateId && base.type !== "Super") {
      node.property = this.parsePrivateIdent();
    } else {
      node.property = this.parseIdent(this.options.allowReserved !== "never");
    }
    node.computed = !!computed;
    if (optionalSupported) {
      node.optional = optional;
    }
    base = this.finishNode(node, "MemberExpression");
  } else if (!noCalls && this.eat(types$1.parenL)) {
    var refDestructuringErrors = new DestructuringErrors(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
    this.yieldPos = 0;
    this.awaitPos = 0;
    this.awaitIdentPos = 0;
    var exprList = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false, refDestructuringErrors);
    if (maybeAsyncArrow && !optional && this.shouldParseAsyncArrow()) {
      this.checkPatternErrors(refDestructuringErrors, false);
      this.checkYieldAwaitInDefaultParams();
      if (this.awaitIdentPos > 0) {
        this.raise(this.awaitIdentPos, "Cannot use 'await' as identifier inside an async function");
      }
      this.yieldPos = oldYieldPos;
      this.awaitPos = oldAwaitPos;
      this.awaitIdentPos = oldAwaitIdentPos;
      return this.parseSubscriptAsyncArrow(startPos, startLoc, exprList, forInit);
    }
    this.checkExpressionErrors(refDestructuringErrors, true);
    this.yieldPos = oldYieldPos || this.yieldPos;
    this.awaitPos = oldAwaitPos || this.awaitPos;
    this.awaitIdentPos = oldAwaitIdentPos || this.awaitIdentPos;
    var node$1 = this.startNodeAt(startPos, startLoc);
    node$1.callee = base;
    node$1.arguments = exprList;
    if (optionalSupported) {
      node$1.optional = optional;
    }
    base = this.finishNode(node$1, "CallExpression");
  } else if (this.type === types$1.backQuote) {
    if (optional || optionalChained) {
      this.raise(this.start, "Optional chaining cannot appear in the tag of tagged template expressions");
    }
    var node$2 = this.startNodeAt(startPos, startLoc);
    node$2.tag = base;
    node$2.quasi = this.parseTemplate({ isTagged: true });
    base = this.finishNode(node$2, "TaggedTemplateExpression");
  }
  return base;
};
pp$5.parseExprAtom = function(refDestructuringErrors, forInit, forNew) {
  if (this.type === types$1.slash) {
    this.readRegexp();
  }
  var node, canBeArrow = this.potentialArrowAt === this.start;
  switch (this.type) {
    case types$1._super:
      if (!this.allowSuper) {
        this.raise(this.start, "'super' keyword outside a method");
      }
      node = this.startNode();
      this.next();
      if (this.type === types$1.parenL && !this.allowDirectSuper) {
        this.raise(node.start, "super() call outside constructor of a subclass");
      }
      if (this.type !== types$1.dot && this.type !== types$1.bracketL && this.type !== types$1.parenL) {
        this.unexpected();
      }
      return this.finishNode(node, "Super");
    case types$1._this:
      node = this.startNode();
      this.next();
      return this.finishNode(node, "ThisExpression");
    case types$1.name:
      var startPos = this.start, startLoc = this.startLoc, containsEsc = this.containsEsc;
      var id = this.parseIdent(false);
      if (this.options.ecmaVersion >= 8 && !containsEsc && id.name === "async" && !this.canInsertSemicolon() && this.eat(types$1._function)) {
        this.overrideContext(types.f_expr);
        return this.parseFunction(this.startNodeAt(startPos, startLoc), 0, false, true, forInit);
      }
      if (canBeArrow && !this.canInsertSemicolon()) {
        if (this.eat(types$1.arrow)) {
          return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], false, forInit);
        }
        if (this.options.ecmaVersion >= 8 && id.name === "async" && this.type === types$1.name && !containsEsc && (!this.potentialArrowInForAwait || this.value !== "of" || this.containsEsc)) {
          id = this.parseIdent(false);
          if (this.canInsertSemicolon() || !this.eat(types$1.arrow)) {
            this.unexpected();
          }
          return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], true, forInit);
        }
      }
      return id;
    case types$1.regexp:
      var value = this.value;
      node = this.parseLiteral(value.value);
      node.regex = { pattern: value.pattern, flags: value.flags };
      return node;
    case types$1.num:
    case types$1.string:
      return this.parseLiteral(this.value);
    case types$1._null:
    case types$1._true:
    case types$1._false:
      node = this.startNode();
      node.value = this.type === types$1._null ? null : this.type === types$1._true;
      node.raw = this.type.keyword;
      this.next();
      return this.finishNode(node, "Literal");
    case types$1.parenL:
      var start = this.start, expr = this.parseParenAndDistinguishExpression(canBeArrow, forInit);
      if (refDestructuringErrors) {
        if (refDestructuringErrors.parenthesizedAssign < 0 && !this.isSimpleAssignTarget(expr)) {
          refDestructuringErrors.parenthesizedAssign = start;
        }
        if (refDestructuringErrors.parenthesizedBind < 0) {
          refDestructuringErrors.parenthesizedBind = start;
        }
      }
      return expr;
    case types$1.bracketL:
      node = this.startNode();
      this.next();
      node.elements = this.parseExprList(types$1.bracketR, true, true, refDestructuringErrors);
      return this.finishNode(node, "ArrayExpression");
    case types$1.braceL:
      this.overrideContext(types.b_expr);
      return this.parseObj(false, refDestructuringErrors);
    case types$1._function:
      node = this.startNode();
      this.next();
      return this.parseFunction(node, 0);
    case types$1._class:
      return this.parseClass(this.startNode(), false);
    case types$1._new:
      return this.parseNew();
    case types$1.backQuote:
      return this.parseTemplate();
    case types$1._import:
      if (this.options.ecmaVersion >= 11) {
        return this.parseExprImport(forNew);
      } else {
        return this.unexpected();
      }
    default:
      return this.parseExprAtomDefault();
  }
};
pp$5.parseExprAtomDefault = function() {
  this.unexpected();
};
pp$5.parseExprImport = function(forNew) {
  var node = this.startNode();
  if (this.containsEsc) {
    this.raiseRecoverable(this.start, "Escape sequence in keyword import");
  }
  this.next();
  if (this.type === types$1.parenL && !forNew) {
    return this.parseDynamicImport(node);
  } else if (this.type === types$1.dot) {
    var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
    meta.name = "import";
    node.meta = this.finishNode(meta, "Identifier");
    return this.parseImportMeta(node);
  } else {
    this.unexpected();
  }
};
pp$5.parseDynamicImport = function(node) {
  this.next();
  node.source = this.parseMaybeAssign();
  if (this.options.ecmaVersion >= 16) {
    if (!this.eat(types$1.parenR)) {
      this.expect(types$1.comma);
      if (!this.afterTrailingComma(types$1.parenR)) {
        node.options = this.parseMaybeAssign();
        if (!this.eat(types$1.parenR)) {
          this.expect(types$1.comma);
          if (!this.afterTrailingComma(types$1.parenR)) {
            this.unexpected();
          }
        }
      } else {
        node.options = null;
      }
    } else {
      node.options = null;
    }
  } else {
    if (!this.eat(types$1.parenR)) {
      var errorPos = this.start;
      if (this.eat(types$1.comma) && this.eat(types$1.parenR)) {
        this.raiseRecoverable(errorPos, "Trailing comma is not allowed in import()");
      } else {
        this.unexpected(errorPos);
      }
    }
  }
  return this.finishNode(node, "ImportExpression");
};
pp$5.parseImportMeta = function(node) {
  this.next();
  var containsEsc = this.containsEsc;
  node.property = this.parseIdent(true);
  if (node.property.name !== "meta") {
    this.raiseRecoverable(node.property.start, "The only valid meta property for import is 'import.meta'");
  }
  if (containsEsc) {
    this.raiseRecoverable(node.start, "'import.meta' must not contain escaped characters");
  }
  if (this.options.sourceType !== "module" && !this.options.allowImportExportEverywhere) {
    this.raiseRecoverable(node.start, "Cannot use 'import.meta' outside a module");
  }
  return this.finishNode(node, "MetaProperty");
};
pp$5.parseLiteral = function(value) {
  var node = this.startNode();
  node.value = value;
  node.raw = this.input.slice(this.start, this.end);
  if (node.raw.charCodeAt(node.raw.length - 1) === 110) {
    node.bigint = node.value != null ? node.value.toString() : node.raw.slice(0, -1).replace(/_/g, "");
  }
  this.next();
  return this.finishNode(node, "Literal");
};
pp$5.parseParenExpression = function() {
  this.expect(types$1.parenL);
  var val = this.parseExpression();
  this.expect(types$1.parenR);
  return val;
};
pp$5.shouldParseArrow = function(exprList) {
  return !this.canInsertSemicolon();
};
pp$5.parseParenAndDistinguishExpression = function(canBeArrow, forInit) {
  var startPos = this.start, startLoc = this.startLoc, val, allowTrailingComma = this.options.ecmaVersion >= 8;
  if (this.options.ecmaVersion >= 6) {
    this.next();
    var innerStartPos = this.start, innerStartLoc = this.startLoc;
    var exprList = [], first = true, lastIsComma = false;
    var refDestructuringErrors = new DestructuringErrors(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, spreadStart;
    this.yieldPos = 0;
    this.awaitPos = 0;
    while (this.type !== types$1.parenR) {
      first ? first = false : this.expect(types$1.comma);
      if (allowTrailingComma && this.afterTrailingComma(types$1.parenR, true)) {
        lastIsComma = true;
        break;
      } else if (this.type === types$1.ellipsis) {
        spreadStart = this.start;
        exprList.push(this.parseParenItem(this.parseRestBinding()));
        if (this.type === types$1.comma) {
          this.raiseRecoverable(
            this.start,
            "Comma is not permitted after the rest element"
          );
        }
        break;
      } else {
        exprList.push(this.parseMaybeAssign(false, refDestructuringErrors, this.parseParenItem));
      }
    }
    var innerEndPos = this.lastTokEnd, innerEndLoc = this.lastTokEndLoc;
    this.expect(types$1.parenR);
    if (canBeArrow && this.shouldParseArrow(exprList) && this.eat(types$1.arrow)) {
      this.checkPatternErrors(refDestructuringErrors, false);
      this.checkYieldAwaitInDefaultParams();
      this.yieldPos = oldYieldPos;
      this.awaitPos = oldAwaitPos;
      return this.parseParenArrowList(startPos, startLoc, exprList, forInit);
    }
    if (!exprList.length || lastIsComma) {
      this.unexpected(this.lastTokStart);
    }
    if (spreadStart) {
      this.unexpected(spreadStart);
    }
    this.checkExpressionErrors(refDestructuringErrors, true);
    this.yieldPos = oldYieldPos || this.yieldPos;
    this.awaitPos = oldAwaitPos || this.awaitPos;
    if (exprList.length > 1) {
      val = this.startNodeAt(innerStartPos, innerStartLoc);
      val.expressions = exprList;
      this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
    } else {
      val = exprList[0];
    }
  } else {
    val = this.parseParenExpression();
  }
  if (this.options.preserveParens) {
    var par = this.startNodeAt(startPos, startLoc);
    par.expression = val;
    return this.finishNode(par, "ParenthesizedExpression");
  } else {
    return val;
  }
};
pp$5.parseParenItem = function(item) {
  return item;
};
pp$5.parseParenArrowList = function(startPos, startLoc, exprList, forInit) {
  return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, false, forInit);
};
var empty = [];
pp$5.parseNew = function() {
  if (this.containsEsc) {
    this.raiseRecoverable(this.start, "Escape sequence in keyword new");
  }
  var node = this.startNode();
  this.next();
  if (this.options.ecmaVersion >= 6 && this.type === types$1.dot) {
    var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
    meta.name = "new";
    node.meta = this.finishNode(meta, "Identifier");
    this.next();
    var containsEsc = this.containsEsc;
    node.property = this.parseIdent(true);
    if (node.property.name !== "target") {
      this.raiseRecoverable(node.property.start, "The only valid meta property for new is 'new.target'");
    }
    if (containsEsc) {
      this.raiseRecoverable(node.start, "'new.target' must not contain escaped characters");
    }
    if (!this.allowNewDotTarget) {
      this.raiseRecoverable(node.start, "'new.target' can only be used in functions and class static block");
    }
    return this.finishNode(node, "MetaProperty");
  }
  var startPos = this.start, startLoc = this.startLoc;
  node.callee = this.parseSubscripts(this.parseExprAtom(null, false, true), startPos, startLoc, true, false);
  if (node.callee.type === "Super") {
    this.raiseRecoverable(startPos, "Invalid use of 'super'");
  }
  if (this.eat(types$1.parenL)) {
    node.arguments = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false);
  } else {
    node.arguments = empty;
  }
  return this.finishNode(node, "NewExpression");
};
pp$5.parseTemplateElement = function(ref2) {
  var isTagged = ref2.isTagged;
  var elem = this.startNode();
  if (this.type === types$1.invalidTemplate) {
    if (!isTagged) {
      this.raiseRecoverable(this.start, "Bad escape sequence in untagged template literal");
    }
    elem.value = {
      raw: this.value.replace(/\r\n?/g, "\n"),
      cooked: null
    };
  } else {
    elem.value = {
      raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, "\n"),
      cooked: this.value
    };
  }
  this.next();
  elem.tail = this.type === types$1.backQuote;
  return this.finishNode(elem, "TemplateElement");
};
pp$5.parseTemplate = function(ref2) {
  if (ref2 === void 0)
    ref2 = {};
  var isTagged = ref2.isTagged;
  if (isTagged === void 0)
    isTagged = false;
  var node = this.startNode();
  this.next();
  node.expressions = [];
  var curElt = this.parseTemplateElement({ isTagged });
  node.quasis = [curElt];
  while (!curElt.tail) {
    if (this.type === types$1.eof) {
      this.raise(this.pos, "Unterminated template literal");
    }
    this.expect(types$1.dollarBraceL);
    node.expressions.push(this.parseExpression());
    this.expect(types$1.braceR);
    node.quasis.push(curElt = this.parseTemplateElement({ isTagged }));
  }
  this.next();
  return this.finishNode(node, "TemplateLiteral");
};
pp$5.isAsyncProp = function(prop) {
  return !prop.computed && prop.key.type === "Identifier" && prop.key.name === "async" && (this.type === types$1.name || this.type === types$1.num || this.type === types$1.string || this.type === types$1.bracketL || this.type.keyword || this.options.ecmaVersion >= 9 && this.type === types$1.star) && !lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
};
pp$5.parseObj = function(isPattern, refDestructuringErrors) {
  var node = this.startNode(), first = true, propHash = {};
  node.properties = [];
  this.next();
  while (!this.eat(types$1.braceR)) {
    if (!first) {
      this.expect(types$1.comma);
      if (this.options.ecmaVersion >= 5 && this.afterTrailingComma(types$1.braceR)) {
        break;
      }
    } else {
      first = false;
    }
    var prop = this.parseProperty(isPattern, refDestructuringErrors);
    if (!isPattern) {
      this.checkPropClash(prop, propHash, refDestructuringErrors);
    }
    node.properties.push(prop);
  }
  return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression");
};
pp$5.parseProperty = function(isPattern, refDestructuringErrors) {
  var prop = this.startNode(), isGenerator, isAsync, startPos, startLoc;
  if (this.options.ecmaVersion >= 9 && this.eat(types$1.ellipsis)) {
    if (isPattern) {
      prop.argument = this.parseIdent(false);
      if (this.type === types$1.comma) {
        this.raiseRecoverable(this.start, "Comma is not permitted after the rest element");
      }
      return this.finishNode(prop, "RestElement");
    }
    prop.argument = this.parseMaybeAssign(false, refDestructuringErrors);
    if (this.type === types$1.comma && refDestructuringErrors && refDestructuringErrors.trailingComma < 0) {
      refDestructuringErrors.trailingComma = this.start;
    }
    return this.finishNode(prop, "SpreadElement");
  }
  if (this.options.ecmaVersion >= 6) {
    prop.method = false;
    prop.shorthand = false;
    if (isPattern || refDestructuringErrors) {
      startPos = this.start;
      startLoc = this.startLoc;
    }
    if (!isPattern) {
      isGenerator = this.eat(types$1.star);
    }
  }
  var containsEsc = this.containsEsc;
  this.parsePropertyName(prop);
  if (!isPattern && !containsEsc && this.options.ecmaVersion >= 8 && !isGenerator && this.isAsyncProp(prop)) {
    isAsync = true;
    isGenerator = this.options.ecmaVersion >= 9 && this.eat(types$1.star);
    this.parsePropertyName(prop);
  } else {
    isAsync = false;
  }
  this.parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc);
  return this.finishNode(prop, "Property");
};
pp$5.parseGetterSetter = function(prop) {
  var kind = prop.key.name;
  this.parsePropertyName(prop);
  prop.value = this.parseMethod(false);
  prop.kind = kind;
  var paramCount = prop.kind === "get" ? 0 : 1;
  if (prop.value.params.length !== paramCount) {
    var start = prop.value.start;
    if (prop.kind === "get") {
      this.raiseRecoverable(start, "getter should have no params");
    } else {
      this.raiseRecoverable(start, "setter should have exactly one param");
    }
  } else {
    if (prop.kind === "set" && prop.value.params[0].type === "RestElement") {
      this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params");
    }
  }
};
pp$5.parsePropertyValue = function(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc) {
  if ((isGenerator || isAsync) && this.type === types$1.colon) {
    this.unexpected();
  }
  if (this.eat(types$1.colon)) {
    prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors);
    prop.kind = "init";
  } else if (this.options.ecmaVersion >= 6 && this.type === types$1.parenL) {
    if (isPattern) {
      this.unexpected();
    }
    prop.method = true;
    prop.value = this.parseMethod(isGenerator, isAsync);
    prop.kind = "init";
  } else if (!isPattern && !containsEsc && this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" && (prop.key.name === "get" || prop.key.name === "set") && (this.type !== types$1.comma && this.type !== types$1.braceR && this.type !== types$1.eq)) {
    if (isGenerator || isAsync) {
      this.unexpected();
    }
    this.parseGetterSetter(prop);
  } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
    if (isGenerator || isAsync) {
      this.unexpected();
    }
    this.checkUnreserved(prop.key);
    if (prop.key.name === "await" && !this.awaitIdentPos) {
      this.awaitIdentPos = startPos;
    }
    if (isPattern) {
      prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
    } else if (this.type === types$1.eq && refDestructuringErrors) {
      if (refDestructuringErrors.shorthandAssign < 0) {
        refDestructuringErrors.shorthandAssign = this.start;
      }
      prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
    } else {
      prop.value = this.copyNode(prop.key);
    }
    prop.kind = "init";
    prop.shorthand = true;
  } else {
    this.unexpected();
  }
};
pp$5.parsePropertyName = function(prop) {
  if (this.options.ecmaVersion >= 6) {
    if (this.eat(types$1.bracketL)) {
      prop.computed = true;
      prop.key = this.parseMaybeAssign();
      this.expect(types$1.bracketR);
      return prop.key;
    } else {
      prop.computed = false;
    }
  }
  return prop.key = this.type === types$1.num || this.type === types$1.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never");
};
pp$5.initFunction = function(node) {
  node.id = null;
  if (this.options.ecmaVersion >= 6) {
    node.generator = node.expression = false;
  }
  if (this.options.ecmaVersion >= 8) {
    node.async = false;
  }
};
pp$5.parseMethod = function(isGenerator, isAsync, allowDirectSuper) {
  var node = this.startNode(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
  this.initFunction(node);
  if (this.options.ecmaVersion >= 6) {
    node.generator = isGenerator;
  }
  if (this.options.ecmaVersion >= 8) {
    node.async = !!isAsync;
  }
  this.yieldPos = 0;
  this.awaitPos = 0;
  this.awaitIdentPos = 0;
  this.enterScope(functionFlags(isAsync, node.generator) | SCOPE_SUPER | (allowDirectSuper ? SCOPE_DIRECT_SUPER : 0));
  this.expect(types$1.parenL);
  node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
  this.checkYieldAwaitInDefaultParams();
  this.parseFunctionBody(node, false, true, false);
  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.awaitIdentPos = oldAwaitIdentPos;
  return this.finishNode(node, "FunctionExpression");
};
pp$5.parseArrowExpression = function(node, params, isAsync, forInit) {
  var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
  this.enterScope(functionFlags(isAsync, false) | SCOPE_ARROW);
  this.initFunction(node);
  if (this.options.ecmaVersion >= 8) {
    node.async = !!isAsync;
  }
  this.yieldPos = 0;
  this.awaitPos = 0;
  this.awaitIdentPos = 0;
  node.params = this.toAssignableList(params, true);
  this.parseFunctionBody(node, true, false, forInit);
  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.awaitIdentPos = oldAwaitIdentPos;
  return this.finishNode(node, "ArrowFunctionExpression");
};
pp$5.parseFunctionBody = function(node, isArrowFunction, isMethod, forInit) {
  var isExpression = isArrowFunction && this.type !== types$1.braceL;
  var oldStrict = this.strict, useStrict = false;
  if (isExpression) {
    node.body = this.parseMaybeAssign(forInit);
    node.expression = true;
    this.checkParams(node, false);
  } else {
    var nonSimple = this.options.ecmaVersion >= 7 && !this.isSimpleParamList(node.params);
    if (!oldStrict || nonSimple) {
      useStrict = this.strictDirective(this.end);
      if (useStrict && nonSimple) {
        this.raiseRecoverable(node.start, "Illegal 'use strict' directive in function with non-simple parameter list");
      }
    }
    var oldLabels = this.labels;
    this.labels = [];
    if (useStrict) {
      this.strict = true;
    }
    this.checkParams(node, !oldStrict && !useStrict && !isArrowFunction && !isMethod && this.isSimpleParamList(node.params));
    if (this.strict && node.id) {
      this.checkLValSimple(node.id, BIND_OUTSIDE);
    }
    node.body = this.parseBlock(false, void 0, useStrict && !oldStrict);
    node.expression = false;
    this.adaptDirectivePrologue(node.body.body);
    this.labels = oldLabels;
  }
  this.exitScope();
};
pp$5.isSimpleParamList = function(params) {
  for (var i = 0, list = params; i < list.length; i += 1) {
    var param = list[i];
    if (param.type !== "Identifier") {
      return false;
    }
  }
  return true;
};
pp$5.checkParams = function(node, allowDuplicates) {
  var nameHash = /* @__PURE__ */ Object.create(null);
  for (var i = 0, list = node.params; i < list.length; i += 1) {
    var param = list[i];
    this.checkLValInnerPattern(param, BIND_VAR, allowDuplicates ? null : nameHash);
  }
};
pp$5.parseExprList = function(close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
  var elts = [], first = true;
  while (!this.eat(close)) {
    if (!first) {
      this.expect(types$1.comma);
      if (allowTrailingComma && this.afterTrailingComma(close)) {
        break;
      }
    } else {
      first = false;
    }
    var elt = void 0;
    if (allowEmpty && this.type === types$1.comma) {
      elt = null;
    } else if (this.type === types$1.ellipsis) {
      elt = this.parseSpread(refDestructuringErrors);
      if (refDestructuringErrors && this.type === types$1.comma && refDestructuringErrors.trailingComma < 0) {
        refDestructuringErrors.trailingComma = this.start;
      }
    } else {
      elt = this.parseMaybeAssign(false, refDestructuringErrors);
    }
    elts.push(elt);
  }
  return elts;
};
pp$5.checkUnreserved = function(ref2) {
  var start = ref2.start;
  var end = ref2.end;
  var name = ref2.name;
  if (this.inGenerator && name === "yield") {
    this.raiseRecoverable(start, "Cannot use 'yield' as identifier inside a generator");
  }
  if (this.inAsync && name === "await") {
    this.raiseRecoverable(start, "Cannot use 'await' as identifier inside an async function");
  }
  if (!(this.currentThisScope().flags & SCOPE_VAR) && name === "arguments") {
    this.raiseRecoverable(start, "Cannot use 'arguments' in class field initializer");
  }
  if (this.inClassStaticBlock && (name === "arguments" || name === "await")) {
    this.raise(start, "Cannot use " + name + " in class static initialization block");
  }
  if (this.keywords.test(name)) {
    this.raise(start, "Unexpected keyword '" + name + "'");
  }
  if (this.options.ecmaVersion < 6 && this.input.slice(start, end).indexOf("\\") !== -1) {
    return;
  }
  var re = this.strict ? this.reservedWordsStrict : this.reservedWords;
  if (re.test(name)) {
    if (!this.inAsync && name === "await") {
      this.raiseRecoverable(start, "Cannot use keyword 'await' outside an async function");
    }
    this.raiseRecoverable(start, "The keyword '" + name + "' is reserved");
  }
};
pp$5.parseIdent = function(liberal) {
  var node = this.parseIdentNode();
  this.next(!!liberal);
  this.finishNode(node, "Identifier");
  if (!liberal) {
    this.checkUnreserved(node);
    if (node.name === "await" && !this.awaitIdentPos) {
      this.awaitIdentPos = node.start;
    }
  }
  return node;
};
pp$5.parseIdentNode = function() {
  var node = this.startNode();
  if (this.type === types$1.name) {
    node.name = this.value;
  } else if (this.type.keyword) {
    node.name = this.type.keyword;
    if ((node.name === "class" || node.name === "function") && (this.lastTokEnd !== this.lastTokStart + 1 || this.input.charCodeAt(this.lastTokStart) !== 46)) {
      this.context.pop();
    }
    this.type = types$1.name;
  } else {
    this.unexpected();
  }
  return node;
};
pp$5.parsePrivateIdent = function() {
  var node = this.startNode();
  if (this.type === types$1.privateId) {
    node.name = this.value;
  } else {
    this.unexpected();
  }
  this.next();
  this.finishNode(node, "PrivateIdentifier");
  if (this.options.checkPrivateFields) {
    if (this.privateNameStack.length === 0) {
      this.raise(node.start, "Private field '#" + node.name + "' must be declared in an enclosing class");
    } else {
      this.privateNameStack[this.privateNameStack.length - 1].used.push(node);
    }
  }
  return node;
};
pp$5.parseYield = function(forInit) {
  if (!this.yieldPos) {
    this.yieldPos = this.start;
  }
  var node = this.startNode();
  this.next();
  if (this.type === types$1.semi || this.canInsertSemicolon() || this.type !== types$1.star && !this.type.startsExpr) {
    node.delegate = false;
    node.argument = null;
  } else {
    node.delegate = this.eat(types$1.star);
    node.argument = this.parseMaybeAssign(forInit);
  }
  return this.finishNode(node, "YieldExpression");
};
pp$5.parseAwait = function(forInit) {
  if (!this.awaitPos) {
    this.awaitPos = this.start;
  }
  var node = this.startNode();
  this.next();
  node.argument = this.parseMaybeUnary(null, true, false, forInit);
  return this.finishNode(node, "AwaitExpression");
};
var pp$4 = Parser.prototype;
pp$4.raise = function(pos, message) {
  var loc = getLineInfo(this.input, pos);
  message += " (" + loc.line + ":" + loc.column + ")";
  if (this.sourceFile) {
    message += " in " + this.sourceFile;
  }
  var err = new SyntaxError(message);
  err.pos = pos;
  err.loc = loc;
  err.raisedAt = this.pos;
  throw err;
};
pp$4.raiseRecoverable = pp$4.raise;
pp$4.curPosition = function() {
  if (this.options.locations) {
    return new Position(this.curLine, this.pos - this.lineStart);
  }
};
var pp$3 = Parser.prototype;
var Scope = function Scope2(flags) {
  this.flags = flags;
  this.var = [];
  this.lexical = [];
  this.functions = [];
};
pp$3.enterScope = function(flags) {
  this.scopeStack.push(new Scope(flags));
};
pp$3.exitScope = function() {
  this.scopeStack.pop();
};
pp$3.treatFunctionsAsVarInScope = function(scope) {
  return scope.flags & SCOPE_FUNCTION || !this.inModule && scope.flags & SCOPE_TOP;
};
pp$3.declareName = function(name, bindingType, pos) {
  var redeclared = false;
  if (bindingType === BIND_LEXICAL) {
    var scope = this.currentScope();
    redeclared = scope.lexical.indexOf(name) > -1 || scope.functions.indexOf(name) > -1 || scope.var.indexOf(name) > -1;
    scope.lexical.push(name);
    if (this.inModule && scope.flags & SCOPE_TOP) {
      delete this.undefinedExports[name];
    }
  } else if (bindingType === BIND_SIMPLE_CATCH) {
    var scope$1 = this.currentScope();
    scope$1.lexical.push(name);
  } else if (bindingType === BIND_FUNCTION) {
    var scope$2 = this.currentScope();
    if (this.treatFunctionsAsVar) {
      redeclared = scope$2.lexical.indexOf(name) > -1;
    } else {
      redeclared = scope$2.lexical.indexOf(name) > -1 || scope$2.var.indexOf(name) > -1;
    }
    scope$2.functions.push(name);
  } else {
    for (var i = this.scopeStack.length - 1; i >= 0; --i) {
      var scope$3 = this.scopeStack[i];
      if (scope$3.lexical.indexOf(name) > -1 && !(scope$3.flags & SCOPE_SIMPLE_CATCH && scope$3.lexical[0] === name) || !this.treatFunctionsAsVarInScope(scope$3) && scope$3.functions.indexOf(name) > -1) {
        redeclared = true;
        break;
      }
      scope$3.var.push(name);
      if (this.inModule && scope$3.flags & SCOPE_TOP) {
        delete this.undefinedExports[name];
      }
      if (scope$3.flags & SCOPE_VAR) {
        break;
      }
    }
  }
  if (redeclared) {
    this.raiseRecoverable(pos, "Identifier '" + name + "' has already been declared");
  }
};
pp$3.checkLocalExport = function(id) {
  if (this.scopeStack[0].lexical.indexOf(id.name) === -1 && this.scopeStack[0].var.indexOf(id.name) === -1) {
    this.undefinedExports[id.name] = id;
  }
};
pp$3.currentScope = function() {
  return this.scopeStack[this.scopeStack.length - 1];
};
pp$3.currentVarScope = function() {
  for (var i = this.scopeStack.length - 1; ; i--) {
    var scope = this.scopeStack[i];
    if (scope.flags & (SCOPE_VAR | SCOPE_CLASS_FIELD_INIT | SCOPE_CLASS_STATIC_BLOCK)) {
      return scope;
    }
  }
};
pp$3.currentThisScope = function() {
  for (var i = this.scopeStack.length - 1; ; i--) {
    var scope = this.scopeStack[i];
    if (scope.flags & (SCOPE_VAR | SCOPE_CLASS_FIELD_INIT | SCOPE_CLASS_STATIC_BLOCK) && !(scope.flags & SCOPE_ARROW)) {
      return scope;
    }
  }
};
var Node = function Node2(parser, pos, loc) {
  this.type = "";
  this.start = pos;
  this.end = 0;
  if (parser.options.locations) {
    this.loc = new SourceLocation(parser, loc);
  }
  if (parser.options.directSourceFile) {
    this.sourceFile = parser.options.directSourceFile;
  }
  if (parser.options.ranges) {
    this.range = [pos, 0];
  }
};
var pp$2 = Parser.prototype;
pp$2.startNode = function() {
  return new Node(this, this.start, this.startLoc);
};
pp$2.startNodeAt = function(pos, loc) {
  return new Node(this, pos, loc);
};
function finishNodeAt(node, type, pos, loc) {
  node.type = type;
  node.end = pos;
  if (this.options.locations) {
    node.loc.end = loc;
  }
  if (this.options.ranges) {
    node.range[1] = pos;
  }
  return node;
}
pp$2.finishNode = function(node, type) {
  return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc);
};
pp$2.finishNodeAt = function(node, type, pos, loc) {
  return finishNodeAt.call(this, node, type, pos, loc);
};
pp$2.copyNode = function(node) {
  var newNode = new Node(this, node.start, this.startLoc);
  for (var prop in node) {
    newNode[prop] = node[prop];
  }
  return newNode;
};
var scriptValuesAddedInUnicode = "Berf Beria_Erfe Gara Garay Gukh Gurung_Khema Hrkt Katakana_Or_Hiragana Kawi Kirat_Rai Krai Nag_Mundari Nagm Ol_Onal Onao Sidetic Sidt Sunu Sunuwar Tai_Yo Tayo Todhri Todr Tolong_Siki Tols Tulu_Tigalari Tutg Unknown Zzzz";
var ecma9BinaryProperties = "ASCII ASCII_Hex_Digit AHex Alphabetic Alpha Any Assigned Bidi_Control Bidi_C Bidi_Mirrored Bidi_M Case_Ignorable CI Cased Changes_When_Casefolded CWCF Changes_When_Casemapped CWCM Changes_When_Lowercased CWL Changes_When_NFKC_Casefolded CWKCF Changes_When_Titlecased CWT Changes_When_Uppercased CWU Dash Default_Ignorable_Code_Point DI Deprecated Dep Diacritic Dia Emoji Emoji_Component Emoji_Modifier Emoji_Modifier_Base Emoji_Presentation Extender Ext Grapheme_Base Gr_Base Grapheme_Extend Gr_Ext Hex_Digit Hex IDS_Binary_Operator IDSB IDS_Trinary_Operator IDST ID_Continue IDC ID_Start IDS Ideographic Ideo Join_Control Join_C Logical_Order_Exception LOE Lowercase Lower Math Noncharacter_Code_Point NChar Pattern_Syntax Pat_Syn Pattern_White_Space Pat_WS Quotation_Mark QMark Radical Regional_Indicator RI Sentence_Terminal STerm Soft_Dotted SD Terminal_Punctuation Term Unified_Ideograph UIdeo Uppercase Upper Variation_Selector VS White_Space space XID_Continue XIDC XID_Start XIDS";
var ecma10BinaryProperties = ecma9BinaryProperties + " Extended_Pictographic";
var ecma11BinaryProperties = ecma10BinaryProperties;
var ecma12BinaryProperties = ecma11BinaryProperties + " EBase EComp EMod EPres ExtPict";
var ecma13BinaryProperties = ecma12BinaryProperties;
var ecma14BinaryProperties = ecma13BinaryProperties;
var unicodeBinaryProperties = {
  9: ecma9BinaryProperties,
  10: ecma10BinaryProperties,
  11: ecma11BinaryProperties,
  12: ecma12BinaryProperties,
  13: ecma13BinaryProperties,
  14: ecma14BinaryProperties
};
var ecma14BinaryPropertiesOfStrings = "Basic_Emoji Emoji_Keycap_Sequence RGI_Emoji_Modifier_Sequence RGI_Emoji_Flag_Sequence RGI_Emoji_Tag_Sequence RGI_Emoji_ZWJ_Sequence RGI_Emoji";
var unicodeBinaryPropertiesOfStrings = {
  9: "",
  10: "",
  11: "",
  12: "",
  13: "",
  14: ecma14BinaryPropertiesOfStrings
};
var unicodeGeneralCategoryValues = "Cased_Letter LC Close_Punctuation Pe Connector_Punctuation Pc Control Cc cntrl Currency_Symbol Sc Dash_Punctuation Pd Decimal_Number Nd digit Enclosing_Mark Me Final_Punctuation Pf Format Cf Initial_Punctuation Pi Letter L Letter_Number Nl Line_Separator Zl Lowercase_Letter Ll Mark M Combining_Mark Math_Symbol Sm Modifier_Letter Lm Modifier_Symbol Sk Nonspacing_Mark Mn Number N Open_Punctuation Ps Other C Other_Letter Lo Other_Number No Other_Punctuation Po Other_Symbol So Paragraph_Separator Zp Private_Use Co Punctuation P punct Separator Z Space_Separator Zs Spacing_Mark Mc Surrogate Cs Symbol S Titlecase_Letter Lt Unassigned Cn Uppercase_Letter Lu";
var ecma9ScriptValues = "Adlam Adlm Ahom Anatolian_Hieroglyphs Hluw Arabic Arab Armenian Armn Avestan Avst Balinese Bali Bamum Bamu Bassa_Vah Bass Batak Batk Bengali Beng Bhaiksuki Bhks Bopomofo Bopo Brahmi Brah Braille Brai Buginese Bugi Buhid Buhd Canadian_Aboriginal Cans Carian Cari Caucasian_Albanian Aghb Chakma Cakm Cham Cham Cherokee Cher Common Zyyy Coptic Copt Qaac Cuneiform Xsux Cypriot Cprt Cyrillic Cyrl Deseret Dsrt Devanagari Deva Duployan Dupl Egyptian_Hieroglyphs Egyp Elbasan Elba Ethiopic Ethi Georgian Geor Glagolitic Glag Gothic Goth Grantha Gran Greek Grek Gujarati Gujr Gurmukhi Guru Han Hani Hangul Hang Hanunoo Hano Hatran Hatr Hebrew Hebr Hiragana Hira Imperial_Aramaic Armi Inherited Zinh Qaai Inscriptional_Pahlavi Phli Inscriptional_Parthian Prti Javanese Java Kaithi Kthi Kannada Knda Katakana Kana Kayah_Li Kali Kharoshthi Khar Khmer Khmr Khojki Khoj Khudawadi Sind Lao Laoo Latin Latn Lepcha Lepc Limbu Limb Linear_A Lina Linear_B Linb Lisu Lisu Lycian Lyci Lydian Lydi Mahajani Mahj Malayalam Mlym Mandaic Mand Manichaean Mani Marchen Marc Masaram_Gondi Gonm Meetei_Mayek Mtei Mende_Kikakui Mend Meroitic_Cursive Merc Meroitic_Hieroglyphs Mero Miao Plrd Modi Mongolian Mong Mro Mroo Multani Mult Myanmar Mymr Nabataean Nbat New_Tai_Lue Talu Newa Newa Nko Nkoo Nushu Nshu Ogham Ogam Ol_Chiki Olck Old_Hungarian Hung Old_Italic Ital Old_North_Arabian Narb Old_Permic Perm Old_Persian Xpeo Old_South_Arabian Sarb Old_Turkic Orkh Oriya Orya Osage Osge Osmanya Osma Pahawh_Hmong Hmng Palmyrene Palm Pau_Cin_Hau Pauc Phags_Pa Phag Phoenician Phnx Psalter_Pahlavi Phlp Rejang Rjng Runic Runr Samaritan Samr Saurashtra Saur Sharada Shrd Shavian Shaw Siddham Sidd SignWriting Sgnw Sinhala Sinh Sora_Sompeng Sora Soyombo Soyo Sundanese Sund Syloti_Nagri Sylo Syriac Syrc Tagalog Tglg Tagbanwa Tagb Tai_Le Tale Tai_Tham Lana Tai_Viet Tavt Takri Takr Tamil Taml Tangut Tang Telugu Telu Thaana Thaa Thai Thai Tibetan Tibt Tifinagh Tfng Tirhuta Tirh Ugaritic Ugar Vai Vaii Warang_Citi Wara Yi Yiii Zanabazar_Square Zanb";
var ecma10ScriptValues = ecma9ScriptValues + " Dogra Dogr Gunjala_Gondi Gong Hanifi_Rohingya Rohg Makasar Maka Medefaidrin Medf Old_Sogdian Sogo Sogdian Sogd";
var ecma11ScriptValues = ecma10ScriptValues + " Elymaic Elym Nandinagari Nand Nyiakeng_Puachue_Hmong Hmnp Wancho Wcho";
var ecma12ScriptValues = ecma11ScriptValues + " Chorasmian Chrs Diak Dives_Akuru Khitan_Small_Script Kits Yezi Yezidi";
var ecma13ScriptValues = ecma12ScriptValues + " Cypro_Minoan Cpmn Old_Uyghur Ougr Tangsa Tnsa Toto Vithkuqi Vith";
var ecma14ScriptValues = ecma13ScriptValues + " " + scriptValuesAddedInUnicode;
var unicodeScriptValues = {
  9: ecma9ScriptValues,
  10: ecma10ScriptValues,
  11: ecma11ScriptValues,
  12: ecma12ScriptValues,
  13: ecma13ScriptValues,
  14: ecma14ScriptValues
};
var data = {};
function buildUnicodeData(ecmaVersion) {
  var d = data[ecmaVersion] = {
    binary: wordsRegexp(unicodeBinaryProperties[ecmaVersion] + " " + unicodeGeneralCategoryValues),
    binaryOfStrings: wordsRegexp(unicodeBinaryPropertiesOfStrings[ecmaVersion]),
    nonBinary: {
      General_Category: wordsRegexp(unicodeGeneralCategoryValues),
      Script: wordsRegexp(unicodeScriptValues[ecmaVersion])
    }
  };
  d.nonBinary.Script_Extensions = d.nonBinary.Script;
  d.nonBinary.gc = d.nonBinary.General_Category;
  d.nonBinary.sc = d.nonBinary.Script;
  d.nonBinary.scx = d.nonBinary.Script_Extensions;
}
for (i = 0, list = [9, 10, 11, 12, 13, 14]; i < list.length; i += 1) {
  ecmaVersion = list[i];
  buildUnicodeData(ecmaVersion);
}
var ecmaVersion;
var i;
var list;
var pp$1 = Parser.prototype;
var BranchID = function BranchID2(parent, base) {
  this.parent = parent;
  this.base = base || this;
};
BranchID.prototype.separatedFrom = function separatedFrom(alt) {
  for (var self = this; self; self = self.parent) {
    for (var other = alt; other; other = other.parent) {
      if (self.base === other.base && self !== other) {
        return true;
      }
    }
  }
  return false;
};
BranchID.prototype.sibling = function sibling() {
  return new BranchID(this.parent, this.base);
};
var RegExpValidationState = function RegExpValidationState2(parser) {
  this.parser = parser;
  this.validFlags = "gim" + (parser.options.ecmaVersion >= 6 ? "uy" : "") + (parser.options.ecmaVersion >= 9 ? "s" : "") + (parser.options.ecmaVersion >= 13 ? "d" : "") + (parser.options.ecmaVersion >= 15 ? "v" : "");
  this.unicodeProperties = data[parser.options.ecmaVersion >= 14 ? 14 : parser.options.ecmaVersion];
  this.source = "";
  this.flags = "";
  this.start = 0;
  this.switchU = false;
  this.switchV = false;
  this.switchN = false;
  this.pos = 0;
  this.lastIntValue = 0;
  this.lastStringValue = "";
  this.lastAssertionIsQuantifiable = false;
  this.numCapturingParens = 0;
  this.maxBackReference = 0;
  this.groupNames = /* @__PURE__ */ Object.create(null);
  this.backReferenceNames = [];
  this.branchID = null;
};
RegExpValidationState.prototype.reset = function reset(start, pattern, flags) {
  var unicodeSets = flags.indexOf("v") !== -1;
  var unicode = flags.indexOf("u") !== -1;
  this.start = start | 0;
  this.source = pattern + "";
  this.flags = flags;
  if (unicodeSets && this.parser.options.ecmaVersion >= 15) {
    this.switchU = true;
    this.switchV = true;
    this.switchN = true;
  } else {
    this.switchU = unicode && this.parser.options.ecmaVersion >= 6;
    this.switchV = false;
    this.switchN = unicode && this.parser.options.ecmaVersion >= 9;
  }
};
RegExpValidationState.prototype.raise = function raise(message) {
  this.parser.raiseRecoverable(this.start, "Invalid regular expression: /" + this.source + "/: " + message);
};
RegExpValidationState.prototype.at = function at(i, forceU) {
  if (forceU === void 0)
    forceU = false;
  var s = this.source;
  var l = s.length;
  if (i >= l) {
    return -1;
  }
  var c = s.charCodeAt(i);
  if (!(forceU || this.switchU) || c <= 55295 || c >= 57344 || i + 1 >= l) {
    return c;
  }
  var next = s.charCodeAt(i + 1);
  return next >= 56320 && next <= 57343 ? (c << 10) + next - 56613888 : c;
};
RegExpValidationState.prototype.nextIndex = function nextIndex(i, forceU) {
  if (forceU === void 0)
    forceU = false;
  var s = this.source;
  var l = s.length;
  if (i >= l) {
    return l;
  }
  var c = s.charCodeAt(i), next;
  if (!(forceU || this.switchU) || c <= 55295 || c >= 57344 || i + 1 >= l || (next = s.charCodeAt(i + 1)) < 56320 || next > 57343) {
    return i + 1;
  }
  return i + 2;
};
RegExpValidationState.prototype.current = function current(forceU) {
  if (forceU === void 0)
    forceU = false;
  return this.at(this.pos, forceU);
};
RegExpValidationState.prototype.lookahead = function lookahead(forceU) {
  if (forceU === void 0)
    forceU = false;
  return this.at(this.nextIndex(this.pos, forceU), forceU);
};
RegExpValidationState.prototype.advance = function advance(forceU) {
  if (forceU === void 0)
    forceU = false;
  this.pos = this.nextIndex(this.pos, forceU);
};
RegExpValidationState.prototype.eat = function eat(ch, forceU) {
  if (forceU === void 0)
    forceU = false;
  if (this.current(forceU) === ch) {
    this.advance(forceU);
    return true;
  }
  return false;
};
RegExpValidationState.prototype.eatChars = function eatChars(chs, forceU) {
  if (forceU === void 0)
    forceU = false;
  var pos = this.pos;
  for (var i = 0, list = chs; i < list.length; i += 1) {
    var ch = list[i];
    var current2 = this.at(pos, forceU);
    if (current2 === -1 || current2 !== ch) {
      return false;
    }
    pos = this.nextIndex(pos, forceU);
  }
  this.pos = pos;
  return true;
};
pp$1.validateRegExpFlags = function(state) {
  var validFlags = state.validFlags;
  var flags = state.flags;
  var u = false;
  var v = false;
  for (var i = 0; i < flags.length; i++) {
    var flag = flags.charAt(i);
    if (validFlags.indexOf(flag) === -1) {
      this.raise(state.start, "Invalid regular expression flag");
    }
    if (flags.indexOf(flag, i + 1) > -1) {
      this.raise(state.start, "Duplicate regular expression flag");
    }
    if (flag === "u") {
      u = true;
    }
    if (flag === "v") {
      v = true;
    }
  }
  if (this.options.ecmaVersion >= 15 && u && v) {
    this.raise(state.start, "Invalid regular expression flag");
  }
};
function hasProp(obj) {
  for (var _ in obj) {
    return true;
  }
  return false;
}
pp$1.validateRegExpPattern = function(state) {
  this.regexp_pattern(state);
  if (!state.switchN && this.options.ecmaVersion >= 9 && hasProp(state.groupNames)) {
    state.switchN = true;
    this.regexp_pattern(state);
  }
};
pp$1.regexp_pattern = function(state) {
  state.pos = 0;
  state.lastIntValue = 0;
  state.lastStringValue = "";
  state.lastAssertionIsQuantifiable = false;
  state.numCapturingParens = 0;
  state.maxBackReference = 0;
  state.groupNames = /* @__PURE__ */ Object.create(null);
  state.backReferenceNames.length = 0;
  state.branchID = null;
  this.regexp_disjunction(state);
  if (state.pos !== state.source.length) {
    if (state.eat(
      41
      /* ) */
    )) {
      state.raise("Unmatched ')'");
    }
    if (state.eat(
      93
      /* ] */
    ) || state.eat(
      125
      /* } */
    )) {
      state.raise("Lone quantifier brackets");
    }
  }
  if (state.maxBackReference > state.numCapturingParens) {
    state.raise("Invalid escape");
  }
  for (var i = 0, list = state.backReferenceNames; i < list.length; i += 1) {
    var name = list[i];
    if (!state.groupNames[name]) {
      state.raise("Invalid named capture referenced");
    }
  }
};
pp$1.regexp_disjunction = function(state) {
  var trackDisjunction = this.options.ecmaVersion >= 16;
  if (trackDisjunction) {
    state.branchID = new BranchID(state.branchID, null);
  }
  this.regexp_alternative(state);
  while (state.eat(
    124
    /* | */
  )) {
    if (trackDisjunction) {
      state.branchID = state.branchID.sibling();
    }
    this.regexp_alternative(state);
  }
  if (trackDisjunction) {
    state.branchID = state.branchID.parent;
  }
  if (this.regexp_eatQuantifier(state, true)) {
    state.raise("Nothing to repeat");
  }
  if (state.eat(
    123
    /* { */
  )) {
    state.raise("Lone quantifier brackets");
  }
};
pp$1.regexp_alternative = function(state) {
  while (state.pos < state.source.length && this.regexp_eatTerm(state)) {
  }
};
pp$1.regexp_eatTerm = function(state) {
  if (this.regexp_eatAssertion(state)) {
    if (state.lastAssertionIsQuantifiable && this.regexp_eatQuantifier(state)) {
      if (state.switchU) {
        state.raise("Invalid quantifier");
      }
    }
    return true;
  }
  if (state.switchU ? this.regexp_eatAtom(state) : this.regexp_eatExtendedAtom(state)) {
    this.regexp_eatQuantifier(state);
    return true;
  }
  return false;
};
pp$1.regexp_eatAssertion = function(state) {
  var start = state.pos;
  state.lastAssertionIsQuantifiable = false;
  if (state.eat(
    94
    /* ^ */
  ) || state.eat(
    36
    /* $ */
  )) {
    return true;
  }
  if (state.eat(
    92
    /* \ */
  )) {
    if (state.eat(
      66
      /* B */
    ) || state.eat(
      98
      /* b */
    )) {
      return true;
    }
    state.pos = start;
  }
  if (state.eat(
    40
    /* ( */
  ) && state.eat(
    63
    /* ? */
  )) {
    var lookbehind = false;
    if (this.options.ecmaVersion >= 9) {
      lookbehind = state.eat(
        60
        /* < */
      );
    }
    if (state.eat(
      61
      /* = */
    ) || state.eat(
      33
      /* ! */
    )) {
      this.regexp_disjunction(state);
      if (!state.eat(
        41
        /* ) */
      )) {
        state.raise("Unterminated group");
      }
      state.lastAssertionIsQuantifiable = !lookbehind;
      return true;
    }
  }
  state.pos = start;
  return false;
};
pp$1.regexp_eatQuantifier = function(state, noError) {
  if (noError === void 0)
    noError = false;
  if (this.regexp_eatQuantifierPrefix(state, noError)) {
    state.eat(
      63
      /* ? */
    );
    return true;
  }
  return false;
};
pp$1.regexp_eatQuantifierPrefix = function(state, noError) {
  return state.eat(
    42
    /* * */
  ) || state.eat(
    43
    /* + */
  ) || state.eat(
    63
    /* ? */
  ) || this.regexp_eatBracedQuantifier(state, noError);
};
pp$1.regexp_eatBracedQuantifier = function(state, noError) {
  var start = state.pos;
  if (state.eat(
    123
    /* { */
  )) {
    var min = 0, max = -1;
    if (this.regexp_eatDecimalDigits(state)) {
      min = state.lastIntValue;
      if (state.eat(
        44
        /* , */
      ) && this.regexp_eatDecimalDigits(state)) {
        max = state.lastIntValue;
      }
      if (state.eat(
        125
        /* } */
      )) {
        if (max !== -1 && max < min && !noError) {
          state.raise("numbers out of order in {} quantifier");
        }
        return true;
      }
    }
    if (state.switchU && !noError) {
      state.raise("Incomplete quantifier");
    }
    state.pos = start;
  }
  return false;
};
pp$1.regexp_eatAtom = function(state) {
  return this.regexp_eatPatternCharacters(state) || state.eat(
    46
    /* . */
  ) || this.regexp_eatReverseSolidusAtomEscape(state) || this.regexp_eatCharacterClass(state) || this.regexp_eatUncapturingGroup(state) || this.regexp_eatCapturingGroup(state);
};
pp$1.regexp_eatReverseSolidusAtomEscape = function(state) {
  var start = state.pos;
  if (state.eat(
    92
    /* \ */
  )) {
    if (this.regexp_eatAtomEscape(state)) {
      return true;
    }
    state.pos = start;
  }
  return false;
};
pp$1.regexp_eatUncapturingGroup = function(state) {
  var start = state.pos;
  if (state.eat(
    40
    /* ( */
  )) {
    if (state.eat(
      63
      /* ? */
    )) {
      if (this.options.ecmaVersion >= 16) {
        var addModifiers = this.regexp_eatModifiers(state);
        var hasHyphen = state.eat(
          45
          /* - */
        );
        if (addModifiers || hasHyphen) {
          for (var i = 0; i < addModifiers.length; i++) {
            var modifier = addModifiers.charAt(i);
            if (addModifiers.indexOf(modifier, i + 1) > -1) {
              state.raise("Duplicate regular expression modifiers");
            }
          }
          if (hasHyphen) {
            var removeModifiers = this.regexp_eatModifiers(state);
            if (!addModifiers && !removeModifiers && state.current() === 58) {
              state.raise("Invalid regular expression modifiers");
            }
            for (var i$1 = 0; i$1 < removeModifiers.length; i$1++) {
              var modifier$1 = removeModifiers.charAt(i$1);
              if (removeModifiers.indexOf(modifier$1, i$1 + 1) > -1 || addModifiers.indexOf(modifier$1) > -1) {
                state.raise("Duplicate regular expression modifiers");
              }
            }
          }
        }
      }
      if (state.eat(
        58
        /* : */
      )) {
        this.regexp_disjunction(state);
        if (state.eat(
          41
          /* ) */
        )) {
          return true;
        }
        state.raise("Unterminated group");
      }
    }
    state.pos = start;
  }
  return false;
};
pp$1.regexp_eatCapturingGroup = function(state) {
  if (state.eat(
    40
    /* ( */
  )) {
    if (this.options.ecmaVersion >= 9) {
      this.regexp_groupSpecifier(state);
    } else if (state.current() === 63) {
      state.raise("Invalid group");
    }
    this.regexp_disjunction(state);
    if (state.eat(
      41
      /* ) */
    )) {
      state.numCapturingParens += 1;
      return true;
    }
    state.raise("Unterminated group");
  }
  return false;
};
pp$1.regexp_eatModifiers = function(state) {
  var modifiers = "";
  var ch = 0;
  while ((ch = state.current()) !== -1 && isRegularExpressionModifier(ch)) {
    modifiers += codePointToString(ch);
    state.advance();
  }
  return modifiers;
};
function isRegularExpressionModifier(ch) {
  return ch === 105 || ch === 109 || ch === 115;
}
pp$1.regexp_eatExtendedAtom = function(state) {
  return state.eat(
    46
    /* . */
  ) || this.regexp_eatReverseSolidusAtomEscape(state) || this.regexp_eatCharacterClass(state) || this.regexp_eatUncapturingGroup(state) || this.regexp_eatCapturingGroup(state) || this.regexp_eatInvalidBracedQuantifier(state) || this.regexp_eatExtendedPatternCharacter(state);
};
pp$1.regexp_eatInvalidBracedQuantifier = function(state) {
  if (this.regexp_eatBracedQuantifier(state, true)) {
    state.raise("Nothing to repeat");
  }
  return false;
};
pp$1.regexp_eatSyntaxCharacter = function(state) {
  var ch = state.current();
  if (isSyntaxCharacter(ch)) {
    state.lastIntValue = ch;
    state.advance();
    return true;
  }
  return false;
};
function isSyntaxCharacter(ch) {
  return ch === 36 || ch >= 40 && ch <= 43 || ch === 46 || ch === 63 || ch >= 91 && ch <= 94 || ch >= 123 && ch <= 125;
}
pp$1.regexp_eatPatternCharacters = function(state) {
  var start = state.pos;
  var ch = 0;
  while ((ch = state.current()) !== -1 && !isSyntaxCharacter(ch)) {
    state.advance();
  }
  return state.pos !== start;
};
pp$1.regexp_eatExtendedPatternCharacter = function(state) {
  var ch = state.current();
  if (ch !== -1 && ch !== 36 && !(ch >= 40 && ch <= 43) && ch !== 46 && ch !== 63 && ch !== 91 && ch !== 94 && ch !== 124) {
    state.advance();
    return true;
  }
  return false;
};
pp$1.regexp_groupSpecifier = function(state) {
  if (state.eat(
    63
    /* ? */
  )) {
    if (!this.regexp_eatGroupName(state)) {
      state.raise("Invalid group");
    }
    var trackDisjunction = this.options.ecmaVersion >= 16;
    var known = state.groupNames[state.lastStringValue];
    if (known) {
      if (trackDisjunction) {
        for (var i = 0, list = known; i < list.length; i += 1) {
          var altID = list[i];
          if (!altID.separatedFrom(state.branchID)) {
            state.raise("Duplicate capture group name");
          }
        }
      } else {
        state.raise("Duplicate capture group name");
      }
    }
    if (trackDisjunction) {
      (known || (state.groupNames[state.lastStringValue] = [])).push(state.branchID);
    } else {
      state.groupNames[state.lastStringValue] = true;
    }
  }
};
pp$1.regexp_eatGroupName = function(state) {
  state.lastStringValue = "";
  if (state.eat(
    60
    /* < */
  )) {
    if (this.regexp_eatRegExpIdentifierName(state) && state.eat(
      62
      /* > */
    )) {
      return true;
    }
    state.raise("Invalid capture group name");
  }
  return false;
};
pp$1.regexp_eatRegExpIdentifierName = function(state) {
  state.lastStringValue = "";
  if (this.regexp_eatRegExpIdentifierStart(state)) {
    state.lastStringValue += codePointToString(state.lastIntValue);
    while (this.regexp_eatRegExpIdentifierPart(state)) {
      state.lastStringValue += codePointToString(state.lastIntValue);
    }
    return true;
  }
  return false;
};
pp$1.regexp_eatRegExpIdentifierStart = function(state) {
  var start = state.pos;
  var forceU = this.options.ecmaVersion >= 11;
  var ch = state.current(forceU);
  state.advance(forceU);
  if (ch === 92 && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
    ch = state.lastIntValue;
  }
  if (isRegExpIdentifierStart(ch)) {
    state.lastIntValue = ch;
    return true;
  }
  state.pos = start;
  return false;
};
function isRegExpIdentifierStart(ch) {
  return isIdentifierStart(ch, true) || ch === 36 || ch === 95;
}
pp$1.regexp_eatRegExpIdentifierPart = function(state) {
  var start = state.pos;
  var forceU = this.options.ecmaVersion >= 11;
  var ch = state.current(forceU);
  state.advance(forceU);
  if (ch === 92 && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
    ch = state.lastIntValue;
  }
  if (isRegExpIdentifierPart(ch)) {
    state.lastIntValue = ch;
    return true;
  }
  state.pos = start;
  return false;
};
function isRegExpIdentifierPart(ch) {
  return isIdentifierChar(ch, true) || ch === 36 || ch === 95 || ch === 8204 || ch === 8205;
}
pp$1.regexp_eatAtomEscape = function(state) {
  if (this.regexp_eatBackReference(state) || this.regexp_eatCharacterClassEscape(state) || this.regexp_eatCharacterEscape(state) || state.switchN && this.regexp_eatKGroupName(state)) {
    return true;
  }
  if (state.switchU) {
    if (state.current() === 99) {
      state.raise("Invalid unicode escape");
    }
    state.raise("Invalid escape");
  }
  return false;
};
pp$1.regexp_eatBackReference = function(state) {
  var start = state.pos;
  if (this.regexp_eatDecimalEscape(state)) {
    var n = state.lastIntValue;
    if (state.switchU) {
      if (n > state.maxBackReference) {
        state.maxBackReference = n;
      }
      return true;
    }
    if (n <= state.numCapturingParens) {
      return true;
    }
    state.pos = start;
  }
  return false;
};
pp$1.regexp_eatKGroupName = function(state) {
  if (state.eat(
    107
    /* k */
  )) {
    if (this.regexp_eatGroupName(state)) {
      state.backReferenceNames.push(state.lastStringValue);
      return true;
    }
    state.raise("Invalid named reference");
  }
  return false;
};
pp$1.regexp_eatCharacterEscape = function(state) {
  return this.regexp_eatControlEscape(state) || this.regexp_eatCControlLetter(state) || this.regexp_eatZero(state) || this.regexp_eatHexEscapeSequence(state) || this.regexp_eatRegExpUnicodeEscapeSequence(state, false) || !state.switchU && this.regexp_eatLegacyOctalEscapeSequence(state) || this.regexp_eatIdentityEscape(state);
};
pp$1.regexp_eatCControlLetter = function(state) {
  var start = state.pos;
  if (state.eat(
    99
    /* c */
  )) {
    if (this.regexp_eatControlLetter(state)) {
      return true;
    }
    state.pos = start;
  }
  return false;
};
pp$1.regexp_eatZero = function(state) {
  if (state.current() === 48 && !isDecimalDigit(state.lookahead())) {
    state.lastIntValue = 0;
    state.advance();
    return true;
  }
  return false;
};
pp$1.regexp_eatControlEscape = function(state) {
  var ch = state.current();
  if (ch === 116) {
    state.lastIntValue = 9;
    state.advance();
    return true;
  }
  if (ch === 110) {
    state.lastIntValue = 10;
    state.advance();
    return true;
  }
  if (ch === 118) {
    state.lastIntValue = 11;
    state.advance();
    return true;
  }
  if (ch === 102) {
    state.lastIntValue = 12;
    state.advance();
    return true;
  }
  if (ch === 114) {
    state.lastIntValue = 13;
    state.advance();
    return true;
  }
  return false;
};
pp$1.regexp_eatControlLetter = function(state) {
  var ch = state.current();
  if (isControlLetter(ch)) {
    state.lastIntValue = ch % 32;
    state.advance();
    return true;
  }
  return false;
};
function isControlLetter(ch) {
  return ch >= 65 && ch <= 90 || ch >= 97 && ch <= 122;
}
pp$1.regexp_eatRegExpUnicodeEscapeSequence = function(state, forceU) {
  if (forceU === void 0)
    forceU = false;
  var start = state.pos;
  var switchU = forceU || state.switchU;
  if (state.eat(
    117
    /* u */
  )) {
    if (this.regexp_eatFixedHexDigits(state, 4)) {
      var lead = state.lastIntValue;
      if (switchU && lead >= 55296 && lead <= 56319) {
        var leadSurrogateEnd = state.pos;
        if (state.eat(
          92
          /* \ */
        ) && state.eat(
          117
          /* u */
        ) && this.regexp_eatFixedHexDigits(state, 4)) {
          var trail = state.lastIntValue;
          if (trail >= 56320 && trail <= 57343) {
            state.lastIntValue = (lead - 55296) * 1024 + (trail - 56320) + 65536;
            return true;
          }
        }
        state.pos = leadSurrogateEnd;
        state.lastIntValue = lead;
      }
      return true;
    }
    if (switchU && state.eat(
      123
      /* { */
    ) && this.regexp_eatHexDigits(state) && state.eat(
      125
      /* } */
    ) && isValidUnicode(state.lastIntValue)) {
      return true;
    }
    if (switchU) {
      state.raise("Invalid unicode escape");
    }
    state.pos = start;
  }
  return false;
};
function isValidUnicode(ch) {
  return ch >= 0 && ch <= 1114111;
}
pp$1.regexp_eatIdentityEscape = function(state) {
  if (state.switchU) {
    if (this.regexp_eatSyntaxCharacter(state)) {
      return true;
    }
    if (state.eat(
      47
      /* / */
    )) {
      state.lastIntValue = 47;
      return true;
    }
    return false;
  }
  var ch = state.current();
  if (ch !== 99 && (!state.switchN || ch !== 107)) {
    state.lastIntValue = ch;
    state.advance();
    return true;
  }
  return false;
};
pp$1.regexp_eatDecimalEscape = function(state) {
  state.lastIntValue = 0;
  var ch = state.current();
  if (ch >= 49 && ch <= 57) {
    do {
      state.lastIntValue = 10 * state.lastIntValue + (ch - 48);
      state.advance();
    } while ((ch = state.current()) >= 48 && ch <= 57);
    return true;
  }
  return false;
};
var CharSetNone = 0;
var CharSetOk = 1;
var CharSetString = 2;
pp$1.regexp_eatCharacterClassEscape = function(state) {
  var ch = state.current();
  if (isCharacterClassEscape(ch)) {
    state.lastIntValue = -1;
    state.advance();
    return CharSetOk;
  }
  var negate = false;
  if (state.switchU && this.options.ecmaVersion >= 9 && ((negate = ch === 80) || ch === 112)) {
    state.lastIntValue = -1;
    state.advance();
    var result;
    if (state.eat(
      123
      /* { */
    ) && (result = this.regexp_eatUnicodePropertyValueExpression(state)) && state.eat(
      125
      /* } */
    )) {
      if (negate && result === CharSetString) {
        state.raise("Invalid property name");
      }
      return result;
    }
    state.raise("Invalid property name");
  }
  return CharSetNone;
};
function isCharacterClassEscape(ch) {
  return ch === 100 || ch === 68 || ch === 115 || ch === 83 || ch === 119 || ch === 87;
}
pp$1.regexp_eatUnicodePropertyValueExpression = function(state) {
  var start = state.pos;
  if (this.regexp_eatUnicodePropertyName(state) && state.eat(
    61
    /* = */
  )) {
    var name = state.lastStringValue;
    if (this.regexp_eatUnicodePropertyValue(state)) {
      var value = state.lastStringValue;
      this.regexp_validateUnicodePropertyNameAndValue(state, name, value);
      return CharSetOk;
    }
  }
  state.pos = start;
  if (this.regexp_eatLoneUnicodePropertyNameOrValue(state)) {
    var nameOrValue = state.lastStringValue;
    return this.regexp_validateUnicodePropertyNameOrValue(state, nameOrValue);
  }
  return CharSetNone;
};
pp$1.regexp_validateUnicodePropertyNameAndValue = function(state, name, value) {
  if (!hasOwn(state.unicodeProperties.nonBinary, name)) {
    state.raise("Invalid property name");
  }
  if (!state.unicodeProperties.nonBinary[name].test(value)) {
    state.raise("Invalid property value");
  }
};
pp$1.regexp_validateUnicodePropertyNameOrValue = function(state, nameOrValue) {
  if (state.unicodeProperties.binary.test(nameOrValue)) {
    return CharSetOk;
  }
  if (state.switchV && state.unicodeProperties.binaryOfStrings.test(nameOrValue)) {
    return CharSetString;
  }
  state.raise("Invalid property name");
};
pp$1.regexp_eatUnicodePropertyName = function(state) {
  var ch = 0;
  state.lastStringValue = "";
  while (isUnicodePropertyNameCharacter(ch = state.current())) {
    state.lastStringValue += codePointToString(ch);
    state.advance();
  }
  return state.lastStringValue !== "";
};
function isUnicodePropertyNameCharacter(ch) {
  return isControlLetter(ch) || ch === 95;
}
pp$1.regexp_eatUnicodePropertyValue = function(state) {
  var ch = 0;
  state.lastStringValue = "";
  while (isUnicodePropertyValueCharacter(ch = state.current())) {
    state.lastStringValue += codePointToString(ch);
    state.advance();
  }
  return state.lastStringValue !== "";
};
function isUnicodePropertyValueCharacter(ch) {
  return isUnicodePropertyNameCharacter(ch) || isDecimalDigit(ch);
}
pp$1.regexp_eatLoneUnicodePropertyNameOrValue = function(state) {
  return this.regexp_eatUnicodePropertyValue(state);
};
pp$1.regexp_eatCharacterClass = function(state) {
  if (state.eat(
    91
    /* [ */
  )) {
    var negate = state.eat(
      94
      /* ^ */
    );
    var result = this.regexp_classContents(state);
    if (!state.eat(
      93
      /* ] */
    )) {
      state.raise("Unterminated character class");
    }
    if (negate && result === CharSetString) {
      state.raise("Negated character class may contain strings");
    }
    return true;
  }
  return false;
};
pp$1.regexp_classContents = function(state) {
  if (state.current() === 93) {
    return CharSetOk;
  }
  if (state.switchV) {
    return this.regexp_classSetExpression(state);
  }
  this.regexp_nonEmptyClassRanges(state);
  return CharSetOk;
};
pp$1.regexp_nonEmptyClassRanges = function(state) {
  while (this.regexp_eatClassAtom(state)) {
    var left = state.lastIntValue;
    if (state.eat(
      45
      /* - */
    ) && this.regexp_eatClassAtom(state)) {
      var right = state.lastIntValue;
      if (state.switchU && (left === -1 || right === -1)) {
        state.raise("Invalid character class");
      }
      if (left !== -1 && right !== -1 && left > right) {
        state.raise("Range out of order in character class");
      }
    }
  }
};
pp$1.regexp_eatClassAtom = function(state) {
  var start = state.pos;
  if (state.eat(
    92
    /* \ */
  )) {
    if (this.regexp_eatClassEscape(state)) {
      return true;
    }
    if (state.switchU) {
      var ch$1 = state.current();
      if (ch$1 === 99 || isOctalDigit(ch$1)) {
        state.raise("Invalid class escape");
      }
      state.raise("Invalid escape");
    }
    state.pos = start;
  }
  var ch = state.current();
  if (ch !== 93) {
    state.lastIntValue = ch;
    state.advance();
    return true;
  }
  return false;
};
pp$1.regexp_eatClassEscape = function(state) {
  var start = state.pos;
  if (state.eat(
    98
    /* b */
  )) {
    state.lastIntValue = 8;
    return true;
  }
  if (state.switchU && state.eat(
    45
    /* - */
  )) {
    state.lastIntValue = 45;
    return true;
  }
  if (!state.switchU && state.eat(
    99
    /* c */
  )) {
    if (this.regexp_eatClassControlLetter(state)) {
      return true;
    }
    state.pos = start;
  }
  return this.regexp_eatCharacterClassEscape(state) || this.regexp_eatCharacterEscape(state);
};
pp$1.regexp_classSetExpression = function(state) {
  var result = CharSetOk, subResult;
  if (this.regexp_eatClassSetRange(state))
    ;
  else if (subResult = this.regexp_eatClassSetOperand(state)) {
    if (subResult === CharSetString) {
      result = CharSetString;
    }
    var start = state.pos;
    while (state.eatChars(
      [38, 38]
      /* && */
    )) {
      if (state.current() !== 38 && (subResult = this.regexp_eatClassSetOperand(state))) {
        if (subResult !== CharSetString) {
          result = CharSetOk;
        }
        continue;
      }
      state.raise("Invalid character in character class");
    }
    if (start !== state.pos) {
      return result;
    }
    while (state.eatChars(
      [45, 45]
      /* -- */
    )) {
      if (this.regexp_eatClassSetOperand(state)) {
        continue;
      }
      state.raise("Invalid character in character class");
    }
    if (start !== state.pos) {
      return result;
    }
  } else {
    state.raise("Invalid character in character class");
  }
  for (; ; ) {
    if (this.regexp_eatClassSetRange(state)) {
      continue;
    }
    subResult = this.regexp_eatClassSetOperand(state);
    if (!subResult) {
      return result;
    }
    if (subResult === CharSetString) {
      result = CharSetString;
    }
  }
};
pp$1.regexp_eatClassSetRange = function(state) {
  var start = state.pos;
  if (this.regexp_eatClassSetCharacter(state)) {
    var left = state.lastIntValue;
    if (state.eat(
      45
      /* - */
    ) && this.regexp_eatClassSetCharacter(state)) {
      var right = state.lastIntValue;
      if (left !== -1 && right !== -1 && left > right) {
        state.raise("Range out of order in character class");
      }
      return true;
    }
    state.pos = start;
  }
  return false;
};
pp$1.regexp_eatClassSetOperand = function(state) {
  if (this.regexp_eatClassSetCharacter(state)) {
    return CharSetOk;
  }
  return this.regexp_eatClassStringDisjunction(state) || this.regexp_eatNestedClass(state);
};
pp$1.regexp_eatNestedClass = function(state) {
  var start = state.pos;
  if (state.eat(
    91
    /* [ */
  )) {
    var negate = state.eat(
      94
      /* ^ */
    );
    var result = this.regexp_classContents(state);
    if (state.eat(
      93
      /* ] */
    )) {
      if (negate && result === CharSetString) {
        state.raise("Negated character class may contain strings");
      }
      return result;
    }
    state.pos = start;
  }
  if (state.eat(
    92
    /* \ */
  )) {
    var result$1 = this.regexp_eatCharacterClassEscape(state);
    if (result$1) {
      return result$1;
    }
    state.pos = start;
  }
  return null;
};
pp$1.regexp_eatClassStringDisjunction = function(state) {
  var start = state.pos;
  if (state.eatChars(
    [92, 113]
    /* \q */
  )) {
    if (state.eat(
      123
      /* { */
    )) {
      var result = this.regexp_classStringDisjunctionContents(state);
      if (state.eat(
        125
        /* } */
      )) {
        return result;
      }
    } else {
      state.raise("Invalid escape");
    }
    state.pos = start;
  }
  return null;
};
pp$1.regexp_classStringDisjunctionContents = function(state) {
  var result = this.regexp_classString(state);
  while (state.eat(
    124
    /* | */
  )) {
    if (this.regexp_classString(state) === CharSetString) {
      result = CharSetString;
    }
  }
  return result;
};
pp$1.regexp_classString = function(state) {
  var count = 0;
  while (this.regexp_eatClassSetCharacter(state)) {
    count++;
  }
  return count === 1 ? CharSetOk : CharSetString;
};
pp$1.regexp_eatClassSetCharacter = function(state) {
  var start = state.pos;
  if (state.eat(
    92
    /* \ */
  )) {
    if (this.regexp_eatCharacterEscape(state) || this.regexp_eatClassSetReservedPunctuator(state)) {
      return true;
    }
    if (state.eat(
      98
      /* b */
    )) {
      state.lastIntValue = 8;
      return true;
    }
    state.pos = start;
    return false;
  }
  var ch = state.current();
  if (ch < 0 || ch === state.lookahead() && isClassSetReservedDoublePunctuatorCharacter(ch)) {
    return false;
  }
  if (isClassSetSyntaxCharacter(ch)) {
    return false;
  }
  state.advance();
  state.lastIntValue = ch;
  return true;
};
function isClassSetReservedDoublePunctuatorCharacter(ch) {
  return ch === 33 || ch >= 35 && ch <= 38 || ch >= 42 && ch <= 44 || ch === 46 || ch >= 58 && ch <= 64 || ch === 94 || ch === 96 || ch === 126;
}
function isClassSetSyntaxCharacter(ch) {
  return ch === 40 || ch === 41 || ch === 45 || ch === 47 || ch >= 91 && ch <= 93 || ch >= 123 && ch <= 125;
}
pp$1.regexp_eatClassSetReservedPunctuator = function(state) {
  var ch = state.current();
  if (isClassSetReservedPunctuator(ch)) {
    state.lastIntValue = ch;
    state.advance();
    return true;
  }
  return false;
};
function isClassSetReservedPunctuator(ch) {
  return ch === 33 || ch === 35 || ch === 37 || ch === 38 || ch === 44 || ch === 45 || ch >= 58 && ch <= 62 || ch === 64 || ch === 96 || ch === 126;
}
pp$1.regexp_eatClassControlLetter = function(state) {
  var ch = state.current();
  if (isDecimalDigit(ch) || ch === 95) {
    state.lastIntValue = ch % 32;
    state.advance();
    return true;
  }
  return false;
};
pp$1.regexp_eatHexEscapeSequence = function(state) {
  var start = state.pos;
  if (state.eat(
    120
    /* x */
  )) {
    if (this.regexp_eatFixedHexDigits(state, 2)) {
      return true;
    }
    if (state.switchU) {
      state.raise("Invalid escape");
    }
    state.pos = start;
  }
  return false;
};
pp$1.regexp_eatDecimalDigits = function(state) {
  var start = state.pos;
  var ch = 0;
  state.lastIntValue = 0;
  while (isDecimalDigit(ch = state.current())) {
    state.lastIntValue = 10 * state.lastIntValue + (ch - 48);
    state.advance();
  }
  return state.pos !== start;
};
function isDecimalDigit(ch) {
  return ch >= 48 && ch <= 57;
}
pp$1.regexp_eatHexDigits = function(state) {
  var start = state.pos;
  var ch = 0;
  state.lastIntValue = 0;
  while (isHexDigit(ch = state.current())) {
    state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
    state.advance();
  }
  return state.pos !== start;
};
function isHexDigit(ch) {
  return ch >= 48 && ch <= 57 || ch >= 65 && ch <= 70 || ch >= 97 && ch <= 102;
}
function hexToInt(ch) {
  if (ch >= 65 && ch <= 70) {
    return 10 + (ch - 65);
  }
  if (ch >= 97 && ch <= 102) {
    return 10 + (ch - 97);
  }
  return ch - 48;
}
pp$1.regexp_eatLegacyOctalEscapeSequence = function(state) {
  if (this.regexp_eatOctalDigit(state)) {
    var n1 = state.lastIntValue;
    if (this.regexp_eatOctalDigit(state)) {
      var n2 = state.lastIntValue;
      if (n1 <= 3 && this.regexp_eatOctalDigit(state)) {
        state.lastIntValue = n1 * 64 + n2 * 8 + state.lastIntValue;
      } else {
        state.lastIntValue = n1 * 8 + n2;
      }
    } else {
      state.lastIntValue = n1;
    }
    return true;
  }
  return false;
};
pp$1.regexp_eatOctalDigit = function(state) {
  var ch = state.current();
  if (isOctalDigit(ch)) {
    state.lastIntValue = ch - 48;
    state.advance();
    return true;
  }
  state.lastIntValue = 0;
  return false;
};
function isOctalDigit(ch) {
  return ch >= 48 && ch <= 55;
}
pp$1.regexp_eatFixedHexDigits = function(state, length) {
  var start = state.pos;
  state.lastIntValue = 0;
  for (var i = 0; i < length; ++i) {
    var ch = state.current();
    if (!isHexDigit(ch)) {
      state.pos = start;
      return false;
    }
    state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
    state.advance();
  }
  return true;
};
var Token = function Token2(p) {
  this.type = p.type;
  this.value = p.value;
  this.start = p.start;
  this.end = p.end;
  if (p.options.locations) {
    this.loc = new SourceLocation(p, p.startLoc, p.endLoc);
  }
  if (p.options.ranges) {
    this.range = [p.start, p.end];
  }
};
var pp = Parser.prototype;
pp.next = function(ignoreEscapeSequenceInKeyword) {
  if (!ignoreEscapeSequenceInKeyword && this.type.keyword && this.containsEsc) {
    this.raiseRecoverable(this.start, "Escape sequence in keyword " + this.type.keyword);
  }
  if (this.options.onToken) {
    this.options.onToken(new Token(this));
  }
  this.lastTokEnd = this.end;
  this.lastTokStart = this.start;
  this.lastTokEndLoc = this.endLoc;
  this.lastTokStartLoc = this.startLoc;
  this.nextToken();
};
pp.getToken = function() {
  this.next();
  return new Token(this);
};
if (typeof Symbol !== "undefined") {
  pp[Symbol.iterator] = function() {
    var this$1$1 = this;
    return {
      next: function() {
        var token = this$1$1.getToken();
        return {
          done: token.type === types$1.eof,
          value: token
        };
      }
    };
  };
}
pp.nextToken = function() {
  var curContext = this.curContext();
  if (!curContext || !curContext.preserveSpace) {
    this.skipSpace();
  }
  this.start = this.pos;
  if (this.options.locations) {
    this.startLoc = this.curPosition();
  }
  if (this.pos >= this.input.length) {
    return this.finishToken(types$1.eof);
  }
  if (curContext.override) {
    return curContext.override(this);
  } else {
    this.readToken(this.fullCharCodeAtPos());
  }
};
pp.readToken = function(code) {
  if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92) {
    return this.readWord();
  }
  return this.getTokenFromCode(code);
};
pp.fullCharCodeAt = function(pos) {
  var code = this.input.charCodeAt(pos);
  if (code <= 55295 || code >= 56320) {
    return code;
  }
  var next = this.input.charCodeAt(pos + 1);
  return next <= 56319 || next >= 57344 ? code : (code << 10) + next - 56613888;
};
pp.fullCharCodeAtPos = function() {
  return this.fullCharCodeAt(this.pos);
};
pp.skipBlockComment = function() {
  var startLoc = this.options.onComment && this.curPosition();
  var start = this.pos, end = this.input.indexOf("*/", this.pos += 2);
  if (end === -1) {
    this.raise(this.pos - 2, "Unterminated comment");
  }
  this.pos = end + 2;
  if (this.options.locations) {
    for (var nextBreak = void 0, pos = start; (nextBreak = nextLineBreak(this.input, pos, this.pos)) > -1; ) {
      ++this.curLine;
      pos = this.lineStart = nextBreak;
    }
  }
  if (this.options.onComment) {
    this.options.onComment(
      true,
      this.input.slice(start + 2, end),
      start,
      this.pos,
      startLoc,
      this.curPosition()
    );
  }
};
pp.skipLineComment = function(startSkip) {
  var start = this.pos;
  var startLoc = this.options.onComment && this.curPosition();
  var ch = this.input.charCodeAt(this.pos += startSkip);
  while (this.pos < this.input.length && !isNewLine(ch)) {
    ch = this.input.charCodeAt(++this.pos);
  }
  if (this.options.onComment) {
    this.options.onComment(
      false,
      this.input.slice(start + startSkip, this.pos),
      start,
      this.pos,
      startLoc,
      this.curPosition()
    );
  }
};
pp.skipSpace = function() {
  loop:
    while (this.pos < this.input.length) {
      var ch = this.input.charCodeAt(this.pos);
      switch (ch) {
        case 32:
        case 160:
          ++this.pos;
          break;
        case 13:
          if (this.input.charCodeAt(this.pos + 1) === 10) {
            ++this.pos;
          }
        case 10:
        case 8232:
        case 8233:
          ++this.pos;
          if (this.options.locations) {
            ++this.curLine;
            this.lineStart = this.pos;
          }
          break;
        case 47:
          switch (this.input.charCodeAt(this.pos + 1)) {
            case 42:
              this.skipBlockComment();
              break;
            case 47:
              this.skipLineComment(2);
              break;
            default:
              break loop;
          }
          break;
        default:
          if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
            ++this.pos;
          } else {
            break loop;
          }
      }
    }
};
pp.finishToken = function(type, val) {
  this.end = this.pos;
  if (this.options.locations) {
    this.endLoc = this.curPosition();
  }
  var prevType = this.type;
  this.type = type;
  this.value = val;
  this.updateContext(prevType);
};
pp.readToken_dot = function() {
  var next = this.input.charCodeAt(this.pos + 1);
  if (next >= 48 && next <= 57) {
    return this.readNumber(true);
  }
  var next2 = this.input.charCodeAt(this.pos + 2);
  if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) {
    this.pos += 3;
    return this.finishToken(types$1.ellipsis);
  } else {
    ++this.pos;
    return this.finishToken(types$1.dot);
  }
};
pp.readToken_slash = function() {
  var next = this.input.charCodeAt(this.pos + 1);
  if (this.exprAllowed) {
    ++this.pos;
    return this.readRegexp();
  }
  if (next === 61) {
    return this.finishOp(types$1.assign, 2);
  }
  return this.finishOp(types$1.slash, 1);
};
pp.readToken_mult_modulo_exp = function(code) {
  var next = this.input.charCodeAt(this.pos + 1);
  var size = 1;
  var tokentype = code === 42 ? types$1.star : types$1.modulo;
  if (this.options.ecmaVersion >= 7 && code === 42 && next === 42) {
    ++size;
    tokentype = types$1.starstar;
    next = this.input.charCodeAt(this.pos + 2);
  }
  if (next === 61) {
    return this.finishOp(types$1.assign, size + 1);
  }
  return this.finishOp(tokentype, size);
};
pp.readToken_pipe_amp = function(code) {
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === code) {
    if (this.options.ecmaVersion >= 12) {
      var next2 = this.input.charCodeAt(this.pos + 2);
      if (next2 === 61) {
        return this.finishOp(types$1.assign, 3);
      }
    }
    return this.finishOp(code === 124 ? types$1.logicalOR : types$1.logicalAND, 2);
  }
  if (next === 61) {
    return this.finishOp(types$1.assign, 2);
  }
  return this.finishOp(code === 124 ? types$1.bitwiseOR : types$1.bitwiseAND, 1);
};
pp.readToken_caret = function() {
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === 61) {
    return this.finishOp(types$1.assign, 2);
  }
  return this.finishOp(types$1.bitwiseXOR, 1);
};
pp.readToken_plus_min = function(code) {
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === code) {
    if (next === 45 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 62 && (this.lastTokEnd === 0 || lineBreak.test(this.input.slice(this.lastTokEnd, this.pos)))) {
      this.skipLineComment(3);
      this.skipSpace();
      return this.nextToken();
    }
    return this.finishOp(types$1.incDec, 2);
  }
  if (next === 61) {
    return this.finishOp(types$1.assign, 2);
  }
  return this.finishOp(types$1.plusMin, 1);
};
pp.readToken_lt_gt = function(code) {
  var next = this.input.charCodeAt(this.pos + 1);
  var size = 1;
  if (next === code) {
    size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
    if (this.input.charCodeAt(this.pos + size) === 61) {
      return this.finishOp(types$1.assign, size + 1);
    }
    return this.finishOp(types$1.bitShift, size);
  }
  if (next === 33 && code === 60 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 45 && this.input.charCodeAt(this.pos + 3) === 45) {
    this.skipLineComment(4);
    this.skipSpace();
    return this.nextToken();
  }
  if (next === 61) {
    size = 2;
  }
  return this.finishOp(types$1.relational, size);
};
pp.readToken_eq_excl = function(code) {
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === 61) {
    return this.finishOp(types$1.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2);
  }
  if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) {
    this.pos += 2;
    return this.finishToken(types$1.arrow);
  }
  return this.finishOp(code === 61 ? types$1.eq : types$1.prefix, 1);
};
pp.readToken_question = function() {
  var ecmaVersion = this.options.ecmaVersion;
  if (ecmaVersion >= 11) {
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 46) {
      var next2 = this.input.charCodeAt(this.pos + 2);
      if (next2 < 48 || next2 > 57) {
        return this.finishOp(types$1.questionDot, 2);
      }
    }
    if (next === 63) {
      if (ecmaVersion >= 12) {
        var next2$1 = this.input.charCodeAt(this.pos + 2);
        if (next2$1 === 61) {
          return this.finishOp(types$1.assign, 3);
        }
      }
      return this.finishOp(types$1.coalesce, 2);
    }
  }
  return this.finishOp(types$1.question, 1);
};
pp.readToken_numberSign = function() {
  var ecmaVersion = this.options.ecmaVersion;
  var code = 35;
  if (ecmaVersion >= 13) {
    ++this.pos;
    code = this.fullCharCodeAtPos();
    if (isIdentifierStart(code, true) || code === 92) {
      return this.finishToken(types$1.privateId, this.readWord1());
    }
  }
  this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
};
pp.getTokenFromCode = function(code) {
  switch (code) {
    case 46:
      return this.readToken_dot();
    case 40:
      ++this.pos;
      return this.finishToken(types$1.parenL);
    case 41:
      ++this.pos;
      return this.finishToken(types$1.parenR);
    case 59:
      ++this.pos;
      return this.finishToken(types$1.semi);
    case 44:
      ++this.pos;
      return this.finishToken(types$1.comma);
    case 91:
      ++this.pos;
      return this.finishToken(types$1.bracketL);
    case 93:
      ++this.pos;
      return this.finishToken(types$1.bracketR);
    case 123:
      ++this.pos;
      return this.finishToken(types$1.braceL);
    case 125:
      ++this.pos;
      return this.finishToken(types$1.braceR);
    case 58:
      ++this.pos;
      return this.finishToken(types$1.colon);
    case 96:
      if (this.options.ecmaVersion < 6) {
        break;
      }
      ++this.pos;
      return this.finishToken(types$1.backQuote);
    case 48:
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === 120 || next === 88) {
        return this.readRadixNumber(16);
      }
      if (this.options.ecmaVersion >= 6) {
        if (next === 111 || next === 79) {
          return this.readRadixNumber(8);
        }
        if (next === 98 || next === 66) {
          return this.readRadixNumber(2);
        }
      }
    case 49:
    case 50:
    case 51:
    case 52:
    case 53:
    case 54:
    case 55:
    case 56:
    case 57:
      return this.readNumber(false);
    case 34:
    case 39:
      return this.readString(code);
    case 47:
      return this.readToken_slash();
    case 37:
    case 42:
      return this.readToken_mult_modulo_exp(code);
    case 124:
    case 38:
      return this.readToken_pipe_amp(code);
    case 94:
      return this.readToken_caret();
    case 43:
    case 45:
      return this.readToken_plus_min(code);
    case 60:
    case 62:
      return this.readToken_lt_gt(code);
    case 61:
    case 33:
      return this.readToken_eq_excl(code);
    case 63:
      return this.readToken_question();
    case 126:
      return this.finishOp(types$1.prefix, 1);
    case 35:
      return this.readToken_numberSign();
  }
  this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
};
pp.finishOp = function(type, size) {
  var str = this.input.slice(this.pos, this.pos + size);
  this.pos += size;
  return this.finishToken(type, str);
};
pp.readRegexp = function() {
  var escaped, inClass, start = this.pos;
  for (; ; ) {
    if (this.pos >= this.input.length) {
      this.raise(start, "Unterminated regular expression");
    }
    var ch = this.input.charAt(this.pos);
    if (lineBreak.test(ch)) {
      this.raise(start, "Unterminated regular expression");
    }
    if (!escaped) {
      if (ch === "[") {
        inClass = true;
      } else if (ch === "]" && inClass) {
        inClass = false;
      } else if (ch === "/" && !inClass) {
        break;
      }
      escaped = ch === "\\";
    } else {
      escaped = false;
    }
    ++this.pos;
  }
  var pattern = this.input.slice(start, this.pos);
  ++this.pos;
  var flagsStart = this.pos;
  var flags = this.readWord1();
  if (this.containsEsc) {
    this.unexpected(flagsStart);
  }
  var state = this.regexpState || (this.regexpState = new RegExpValidationState(this));
  state.reset(start, pattern, flags);
  this.validateRegExpFlags(state);
  this.validateRegExpPattern(state);
  var value = null;
  try {
    value = new RegExp(pattern, flags);
  } catch (e) {
  }
  return this.finishToken(types$1.regexp, { pattern, flags, value });
};
pp.readInt = function(radix, len, maybeLegacyOctalNumericLiteral) {
  var allowSeparators = this.options.ecmaVersion >= 12 && len === void 0;
  var isLegacyOctalNumericLiteral = maybeLegacyOctalNumericLiteral && this.input.charCodeAt(this.pos) === 48;
  var start = this.pos, total = 0, lastCode = 0;
  for (var i = 0, e = len == null ? Infinity : len; i < e; ++i, ++this.pos) {
    var code = this.input.charCodeAt(this.pos), val = void 0;
    if (allowSeparators && code === 95) {
      if (isLegacyOctalNumericLiteral) {
        this.raiseRecoverable(this.pos, "Numeric separator is not allowed in legacy octal numeric literals");
      }
      if (lastCode === 95) {
        this.raiseRecoverable(this.pos, "Numeric separator must be exactly one underscore");
      }
      if (i === 0) {
        this.raiseRecoverable(this.pos, "Numeric separator is not allowed at the first of digits");
      }
      lastCode = code;
      continue;
    }
    if (code >= 97) {
      val = code - 97 + 10;
    } else if (code >= 65) {
      val = code - 65 + 10;
    } else if (code >= 48 && code <= 57) {
      val = code - 48;
    } else {
      val = Infinity;
    }
    if (val >= radix) {
      break;
    }
    lastCode = code;
    total = total * radix + val;
  }
  if (allowSeparators && lastCode === 95) {
    this.raiseRecoverable(this.pos - 1, "Numeric separator is not allowed at the last of digits");
  }
  if (this.pos === start || len != null && this.pos - start !== len) {
    return null;
  }
  return total;
};
function stringToNumber(str, isLegacyOctalNumericLiteral) {
  if (isLegacyOctalNumericLiteral) {
    return parseInt(str, 8);
  }
  return parseFloat(str.replace(/_/g, ""));
}
function stringToBigInt(str) {
  if (typeof BigInt !== "function") {
    return null;
  }
  return BigInt(str.replace(/_/g, ""));
}
pp.readRadixNumber = function(radix) {
  var start = this.pos;
  this.pos += 2;
  var val = this.readInt(radix);
  if (val == null) {
    this.raise(this.start + 2, "Expected number in radix " + radix);
  }
  if (this.options.ecmaVersion >= 11 && this.input.charCodeAt(this.pos) === 110) {
    val = stringToBigInt(this.input.slice(start, this.pos));
    ++this.pos;
  } else if (isIdentifierStart(this.fullCharCodeAtPos())) {
    this.raise(this.pos, "Identifier directly after number");
  }
  return this.finishToken(types$1.num, val);
};
pp.readNumber = function(startsWithDot) {
  var start = this.pos;
  if (!startsWithDot && this.readInt(10, void 0, true) === null) {
    this.raise(start, "Invalid number");
  }
  var octal = this.pos - start >= 2 && this.input.charCodeAt(start) === 48;
  if (octal && this.strict) {
    this.raise(start, "Invalid number");
  }
  var next = this.input.charCodeAt(this.pos);
  if (!octal && !startsWithDot && this.options.ecmaVersion >= 11 && next === 110) {
    var val$1 = stringToBigInt(this.input.slice(start, this.pos));
    ++this.pos;
    if (isIdentifierStart(this.fullCharCodeAtPos())) {
      this.raise(this.pos, "Identifier directly after number");
    }
    return this.finishToken(types$1.num, val$1);
  }
  if (octal && /[89]/.test(this.input.slice(start, this.pos))) {
    octal = false;
  }
  if (next === 46 && !octal) {
    ++this.pos;
    this.readInt(10);
    next = this.input.charCodeAt(this.pos);
  }
  if ((next === 69 || next === 101) && !octal) {
    next = this.input.charCodeAt(++this.pos);
    if (next === 43 || next === 45) {
      ++this.pos;
    }
    if (this.readInt(10) === null) {
      this.raise(start, "Invalid number");
    }
  }
  if (isIdentifierStart(this.fullCharCodeAtPos())) {
    this.raise(this.pos, "Identifier directly after number");
  }
  var val = stringToNumber(this.input.slice(start, this.pos), octal);
  return this.finishToken(types$1.num, val);
};
pp.readCodePoint = function() {
  var ch = this.input.charCodeAt(this.pos), code;
  if (ch === 123) {
    if (this.options.ecmaVersion < 6) {
      this.unexpected();
    }
    var codePos = ++this.pos;
    code = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos);
    ++this.pos;
    if (code > 1114111) {
      this.invalidStringToken(codePos, "Code point out of bounds");
    }
  } else {
    code = this.readHexChar(4);
  }
  return code;
};
pp.readString = function(quote) {
  var out = "", chunkStart = ++this.pos;
  for (; ; ) {
    if (this.pos >= this.input.length) {
      this.raise(this.start, "Unterminated string constant");
    }
    var ch = this.input.charCodeAt(this.pos);
    if (ch === quote) {
      break;
    }
    if (ch === 92) {
      out += this.input.slice(chunkStart, this.pos);
      out += this.readEscapedChar(false);
      chunkStart = this.pos;
    } else if (ch === 8232 || ch === 8233) {
      if (this.options.ecmaVersion < 10) {
        this.raise(this.start, "Unterminated string constant");
      }
      ++this.pos;
      if (this.options.locations) {
        this.curLine++;
        this.lineStart = this.pos;
      }
    } else {
      if (isNewLine(ch)) {
        this.raise(this.start, "Unterminated string constant");
      }
      ++this.pos;
    }
  }
  out += this.input.slice(chunkStart, this.pos++);
  return this.finishToken(types$1.string, out);
};
var INVALID_TEMPLATE_ESCAPE_ERROR = {};
pp.tryReadTemplateToken = function() {
  this.inTemplateElement = true;
  try {
    this.readTmplToken();
  } catch (err) {
    if (err === INVALID_TEMPLATE_ESCAPE_ERROR) {
      this.readInvalidTemplateToken();
    } else {
      throw err;
    }
  }
  this.inTemplateElement = false;
};
pp.invalidStringToken = function(position, message) {
  if (this.inTemplateElement && this.options.ecmaVersion >= 9) {
    throw INVALID_TEMPLATE_ESCAPE_ERROR;
  } else {
    this.raise(position, message);
  }
};
pp.readTmplToken = function() {
  var out = "", chunkStart = this.pos;
  for (; ; ) {
    if (this.pos >= this.input.length) {
      this.raise(this.start, "Unterminated template");
    }
    var ch = this.input.charCodeAt(this.pos);
    if (ch === 96 || ch === 36 && this.input.charCodeAt(this.pos + 1) === 123) {
      if (this.pos === this.start && (this.type === types$1.template || this.type === types$1.invalidTemplate)) {
        if (ch === 36) {
          this.pos += 2;
          return this.finishToken(types$1.dollarBraceL);
        } else {
          ++this.pos;
          return this.finishToken(types$1.backQuote);
        }
      }
      out += this.input.slice(chunkStart, this.pos);
      return this.finishToken(types$1.template, out);
    }
    if (ch === 92) {
      out += this.input.slice(chunkStart, this.pos);
      out += this.readEscapedChar(true);
      chunkStart = this.pos;
    } else if (isNewLine(ch)) {
      out += this.input.slice(chunkStart, this.pos);
      ++this.pos;
      switch (ch) {
        case 13:
          if (this.input.charCodeAt(this.pos) === 10) {
            ++this.pos;
          }
        case 10:
          out += "\n";
          break;
        default:
          out += String.fromCharCode(ch);
          break;
      }
      if (this.options.locations) {
        ++this.curLine;
        this.lineStart = this.pos;
      }
      chunkStart = this.pos;
    } else {
      ++this.pos;
    }
  }
};
pp.readInvalidTemplateToken = function() {
  for (; this.pos < this.input.length; this.pos++) {
    switch (this.input[this.pos]) {
      case "\\":
        ++this.pos;
        break;
      case "$":
        if (this.input[this.pos + 1] !== "{") {
          break;
        }
      case "`":
        return this.finishToken(types$1.invalidTemplate, this.input.slice(this.start, this.pos));
      case "\r":
        if (this.input[this.pos + 1] === "\n") {
          ++this.pos;
        }
      case "\n":
      case "\u2028":
      case "\u2029":
        ++this.curLine;
        this.lineStart = this.pos + 1;
        break;
    }
  }
  this.raise(this.start, "Unterminated template");
};
pp.readEscapedChar = function(inTemplate) {
  var ch = this.input.charCodeAt(++this.pos);
  ++this.pos;
  switch (ch) {
    case 110:
      return "\n";
    case 114:
      return "\r";
    case 120:
      return String.fromCharCode(this.readHexChar(2));
    case 117:
      return codePointToString(this.readCodePoint());
    case 116:
      return "	";
    case 98:
      return "\b";
    case 118:
      return "\v";
    case 102:
      return "\f";
    case 13:
      if (this.input.charCodeAt(this.pos) === 10) {
        ++this.pos;
      }
    case 10:
      if (this.options.locations) {
        this.lineStart = this.pos;
        ++this.curLine;
      }
      return "";
    case 56:
    case 57:
      if (this.strict) {
        this.invalidStringToken(
          this.pos - 1,
          "Invalid escape sequence"
        );
      }
      if (inTemplate) {
        var codePos = this.pos - 1;
        this.invalidStringToken(
          codePos,
          "Invalid escape sequence in template string"
        );
      }
    default:
      if (ch >= 48 && ch <= 55) {
        var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0];
        var octal = parseInt(octalStr, 8);
        if (octal > 255) {
          octalStr = octalStr.slice(0, -1);
          octal = parseInt(octalStr, 8);
        }
        this.pos += octalStr.length - 1;
        ch = this.input.charCodeAt(this.pos);
        if ((octalStr !== "0" || ch === 56 || ch === 57) && (this.strict || inTemplate)) {
          this.invalidStringToken(
            this.pos - 1 - octalStr.length,
            inTemplate ? "Octal literal in template string" : "Octal literal in strict mode"
          );
        }
        return String.fromCharCode(octal);
      }
      if (isNewLine(ch)) {
        if (this.options.locations) {
          this.lineStart = this.pos;
          ++this.curLine;
        }
        return "";
      }
      return String.fromCharCode(ch);
  }
};
pp.readHexChar = function(len) {
  var codePos = this.pos;
  var n = this.readInt(16, len);
  if (n === null) {
    this.invalidStringToken(codePos, "Bad character escape sequence");
  }
  return n;
};
pp.readWord1 = function() {
  this.containsEsc = false;
  var word = "", first = true, chunkStart = this.pos;
  var astral = this.options.ecmaVersion >= 6;
  while (this.pos < this.input.length) {
    var ch = this.fullCharCodeAtPos();
    if (isIdentifierChar(ch, astral)) {
      this.pos += ch <= 65535 ? 1 : 2;
    } else if (ch === 92) {
      this.containsEsc = true;
      word += this.input.slice(chunkStart, this.pos);
      var escStart = this.pos;
      if (this.input.charCodeAt(++this.pos) !== 117) {
        this.invalidStringToken(this.pos, "Expecting Unicode escape sequence \\uXXXX");
      }
      ++this.pos;
      var esc = this.readCodePoint();
      if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral)) {
        this.invalidStringToken(escStart, "Invalid Unicode escape");
      }
      word += codePointToString(esc);
      chunkStart = this.pos;
    } else {
      break;
    }
    first = false;
  }
  return word + this.input.slice(chunkStart, this.pos);
};
pp.readWord = function() {
  var word = this.readWord1();
  var type = types$1.name;
  if (this.keywords.test(word)) {
    type = keywords[word];
  }
  return this.finishToken(type, word);
};
var version = "8.18.0";
Parser.acorn = {
  Parser,
  version,
  defaultOptions,
  Position,
  SourceLocation,
  getLineInfo,
  Node,
  TokenType,
  tokTypes: types$1,
  keywordTypes: keywords,
  TokContext,
  tokContexts: types,
  isIdentifierChar,
  isIdentifierStart,
  Token,
  isNewLine,
  lineBreak,
  lineBreakG,
  nonASCIIwhitespace
};
function parseExpressionAt2(input, pos, options) {
  return Parser.parseExpressionAt(input, pos, options);
}

// protocol/runtime.ts
var forbidden = /* @__PURE__ */ new Set(["__proto__", "prototype", "constructor", "caller", "callee", "arguments", "window", "globalThis", "document", "self", "top", "parent", "Function", "eval", "fetch", "XMLHttpRequest"]);
var shadowableHostGlobals = /* @__PURE__ */ new Set(["window", "globalThis", "document", "self", "top", "parent"]);
function keyOf(value) {
  const key = String(value);
  if (forbidden.has(key))
    throw new Error(`blocked property: ${key}`);
  return key;
}
function own(obj, key) {
  if (obj == null)
    return void 0;
  if (typeof obj === "string") {
    if (key === "length")
      return obj.length;
    if (/^\d+$/.test(key))
      return obj[Number(key)];
    return void 0;
  }
  if (Array.isArray(obj)) {
    if (key === "length")
      return obj.length;
    if (/^\d+$/.test(key))
      return obj[Number(key)];
    return void 0;
  }
  if (typeof obj === "object" && Object.prototype.hasOwnProperty.call(obj, key))
    return obj[key];
  return void 0;
}
var finite = (x) => {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
};
var bounded = (s) => {
  if (s.length > limits.stringLength)
    throw new Error("string budget exceeded");
  return s;
};
var booleanFilterPredicate = Symbol("IUI filter Boolean");
var SafeEvaluator = class {
  constructor(hooks) {
    this.hooks = hooks;
  }
  steps = 0;
  parse(source) {
    if (source.length > limits.stringLength)
      throw new Error("expression source budget exceeded");
    const ast = parseExpressionAt2(source, 0, { ecmaVersion: "latest" });
    if (source.slice(ast.end).trim())
      throw new Error("unexpected expression suffix");
    return ast;
  }
  evaluate(source, env = {}) {
    this.steps = 0;
    return this.run(this.parse(source), env, 0);
  }
  execute(source, env = {}, input) {
    this.steps = 0;
    const ast = this.parse(source);
    const result = this.run(ast, env, 0);
    if (result && typeof result === "object" && "$closure" in result)
      return this.invoke(result, [input], 1);
    if (result && typeof result === "object" && "$setter" in result) {
      this.hooks?.set?.(result.$setter, input);
      return void 0;
    }
    return result;
  }
  invoke(fn, args, depth) {
    const local2 = { ...fn.env };
    fn.node.params.forEach((p, i) => {
      if (p.type !== "Identifier")
        throw new Error("only named arrow parameters");
      local2[p.name] = args[i];
    });
    return this.run(fn.node.body, local2, depth);
  }
  run(n, env, depth) {
    if (++this.steps > limits.expressionSteps || depth > limits.depth)
      throw new Error("expression budget exceeded");
    const go = (x) => this.run(x, env, depth + 1);
    switch (n.type) {
      case "Literal":
        return n.value;
      case "Identifier": {
        const local2 = Object.prototype.hasOwnProperty.call(env, n.name);
        if (forbidden.has(n.name) && (!local2 || !shadowableHostGlobals.has(n.name)))
          throw new Error(`blocked identifier: ${n.name}`);
        return local2 ? env[n.name] : void 0;
      }
      case "ArrayExpression": {
        if (n.elements.length > limits.arrayItems)
          throw new Error("array budget exceeded");
        const out = [];
        for (const e of n.elements) {
          if (!e) {
            out.push(null);
            continue;
          }
          if (e.type === "SpreadElement") {
            const v = go(e.argument);
            if (!Array.isArray(v))
              throw new Error("array spread requires array");
            out.push(...v);
          } else
            out.push(go(e));
        }
        if (out.length > limits.arrayItems)
          throw new Error("array budget exceeded");
        return out;
      }
      case "ObjectExpression": {
        const out = /* @__PURE__ */ Object.create(null);
        for (const p of n.properties) {
          if (p.type === "SpreadElement") {
            const v = go(p.argument);
            if (!v || typeof v !== "object" || Array.isArray(v))
              throw new Error("object spread requires object");
            for (const [k2, x] of Object.entries(v))
              out[keyOf(k2)] = x;
            continue;
          }
          if (p.kind !== "init" || p.method)
            throw new Error("object method forbidden");
          const k = keyOf(p.computed ? go(p.key) : p.key.name ?? p.key.value);
          out[k] = go(p.value);
        }
        return out;
      }
      case "UnaryExpression": {
        const v = go(n.argument);
        if (n.operator === "!")
          return !v;
        if (n.operator === "+")
          return +finite(v);
        if (n.operator === "-")
          return -finite(v);
        if (n.operator === "typeof")
          return typeof v;
        throw new Error("unary operator forbidden");
      }
      case "BinaryExpression": {
        const a = go(n.left), b = go(n.right);
        switch (n.operator) {
          case "+":
            return typeof a === "string" || typeof b === "string" ? bounded(String(a) + String(b)) : finite(a) + finite(b);
          case "-":
            return finite(a) - finite(b);
          case "*":
            return finite(a) * finite(b);
          case "/":
            return finite(a) / finite(b);
          case "%":
            return finite(a) % finite(b);
          case "**":
            return finite(a) ** finite(b);
          case "===":
            return a === b;
          case "!==":
            return a !== b;
          case "==":
            return a == b;
          case "!=":
            return a != b;
          case "<":
            return a < b;
          case "<=":
            return a <= b;
          case ">":
            return a > b;
          case ">=":
            return a >= b;
          default:
            throw new Error("binary operator forbidden");
        }
      }
      case "LogicalExpression": {
        const a = go(n.left);
        return n.operator === "&&" ? a ? go(n.right) : a : n.operator === "||" ? a ? a : go(n.right) : n.operator === "??" ? a ?? go(n.right) : (() => {
          throw new Error("logical operator forbidden");
        })();
      }
      case "ConditionalExpression":
        return go(n.test) ? go(n.consequent) : go(n.alternate);
      case "MemberExpression": {
        const obj = go(n.object), key = keyOf(n.computed ? go(n.property) : n.property.name);
        return own(obj, key);
      }
      case "ChainExpression":
        throw new Error("optional chaining not supported");
      case "ArrowFunctionExpression":
        return { $closure: true, node: n, env: { ...env } };
      case "TemplateLiteral": {
        let s = "";
        for (let i = 0; i < n.quasis.length; i++) {
          s += n.quasis[i].value.cooked ?? "";
          if (i < n.expressions.length)
            s += String(go(n.expressions[i]) ?? "");
        }
        if (s.length > limits.stringLength)
          throw new Error("string budget exceeded");
        return s;
      }
      case "SequenceExpression": {
        let v;
        for (const x of n.expressions)
          v = go(x);
        return v;
      }
      case "BlockStatement": {
        let v;
        for (const x of n.body) {
          if (x.type !== "ExpressionStatement")
            throw new Error("only expression statements in action");
          v = go(x.expression);
        }
        return v;
      }
      case "CallExpression": {
        const filterBoolean = n.callee.type === "MemberExpression" && !n.callee.computed && n.callee.property.name === "filter" && n.arguments.length === 1 && n.arguments[0].type === "Identifier" && n.arguments[0].name === "Boolean" && !Object.prototype.hasOwnProperty.call(env, "Boolean");
        const args = n.arguments.map((a, i) => {
          if (a.type === "SpreadElement")
            throw new Error("call spread forbidden");
          return filterBoolean && i === 0 ? booleanFilterPredicate : go(a);
        });
        if (n.callee.type === "Identifier") {
          const id = n.callee.name, v = env[id];
          if (v && typeof v === "object" && "$setter" in v) {
            if (!this.hooks?.set)
              throw new Error("setter unavailable");
            const x = args[0];
            this.hooks.set(v.$setter, x && typeof x === "object" && "$closure" in x ? this.invoke(x, [env.__currentState?.[v.$setter]], depth + 1) : x);
            return void 0;
          }
          if (id === "Number")
            return finite(args[0]);
          if (id === "String")
            return bounded(String(args[0] ?? ""));
          throw new Error(`call forbidden: ${id}`);
        }
        if (n.callee.type !== "MemberExpression")
          throw new Error("call target forbidden");
        const obj = go(n.callee.object), key = keyOf(n.callee.computed ? go(n.callee.property) : n.callee.property.name);
        if (obj && typeof obj === "object" && "$action" in obj) {
          if (key !== "call")
            throw new Error("action member forbidden");
        }
        if (n.callee.object.type === "Identifier" && n.callee.object.name === "Math") {
          const allowed = { max: Math.max, min: Math.min, round: Math.round, floor: Math.floor, ceil: Math.ceil, abs: Math.abs };
          if (!allowed[key])
            throw new Error("Math method forbidden");
          return allowed[key](...args.map(finite));
        }
        if (n.callee.object.type === "Identifier" && n.callee.object.name === "JSON") {
          if (key !== "stringify")
            throw new Error("JSON method forbidden");
          const s = JSON.stringify(args[0], null, Math.min(4, finite(args[2])));
          if (s?.length > limits.stringLength)
            throw new Error("string budget exceeded");
          return s;
        }
        if (n.callee.object.type === "Identifier" && n.callee.object.name === "GenUI") {
          if (key !== "copy" && key !== "issueNewTurn")
            throw new Error("host action forbidden");
          const payload = String(args[0] ?? "");
          if (payload.length > limits.actionLength)
            throw new Error("action length exceeded");
          this.hooks?.action?.(key, payload);
          return void 0;
        }
        if (Array.isArray(obj)) {
          if (key === "includes")
            return obj.includes(args[0]);
          if (key === "join")
            return bounded(obj.join(String(args[0] ?? ",")));
          if (key === "slice")
            return obj.slice(finite(args[0]), args[1] === void 0 ? void 0 : finite(args[1]));
          if (key === "filter" && args[0] === booleanFilterPredicate)
            return obj.slice(0, limits.arrayItems).filter(Boolean);
          if (["map", "filter", "find", "sort"].includes(key)) {
            const fn = args[0];
            if (!fn || typeof fn !== "object" || !("$closure" in fn))
              throw new Error("array callback must be arrow");
            const arr = obj.slice(0, limits.arrayItems);
            if (key === "map")
              return arr.map((x, i) => this.invoke(fn, [x, i], depth + 1));
            if (key === "filter")
              return arr.filter((x, i) => this.invoke(fn, [x, i], depth + 1));
            if (key === "find")
              return arr.find((x, i) => this.invoke(fn, [x, i], depth + 1));
            return arr.sort((a, b) => finite(this.invoke(fn, [a, b], depth + 1)));
          }
          throw new Error("array method forbidden");
        }
        if (typeof obj === "string") {
          if (key === "toString")
            return obj;
          if (key === "includes")
            return obj.includes(String(args[0]));
          throw new Error("string method forbidden");
        }
        if (typeof obj === "number") {
          if (key === "toFixed")
            return obj.toFixed(Math.min(6, Math.max(0, finite(args[0]))));
          if (key === "toLocaleString")
            return obj.toLocaleString(args[0] === void 0 ? "en-US" : String(args[0]), { maximumFractionDigits: Math.min(6, finite(args[1]?.maximumFractionDigits ?? 3)) });
          throw new Error("number method forbidden");
        }
        throw new Error("member call forbidden");
      }
      default:
        throw new Error(`syntax forbidden: ${n.type}`);
    }
  }
};
var Runtime = class {
  constructor(document2, adapter = {}) {
    this.document = document2;
    this.adapter = adapter;
  }
  state = /* @__PURE__ */ new Map();
  feedback = [];
  eventNumber = 0;
  actionIds = /* @__PURE__ */ new Set();
  setters = /* @__PURE__ */ new Map();
  setAdapter(adapter) {
    this.adapter = adapter;
  }
  note(message) {
    this.feedback.push(message);
    if (this.feedback.length > 20)
      this.feedback.shift();
  }
  update(document2) {
    if (document2.messageId !== this.document.messageId) {
      this.state.clear();
      this.actionIds.clear();
    }
    this.document = document2;
    this.setters.clear();
  }
  reset() {
    this.state.clear();
    this.feedback.length = 0;
    this.actionIds.clear();
  }
  scope() {
    const env = { Math: Object.freeze({}), JSON: Object.freeze({}), GenUI: Object.freeze({}) };
    const evaluator = new SafeEvaluator();
    this.setters.clear();
    for (const d of this.document.declarations) {
      try {
        if (d.state) {
          if (!this.state.has(d.name))
            this.state.set(d.name, evaluator.evaluate(d.expression, env));
          env[d.name] = this.state.get(d.name);
          if (d.setter) {
            this.setters.set(d.setter, d.name);
            env[d.setter] = { $setter: d.name };
          }
        } else
          env[d.name] = evaluator.evaluate(d.expression, env);
      } catch (e) {
        this.note(`${d.name}: ${String(e)}`);
      }
    }
    env.__currentState = Object.fromEntries(this.state);
    return env;
  }
  value(source, env = this.scope()) {
    return new SafeEvaluator().evaluate(source, env);
  }
  async event(source, input, env = this.scope()) {
    const eventId = ++this.eventNumber, actions = [];
    const evaluator = new SafeEvaluator({ set: (name, value) => {
      this.state.set(name, value);
      env[name] = value;
      env.__currentState[name] = value;
    }, action: (kind, payload) => actions.push({ kind, payload, id: `${this.document.messageId}:${eventId}:${actions.length}`, messageId: this.document.messageId }) });
    try {
      evaluator.execute(source, env, input);
    } catch (e) {
      this.note(`\u4E8B\u4EF6\u9519\u8BEF: ${String(e)}`);
      return;
    }
    for (const action of actions) {
      if (this.actionIds.has(action.id))
        continue;
      this.actionIds.add(action.id);
      if (!this.adapter.requestAction) {
        this.note(`${action.kind}: \u5BBF\u4E3B\u672A\u914D\u7F6E`);
        continue;
      }
      try {
        const result = await this.adapter.requestAction(action);
        this.note(result.message || `${action.kind}: ${result.ok ? "\u5DF2\u6267\u884C" : "\u672A\u6267\u884C"}`);
      } catch (e) {
        this.note(`${action.kind}: ${String(e)}`);
      }
    }
  }
};

// protocol/schema.ts
var documentSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://example.invalid/iui/0.1/document.schema.json",
  title: "Intelligent UI Protocol v0.1",
  type: "object",
  required: ["protocol", "messageId", "declarations", "children", "diagnostics", "complete"],
  additionalProperties: false,
  properties: {
    protocol: { const: "iui/0.1" },
    messageId: { type: "string", minLength: 1 },
    declarations: { type: "array", items: { type: "object", required: ["name", "expression", "state", "span"], properties: { name: { type: "string" }, setter: { type: "string" }, expression: { type: "string" }, state: { type: "boolean" }, span: { $ref: "#/$defs/span" } } } },
    children: { type: "array", items: { $ref: "#/$defs/node" } },
    diagnostics: { type: "array" },
    complete: { type: "boolean" }
  },
  $defs: {
    span: { type: "object", required: ["start", "end"], properties: { start: { type: "integer", minimum: 0 }, end: { type: "integer", minimum: 0 } } },
    node: { oneOf: [
      { type: "object", required: ["kind", "text", "span"], properties: { kind: { const: "text" }, text: { type: "string" }, span: { $ref: "#/$defs/span" } } },
      { type: "object", required: ["kind", "source", "span"], properties: { kind: { const: "expression" }, source: { type: "string" }, span: { $ref: "#/$defs/span" } } },
      { type: "object", required: ["kind", "name", "attributes", "children", "span"], properties: { kind: { const: "element" }, name: { type: "string", enum: [...componentNames] }, attributes: { type: "object" }, children: { type: "array", items: { $ref: "#/$defs/node" } }, rawContent: { type: "string", maxLength: 32e3 }, span: { $ref: "#/$defs/span" } } },
      { type: "object", required: ["kind", "test", "children", "span"], properties: { kind: { const: "if" }, test: { type: "string" }, children: { type: "array", items: { $ref: "#/$defs/node" } }, span: { $ref: "#/$defs/span" } } },
      { type: "object", required: ["kind", "source", "item", "children", "span"], properties: { kind: { const: "each" }, source: { type: "string" }, item: { type: "string" }, index: { type: "string" }, children: { type: "array", items: { $ref: "#/$defs/node" } }, span: { $ref: "#/$defs/span" } } }
    ] }
  }
};

// ui/renderer/Renderer.tsx
var import_react7 = __toESM(require("react"), 1);
var import_react_dom = require("react-dom");

// ui/theme/index.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var systemFont = 'ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif';
var serifFont = "Iowan Old Style,Georgia,serif";
var themes = {
  studio: {
    light: { background: "#fcfcfc", surface: "#ffffff", surfaceMuted: "#f7f7f7", surfaceTertiary: "#eeeeee", text: "#0d0d0d", textMuted: "#5d5d5d", border: "#e5e5e5", primary: "#181818", success: "#008635", warning: "#a36a0a", danger: "#b42332", info: "#315dcc", fontFamily: systemFont, radius: 16, spacing: 4, shadow: "soft", chart: ["#6c83df", "#18a281", "#e9a53e", "#a87ad8"] },
    dark: { background: "#181818", surface: "#222222", surfaceMuted: "#2b2b2b", surfaceTertiary: "#353535", text: "#f5f5f5", textMuted: "#b4b4b4", border: "#404040", primary: "#f5f5f5", success: "#6cdb93", warning: "#f0bd67", danger: "#ff8995", info: "#9eb8ff", fontFamily: systemFont, radius: 16, spacing: 4, shadow: "soft", chart: ["#93a8ff", "#61d1af", "#f1c073", "#c8a4ee"] }
  },
  citrus: {
    light: { background: "#f4f0df", surface: "#fffcef", surfaceMuted: "#f5ecd0", surfaceTertiary: "#e7debc", text: "#243b2d", textMuted: "#69765c", border: "#b9c69b", primary: "#256d4b", success: "#287e54", warning: "#aa6427", danger: "#aa4c3c", info: "#4267a3", fontFamily: serifFont, radius: 4, spacing: 8, shadow: "lift", chart: ["#256d4b", "#d78e36", "#677db1", "#b66274"] },
    dark: { background: "#17231b", surface: "#213529", surfaceMuted: "#2d4131", surfaceTertiary: "#3a5139", text: "#f7f0d9", textMuted: "#bfccb3", border: "#658367", primary: "#a8d78a", success: "#91d4a2", warning: "#edbd6e", danger: "#e89378", info: "#9bb6e5", fontFamily: serifFont, radius: 4, spacing: 8, shadow: "lift", chart: ["#a8d78a", "#edbd6e", "#9bb6e5", "#e6a4ab"] }
  }
};
var color = /^#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?$/;
function mergeTheme(name, mode, overrides = {}) {
  const base = themes[name][mode], out = { ...base, chart: [...base.chart] };
  for (const [key, value] of Object.entries(overrides)) {
    if (key === "chart") {
      if (Array.isArray(value) && value.length === 4 && value.every((v) => typeof v === "string" && color.test(v)))
        out.chart = value;
      continue;
    }
    if (key === "radius" || key === "spacing") {
      if (typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 32)
        out[key] = value;
      continue;
    }
    if (key === "fontFamily") {
      if (value === systemFont || value === serifFont)
        out[key] = value;
      continue;
    }
    if (key === "shadow") {
      if (value === "none" || value === "soft" || value === "lift")
        out.shadow = value;
      continue;
    }
    if (Object.prototype.hasOwnProperty.call(base, key) && typeof value === "string" && color.test(value))
      out[key] = value;
  }
  return out;
}
var ThemeContext = (0, import_react.createContext)(themes.studio.light);
function ThemeProvider({ name = "studio", mode = "light", overrides = {}, children }) {
  const t = mergeTheme(name, mode, overrides);
  const vars = {
    "--iui-background": t.background,
    "--iui-surface": t.surface,
    "--iui-surface-muted": t.surfaceMuted,
    "--iui-surface-tertiary": t.surfaceTertiary,
    "--iui-text": t.text,
    "--iui-text-muted": t.textMuted,
    "--iui-border": t.border,
    "--iui-primary": t.primary,
    "--iui-success": t.success,
    "--iui-warning": t.warning,
    "--iui-danger": t.danger,
    "--iui-info": t.info,
    "--iui-font": t.fontFamily,
    "--iui-radius": `${t.radius}px`,
    "--iui-spacing": `${t.spacing}px`,
    "--iui-shadow": t.shadow === "none" ? "none" : t.shadow === "lift" ? "0 13px 0 #0000001a" : "0 3px 12px #0000000d",
    ...Object.fromEntries(t.chart.map((c, i) => [`--iui-chart-${i + 1}`, c]))
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeContext.Provider, { value: t, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "iui-theme", style: { ...vars, colorScheme: mode }, children }) });
}

// ui/components/text/text/Text.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function Text({ children, style }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "iui-text", style, children });
}

// ui/components/text/title/Title.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
function Title({ children, style }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h3", { className: "iui-title", style, children });
}

// ui/components/text/caption/Caption.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
function Caption({ children, style }) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("small", { className: "iui-caption", style, children });
}

// ui/components/text/badge/Badge.tsx
var import_jsx_runtime5 = require("react/jsx-runtime");
function Badge({ children, style }) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "iui-badge", style, children });
}

// ui/components/text/code/Code.tsx
var import_jsx_runtime6 = require("react/jsx-runtime");
function Code({ children, style }) {
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("pre", { className: "iui-code", style, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("code", { children }) });
}

// ui/components/text/math-text/MathText.tsx
var import_jsx_runtime7 = require("react/jsx-runtime");
function MathText({ children, style }) {
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "iui-math", style, children });
}

// ui/components/text/label/Label.tsx
var import_jsx_runtime8 = require("react/jsx-runtime");
function Label({ children, style }) {
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "iui-label", style, children });
}

// ui/components/text/bold/Bold.tsx
var import_jsx_runtime9 = require("react/jsx-runtime");
function Bold({ children, style }) {
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("strong", { style, children });
}

// ui/components/text/italic/Italic.tsx
var import_jsx_runtime10 = require("react/jsx-runtime");
function Italic({ children, style }) {
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("em", { style, children });
}

// ui/components/text/underline/Underline.tsx
var import_jsx_runtime11 = require("react/jsx-runtime");
function Underline({ children, style }) {
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("u", { style, children });
}

// ui/components/text/strikethrough/Strikethrough.tsx
var import_jsx_runtime12 = require("react/jsx-runtime");
function Strikethrough({ children, style }) {
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("s", { style, children });
}

// ui/components/text/blockquote/Blockquote.tsx
var import_jsx_runtime13 = require("react/jsx-runtime");
function Blockquote({ children, style }) {
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("blockquote", { style, children });
}

// ui/components/text/code-block/CodeBlock.tsx
var import_jsx_runtime14 = require("react/jsx-runtime");
function CodeBlock({ children, style }) {
  return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("pre", { className: "iui-code", style, children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("code", { children }) });
}

// ui/components/text/icon/Icon.tsx
var import_jsx_runtime15 = require("react/jsx-runtime");
var glyphs = { check: "\u2713", "check-circle": "\u2713", "alert-triangle": "\u26A0", settings: "\u2699", github: "\u25C6", sparkles: "\u2726", copy: "\u29C9", info: "\u24D8", cpu: "\u25A3", layers: "\u25A4", "arrow-right": "\u2192", "chevron-right": "\u203A", "arrow-down": "\u2193", "arrow-down-up": "\u2195", "chart-no-axes-combined": "\u25A5", "shield-check": "\u2B21" };
function Icon({ name, style, inline = false }) {
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "iui-icon", style: { ...style, display: inline ? "inline-flex" : void 0 }, "aria-label": name, children: glyphs[name] ?? "\u2022" });
}

// ui/components/layout/box/Box.tsx
var import_jsx_runtime16 = require("react/jsx-runtime");
function Box({ children, style }) {
  return /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("div", { className: "iui-box", style, children });
}

// ui/components/layout/row/Row.tsx
var import_jsx_runtime17 = require("react/jsx-runtime");
function Row({ children, style }) {
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "iui-row", style, children });
}

// ui/components/layout/column/Column.tsx
var import_jsx_runtime18 = require("react/jsx-runtime");
function Column({ children, style }) {
  return /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "iui-col", style, children });
}

// ui/components/layout/flow/Flow.tsx
var import_jsx_runtime19 = require("react/jsx-runtime");
function Flow({ children, style }) {
  return /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "iui-flow", style, children });
}

// ui/components/layout/card/Card.tsx
var import_jsx_runtime20 = require("react/jsx-runtime");
function Card({ children, style }) {
  return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("section", { className: "iui-card", style, children });
}

// ui/components/layout/grid/Grid.tsx
var import_jsx_runtime21 = require("react/jsx-runtime");
function Grid({ children, style, columns = 2 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("div", { className: "iui-grid", style: { ...style, gridTemplateColumns: `repeat(${Math.max(1, Math.min(6, columns))},minmax(0,1fr))` }, children });
}

// ui/components/layout/grid-item/GridItem.tsx
var import_jsx_runtime22 = require("react/jsx-runtime");
function GridItem({ children, style }) {
  return /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("div", { className: "iui-grid-item", style, children });
}

// ui/components/layout/flow-item/FlowItem.tsx
var import_jsx_runtime23 = require("react/jsx-runtime");
function FlowItem({ children, style }) {
  return /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("div", { className: "iui-flow-item", style, children });
}

// ui/components/layout/carousel-item/CarouselItem.tsx
var import_jsx_runtime24 = require("react/jsx-runtime");
function CarouselItem({ children, style }) {
  return /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("div", { className: "iui-carousel-item", style, children });
}

// ui/components/layout/divider/Divider.tsx
var import_jsx_runtime25 = require("react/jsx-runtime");
function Divider({ style }) {
  return /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("hr", { className: "iui-divider", style });
}

// ui/components/layout/spacer/Spacer.tsx
var import_jsx_runtime26 = require("react/jsx-runtime");
function Spacer({ style }) {
  return /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("span", { className: "iui-spacer", style: { flex: 1, minWidth: 8, ...style } });
}

// ui/components/layout/table/Table.tsx
var import_jsx_runtime27 = require("react/jsx-runtime");
function Table({ children, style }) {
  return /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("div", { role: "table", className: "iui-table", style, children });
}

// ui/components/layout/table-row/TableRow.tsx
var import_jsx_runtime28 = require("react/jsx-runtime");
function TableRow({ children, style }) {
  return /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("div", { role: "row", className: "iui-table-row", style, children });
}

// ui/components/layout/table-cell/TableCell.tsx
var import_jsx_runtime29 = require("react/jsx-runtime");
function TableCell({ children, style }) {
  return /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("div", { role: "cell", className: "iui-table-cell", style, children });
}

// ui/components/layout/list/List.tsx
var import_jsx_runtime30 = require("react/jsx-runtime");
function List({ children, style, marker }) {
  const listStyle = { ...style, listStyleType: marker === "none" ? "none" : marker === "disc" ? "disc" : void 0 };
  return marker === "disc" ? /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("ul", { className: "iui-list", style: listStyle, children }) : /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("ol", { className: "iui-list", style: listStyle, children });
}

// ui/components/layout/list-item/ListItem.tsx
var import_jsx_runtime31 = require("react/jsx-runtime");
function ListItem({ children, style }) {
  return /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("li", { style, children });
}

// ui/components/layout/popover/Popover.tsx
var import_jsx_runtime32 = require("react/jsx-runtime");
function Popover({ children, style }) {
  return /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("details", { className: "iui-popover", style, children });
}

// ui/components/layout/popover-trigger/PopoverTrigger.tsx
var import_jsx_runtime33 = require("react/jsx-runtime");
function PopoverTrigger({ children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("summary", { children });
}

// ui/components/layout/popover-content/PopoverContent.tsx
var import_jsx_runtime34 = require("react/jsx-runtime");
function PopoverContent({ children, style }) {
  return /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("div", { className: "iui-popover-content", style, children });
}

// ui/components/layout/carousel/Carousel.tsx
var import_react2 = __toESM(require("react"), 1);
var import_jsx_runtime35 = require("react/jsx-runtime");
function Carousel({ children, activeIndex = 0, onChange, style }) {
  const items = import_react2.default.Children.toArray(children), index = Math.max(0, Math.min(items.length - 1, Math.trunc(activeIndex)));
  return /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)("div", { className: "iui-carousel", style, children: [
    /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("button", { type: "button", "aria-label": "\u4E0A\u4E00\u9879", disabled: index <= 0, onClick: () => onChange?.(index - 1), children: "\u2039" }),
    /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("div", { children: items[index] }),
    /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("button", { type: "button", "aria-label": "\u4E0B\u4E00\u9879", disabled: index >= items.length - 1, onClick: () => onChange?.(index + 1), children: "\u203A" })
  ] });
}

// ui/components/interaction/button/Button.tsx
var import_jsx_runtime36 = require("react/jsx-runtime");
function Button({ children, style, onClick, disabled = false, variant, block = false }) {
  return /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("button", { type: "button", className: `iui-button${variant === "ghost" || variant === "outline" ? ` iui-${variant}` : ""}`, style: { ...style, width: block ? "100%" : style?.width }, onClick, disabled, children });
}

// ui/components/interaction/pressable/Pressable.tsx
var import_jsx_runtime37 = require("react/jsx-runtime");
function Pressable({ children, style, onClick, disabled = false }) {
  return /* @__PURE__ */ (0, import_jsx_runtime37.jsx)("button", { type: "button", className: "iui-pressable", style, onClick, disabled, children });
}

// ui/components/interaction/input/Input.tsx
var import_jsx_runtime38 = require("react/jsx-runtime");
function Input({ value, onChange, placeholder = "", style, disabled = false, number = false, block = false }) {
  return /* @__PURE__ */ (0, import_jsx_runtime38.jsx)("input", { className: "iui-field", type: number ? "number" : "text", value, onChange: (e) => onChange?.(e.target.value), placeholder, style: { ...style, width: block ? "100%" : style?.width }, disabled });
}

// ui/components/interaction/textarea/Textarea.tsx
var import_jsx_runtime39 = require("react/jsx-runtime");
function Textarea({ value, onChange, placeholder = "", style, disabled = false, rows = 3, block = false }) {
  return /* @__PURE__ */ (0, import_jsx_runtime39.jsx)("textarea", { className: "iui-field", value, onChange: (e) => onChange?.(e.target.value), placeholder, rows: Math.max(1, Math.min(12, rows)), style: { ...style, width: block ? "100%" : style?.width }, disabled });
}

// ui/components/interaction/select/Select.tsx
var import_jsx_runtime40 = require("react/jsx-runtime");
function Select({ value, onChange, options = [], style, disabled = false, block = false }) {
  return /* @__PURE__ */ (0, import_jsx_runtime40.jsx)("select", { className: "iui-field", value, onChange: (e) => onChange?.(e.target.value), style: { ...style, width: block ? "100%" : style?.width }, disabled, children: options.map((o, i) => /* @__PURE__ */ (0, import_jsx_runtime40.jsx)("option", { value: o.value, children: o.label }, `${o.value}-${i}`)) });
}

// ui/components/interaction/checkbox/Checkbox.tsx
var import_jsx_runtime41 = require("react/jsx-runtime");
function Checkbox({ children, checked, onChange, disabled = false, lineThrough = false, style }) {
  return /* @__PURE__ */ (0, import_jsx_runtime41.jsxs)("label", { className: "iui-check", style, children: [
    /* @__PURE__ */ (0, import_jsx_runtime41.jsx)("input", { type: "checkbox", checked, onChange: (e) => onChange?.(e.target.checked), disabled }),
    /* @__PURE__ */ (0, import_jsx_runtime41.jsx)("span", { style: { textDecoration: checked && lineThrough ? "line-through" : void 0 }, children })
  ] });
}

// ui/components/interaction/shared.tsx
var import_react3 = require("react");
var RadioContext = (0, import_react3.createContext)({ value: void 0 });

// ui/components/interaction/radio-group/RadioGroup.tsx
var import_jsx_runtime42 = require("react/jsx-runtime");
function RadioGroup({ children, value, onChange, direction = "row", style }) {
  return /* @__PURE__ */ (0, import_jsx_runtime42.jsx)(RadioContext.Provider, { value: { value, onChange }, children: /* @__PURE__ */ (0, import_jsx_runtime42.jsx)("div", { className: `iui-radio-group${direction === "col" ? " vertical" : ""}`, style, children }) });
}

// ui/components/interaction/radio/Radio.tsx
var import_react4 = require("react");
var import_jsx_runtime43 = require("react/jsx-runtime");
function Radio({ children, value, disabled = false, style }) {
  const group = (0, import_react4.useContext)(RadioContext);
  return /* @__PURE__ */ (0, import_jsx_runtime43.jsxs)("label", { className: "iui-check", style, children: [
    /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("input", { type: "radio", checked: group.value === value, onChange: () => group.onChange?.(value), disabled }),
    /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("span", { children })
  ] });
}

// ui/components/interaction/slider/Slider.tsx
var import_jsx_runtime44 = require("react/jsx-runtime");
function Slider({ value, onChange, min = 0, max = 100, step = 1, disabled = false, style }) {
  return /* @__PURE__ */ (0, import_jsx_runtime44.jsx)("input", { className: "iui-slider", type: "range", min, max, step, value, onChange: (e) => onChange?.(Number(e.target.value)), disabled, style });
}

// ui/components/interaction/date-picker/DatePicker.tsx
var import_jsx_runtime45 = require("react/jsx-runtime");
function DatePicker({ value, onChange, disabled = false, style, block = false }) {
  return /* @__PURE__ */ (0, import_jsx_runtime45.jsx)("input", { className: "iui-field", type: "date", value, onChange: (e) => onChange?.(e.target.value), disabled, style: { ...style, width: block ? "100%" : style?.width } });
}

// ui/components/interaction/segmented-control/SegmentedControl.tsx
var import_jsx_runtime46 = require("react/jsx-runtime");
function SegmentedControl({ value, onChange, options = [], disabled = false, style, block = false }) {
  return /* @__PURE__ */ (0, import_jsx_runtime46.jsx)("div", { className: "iui-segments", style: { ...style, width: block ? "100%" : style?.width }, children: options.map((o, i) => /* @__PURE__ */ (0, import_jsx_runtime46.jsx)("button", { type: "button", className: value === o.value ? "active" : "", onClick: () => onChange?.(o.value), disabled, children: o.label }, `${o.value}-${i}`)) });
}

// ui/components/visualization/chart/Chart.tsx
var import_jsx_runtime47 = require("react/jsx-runtime");
var colors = ["var(--iui-chart-1)", "var(--iui-chart-2)", "var(--iui-chart-3)", "var(--iui-chart-4)"];
var num = (x) => {
  const v = Number(x);
  return Number.isFinite(v) ? v : 0;
};
function Chart({ content }) {
  const c = content;
  if (!c || !Array.isArray(c.data) || !["line", "bar", "scatter", "pie"].includes(c.chartType))
    return /* @__PURE__ */ (0, import_jsx_runtime47.jsx)("div", { className: "iui-unavailable", children: "\u56FE\u8868\u914D\u7F6E\u65E0\u6548" });
  const data2 = c.data.slice(0, 100), series = (c.series || []).slice(0, 4);
  if (!data2.length)
    return /* @__PURE__ */ (0, import_jsx_runtime47.jsx)("div", { className: "iui-unavailable", children: "\u56FE\u8868\u65E0\u6570\u636E" });
  const width = 600, height = 240, left = 42, right = 18, top = 16, bottom = 40, iw = width - left - right, ih = height - top - bottom;
  if (c.chartType === "pie") {
    const key = c.valueKey || series[0]?.dataKey || "value", vals = data2.map((d) => Math.max(0, num(d[key]))), sum = vals.reduce((a, b) => a + b, 0);
    if (!sum)
      return /* @__PURE__ */ (0, import_jsx_runtime47.jsx)("div", { className: "iui-unavailable", children: "\u997C\u56FE\u6570\u503C\u65E0\u6548" });
    let angle = -Math.PI / 2;
    const paths = vals.map((v, i) => {
      const a = angle, b = angle + v / sum * Math.PI * 2;
      angle = b;
      const x1 = 300 + Math.cos(a) * 90, y1 = 112 + Math.sin(a) * 90, x2 = 300 + Math.cos(b) * 90, y2 = 112 + Math.sin(b) * 90;
      return /* @__PURE__ */ (0, import_jsx_runtime47.jsx)("path", { d: v === sum ? `M 300 22 A 90 90 0 1 1 299.99 22 Z` : `M 300 112 L ${x1} ${y1} A 90 90 0 ${b - a > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z`, fill: colors[i % colors.length] }, i);
    });
    return /* @__PURE__ */ (0, import_jsx_runtime47.jsxs)("div", { className: "iui-chart", children: [
      /* @__PURE__ */ (0, import_jsx_runtime47.jsx)("svg", { viewBox: "0 0 600 230", role: "img", "aria-label": "\u997C\u56FE", children: paths }),
      /* @__PURE__ */ (0, import_jsx_runtime47.jsx)("div", { className: "iui-legend", children: data2.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime47.jsxs)("span", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime47.jsx)("i", { style: { background: colors[i % colors.length] } }),
        String(d[c.nameKey || "name"] ?? i),
        ": ",
        vals[i]
      ] }, i)) })
    ] });
  }
  const ys = series.flatMap((s) => data2.map((d) => num(d[s.dataKey]))), min = typeof c.yAxisMin === "number" ? c.yAxisMin : Math.min(0, ...ys), max = typeof c.yAxisMax === "number" ? c.yAxisMax : Math.max(1, ...ys), range = Math.max(1, max - min);
  const y = (v) => top + ih - (v - min) / range * ih, x = (i) => left + (data2.length === 1 ? iw / 2 : i * iw / (data2.length - 1));
  const suffix = series.length && series.every((s) => s.valueSuffix === series[0].valueSuffix) ? series[0].valueSuffix || "" : "";
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime47.jsxs)("g", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime47.jsx)("line", { x1: left, y1: top + ih * (1 - f), x2: width - right, y2: top + ih * (1 - f), stroke: "var(--iui-border)" }),
    /* @__PURE__ */ (0, import_jsx_runtime47.jsxs)("text", { x: left - 7, y: top + ih * (1 - f) + 4, textAnchor: "end", fontSize: "11", fill: "var(--iui-text-muted)", children: [
      Math.round(min + range * f),
      suffix
    ] })
  ] }, i));
  const marks = series.map((s, si) => {
    const color2 = colors[si % colors.length];
    if (c.chartType === "bar")
      return data2.map((d, i) => {
        const bw = iw / data2.length / Math.max(1, series.length + 0.5), xx = left + i * iw / data2.length + si * bw + bw * 0.2, yy = y(num(d[s.dataKey]));
        return /* @__PURE__ */ (0, import_jsx_runtime47.jsx)("rect", { x: xx, y: Math.min(yy, y(0)), width: bw * 0.84, height: Math.abs(y(0) - yy), rx: "3", fill: color2 }, `${si}-${i}`);
      });
    if (c.chartType === "scatter")
      return data2.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime47.jsx)("circle", { cx: left + (num(d[c.xKey || "x"]) - Math.min(...data2.map((z) => num(z[c.xKey || "x"])))) / (Math.max(...data2.map((z) => num(z[c.xKey || "x"]))) - Math.min(...data2.map((z) => num(z[c.xKey || "x"]))) || 1) * iw, cy: y(num(d[s.dataKey])), r: "5", fill: color2 }, `${si}-${i}`));
    return /* @__PURE__ */ (0, import_jsx_runtime47.jsxs)("g", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime47.jsx)("polyline", { points: data2.map((d, i) => `${x(i)},${y(num(d[s.dataKey]))}`).join(" "), fill: "none", stroke: color2, strokeWidth: "3", strokeLinejoin: "round" }),
      data2.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime47.jsx)("circle", { cx: x(i), cy: y(num(d[s.dataKey])), r: "4", fill: color2 }, i))
    ] }, si);
  });
  return /* @__PURE__ */ (0, import_jsx_runtime47.jsxs)("div", { className: "iui-chart", children: [
    /* @__PURE__ */ (0, import_jsx_runtime47.jsxs)("svg", { viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": `${c.chartType} \u56FE\u8868`, children: [
      ticks,
      marks,
      data2.map((d, i) => ({ d, i })).filter(({ i }) => i % Math.max(1, Math.ceil(data2.length / 8)) === 0).map(({ d, i }) => /* @__PURE__ */ (0, import_jsx_runtime47.jsx)("text", { x: c.chartType === "bar" ? left + (i + 0.5) * iw / data2.length : x(i), y: height - 10, textAnchor: "middle", fontSize: "11", fill: "var(--iui-text-muted)", children: String(d[c.xKey || "x"] ?? "").slice(0, 12) }, i))
    ] }),
    c.xAxisLabel ? /* @__PURE__ */ (0, import_jsx_runtime47.jsx)("div", { className: "iui-axis-label", children: c.xAxisLabel }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime47.jsx)("div", { className: "iui-legend", children: series.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime47.jsxs)("span", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime47.jsx)("i", { style: { background: colors[i % colors.length] } }),
      s.label || s.dataKey,
      s.valueSuffix ? ` (${s.valueSuffix})` : ""
    ] }, i)) })
  ] });
}

// ui/components/media/unconfigured-host/UnconfiguredHost.tsx
var import_jsx_runtime48 = require("react/jsx-runtime");
function UnconfiguredHost({ name }) {
  return /* @__PURE__ */ (0, import_jsx_runtime48.jsxs)("div", { className: "iui-unavailable", "data-component": name, children: [
    /* @__PURE__ */ (0, import_jsx_runtime48.jsx)("strong", { children: name }),
    " \xB7 \u5BBF\u4E3B\u672A\u914D\u7F6E\u3002\u9700\u7531\u5BBF\u4E3B\u63D0\u4F9B\u53EF\u4FE1\u8D44\u6E90\u6216\u6388\u6743\u64CD\u4F5C\u3002"
  ] });
}

// ui/components/media/unsupported-component/UnsupportedComponent.tsx
var import_jsx_runtime49 = require("react/jsx-runtime");
function UnsupportedComponent({ name }) {
  return /* @__PURE__ */ (0, import_jsx_runtime49.jsxs)("div", { className: "iui-unavailable", children: [
    name,
    " \xB7 v0.1 \u672A\u652F\u6301"
  ] });
}

// ui/components/media/app-block/AppBlock.tsx
var import_react5 = require("react");

// ui/components/media/app-block/sandbox.ts
var appBlockCsp = "default-src 'none'; base-uri 'none'; form-action 'none'; connect-src 'none'; img-src data:; script-src 'unsafe-inline'; style-src 'unsafe-inline'; font-src 'none'; media-src 'none'; object-src 'none'; frame-src 'none'; worker-src 'none'; manifest-src 'none'";
var sampleStyles = `
:root{--viz-border:#344357;--viz-card:#1e2a3b;--viz-panel:#243247;--viz-accent-bg:#394b75;--viz-accent:#8b8cf5;--viz-text:#eef3fa;--viz-muted:#a8b7ca}
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:#111b2a;color:#eef3fa;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
button{font:inherit;color:inherit;cursor:pointer}#tetris-root{display:flex;flex-direction:column;align-items:center;gap:12px;padding:10px;width:100%;font-size:14px}
.flex{display:flex}.flex-col{flex-direction:column}.items-center{align-items:center}.justify-between{justify-content:space-between}.justify-center{justify-content:center}.items-start{align-items:flex-start}.flex-1{flex:1}.min-w-0{min-width:0}.w-full{width:100%}
.relative{position:relative}.absolute{position:absolute}.inset-0{inset:0}.grid{display:grid}.grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}.col-span-4{grid-column:span 4}
.gap-2{gap:8px}.gap-3{gap:12px}.p-2{padding:8px}.px-5{padding-left:20px;padding-right:20px}.py-2{padding-top:8px;padding-bottom:8px}.rounded-lg{border-radius:8px}
.font-bold{font-weight:700}.font-semibold{font-weight:600}.text-xs{font-size:12px}.text-sm{font-size:14px}.text-base{font-size:16px}.text-lg{font-size:18px}.text-xl{font-size:22px}.text-center{text-align:center}.tabular-nums{font-variant-numeric:tabular-nums}.mb-1{margin-bottom:4px}
.max-w-\\[390px\\]{max-width:390px}#tetris-root .game-area{max-width:390px}#tetris-root .game-area>div:last-child{min-width:92px}#tetris-root [data-move]{user-select:none;-webkit-user-select:none}
@media(max-width:375px){#tetris-root .game-area{gap:8px}#tetris-root .game-area>div:last-child{min-width:78px}#tetris-root .stat{padding:5px}}
`;
function validApprovedAppHtml(html) {
  return new TextEncoder().encode(html).length <= 32e3 && !/<\s*(?:iframe|object|embed|link|base|form)\b/i.test(html) && !/<script\b[^>]*\bsrc\s*=/i.test(html) && !/\b(?:src|href)\s*=\s*["']?\s*(?:https?:|\/\/|javascript:)/i.test(html);
}
function isolatedAppDocument(approvedHtml) {
  if (!validApprovedAppHtml(approvedHtml))
    throw new Error("AppBlock \u5BBF\u4E3B\u5185\u5BB9\u672A\u901A\u8FC7\u9759\u6001\u9650\u5236");
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${appBlockCsp}"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${sampleStyles}</style></head><body>${approvedHtml}</body></html>`;
}

// ui/components/media/app-block/AppBlock.tsx
var import_jsx_runtime50 = require("react/jsx-runtime");
function AppBlock({ request, adapter }) {
  const sourceKey = `${request.messageId}\0${request.id}\0${request.html}`;
  const latest = (0, import_react5.useRef)(sourceKey);
  latest.current = sourceKey;
  const attempt = (0, import_react5.useRef)(0);
  const [session, setSession] = (0, import_react5.useState)(null);
  const [status, setStatus] = (0, import_react5.useState)("\u7B49\u5F85\u660E\u786E\u70B9\u51FB\u8FD0\u884C");
  const runLabel = request.id === "tetris-game-2026" ? "\u8FD0\u884C\u4FC4\u7F57\u65AF\u65B9\u5757" : request.id === "paint-demo-01" ? "\u8FD0\u884C\u4EA4\u4E92\u5F0F\u753B\u677F" : "\u8FD0\u884C\u5DF2\u5BA1\u9605\u5185\u5BB9";
  const live = session?.sourceKey === sourceKey ? session : null;
  const run = async () => {
    const current2 = ++attempt.current;
    if (!adapter.authorizeAppBlock) {
      setStatus("\u5BBF\u4E3B\u672A\u914D\u7F6E\uFF1A\u6CA1\u6709\u53EF\u8FD0\u884C\u7684 AppBlock \u5BA1\u9605\u5668");
      return;
    }
    setStatus("\u6B63\u5728\u6838\u5BF9\u5DF2\u5BA1\u9605\u6837\u672C\u2026");
    try {
      const result = await adapter.authorizeAppBlock(request);
      if (current2 !== attempt.current || latest.current !== sourceKey)
        return;
      if (!result.ok || !result.html) {
        setSession(null);
        setStatus(result.message || "\u5F53\u524D\u5185\u5BB9\u672A\u7ECF\u5BA1\u9605\uFF0C\u4E0D\u80FD\u8FD0\u884C");
        return;
      }
      const document2 = isolatedAppDocument(result.html);
      setSession({ sourceKey, document: document2, sequence: (session?.sequence ?? 0) + 1 });
      setStatus("\u9694\u79BB\u8FD0\u884C\u4E2D \xB7 \u7F51\u7EDC\u3001\u7236\u9875\u9762\u4E0E\u8D26\u53F7\u4E0D\u53EF\u8BBF\u95EE");
    } catch (error) {
      if (current2 === attempt.current) {
        setSession(null);
        setStatus(`\u8FD0\u884C\u5931\u8D25\uFF1A${String(error)}`);
      }
    }
  };
  const stop = () => {
    attempt.current++;
    setSession(null);
    setStatus("\u5DF2\u505C\u6B62\uFF1Biframe \u5DF2\u9500\u6BC1");
  };
  const restart = () => {
    if (!live)
      return;
    attempt.current++;
    setSession({ ...live, sequence: live.sequence + 1 });
    setStatus("\u5DF2\u91CD\u542F\u9694\u79BB\u5B9E\u4F8B");
  };
  return /* @__PURE__ */ (0, import_jsx_runtime50.jsxs)("section", { className: `iui-app-block ${request.id === "paint-demo-01" ? "is-paint" : ""}`, "aria-label": `AppBlock ${request.title || request.id}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime50.jsxs)("div", { className: "iui-app-block-head", children: [
      /* @__PURE__ */ (0, import_jsx_runtime50.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime50.jsx)("strong", { children: request.title || "AppBlock" }),
        /* @__PURE__ */ (0, import_jsx_runtime50.jsx)("small", { children: "\u672C\u5730\u53D7\u9650\u5BBF\u4E3B\u6F14\u793A \xB7 \u9700\u624B\u52A8\u8FD0\u884C" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime50.jsxs)("div", { className: "iui-app-block-actions", children: [
        /* @__PURE__ */ (0, import_jsx_runtime50.jsx)("button", { type: "button", onClick: () => void run(), disabled: !request.html, children: live ? "\u91CD\u65B0\u6838\u5BF9\u5E76\u8FD0\u884C" : runLabel }),
        /* @__PURE__ */ (0, import_jsx_runtime50.jsx)("button", { type: "button", onClick: stop, disabled: !live, children: "\u505C\u6B62" }),
        /* @__PURE__ */ (0, import_jsx_runtime50.jsx)("button", { type: "button", onClick: restart, disabled: !live, children: "\u91CD\u542F" })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime50.jsxs)("p", { className: "iui-app-block-status", role: "status", children: [
      live ? "\u25CF " : "",
      live ? status : session ? "\u5185\u5BB9\u5DF2\u53D8\u5316\uFF0C\u539F\u5B9E\u4F8B\u5DF2\u9694\u79BB\u505C\u6B62" : status
    ] }),
    live ? /* @__PURE__ */ (0, import_jsx_runtime50.jsx)("iframe", { title: `${request.title || "AppBlock"} \u9694\u79BB\u5E94\u7528`, sandbox: "allow-scripts", referrerPolicy: "no-referrer", srcDoc: live.document }, `${request.messageId}:${live.sequence}`) : /* @__PURE__ */ (0, import_jsx_runtime50.jsx)("div", { className: "iui-app-block-empty", children: "\u660E\u786E\u70B9\u51FB\u8FD0\u884C\u540E\u624D\u4F1A\u521B\u5EFA\u72EC\u7ACB\u6C99\u7BB1\u3002\u6539\u52A8\u6E90\u7801\u540E\u9700\u91CD\u65B0\u5BA1\u9605\u3002" })
  ] });
}

// ui/components/media/async-image/AsyncImage.tsx
var import_react6 = require("react");
var import_jsx_runtime51 = require("react/jsx-runtime");
function safeImageSource(src, nativeAttachment = false) {
  if (/^data:image\/(?:png|jpeg|webp|gif);base64,[a-z0-9+/=]+$/i.test(src) && src.length <= 4e6)
    return src;
  try {
    const url = new URL(src);
    if (["https:", "http:"].includes(url.protocol) && !url.username && !url.password)
      return url.href;
    if (nativeAttachment && url.protocol === "blob:")
      return url.href;
    if (url.protocol === "dsh-app:" && url.hostname === "app" && !url.port && !url.username && !url.password && url.pathname === "/api/file" && url.searchParams.size === 1 && url.searchParams.has("path") && !url.hash)
      return url.href;
    return null;
  } catch {
    return null;
  }
}
function imageFromValue(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return null;
  const src = typeof value.src === "string" ? safeImageSource(value.src, value.nativeAttachment === true) : null;
  if (!src || typeof value.alt !== "string" || !value.alt.trim() || value.alt.length > 240)
    return null;
  const width = typeof value.width === "number" && Number.isFinite(value.width) && value.width > 0 ? value.width : void 0;
  const height = typeof value.height === "number" && Number.isFinite(value.height) && value.height > 0 ? value.height : void 0;
  return { src, alt: value.alt, width, height };
}
function ratio(value) {
  if (typeof value !== "string")
    return void 0;
  const match = /^(\d{1,3}):(\d{1,3})$/.exec(value);
  if (!match || !Number(match[1]) || !Number(match[2]))
    return void 0;
  return `${Number(match[1])} / ${Number(match[2])}`;
}
function AsyncImage({ query, aspectRatio, width, messageId, adapter }) {
  const [state, setState] = (0, import_react6.useState)({ phase: "resolving" });
  (0, import_react6.useEffect)(() => {
    if (!adapter.resolveResource)
      return;
    let active = true;
    if (typeof query !== "string" || !query.trim()) {
      setState({ phase: "error", message: "\u56FE\u7247\u67E5\u8BE2\u9700\u4E3A\u975E\u7A7A\u5B57\u7B26\u4E32" });
      return () => {
        active = false;
      };
    }
    setState({ phase: "resolving" });
    void adapter.resolveResource({ kind: "AsyncImage", query, props: {}, messageId }).then((result) => {
      if (!active)
        return;
      const image = result.ok ? imageFromValue(result.value) : null;
      setState(image ? { phase: "loading", image } : { phase: "error", message: result.message || "\u56FE\u7247\u8D44\u6E90\u4E0D\u53EF\u7528" });
    }, () => {
      if (active)
        setState({ phase: "error", message: "\u56FE\u7247\u8D44\u6E90\u89E3\u6790\u5931\u8D25" });
    });
    return () => {
      active = false;
    };
  }, [adapter, query, messageId]);
  if (!adapter.resolveResource)
    return /* @__PURE__ */ (0, import_jsx_runtime51.jsx)(UnconfiguredHost, { name: "AsyncImage" });
  const style = { width: safeCssSize(width) ?? "100%", aspectRatio: ratio(aspectRatio) };
  return /* @__PURE__ */ (0, import_jsx_runtime51.jsxs)("figure", { className: "iui-async-image", style, "data-image-status": state.phase, children: [
    state.image && /* @__PURE__ */ (0, import_jsx_runtime51.jsx)(
      "img",
      {
        src: state.image.src,
        alt: state.image.alt,
        width: state.image.width,
        height: state.image.height,
        onLoad: () => setState((current2) => current2.image?.src === state.image?.src ? { ...current2, phase: "ready" } : current2),
        onError: () => setState((current2) => current2.image?.src === state.image?.src ? { phase: "error", message: "\u56FE\u7247\u52A0\u8F7D\u5931\u8D25", image: current2.image } : current2)
      }
    ),
    state.phase !== "ready" && /* @__PURE__ */ (0, import_jsx_runtime51.jsx)("div", { className: "iui-image-status", role: "status", children: state.phase === "error" ? `${state.image?.alt ?? String(query ?? "")}\uFF1A${state.message}` : "\u56FE\u7247\u52A0\u8F7D\u4E2D\u2026" })
  ] });
}
function AsyncImageGroup({ queries, aspectRatio, layout, messageId, adapter }) {
  const [index, setIndex] = (0, import_react6.useState)(0);
  if (!adapter.resolveResource)
    return /* @__PURE__ */ (0, import_jsx_runtime51.jsx)(UnconfiguredHost, { name: "AsyncImageGroup" });
  if (!Array.isArray(queries) || !queries.length || queries.length > 8 || queries.some((query) => typeof query !== "string" || !query.trim())) {
    return /* @__PURE__ */ (0, import_jsx_runtime51.jsx)("div", { className: "iui-unavailable", children: "AsyncImageGroup \xB7 \u56FE\u7247\u67E5\u8BE2\u9700\u4E3A 1\u20138 \u4E2A\u975E\u7A7A\u5B57\u7B26\u4E32" });
  }
  if (layout === "carousel")
    return /* @__PURE__ */ (0, import_jsx_runtime51.jsxs)("div", { className: "iui-image-carousel", children: [
      /* @__PURE__ */ (0, import_jsx_runtime51.jsx)(AsyncImage, { query: queries[index % queries.length], aspectRatio, messageId, adapter }, queries[index % queries.length]),
      /* @__PURE__ */ (0, import_jsx_runtime51.jsxs)("div", { className: "iui-image-controls", children: [
        /* @__PURE__ */ (0, import_jsx_runtime51.jsx)("button", { type: "button", onClick: () => setIndex((value) => (value + queries.length - 1) % queries.length), "aria-label": "\u4E0A\u4E00\u5F20\u56FE\u7247", children: "\u2039" }),
        /* @__PURE__ */ (0, import_jsx_runtime51.jsxs)("span", { children: [
          index % queries.length + 1,
          " / ",
          queries.length
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime51.jsx)("button", { type: "button", onClick: () => setIndex((value) => (value + 1) % queries.length), "aria-label": "\u4E0B\u4E00\u5F20\u56FE\u7247", children: "\u203A" })
      ] })
    ] });
  return /* @__PURE__ */ (0, import_jsx_runtime51.jsx)("div", { className: "iui-image-group", children: queries.map((query, index2) => /* @__PURE__ */ (0, import_jsx_runtime51.jsx)(AsyncImage, { query, aspectRatio, messageId, adapter }, `${query}:${index2}`)) });
}

// ui/renderer/markdown.tsx
var import_jsx_runtime52 = require("react/jsx-runtime");
function renderMarkdownText(text) {
  const result = [], pattern = /(```[\s\S]*?```|~~~[\s\S]*?~~~|\*\*[^*]+\*\*|~~[^~]+~~|`[^`]+`|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0, m, index = 0;
  while (m = pattern.exec(text)) {
    if (m.index > last)
      result.push(text.slice(last, m.index));
    const token = m[0], key = index++;
    if (token.startsWith("```") || token.startsWith("~~~"))
      result.push(/* @__PURE__ */ (0, import_jsx_runtime52.jsx)("pre", { className: "iui-code", children: /* @__PURE__ */ (0, import_jsx_runtime52.jsx)("code", { children: token.slice(3, -3).replace(/^[^\n]*\n/, "") }) }, key));
    else if (token.startsWith("**"))
      result.push(/* @__PURE__ */ (0, import_jsx_runtime52.jsx)("strong", { children: token.slice(2, -2) }, key));
    else if (token.startsWith("~~"))
      result.push(/* @__PURE__ */ (0, import_jsx_runtime52.jsx)("s", { children: token.slice(2, -2) }, key));
    else if (token.startsWith("`"))
      result.push(/* @__PURE__ */ (0, import_jsx_runtime52.jsx)("code", { children: token.slice(1, -1) }, key));
    else if (token.startsWith("*"))
      result.push(/* @__PURE__ */ (0, import_jsx_runtime52.jsx)("em", { children: token.slice(1, -1) }, key));
    else {
      const x = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      const url = x && safeUrl(x[2]);
      result.push(url ? /* @__PURE__ */ (0, import_jsx_runtime52.jsx)("a", { href: url, target: "_blank", rel: "noopener noreferrer", children: x[1] }, key) : x?.[1] || token);
    }
    last = pattern.lastIndex;
  }
  if (last < text.length)
    result.push(text.slice(last));
  return result;
}

// ui/renderer/Renderer.tsx
var import_jsx_runtime53 = require("react/jsx-runtime");
var get = (a, scope, runtime) => {
  if (!a)
    return void 0;
  if (a.kind === "literal")
    return a.value;
  try {
    return runtime.value(String(a.value), scope);
  } catch {
    return void 0;
  }
};
var asOptions = (value) => Array.isArray(value) ? value.slice(0, 100).filter((x) => !!x && typeof x === "object" && "label" in x && "value" in x).map((x) => ({ label: String(x.label), value: String(x.value) })) : [];
var asNumber = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};
function resolvedStyle(read) {
  const style = {};
  for (const name of ["width", "height", "minHeight"]) {
    const size = safeCssSize(read(name));
    if (size)
      style[name] = size;
  }
  const background = safeColor(read("background"));
  if (background)
    style.background = background;
  const color2 = safeColor(read("color"));
  if (color2)
    style.color = color2;
  const sizes = { xs: "12px", sm: "14px", md: "16px", lg: "18px", xl: "20px", "2xl": "24px" };
  if (sizes[String(read("size"))])
    style.fontSize = sizes[String(read("size"))];
  const weights = { normal: 400, medium: 500, semibold: 600, bold: 700 };
  if (weights[String(read("weight"))])
    style.fontWeight = weights[String(read("weight"))];
  const padding = Number(read("padding"));
  if (Number.isFinite(padding) && padding >= 0 && padding <= 8)
    style.padding = `calc(var(--iui-spacing) * ${padding})`;
  const gap = Number(read("gap"));
  if (Number.isFinite(gap) && gap >= 0 && gap <= 8)
    style.gap = `calc(var(--iui-spacing) * ${gap})`;
  if (read("radius"))
    style.borderRadius = String(read("radius")) === "full" ? "999px" : "var(--iui-radius)";
  if (read("border"))
    style.border = "1px solid var(--iui-border)";
  const flex = read("flex");
  if (flex !== void 0 && /^\d+(?:\.\d+)?$/.test(String(flex)))
    style.flex = String(flex);
  const align = { center: "center", start: "flex-start", end: "flex-end" };
  const justify = { between: "space-between", center: "center", start: "flex-start", end: "flex-end" };
  if (align[String(read("align"))])
    style.alignItems = align[String(read("align"))];
  if (justify[String(read("justify"))])
    style.justifyContent = justify[String(read("justify"))];
  if (read("wrap") === "wrap")
    style.flexWrap = "wrap";
  const textAlign = String(read("textAlign"));
  if (["left", "center", "right", "start", "end"].includes(textAlign))
    style.textAlign = textAlign;
  if (read("tabularNums"))
    style.fontVariantNumeric = "tabular-nums";
  if (read("clip"))
    style.overflow = "hidden";
  if (read("block"))
    style.width = "100%";
  return style;
}
function UIRenderer({ runtime, showPlainText = false, targets, themeMode = "light" }) {
  const [, revision] = (0, import_react7.useState)(0), scope = runtime.scope();
  const force = () => revision((v) => v + 1);
  const render = (n, key, env = scope) => {
    if (n.kind === "text")
      return showPlainText || n.text.trim() ? /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(import_react7.default.Fragment, { children: renderMarkdownText(n.text) }, key) : null;
    if (n.kind === "expression") {
      try {
        const value = runtime.value(n.source, env);
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(import_react7.default.Fragment, { children: value == null ? "" : String(value) }, key);
      } catch (e) {
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)("span", { className: "iui-error", title: String(e), children: "\u8868\u8FBE\u5F0F\u9519\u8BEF" }, key);
      }
    }
    if (n.kind === "if") {
      let visible = false;
      try {
        visible = !!runtime.value(n.test, env);
      } catch {
      }
      return visible ? /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(import_react7.default.Fragment, { children: n.children.map((c, i) => render(c, i, env)) }, key) : null;
    }
    if (n.kind === "each") {
      let values = [];
      try {
        values = runtime.value(n.source, env);
      } catch {
      }
      if (!Array.isArray(values))
        return null;
      return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(import_react7.default.Fragment, { children: values.slice(0, 100).map((v, i) => {
        const local2 = { ...env, [n.item]: v, ...n.index ? { [n.index]: i } : {} };
        const first = n.children.find((c) => c.kind === "element" && c.attributes.key);
        const stable = first?.kind === "element" ? String(get(first.attributes.key, local2, runtime) ?? i) : i;
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(import_react7.default.Fragment, { children: n.children.map((c, j) => render(c, j, local2)) }, stable);
      }) }, key);
    }
    const name = n.name, spec = byName.get(name), p = (name2) => get(n.attributes[name2], env, runtime), event = (name2) => n.attributes[name2]?.kind === "expression" ? String(n.attributes[name2].value) : void 0;
    const action = (source, value) => {
      if (source)
        void runtime.event(source, value, env).then(force);
    };
    if (!spec || spec.support === "unsupported")
      return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(UnsupportedComponent, { name }, key);
    if (name === "AppBlock") {
      const literal2 = (key2) => n.attributes[key2]?.kind === "literal" && typeof n.attributes[key2].value === "string" ? String(n.attributes[key2].value) : void 0;
      return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(AppBlock, { request: { messageId: runtime.document.messageId, id: literal2("app_block_id") || "", title: literal2("title"), html: n.rawContent || "" }, adapter: runtime.adapter }, key);
    }
    if (name === "AsyncImage")
      return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(
        AsyncImage,
        {
          query: p("query"),
          aspectRatio: p("aspectRatio"),
          width: p("width"),
          messageId: runtime.document.messageId,
          adapter: runtime.adapter
        },
        key
      );
    if (name === "AsyncImageGroup") {
      return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(
        AsyncImageGroup,
        {
          queries: p("query"),
          aspectRatio: p("aspectRatio"),
          layout: p("layout"),
          messageId: runtime.document.messageId,
          adapter: runtime.adapter
        },
        key
      );
    }
    if (spec.support === "host")
      return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(UnconfiguredHost, { name }, key);
    const kids = n.children.map((c, i) => render(c, i, env));
    const style = resolvedStyle(p);
    switch (name) {
      case "text":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(Text, { style, children: kids }, key);
      case "title":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(Title, { style, children: kids }, key);
      case "caption":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(Caption, { style, children: kids }, key);
      case "badge":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(Badge, { style, children: kids }, key);
      case "code":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(Code, { style, children: kids }, key);
      case "math":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(MathText, { style, children: kids }, key);
      case "label":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(Label, { style, children: kids }, key);
      case "bold":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(Bold, { style, children: kids }, key);
      case "italic":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(Italic, { style, children: kids }, key);
      case "underline":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(Underline, { style, children: kids }, key);
      case "strikethrough":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(Strikethrough, { style, children: kids }, key);
      case "icon":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(Icon, { name: String(p("name") ?? "icon"), style, inline: !!p("inline") }, key);
      case "blockquote":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(Blockquote, { style, children: kids }, key);
      case "CodeBlock":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(CodeBlock, { style, children: n.rawContent ?? kids }, key);
      case "box":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(Box, { style, children: kids }, key);
      case "row":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(Row, { style, children: kids }, key);
      case "col":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(Column, { style, children: kids }, key);
      case "flow":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(Flow, { style, children: kids }, key);
      case "card":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(Card, { style, children: kids }, key);
      case "grid":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(Grid, { style, columns: asNumber(p("columns"), 2), children: kids }, key);
      case "grid-item":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(GridItem, { style, children: kids }, key);
      case "flow-item":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(FlowItem, { style, children: kids }, key);
      case "carousel-item":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(CarouselItem, { style, children: kids }, key);
      case "divider":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(Divider, { style }, key);
      case "spacer":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(Spacer, { style }, key);
      case "table":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(Table, { style, children: kids }, key);
      case "table-row":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(TableRow, { style, children: kids }, key);
      case "table-cell":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(TableCell, { style, children: kids }, key);
      case "list":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(List, { style, marker: String(p("marker") ?? ""), children: kids }, key);
      case "list-item":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(ListItem, { style, children: kids }, key);
      case "popover":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(Popover, { style, children: kids }, key);
      case "popover-trigger":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(PopoverTrigger, { children: kids }, key);
      case "popover-content":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(PopoverContent, { style, children: kids }, key);
      case "carousel":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(Carousel, { style, activeIndex: asNumber(p("activeIndex"), 0), onChange: (v) => action(event("onChange"), v), children: kids }, key);
      case "button":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(Button, { style, variant: String(p("variant") ?? ""), block: !!p("block"), disabled: !!p("disabled"), onClick: () => action(event("onClick")), children: kids }, key);
      case "pressable":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(Pressable, { style, disabled: !!p("disabled"), onClick: () => action(event("onClick")), children: kids }, key);
      case "input":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(Input, { style, value: String(p("value") ?? ""), placeholder: String(p("placeholder") ?? ""), number: p("inputType") === "number", block: !!p("block"), disabled: !!p("disabled"), onChange: (v) => action(event("onChange"), v) }, key);
      case "textarea":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(Textarea, { style, value: String(p("value") ?? ""), placeholder: String(p("placeholder") ?? ""), rows: asNumber(p("rows"), 3), block: !!p("block"), disabled: !!p("disabled"), onChange: (v) => action(event("onChange"), v) }, key);
      case "select":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(Select, { style, value: String(p("value") ?? ""), options: asOptions(p("options")), block: !!p("block"), disabled: !!p("disabled"), onChange: (v) => action(event("onChange"), v) }, key);
      case "checkbox":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(Checkbox, { style, checked: !!p("checked"), lineThrough: !!p("lineThrough"), disabled: !!p("disabled"), onChange: (v) => action(event("onChange"), v), children: kids }, key);
      case "radio-group":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(RadioGroup, { style, value: p("value"), direction: String(p("direction") ?? "row"), onChange: (v) => action(event("onChange"), v), children: kids }, key);
      case "radio":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(Radio, { style, value: p("value"), disabled: !!p("disabled"), children: kids }, key);
      case "slider":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(Slider, { style, min: asNumber(p("min"), 0), max: asNumber(p("max"), 100), step: asNumber(p("step"), 1), value: asNumber(p("value"), 0), disabled: !!p("disabled"), onChange: (v) => action(event("onChange"), v) }, key);
      case "date-picker":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(DatePicker, { style, value: String(p("value") ?? ""), block: !!p("block"), disabled: !!p("disabled"), onChange: (v) => action(event("onChange"), v) }, key);
      case "segmented-control":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(SegmentedControl, { style, value: p("value"), options: asOptions(p("options")), block: !!p("block"), disabled: !!p("disabled"), onChange: (v) => action(event("onChange"), v) }, key);
      case "Chart":
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(Chart, { content: p("content") }, key);
      default:
        return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(UnsupportedComponent, { name }, key);
    }
  };
  if (targets)
    return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)(import_jsx_runtime53.Fragment, { children: runtime.document.children.map((node, index) => targets[index] ? (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime53.jsx)(ThemeProvider, { name: "studio", mode: themeMode, children: /* @__PURE__ */ (0, import_jsx_runtime53.jsx)("div", { className: "iui-root", children: render(node, index) }) }), targets[index], index) : null) });
  return /* @__PURE__ */ (0, import_jsx_runtime53.jsx)("div", { className: "iui-root", children: runtime.document.children.map((n, i) => render(n, i)) });
}

// services/reply-coordinator.ts
function referencesReady(source, available) {
  let ast;
  try {
    ast = new SafeEvaluator().parse(source);
  } catch {
    return false;
  }
  const visit = (node, names) => {
    if (!node || typeof node !== "object")
      return true;
    if (Array.isArray(node))
      return node.every((child) => visit(child, names));
    if (node.type === "CallExpression" && node.callee?.type === "MemberExpression" && !node.callee.computed && node.callee.property.name === "filter" && node.arguments?.length === 1 && node.arguments[0].type === "Identifier" && node.arguments[0].name === "Boolean" && !names.has("Boolean"))
      return visit(node.callee.object, names);
    if (node.type === "Identifier")
      return names.has(node.name);
    if (node.type === "Literal" || node.type === "TemplateElement")
      return true;
    if (node.type === "MemberExpression")
      return visit(node.object, names) && (!node.computed || visit(node.property, names));
    if (node.type === "Property")
      return (!node.computed || visit(node.key, names)) && visit(node.value, names);
    if (node.type === "ArrowFunctionExpression") {
      const local2 = new Set(names);
      for (const param of node.params) {
        if (param.type !== "Identifier")
          return false;
        local2.add(param.name);
      }
      return visit(node.body, local2);
    }
    return Object.values(node).every((value) => visit(value, names));
  };
  return visit(ast, available);
}
function readyForPreview(document2) {
  const known = /* @__PURE__ */ new Set(["Math", "JSON", "GenUI", "Number", "String"]);
  for (const declaration2 of document2.declarations) {
    if (known.has(declaration2.name) || declaration2.setter && (known.has(declaration2.setter) || declaration2.setter === declaration2.name))
      return false;
    if (!referencesReady(declaration2.expression, known))
      return false;
    known.add(declaration2.name);
    if (declaration2.setter)
      known.add(declaration2.setter);
  }
  const runtime = new Runtime(document2);
  const scope = runtime.scope();
  if (runtime.feedback.length)
    return false;
  const ready = (nodes, env) => {
    try {
      for (const node of nodes) {
        if (node.kind === "text")
          continue;
        if (node.kind === "expression") {
          if (!referencesReady(node.source, /* @__PURE__ */ new Set([...Object.keys(env), "Number", "String"])))
            return false;
          runtime.value(node.source, env);
          continue;
        }
        if (node.kind === "if") {
          if (!referencesReady(node.test, /* @__PURE__ */ new Set([...Object.keys(env), "Number", "String"])))
            return false;
          if (runtime.value(node.test, env) && !ready(node.children, env))
            return false;
          continue;
        }
        if (node.kind === "each") {
          if (!referencesReady(node.source, /* @__PURE__ */ new Set([...Object.keys(env), "Number", "String"])))
            return false;
          const values = runtime.value(node.source, env);
          if (!Array.isArray(values))
            return false;
          for (const [index, value] of values.slice(0, 100).entries()) {
            if (!ready(node.children, { ...env, [node.item]: value, ...node.index ? { [node.index]: index } : {} }))
              return false;
          }
          continue;
        }
        for (const [name, attribute] of Object.entries(node.attributes)) {
          if (attribute.kind === "expression") {
            if (!referencesReady(String(attribute.value), /* @__PURE__ */ new Set([...Object.keys(env), "Number", "String"])))
              return false;
            if (!/^on[A-Z]/.test(name))
              runtime.value(String(attribute.value), env);
          }
        }
        if (!ready(node.children, env))
          return false;
      }
      return true;
    } catch {
      return false;
    }
  };
  return ready(document2.children, scope);
}
var mixedRoots = /* @__PURE__ */ new Set(["box", "row", "col", "grid", "card", "list", "flow", "table", "carousel", "Chart"]);
function parseReplyParts(source, messageId) {
  if (!source || !/[<{]/.test(source))
    return null;
  const complete = parseDsl(source, messageId, true);
  const parsed = complete.complete ? complete : parseDslPreview(source, messageId);
  if (parsed.diagnostics.some((item) => item.severity === "error"))
    return null;
  const hasProse = parsed.children.some((node) => node.kind === "text" && !!node.text.trim());
  const components = parsed.children.filter((node) => node.kind === "element");
  const roots = components.filter((node) => {
    if (!hasProse)
      return true;
    const beforeLine = source.slice(0, node.span.start).split("\n").at(-1) ?? "";
    const followsDeclaration = parsed.declarations.some((declaration2) => declaration2.span.end <= node.span.start && !source.slice(declaration2.span.end, node.span.start).trim());
    return followsDeclaration || mixedRoots.has(node.name) && !beforeLine.trim();
  });
  if (!roots.length)
    return null;
  const document2 = { ...parsed, children: roots };
  if (!readyForPreview(document2))
    return null;
  const regions = [
    ...parsed.declarations.map((item) => ({ start: item.span.start, end: item.span.end, kind: "declaration" })),
    ...roots.map((item) => ({ start: item.span.start, end: item.span.end < 0 ? source.length : item.span.end, kind: "ui" }))
  ].sort((a, b) => a.start - b.start);
  if (regions.some((region, index) => region.end <= region.start || index > 0 && region.start < regions[index - 1].end))
    return null;
  return { document: document2, regions };
}

// packages/dsh-plugin/src/segments.ts
function splitReply(source, messageId) {
  const parsed = parseReplyParts(source, messageId);
  if (!parsed)
    return null;
  const segments = [];
  let cursor = 0;
  let uiIndex = 0;
  const appendMarkdown = (text) => {
    if (!text)
      return;
    const last = segments[segments.length - 1];
    if (last?.kind === "markdown")
      last.text += text;
    else
      segments.push({ kind: "markdown", text });
  };
  for (const region of parsed.regions) {
    if (region.start > cursor)
      appendMarkdown(source.slice(cursor, region.start));
    if (region.kind === "ui")
      segments.push({ kind: "ui", index: uiIndex++ });
    cursor = region.end;
  }
  if (cursor < source.length)
    appendMarkdown(source.slice(cursor));
  return { document: parsed.document, segments };
}

// node_modules/@deepseek-ai/dsh-util-workspace-path/lib/index.js
var FILE_ADDRESS_PREFIX = "dsh-resource://file/";
function isDriveSegment(segment) {
  return segment !== void 0 && /^[A-Za-z]:$/.test(segment);
}
function parseFileAddress(address) {
  try {
    if (!address.startsWith(FILE_ADDRESS_PREFIX))
      return void 0;
    const end = address.search(/[?#]/);
    const [scope, ...rest] = address.slice(20, end === -1 ? void 0 : end).split("/");
    if (scope === "session") {
      const [id, ...segments] = rest;
      if (id === void 0 || id === "" || segments.length === 0)
        return void 0;
      return {
        scope,
        sessionId: decodeURIComponent(id),
        path: segments.map(decodeURIComponent).join("/")
      };
    }
    if (scope === "absolute") {
      const unc = rest[0] === "" && rest.length > 1;
      const segments = (unc ? rest.slice(1) : rest).map(decodeURIComponent);
      if (segments.length === 0 || segments[0] === "")
        return void 0;
      if (unc)
        return {
          scope,
          path: `//${segments.join("/")}`
        };
      return {
        scope,
        path: isDriveSegment(segments[0]) ? segments.join("/") : `/${segments.join("/")}`
      };
    }
    return;
  } catch {
    return;
  }
}
function isWindowsStylePath(value) {
  return /^[A-Za-z]:[/\\]/.test(value) || value.startsWith("\\\\");
}
function isAbsoluteWorkspacePath(path) {
  return path.startsWith("/") || isWindowsStylePath(path);
}
function resolveWorkspacePath(cwd, path) {
  if (isAbsoluteWorkspacePath(path))
    return path;
  if (cwd === void 0 || cwd === "")
    return path;
  const separator = isWindowsStylePath(cwd) && cwd.includes("\\") ? "\\" : "/";
  return `${cwd.replace(/[/\\]+$/, "")}${separator}${path.replace(/^[/\\]+/, "")}`;
}
function fileMediaUrl(base, path) {
  if (!/^https?:/u.test(base) && !base.startsWith("dsh-app://app/") || !isAbsoluteWorkspacePath(path) || /^[/\\]{2}/u.test(path) || /[\u0000-\u001f\u007f]/u.test(path))
    return void 0;
  return new URL(`api/file?path=${encodeURIComponent(path)}`, base).href;
}

// packages/dsh-plugin/src/media.ts
var rasterFile = /\.(?:png|jpe?g|webp|gif)(?:[?#]|$)/iu;
var invalidPath = /^[\\/]{2}|[\u0000-\u001f\u007f]/u;
var scheme = /^[a-z][a-z0-9+.-]*:/iu;
var drive = /^[a-z]:[\\/]/iu;
function imageLabel(query) {
  return query.split(/[?#]/u)[0].split(/[\\/]/u).at(-1)?.slice(0, 240) || "\u56FE\u7247";
}
function resolved(src, alt, attachment) {
  const value = { src, alt };
  if (attachment) {
    value.nativeAttachment = true;
    if (typeof attachment.width === "number" && Number.isFinite(attachment.width))
      value.width = attachment.width;
    if (typeof attachment.height === "number" && Number.isFinite(attachment.height))
      value.height = attachment.height;
  }
  return { ok: true, value };
}
function createDshMediaAdapter({ base, cwd, messageId, attachments, loadImage }) {
  const currentImages = new Map(attachments.map((attachment) => [String(attachment.attachmentId), attachment]));
  return { async resolveResource(request) {
    if (request.kind !== "AsyncImage" || request.messageId !== messageId || typeof request.query !== "string" || !request.query.trim())
      return { ok: false, message: "\u56FE\u7247\u9700\u8981\u5F53\u524D\u6D88\u606F\u4E2D\u7684\u660E\u786E\u8DEF\u5F84\u6216\u5F15\u7528" };
    const query = request.query.trim();
    if (query.startsWith("attachment:")) {
      const attachment = currentImages.get(query.slice("attachment:".length));
      if (!attachment)
        return { ok: false, message: "\u5F53\u524D\u6D88\u606F\u6CA1\u6709\u8BE5\u56FE\u7247\u9644\u4EF6" };
      try {
        const src2 = await loadImage(attachment);
        return resolved(src2, String(attachment.name || "\u56FE\u7247\u9644\u4EF6").slice(0, 240), attachment);
      } catch {
        return { ok: false, message: "\u56FE\u7247\u9644\u4EF6\u4E0D\u53EF\u7528" };
      }
    }
    if (/^https?:\/\//iu.test(query)) {
      try {
        const url = new URL(query);
        if (!url.username && !url.password)
          return resolved(url.href, imageLabel(query));
      } catch {
      }
      return { ok: false, message: "\u56FE\u7247 URL \u65E0\u6548" };
    }
    let path = query;
    if (query.startsWith("dsh-resource:")) {
      const address = parseFileAddress(query);
      if (!address || address.scope !== "absolute")
        return { ok: false, message: "\u56FE\u7247\u6587\u4EF6\u5F15\u7528\u65E0\u6CD5\u5728\u5F53\u524D\u4F1A\u8BDD\u9A8C\u8BC1" };
      path = address.path;
    } else {
      try {
        path = decodeURIComponent(query.split(/[?#]/u)[0] || "");
      } catch {
        return { ok: false, message: "\u56FE\u7247\u8DEF\u5F84\u7F16\u7801\u65E0\u6548" };
      }
    }
    if (!path || invalidPath.test(path) || scheme.test(path) && !drive.test(path) || !rasterFile.test(path))
      return { ok: false, message: "\u8BF7\u63D0\u4F9B PNG\u3001JPEG\u3001WebP \u6216 GIF \u6587\u4EF6\u8DEF\u5F84\uFF1B\u672A\u63A5\u5165\u56FE\u7247\u641C\u7D22" };
    const src = fileMediaUrl(base, resolveWorkspacePath(cwd, path));
    return src ? resolved(src, imageLabel(path)) : { ok: false, message: "\u56FE\u7247\u8DEF\u5F84\u65E0\u6CD5\u89E3\u6790\uFF0C\u6216\u4F1A\u8BDD\u5DE5\u4F5C\u76EE\u5F55\u5C1A\u672A\u5C31\u7EEA" };
  } };
}

// ui/styles.css
var styles_default = "/* Component styles: import from open-intelligent-ui/styles.css alongside the React UI package. */\n.iui-theme{min-height:100vh;background:var(--iui-background);color:var(--iui-text);font-family:var(--iui-font)}\n.iui-root{font-size:14px;line-height:1.55;white-space:pre-wrap}.iui-box,.iui-col,.iui-card,.iui-grid-item,.iui-flow-item,.iui-WritingBlock,.iui-carousel-item{display:flex;flex-direction:column;gap:8px;min-width:0}.iui-row,.iui-flow{display:flex;align-items:center;gap:8px;min-width:0}.iui-grid{display:grid;gap:8px}.iui-card{border:1px solid var(--iui-border);border-radius:12px;padding:14px}.iui-title{font-size:19px;line-height:1.2;letter-spacing:-.025em;margin:0;font-weight:750}.iui-caption{color:var(--iui-text-muted);font-size:12px}.iui-badge{display:inline-flex;background:var(--iui-surface-muted);border-radius:99px;padding:3px 9px;font-size:11px;font-weight:700;white-space:nowrap}.iui-label{font-size:12px;font-weight:700;color:var(--iui-text-muted)}.iui-icon{display:inline-block;min-width:1em;text-align:center;color:var(--iui-primary)}.iui-divider{border:0;border-top:1px solid var(--iui-border);width:100%;margin:5px 0}.iui-field{border:1px solid var(--iui-border);border-radius:8px;padding:9px 11px;min-width:0;max-width:100%;background:var(--iui-surface);color:var(--iui-text-muted);outline:none}.iui-field:focus{border-color:var(--iui-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--iui-primary) 18%,transparent)}.iui-slider{width:100%;accent-color:var(--iui-primary)}.iui-check{display:inline-flex;align-items:center;gap:6px;cursor:pointer}.iui-check input{accent-color:var(--iui-primary)}.iui-radio-group{display:flex;gap:12px;flex-wrap:wrap}.iui-radio-group.vertical{flex-direction:column}.iui-button,.iui-pressable{border:0;border-radius:8px;padding:9px 13px;background:var(--iui-primary);color:var(--iui-surface);font-weight:700;font-size:12px;text-align:left}.iui-pressable{background:transparent;color:inherit}.iui-pressable:hover{background:var(--iui-surface-muted)}.iui-segments{display:flex;border:1px solid var(--iui-border);border-radius:9px;padding:3px;gap:3px}.iui-segments button{border:0;background:transparent;padding:6px 10px;border-radius:6px;color:var(--iui-text-muted);font-size:11px;font-weight:700}.iui-segments button.active{color:var(--iui-text-muted);background:var(--iui-surface-muted)}.iui-table{display:table;width:100%;border-collapse:collapse}.iui-table-row{display:table-row}.iui-table-cell{display:table-cell;border-bottom:1px solid var(--iui-border);padding:8px}.iui-list{padding-left:24px}.iui-code{overflow:auto;background:var(--iui-surface-muted);border-radius:9px;padding:12px}.iui-popover{position:relative}.iui-popover summary{cursor:pointer;list-style:none}.iui-popover-content{position:relative;z-index:2;background:var(--iui-surface-muted);border:1px solid var(--iui-border);border-radius:10px;box-shadow:0 12px 25px var(--iui-shadow);padding:10px;margin-top:8px}.iui-carousel{display:flex;align-items:center;gap:8px}.iui-carousel>div{flex:1;min-width:0}.iui-carousel>button{border:1px solid var(--iui-border);background:var(--iui-background);border-radius:7px;font-size:20px;color:var(--iui-primary)}.iui-chart svg{width:100%;height:auto;display:block}.iui-legend{display:flex;gap:12px;flex-wrap:wrap;font-size:11px;color:var(--iui-text-muted)}.iui-legend span{display:flex;align-items:center;gap:4px}.iui-legend i{width:8px;height:8px;border-radius:2px}.iui-unavailable{padding:12px;border:1px dashed var(--iui-border);border-radius:8px;background:var(--iui-surface-muted);color:var(--iui-text-muted);font-size:12px}.iui-error{color:var(--iui-danger)}\n.iui-card,.iui-field,.iui-button,.iui-pressable,.iui-badge{border-radius:var(--iui-radius)}\n.iui-root :disabled{cursor:not-allowed;opacity:.55}\n.iui-box,.iui-col,.iui-card,.iui-grid-item,.iui-flow-item,.iui-carousel-item{gap:var(--iui-spacing)}\n@media(max-width:850px){.iui-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}\n@media(max-width:480px){.iui-grid{grid-template-columns:1fr!important}.iui-row{flex-wrap:wrap}}\n.iui-button.iui-outline{background:transparent;color:var(--iui-primary);border:1px solid var(--iui-primary)}\n.iui-button.iui-ghost{background:transparent;color:var(--iui-primary)}\n.iui-button:hover:not(:disabled){filter:brightness(.95)}\n.iui-app-block{border:1px solid var(--iui-border);border-radius:13px;overflow:hidden;background:var(--iui-surface)}\n.iui-app-block-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px;border-bottom:1px solid var(--iui-border)}\n.iui-app-block-head>div:first-child{display:flex;flex-direction:column;gap:2px}.iui-app-block-head strong{font-size:13px}.iui-app-block-head small{font-size:10px;color:var(--iui-text-muted)}\n.iui-app-block-actions{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end}.iui-app-block-actions button{border:1px solid var(--iui-border);border-radius:7px;background:var(--iui-surface-muted);color:var(--iui-text);padding:6px 8px;font-size:10px;font-weight:700}.iui-app-block-actions button:first-child{background:var(--iui-primary);border-color:var(--iui-primary);color:var(--iui-surface)}.iui-app-block-actions button:disabled{opacity:.4;cursor:default}\n.iui-app-block-status{margin:0;padding:8px 12px;background:var(--iui-surface-muted);color:var(--iui-text-muted);font-size:10px}.iui-app-block-empty{padding:36px 18px;text-align:center;color:var(--iui-text-muted);font-size:12px}\n.iui-app-block iframe{display:block;width:100%;height:770px;border:0;background:#111b2a}.iui-app-block.is-paint iframe{height:440px}\n@media(max-width:520px){.iui-app-block-head{align-items:flex-start;flex-direction:column}.iui-app-block-actions{justify-content:flex-start}}\n.iui-async-image{position:relative;display:block;max-width:100%;min-height:120px;margin:0;overflow:hidden;border:1px solid var(--iui-border);border-radius:var(--iui-radius);background:var(--iui-surface-muted)}\n.iui-async-image img{display:block;width:100%;height:100%;object-fit:contain;opacity:0;transition:opacity .18s ease}\n.iui-async-image[data-image-status=ready] img{opacity:1}\n.iui-image-status{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:16px;text-align:center;color:var(--iui-text-muted);font-size:12px;background:var(--iui-surface-muted)}\n.iui-async-image[data-image-status=error] .iui-image-status{color:var(--iui-danger)}\n.iui-image-group{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}\n.iui-image-carousel{min-width:0}.iui-image-controls{display:flex;align-items:center;justify-content:center;gap:18px;padding:6px;color:var(--iui-text-muted);font-size:12px}\n.iui-image-controls button{border:1px solid var(--iui-border);background:var(--iui-surface);color:var(--iui-primary);border-radius:7px;min-width:30px;height:28px;cursor:pointer}\n@media(max-width:520px){.iui-image-group{grid-template-columns:1fr}}\n\n/* Default component language: measured from the user's static ChatGPT UI capture.\n   Theme tokens stay on ThemeProvider so Studio and Citrus share the same geometry. */\n.iui-theme{min-width:0;min-height:0}\n.iui-root{min-width:0;container-type:inline-size;color:var(--iui-text);font-size:16px;line-height:1.625;overflow-wrap:break-word}\n.iui-root,.iui-root *,.iui-root *::before,.iui-root *::after{box-sizing:border-box}\n.iui-root :where(button,input,textarea,select){font-family:inherit}\n.iui-root :disabled{opacity:.42;cursor:not-allowed}\n.iui-root :where(button,input,textarea,select,summary):focus-visible{\n  outline:2px solid var(--iui-info);outline-offset:2px\n}\n\n/* Type is led by the 16/26 body, 18/28 heading and 14px secondary text. */\n.iui-text{min-width:0}\n.iui-title{margin:0;color:var(--iui-text);font-size:18px;line-height:1.55;letter-spacing:-.01em;font-weight:600}\n.iui-caption{color:var(--iui-text-muted);font-size:14px;line-height:1.3;font-weight:400}\n.iui-label{color:var(--iui-text);font-size:14px;line-height:1.45;font-weight:500}\n.iui-badge{\n  display:inline-flex;align-items:center;min-height:20px;width:max-content;max-width:100%;\n  padding:1px 8px;border-radius:999px;background:color-mix(in srgb,currentColor 11%,transparent);\n  color:var(--iui-text-muted);font-size:12px;line-height:18px;font-weight:500;letter-spacing:.015em\n}\n.iui-icon{color:var(--iui-primary)}\n.iui-code{\n  max-width:100%;margin:0;padding:12px 14px;overflow:auto;white-space:pre-wrap;\n  border:1px solid var(--iui-border);border-radius:10px;background:var(--iui-surface-muted);\n  color:var(--iui-text);font:13px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace\n}\n.iui-root :not(pre)>code{\n  padding:2px 5px;border-radius:5px;background:var(--iui-surface-muted);\n  font: .86em/1.45 ui-monospace,SFMono-Regular,Menlo,monospace\n}\n.iui-root a{color:var(--iui-text);text-decoration-color:var(--iui-text-muted);text-underline-offset:3px}\n.iui-root a:hover{text-decoration-color:currentColor}\n.iui-root blockquote{\n  margin:2px 0;padding:5px 0 5px 16px;border-left:3px solid var(--iui-border);\n  color:var(--iui-text-muted)\n}\n.iui-list{margin:0;padding-left:24px}\n.iui-list li{padding-left:2px}\n\n/* Structure uses an eight-pixel default gap; explicit DSL gaps use the 4px theme unit. */\n.iui-box,.iui-col,.iui-card,.iui-grid-item,.iui-flow-item,.iui-WritingBlock,.iui-carousel-item{\n  gap:calc(var(--iui-spacing) * 2);min-width:0\n}\n.iui-row,.iui-flow,.iui-grid{gap:calc(var(--iui-spacing) * 2);min-width:0}\n.iui-card{\n  padding:16px;border:1px solid var(--iui-border);\n  border-radius:calc(var(--iui-radius) + 8px);background:var(--iui-surface);\n  box-shadow:none\n}\n.iui-divider{margin:4px 0;border-top-color:var(--iui-border)}\n\n/* Native form controls keep their semantics while matching the captured 40px fields. */\n.iui-field{\n  min-width:0;min-height:40px;max-width:100%;padding:8px 14px;\n  border:1px solid var(--iui-border);border-radius:10px;background:var(--iui-surface);\n  color:var(--iui-text);font-size:16px;line-height:22px;box-shadow:none;\n  transition:border-color .15s ease,box-shadow .15s ease\n}\n.iui-field::placeholder{color:var(--iui-text-muted);opacity:.7}\n.iui-field:hover:not(:disabled){border-color:color-mix(in srgb,var(--iui-text) 24%,var(--iui-border))}\n.iui-field:focus{border-color:var(--iui-info);box-shadow:0 0 0 3px color-mix(in srgb,var(--iui-info) 12%,transparent)}\n.iui-root textarea.iui-field{min-height:64px;padding:10px 14px;line-height:1.5;resize:vertical}\n.iui-root select.iui-field{padding-right:28px}\n.iui-check{min-height:24px;gap:9px;color:var(--iui-text);font-size:16px;line-height:24px}\n.iui-check input{width:20px;height:20px;flex:none;margin:0;accent-color:var(--iui-primary);cursor:pointer}\n.iui-radio-group{gap:12px 16px}\n.iui-radio-group.vertical{gap:8px}\n.iui-slider{display:block;width:100%;height:24px;margin:0;accent-color:var(--iui-primary);cursor:pointer}\n.iui-slider::-webkit-slider-runnable-track{height:8px;border-radius:999px;background:var(--iui-surface-tertiary)}\n.iui-slider::-webkit-slider-thumb{\n  appearance:none;width:20px;height:20px;margin-top:-6px;border:1px solid var(--iui-border);\n  border-radius:50%;background:var(--iui-surface);box-shadow:0 1px 3px #0000001c\n}\n.iui-slider:focus-visible{outline:2px solid var(--iui-info);outline-offset:3px;border-radius:999px}\n\n/* Buttons and selectable rows use quiet surfaces with a visible keyboard ring. */\n.iui-button{\n  display:inline-flex;align-items:center;justify-content:center;min-height:36px;max-width:100%;\n  padding:7px 16px;border:1px solid var(--iui-primary);border-radius:999px;\n  background:var(--iui-primary);color:var(--iui-surface);\n  font-size:14px;line-height:20px;font-weight:500;text-align:center;cursor:pointer;\n  transition:background-color .15s ease,border-color .15s ease,box-shadow .15s ease\n}\n.iui-button:hover:not(:disabled){filter:none;background:color-mix(in srgb,var(--iui-primary) 84%,var(--iui-surface))}\n.iui-button.iui-outline{border-color:var(--iui-border);background:var(--iui-surface);color:var(--iui-text)}\n.iui-button.iui-outline:hover:not(:disabled){background:var(--iui-surface-muted);border-color:var(--iui-text-muted)}\n.iui-button.iui-ghost{border-color:transparent;background:transparent;color:var(--iui-text)}\n.iui-button.iui-ghost:hover:not(:disabled){background:var(--iui-surface-muted)}\n.iui-pressable{\n  max-width:100%;padding:8px;border:0;border-radius:8px;background:transparent;\n  color:var(--iui-text);font-size:inherit;line-height:inherit;font-weight:inherit;\n  text-align:inherit;cursor:pointer;transition:background-color .15s ease\n}\n.iui-pressable:hover:not(:disabled){background:var(--iui-surface-muted)}\n.iui-segments{max-width:100%;gap:2px;padding:3px;border:0;border-radius:999px;background:var(--iui-surface-muted)}\n.iui-segments button{\n  min-height:30px;padding:5px 12px;border:0;border-radius:999px;background:transparent;\n  color:var(--iui-text-muted);font-size:14px;line-height:20px;font-weight:500;cursor:pointer\n}\n.iui-segments button:hover:not(:disabled){color:var(--iui-text);background:color-mix(in srgb,var(--iui-surface) 55%,transparent)}\n.iui-segments button.active{color:var(--iui-text);background:var(--iui-surface);box-shadow:0 1px 3px #00000014}\n\n/* Data and overlays rely on borders and spacing instead of deep shadows. */\n.iui-table{max-width:100%;border-collapse:collapse;font-size:14px;line-height:20px}\n.iui-table-cell{padding:10px 12px;border-bottom:1px solid var(--iui-border);vertical-align:top}\n.iui-table-cell:first-child{padding-left:0}\n.iui-table-cell:last-child{padding-right:0}\n.iui-popover summary{border-radius:8px}\n.iui-popover-content{\n  margin-top:8px;padding:12px;border:1px solid var(--iui-border);\n  border-radius:var(--iui-radius);background:var(--iui-surface);box-shadow:var(--iui-shadow)\n}\n.iui-carousel>button,.iui-image-controls button{\n  display:grid;place-items:center;min-width:32px;height:32px;border:1px solid var(--iui-border);\n  border-radius:50%;background:var(--iui-surface);color:var(--iui-text);cursor:pointer\n}\n.iui-carousel>button:hover:not(:disabled),.iui-image-controls button:hover:not(:disabled){background:var(--iui-surface-muted)}\n.iui-legend{font-size:12px;line-height:1.4}\n.iui-axis-label{color:var(--iui-text-muted);font-size:12px}\n.iui-unavailable{\n  padding:12px 14px;border:1px dashed var(--iui-border);border-radius:10px;\n  background:var(--iui-surface-muted);color:var(--iui-text-muted);font-size:14px;line-height:1.5\n}\n\n/* Media preserves the restricted host behavior while sharing the same surface. */\n.iui-app-block{border-radius:var(--iui-radius);box-shadow:none}\n.iui-app-block-head{padding:14px 16px}\n.iui-app-block-head strong{font-size:14px;font-weight:600}\n.iui-app-block-head small{font-size:12px}\n.iui-app-block-actions button{min-height:30px;padding:5px 10px;border-radius:999px;font-size:12px;font-weight:500}\n.iui-app-block-status{padding:9px 16px;font-size:12px}\n.iui-app-block-empty{font-size:14px}\n.iui-async-image{border-color:var(--iui-border);border-radius:var(--iui-radius);background:var(--iui-surface-muted)}\n.iui-image-status{font-size:14px}\n.iui-image-group{gap:calc(var(--iui-spacing) * 2)}\n\n@container (max-width:520px){\n  .iui-grid,.iui-image-group{grid-template-columns:1fr!important}\n  .iui-row{flex-wrap:wrap}\n}\n@media(max-width:480px){\n  .iui-root{font-size:16px}\n  .iui-segments{flex-wrap:wrap;border-radius:16px}\n  .iui-segments button{flex:1 1 auto}\n}\n";

// packages/dsh-plugin/src/client.tsx
var import_jsx_runtime54 = require("react/jsx-runtime");
var inject = ["slots", "configForms"];
var namespace = "open-intelligent-ui";
function useMode(form) {
  const subscribe = (0, import_react8.useCallback)((listener) => form.subscribe(listener), [form]);
  const snapshot = (0, import_react8.useCallback)(() => form.getSnapshot(), [form]);
  return (0, import_react8.useSyncExternalStore)(subscribe, snapshot);
}
var labels = {
  code: { copyLabel: "Copy", copiedLabel: "Copied" },
  footnotes: "Footnotes"
};
var shadowStyles = `${styles_default}
:host{display:block;min-width:0}.iui-theme{min-height:0;background:transparent}.iui-root{white-space:normal}`;
function UiTarget({ index, onTarget }) {
  const ref2 = (0, import_react8.useRef)(null);
  (0, import_react8.useLayoutEffect)(() => {
    const host2 = ref2.current;
    if (!host2)
      return;
    const shadow = host2.shadowRoot ?? host2.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = shadowStyles;
    const target = document.createElement("div");
    shadow.append(style, target);
    onTarget(index, target);
    return () => {
      onTarget(index, null);
      style.remove();
      target.remove();
    };
  }, [index, onTarget]);
  return /* @__PURE__ */ (0, import_jsx_runtime54.jsx)("div", { ref: ref2, "data-iui-dsh-root": "" });
}
function useDshThemeMode() {
  const [mode, setMode] = (0, import_react8.useState)(() => document.body.hasAttribute("data-ds-dark-theme") ? "dark" : "light");
  (0, import_react8.useLayoutEffect)(() => {
    const observer = new MutationObserver(() => setMode(document.body.hasAttribute("data-ds-dark-theme") ? "dark" : "light"));
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-ds-dark-theme"] });
    return () => observer.disconnect();
  }, []);
  return mode;
}
function TextBlock({ text, messageId, streaming, enabled, cwd, attachments, loadImage }) {
  if (!enabled)
    return /* @__PURE__ */ (0, import_jsx_runtime54.jsx)(import_dsh_client_ui_primitives.MarkdownText, { text, streaming, labels });
  return /* @__PURE__ */ (0, import_jsx_runtime54.jsx)(IntelligentTextBlock, { text, messageId, streaming, cwd, attachments, loadImage });
}
function IntelligentTextBlock({ text, messageId, streaming, cwd, attachments, loadImage }) {
  const base = document.baseURI;
  const attachmentKey = attachments.map((attachment) => String(attachment.attachmentId)).join("");
  const adapter = (0, import_react8.useMemo)(
    () => createDshMediaAdapter({ base, cwd, messageId, attachments, loadImage }),
    [base, cwd, messageId, loadImage, attachmentKey]
  );
  const candidate = (0, import_react8.useMemo)(() => {
    try {
      return splitReply(text, messageId);
    } catch {
      return null;
    }
  }, [text, messageId]);
  const lastValid = (0, import_react8.useRef)(null);
  if (candidate)
    lastValid.current = { source: text, parsed: candidate };
  const parsed = candidate ?? (streaming && lastValid.current && text.startsWith(lastValid.current.source) ? lastValid.current.parsed : null);
  const runtime = (0, import_react8.useRef)(null);
  const [targets, setTargets] = (0, import_react8.useState)({});
  const mode = useDshThemeMode();
  const onTarget = (0, import_react8.useCallback)((index, target) => {
    setTargets((previous) => {
      if (previous[index] === target || !target && !(index in previous))
        return previous;
      const next = { ...previous };
      if (target)
        next[index] = target;
      else
        delete next[index];
      return next;
    });
  }, []);
  if (!parsed)
    return /* @__PURE__ */ (0, import_jsx_runtime54.jsx)(import_dsh_client_ui_primitives.MarkdownText, { text, streaming, labels });
  if (!runtime.current || runtime.current.document.messageId !== messageId) {
    runtime.current = new Runtime(parsed.document, adapter);
  } else {
    runtime.current.setAdapter(adapter);
    runtime.current.update(parsed.document);
  }
  const count = parsed.document.children.length;
  const ready = Array.from({ length: count }, (_, index) => targets[index]).every(Boolean);
  return /* @__PURE__ */ (0, import_jsx_runtime54.jsxs)(import_jsx_runtime54.Fragment, { children: [
    parsed.segments.map((segment, index) => segment.kind === "markdown" ? /* @__PURE__ */ (0, import_jsx_runtime54.jsx)(import_dsh_client_ui_primitives.MarkdownText, { text: segment.text, streaming, labels }, `md-${index}`) : /* @__PURE__ */ (0, import_jsx_runtime54.jsx)(UiTarget, { index: segment.index, onTarget }, `ui-${segment.index}`)),
    ready && /* @__PURE__ */ (0, import_jsx_runtime54.jsx)(UIRenderer, { runtime: runtime.current, targets: Array.from({ length: count }, (_, index) => targets[index]), themeMode: mode })
  ] });
}
function AssistantNode({ node, groupPart, renderMessageImages, loadImage, cwd, enabled }) {
  const { blocks, status } = node.data;
  const attachments = blocks.filter((block) => block.kind === "image").map((block) => block.attachment);
  const streaming = status === "running";
  const showReasoning = groupPart !== "response";
  const showResponse = groupPart !== "reasoning";
  return /* @__PURE__ */ (0, import_jsx_runtime54.jsxs)("div", { "data-iui-dsh-assistant": "", "data-streaming": streaming || void 0, children: [
    blocks.map((block, index) => {
      if (block.kind === "reasoning")
        return showReasoning && block.text.trim() ? /* @__PURE__ */ (0, import_jsx_runtime54.jsxs)("details", { "data-iui-dsh-reasoning": "", children: [
          /* @__PURE__ */ (0, import_jsx_runtime54.jsx)("summary", { children: "Thinking" }),
          /* @__PURE__ */ (0, import_jsx_runtime54.jsx)(import_dsh_client_ui_primitives.MarkdownText, { text: block.text, streaming, labels })
        ] }, index) : null;
      if (!showResponse)
        return null;
      if (block.kind === "text")
        return /* @__PURE__ */ (0, import_jsx_runtime54.jsx)(TextBlock, { text: block.text, messageId: `${node.key}:${index}`, streaming, enabled, cwd, attachments, loadImage }, index);
      if (block.kind === "image")
        return /* @__PURE__ */ (0, import_jsx_runtime54.jsx)(import_react8.default.Fragment, { children: renderMessageImages({ images: [{ attachment: block.attachment }], align: "start" }) }, index);
      if (block.kind === "tool-call")
        return null;
      return /* @__PURE__ */ (0, import_jsx_runtime54.jsx)("pre", { children: "Unsupported assistant content block" }, index);
    }),
    status === "interrupted" && showResponse && /* @__PURE__ */ (0, import_jsx_runtime54.jsx)("span", { "data-iui-dsh-interrupted": "", children: "Stopped" })
  ] });
}
function ModeButton({ form }) {
  const state = useMode(form);
  const enabled = state.status === "ready" && state.value?.enabled === true;
  const [pending, setPending] = (0, import_react8.useState)(false);
  const [error, setError] = (0, import_react8.useState)(false);
  const available = state.status === "ready" && state.writable && state.mode === "host";
  const toggle = async () => {
    if (!available || pending)
      return;
    setPending(true);
    setError(false);
    try {
      if (!await form.set("enabled", !enabled))
        setError(true);
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime54.jsx)(
    import_dsh_client_ui_primitives.Button,
    {
      type: "button",
      variant: "toolbar",
      size: "sm",
      "data-iui-dsh-toggle": "",
      "aria-label": "\u667A\u80FD UI",
      "aria-pressed": enabled,
      title: error ? "\u667A\u80FD UI \u8BBE\u7F6E\u4FDD\u5B58\u5931\u8D25" : enabled ? "\u667A\u80FD UI \u5DF2\u5F00\u542F" : "\u667A\u80FD UI \u5DF2\u5173\u95ED",
      disabled: !available || pending,
      onClick: () => {
        void toggle();
      },
      style: enabled ? { background: "var(--dsw-alias-state-business-tertiary)", color: "var(--dsw-alias-state-business-primary)" } : void 0,
      children: "\u667A\u80FD UI"
    }
  );
}
function apply(ctx) {
  const form = ctx.configForms.get(namespace);
  function AssistantWithMode(props) {
    const state = useMode(form);
    return /* @__PURE__ */ (0, import_jsx_runtime54.jsx)(AssistantNode, { ...props, enabled: state.status === "ready" && state.value?.enabled === true });
  }
  ctx.slots.inject("conversation.chat.node", () => ctx.slots.register({
    name: "conversation.chat.node",
    key: "assistant-step",
    locale: "chat"
  }, AssistantWithMode));
  ctx.slots.inject("conversation.input.left", () => ctx.slots.register({
    name: "conversation.input.left",
    id: "open-intelligent-ui",
    order: 30
  }, () => /* @__PURE__ */ (0, import_jsx_runtime54.jsx)(ModeButton, { form })));
}

    return module.exports;
  },
});
