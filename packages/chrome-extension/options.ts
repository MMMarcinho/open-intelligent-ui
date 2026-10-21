import { ADAPTER_OPTIONS, DEFAULT_SETTINGS, normalizeSettings, validateUrlRule, type ExtensionSettings } from '../../services/extension-rules.js';

export {};
declare const chrome: any;
const toggle = document.querySelector<HTMLInputElement>('#enabled')!;
const defaultToggle = document.querySelector<HTMLInputElement>('#default-deepseek')!;
const rulesElement = document.querySelector<HTMLElement>('#rules')!;
const form = document.querySelector<HTMLFormElement>('#add-rule')!;
const patternInput = document.querySelector<HTMLInputElement>('#pattern')!;
const adapterInput = document.querySelector<HTMLSelectElement>('#adapter')!;
const notice = document.querySelector<HTMLElement>('#notice')!;
const versionElement = document.querySelector<HTMLElement>('#build-version')!;
const ruleCount = document.querySelector<HTMLElement>('#rule-count')!;
const formTitle = document.querySelector<HTMLElement>('#form-title')!;
const submitRule = document.querySelector<HTMLButtonElement>('#submit-rule')!;
const cancelEdit = document.querySelector<HTMLButtonElement>('#cancel-edit')!;
versionElement.textContent = `v${chrome.runtime.getManifest?.().version ?? 'dev'} · stream`;
let settings: ExtensionSettings = { ...DEFAULT_SETTINGS, rules: [] };
let persistedSettings: ExtensionSettings = { ...DEFAULT_SETTINGS, rules: [] };
let editingRuleId: string | null = null;
submitRule.disabled = true;
toggle.disabled = true;
defaultToggle.disabled = true;

const copySettings = (value: ExtensionSettings): ExtensionSettings => ({ ...value, rules: [...value.rules] });
const inform = (message: string, tone: 'neutral' | 'success' | 'warning' | 'error' = 'neutral') => {
  notice.textContent = message;
  notice.dataset.tone = tone;
  notice.hidden = !message;
};
function cancelEditing(): void {
  editingRuleId = null;
  formTitle.textContent = '添加页面规则';
  submitRule.textContent = '添加规则';
  cancelEdit.hidden = true;
  patternInput.value = '';
  adapterInput.value = 'deepseek';
}
async function fileAccessAllowed(): Promise<boolean> {
  try { return await chrome.extension.isAllowedFileSchemeAccess(); } catch { return false; }
}
function renderRules(): void {
  rulesElement.replaceChildren();
  ruleCount.textContent = `${settings.rules.length} 条规则`;
  if (!settings.rules.length) {
    const empty = document.createElement('p'); empty.className = 'empty'; empty.textContent = '暂无规则。可添加保存页或本地回放地址。'; rulesElement.append(empty);
  }
  for (const rule of settings.rules) {
    const row = document.createElement('div'); row.className = 'rule';
    const details = document.createElement('div'); details.className = 'rule-details';
    const pattern = document.createElement('code'); pattern.className = 'rule-pattern'; pattern.textContent = rule.pattern;
    const adapter = document.createElement('small'); adapter.textContent = ADAPTER_OPTIONS.find(option => option.id === rule.adapterId)?.label ?? rule.adapterId;
    details.append(pattern, adapter);
    const actions = document.createElement('div'); actions.className = 'rule-actions';
    const edit = document.createElement('button'); edit.type = 'button'; edit.textContent = '编辑'; edit.setAttribute('aria-label', `编辑规则 ${rule.pattern}`);
    edit.addEventListener('click', () => {
      editingRuleId = rule.id;
      formTitle.textContent = '编辑页面规则';
      submitRule.textContent = '保存修改';
      cancelEdit.hidden = false;
      patternInput.value = rule.pattern;
      adapterInput.value = rule.adapterId;
      inform('');
      patternInput.focus();
    });
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'remove'; remove.textContent = '移除'; remove.setAttribute('aria-label', `移除规则 ${rule.pattern}`);
    remove.addEventListener('click', () => {
      settings.rules = settings.rules.filter(item => item.id !== rule.id);
      if (editingRuleId === rule.id) cancelEditing();
      void saveSettings('规则已移除。');
    });
    actions.append(edit, remove);
    row.append(details, actions); rulesElement.append(row);
  }
  toggle.checked = settings.enabled;
  defaultToggle.checked = settings.defaultDeepSeek;
}
async function syncRegistrations(): Promise<void> {
  try { await chrome.runtime.sendMessage({ type: 'iui-sync-rules' }); } catch { /* Storage listener also schedules sync. */ }
}
async function saveSettings(message: string): Promise<boolean> {
  try {
    await chrome.storage.local.set({ iuiSettings: copySettings(settings) });
    persistedSettings = copySettings(settings);
  } catch (error) {
    settings = copySettings(persistedSettings);
    renderRules();
    inform(`保存失败：${String(error)}`, 'error');
    return false;
  }
  renderRules();
  await syncRegistrations();
  inform(message, 'success');
  return true;
}

