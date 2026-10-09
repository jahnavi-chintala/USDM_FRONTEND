import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Snackbar from '@mui/material/Snackbar';
import { useState } from 'react';

import { SettingsDialog, useSettings } from '@/features/settings';
import { getErrorMessage } from '@/shared/api/ApiError';
import { Breadcrumbs } from '@/shared/components/Breadcrumbs';
import { ErrorAlert } from '@/shared/components/ErrorAlert';
import { LoadingState } from '@/shared/components/LoadingState';
import { downloadJson } from '@/shared/utils/download';

import { getUsdm } from '../api/reviewApi';
import { overallConfidence } from '../confidence';
import {
  useClassAction,
  useClasses,
  useProtocolAction,
  type ClassAction,
} from '../hooks/useReview';
import type { ReviewProtocol, UsdmClass } from '../types';
import { ApprovedBanner } from './ApprovedBanner';
import { ClassNav } from './ClassNav';
import { ClassPanel } from './ClassPanel';
import { DownloadDialog } from './DownloadDialog';
import { ReviewHeader } from './ReviewHeader';
import { SourcePanel } from './SourcePanel';

interface ReviewWorkspaceProps {
  protocol: ReviewProtocol;
  /** Called after any decision, since it may change the protocol's status. */
  onProtocolChange: () => void;
}

interface Toast {
  title: string;
  detail: string;
}

/** The first class that still needs a decision, else the first class. */
function firstOpen(classes: UsdmClass[], after = -1): string | undefined {
  const open = (c: UsdmClass) => c.status !== 'approved';
  return classes.slice(after + 1).find(open)?.id ?? classes.find(open)?.id ?? classes[0]?.id;
}

/** Review per USDM class: class list, extracted values, and the source page side by side. */
export function ReviewWorkspace({ protocol, onProtocolChange }: ReviewWorkspaceProps) {
  const classes = useClasses(protocol.id);

  if (classes.isPending) return <LoadingState label="Loading the extracted classes…" />;
  if (classes.isError) {
    return (
      <ErrorAlert
        title="The extracted classes could not be loaded"
        error={classes.error}
        onRetry={() => void classes.refetch()}
      />
    );
  }
  return (
    <Workspace protocol={protocol} classes={classes.data} onProtocolChange={onProtocolChange} />
  );
}

