import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';

import { confidenceColor } from '../utils/confidence';

interface ConfidenceBarProps {
  /** 0–100, or null when there is no score yet. */
  value: number | null;
  width?: number;
}

/** A short coloured bar with the percentage next to it; an em dash when there is no score. */
export function ConfidenceBar({ value, width = 110 }: ConfidenceBarProps) {
  if (value == null) {
    return (
      <Typography component="span" sx={{ fontWeight: 700 }} color="text.secondary">
        —
      </Typography>
    );
  }
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
      <LinearProgress
        variant="determinate"
        value={value}
        color={confidenceColor(value)}
        aria-label={`Confidence ${value}%`}
        sx={{ width, height: 6, bgcolor: 'surface.muted', flexShrink: 0 }}
      />
      <Typography component="span" sx={{ fontWeight: 800, fontSize: '0.8125rem' }}>
        {value}%
      </Typography>
    </Box>
  );
}
