import { createTheme } from "@mui/material/styles";

// Enterprise palette; supports both light and dark modes.
export const buildTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: "#2563EB" },
      secondary: { main: "#7C3AED" },
      success: { main: "#16A34A" },
      warning: { main: "#F59E0B" },
      error: { main: "#DC2626" },
      background: {
        default: mode === "dark" ? "#0F172A" : "#F1F5F9",
        paper: mode === "dark" ? "#1E293B" : "#FFFFFF",
      },
    },
    shape: { borderRadius: 14 },
    typography: {
      fontFamily: 'Inter, Roboto, system-ui, sans-serif',
      h6: { fontWeight: 700 },
    },
    components: {
      MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
      MuiButton: { styleOverrides: { root: { textTransform: "none", fontWeight: 600 } } },
    },
  });
