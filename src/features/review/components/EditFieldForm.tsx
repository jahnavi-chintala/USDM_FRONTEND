import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState, type FormEvent } from 'react';

import { useSettings } from '@/features/settings';
import { getErrorMessage } from '@/shared/api/ApiError';

import { useEditField } from '../hooks/useReview';
import type { AuditRecord } from '../types';

interface EditFieldFormProps {
  sha: string;
  row: AuditRecord & { field: string };
  onSaved: () => void;
}

/**
 * Changes a field's value. Nothing is overwritten: the backend appends a REVIEW_EDIT record
 * carrying the prior value and the reason, which then becomes the field's current value.
 */
export function EditFieldForm({ sha, row, onSaved }: EditFieldFormProps) {
  const { reviewerId: savedReviewer } = useSettings();
  const [value, setValue] = useState(row.value ?? '');
  const [reason, setReason] = useState('');
  const [reviewerId, setReviewerId] = useState(savedReviewer);
  const edit = useEditField(sha);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    edit.mutate(
      {
        domain: row.domain,
        field: row.field,
        body: { value, reason: reason.trim(), reviewer_id: reviewerId.trim() },
      },
      { onSuccess: onSaved },
    );
  }

  return (
    <form onSubmit={handleSubmit} aria-label={`Edit ${row.domain}.${row.field}`}>
      <Stack spacing={2} sx={{ maxWidth: 640 }}>
        <TextField
          label="Value"
          size="small"
          required
          multiline
          maxRows={6}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <TextField
          label="Reason for change"
          size="small"
          required
          multiline
          minRows={2}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
        <TextField
          label="Reviewer id"
          size="small"
          required
          value={reviewerId}
          onChange={(event) => setReviewerId(event.target.value)}
        />
        {edit.isError && <Alert severity="error">{getErrorMessage(edit.error)}</Alert>}
        <div>
          <Button type="submit" variant="contained" disabled={edit.isPending}>
            {edit.isPending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </Stack>
    </form>
  );
}
