import { ADAPTER_OPTIONS, DEFAULT_SETTINGS, normalizeSettings, selectPageAdapter, validateUrlRule, type ExtensionSettings } from '../../services/extension-rules.js';

export {};
declare const chrome: any;
const toggle = document.querySelector<HTMLInputElement>('#enabled')!;
const defaultToggle = document.querySelector<HTMLInputElement>('#default-deepseek')!;
const statusElement = document.querySelector<HTMLElement>('#status')!;
const rulesElement = document.querySelector<HTMLElement>('#rules')!;
const form = document.querySelector<HTMLFormElement>('#add-rule')!;
const patternInput = document.querySelector<HTMLInputElement>('#pattern')!;
const adapterInput = document.querySelector<HTMLSelectElement>('#adapter')!;
const notice = document.querySelector<HTMLElement>('#notice')!;
const versionElement = document.querySelector<HTMLElement>('#build-version')!;
versionElement.textContent = `v${chrome.runtime.getManifest?.().version ?? 'dev'} · stream`;
let settings: ExtensionSettings = { ...DEFAULT_SETTINGS, rules: [] };
form.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled = true;
toggle.disabled = true;
defaultToggle.disabled = true;

const inform = (message: string) => { notice.textContent = message; };
async function activeTab(): Promise<{ id?: number; url?: string } | null> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true }) as { id?: number; url?: string }[];
  return tabs[0] ?? null;
}
async function fileAccessAllowed(): Promise<boolean> {
  try { return await chrome.extension.isAllowedFileSchemeAccess(); } catch { return false; }
}
function renderRules(): void {
  rulesElement.replaceChildren();
  if (!settings.rules.length) {
    const empty = document.createElement('p'); empty.className = 'empty'; empty.textContent = '尚无自定义规则。'; rulesElement.append(empty);
  }
  for (const rule of settings.rules) {
    const row = document.createElement('div'); row.className = 'rule';
    const details = document.createElement('div');
    const pattern = document.createElement('strong'); pattern.textContent = rule.pattern;
    const adapter = document.createElement('small'); adapter.textContent = ADAPTER_OPTIONS.find(option => option.id === rule.adapterId)?.label ?? rule.adapterId;
    details.append(pattern, adapter);
    const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = '移除';
    remove.addEventListener('click', () => {
      settings.rules = settings.rules.filter(item => item.id !== rule.id);
      void saveSettings();
    });
    row.append(details, remove); rulesElement.append(row);
  }
  toggle.checked = settings.enabled;
  defaultToggle.checked = settings.defaultDeepSeek;
}
async function refreshStatus(): Promise<void> {
  const tab = await activeTab();
  if (!tab?.id || !tab.url) { statusElement.textContent = '无法读取当前标签页 URL；请在目标页面打开扩展。'; return; }
  let url: URL;
  try { url = new URL(tab.url); } catch { statusElement.textContent = '当前页面 URL 无效。'; return; }
  if (!settings.enabled) { statusElement.textContent = '总开关已关闭；原文可见。'; return; }
  const adapter = selectPageAdapter(url, settings);
  if (!adapter) { statusElement.textContent = '当前页面未命中任何规则，未读取回复。'; return; }
  if (url.protocol === 'file:' && !await fileAccessAllowed()) {
    statusElement.textContent = '文件规则已配置；请在扩展详情手动打开“允许访问文件网址”并刷新页面。'; return;
  }
  try {
    const result = await chrome.tabs.sendMessage(tab.id, { type: 'iui-status' }) as { rendered: number; siteId: string | null };
    statusElement.textContent = `${adapter} 适配器：已渲染 ${result.rendered} 条有效回复。`;
  } catch { statusElement.textContent = '规则已配置；请刷新页面以启用渲染。'; }
}
async function syncAndInject(): Promise<void> {
  try { await chrome.runtime.sendMessage({ type: 'iui-sync-rules' }); } catch { /* Storage listener also schedules sync. */ }
  const tab = await activeTab();
  if (!tab?.id || !tab.url || !settings.enabled) return;
  let url: URL;
  try { url = new URL(tab.url); } catch { return; }
  if (!selectPageAdapter(url, settings)) return;
  if (url.protocol === 'file:' && !await fileAccessAllowed()) return;
  try {
    await chrome.tabs.sendMessage(tab.id, { type: 'iui-reload-settings' });
    return; // A registered or static content script already owns this tab.
  } catch { /* An existing custom-rule tab may need its first injection. */ }
  try {
    await chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ['hidden.css'] });
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
    await chrome.tabs.sendMessage(tab.id, { type: 'iui-reload-settings' });
  } catch { /* Chrome may withhold site access; refreshStatus explains the reload path. */ }
}
async function saveSettings(): Promise<void> {
  await chrome.storage.local.set({ iuiSettings: { ...settings, rules: [...settings.rules] } });
  renderRules();
  await syncAndInject();
  await refreshStatus();
}

toggle.addEventListener('change', () => { settings.enabled = toggle.checked; void saveSettings(); });
defaultToggle.addEventListener('change', () => { settings.defaultDeepSeek = defaultToggle.checked; void saveSettings(); });
form.addEventListener('submit', event => {
  event.preventDefault();
  const validated = validateUrlRule(patternInput.value, adapterInput.value);
  if (!validated.ok) { inform(validated.error); return; }
  // Request exactly this origin from a direct user gesture. Chrome owns the prompt.
  void (async () => {
    try {
      if (validated.hostPattern !== 'https://chat.deepseek.com/*') {
        const granted = await chrome.permissions.request({ origins: [validated.hostPattern] });
        if (!granted) { inform('Chrome 未授予该站点权限；规则未添加。'); return; }
      }
      settings.rules.push({ id: `r_${crypto.randomUUID()}`, pattern: validated.pattern, adapterId: validated.adapterId });
      await saveSettings();
      patternInput.value = '';
      inform(validated.hostPattern === 'file:///*' && !await fileAccessAllowed()
        ? '规则已保存。请在扩展详情手动开启“允许访问文件网址”，然后刷新文件页。'
        : '规则已保存；当前页面若未更新，请刷新。');
    } catch (error) { inform(`规则未保存：${String(error)}`); }
  })();
});

void chrome.storage.local.get({ iuiSettings: null, enabled: true }).then(async (stored: { iuiSettings?: unknown; enabled?: unknown }) => {
  settings = normalizeSettings(stored.iuiSettings, stored.enabled);
  form.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled = false;
  toggle.disabled = false;
  defaultToggle.disabled = false;
  renderRules();
  await syncAndInject();
  await refreshStatus();
});
