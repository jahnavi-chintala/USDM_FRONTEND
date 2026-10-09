import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';

import { useSettings } from '@/features/settings';
import { getErrorMessage } from '@/shared/api/ApiError';
import { formatDateTime, formatNumber } from '@/shared/utils/format';

import { useCertify } from '../hooks/useReview';
import { DEFAULT_SIGNATURE_MEANING } from '../types';

interface CertifyPanelProps {
  sha: string;
  certified: boolean;
}

/** The Part 11 sign-off: one CERTIFY record with a reviewer id and a signature meaning. */
export function CertifyPanel({ sha, certified }: CertifyPanelProps) {
  const { reviewerId: savedReviewer } = useSettings();
  // Follows the session's reviewer id (it may be set by an edit while this form is open)
  // until the user types a different one here.
  const [typedReviewer, setTypedReviewer] = useState<string | null>(null);
  const reviewerId = typedReviewer ?? savedReviewer;
  const [meaning, setMeaning] = useState(DEFAULT_SIGNATURE_MEANING);
  const certify = useCertify(sha);

  if (certify.isSuccess) {
    const { record, telemetry } = certify.data;
    return (
      <Alert severity="success">
        <AlertTitle>Certified</AlertTitle>
        By {record.reviewer_id} at {formatDateTime(record.timestamp_utc)} — “
        {record.signature_meaning}”.
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          {telemetry.n_edited} of {telemetry.n_fields} field(s) edited before certification.
          {telemetry.mean_distance_of_edited != null &&
            ` Mean post-edit distance (edited fields): ${formatNumber(telemetry.mean_distance_of_edited)}.`}
        </Typography>
      </Alert>
    );
  }

  if (certified) {
    return (
      <Alert severity="success">
        <strong>Certified.</strong>
      </Alert>
    );
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    certify.mutate({ reviewer_id: reviewerId.trim(), signature_meaning: meaning.trim() });
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderColor: 'primary.light',
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
      }}
    >
      <form onSubmit={handleSubmit} aria-label="Certify this run">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ alignItems: { md: 'center' } }}
        >
          <TextField
            label="Reviewer id"
            size="small"
            required
            value={reviewerId}
            onChange={(event) => setTypedReviewer(event.target.value)}
          />
          <TextField
            label="Signature meaning"
            size="small"
            required
            value={meaning}
            onChange={(event) => setMeaning(event.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <Button type="submit" variant="contained" disabled={certify.isPending}>
            {certify.isPending ? 'Certifying…' : 'Certify this run'}
          </Button>
        </Stack>
        {certify.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {getErrorMessage(certify.error)}
          </Alert>
        )}
      </form>
    </Paper>
  );
}
