import { sha256 } from './checksum.js';

export const layoutVersion = 1;
export const provenanceStorageKey = 'iuiLayoutProvenanceV1';
export type Provenance = { version: 1; id: string; digest: string; createdAt: number };
export type PreparedLayout = { id: string; original: string; wrapped: string; digest: string };
export type RecognizedLayout = PreparedLayout & { suffix: string; rules: string };
const idPattern = /^[a-f0-9]{32}$/;
const digestPattern = /^[a-f0-9]{64}$/;
const prefix = '\n\n[OIUI Chrome intelligent-layout v1 ';
export const maximumPromptLength = 200_000;

export function randomLayoutId(crypto: Pick<Crypto, 'getRandomValues'>): string {
  return [...crypto.getRandomValues(new Uint8Array(16))].map(v => v.toString(16).padStart(2,'0')).join('');
}

/** Exact versioned transport suffix around the existing IUI prompt, not a new UI DSL. */
export class LayoutEnvelope {
  readonly rulesDigest: string;
  constructor(readonly rules: string) { this.rulesDigest = sha256(rules); }
  prepare(original: string, id: string): PreparedLayout {
    if (!idPattern.test(id) || original.length > maximumPromptLength) throw new Error('Invalid layout envelope input');
    const wrapped = `${original}${prefix}${id} ${original.length} ${this.rulesDigest}]\n${this.rules}\n[/OIUI Chrome intelligent-layout v1 ${id}]`;
    return { id, original, wrapped, digest: sha256(wrapped) };
  }
  validatePrepared(value: unknown): value is PreparedLayout {
    if (!value || typeof value !== 'object') return false;
    const p = value as PreparedLayout;
    if (typeof p.original !== 'string' || typeof p.id !== 'string' || !idPattern.test(p.id) || p.original.length > maximumPromptLength) return false;
    const expected = this.prepare(p.original, p.id);
    return expected.wrapped === p.wrapped && expected.digest === p.digest;
  }
  recognize(text: string, records: ReadonlyMap<string, Provenance>): RecognizedLayout | null {
    if (text.length > maximumPromptLength + this.rules.length + 400) return null;
    const start = text.lastIndexOf(prefix);
    if (start < 0 || start > maximumPromptLength) return null;
    const headerEnd = text.indexOf('\n', start + prefix.length);
    if (headerEnd < 0) return null;
    const header = text.slice(start + prefix.length, headerEnd);
    const match = /^([a-f0-9]{32}) (0|[1-9]\d{0,5}) ([a-f0-9]{64})\]$/.exec(header);
    if (!match || Number(match[2]) !== start || match[3] !== this.rulesDigest) return null;
    const record = records.get(match[1]);
    if (!record || record.version !== layoutVersion) return null;
    const prepared = this.prepare(text.slice(0, start), match[1]);
    // Both the locally recorded complete-content checksum and exact reconstruction must agree.
    if (prepared.wrapped !== text || prepared.digest !== record.digest) return null;
    return { ...prepared, suffix: text.slice(start), rules: this.rules };
  }
}

/** Stores opaque IDs and checksums only, never the user's prompt or attached rules. */
export function readProvenance(value: unknown): Map<string, Provenance> {
  const records = new Map<string, Provenance>();
  if (!Array.isArray(value)) return records;
  for (const item of value.slice(-500)) {
    if (!item || typeof item !== 'object') continue;
    const p = item as Provenance;
    if (p.version === 1 && typeof p.id === 'string' && typeof p.digest === 'string' && idPattern.test(p.id) && digestPattern.test(p.digest) && Number.isFinite(p.createdAt)) records.set(p.id, p);
  }
  return records;
}
export function rememberPrepared(records: Map<string, Provenance>, p: PreparedLayout, now = Date.now()): void {
  records.delete(p.id);
  records.set(p.id, { version: 1, id: p.id, digest: p.digest, createdAt: now });
  while (records.size > 500) records.delete(records.keys().next().value!);
}
