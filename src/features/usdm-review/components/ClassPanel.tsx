import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';

import { ConfidenceBar } from '@/shared/components/ConfidenceBar';
import { StatusPill } from '@/shared/components/StatusPill';

import { classConfidence, LOW_CONFIDENCE } from '../confidence';
import type { ClassAction } from '../hooks/useReview';
import type { UsdmClass } from '../types';
import { CLASS_STATUS } from './classStatus';
import { FieldCard } from './FieldCard';
import { SoaTable } from './SoaTable';

interface ClassPanelProps {
  usdmClass: UsdmClass;
  selectedFieldId: string | null;
  onSelectField: (id: string) => void;
  /** False once the protocol is approved: the class is read-only. */
  reviewable: boolean;
  /** Without a reviewer id no decision can be recorded. */
  reviewerMissing: boolean;
  onOpenSettings: () => void;
  busy: boolean;
  onAction: (action: ClassAction) => void;
}

/** The selected class: its values with their quotes, and the review decisions. */
export function ClassPanel(props: ClassPanelProps) {
  // A new class starts with a fresh edit form.
  return <ClassPanelBody key={props.usdmClass.id} {...props} />;
}

function ClassPanelBody({
  usdmClass,
  selectedFieldId,
  onSelectField,
  reviewable,
  reviewerMissing,
  onOpenSettings,
  busy,
  onAction,
}: ClassPanelProps) {
  const [draft, setDraft] = useState<Record<string, string> | null>(null);
  const [reason, setReason] = useState('');
  const editing = draft !== null;
  const status = CLASS_STATUS[usdmClass.status];
  const value = classConfidence(usdmClass);
  const reextracting = usdmClass.status === 'reextracting';
  const locked = busy || reextracting || reviewerMissing;

  function startEdit() {
    setDraft(Object.fromEntries(usdmClass.fields.map((f) => [f.id, f.value])));
    setReason('');
  }

  function save(event: FormEvent) {
    event.preventDefault();
    if (!draft || !reason.trim()) return;
    const changed = Object.fromEntries(
      Object.entries(draft).filter(
        ([id, newValue]) => usdmClass.fields.find((f) => f.id === id)?.value !== newValue,
      ),
    );
    onAction({ kind: 'edit', classId: usdmClass.id, values: changed, reason: reason.trim() });
    setDraft(null);
  }

  const modelNote =
    usdmClass.status === 'pending' || reextracting
      ? ''
      : ` · model confidence ${usdmClass.model_confidence}%`;

  return (
    <Paper
      variant="outlined"
      component="section"
      aria-label="Extracted data"
      sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.25,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 1.5,
          }}
        >
          <div>
            <Typography variant="h2">{usdmClass.name}</Typography>
            <Typography sx={{ fontSize: '0.75rem' }} color="text.secondary">
              USDM: {usdmClass.usdm_classes.join(', ')} · Source p. {usdmClass.page}
              {modelNote}
            </Typography>
          </div>
          <StatusPill tone={status.tone}>{status.label}</StatusPill>
        </Box>
        <ConfidenceBar value={value} width={200} />
      </Box>

      <Box
        component={editing ? 'form' : 'div'}
        onSubmit={editing ? save : undefined}
        aria-label={editing ? `Edit ${usdmClass.name}` : undefined}
        sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.25, flexGrow: 1 }}>
          {usdmClass.status === 'rejected' && (
            <Alert severity="error">
              Marked incorrect. Edit the values or re-extract this class; it must be approved before
              the protocol can complete.
            </Alert>
          )}
          {usdmClass.status === 'pending' && usdmClass.model_confidence < LOW_CONFIDENCE && (
            <Alert severity="warning">
              Low confidence. Check each value against the highlighted source before approving.
            </Alert>
          )}
          {reextracting && (
            <Alert severity="info">
              This class is being extracted again. The values update when it finishes.
            </Alert>
          )}
          {usdmClass.soa && <SoaTable soa={usdmClass.soa} />}
          {usdmClass.fields.map((field) => (
            <FieldCard
              key={field.id}
              field={field}
              selected={field.id === selectedFieldId}
              onSelect={() => onSelectField(field.id)}
              editValue={draft?.[field.id]}
              onEditValue={
                draft ? (newValue) => setDraft({ ...draft, [field.id]: newValue }) : undefined
              }
            />
          ))}
          {editing && (
            <TextField
              required
              label="Reason for change"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              helperText="Recorded in the audit trail with your reviewer id."
            />
          )}
        </Box>

        {reviewable && (
          <Box
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              alignItems: 'center',
              position: { xs: 'sticky', md: 'static' },
              bottom: 0,
              bgcolor: 'background.paper',
              borderBottomLeftRadius: 12,
              borderBottomRightRadius: 12,
            }}
          >
            {reviewerMissing && (
              <Alert
                severity="info"
                sx={{ width: '100%', mb: 0.5 }}
                action={
                  <Button color="inherit" size="small" onClick={onOpenSettings}>
                    Open Settings
                  </Button>
                }
              >
                Set your reviewer id in Settings to record review decisions.
              </Alert>
            )}
            {editing ? (
              <>
                <Button type="submit" variant="contained" disabled={!reason.trim() || busy}>
                  Save changes
                </Button>
                <Button
                  color="inherit"
                  variant="outlined"
                  onClick={() => setDraft(null)}
                  sx={{ borderColor: 'divider' }}
                >
                  Cancel
                </Button>
                <Typography sx={{ fontSize: '0.75rem' }} color="text.secondary">
                  Edits are logged to the audit trail.
                </Typography>
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckIcon />}
                  disabled={locked || usdmClass.status === 'approved'}
                  onClick={() => onAction({ kind: 'approve', classId: usdmClass.id })}
                >
                  Approve
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CloseIcon />}
                  disabled={locked || usdmClass.status === 'rejected'}
                  onClick={() => onAction({ kind: 'reject', classId: usdmClass.id })}
                  sx={{ bgcolor: 'background.paper' }}
                >
                  Reject
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<EditOutlinedIcon />}
                  disabled={locked}
                  onClick={startEdit}
                  sx={{ borderColor: 'divider' }}
                >
                  Edit
                </Button>
                <Box sx={{ flexGrow: 1 }} />
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<RefreshIcon />}
                  disabled={locked}
                  onClick={() => onAction({ kind: 'reextract', classId: usdmClass.id })}
                  sx={{ borderColor: 'divider' }}
                >
                  Re-extract
                </Button>
              </>
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
}
