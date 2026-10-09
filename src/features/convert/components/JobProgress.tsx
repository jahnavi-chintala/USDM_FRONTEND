import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { formatDuration, useElapsedSeconds } from '../hooks/useElapsed';
import type { JobStatus } from '../types';

interface JobProgressProps {
  status: Extract<JobStatus, 'queued' | 'running'>;
  submittedAt?: string;
}

export function JobProgress({ status, submittedAt }: JobProgressProps) {
  const elapsed = useElapsedSeconds(submittedAt);
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h6" component="h2">
          {status === 'queued' ? 'Waiting for a free slot…' : 'Converting…'}
        </Typography>
        <LinearProgress aria-label="Conversion in progress" />
        <Typography color="text.secondary">
          {status === 'queued'
            ? 'Other conversions are running; this one starts as soon as one finishes.'
            : 'Reading the protocol, extracting each section and validating the USDM document.'}
          {elapsed !== undefined && ` Elapsed: ${formatDuration(elapsed)}.`}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This page updates by itself. You can leave it and come back from “My conversions”.
        </Typography>
      </Stack>
    </Paper>
  );
}
