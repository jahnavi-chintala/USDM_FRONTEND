import DownloadIcon from '@mui/icons-material/Download';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useState } from 'react';

import { downloadJson } from '@/shared/utils/download';

import type { ConversionResult } from '../types';
import { JsonTree } from './JsonTree';
import { ReportSummary } from './ReportSummary';

interface ConversionResultViewProps {
  result: ConversionResult;
  /** Base for download file names, usually the uploaded PDF's name without extension. */
  fileBaseName: string;
}

type TabId = 'summary' | 'json';

export function ConversionResultView({ result, fileBaseName }: ConversionResultViewProps) {
  const [tab, setTab] = useState<TabId>('summary');
  const { review, block } = result.report.decision_summary;

  return (
    <Stack spacing={2}>
      <Alert severity={block > 0 ? 'warning' : 'success'}>
        The USDM document is ready.
        {review + block > 0 &&
          ` ${review + block} field(s) need a human check before the result can be certified.`}
      </Alert>

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={() => downloadJson(result.usdm, `${fileBaseName}.usdm.json`)}
        >
          Download USDM JSON
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => downloadJson(result.report, `${fileBaseName}.report.json`)}
        >
          Download report
        </Button>
      </Stack>

      <Paper variant="outlined">
        <Tabs value={tab} onChange={(_, value: TabId) => setTab(value)} aria-label="Result views">
          <Tab label="Summary" value="summary" id="tab-summary" aria-controls="panel-summary" />
          <Tab label="USDM JSON" value="json" id="tab-json" aria-controls="panel-json" />
        </Tabs>
        <Box
          role="tabpanel"
          id={`panel-${tab}`}
          aria-labelledby={`tab-${tab}`}
          sx={{ p: 3, borderTop: 1, borderColor: 'divider', overflowX: 'auto' }}
        >
          {tab === 'summary' ? (
            <ReportSummary report={result.report} />
          ) : (
            <JsonTree data={result.usdm} initialDepth={2} />
          )}
        </Box>
      </Paper>
    </Stack>
  );
}
