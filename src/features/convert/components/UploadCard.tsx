import UploadFileIcon from '@mui/icons-material/UploadFile';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState, type ChangeEvent, type DragEvent } from 'react';

import { formatBytes } from '@/shared/utils/format';

import type { ErrorDescription } from '../errorMessages';

interface UploadCardProps {
  onSubmit: (file: File) => void;
  submitting: boolean;
  error?: ErrorDescription;
}

function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

export function UploadCard({ onSubmit, submitting, error }: UploadCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [typeError, setTypeError] = useState(false);

  function choose(candidate: File | undefined) {
    if (!candidate) return;
    const valid = isPdf(candidate);
    setTypeError(!valid);
    setFile(valid ? candidate : null);
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    choose(event.dataTransfer.files[0]);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    choose(event.target.files?.[0]);
    event.target.value = ''; // allow choosing the same file again
  }

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Box
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          sx={{
            border: 2,
            borderStyle: 'dashed',
            borderColor: dragging ? 'primary.main' : 'divider',
            bgcolor: dragging ? 'action.hover' : 'transparent',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
          }}
        >
          <UploadFileIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography sx={{ mt: 1 }}>Drag a protocol PDF here, or</Typography>
          <Button component="label" variant="outlined" sx={{ mt: 1 }} disabled={submitting}>
            Choose file
            <input
              hidden
              type="file"
              accept="application/pdf,.pdf"
              aria-label="Protocol PDF"
              onChange={handleChange}
            />
          </Button>
        </Box>

        {typeError && <Alert severity="warning">Only PDF files can be converted.</Alert>}

        {file && (
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography sx={{ flexGrow: 1, overflowWrap: 'anywhere' }}>
              <strong>{file.name}</strong> · {formatBytes(file.size)}
            </Typography>
            <Button variant="contained" disabled={submitting} onClick={() => onSubmit(file)}>
              {submitting ? 'Uploading…' : 'Convert'}
            </Button>
          </Stack>
        )}

        {error && (
          <Alert severity="error">
            <AlertTitle>{error.title}</AlertTitle>
            {error.message}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary">
          A conversion usually takes a few minutes. You can leave the page and come back: your
          conversions are listed below.
        </Typography>
      </Stack>
    </Paper>
  );
}
