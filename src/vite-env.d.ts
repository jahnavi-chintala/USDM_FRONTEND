/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONVERT_API_URL?: string;
  readonly VITE_REVIEW_API_URL?: string;
  readonly VITE_JOB_POLL_INTERVAL_MS?: string;
  readonly VITE_MOCKS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
