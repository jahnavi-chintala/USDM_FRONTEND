import { config } from '@/config/env';
import { settingsStore } from '@/features/settings';
import { createHttpClient } from '@/shared/api/httpClient';

import type { JobStatusResponse, JobSubmitResponse } from '../types';

const client = createHttpClient({
  baseUrl: config.convertApiUrl,
  getHeaders: (): Record<string, string> => {
    const { apiKey } = settingsStore.get();
    return apiKey ? { 'X-API-Key': apiKey } : {};
  },
});

/** Uploads a protocol PDF and starts a conversion job. */
export function submitJob(file: File): Promise<JobSubmitResponse> {
  const form = new FormData();
  form.append('file', file);
  return client.request<JobSubmitResponse>('/v1/jobs', { method: 'POST', body: form });
}

/** Current state of a job; a finished job includes the USDM document and its report. */
export function getJob(jobId: string, signal?: AbortSignal): Promise<JobStatusResponse> {
  return client.request<JobStatusResponse>(`/v1/jobs/${encodeURIComponent(jobId)}`, {
    query: { include_report: true },
    signal,
  });
}
