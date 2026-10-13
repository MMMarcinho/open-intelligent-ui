import { normalizeSettings, validateUrlRule } from '../../services/extension-rules.js';

declare const chrome: any;
const prefix = 'iui-user-rule-';
const defaultHost = 'https://chat.deepseek.com/*';

async function syncRegistrations(): Promise<void> {
  const stored = await chrome.storage.local.get({ iuiSettings: null, enabled: true });
  const settings = normalizeSettings(stored.iuiSettings, stored.enabled);
  const current = await chrome.scripting.getRegisteredContentScripts();
  const ownIds = current.map((script: { id: string }) => script.id).filter((id: string) => id.startsWith(prefix));
  if (ownIds.length) await chrome.scripting.unregisterContentScripts({ ids: ownIds });
  if (!settings.enabled) return;
  const hostPatterns = new Set<string>();
  for (const rule of settings.rules) {
    const validated = validateUrlRule(rule.pattern, rule.adapterId);
    if (validated.ok && validated.hostPattern !== defaultHost) hostPatterns.add(validated.hostPattern);
  }
  let index = 0;
  for (const hostPattern of hostPatterns) {
    if (!await chrome.permissions.contains({ origins: [hostPattern] })) continue;
    if (hostPattern === 'file:///*' && !await chrome.extension.isAllowedFileSchemeAccess()) continue;
    try {
      await chrome.scripting.registerContentScripts([{
        id: `${prefix}${++index}`,
        matches: [hostPattern], js: ['content.js'], css: ['hidden.css'],
        runAt: 'document_idle', persistAcrossSessions: true,
      }]);
    } catch { /* A revoked or site-restricted grant must not broaden access. */ }
  }
}

let queue: Promise<void> = Promise.resolve();
const scheduleSync = () => {
  queue = queue.catch(() => undefined).then(syncRegistrations);
  return queue;
};
chrome.runtime.onInstalled.addListener(() => { void scheduleSync(); });
chrome.runtime.onStartup.addListener(() => { void scheduleSync(); });
chrome.storage.onChanged.addListener((changes: Record<string, unknown>, area: string) => {
  if (area === 'local' && (changes.iuiSettings || changes.enabled)) void scheduleSync();
});
chrome.permissions.onAdded.addListener(() => { void scheduleSync(); });
chrome.permissions.onRemoved.addListener(() => { void scheduleSync(); });
chrome.runtime.onMessage.addListener((message: { type?: string }, _sender: unknown, respond: (result: unknown) => void) => {
  if (message?.type !== 'iui-sync-rules') return;
  void scheduleSync().then(() => respond({ ok: true }), () => respond({ ok: false }));
  return true;
});
