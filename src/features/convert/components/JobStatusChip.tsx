import Chip, { type ChipProps } from '@mui/material/Chip';

import type { StoredJobStatus } from '../jobHistory';

const STATUS: Record<StoredJobStatus, { label: string; color: ChipProps['color'] }> = {
  queued: { label: 'Queued', color: 'default' },
  running: { label: 'Running', color: 'info' },
  done: { label: 'Done', color: 'success' },
  failed: { label: 'Failed', color: 'error' },
  expired: { label: 'Expired', color: 'warning' },
};

export function JobStatusChip({ status }: { status: StoredJobStatus }) {
  const { label, color } = STATUS[status];
  return <Chip size="small" label={label} color={color} variant="outlined" />;
}
