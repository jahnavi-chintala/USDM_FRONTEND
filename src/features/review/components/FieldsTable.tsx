import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Paper from '@mui/material/Paper';
import { alpha } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Fragment, useState } from 'react';

import { visuallyHidden } from '@/shared/styles/visuallyHidden';
import { formatNumber } from '@/shared/utils/format';

import type { AuditRecord } from '../types';
import { DecisionChip } from './DecisionChip';
import { EditFieldForm } from './EditFieldForm';
import { FieldHistory } from './FieldHistory';
import { SourceCrop } from './SourceCrop';

/** Confidence below this is highlighted, as in the HTMX review tool. */
export const LOW_CONFIDENCE = 0.5;

type Panel = 'source' | 'history' | 'edit';
type FieldRecord = AuditRecord & { field: string };

const PANEL_LABEL: Record<Panel, string> = { source: 'Source', history: 'History', edit: 'Edit' };

interface FieldsTableProps {
  sha: string;
  /** Current record of every field, in the order to show (the backend sorts worst-first). */
  rows: AuditRecord[];
}

export function FieldsTable({ sha, rows }: FieldsTableProps) {
  const fieldRows = rows.filter((row): row is FieldRecord => row.field !== null);
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" aria-label="Fields">
        <TableHead>
          <TableRow>
            <TableCell>Domain</TableCell>
            <TableCell>Field</TableCell>
            <TableCell>Value</TableCell>
            <TableCell>Decision</TableCell>
            <TableCell align="right">Confidence</TableCell>
            <TableCell>Verify</TableCell>
            <TableCell>
              <Box component="span" sx={visuallyHidden}>
                Actions
              </Box>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fieldRows.map((row) => (
            <FieldRow key={`${row.domain}/${row.field}`} sha={sha} row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function FieldRow({ sha, row }: { sha: string; row: FieldRecord }) {
  const [panel, setPanel] = useState<Panel | null>(null);
  const lowConfidence = row.confidence != null && row.confidence < LOW_CONFIDENCE;
  const source = row.page != null && row.bbox != null ? { page: row.page, bbox: row.bbox } : null;
  const panels: Panel[] = source ? ['source', 'history', 'edit'] : ['history', 'edit'];
  const panelId = `panel-${row.domain}-${row.field}`;

  return (
    <Fragment>
      <TableRow
        data-testid={`row-${row.domain}-${row.field}`}
        sx={{
          '& > td': { borderBottom: panel ? 0 : undefined, verticalAlign: 'top' },
          bgcolor: lowConfidence ? (theme) => alpha(theme.palette.error.main, 0.05) : undefined,
        }}
      >
        <TableCell>{row.domain}</TableCell>
        <TableCell sx={{ fontFamily: 'monospace' }}>{row.field}</TableCell>
        <TableCell sx={{ maxWidth: 320, overflowWrap: 'anywhere' }}>{row.value ?? '—'}</TableCell>
        <TableCell>
          <DecisionChip decision={row.decision} />
        </TableCell>
        <TableCell align="right">{formatNumber(row.confidence)}</TableCell>
        <TableCell>{row.verify_pass ?? '—'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {panels.map((name) => (
            <Button
              key={name}
              size="small"
              variant={panel === name ? 'contained' : 'text'}
              aria-expanded={panel === name}
              aria-controls={panelId}
              aria-label={`${PANEL_LABEL[name]} for ${row.domain}.${row.field}`}
              onClick={() => setPanel((current) => (current === name ? null : name))}
            >
              {name === 'source' ? `p.${row.page}` : PANEL_LABEL[name]}
            </Button>
          ))}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={7} sx={{ py: 0, borderBottom: panel ? undefined : 0 }}>
          <Collapse in={panel !== null} unmountOnExit>
            <Box id={panelId} sx={{ py: 2 }}>
              {panel === 'source' && source && (
                <SourceCrop
                  sha={sha}
                  page={source.page}
                  bbox={source.bbox}
                  quote={row.quote_text}
                />
              )}
              {panel === 'history' && (
                <FieldHistory sha={sha} domain={row.domain} field={row.field} />
              )}
              {panel === 'edit' && (
                <EditFieldForm sha={sha} row={row} onSaved={() => setPanel(null)} />
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
}
