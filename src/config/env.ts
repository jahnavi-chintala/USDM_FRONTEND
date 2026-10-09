/**
 * Application configuration.
 *
 * Values are resolved in this order:
 * 1. `window.__APP_CONFIG__`, written to `/config.js` by the Docker image at start-up, so one
 *    build can be deployed to any environment;
 * 2. `VITE_*` variables, read at build time (see `.env.example`);
 * 3. the defaults below, which match the backend's local development ports.
 */

export interface RuntimeConfig {
  convertApiUrl?: string;
  reviewApiUrl?: string;
}

declare global {
  interface Window {
    __APP_CONFIG__?: RuntimeConfig;
  }
}

export interface AppConfig {
  /** Base URL of the conversion API (`/v1/*`). */
  convertApiUrl: string;
  /** Base URL of the review API (`/api/review/*`). */
  reviewApiUrl: string;
  /** Delay between two status checks of a running conversion job. */
  jobPollIntervalMs: number;
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
    convertApiUrl: stripTrailingSlash(
      firstNonEmpty(runtime.convertApiUrl, env.VITE_CONVERT_API_URL) ?? 'http://localhost:8080',
    ),
    reviewApiUrl: stripTrailingSlash(
      firstNonEmpty(runtime.reviewApiUrl, env.VITE_REVIEW_API_URL) ?? 'http://localhost:8000',
    ),
    jobPollIntervalMs: parsePositiveInt(env.VITE_JOB_POLL_INTERVAL_MS, DEFAULT_POLL_INTERVAL_MS),
    mocksEnabled: env.VITE_MOCKS === 'true',
  };
}

export const config: AppConfig = resolveConfig(
  typeof window === 'undefined' ? {} : window.__APP_CONFIG__,
);
