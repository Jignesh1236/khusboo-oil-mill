import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";

type Mode = "light" | "dark";

interface ColorModeContextType {
  mode: Mode;
  toggleColorMode: () => void;
}

export const ColorModeContext = createContext<ColorModeContextType>({
  mode: "light",
  toggleColorMode: () => {},
});

export function useColorMode() {
  return useContext(ColorModeContext);
}

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("colorMode");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    localStorage.setItem("colorMode", mode);
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => setMode((prev) => (prev === "light" ? "dark" : "light")),
    }),
    [mode]
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#f97316",
            light: "#fb923c",
            dark: "#ea580c",
            contrastText: "#ffffff",
          },
          secondary: {
            main: "#0ea5e9",
            contrastText: "#ffffff",
          },
          error: { main: "#ef4444" },
          success: { main: "#22c55e" },
          warning: { main: "#eab308" },
          ...(mode === "dark"
            ? {
                background: { default: "#000000", paper: "#0d0d0d" },
                divider: "rgba(255,255,255,0.08)",
                text: { primary: "#f1f1f1", secondary: "#888888" },
                action: {
                  hover: "rgba(255,255,255,0.05)",
                  selected: "rgba(255,255,255,0.08)",
                  disabled: "rgba(255,255,255,0.26)",
                  disabledBackground: "rgba(255,255,255,0.06)",
                },
              }
            : { background: { default: "#f8fafc", paper: "#ffffff" } }),
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: { fontWeight: 700 },
          h2: { fontWeight: 700 },
          h3: { fontWeight: 600 },
          h4: { fontWeight: 600 },
          h5: { fontWeight: 600 },
          h6: { fontWeight: 600 },
        },
        shape: { borderRadius: 10 },
        components: {
          MuiButton: {
            styleOverrides: {
              root: { textTransform: "none", fontWeight: 600 },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: ({theme}) => ({
                borderRadius: 12,
                ...(theme.palette.mode === "dark" && {
                  backgroundImage: "none",
                  border: "1px solid rgba(255,255,255,0.07)",
                }),
              }),
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: { backgroundImage: "none" },
            },
          },
          MuiTextField: {
            defaultProps: { size: "small" },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: { borderRadius: 8 },
            },
          },
          MuiChip: {
            styleOverrides: { root: { fontWeight: 600 } },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ColorModeContext.Provider>
  );
}
