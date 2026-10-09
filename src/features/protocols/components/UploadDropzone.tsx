import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState, type ChangeEvent, type DragEvent } from 'react';

import { ACCEPTED_FILES, rejectFile } from '../fileRules';

interface UploadDropzoneProps {
  /** Called with the files that passed the checks (type and size). */
  onFiles: (files: File[]) => void;
}

const FORMAT_TAGS = ['PDF', 'DOCX', 'Up to 60 MB each'];

export function UploadDropzone({ onFiles }: UploadDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const [refused, setRefused] = useState<string[]>([]);

  function take(list: FileList | null) {
    const files = Array.from(list ?? []);
    if (!files.length) return;
    const reasons = files.map(rejectFile);
    setRefused(reasons.filter((reason): reason is string => reason !== null));
    const accepted = files.filter((_, index) => reasons[index] === null);
    if (accepted.length) onFiles(accepted);
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    take(event.dataTransfer.files);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    take(event.target.files);
    event.target.value = ''; // allow choosing the same file again
  }

  return (
    <Box
      component="section"
      aria-labelledby="upload-heading"
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      sx={{
        border: 2,
        borderStyle: 'dashed',
        borderColor: dragging ? 'primary.main' : 'surface.dashed',
        bgcolor: dragging ? 'primary.light' : 'background.paper',
        borderRadius: 4,
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: 3.5,
          bgcolor: 'primary.light',
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <InsertDriveFileOutlinedIcon />
      </Box>
      <Typography id="upload-heading" variant="h2" sx={{ fontSize: '1.125rem' }}>
        Upload protocol
      </Typography>
      <Typography color="text.secondary">
        Drag and drop, or browse. Select several files for a bulk upload.
      </Typography>
      <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
        {FORMAT_TAGS.map((tag) => (
          <Box
            key={tag}
            component="span"
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 800,
              borderRadius: 1.5,
              px: 1,
              py: 0.25,
              bgcolor: 'surface.muted',
              color: 'surface.mutedText',
            }}
          >
            {tag}
          </Box>
        ))}
      </Stack>
      <Button
        component="label"
        variant="contained"
        startIcon={<FileUploadOutlinedIcon />}
        sx={{ mt: 1 }}
      >
        Choose files
        <input
          hidden
          type="file"
          multiple
          accept={ACCEPTED_FILES}
          aria-label="Protocol files"
          onChange={handleChange}
        />
      </Button>
      {refused.length > 0 && (
        <Alert severity="error" sx={{ mt: 1, textAlign: 'left', width: '100%' }}>
          <AlertTitle>
            {refused.length === 1 ? 'This file was not uploaded' : 'These files were not uploaded'}
          </AlertTitle>
          {refused.map((reason) => (
            <div key={reason}>{reason}</div>
          ))}
        </Alert>
      )}
    </Box>
  );
}
