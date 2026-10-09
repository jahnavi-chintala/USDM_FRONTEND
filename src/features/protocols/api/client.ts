import { config } from '@/config/env';
import { settingsStore } from '@/features/settings';
import { createHttpClient } from '@/shared/api/httpClient';

/** Client of the protocol API; adds the API key from Settings, read at call time. */
export const client = createHttpClient({
  baseUrl: config.apiUrl,
  getHeaders: (): Record<string, string> => {
    const { apiKey } = settingsStore.get();
    return apiKey ? { 'X-API-Key': apiKey } : {};
  },
});
