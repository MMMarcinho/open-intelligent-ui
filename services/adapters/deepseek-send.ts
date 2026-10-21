import type { SendIntent } from '../intelligent-layout/bridge-protocol.js';

export const deepSeekOrigin = 'https://chat.deepseek.com';
/** Revalidated for every matching request; asset filenames do not establish an API contract. */
export const deepSeekRequestContract = 'deepseek-prompt-json-v1' as const;
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const identifier = (v: unknown) => typeof v === 'string' && v.length > 0 && v.length <= 256 || typeof v === 'number' && Number.isSafeInteger(v) && v >= 0;
export function deepSeekSendPath(url: string, base: string): string | null {
  try {
    const u = new URL(url, base);
    return u.origin === deepSeekOrigin && !u.search && !u.hash && ['/api/v0/chat/completion','/api/v0/chat/edit_message'].includes(u.pathname) ? u.pathname : null;
  } catch { return null; }
}
export function isNewSessionNavigation(from: string, to: string): boolean {
  try { const a = new URL(from), b = new URL(to); return a.origin === deepSeekOrigin && b.origin === a.origin && a.pathname === '/' && /^\/a\/chat\/[^/]+$/.test(b.pathname); } catch { return false; }
}
export type Rewrite = { kind: 'ignored' } | { kind: 'unsupported'; reason: string } | { kind: 'matched'; body: string };
/** Only the two observed POST JSON contracts may change; all non-prompt fields survive verbatim as values. */
export function rewriteDeepSeekSend(method: string, url: string, body: unknown, intent: SendIntent, currentUrl: string): Rewrite {
  const path = deepSeekSendPath(url, currentUrl);
  if (method.toUpperCase() !== 'POST' || !path) return { kind: 'ignored' };
  if (path !== (intent.operation === 'edit' ? '/api/v0/chat/edit_message' : '/api/v0/chat/completion')) return { kind: 'ignored' };
  if (intent.route !== currentUrl && !isNewSessionNavigation(intent.route, currentUrl)) return { kind: 'ignored' };
  if (typeof body !== 'string' || body.length > 2_000_000) return { kind: 'unsupported', reason: '发送正文格式未验证，本条未附加规则' };
  let data: unknown;
  try { data = JSON.parse(body); } catch { return { kind: 'unsupported', reason: '发送正文不是已验证的 JSON 格式' }; }
  if (!record(data) || typeof data.prompt !== 'string' || !identifier(data.chat_session_id) ||
      !Array.isArray(data.ref_file_ids) || !data.ref_file_ids.every(identifier) ||
      typeof data.thinking_enabled !== 'boolean' || typeof data.search_enabled !== 'boolean' ||
      (path.endsWith('/completion') ? !(data.parent_message_id === null || identifier(data.parent_message_id)) || typeof data.model_type !== 'string' : !identifier(data.message_id))) {
    return { kind: 'unsupported', reason: 'DeepSeek 发送字段已变化，本条未附加规则' };
  }
  const { prepared } = intent;
  if (![prepared.original, prepared.wrapped, intent.alias].includes(data.prompt)) return { kind: 'unsupported', reason: '发送正文与本条草稿不一致，未附加规则' };
  const prompt = intent.enabled ? prepared.wrapped : prepared.original;
  return { kind: 'matched', body: data.prompt === prompt ? body : JSON.stringify({ ...data, prompt }) };
}

/** Observe SSE without consuming, replacing, or delaying the host's stream. */
export class DeepSeekReadyProbe {
  private offset = 0;
  private buffer = '';
  accepted = false;
  update(text: string): boolean {
    if (this.accepted || text.length < this.offset || this.offset > 131_072) return this.accepted;
    this.buffer += text.slice(this.offset); this.offset = text.length;
    this.buffer = this.buffer.replace(/\r\n/g,'\n');
    let end: number;
    while ((end = this.buffer.indexOf('\n\n')) >= 0) {
      const frame = this.buffer.slice(0, end); this.buffer = this.buffer.slice(end + 2);
      const lines = frame.split('\n');
      const event = lines.find(line => line.startsWith('event:'))?.slice(6).trim();
      if (event !== 'ready') continue;
      const data = lines.filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
      try { const parsed = JSON.parse(data); if (record(parsed) && identifier(parsed.request_message_id) && identifier(parsed.response_message_id)) this.accepted = true; } catch { /* Incomplete or unsupported ready frames are not success. */ }
    }
    if (this.buffer.length > 131_072) this.buffer = '';
    return this.accepted;
  }
}
