import styles from '../../ui/styles.css';
import { SiteAdapterRegistry } from '../../services/adapter-registry.js';
import { DeepSeekAdapter } from '../../services/adapters/deepseek.js';
import { ReplyCoordinator } from '../../services/reply-coordinator.js';
import { createReactReplyView } from '../../services/reply-view.js';
import { DEFAULT_SETTINGS, normalizeSettings, selectPageAdapter, type ExtensionSettings } from '../../services/extension-rules.js';

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
    document, registry, createReactReplyView(styles), 60,
    url => registry.get(selectPageAdapter(url, settings) ?? ''),
  );
  coordinator.setEnabled(false); // No preview before persisted settings have loaded.
  let loadNumber = 0;
  const reload = async () => {
    const current = ++loadNumber;
    const stored = await chrome.storage.local.get({ iuiSettings: null, enabled: true });
    if (current !== loadNumber) return;
    settings = normalizeSettings(stored.iuiSettings, stored.enabled);
    coordinator.start(); // Also resumes a document restored from the back/forward cache.
    coordinator.setEnabled(settings.enabled);
    coordinator.refresh();
  };
  scope.__iuiContentController = { reload, status: () => coordinator.status };
  chrome.runtime.onMessage.addListener((message: { type?: string }, _sender: unknown, respond: (value: unknown) => void) => {
    if (message?.type === 'iui-status') { respond(coordinator.status); return; }
    if (message?.type === 'iui-reload-settings') {
      void reload().then(() => respond(coordinator.status), () => respond({ enabled: false, siteId: null, rendered: 0 }));
      return true;
    }
  });
  chrome.storage.onChanged.addListener((changes: Record<string, unknown>, area: string) => {
    if (area === 'local' && (changes.iuiSettings || changes.enabled)) void reload();
  });
  window.addEventListener('pagehide', () => coordinator.stop());
  window.addEventListener('pageshow', () => { void reload(); });
  void reload();
}
