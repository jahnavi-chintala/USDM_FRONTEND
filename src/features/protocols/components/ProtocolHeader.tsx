import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { StatusPill } from '@/shared/components/StatusPill';
import { formatDateTime } from '@/shared/utils/format';

import { protocolStatusLabel } from '../protocolStatus';
import type { ProtocolSummary } from '../types';

/** Name, file details and status pill at the top of a protocol's page. */
export function ProtocolHeader({ protocol }: { protocol: ProtocolSummary }) {
  const { label, tone } = protocolStatusLabel(protocol);
  return (
    <Box
      sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h1">{protocol.name}</Typography>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            columnGap: 1.75,
            color: 'text.secondary',
            fontSize: '0.8125rem',
            mt: 0.5,
          }}
        >
          <span>{protocol.file_name}</span>
          {protocol.page_count != null && <span>{protocol.page_count} pages</span>}
          <span>Uploaded {formatDateTime(protocol.uploaded_at)}</span>
        </Box>
      </Box>
      <StatusPill tone={tone}>{label}</StatusPill>
    </Box>
  );
}
