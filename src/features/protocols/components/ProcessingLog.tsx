import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import type { LogEntry, LogLevel } from '../types';

const LEVEL_COLOR: Record<LogLevel, string> = {
  info: 'console.text',
  success: 'console.success',
  warning: 'console.warning',
  error: 'console.error',
};

function time(at: string): string {
  const date = new Date(at);
  return Number.isNaN(date.getTime())
    ? at
    : date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/** The backend's processing messages, newest last, on a dark console-like panel. */
export function ProcessingLog({ entries }: { entries: LogEntry[] }) {
  return (
    <Box
      component="section"
      aria-label="Processing log"
      sx={{
        bgcolor: 'console.bg',
        color: LEVEL_COLOR.info,
        borderRadius: 3,
        p: 2.25,
        fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
        fontSize: '0.78125rem',
        lineHeight: 1.8,
        minHeight: 340,
      }}
    >
      {entries.length === 0 && (
        <Typography sx={{ font: 'inherit' }}>Waiting for the first step…</Typography>
      )}
      <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0 }} aria-live="polite">
        {entries.map((entry, index) => (
          <li key={`${entry.at}-${index}`}>
            <Box component="span" sx={{ color: 'console.time' }}>
              {time(entry.at)}
            </Box>{' '}
            <Box component="span" sx={{ color: LEVEL_COLOR[entry.level] }}>
              {entry.message}
            </Box>
          </li>
        ))}
      </Box>
    </Box>
  );
}
