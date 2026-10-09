import { createPersistedStore } from '@/shared/storage/createStore';

import type { JobStatus } from './types';

/**
 * The jobs this browser has submitted, kept in localStorage.
 *
 * The backend keeps jobs in memory only (lost on restart, removed after `USDM4_JOB_TTL_S`,
 * one hour by default), so this list is what lets a user find a job again after a page
 * refresh. Results are not stored here: they can be large and are fetched from the backend.
 */
export type StoredJobStatus = JobStatus | 'expired';

export interface StoredJob {
  id: string;
  fileName: string;
  fileSize: number;
  submittedAt: string;
  status: StoredJobStatus;
}

const MAX_JOBS = 50;

export const jobHistoryStore = createPersistedStore<StoredJob[]>('local', 'usdm4.jobs', []);

export const useJobHistory = jobHistoryStore.useStore;

export function addJob(job: StoredJob): void {
  jobHistoryStore.set((jobs) => [job, ...jobs.filter((j) => j.id !== job.id)].slice(0, MAX_JOBS));
}

export function updateJobStatus(id: string, status: StoredJobStatus): void {
  const current = jobHistoryStore.get().find((job) => job.id === id);
  if (!current || current.status === status) return;
  jobHistoryStore.set((jobs) => jobs.map((job) => (job.id === id ? { ...job, status } : job)));
}

export function removeJob(id: string): void {
  jobHistoryStore.set((jobs) => jobs.filter((job) => job.id !== id));
}

export function clearJobs(): void {
  jobHistoryStore.set([]);
}

export function findJob(id: string): StoredJob | undefined {
  return jobHistoryStore.get().find((job) => job.id === id);
}
