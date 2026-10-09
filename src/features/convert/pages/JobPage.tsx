import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Link, useParams } from 'react-router';

import { ErrorAlert } from '@/shared/components/ErrorAlert';
import { LoadingState } from '@/shared/components/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader';
import { formatDateTime } from '@/shared/utils/format';

import { ConversionResultView } from '../components/ConversionResultView';
import { JobFailure } from '../components/JobFailure';
import { JobProgress } from '../components/JobProgress';
import { JobStatusChip } from '../components/JobStatusChip';
import { useJob } from '../hooks/useJob';
import { useJobHistory } from '../jobHistory';

function stripExtension(fileName: string): string {
  return fileName.replace(/\.pdf$/i, '');
}

export function JobPage() {
  const { jobId = '' } = useParams();
  const stored = useJobHistory().find((job) => job.id === jobId);
  const job = useJob(jobId);

  const title = stored?.fileName ?? 'Conversion';
  const subtitle = stored
    ? `Submitted ${formatDateTime(stored.submittedAt)} · job ${jobId}`
    : `Job ${jobId}`;

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <Button component={Link} to="/convert" startIcon={<ArrowBackIcon />}>
            All conversions
          </Button>
        }
      />
      {job.data && !job.expired && <JobStatusChip status={job.data.status} />}
      <Box sx={{ mt: 2 }}>
        <JobBody job={job} submittedAt={stored?.submittedAt} fileName={title} />
      </Box>
    </>
  );
}

interface JobBodyProps {
  job: ReturnType<typeof useJob>;
  submittedAt?: string;
  fileName: string;
}

/** The main area of the job page for each state: expired, loading, error, running, failed, done. */
function JobBody({ job, submittedAt, fileName }: JobBodyProps) {
  if (job.expired) {
    return (
      <Alert severity="warning">
        <AlertTitle>This conversion is no longer on the server</AlertTitle>
        Results are kept for about an hour, and a server restart clears them. Upload the PDF again
        to convert it.
      </Alert>
    );
  }
  if (job.isPending) return <LoadingState label="Checking the conversion…" />;
  if (job.isError) {
    return (
      <ErrorAlert
        error={job.error}
        title="Cannot load this conversion"
        onRetry={() => job.refetch()}
      />
    );
  }

  const { data } = job;
  switch (data.status) {
    case 'queued':
    case 'running':
      return <JobProgress status={data.status} submittedAt={submittedAt} />;
    case 'failed':
      return <JobFailure error={data.error} httpStatus={data.http_status} />;
    case 'done':
      return data.result ? (
        <ConversionResultView result={data.result} fileBaseName={stripExtension(fileName)} />
      ) : (
        <Alert severity="error">The server reported success but returned no document.</Alert>
      );
  }
}
