import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

import type { ConversionReport, GateResult } from '../types';

const GATES: { key: 'structural' | 'd4k' | 'core'; label: string }[] = [
  { key: 'structural', label: 'Structural (USDM schema)' },
  { key: 'd4k', label: 'd4k rules' },
  { key: 'core', label: 'CDISC CORE' },
];

function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, flex: '1 1 160px' }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" component="p">
        {value}
      </Typography>
      {hint && (
        <Typography variant="caption" color="text.secondary">
          {hint}
        </Typography>
      )}
    </Paper>
  );
}

/** Pass / fail / skipped / error badge for one conformance gate. */
export function GateStatus({ gate }: { gate: GateResult | null | undefined }) {
  if (!gate) return <Chip size="small" label="Not run" variant="outlined" />;
  if (gate.skipped) return <Chip size="small" label="Skipped" variant="outlined" />;
  if (gate.error && gate.passed !== false) {
    return <Chip size="small" label="Error" color="warning" variant="outlined" />;
  }
  return gate.passed ? (
    <Chip size="small" label="Passed" color="success" variant="outlined" />
  ) : (
    <Chip size="small" label="Failed" color="error" variant="outlined" />
  );
}

function gateDetail(gate: GateResult | null | undefined): string {
  if (!gate) return 'The gate did not run.';
  if (gate.skipped) return gate.skipped;
  const parts: string[] = [];
  if (gate.rules_run != null) parts.push(`${gate.rules_run} rules run`);
  if (gate.findings != null) parts.push(`${gate.findings} findings`);
  if (gate.failed_rules?.length) parts.push(`failed: ${gate.failed_rules.join(', ')}`);
  if (gate.error) parts.push(gate.error);
  return parts.join(' · ') || '—';
}

export function ReportSummary({ report }: { report: ConversionReport }) {
  const { decision_summary: decisions } = report;
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" component="h3" gutterBottom>
          Field decisions
        </Typography>
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2 }}>
          <StatCard label="Auto-accepted" value={decisions.auto_accept} hint="No review needed" />
          <StatCard label="Needs review" value={decisions.review} hint="Check against the PDF" />
          <StatCard label="Blocked" value={decisions.block} hint="Not found or failed checks" />
          <StatCard label="Findings" value={report.findings} hint="Issues noted by the pipeline" />
        </Stack>
      </Box>

      <Box>
        <Typography variant="h6" component="h3" gutterBottom>
          Validation
        </Typography>
        <Paper variant="outlined">
          {GATES.map(({ key, label }, index) => {
            const gate = report.validation?.[key];
            return (
              <Stack
                key={key}
                direction="row"
                spacing={2}
                sx={{
                  p: 2,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  rowGap: 1,
                  borderTop: index === 0 ? 0 : 1,
                  borderColor: 'divider',
                }}
              >
                <Typography sx={{ width: { xs: '100%', sm: 200 }, flexShrink: 0 }}>
                  {label}
                </Typography>
                <GateStatus gate={gate} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ overflowWrap: 'anywhere' }}
                >
                  {gateDetail(gate)}
                </Typography>
              </Stack>
            );
          })}
        </Paper>
      </Box>

      <Box>
        <Typography variant="h6" component="h3" gutterBottom>
          Run details
        </Typography>
        <Box
          component="dl"
          sx={{
            display: 'grid',
            gridTemplateColumns: 'max-content 1fr',
            columnGap: 3,
            rowGap: 0.5,
            m: 0,
            '& dt': { color: 'text.secondary' },
            '& dd': { m: 0, fontFamily: 'monospace', overflowWrap: 'anywhere' },
          }}
        >
          <dt>Run id</dt>
          <dd>{report.run_id || '—'}</dd>
          <dt>Source SHA-256</dt>
          <dd>{report.source_sha256 || '—'}</dd>
          <dt>AI readers</dt>
          <dd>{report.llm ? 'on' : 'off (deterministic only)'}</dd>
          <dt>CDISC CORE requested</dt>
          <dd>{report.core_requested ? 'yes' : 'no'}</dd>
        </Box>
      </Box>
    </Stack>
  );
}
