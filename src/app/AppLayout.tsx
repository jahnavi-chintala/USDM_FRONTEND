import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useState } from 'react';
import { Link, Outlet } from 'react-router';

import { SettingsDialog, useSettings } from '@/features/settings';
import { BrandMark } from '@/shared/components/BrandMark';

function initials(name: string): string {
  const parts = name
    .trim()
    .split(/[\s._-]+/)
    .filter(Boolean);
  const letters =
    parts.length > 1 ? `${parts[0]![0]}${parts[1]![0]}` : (parts[0] ?? 'RV').slice(0, 2);
  return letters.toUpperCase();
}

export function AppLayout() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { reviewerId } = useSettings();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 'appBar',
          bgcolor: 'brand.navy',
          color: 'common.white',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: { xs: 2, sm: 4 },
          py: 1.5,
          borderBottom: 3,
          borderColor: 'brand.blue',
        }}
      >
        <Box
          component={Link}
          to="/"
          aria-label="iDigitise Protocol, home"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            color: 'inherit',
            textDecoration: 'none',
            borderRadius: 1,
            '&:focus-visible': { outline: 2, outlineColor: 'brand.cyan', outlineOffset: 4 },
          }}
        >
          <BrandMark />
          <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <Box
              component="span"
              sx={{ fontSize: '1.1875rem', fontWeight: 800, letterSpacing: '-0.4px' }}
            >
              <Box component="span" sx={{ color: 'brand.cyan' }}>
                i
              </Box>
              Digitise
            </Box>
            <Box
              component="span"
              sx={{
                fontSize: '0.625rem',
                letterSpacing: '3.4px',
                color: 'brand.navyText',
                fontWeight: 700,
              }}
            >
              PROTOCOL
            </Box>
          </Box>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Settings">
          <IconButton color="inherit" aria-label="Settings" onClick={() => setSettingsOpen(true)}>
            <SettingsOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={reviewerId ? `Reviewing as ${reviewerId}` : 'Choose who is reviewing'}>
          <IconButton
            aria-label={reviewerId ? `Reviewing as ${reviewerId}` : 'Choose who is reviewing'}
            onClick={() => setSettingsOpen(true)}
            sx={{ p: 0.5 }}
          >
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: 'primary.main',
                fontSize: '0.75rem',
                fontWeight: 800,
              }}
            >
              {reviewerId ? initials(reviewerId) : 'RV'}
            </Avatar>
          </IconButton>
        </Tooltip>
      </Box>
      <Box
        component="main"
        sx={{
          width: '100%',
          maxWidth: 1368,
          mx: 'auto',
          px: { xs: 2, sm: 3 },
          pt: 3.5,
          pb: 5,
          flexGrow: 1,
        }}
      >
        <Outlet />
      </Box>
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </Box>
  );
}
