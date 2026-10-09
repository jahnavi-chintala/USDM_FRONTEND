import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { confidenceColor } from '@/shared/utils/confidence';

import { classConfidence } from '../confidence';
import type { ClassStatus, UsdmClass } from '../types';

interface ClassNavProps {
  classes: UsdmClass[];
  selectedId: string;
  onSelect: (id: string) => void;
}

function dotStyle(status: ClassStatus) {
  return (theme: Theme) => {
    const p = theme.palette;
    const by: Record<ClassStatus, { bg: string; border: string }> = {
      approved: { bg: p.success.main, border: p.success.main },
      rejected: { bg: p.error.main, border: p.error.main },
      edited: { bg: p.edited.light, border: p.edited.main },
      reextracting: { bg: p.info.light, border: p.secondary.main },
      pending: { bg: 'transparent', border: p.surface.dashed },
    };
    return {
      width: 18,
      height: 18,
      flexShrink: 0,
      borderRadius: '50%',
      boxSizing: 'border-box' as const,
      border: `2px solid ${by[status].border}`,
      bgcolor: by[status].bg,
      color: 'common.white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };
  };
}

function StatusDot({ status }: { status: ClassStatus }) {
  return (
    <Box component="span" aria-hidden="true" sx={dotStyle(status)}>
      {status === 'approved' && <CheckIcon sx={{ fontSize: 12 }} />}
      {status === 'rejected' && <CloseIcon sx={{ fontSize: 12 }} />}
    </Box>
  );
}

const STATUS_WORD: Record<ClassStatus, string> = {
  approved: 'approved',
  rejected: 'rejected',
  edited: 'edited, needs approval',
  reextracting: 're-extracting',
  pending: 'pending review',
};

/** The list of USDM classes: a side list on large screens, a row of chips on phones. */
export function ClassNav({ classes, selectedId, onSelect }: ClassNavProps) {
  const approved = classes.filter((c) => c.status === 'approved').length;

  return (
    <>
      <Paper
        variant="outlined"
        component="nav"
        aria-label="USDM classes"
        sx={{ p: 1, display: { xs: 'none', md: 'block' }, alignSelf: 'start' }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            px: 1.25,
            pt: 1,
          }}
        >
          <Typography variant="h3" sx={{ fontSize: '0.875rem' }}>
            USDM classes
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }} color="text.secondary">
            {approved}/{classes.length} approved
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          color="success"
          value={(approved / Math.max(classes.length, 1)) * 100}
          aria-label="Classes approved"
          sx={{ height: 6, mx: 1.25, my: 1.25, bgcolor: 'surface.muted' }}
        />
        <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {classes.map((c) => {
            const value = classConfidence(c);
            const selected = c.id === selectedId;
            return (
              <li key={c.id}>
                <ButtonBase
                  onClick={() => onSelect(c.id)}
                  aria-current={selected ? 'true' : undefined}
                  aria-label={`${c.name}, ${STATUS_WORD[c.status]}, ${value}%`}
                  sx={{
                    width: '100%',
                    font: 'inherit',
                    display: 'grid',
                    gridTemplateColumns: '18px minmax(0, 1fr) auto',
                    gap: 1.25,
                    alignItems: 'center',
                    textAlign: 'left',
                    borderRadius: 2.25,
                    px: 1.25,
                    py: 1.125,
                    minHeight: 44,
                    bgcolor: selected ? 'primary.light' : 'transparent',
                    '&:hover': { bgcolor: selected ? 'primary.light' : 'surface.subtle' },
                    '&.Mui-focusVisible': { outline: 2, outlineColor: 'primary.main' },
                  }}
                >
                  <StatusDot status={c.status} />
                  <Box
                    component="span"
                    sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}
                  >
                    <Box
                      component="span"
                      sx={{ fontWeight: 700, fontSize: '0.8125rem', lineHeight: 1.3 }}
                    >
                      {c.name}
                    </Box>
                    <Box
                      component="span"
                      sx={{
                        fontSize: '0.71875rem',
                        color: 'text.secondary',
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {c.usdm_classes.join(', ')}
                    </Box>
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: `${confidenceColor(value)}.dark`,
                    }}
                  >
                    {value}%
                  </Box>
                </ButtonBase>
              </li>
            );
          })}
        </Box>
      </Paper>

      <Box
        component="nav"
        aria-label="USDM classes (compact)"
        sx={{
          display: { xs: 'flex', md: 'none' },
          gap: 0.75,
          overflowX: 'auto',
          pb: 0.5,
          mx: -2,
          px: 2,
        }}
      >
        {classes.map((c) => {
          const selected = c.id === selectedId;
          const done = c.status === 'approved';
          return (
            <ButtonBase
              key={c.id}
              onClick={() => onSelect(c.id)}
              aria-current={selected ? 'true' : undefined}
              sx={{
                flexShrink: 0,
                font: 'inherit',
                borderRadius: 999,
                px: 1.5,
                py: 0.75,
                minHeight: 36,
                fontSize: '0.75rem',
                fontWeight: 700,
                border: 1,
                ...(selected
                  ? { bgcolor: 'primary.main', color: 'common.white', borderColor: 'primary.main' }
                  : done
                    ? {
                        bgcolor: 'success.light',
                        color: 'success.dark',
                        borderColor: 'success.light',
                      }
                    : {
                        bgcolor: 'background.paper',
                        color: 'surface.mutedText',
                        borderColor: 'divider',
                      }),
              }}
            >
              {done && !selected ? '✓ ' : ''}
              {c.name}
              {!done || selected ? ` ${classConfidence(c)}%` : ''}
            </ButtonBase>
          );
        })}
      </Box>
    </>
  );
}
