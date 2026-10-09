import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router';

import { Breadcrumbs } from '@/shared/components/Breadcrumbs';
import { EmptyState } from '@/shared/components/EmptyState';

import { UploadList } from '../components/UploadList';
import { useUploads } from '../hooks/useUploads';

export function UploadsPage() {
  const { items, retry } = useUploads();
  const count = items.length;

  return (
    <Box sx={{ maxWidth: 920, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2.25 }}>
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Upload' }]} />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <Typography variant="h1">
            {count > 1 ? `Bulk upload · ${count} files` : 'Upload'}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            Each file is tracked on its own. One file failing or slowing down doesn’t block the
            others.
          </Typography>
        </div>
        <Button component={Link} to="/" variant="contained">
          Go to In Progress
        </Button>
      </Box>
      {count === 0 ? (
        <EmptyState title="Nothing is uploading">
          Choose protocol files on Home to start an upload.
        </EmptyState>
      ) : (
        <UploadList items={items} onRetry={retry} />
      )}
      <Typography sx={{ fontSize: '0.78125rem' }} color="text.secondary">
        Failure reasons are specific: wrong file type, file too large, missing API key, or service
        unavailable. Problems inside the document show on the protocol once processing starts.
      </Typography>
    </Box>
  );
}