toggle.addEventListener('change', () => { settings.enabled = toggle.checked; void saveSettings(settings.enabled ? '智能 UI 已开启：DeepSeek 规则注入与回复渲染同时启用。' : '智能 UI 已关闭：不注入、不渲染，网页原文可见。'); });
defaultToggle.addEventListener('change', () => { settings.defaultDeepSeek = defaultToggle.checked; void saveSettings(settings.defaultDeepSeek ? '默认页面已开启。' : '默认页面已关闭。'); });
cancelEdit.addEventListener('click', () => { cancelEditing(); inform(''); patternInput.focus(); });
form.addEventListener('submit', event => {
  event.preventDefault();
  const validated = validateUrlRule(patternInput.value, adapterInput.value);
  if (!validated.ok) { inform(validated.error, 'error'); return; }
  const prior = editingRuleId ? settings.rules.find(item => item.id === editingRuleId) : null;
  if (editingRuleId && !prior) { cancelEditing(); inform('这条规则已不存在，请重新添加。', 'warning'); return; }
  if (settings.rules.some(item => item.id !== editingRuleId && item.pattern === validated.pattern && item.adapterId === validated.adapterId)) {
    inform('这条页面规则已经存在。', 'warning'); return;
  }
  // Request exactly this origin from a direct user gesture. Chrome owns the prompt.
  void (async () => {
    try {
      const previousHost = prior ? validateUrlRule(prior.pattern, prior.adapterId) : null;
      if (validated.hostPattern !== 'https://chat.deepseek.com/*' && (!previousHost?.ok || previousHost.hostPattern !== validated.hostPattern)) {
        const granted = await chrome.permissions.request({ origins: [validated.hostPattern] });
        if (!granted) { inform('Chrome 未授予该站点权限，规则未保存。', 'warning'); return; }
      }
      if (prior) settings.rules = settings.rules.map(item => item.id === prior.id ? { ...item, pattern: validated.pattern, adapterId: validated.adapterId } : item);
      else settings.rules.push({ id: `r_${crypto.randomUUID()}`, pattern: validated.pattern, adapterId: validated.adapterId });
      const saved = await saveSettings(validated.hostPattern === 'file:///*' && !await fileAccessAllowed()
        ? '规则已保存。请在扩展详情开启“允许访问文件网址”，再刷新文件页。'
        : '规则已保存。当前页面若未更新，请刷新。');
      if (saved) cancelEditing();
    } catch (error) { inform(`规则未保存：${String(error)}`, 'error'); }
  })();
});

void chrome.storage.local.get({ iuiSettings: null, enabled: true }).then(async (stored: { iuiSettings?: unknown; enabled?: unknown }) => {
  settings = normalizeSettings(stored.iuiSettings, stored.enabled);
  persistedSettings = copySettings(settings);
  submitRule.disabled = false;
  toggle.disabled = false;
  defaultToggle.disabled = false;
  renderRules();
  await syncRegistrations();
}).catch((error: unknown) => {
  inform(`设置读取失败：${String(error)}`, 'error');
});
