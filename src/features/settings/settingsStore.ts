import { createPersistedStore } from '@/shared/storage/createStore';

/**
 * User settings, kept for the browser session only (sessionStorage): closing the tab
 * forgets the API key, so it is never left behind on a shared machine.
 */
export interface Settings {
  /** Sent as `X-API-Key` with every request. Empty when the API is open. */
  apiKey: string;
  /** Recorded with every review decision (approve, reject, edit, re-extract, store). */
  reviewerId: string;
}

export const settingsStore = createPersistedStore<Settings>('session', 'usdm4.settings', {
  apiKey: '',
  reviewerId: '',
});

export const useSettings = settingsStore.useStore;

export function updateSettings(changes: Partial<Settings>): void {
  settingsStore.set((prev) => ({ ...prev, ...changes }));
}
