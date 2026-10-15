/**
 * Widget 端受限表达式求值器。
 *
 * 设计约束(与协议 SafeEvaluator 同源):
 * - 无 eval / new Function / 模板编译,手写递归下降解析器。
 * - 允许:数字、字符串、标识符、点/方括号只读成员访问、四则运算、括号、一元负号、
 *   白名单函数调用(fmt / fmtK / fmtCny)。
 * - 拒绝:方法调用、constructor / __proto__ / prototype、未知标识符、赋值、new。
 *
 * 本模块所有导出函数均为纯函数、不引用模块级可变状态,因此编译器可以用
 * Function.prototype.toString() 把它们序列化后内联进 widget HTML,无需打包器。
 * 新增函数时请保持这一约束,并在注释中说明。
 */

export interface ExprToken { t: 'num' | 'str' | 'id' | 'op'; v: string | number }
export type ExprNode =
  | { k: 'num'; v: number }
  | { k: 'str'; v: string }
  | { k: 'bool'; v: boolean }
  | { k: 'id'; v: string }
  | { k: 'neg'; x: ExprNode }
  | { k: 'bin'; o: '+' | '-' | '*' | '/'; l: ExprNode; r: ExprNode }
  | { k: 'mem'; o: ExprNode; p: ExprNode }
  | { k: 'call'; f: string; args: ExprNode[] };

export function tokenize(src: string): ExprToken[] {
  const toks: ExprToken[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') { i++; continue; }
    if ((c >= '0' && c <= '9') || (c === '.' && src[i + 1] >= '0' && src[i + 1] <= '9')) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      toks.push({ t: 'num', v: parseFloat(src.slice(i, j)) }); i = j; continue;
    }
    if (c === '"' || c === "'") {
      const q = c; let k = i + 1; let s = '';
      while (k < src.length && src[k] !== q) {
        if (src[k] !== '\\') { s += src[k++]; continue; }
        k++;
        if (k >= src.length) throw new Error('unterminated escape');
        const escape = src[k++];
        const simple: Record<string, string> = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', v: '\v', '0': '\0' };
        if (Object.prototype.hasOwnProperty.call(simple, escape)) s += simple[escape];
        else if (escape === 'u' || escape === 'x') {
          const size = escape === 'u' ? 4 : 2;
          const digits = src.slice(k, k + size);
          if (digits.length !== size || !/^[0-9a-f]+$/i.test(digits)) throw new Error('bad escape');
          s += String.fromCharCode(parseInt(digits, 16)); k += size;
        } else if (escape === '\n') { /* line continuation */ }
        else if (escape === '\r') { if (src[k] === '\n') k++; }
        else s += escape;
      }
      if (src[k] !== q) throw new Error('unterminated string');
      toks.push({ t: 'str', v: s }); i = k + 1; continue;
    }
    if (/[A-Za-z_$]/.test(c)) {
      let m = i;
      while (m < src.length && /[A-Za-z0-9_$]/.test(src[m])) m++;
      toks.push({ t: 'id', v: src.slice(i, m) }); i = m; continue;
    }
    if ('+-*/().[],'.indexOf(c) >= 0) { toks.push({ t: 'op', v: c }); i++; continue; }
    throw new Error('bad char: ' + c);
  }
  return toks;
}

