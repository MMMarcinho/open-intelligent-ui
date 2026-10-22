import { DEFAULT_SETTINGS, normalizeSettings, selectPageAdapter, urlMatchesPattern, validateUrlRule, type ExtensionSettings } from '../../services/extension-rules.js';

import { updateExtensionEnabled } from '../../services/extension-mode.js';
export {};
declare const chrome: any;

const toggle = document.querySelector<HTMLInputElement>('#enabled')!;
const pageStatus = document.querySelector<HTMLElement>('#page-status')!;
const notice = document.querySelector<HTMLElement>('#notice')!;
const openSettings = document.querySelector<HTMLButtonElement>('#open-settings')!;
let settings: ExtensionSettings = { ...DEFAULT_SETTINGS, rules: [] };

const setPageStatus = (message: string, tone: 'neutral' | 'success' | 'warning' = 'neutral') => {
  pageStatus.textContent = message;
  pageStatus.dataset.tone = tone;
};
const showError = (message: string) => { notice.textContent = message; notice.hidden = !message; };

async function refreshPageStatus(): Promise<void> {
  if (!settings.enabled) { setPageStatus('已暂停'); return; }
  let tab: { id?: number; url?: string } | undefined;
  try { tab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0]; }
  catch { setPageStatus('无法检查', 'warning'); return; }
  if (!tab?.id || !tab.url) { setPageStatus('无法检查', 'warning'); return; }
  let url: URL;
  try { url = new URL(tab.url); }
  catch { setPageStatus('无法检查', 'warning'); return; }
  const adapter = selectPageAdapter(url, settings);
  if (!adapter) { setPageStatus('不在展示范围'); return; }

  // A saved custom rule can outlive its optional permission. Do not call it active.
  const rule = [...settings.rules].reverse().find(item => urlMatchesPattern(url, item.pattern));
  if (rule) {
    const validated = validateUrlRule(rule.pattern, rule.adapterId);
    if (validated.ok) {
      try {
        if (!await chrome.permissions.contains({ origins: [validated.hostPattern] })) {
          setPageStatus('需要站点权限', 'warning'); return;
        }
        if (url.protocol === 'file:' && !await chrome.extension.isAllowedFileSchemeAccess()) {
          setPageStatus('需要文件访问权限', 'warning'); return;
        }
      } catch { setPageStatus('权限待确认', 'warning'); return; }
    }
  }
  try {
    const status = await chrome.tabs.sendMessage(tab.id, { type: 'iui-status' }) as { enabled?: boolean; siteId?: string | null; injection?: {available?:boolean} | null };
    const injectionUnavailable = status.enabled && status.siteId === adapter && status.injection?.available === false;
    setPageStatus(injectionUnavailable ? '已开启，发送桥未就绪' : status.enabled && status.siteId === adapter ? '已启用' : '等待页面加载', !injectionUnavailable && status.enabled && status.siteId === adapter ? 'success' : 'warning');
  } catch { setPageStatus('已配置，刷新后生效', 'warning'); }
}

async function loadSettings(): Promise<void> {
  const stored = await chrome.storage.local.get({ iuiSettings: null, enabled: true });
  settings = normalizeSettings(stored.iuiSettings, stored.enabled);
  toggle.checked = settings.enabled;
  toggle.disabled = false;
  await refreshPageStatus();
}

toggle.addEventListener('change', () => {
  void (async () => {
    const desired = toggle.checked;
    toggle.disabled = true;
    showError('');
    try {
      // Read again before writing so this quick switch preserves edits made in Options.
      const next = await updateExtensionEnabled(chrome.storage.local, desired);
      settings = next;
      try {
        const tab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
        if (tab?.id) await chrome.tabs.sendMessage(tab.id, { type: 'iui-reload-settings' });
      } catch { /* The active tab may not host a content script. */ }
      await refreshPageStatus();
    } catch (error) {
      toggle.checked = settings.enabled;
      showError(`保存失败：${String(error)}`);
    } finally { toggle.disabled = false; }
  })();
});

openSettings.addEventListener('click', () => {
  void chrome.runtime.openOptionsPage().catch((error: unknown) => showError(`无法打开设置：${String(error)}`));
});
chrome.storage.onChanged.addListener((changes: Record<string, unknown>, area: string) => {
  if (area === 'local' && (changes.iuiSettings || changes.enabled)) void loadSettings();
});
void loadSettings().catch((error: unknown) => {
  setPageStatus('设置读取失败', 'warning');
  showError(String(error));
});
