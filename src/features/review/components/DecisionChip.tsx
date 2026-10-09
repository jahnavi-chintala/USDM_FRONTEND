import Chip, { type ChipProps } from '@mui/material/Chip';

import type { Decision } from '../types';

const DECISIONS: Record<Decision, { label: string; color: ChipProps['color'] }> = {
  block: { label: 'Block', color: 'error' },
  review: { label: 'Review', color: 'warning' },
  auto_accept: { label: 'Auto-accept', color: 'success' },
};

export function DecisionChip({ decision }: { decision: Decision | null }) {
  if (!decision) return <>—</>;
  const { label, color } = DECISIONS[decision];
  return <Chip size="small" label={label} color={color} variant="outlined" />;
}
