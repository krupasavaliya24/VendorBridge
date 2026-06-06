import { createTheme, alpha } from "@mui/material/styles";

const WARM_TAUPE = "#bda998"; // Warm Taupe (Soft brown-beige main outer background)
const LINEN_WHITE = "#faf6f0"; // Linen / Bone White (Main content area)
const SAGE_GREEN = "#8fa89b"; // Sage Green (Sidebar & Panels background)
const OLIVE_GREEN = "#38463c"; // Olive Green (Darker green used for cards/panels)
const AMBER_ACTIVE = "#d97706"; // Amber (Active / Selected menu & button highlight)
const CHARCOAL_BLACK = "#212121"; // Charcoal Black (Primary text)
const CHARCOAL_MUTED = "#545454"; // Charcoal Muted (Secondary text)
const PLUM = "#5B2C6F";
const PLUM_LIGHT = "#7D3C98";
const PLUM_DARK = "#3F1D4D";
const BORDER = "#dfdcd6"; // Neutral border color
const BORDER_LIGHT = "#cfcbc0"; // Highlighted border

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: PLUM,
      light: PLUM_LIGHT,
      dark: PLUM_DARK,
      contrastText: "#ffffff",
    },
    secondary: {
      main: SAGE_GREEN,
      light: "#a4bdae",
      dark: "#6a8275",
      contrastText: CHARCOAL_BLACK,
    },
    error: {
      main: "#ef4444",
      light: "#f87171",
      dark: "#dc2626",
    },
    warning: {
      main: "#A855F7", // soft violet
      light: "#C084FC",
      dark: "#9333EA",
    },
    info: {
      main: OLIVE_GREEN,
      light: "#4a5b4e",
      dark: "#273129",
      contrastText: "#ffffff",
    },
    success: {
      main: "#10b981",
      light: "#34d399",
      dark: "#059669",
    },
    background: {
      default: WARM_TAUPE,
      paper: LINEN_WHITE,
    },
    text: {
      primary: CHARCOAL_BLACK,
      secondary: CHARCOAL_MUTED,
      disabled: "#9ca3af",
    },
    divider: BORDER,
    action: {
      hover: alpha(SAGE_GREEN, 0.15),
      selected: alpha(AMBER_ACTIVE, 0.15),
      disabled: alpha("#000000", 0.26),
      disabledBackground: alpha("#000000", 0.12),
    },
  },
  typography: {
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 800, letterSpacing: "-0.02em", color: CHARCOAL_BLACK },
    h2: { fontWeight: 700, letterSpacing: "-0.01em", color: CHARCOAL_BLACK },
    h3: { fontWeight: 700, color: CHARCOAL_BLACK },
    h4: { fontWeight: 600, color: CHARCOAL_BLACK },
    h5: { fontWeight: 600, color: CHARCOAL_BLACK },
    h6: { fontWeight: 600, color: CHARCOAL_BLACK },
    subtitle1: { fontWeight: 500, color: CHARCOAL_MUTED },
    subtitle2: { fontWeight: 500, fontSize: "0.8rem", color: "#6b7280" },
    body2: { color: CHARCOAL_MUTED },
    button: { textTransform: "none", fontWeight: 600, letterSpacing: "0.01em" },
    overline: { fontWeight: 600, letterSpacing: "0.08em", color: "#6b7280" },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    "none",
    "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    "0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08)",
    "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
    "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)",
    "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
    "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
    ...Array(18).fill("0 25px 50px -12px rgba(0, 0, 0, 0.1)"),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: WARM_TAUPE,
          scrollbarWidth: "thin",
          scrollbarColor: `${BORDER_LIGHT} transparent`,
          "&::-webkit-scrollbar": { width: 6, height: 6 },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            background: BORDER_LIGHT,
            borderRadius: 99,
          },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "8px 20px",
          fontSize: "0.875rem",
          transition: "all 0.2s ease",
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${PLUM_LIGHT} 0%, ${PLUM} 100%)`,
          color: "#ffffff",
          "&:hover": {
            background: `linear-gradient(135deg, ${PLUM} 0%, ${PLUM_DARK} 100%)`,
            boxShadow: `0 4px 12px ${alpha(PLUM, 0.25)}`,
            transform: "translateY(-1px)",
          },
        },
        containedSecondary: {
          background: "linear-gradient(135deg, #6e8476 0%, #4c5d53 100%)",
          color: "#ffffff",
          "&:hover": {
            background: "linear-gradient(135deg, #819b8b 0%, #6e8476 100%)",
            boxShadow: `0 4px 12px ${alpha("#6e8476", 0.25)}`,
            transform: "translateY(-1px)",
          },
        },
        outlined: {
          borderColor: BORDER_LIGHT,
          color: CHARCOAL_BLACK,
          "&:hover": {
            borderColor: AMBER_ACTIVE,
            background: alpha(AMBER_ACTIVE, 0.04),
          },
        },
        text: {
          color: CHARCOAL_BLACK,
          "&:hover": { background: alpha(AMBER_ACTIVE, 0.04) },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: OLIVE_GREEN,
          color: LINEN_WHITE,
          border: `1px solid ${alpha(BORDER, 0.3)}`,
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: SAGE_GREEN,
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: SAGE_GREEN,
          borderRight: `1px solid ${BORDER}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(WARM_TAUPE, 0.95),
          backdropFilter: "blur(16px)",
          borderBottom: `1px solid ${BORDER}`,
          boxShadow: "none",
          color: CHARCOAL_BLACK,
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined", size: "small" },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            backgroundColor: LINEN_WHITE,
            "& fieldset": { borderColor: BORDER },
            "&:hover fieldset": { borderColor: BORDER_LIGHT },
            "&.Mui-focused fieldset": {
              borderColor: AMBER_ACTIVE,
              boxShadow: `0 0 0 3px ${alpha(AMBER_ACTIVE, 0.15)}`,
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: LINEN_WHITE,
          border: `1px solid ${BORDER}`,
          borderRadius: 16,
          boxShadow:
            "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          color: CHARCOAL_MUTED,
          "&.Mui-selected": { color: AMBER_ACTIVE, fontWeight: 600 },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: AMBER_ACTIVE,
          height: 3,
          borderRadius: "3px 3px 0 0",
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
          backgroundColor: LINEN_WHITE,
          color: CHARCOAL_BLACK,
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: alpha(WARM_TAUPE, 0.2),
            borderBottom: `1px solid ${BORDER}`,
          },
          "& .MuiDataGrid-cell": {
            borderBottom: `1px solid ${alpha(BORDER, 0.5)}`,
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: alpha(SAGE_GREEN, 0.1),
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: `1px solid ${BORDER}`,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${BORDER}`,
          color: "inherit",
        },
        head: {
          backgroundColor: alpha(WARM_TAUPE, 0.2),
          fontWeight: 600,
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: CHARCOAL_MUTED,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: CHARCOAL_BLACK,
          color: LINEN_WHITE,
          borderRadius: 8,
          fontSize: "0.75rem",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: LINEN_WHITE,
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.08)",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: "2px 6px",
          color: CHARCOAL_BLACK,
          "&:hover": { backgroundColor: alpha(SAGE_GREEN, 0.15) },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          "&.Mui-selected": {
            backgroundColor: PLUM,
            color: "#ffffff",
            "&:hover": { backgroundColor: PLUM_DARK },
            "& .MuiListItemIcon-root": { color: "#ffffff" },
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
          "& .MuiStepIcon-root.Mui-active": { color: AMBER_ACTIVE },
          "& .MuiStepIcon-root.Mui-completed": { color: SAGE_GREEN },
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
