import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DownloadIcon from '@mui/icons-material/Download';
import StorageIcon from '@mui/icons-material/Storage';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

interface ApprovedBannerProps {
  classCount: number;
  stored: boolean;
  storing: boolean;
  onDownload: () => void;
  onStore: () => void;
}

/** Shown once every class is approved: the output can be downloaded or stored. */
export function ApprovedBanner({
  classCount,
  stored,
  storing,
  onDownload,
  onStore,
}: ApprovedBannerProps) {
  return (
    <Paper
      component="section"
      aria-label="Approved"
      sx={{
        bgcolor: 'success.light',
        border: 1,
        borderColor: 'success.main',
        borderRadius: 3,
        p: 2.5,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <CheckCircleOutlineIcon sx={{ color: 'success.dark', fontSize: 36 }} />
      <Box sx={{ flexGrow: 1, minWidth: 220 }}>
        <Typography variant="h2">Approved · all {classCount} classes verified</Typography>
        <Typography color="success.dark">
          The final USDM 4.0 output is ready to download or store.
        </Typography>
      </Box>
      <Button
        variant="outlined"
        color="inherit"
        startIcon={<DownloadIcon />}
        onClick={onDownload}
        sx={{ bgcolor: 'background.paper', borderColor: 'divider' }}
      >
        Download USDM JSON
      </Button>
      <Button
        variant="contained"
        color={stored ? 'success' : 'primary'}
        startIcon={<StorageIcon />}
        onClick={onStore}
        disabled={storing || stored}
        sx={{ '&.Mui-disabled': stored ? { bgcolor: 'success.dark', color: 'common.white' } : {} }}
      >
        {stored ? 'Stored in database' : storing ? 'Storing…' : 'Store to database'}
      </Button>
    </Paper>
  );
}
