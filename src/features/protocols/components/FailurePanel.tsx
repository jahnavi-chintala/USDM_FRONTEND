import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { ChangeEvent } from 'react';

import { describeFailure, STAGE_LABEL } from '../errorMessages';
import { ACCEPTED_FILES } from '../fileRules';
import type { ProtocolFailure } from '../types';

interface FailurePanelProps {
  failure: ProtocolFailure;
  onRetry: () => void;
  retrying: boolean;
  onReupload: (file: File) => void;
}

/** What went wrong, what to do about it, and the two ways forward. */
export function FailurePanel({ failure, onRetry, retrying, onReupload }: FailurePanelProps) {
  const description = describeFailure(failure);

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) onReupload(file);
  }

  return (
    <Paper
      variant="outlined"
      component="section"
      aria-labelledby="failure-title"
      sx={{
        borderColor: 'error.light',
        p: { xs: 2.5, sm: 3.5 },
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '64px minmax(0, 1fr)' },
        gap: 2.5,
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          width: 64,
          height: 64,
          borderRadius: 4,
          bgcolor: 'error.light',
          color: 'error.dark',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <WarningAmberRoundedIcon fontSize="large" />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <div>
          <Typography id="failure-title" variant="h2" sx={{ fontSize: '1.125rem' }}>
            {description.title}
          </Typography>
          <Typography sx={{ mt: 0.75, color: 'surface.mutedText' }}>
            Failed at <strong>{STAGE_LABEL[failure.stage]}</strong>. {description.message}
          </Typography>
        </div>
        {failure.errors.length > 0 && (
          <Box component="ul" sx={{ m: 0, pl: 2.5, color: 'surface.mutedText' }}>
            {failure.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </Box>
        )}
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2.5,
            bgcolor: 'surface.subtle',
            border: 1,
            borderColor: 'divider',
          }}
        >
          <strong>What to do:</strong> {description.action}
          {failure.reason && (
            <Typography sx={{ fontSize: '0.75rem', mt: 0.5 }} color="text.secondary">
              Reason code{' '}
              <Box
                component="code"
                sx={{ bgcolor: 'surface.muted', px: 0.75, py: 0.25, borderRadius: 1 }}
              >
                {failure.reason}
              </Box>
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={onRetry}
            disabled={retrying}
          >
            {retrying ? 'Retrying…' : 'Retry processing'}
          </Button>
          <Button
            component="label"
            variant="outlined"
            color="inherit"
            startIcon={<FileUploadOutlinedIcon />}
            sx={{ borderColor: 'divider' }}
          >
            Re-upload file
            <input
              hidden
              type="file"
              accept={ACCEPTED_FILES}
              aria-label="Replacement protocol file"
              onChange={handleFile}
            />
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
