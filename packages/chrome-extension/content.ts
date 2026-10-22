import styles from '../../ui/styles.css';
import { SiteAdapterRegistry } from '../../services/adapter-registry.js';
import { DeepSeekAdapter } from '../../services/adapters/deepseek.js';
import { ReplyCoordinator } from '../../services/reply-coordinator.js';
import { createReactReplyView } from '../../services/reply-view.js';
import { createProjectMediaHost } from '../../services/project-media-host.js';
import bannerUrl from '../../docs/assets/readme-banner.png';
import iconUrl from './icons/icon-128.png';
import { DEFAULT_SETTINGS, normalizeSettings, selectPageAdapter, type ExtensionSettings } from '../../services/extension-rules.js';
import rules from '../../docs/prompts/recommended.en.txt';
import { IntelligentLayoutController } from '../../services/intelligent-layout/controller.js';
import { LayoutEnvelope, provenanceStorageKey } from '../../services/intelligent-layout/envelope.js';
import { deepSeekOrigin } from '../../services/adapters/deepseek-send.js';
import { updateExtensionEnabled } from '../../services/extension-mode.js';

declare const chrome: any;
type Controller = { reload(): Promise<void>; status(): unknown };
const scope = globalThis as typeof globalThis & { __iuiContentController?: Controller };

// Programmatic injection may revisit a page that already has the static script.
if (scope.__iuiContentController) {
  void scope.__iuiContentController.reload();
} else {
  const registry = new SiteAdapterRegistry();
  registry.register(new DeepSeekAdapter());
  let settings: ExtensionSettings = { ...DEFAULT_SETTINGS, rules: [] };
  const coordinator = new ReplyCoordinator(
    document, registry, createReactReplyView(styles, createProjectMediaHost({ banner: bannerUrl, icon: iconUrl })), 60,
    url => registry.get(selectPageAdapter(url, settings) ?? ''),
  );
  coordinator.setEnabled(false); // No preview before persisted settings have loaded.
  let loadNumber = 0;
  let layout: IntelligentLayoutController | null = null;
  const applyMode = (enabled: boolean) => {
    settings = { ...settings, enabled };
    coordinator.setEnabled(enabled); coordinator.refresh(); layout?.setEnabled(enabled);
  };
  const changeMode = async (enabled: boolean) => {
    const previous = settings.enabled;
    // OFF is immediate, including during an active stream. Already-sent bytes cannot be recalled.
    if (!enabled) applyMode(false);
    try { settings = await updateExtensionEnabled(chrome.storage.local, enabled); applyMode(settings.enabled); }
    catch (error) { applyMode(previous); throw error; }
  };
  const status = () => ({ ...coordinator.status, intelligentUiEnabled: settings.enabled, scope: 'extension', injection: layout?.status ?? null });
  const reload = async () => {
    const current = ++loadNumber;
    const stored = await chrome.storage.local.get({ iuiSettings: null, enabled: true });
    if (current !== loadNumber) return;
    settings = normalizeSettings(stored.iuiSettings, stored.enabled);
    coordinator.start(); // Also resumes a document restored from the back/forward cache.
    coordinator.setEnabled(settings.enabled);
    coordinator.refresh();
    if (location.origin === deepSeekOrigin && selectPageAdapter(new URL(location.href), { ...settings, enabled: true }) === 'deepseek') {
      if (!layout) {
        layout = new IntelligentLayoutController(window, new LayoutEnvelope(rules), {
          async load() { return (await chrome.storage.local.get(provenanceStorageKey))[provenanceStorageKey]; },
          async save(records) { await chrome.storage.local.set({ [provenanceStorageKey]: records }); },
        }, changeMode);
        layout.setEnabled(settings.enabled);
        void layout.start();
      } else layout.setEnabled(settings.enabled);
    } else { layout?.stop(); layout = null; }
  };
  scope.__iuiContentController = { reload, status };
  chrome.runtime.onMessage.addListener((message: { type?: string }, _sender: unknown, respond: (value: unknown) => void) => {
    if (message?.type === 'iui-status') { respond(status()); return; }
    if (message?.type === 'iui-reload-settings') {
      void reload().then(() => respond(status()), () => respond({ enabled: false, siteId: null, rendered: 0 }));
      return true;
    }
  });
  chrome.storage.onChanged.addListener((changes: Record<string, unknown>, area: string) => {
    if (area === 'local' && (changes.iuiSettings || changes.enabled)) void reload();
  });
  window.addEventListener('pagehide', () => { coordinator.stop(); layout?.stop(); layout = null; });
  window.addEventListener('pageshow', () => { void reload(); });
  void reload();
}