export function parseExpr(src: string): ExprNode {
  const toks = tokenize(src);
  let pos = 0;
  const peek = (): ExprToken | undefined => toks[pos];
  const eat = (v?: string): ExprToken => {
    const t = toks[pos];
    if (!t || (v && t.v !== v)) throw new Error('unexpected token');
    pos++; return t;
  };
  const expr = (): ExprNode => {
    let n = term();
    while (peek() && peek()!.t === 'op' && (peek()!.v === '+' || peek()!.v === '-')) {
      const o = eat().v as '+' | '-'; n = { k: 'bin', o, l: n, r: term() };
    }
    return n;
  };
  const term = (): ExprNode => {
    let n = factor();
    while (peek() && peek()!.t === 'op' && (peek()!.v === '*' || peek()!.v === '/')) {
      const o = eat().v as '*' | '/'; n = { k: 'bin', o, l: n, r: factor() };
    }
    return n;
  };
  const factor = (): ExprNode => {
    if (peek() && peek()!.t === 'op' && peek()!.v === '-') { eat('-'); return { k: 'neg', x: factor() }; }
    return primary();
  };
  const primary = (): ExprNode => {
    const t = peek(); if (!t) throw new Error('eof');
    if (t.t === 'num') { eat(); return { k: 'num', v: t.v as number }; }
    if (t.t === 'str') { eat(); return { k: 'str', v: t.v as string }; }
    if (t.t === 'op' && t.v === '(') { eat('('); const n = expr(); eat(')'); return n; }
    if (t.t === 'id') {
      if (t.v === 'true' || t.v === 'false') { eat(); return { k: 'bool', v: t.v === 'true' }; }
      eat(); let node: ExprNode = { k: 'id', v: t.v as string };
      for (;;) {
        const p = peek();
        if (p && p.t === 'op' && p.v === '.') {
          eat('.'); const f = eat();
          if (f.t !== 'id') throw new Error('bad prop');
          node = { k: 'mem', o: node, p: { k: 'str', v: f.v as string } };
        } else if (p && p.t === 'op' && p.v === '[') {
          eat('['); const ix = expr(); eat(']'); node = { k: 'mem', o: node, p: ix };
        } else break;
      }
      if (peek() && peek()!.t === 'op' && peek()!.v === '(') {
        if (node.k !== 'id') throw new Error('method calls blocked');
        eat('('); const args: ExprNode[] = [];
        if (!(peek() && peek()!.t === 'op' && peek()!.v === ')')) {
          args.push(expr());
          while (peek() && peek()!.t === 'op' && peek()!.v === ',') { eat(','); args.push(expr()); }
        }
        eat(')');
        return { k: 'call', f: (node as { v: string }).v, args };
      }
      return node;
    }
    throw new Error('unexpected token');
  };
  const n = expr();
  if (pos !== toks.length) throw new Error('trailing tokens');
  return n;
}

export function evalNode(n: ExprNode | null | undefined, scope: Record<string, unknown>): unknown {
  if (!n) throw new Error('null ast');
  switch (n.k) {
    case 'num': case 'str': case 'bool': return n.v;
    case 'id':
      if (!(n.v in scope)) throw new Error('unknown ident: ' + n.v);
      return scope[n.v];
    case 'neg': return -(evalNode(n.x, scope) as number);
    case 'bin': {
      const l = evalNode(n.l, scope) as number, r = evalNode(n.r, scope) as number;
      return n.o === '+' ? l + r : n.o === '-' ? l - r : n.o === '*' ? l * r : l / r;
    }
    case 'mem': {
      const o = evalNode(n.o, scope) as Record<string, unknown> | null | undefined;
      const p = evalNode(n.p, scope) as string;
      if (o === null || o === undefined) throw new Error('null base');
      if (p === 'constructor' || p === '__proto__' || p === 'prototype') throw new Error('blocked prop');
      return o[p];
    }
    case 'call': {
      const allowed = ['fmt', 'fmtK', 'fmtCny'];
      if (allowed.indexOf(n.f) < 0) throw new Error('blocked call: ' + n.f);
      const fn = scope[n.f];
      if (typeof fn !== 'function') throw new Error('not a fn: ' + n.f);
      return (fn as (...a: unknown[]) => unknown).apply(null, n.args.map(a => evalNode(a, scope)));
    }
  }
}

/* ---- 格式化辅助(同样可序列化) ---- */
export function trimNum(v: number, dp?: number): string {
  let s = v.toFixed(dp === undefined ? 2 : dp);
  if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s;
}

export function fmt(v: unknown): string {
  if (typeof v !== 'number' || !isFinite(v)) return '–';
  if (v === 0) return '$0';
  if (v >= 1000) return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (v >= 1) return '$' + v.toFixed(2);
  let s = v.toFixed(4).replace(/0+$/, '');
  if (s.charAt(s.length - 1) === '.') s += '00';
  else if (/\.\d$/.test(s)) s += '0';
  return '$' + s;
}

export function fmtK(k: unknown): string {
  if (typeof k !== 'number' || !isFinite(k)) return '–';
  if (k >= 1000) return trimNum(k / 1000) + 'M';
  return trimNum(k, k % 1 === 0 ? 0 : 1) + 'K';
}

export function fmtCny(v: unknown): string {
  if (typeof v !== 'number' || !isFinite(v)) return '–';
  return '¥' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** 编译器用:把求值器函数序列化为可内联进 widget 的源码。 */
export function serializeEvaluator(): string {
  const source = [tokenize, parseExpr, evalNode, trimNum, fmt, fmtK, fmtCny]
    .map(f => f.toString())
    .join('\n');
  // tsx/esbuild keepNames can insert module-local __name (or __name2, etc.)
  // helpers into nested functions. Only inspect our own trusted function source,
  // never DSL input. Naming has no semantic role in the widget evaluator.
  const helpers = [...new Set(source.match(/\b__name\d*\b/g) || [])]
    .map(name => `function ${name}(fn) { return fn; }`).join('\n');
  return helpers + '\n' + source;
}
