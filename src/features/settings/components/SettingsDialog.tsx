import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState, type FormEvent } from 'react';

import { updateSettings, useSettings } from '../settingsStore';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {/* Mounted only while open, so the form always starts from the saved values. */}
      {open && <SettingsForm onClose={onClose} />}
    </Dialog>
  );
}

function SettingsForm({ onClose }: { onClose: () => void }) {
  const settings = useSettings();
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [reviewerId, setReviewerId] = useState(settings.reviewerId);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    updateSettings({ apiKey: apiKey.trim(), reviewerId: reviewerId.trim() });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <TextField
            label="API key"
            type="password"
            autoComplete="off"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            helperText="Sent as X-API-Key with every request. Leave empty if the API is open. Kept for this browser tab only."
          />
          <TextField
            label="Reviewer id"
            value={reviewerId}
            onChange={(event) => setReviewerId(event.target.value)}
            helperText="Recorded in the audit trail with every approval, rejection and edit."
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="contained">
          Save
        </Button>
      </DialogActions>
    </form>
  );
}
