import Box from '@mui/material/Box';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';

import { ReviewWorkspace } from '@/features/usdm-review';
import { isApiError } from '@/shared/api/ApiError';
import { Breadcrumbs } from '@/shared/components/Breadcrumbs';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorAlert } from '@/shared/components/ErrorAlert';
import { LoadingState } from '@/shared/components/LoadingState';

import { FailurePanel } from '../components/FailurePanel';
import { ProcessingLog } from '../components/ProcessingLog';
import { ProcessingSteps } from '../components/ProcessingSteps';
import { ProtocolHeader } from '../components/ProtocolHeader';
import { protocolKeys, useProtocol, useRetryProtocol } from '../hooks/useProtocols';
import { useUploads } from '../hooks/useUploads';
import type { ProtocolDetail } from '../types';

/** One protocol: its processing, its failure, or its review, depending on its status. */
export function ProtocolPage() {
  const { protocolId = '' } = useParams();
  const protocol = useProtocol(protocolId);
  const queryClient = useQueryClient();

  if (protocol.isPending) return <LoadingState label="Loading protocol…" />;
  if (protocol.isError) {
    if (isApiError(protocol.error) && protocol.error.status === 404) {
      return (
        <EmptyState title="Protocol not found">
          It may have been removed. Go back to Home to see your protocols.
        </EmptyState>
      );
    }
    return (
      <ErrorAlert
        title="The protocol could not be loaded"
        error={protocol.error}
        onRetry={() => void protocol.refetch()}
      />
    );
  }

  const data = protocol.data;
  if (data.status === 'in_review' || data.status === 'approved') {
    return (
      <ReviewWorkspace
        protocol={data}
        onProtocolChange={() => void queryClient.invalidateQueries({ queryKey: protocolKeys.all })}
      />
    );
  }
  return <ProtocolProgress protocol={data} />;
}

function ProtocolProgress({ protocol }: { protocol: ProtocolDetail }) {
  const retry = useRetryProtocol(protocol.id);
  const { start } = useUploads();
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'In Progress', to: '/' },
          { label: protocol.name },
        ]}
      />
      <ProtocolHeader protocol={protocol} />
      {protocol.status === 'failed' && protocol.failure ? (
        <>
          {retry.isError && (
            <ErrorAlert title="Processing could not be restarted" error={retry.error} />
          )}
          <FailurePanel
            failure={protocol.failure}
            onRetry={() => retry.mutate()}
            retrying={retry.isPending}
            onReupload={(file) => {
              start([file]);
              void navigate('/uploads');
            }}
          />
        </>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.3fr 1fr' },
            gap: 2.5,
            alignItems: 'start',
          }}
        >
          <ProcessingSteps
            stage={protocol.stage ?? 'extracting_text'}
            progress={protocol.stage_progress}
          />
          <ProcessingLog entries={protocol.log} />
        </Box>
      )}
    </Box>
  );
}
