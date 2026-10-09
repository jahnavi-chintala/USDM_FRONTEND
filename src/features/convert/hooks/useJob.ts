import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { config } from '@/config/env';
import { isApiError } from '@/shared/api/ApiError';

import { getJob } from '../api/convertApi';
import { updateJobStatus } from '../jobHistory';
import type { JobStatusResponse } from '../types';

export const jobQueryKey = (jobId: string) => ['convert', 'job', jobId] as const;

function isActive(job: JobStatusResponse | undefined): boolean {
  return job?.status === 'queued' || job?.status === 'running';
}

/**
 * A conversion job, polled every `jobPollIntervalMs` while it is queued or running.
 * Keeps the browser's job history in step with what the server reports.
 */
export function useJob(jobId: string) {
  const query = useQuery({
    queryKey: jobQueryKey(jobId),
    queryFn: ({ signal }) => getJob(jobId, signal),
    refetchInterval: (q) => (isActive(q.state.data) ? config.jobPollIntervalMs : false),
    // A finished job never changes; keep it until the page is left.
    staleTime: (q) => (isActive(q.state.data) ? 0 : Infinity),
  });

  const status = query.data?.status;
  const expired = isApiError(query.error) && query.error.status === 404;

  useEffect(() => {
    if (status) updateJobStatus(jobId, status);
  }, [jobId, status]);

  useEffect(() => {
    if (expired) updateJobStatus(jobId, 'expired');
  }, [jobId, expired]);

  return { ...query, expired };
}
