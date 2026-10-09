import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { ErrorAlert } from '@/shared/components/ErrorAlert';
import { LoadingState } from '@/shared/components/LoadingState';
import { formatDateTime } from '@/shared/utils/format';

import { useFieldHistory } from '../hooks/useReview';
import type { AuditRecord } from '../types';

interface FieldHistoryProps {
  sha: string;
  domain: string;
  field: string;
}

function describe(record: AuditRecord): string {
  const parts = [`value: ${record.value ?? '—'}`];
  if (record.prior_value != null) parts[0] += ` (was: ${record.prior_value})`;
  if (record.method) parts.push(`method: ${record.method}`);
  if (record.decision) parts.push(`decision: ${record.decision}`);
  if (record.reviewer_id) parts.push(`reviewer: ${record.reviewer_id}`);
  if (record.reason_for_change) parts.push(`reason: ${record.reason_for_change}`);
  return parts.join(' · ');
}

/** Every record ever written for the field, oldest first. */
export function FieldHistory({ sha, domain, field }: FieldHistoryProps) {
  const history = useFieldHistory(sha, domain, field, true);

  if (history.isPending) return <LoadingState label="Loading history…" />;
  if (history.isError) {
    return (
      <ErrorAlert
        error={history.error}
        title="Cannot load the history"
        onRetry={() => history.refetch()}
      />
    );
  }

  return (
    <Box component="ol" aria-label={`History of ${domain}.${field}`} sx={{ m: 0, pl: 2.5 }}>
      {history.data.map((record) => (
        <li key={record.record_id}>
          <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
            <strong>{record.event}</strong> {formatDateTime(record.timestamp_utc)} —{' '}
            {describe(record)}
          </Typography>
        </li>
      ))}
    </Box>
  );
}
