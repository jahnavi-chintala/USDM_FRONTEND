import type { PillTone } from '@/shared/components/StatusPill';

import type { ClassStatus } from '../types';

export const CLASS_STATUS: Record<ClassStatus, { label: string; tone: PillTone }> = {
  pending: { label: 'Pending review', tone: 'warning' },
  approved: { label: 'Approved', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'error' },
  edited: { label: 'Edited · needs approval', tone: 'edited' },
  reextracting: { label: 'Re-extracting…', tone: 'info' },
};
