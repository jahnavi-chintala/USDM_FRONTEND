import CheckIcon from '@mui/icons-material/Check';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { STAGE_LABEL } from '../errorMessages';
import { PROCESSING_STAGES, type ProcessingStage } from '../types';

const DESCRIPTIONS: Record<ProcessingStage, string> = {
  extracting_text: 'Reading raw text, tables and layout from the uploaded PDF or Word document.',
  mapping_to_usdm:
    'Mapping extracted content to CDISC USDM classes; each value is tied to a verbatim source quote.',
  validating:
    'Checking the mapped study against the USDM schema and conformance rules before review.',
};

type StepState = 'done' | 'active' | 'waiting';

interface ProcessingStepsProps {
  stage: ProcessingStage;
  progress: number | null;
}

/** The three stages with the current one highlighted and its progress. */
export function ProcessingSteps({ stage, progress }: ProcessingStepsProps) {
  const current = PROCESSING_STAGES.indexOf(stage);
  return (
    <Paper
      variant="outlined"
      component="section"
      aria-labelledby="processing-heading"
      sx={{ p: 3.25 }}
    >
      <Typography id="processing-heading" variant="h2" sx={{ mb: 1.75 }}>
        Processing
      </Typography>
      <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {PROCESSING_STAGES.map((step, index) => {
          const state: StepState =
            index < current ? 'done' : index === current ? 'active' : 'waiting';
          return (
            <Box
              component="li"
              key={step}
              aria-current={state === 'active' ? 'step' : undefined}
              sx={{ display: 'grid', gridTemplateColumns: '44px minmax(0, 1fr)', gap: 2, pb: 2.75 }}
            >
              <Box
                aria-hidden="true"
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  border: 2,
                  ...(state === 'done' && {
                    bgcolor: 'primary.main',
                    borderColor: 'primary.main',
                    color: 'common.white',
                  }),
                  ...(state === 'active' && {
                    color: 'info.main',
                    borderColor: 'secondary.main',
                    boxShadow: (t) => `0 0 0 6px ${t.palette.info.light}`,
                  }),
                  ...(state === 'waiting' && { color: 'text.secondary', borderColor: 'divider' }),
                }}
              >
                {state === 'done' ? <CheckIcon fontSize="small" /> : index + 1}
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, pt: 1 }}>
                <Typography variant="h3">{STAGE_LABEL[step]}</Typography>
                <Typography color="text.secondary">{DESCRIPTIONS[step]}</Typography>
                {state === 'active' && (
                  <LinearProgress
                    variant={progress == null ? 'indeterminate' : 'determinate'}
                    value={progress ?? 0}
                    aria-label={`${STAGE_LABEL[step]} progress`}
                    sx={{ height: 8, maxWidth: 420, bgcolor: 'surface.muted' }}
                  />
                )}
                <Typography
                  sx={{ fontSize: '0.78125rem', fontWeight: 700 }}
                  color={
                    state === 'done'
                      ? 'success.dark'
                      : state === 'active'
                        ? 'info.main'
                        : 'text.secondary'
                  }
                >
                  {state === 'done'
                    ? 'Done'
                    : state === 'active'
                      ? `In progress${progress == null ? '' : ` · ${progress}%`}`
                      : 'Waiting'}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
      <Typography
        sx={{
          p: 1.5,
          borderRadius: 2.5,
          bgcolor: 'info.light',
          color: 'info.dark',
          fontSize: '0.8125rem',
        }}
      >
        You can leave this page. The protocol stays in In Progress and opens for review
        automatically once validation passes.
      </Typography>
    </Paper>
  );
}
