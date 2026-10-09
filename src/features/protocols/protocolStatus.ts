import type { PillTone } from '@/shared/components/StatusPill';

import { STAGE_LABEL } from './errorMessages';
import type { ProtocolSummary } from './types';

/** The status pill text and colour of a protocol, as shown in lists and headers. */
export function protocolStatusLabel(protocol: ProtocolSummary): { label: string; tone: PillTone } {
  switch (protocol.status) {
    case 'processing':
      return { label: protocol.stage ? STAGE_LABEL[protocol.stage] : 'Processing', tone: 'info' };
    case 'in_review':
      return {
        label: `In Review · ${protocol.classes_approved}/${protocol.classes_total}`,
        tone: 'primary',
      };
    case 'approved':
      return { label: 'Approved', tone: 'success' };
    case 'failed':
      return { label: 'Failed', tone: 'error' };
  }
}

/** Where a protocol opens: its own page shows processing, failure or review. */
export function protocolPath(id: string): string {
  return `/protocols/${encodeURIComponent(id)}`;
}
