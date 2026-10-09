import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Link } from 'react-router';

import { ConfidenceBar } from '@/shared/components/ConfidenceBar';
import { StatusPill } from '@/shared/components/StatusPill';
import { formatDateTime } from '@/shared/utils/format';

import { protocolPath, protocolStatusLabel } from '../protocolStatus';
import type { ProtocolStatus, ProtocolSummary } from '../types';

type TabKey = 'progress' | 'approved';
type StatusFilter = 'all' | Exclude<ProtocolStatus, 'approved'>;

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'processing', label: 'Processing' },
  { value: 'in_review', label: 'In Review' },
  { value: 'failed', label: 'Failed' },
];

const COLUMNS = {
  xs: 'minmax(0, 1fr) auto 24px',
  md: '2.2fr 1.3fr 1.3fr 1.6fr 1fr 24px',
};

export function ProtocolTable({ protocols }: { protocols: ProtocolSummary[] }) {
  const [tab, setTab] = useState<TabKey>('progress');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');

  const inProgress = protocols.filter((p) => p.status !== 'approved');
  const approved = protocols.filter((p) => p.status === 'approved');
  const needle = query.trim().toLowerCase();
  const rows = (tab === 'progress' ? inProgress : approved)
    .filter((p) => tab === 'approved' || status === 'all' || p.status === status)
    .filter((p) => `${p.name} ${p.title}`.toLowerCase().includes(needle))
    .sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at));

  const tabLabel = (label: string, count: number, selected: boolean) => (
    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {label}
      <Box
        component="span"
        sx={{
          borderRadius: 999,
          px: 1,
          fontSize: '0.71875rem',
          bgcolor: selected ? 'primary.main' : 'surface.muted',
          color: selected ? 'primary.contrastText' : 'surface.mutedText',
        }}
      >
        {count}
      </Box>
    </Box>
  );

  return (
    <Paper
      variant="outlined"
      component="section"
      aria-label="Protocols"
      sx={{ overflow: 'hidden' }}
    >
      <Tabs
        value={tab}
        onChange={(_, value: TabKey) => setTab(value)}
        sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab
          value="progress"
          label={tabLabel('In Progress', inProgress.length, tab === 'progress')}
        />
        <Tab value="approved" label={tabLabel('Approved', approved.length, tab === 'approved')} />
      </Tabs>

      <Box sx={{ display: 'flex', gap: 1.25, p: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by protocol or study name"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          slotProps={{
            htmlInput: { 'aria-label': 'Search protocols' },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ '& .MuiInputBase-root': { minHeight: 44 } }}
        />
        {tab === 'progress' && (
          <TextField
            select
            size="small"
            label="Status"
            value={status}
            onChange={(event) => setStatus(event.target.value as StatusFilter)}
            sx={{ minWidth: 180, '& .MuiInputBase-root': { minHeight: 44 } }}
          >
            {FILTERS.map((filter) => (
              <MenuItem key={filter.value} value={filter.value}>
                {filter.label}
              </MenuItem>
            ))}
          </TextField>
        )}
      </Box>

      <Box
        aria-hidden="true"
        sx={{
          display: { xs: 'none', md: 'grid' },
          gridTemplateColumns: COLUMNS.md,
          gap: 1.5,
          px: 2,
          py: 1.25,
          bgcolor: 'surface.subtle',
          borderTop: 1,
          borderBottom: 1,
          borderColor: 'surface.rule',
          color: 'text.secondary',
          typography: 'overline',
        }}
      >
        <span>Protocol / Study</span>
        <span>Status</span>
        <span>{tab === 'progress' ? 'Confidence' : 'Final confidence'}</span>
        <span>File</span>
        <span>Uploaded</span>
        <span />
      </Box>

      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {rows.map((protocol) => {
          const { label, tone } = protocolStatusLabel(protocol);
          return (
            <li key={protocol.id}>
              <Box
                component={Link}
                to={protocolPath(protocol.id)}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: COLUMNS,
                  gap: 1.5,
                  alignItems: 'center',
                  px: 2,
                  py: 1.75,
                  borderBottom: 1,
                  borderColor: 'surface.rule',
                  color: 'text.primary',
                  textDecoration: 'none',
                  '&:hover': { bgcolor: 'surface.subtle' },
                  '&:focus-visible': {
                    outline: 2,
                    outlineColor: 'primary.main',
                    outlineOffset: -2,
                  },
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography component="span" sx={{ display: 'block', fontWeight: 700 }}>
                    {protocol.name}
                  </Typography>
                  <Typography
                    component="span"
                    color="text.secondary"
                    sx={{ display: 'block', fontSize: '0.78125rem', overflowWrap: 'anywhere' }}
                  >
                    {protocol.title}
                  </Typography>
                </Box>
                <span>
                  <StatusPill tone={tone}>{label}</StatusPill>
                </span>
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <ConfidenceBar value={protocol.confidence} />
                </Box>
                <Typography
                  component="span"
                  color="text.secondary"
                  sx={{ display: { xs: 'none', md: 'block' }, overflowWrap: 'anywhere' }}
                >
                  {protocol.file_name}
                </Typography>
                <Typography
                  component="span"
                  color="text.secondary"
                  sx={{ display: { xs: 'none', md: 'block' } }}
                >
                  {formatDateTime(protocol.uploaded_at)}
                </Typography>
                <ChevronRightIcon fontSize="small" sx={{ color: 'text.disabled' }} />
              </Box>
            </li>
          );
        })}
      </Box>

      {rows.length === 0 && (
        <Typography
          sx={{ py: 6, px: 2, textAlign: 'center', fontWeight: 600 }}
          color="text.secondary"
        >
          {needle || status !== 'all'
            ? 'No protocols match your search.'
            : tab === 'progress'
              ? 'No protocols in progress. Upload one to start.'
              : 'No approved protocols yet.'}
        </Typography>
      )}
    </Paper>
  );
}
