import { normalizeSettings, type ExtensionSettings } from './extension-rules.js';
export type SettingsStorage = {
  get(defaults: Record<string, unknown>): Promise<Record<string, unknown>>;
  set(values: Record<string, unknown>): Promise<void>;
};
/** The existing extension-wide iuiSettings.enabled is the only persisted UI/injection switch. */
export async function updateExtensionEnabled(storage: SettingsStorage, enabled: boolean): Promise<ExtensionSettings> {
  const stored = await storage.get({ iuiSettings: null, enabled: true });
  const next = normalizeSettings(stored.iuiSettings, stored.enabled);
  next.enabled = enabled;
  await storage.set({ iuiSettings: next });
  return next;
}
