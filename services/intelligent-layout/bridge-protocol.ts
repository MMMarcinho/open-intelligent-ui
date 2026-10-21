import type { PreparedLayout } from './envelope.js';
export const controlEvent = 'oiui:layout:control:v1';
export const statusEvent = 'oiui:layout:status:v1';
export type SendIntent = {
  attemptId: string; route: string; enabled: boolean; operation: 'send' | 'edit';
  prepared: PreparedLayout;
  /** A previously verified local envelope copied into an edit box; never inferred by regex. */
  alias?: string;
};
export type BridgeCommand = { channel: string } & (
  | { kind: 'hello' | 'heartbeat' | 'clear' | 'stop' }
  | { kind: 'arm'; intent: SendIntent }
);
export type BridgeStatus = { channel: string } & (
  | { kind: 'ready'; available: boolean; protocol?: number; rulesDigest?: string; contract?: string; reason?: string }
  | { kind: 'sending' | 'accepted' | 'failed' | 'unsupported'; attemptId: string; reason?: string }
);
export type WithoutChannel<T> = T extends unknown ? Omit<T, 'channel'> : never;
export function parseBridgeMessage<T>(event: Event): T | null {
  const detail = (event as CustomEvent).detail;
  // Prepared + original + optional edit alias, including JSON escaped control characters.
  if (typeof detail !== 'string' || detail.length > 4_000_000) return null;
  try { return JSON.parse(detail) as T; } catch { return null; }
}
