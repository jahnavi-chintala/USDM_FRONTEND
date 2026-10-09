import { client } from './client';

import type { ProtocolDetail, ProtocolSummary } from '../types';

const protocolPath = (id: string) => `/api/protocols/${encodeURIComponent(id)}`;

export function listProtocols(signal?: AbortSignal): Promise<ProtocolSummary[]> {
  return client.request('/api/protocols', { signal });
}

export function getProtocol(id: string, signal?: AbortSignal): Promise<ProtocolDetail> {
  return client.request(protocolPath(id), { signal });
}

export function uploadProtocol(file: File, signal?: AbortSignal): Promise<ProtocolSummary> {
  const body = new FormData();
  body.append('file', file);
  return client.request('/api/protocols', { method: 'POST', body, signal });
}

/** Runs processing again from the start, on the file already uploaded. */
export function retryProtocol(id: string): Promise<ProtocolSummary> {
  return client.request(`${protocolPath(id)}/retry`, { method: 'POST' });
}
