import { alpha, createTheme } from '@mui/material/styles';
import type { CSSProperties } from 'react';

/**
 * iDigitise Protocol theme: the colours, type and shapes of the design canvas
 * ("iDigitise Protocol UI"). Change colours here only, never inline in components.
 */

declare module '@mui/material/styles' {
  interface Palette {
    brand: {
      navy: string;
      navyRaised: string;
      navyBorder: string;
      navyText: string;
      blue: string;
      cyan: string;
    };
    surface: { subtle: string; rule: string; muted: string; mutedText: string; dashed: string };
    edited: { main: string; light: string };
    console: {
      bg: string;
      text: string;
      time: string;
      success: string;
      warning: string;
      error: string;
    };
  }
  interface PaletteOptions {
    brand?: Palette['brand'];
    surface?: Palette['surface'];
    edited?: Palette['edited'];
    console?: Palette['console'];
  }
  interface TypographyVariants {
    quote: CSSProperties;
  }
  interface TypographyVariantsOptions {
    quote?: CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    quote: true;
  }
}

const FONT = 'Manrope, system-ui, -apple-system, "Segoe UI", sans-serif';
const SERIF_FONT = '"Source Serif 4", Georgia, serif';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#3C2CDA', dark: '#2A1DB0', light: '#EEEBFD', contrastText: '#FFFFFF' },
    secondary: { main: '#1D86FF', contrastText: '#FFFFFF' },
    success: { main: '#0E9F6E', dark: '#0B7F58', light: '#E6F6F0', contrastText: '#FFFFFF' },
    warning: { main: '#EA9D00', dark: '#7A5000', light: '#FDF3DE', contrastText: '#0B1033' },
    error: { main: '#D93A55', dark: '#C22E49', light: '#FCEBEE', contrastText: '#FFFFFF' },
    info: { main: '#0F5BC4', dark: '#144A93', light: '#EAF3FF', contrastText: '#FFFFFF' },
    edited: { main: '#0B6F7A', light: '#E3F8FB' },
    console: {
      bg: '#0A1452',
      text: '#C9D1FF',
      time: '#8F9AE0',
      success: '#6FE7CF',
      warning: '#FFC65C',
      error: '#FF9DAE',
    },
    text: { primary: '#0B1033', secondary: '#5A6185' },
    divider: '#E3E6F0',
    background: { default: '#F4F5FB', paper: '#FFFFFF' },
    brand: {
      navy: '#07125E',
      navyRaised: '#142070',
      navyBorder: '#2B388C',
      navyText: '#C8CDEB',
      blue: '#1D86FF',
      cyan: '#14CBDE',
    },
    surface: {
      subtle: '#FAFBFD',
      rule: '#EEF0F6',
      muted: '#EEF0F6',
      mutedText: '#454C6B',
      dashed: '#B9BEEA',
    },
  },
  // A 4 px unit, so `borderRadius: 3` in sx is 12 px; components set their own radius below.
  shape: { borderRadius: 4 },
  typography: {
    fontFamily: FONT,
    fontSize: 14,
    h1: { fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px' },
    h2: { fontSize: '1.0625rem', fontWeight: 800 },
    h3: { fontSize: '0.9375rem', fontWeight: 800 },
    h4: { fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px' },
    h5: { fontSize: '1.125rem', fontWeight: 800 },
    h6: { fontSize: '1rem', fontWeight: 800 },
    button: { textTransform: 'none', fontWeight: 700 },
    overline: { fontSize: '0.71875rem', fontWeight: 700, letterSpacing: '0.6px', lineHeight: 1.6 },
    quote: { fontFamily: SERIF_FONT, fontSize: '0.8125rem', lineHeight: 1.55 },
  },
  components: {
    MuiCssBaseline: { styleOverrides: { body: { lineHeight: 1.5 } } },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { minHeight: 44, paddingInline: 16, borderRadius: 10 } },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { outlined: { borderRadius: 12 } },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 700, fontSize: '0.75rem' } } },
    MuiTab: { styleOverrides: { root: { fontWeight: 700, minHeight: 48 } } },
    MuiLinearProgress: { styleOverrides: { root: { borderRadius: 9 }, bar: { borderRadius: 9 } } },
    MuiTooltip: { defaultProps: { arrow: true } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 10 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 16 } } },
    MuiSnackbarContent: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          borderRadius: 10,
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            boxShadow: `0 0 0 3px ${alpha(t.palette.primary.main, 0.12)}`,
          },
        }),
      },
    },
  },
});
