/**
 * Application configuration.
 *
 * Values are resolved in this order:
 * 1. `window.__APP_CONFIG__`, written to `/config.js` by the Docker image at start-up, so one
 *    build can be deployed to any environment;
 * 2. `VITE_*` variables, read at build time (see `.env.example`);
 * 3. the defaults below, which match the backend's local development port.
 */

export interface RuntimeConfig {
  apiUrl?: string;
}

declare global {
  interface Window {
    __APP_CONFIG__?: RuntimeConfig;
  }
}

export interface AppConfig {
  /** Base URL of the protocol API (`/api/protocols/*`, see docs/api-contract.md). */
  apiUrl: string;
  /** Delay between two status checks of something the backend is still working on. */
  pollIntervalMs: number;
  /** When true, Mock Service Worker answers every API call. */
  mocksEnabled: boolean;
}

const DEFAULT_POLL_INTERVAL_MS = 10_000;

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

function firstNonEmpty(...values: (string | undefined)[]): string | undefined {
  return values.find((value) => value !== undefined && value.trim() !== '')?.trim();
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function resolveConfig(
  runtime: RuntimeConfig = {},
  env: ImportMetaEnv = import.meta.env,
): AppConfig {
  return {
    apiUrl: stripTrailingSlash(
      firstNonEmpty(runtime.apiUrl, env.VITE_API_URL) ?? 'http://localhost:8080',
    ),
    pollIntervalMs: parsePositiveInt(env.VITE_POLL_INTERVAL_MS, DEFAULT_POLL_INTERVAL_MS),
    mocksEnabled: env.VITE_MOCKS === 'true',
  };
}

export const config: AppConfig = resolveConfig(
  typeof window === 'undefined' ? {} : window.__APP_CONFIG__,
);
