import SettingsIcon from '@mui/icons-material/Settings';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router';

import { SettingsDialog } from '@/features/settings';

const NAV_ITEMS = [
  { to: '/convert', label: 'Convert' },
  { to: '/review', label: 'Review' },
];

export function AppLayout() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky" color="primary">
        <Toolbar sx={{ gap: { xs: 1, sm: 2 } }}>
          <Typography variant="h6" component="span" sx={{ mr: { sm: 2 }, whiteSpace: 'nowrap' }}>
            USDM4
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              {' '}
              Converter
            </Box>
          </Typography>
          <Box
            component="nav"
            aria-label="Main"
            sx={{ display: 'flex', gap: { xs: 0, sm: 1 }, flexGrow: 1 }}
          >
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.to}
                component={NavLink}
                to={item.to}
                color="inherit"
                sx={{
                  opacity: 0.85,
                  '&.active': { opacity: 1, bgcolor: 'rgba(255,255,255,0.16)' },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
          <Tooltip title="Settings">
            <IconButton color="inherit" aria-label="Settings" onClick={() => setSettingsOpen(true)}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        <Outlet />
      </Container>
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </Box>
  );
}
