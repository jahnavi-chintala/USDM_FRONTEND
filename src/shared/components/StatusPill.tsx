import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

/** Colour pairs (background, text) used by the status pills of the design. */
export type PillTone = 'primary' | 'info' | 'success' | 'warning' | 'error' | 'edited' | 'neutral';

const TONES: Record<PillTone, (theme: Theme) => { bgcolor: string; color: string }> = {
  primary: (t) => ({ bgcolor: t.palette.primary.light, color: t.palette.primary.main }),
  info: (t) => ({ bgcolor: t.palette.info.light, color: t.palette.info.main }),
  success: (t) => ({ bgcolor: t.palette.success.light, color: t.palette.success.dark }),
  warning: (t) => ({ bgcolor: t.palette.warning.light, color: t.palette.warning.dark }),
  error: (t) => ({ bgcolor: t.palette.error.light, color: t.palette.error.dark }),
  edited: (t) => ({ bgcolor: t.palette.edited.light, color: t.palette.edited.main }),
  neutral: (t) => ({ bgcolor: t.palette.surface.muted, color: t.palette.surface.mutedText }),
};

export function StatusPill({ tone, children }: { tone: PillTone; children: ReactNode }) {
  return (
    <Box
      component="span"
      sx={(theme) => ({
        ...TONES[tone](theme),
        display: 'inline-flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        borderRadius: 999,
        px: 1.25,
        py: 0.375,
        fontSize: '0.75rem',
        fontWeight: 700,
        lineHeight: 1.5,
      })}
    >
      {children}
    </Box>
  );
}
