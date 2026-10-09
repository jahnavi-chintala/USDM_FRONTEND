import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { config } from '@/config/env';

import { getProtocol, listProtocols, retryProtocol } from '../api/protocolsApi';
import type { ProtocolDetail, ProtocolSummary } from '../types';

export const protocolKeys = {
  all: ['protocols'] as const,
  list: ['protocols', 'list'] as const,
  detail: (id: string) => ['protocols', 'detail', id] as const,
};

/** Every protocol; re-checked while any of them is still processing. */
export function useProtocols() {
  return useQuery({
    queryKey: protocolKeys.list,
    queryFn: ({ signal }) => listProtocols(signal),
    refetchInterval: (query) =>
      query.state.data?.some((p) => p.status === 'processing') ? config.pollIntervalMs : false,
  });
}

/** One protocol; re-checked until processing has finished. */
export function useProtocol(id: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: protocolKeys.detail(id),
    queryFn: async ({ signal }) => {
      const detail = await getProtocol(id, signal);
      // Keep the home list in step without waiting for its own refresh.
      queryClient.setQueryData<ProtocolSummary[]>(protocolKeys.list, (list) =>
        list?.map((p) => (p.id === id ? detail : p)),
      );
      return detail;
    },
    refetchInterval: (query) =>
      query.state.data?.status === 'processing' ? config.pollIntervalMs : false,
  });
}

export function useRetryProtocol(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => retryProtocol(id),
    onSuccess: (summary) => {
      queryClient.setQueryData<ProtocolDetail>(
        protocolKeys.detail(id),
        (detail) => detail && { ...detail, ...summary, log: [] },
      );
      void queryClient.invalidateQueries({ queryKey: protocolKeys.all });
    },
  });
}