function Workspace({
  protocol,
  classes,
  onProtocolChange,
}: ReviewWorkspaceProps & { classes: UsdmClass[] }) {
  const { reviewerId } = useSettings();
  const [selectedId, setSelectedId] = useState(() => firstOpen(classes) ?? '');
  const [fieldId, setFieldId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [confirmReextract, setConfirmReextract] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const classAction = useClassAction(protocol.id, onProtocolChange);
  const protocolAction = useProtocolAction(protocol.id, onProtocolChange);

  const current = classes.find((c) => c.id === selectedId) ?? classes[0];
  const done = protocol.status === 'approved' || classes.every((c) => c.status === 'approved');
  const confidence = overallConfidence(classes);
  if (!current) return null;

  const selectedField = current.fields.find((f) => f.id === fieldId) ?? current.fields[0];
  const page = selectedField?.page ?? current.page;
  const marks = current.fields
    .filter((f) => f.page === page)
    .map((f) => ({ id: f.id, quote: f.quote }));

  function select(id: string) {
    setSelectedId(id);
    setFieldId(null);
  }

  function act(action: ClassAction) {
    classAction.mutate(action, {
      onSuccess: (updated) => {
        const next = classes.map((c) => (c.id === updated.id ? updated : c));
        if (action.kind === 'approve') {
          const all = next.every((c) => c.status === 'approved');
          setToast(
            all
              ? {
                  title: 'Protocol approved',
                  detail: `${protocol.name} moved to Approved. Download or store the USDM output.`,
                }
              : { title: 'Approved', detail: `${updated.name} verified.` },
          );
          if (!all)
            select(
              firstOpen(
                next,
                next.findIndex((c) => c.id === updated.id),
              ) ?? updated.id,
            );
        } else if (action.kind === 'reject') {
          setToast({ title: 'Rejected', detail: `${updated.name} flagged as incorrect.` });
        } else if (action.kind === 'edit') {
          setToast({
            title: 'Changes saved',
            detail: 'Approve the class to confirm the corrected values.',
          });
        } else {
          setToast({ title: 'Re-extracting', detail: `${updated.name} is being extracted again.` });
        }
      },
      onError: (error) => setToast({ title: 'Not saved', detail: getErrorMessage(error) }),
    });
  }

  async function download() {
    setDownloading(true);
    try {
      downloadJson(await getUsdm(protocol.id), `${protocol.name}.usdm.json`);
      setDownloadOpen(false);
      setToast({ title: 'Download started', detail: `${protocol.name}.usdm.json` });
    } catch (error) {
      setToast({ title: 'Download failed', detail: getErrorMessage(error) });
    } finally {
      setDownloading(false);
    }
  }

  function store() {
    protocolAction.mutate('store', {
      onSuccess: () =>
        setToast({
          title: 'Stored to database',
          detail: `${protocol.name} is saved in the repository.`,
        }),
      onError: (error) => setToast({ title: 'Not stored', detail: getErrorMessage(error) }),
    });
  }

  function reextractAll() {
    setConfirmReextract(false);
    protocolAction.mutate('reextract', {
      onError: (error) => setToast({ title: 'Not restarted', detail: getErrorMessage(error) }),
    });
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: done ? 'Approved' : 'In Progress', to: '/' },
          { label: protocol.name },
        ]}
      />
      {done && (
        <ApprovedBanner
          classCount={classes.length}
          stored={protocol.stored}
          storing={protocolAction.isPending}
          onDownload={() => setDownloadOpen(true)}
          onStore={store}
        />
      )}
      <ReviewHeader
        protocol={protocol}
        confidence={confidence}
        done={done}
        canReextract={!!reviewerId && !protocolAction.isPending}
        onReextract={() => setConfirmReextract(true)}
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            md: '240px minmax(0, 1fr)',
            lg: '270px minmax(0, 1fr) minmax(0, 1fr)',
          },
          gap: 2,
          alignItems: 'start',
        }}
      >
        <ClassNav classes={classes} selectedId={current.id} onSelect={select} />
        <ClassPanel
          usdmClass={current}
          selectedFieldId={selectedField?.id ?? null}
          onSelectField={setFieldId}
          reviewable={!done}
          reviewerMissing={!reviewerId}
          onOpenSettings={() => setSettingsOpen(true)}
          busy={classAction.isPending}
          onAction={act}
        />
        <Box sx={{ gridColumn: { md: '2', lg: 'auto' } }}>
          <SourcePanel
            protocolId={protocol.id}
            fileName={protocol.file_name}
            page={page}
            marks={marks}
            selectedId={selectedField?.id ?? null}
          />
        </Box>
      </Box>

      <DownloadDialog
        open={downloadOpen}
        protocolName={protocol.name}
        downloading={downloading}
        onClose={() => setDownloadOpen(false)}
        onDownload={() => void download()}
      />
      <Dialog open={confirmReextract} onClose={() => setConfirmReextract(false)}>
        <DialogTitle>Re-extract the whole protocol?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {protocol.name} is processed again from the start. Every review decision on it is
            cleared, and it returns to In Progress.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setConfirmReextract(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={reextractAll}>
            Re-extract
          </Button>
        </DialogActions>
      </Dialog>
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <Snackbar
        open={toast !== null}
        autoHideDuration={3200}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        message={
          toast && (
            <span>
              <strong>{toast.title}</strong>
              <br />
              {toast.detail}
            </span>
          )
        }
        slotProps={{ content: { sx: { bgcolor: 'brand.navy', borderRadius: 3 } } }}
      />
    </Box>
  );
}
