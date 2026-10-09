import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router';

import { EmptyState } from '@/shared/components/EmptyState';
import { visuallyHidden } from '@/shared/styles/visuallyHidden';
import { formatBytes, formatDateTime } from '@/shared/utils/format';

import type { StoredJob } from '../jobHistory';
import { JobStatusChip } from './JobStatusChip';

interface JobHistoryListProps {
  jobs: StoredJob[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function JobHistoryList({ jobs, onRemove, onClear }: JobHistoryListProps) {
  return (
    <Stack spacing={1.5}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" component="h2">
          My conversions
        </Typography>
        {jobs.length > 0 && (
          <Button size="small" onClick={onClear}>
            Clear list
          </Button>
        )}
      </Stack>

      {jobs.length === 0 ? (
        <EmptyState title="No conversions yet">Upload a protocol PDF above to start.</EmptyState>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small" aria-label="My conversions">
            <TableHead>
              <TableRow>
                <TableCell>File</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">
                  <Box component="span" sx={visuallyHidden}>
                    Actions
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id} hover>
                  <TableCell sx={{ overflowWrap: 'anywhere' }}>
                    <Link component={RouterLink} to={`/convert/jobs/${job.id}`}>
                      {job.fileName}
                    </Link>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      {formatBytes(job.fileSize)}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDateTime(job.submittedAt)}</TableCell>
                  <TableCell>
                    <JobStatusChip status={job.status} />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Remove from list">
                      <IconButton
                        size="small"
                        aria-label={`Remove ${job.fileName} from list`}
                        onClick={() => onRemove(job.id)}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Typography variant="caption" color="text.secondary">
        The server keeps results for about an hour; older entries show as expired. This list is
        stored in this browser only.
      </Typography>
    </Stack>
  );
}
