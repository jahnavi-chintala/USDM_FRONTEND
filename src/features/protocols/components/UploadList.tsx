import RefreshIcon from '@mui/icons-material/Refresh';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router';

import { formatBytes } from '@/shared/utils/format';

import { protocolPath } from '../protocolStatus';
import type { UploadItem } from '../uploads/uploadStore';

interface UploadListProps {
  items: UploadItem[];
  onRetry: (key: string) => void;
}

function UploadStatus({ item, onRetry }: { item: UploadItem; onRetry: () => void }) {
  if (item.state === 'uploading') {
    return (
      <Typography sx={{ fontSize: '0.78125rem', fontWeight: 700 }} color="info.main">
        Uploading…
      </Typography>
    );
  }
  if (item.state === 'uploaded') {
    return (
      <Link
        component={RouterLink}
        to={protocolPath(item.protocolId ?? '')}
        sx={{ fontSize: '0.78125rem', fontWeight: 700 }}
        color="success.dark"
      >
        Uploaded → Processing
      </Link>
    );
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.75 }}>
      <Typography sx={{ fontSize: '0.78125rem', fontWeight: 700 }} color="error.dark">
        Failed · {item.error?.title}
      </Typography>
      <Typography sx={{ fontSize: '0.75rem' }} color="text.secondary">
        {item.error?.action}
      </Typography>
      <Button
        size="small"
        variant="outlined"
        color="inherit"
        startIcon={<RefreshIcon />}
        onClick={onRetry}
        aria-label={`Retry ${item.file.name}`}
        sx={{ minHeight: 36, borderColor: 'divider' }}
      >
        Retry
      </Button>
    </Box>
  );
}

/** One row per file of the batch, each with its own progress and outcome. */
export function UploadList({ items, onRetry }: UploadListProps) {
  return (
    <Paper variant="outlined" component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {items.map((item) => (
        <Box
          component="li"
          key={item.key}
          aria-label={item.file.name}
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '40px minmax(0, 1fr)',
              md: '40px minmax(0, 1fr) 220px 220px',
            },
            gap: 2,
            alignItems: 'center',
            px: 2.5,
            py: 2,
            borderBottom: 1,
            borderColor: 'surface.rule',
            '&:last-child': { borderBottom: 0 },
          }}
        >
          <Box
            aria-hidden="true"
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.625rem',
              fontWeight: 800,
              color: 'common.white',
              bgcolor: item.fileType === 'pdf' ? 'error.dark' : 'info.main',
            }}
          >
            {item.fileType.toUpperCase()}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>
              {item.file.name}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem' }} color="text.secondary">
              {formatBytes(item.file.size)}
            </Typography>
          </Box>
          <LinearProgress
            variant={item.state === 'uploading' ? 'indeterminate' : 'determinate'}
            value={100}
            color={item.state === 'failed' ? 'error' : 'primary'}
            aria-label={`Upload of ${item.file.name}`}
            sx={{ height: 8, bgcolor: 'surface.muted', gridColumn: { xs: '1 / -1', md: 'auto' } }}
          />
          <Box sx={{ gridColumn: { xs: '1 / -1', md: 'auto' } }}>
            <UploadStatus item={item} onRetry={() => onRetry(item.key)} />
          </Box>
        </Box>
      ))}
    </Paper>
  );
}
