import type { SiteAdapter, SiteMessage } from '../site-adapter.js';

const messageSelector = '.ds-message';
const answerSelector = ':scope > .ds-markdown.ds-assistant-message-main-content';
const blockTags = new Set(['P', 'DIV', 'SECTION', 'ARTICLE', 'UL', 'OL', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE']);

/** Read rendered text nodes, never HTML markup or source attributes. DOM text already decodes entities. */
export function readDeepSeekReply(body: Element): string {
  const out: string[] = [];
  const line = () => { if (out.length && !out.at(-1)?.endsWith('\n')) out.push('\n'); };
  const walk = (node: Node): void => {
    if (node.nodeType === 3) { out.push(node.nodeValue ?? ''); return; }
    if (node.nodeType !== 1) return;
    const element = node as Element;
    if (element.closest('[data-iui-preview]')) return;
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'BUTTON', 'SVG'].includes(element.tagName)) return;
    if (element.tagName === 'BR') { out.push('\n'); return; }
    const isBlockCode = element.tagName === 'PRE' || element.classList.contains('ds-markdown-code-block');
    if (isBlockCode) {
      line(); out.push('```\n', element.textContent ?? '', '\n```\n');
      return;
    }
    if (element.tagName === 'CODE') {
      out.push('`', element.textContent ?? '', '`');
      return;
    }
    const block = blockTags.has(element.tagName);
    // DeepSeek's Markdown pass consumes paired * markers inside DSL expressions.
    // Restore source punctuation rather than concatenating emphasis text.
    const marker = element.tagName === 'EM' ? '*' : element.tagName === 'STRONG' ? '**' : '';
    if (block) line();
    if (marker) out.push(marker);
    for (const child of element.childNodes) walk(child);
    if (marker) out.push(marker);
    if (block) line();
  };
  for (const child of body.childNodes) walk(child);
  return out.join('').replace(/\r\n?/g, '\n').replace(/\u00a0/g, ' ').trim();
}

/** Snapshot evidence: assistant body is a direct child; thinking and user text use separate containers. */
export class DeepSeekAdapter implements SiteAdapter {
  readonly siteId = 'deepseek';
  private readonly ids = new WeakMap<Element, string>();
  private nextId = 0;
  matches(url: URL): boolean { return url.protocol === 'https:' && url.hostname === 'chat.deepseek.com'; }
  findMessages(document: Document): Iterable<Element> { return document.querySelectorAll(messageSelector); }
  readMessage(element: Element, url: URL): SiteMessage | null {
    if (!element.matches(messageSelector)) return null;
    const answer = element.querySelector(answerSelector);
    if (!answer) return null;
    // The saved protocol starts in a paragraph and continues in a direct
    // .ds-markdown-html span. Treat the complete assistant body as one source.
    const body = answer;
    let identity = this.ids.get(element);
    if (!identity) { identity = `${this.siteId}-${++this.nextId}`; this.ids.set(element, identity); }
    return {
      element, body, identity, conversationId: `${url.pathname}${url.search}`,
      text: readDeepSeekReply(body),
      // The saved page provides neither a reliable message ID nor a completion signal.
      stream: 'unknown',
    };
  }
}
