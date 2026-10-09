import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { config } from '@/config/env';
import { useSettings } from '@/features/settings';

import {
  approveClass,
  editClass,
  getSourcePage,
  listClasses,
  reextractClass,
  reextractProtocol,
  rejectClass,
  storeProtocol,
} from '../api/reviewApi';
import type { UsdmClass } from '../types';

export const reviewKeys = {
  classes: (id: string) => ['usdm-review', 'classes', id] as const,
  page: (id: string, page: number) => ['usdm-review', 'page', id, page] as const,
};

/** The classes of a protocol; re-checked while one of them is being extracted again. */
export function useClasses(protocolId: string) {
  return useQuery({
    queryKey: reviewKeys.classes(protocolId),
    queryFn: ({ signal }) => listClasses(protocolId, signal),
    refetchInterval: (query) =>
      query.state.data?.some((c) => c.status === 'reextracting') ? config.pollIntervalMs : false,
  });
}

export function useSourcePage(protocolId: string, page: number) {
  return useQuery({
    queryKey: reviewKeys.page(protocolId, page),
    queryFn: ({ signal }) => getSourcePage(protocolId, page, signal),
    staleTime: Infinity,
  });
}

export type ClassAction =
  | { kind: 'approve'; classId: string }
  | { kind: 'reject'; classId: string }
  | { kind: 'reextract'; classId: string }
  | { kind: 'edit'; classId: string; values: Record<string, string>; reason: string };

/**
 * Every decision on a class. The answer replaces that class in place; `onProtocolChange` runs
 * afterwards because a decision can change the protocol's status (e.g. the last approval).
 */
export function useClassAction(protocolId: string, onProtocolChange: () => void) {
  const queryClient = useQueryClient();
  const { reviewerId } = useSettings();
  return useMutation({
    mutationFn: (action: ClassAction) => {
      const reviewer = { reviewer_id: reviewerId };
      switch (action.kind) {
        case 'approve':
          return approveClass(protocolId, action.classId, reviewer);
        case 'reject':
          return rejectClass(protocolId, action.classId, reviewer);
        case 'reextract':
          return reextractClass(protocolId, action.classId, reviewer);
        case 'edit':
          return editClass(protocolId, action.classId, {
            ...reviewer,
            values: action.values,
            reason: action.reason,
          });
      }
    },
    onSuccess: (updated: UsdmClass) => {
      queryClient.setQueryData<UsdmClass[]>(reviewKeys.classes(protocolId), (classes) =>
        classes?.map((c) => (c.id === updated.id ? updated : c)),
      );
      onProtocolChange();
    },
  });
}

export function useProtocolAction(protocolId: string, onProtocolChange: () => void) {
  const queryClient = useQueryClient();
  const { reviewerId } = useSettings();
  return useMutation({
    mutationFn: (kind: 'store' | 'reextract') =>
      kind === 'store'
        ? storeProtocol(protocolId, { reviewer_id: reviewerId })
        : reextractProtocol(protocolId, { reviewer_id: reviewerId }),
    onSuccess: (_, kind) => {
      if (kind === 'reextract') {
        void queryClient.removeQueries({ queryKey: reviewKeys.classes(protocolId) });
      }
      onProtocolChange();
    },
  });
}
