import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router';

import { sourceLabel } from '../sourceLabel';
import type { SourceSummary } from '../types';

export function SourcesTable({ sources }: { sources: SourceSummary[] }) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" aria-label="Sources">
        <TableHead>
          <TableRow>
            <TableCell>Source</TableCell>
            <TableCell align="right">Fields</TableCell>
            <TableCell align="right">Auto-accept</TableCell>
            <TableCell align="right">Review</TableCell>
            <TableCell align="right">Block</TableCell>
            <TableCell align="right">Runs</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sources.map((source) => (
            <TableRow key={source.source_sha256} hover>
              <TableCell sx={{ overflowWrap: 'anywhere' }}>
                <Link component={RouterLink} to={`/review/${source.source_sha256}`}>
                  {sourceLabel(source)}
                </Link>
              </TableCell>
              <TableCell align="right">{source.n_fields}</TableCell>
              <TableCell align="right">{source.decision_summary.auto_accept}</TableCell>
              <TableCell align="right">{source.decision_summary.review}</TableCell>
              <TableCell align="right">{source.decision_summary.block}</TableCell>
              <TableCell align="right">{source.run_ids.length}</TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{
                    color: source.certified ? 'success.main' : 'text.secondary',
                    fontWeight: source.certified ? 600 : 400,
                  }}
                >
                  {source.certified ? 'certified' : 'not certified'}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
