import { config } from '@/config/env';
import { createHttpClient } from '@/shared/api/httpClient';

import type {
  AuditRecord,
  BBox,
  CertifyRequest,
  CertifyResponse,
  EditFieldRequest,
  SourceDetail,
  SourceSummary,
} from '../types';

const client = createHttpClient({ baseUrl: config.reviewApiUrl });

const sourcePath = (sha: string) => `/api/review/sources/${encodeURIComponent(sha)}`;
const fieldPath = (sha: string, domain: string, field: string) =>
  `${sourcePath(sha)}/fields/${encodeURIComponent(domain)}/${encodeURIComponent(field)}`;

export function listSources(signal?: AbortSignal): Promise<SourceSummary[]> {
  return client.request('/api/review/sources', { signal });
}

export function getSource(sha: string, signal?: AbortSignal): Promise<SourceDetail> {
  return client.request(sourcePath(sha), { signal });
}

export function getFieldHistory(
  sha: string,
  domain: string,
  field: string,
  signal?: AbortSignal,
): Promise<AuditRecord[]> {
  return client.request(`${fieldPath(sha, domain, field)}/history`, { signal });
}

export function editField(
  sha: string,
  domain: string,
  field: string,
  body: EditFieldRequest,
): Promise<AuditRecord> {
  return client.request(`${fieldPath(sha, domain, field)}/edit`, { method: 'POST', body });
}

export function certifySource(sha: string, body: CertifyRequest): Promise<CertifyResponse> {
  return client.request(`${sourcePath(sha)}/certify`, { method: 'POST', body });
}

/** Image URL of the PDF region a field's quote was found in. */
export function cropUrl(sha: string, page: number, [x0, y0, x1, y1]: BBox): string {
  return client.url(`${sourcePath(sha)}/crop`, { page, x0, y0, x1, y1 });
}
