import { createTheme } from '@mui/material/styles';

/** The single (light) theme. Change colours here only, never inline in components. */
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1565c0' },
    secondary: { main: '#6a1b9a' },
    background: { default: '#f6f8fb' },
  },
  shape: { borderRadius: 8 },
  typography: {
    h4: { fontWeight: 600, fontSize: '1.75rem' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { defaultProps: { elevation: 0 } },
  },
});
