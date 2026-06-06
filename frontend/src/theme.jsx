import { createTheme, alpha } from '@mui/material/styles';

const WINE_RED = '#8B1A1A';
const WINE_LIGHT = '#A52A2A';
const WINE_DARK = '#5C0A0A';
const WINE_HOVER = '#9B2D2D';

const EMERALD = '#10b981';
const EMERALD_LIGHT = '#34d399';
const EMERALD_DARK = '#059669';

const BG_PRIMARY = '#0a0e17';
const BG_SURFACE = '#0f1520';
const BG_ELEVATED = '#151c2c';
const BG_HOVER = '#1a2332';

const BORDER = '#1e293b';
const BORDER_LIGHT = '#334155';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: WINE_RED,
      light: WINE_LIGHT,
      dark: WINE_DARK,
      contrastText: '#ffffff',
    },
    secondary: {
      main: EMERALD,
      light: EMERALD_LIGHT,
      dark: EMERALD_DARK,
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
    success: {
      main: EMERALD,
      light: EMERALD_LIGHT,
      dark: EMERALD_DARK,
    },
    background: {
      default: BG_PRIMARY,
      paper: BG_SURFACE,
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
      disabled: '#64748b',
    },
    divider: BORDER,
    action: {
      hover: alpha('#ffffff', 0.05),
      selected: alpha(WINE_RED, 0.15),
      disabled: alpha('#ffffff', 0.3),
      disabledBackground: alpha('#ffffff', 0.12),
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500, color: '#94a3b8' },
    subtitle2: { fontWeight: 500, fontSize: '0.8rem', color: '#94a3b8' },
    body2: { color: '#94a3b8' },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
    overline: { fontWeight: 600, letterSpacing: '0.08em', color: '#64748b' },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 2px rgba(0,0,0,0.3)',
    '0 2px 4px rgba(0,0,0,0.3)',
    '0 4px 8px rgba(0,0,0,0.35)',
    '0 4px 12px rgba(0,0,0,0.4)',
    '0 6px 16px rgba(0,0,0,0.4)',
    '0 8px 24px rgba(0,0,0,0.45)',
    '0 8px 32px rgba(0,0,0,0.5)',
    '0 12px 40px rgba(0,0,0,0.5)',
    '0 16px 48px rgba(0,0,0,0.55)',
    ...Array(15).fill('0 16px 48px rgba(0,0,0,0.6)'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: BG_PRIMARY,
          scrollbarWidth: 'thin',
          scrollbarColor: `${BORDER_LIGHT} transparent`,
          '&::-webkit-scrollbar': { width: 6, height: 6 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: BORDER_LIGHT, borderRadius: 99 },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 20px',
          fontSize: '0.875rem',
          transition: 'all 0.2s ease',
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${WINE_RED} 0%, ${WINE_DARK} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${WINE_HOVER} 0%, ${WINE_RED} 100%)`,
            boxShadow: `0 4px 16px ${alpha(WINE_RED, 0.4)}`,
            transform: 'translateY(-1px)',
          },
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${EMERALD} 0%, ${EMERALD_DARK} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${EMERALD_LIGHT} 0%, ${EMERALD} 100%)`,
            boxShadow: `0 4px 16px ${alpha(EMERALD, 0.4)}`,
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderColor: BORDER_LIGHT,
          '&:hover': { borderColor: WINE_RED, background: alpha(WINE_RED, 0.08) },
        },
        text: {
          '&:hover': { background: alpha('#ffffff', 0.05) },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: alpha(BG_SURFACE, 0.8),
          backdropFilter: 'blur(12px)',
          border: `1px solid ${alpha(BORDER, 0.5)}`,
          borderRadius: 16,
          boxShadow: '0 4px 24px -4px rgba(0,0,0,0.4)',
          transition: 'all 0.2s ease',
          '&:hover': { borderColor: BORDER_LIGHT },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: BG_PRIMARY,
          borderRight: `1px solid ${BORDER}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(BG_PRIMARY, 0.85),
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${BORDER}`,
          boxShadow: 'none',
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: BG_ELEVATED,
            '& fieldset': { borderColor: BORDER },
            '&:hover fieldset': { borderColor: BORDER_LIGHT },
            '&.Mui-focused fieldset': {
              borderColor: WINE_RED,
              boxShadow: `0 0 0 3px ${alpha(WINE_RED, 0.15)}`,
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: BG_SURFACE,
          border: `1px solid ${BORDER}`,
          borderRadius: 16,
          boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 500 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          '&.Mui-selected': { color: WINE_RED, fontWeight: 600 },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: WINE_RED,
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: BG_ELEVATED,
            borderBottom: `1px solid ${BORDER}`,
          },
          '& .MuiDataGrid-cell': {
            borderBottom: `1px solid ${alpha(BORDER, 0.5)}`,
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: alpha('#ffffff', 0.03),
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: `1px solid ${BORDER}`,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: `1px solid ${BORDER}` },
        head: {
          backgroundColor: BG_ELEVATED,
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#94a3b8',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: BG_ELEVATED,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          fontSize: '0.75rem',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: BG_SURFACE,
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 6px',
          '&:hover': { backgroundColor: BG_HOVER },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          '&.Mui-selected': {
            backgroundColor: alpha(WINE_RED, 0.15),
            color: '#ffffff',
            '&:hover': { backgroundColor: alpha(WINE_RED, 0.25) },
            '& .MuiListItemIcon-root': { color: WINE_RED },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiStepper: {
      styleOverrides: {
        root: {
          '& .MuiStepIcon-root.Mui-active': { color: WINE_RED },
          '& .MuiStepIcon-root.Mui-completed': { color: EMERALD },
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: { fontWeight: 600 },
      },
    },
  },
});

export default theme;
