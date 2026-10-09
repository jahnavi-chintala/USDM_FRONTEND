import type { EditClassRequest, ReviewerRequest, SourcePage, UsdmClass } from '../types';
import { client } from './client';

const protocolPath = (id: string) => `/api/protocols/${encodeURIComponent(id)}`;
const classPath = (id: string, classId: string) =>
  `${protocolPath(id)}/classes/${encodeURIComponent(classId)}`;

export function listClasses(id: string, signal?: AbortSignal): Promise<UsdmClass[]> {
  return client.request(`${protocolPath(id)}/classes`, { signal });
}

export function approveClass(id: string, classId: string, body: ReviewerRequest) {
  return client.request<UsdmClass>(`${classPath(id, classId)}/approve`, { method: 'POST', body });
}

export function rejectClass(id: string, classId: string, body: ReviewerRequest) {
  return client.request<UsdmClass>(`${classPath(id, classId)}/reject`, { method: 'POST', body });
}

export function editClass(id: string, classId: string, body: EditClassRequest) {
  return client.request<UsdmClass>(`${classPath(id, classId)}/fields`, { method: 'PUT', body });
}

/** Extracts one class again (a blind rerun); it comes back as `reextracting`. */
export function reextractClass(id: string, classId: string, body: ReviewerRequest) {
  return client.request<UsdmClass>(`${classPath(id, classId)}/reextract`, {
    method: 'POST',
    body,
  });
}

/** Processes the whole protocol again; every review decision is cleared. */
export function reextractProtocol(id: string, body: ReviewerRequest): Promise<unknown> {
  return client.request(`${protocolPath(id)}/reextract`, { method: 'POST', body });
}

export function getSourcePage(id: string, page: number, signal?: AbortSignal): Promise<SourcePage> {
  return client.request(`${protocolPath(id)}/pages/${page}`, { signal });
}

/** The approved USDM 4.0 document. */
export function getUsdm(id: string): Promise<unknown> {
  return client.request(`${protocolPath(id)}/usdm`);
}

/** Saves the approved output in the study repository. */
export function storeProtocol(id: string, body: ReviewerRequest): Promise<unknown> {
  return client.request(`${protocolPath(id)}/store`, { method: 'POST', body });
}
