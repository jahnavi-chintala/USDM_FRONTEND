import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';

interface DownloadDialogProps {
  open: boolean;
  protocolName: string;
  downloading: boolean;
  onClose: () => void;
  onDownload: () => void;
}

export function DownloadDialog({
  open,
  protocolName,
  downloading,
  onClose,
  onDownload,
}: DownloadDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Download USDM output</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 1.5 }}>
          {protocolName} · USDM 4.0 · all classes approved
        </DialogContentText>
        <RadioGroup aria-label="Format" value="json">
          <FormControlLabel
            value="json"
            control={<Radio />}
            label={
              <span>
                <strong>JSON</strong> · CDISC USDM 4.0 (recommended)
              </span>
            }
          />
          <FormControlLabel
            value="xml"
            disabled
            control={<Radio />}
            label={
              <span>
                <strong>XML</strong> · needs backend support
              </span>
            }
          />
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={onDownload} disabled={downloading}>
          {downloading ? 'Preparing…' : 'Download'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
