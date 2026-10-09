import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { updateSettings } from '@/features/settings';

import {
  certifySource,
  editField,
  getFieldHistory,
  getSource,
  listSources,
} from '../api/reviewApi';
import type { AuditRecord, CertifyRequest, EditFieldRequest, SourceDetail } from '../types';

export const reviewKeys = {
  sources: ['review', 'sources'] as const,
  source: (sha: string) => ['review', 'source', sha] as const,
  history: (sha: string, domain: string, field: string) =>
    ['review', 'history', sha, domain, field] as const,
};

export function useSources() {
  return useQuery({ queryKey: reviewKeys.sources, queryFn: ({ signal }) => listSources(signal) });
}

export function useSource(sha: string) {
  return useQuery({
    queryKey: reviewKeys.source(sha),
    queryFn: ({ signal }) => getSource(sha, signal),
  });
}

export function useFieldHistory(sha: string, domain: string, field: string, enabled: boolean) {
  return useQuery({
    queryKey: reviewKeys.history(sha, domain, field),
    queryFn: ({ signal }) => getFieldHistory(sha, domain, field, signal),
    enabled,
    staleTime: 0,
  });
}

/** The reviewer id used in a form becomes the session default for the next one. */
function rememberReviewer(reviewerId: string): void {
  updateSettings({ reviewerId });
}

/**
 * Saves a reviewer edit. The new record replaces the field's row in place (like the
 * HTMX tool), so the table does not jump around while the reviewer works through it.
 */
export function useEditField(sha: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      domain,
      field,
      body,
    }: {
      domain: string;
      field: string;
      body: EditFieldRequest;
    }) => editField(sha, domain, field, body),
    onSuccess: (record: AuditRecord, { domain, field, body }) => {
      rememberReviewer(body.reviewer_id);
      queryClient.setQueryData<SourceDetail>(
        reviewKeys.source(sha),
        (detail) =>
          detail && {
            ...detail,
            fields: detail.fields.map((row) =>
              row.domain === domain && row.field === field ? record : row,
            ),
          },
      );
      void queryClient.invalidateQueries({ queryKey: reviewKeys.history(sha, domain, field) });
      void queryClient.invalidateQueries({ queryKey: reviewKeys.sources });
    },
  });
}

export function useCertify(sha: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CertifyRequest) => certifySource(sha, body),
    onSuccess: (_, body) => {
      rememberReviewer(body.reviewer_id);
      queryClient.setQueryData<SourceDetail>(
        reviewKeys.source(sha),
        (detail) => detail && { ...detail, summary: { ...detail.summary, certified: true } },
      );
      void queryClient.invalidateQueries({ queryKey: reviewKeys.sources });
    },
  });
}
