import Box from '@mui/material/Box';
import { useNavigate } from 'react-router';

import { useSettings } from '@/features/settings';
import { ErrorAlert } from '@/shared/components/ErrorAlert';
import { LoadingState } from '@/shared/components/LoadingState';

import { HomeHero } from '../components/HomeHero';
import { ProtocolTable } from '../components/ProtocolTable';
import { UploadDropzone } from '../components/UploadDropzone';
import { useProtocols } from '../hooks/useProtocols';
import { useUploads } from '../hooks/useUploads';

export function HomePage() {
  const protocols = useProtocols();
  const { reviewerId } = useSettings();
  const { start } = useUploads();
  const navigate = useNavigate();

  function upload(files: File[]) {
    start(files);
    void navigate('/uploads');
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.75 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
          gap: 2.5,
        }}
      >
        <HomeHero protocols={protocols.data} reviewerName={reviewerId || 'Reviewer'} />
        <UploadDropzone onFiles={upload} />
      </Box>
      {protocols.isPending && <LoadingState label="Loading protocols…" />}
      {protocols.isError && (
        <ErrorAlert
          title="Protocols could not be loaded"
          error={protocols.error}
          onRetry={() => void protocols.refetch()}
        />
      )}
      {protocols.data && <ProtocolTable protocols={protocols.data} />}
    </Box>
  );
}
