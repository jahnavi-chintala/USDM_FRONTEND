import RefreshIcon from '@mui/icons-material/Refresh';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import type { ReviewProtocol } from '../types';
import { ConfidenceRing } from './ConfidenceRing';

interface ReviewHeaderProps {
  protocol: ReviewProtocol;
  confidence: number;
  done: boolean;
  canReextract: boolean;
  onReextract: () => void;
}

export function ReviewHeader({
  protocol,
  confidence,
  done,
  canReextract,
  onReextract,
}: ReviewHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2,
        flexWrap: 'wrap',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h1">{done ? protocol.name : `Review ${protocol.name}`}</Typography>
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
          <span>{protocol.title}</span>
          <span>{protocol.file_name}</span>
          {protocol.page_count != null && <span>{protocol.page_count} pages</span>}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 1.75, alignItems: 'center' }}>
        {!done && (
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<RefreshIcon />}
            onClick={onReextract}
            disabled={!canReextract}
            sx={{ borderColor: 'divider', bgcolor: 'background.paper' }}
          >
            Re-extract whole protocol
          </Button>
        )}
        <Typography
          sx={{ fontSize: '0.75rem', maxWidth: 170, display: { xs: 'none', sm: 'block' } }}
          color="text.secondary"
        >
          {done ? 'Final confidence' : 'Overall confidence updates as you approve, reject or edit.'}
        </Typography>
        <ConfidenceRing value={confidence} />
      </Box>
    </Box>
  );
}
