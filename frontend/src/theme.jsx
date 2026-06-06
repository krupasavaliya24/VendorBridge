import { createTheme, alpha } from '@mui/material/styles';

const BLUE_PRIMARY = '#1e40af';    // Blue 800 (Classic Navy/Blue)
const BLUE_LIGHT = '#3b82f6';      // Blue 500 (Sky Blue)
const BLUE_DARK = '#1e3a8a';       // Blue 900 (Deep Blue)
const BLUE_HOVER = '#1d4ed8';      // Blue 700

const EMERALD = '#10b981';
const EMERALD_LIGHT = '#34d399';
const EMERALD_DARK = '#059669';

const BG_PRIMARY = '#f8fafc';      // Slate 50 (Very light grey/blue)
const BG_SURFACE = '#ffffff';      // Pure White
const BG_ELEVATED = '#f1f5f9';     // Slate 100 (Light grey)
const BG_HOVER = '#e2e8f0';        // Slate 200 (Hover grey)

const BORDER = '#e2e8f0';          // Slate 200 border
const BORDER_LIGHT = '#cbd5e1';    // Slate 300 border

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: BLUE_PRIMARY,
      light: BLUE_LIGHT,
      dark: BLUE_DARK,
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
      primary: '#0f172a',        // Slate 900
      secondary: '#475569',      // Slate 600
      disabled: '#94a3b8',       // Slate 400
    },
    divider: BORDER,
    action: {
      hover: alpha(BLUE_PRIMARY, 0.04),
      selected: alpha(BLUE_PRIMARY, 0.08),
      disabled: alpha('#000000', 0.26),
      disabledBackground: alpha('#000000', 0.12),
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em', color: '#0f172a' },
    h3: { fontWeight: 700, color: '#0f172a' },
    h4: { fontWeight: 600, color: '#0f172a' },
    h5: { fontWeight: 600, color: '#0f172a' },
    h6: { fontWeight: 600, color: '#0f172a' },
    subtitle1: { fontWeight: 500, color: '#475569' },
    subtitle2: { fontWeight: 500, fontSize: '0.8rem', color: '#64748b' },
    body2: { color: '#475569' },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
    overline: { fontWeight: 600, letterSpacing: '0.08em', color: '#64748b' },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
    '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.08)',
    '0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
    '0 10px 15px -3px rgba(15, 23, 42, 0.05), 0 4px 6px -4px rgba(15, 23, 42, 0.05)',
    '0 20px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
    '0 25px 50px -12px rgba(15, 23, 42, 0.1)',
    ...Array(18).fill('0 25px 50px -12px rgba(15, 23, 42, 0.1)'),
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
          background: `linear-gradient(135deg, ${BLUE_PRIMARY} 0%, ${BLUE_DARK} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${BLUE_HOVER} 0%, ${BLUE_PRIMARY} 100%)`,
            boxShadow: `0 4px 16px ${alpha(BLUE_PRIMARY, 0.35)}`,
            transform: 'translateY(-1px)',
          },
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${EMERALD} 0%, ${EMERALD_DARK} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${EMERALD_LIGHT} 0%, ${EMERALD} 100%)`,
            boxShadow: `0 4px 16px ${alpha(EMERALD, 0.35)}`,
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderColor: BORDER_LIGHT,
          '&:hover': { borderColor: BLUE_PRIMARY, background: alpha(BLUE_PRIMARY, 0.04) },
        },
        text: {
          '&:hover': { background: alpha(BLUE_PRIMARY, 0.04) },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: BG_SURFACE,
          border: `1px solid ${BORDER}`,
          borderRadius: 16,
          boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
          transition: 'all 0.2s ease',
          '&:hover': { borderColor: BORDER_LIGHT, boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.08)' },
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
          backgroundColor: BG_SURFACE,
          borderRight: `1px solid ${BORDER}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(BG_SURFACE, 0.95),
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${BORDER}`,
          boxShadow: 'none',
          color: '#0f172a',
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: BG_PRIMARY,
            '& fieldset': { borderColor: BORDER },
            '&:hover fieldset': { borderColor: BORDER_LIGHT },
            '&.Mui-focused fieldset': {
              borderColor: BLUE_PRIMARY,
              boxShadow: `0 0 0 3px ${alpha(BLUE_PRIMARY, 0.15)}`,
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
          boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
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
          '&.Mui-selected': { color: BLUE_PRIMARY, fontWeight: 600 },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: BLUE_PRIMARY,
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
            backgroundColor: alpha(BLUE_PRIMARY, 0.03),
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
          color: '#475569',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#0f172a',
          color: '#ffffff',
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
          boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.08)',
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
            backgroundColor: alpha(BLUE_PRIMARY, 0.08),
            color: BLUE_PRIMARY,
            '&:hover': { backgroundColor: alpha(BLUE_PRIMARY, 0.12) },
            '& .MuiListItemIcon-root': { color: BLUE_PRIMARY },
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
          '& .MuiStepIcon-root.Mui-active': { color: BLUE_PRIMARY },
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
