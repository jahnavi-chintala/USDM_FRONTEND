import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { confidenceColor } from '@/shared/utils/confidence';

/** The protocol's overall confidence as a ring. */
export function ConfidenceRing({ value, size = 86 }: { value: number; size?: number }) {
  return (
    <Box
      role="img"
      aria-label={`Overall confidence ${value}%`}
      sx={(theme) => ({
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `conic-gradient(${theme.palette[confidenceColor(value)].main} ${value}%, ${theme.palette.surface.muted} 0)`,
      })}
    >
      <Box
        sx={{
          width: size - 16,
          height: size - 16,
          borderRadius: '50%',
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography sx={{ fontSize: '1.125rem', fontWeight: 800, lineHeight: 1 }}>
          {value}%
        </Typography>
        <Typography
          sx={{ fontSize: '0.5625rem', fontWeight: 800, letterSpacing: '0.6px' }}
          color="text.secondary"
        >
          CONFIDENCE
        </Typography>
      </Box>
    </Box>
  );
}
