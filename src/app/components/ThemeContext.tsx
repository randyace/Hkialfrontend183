import React, { createContext, useContext, useState, useCallback } from 'react';

export type ThemeMode = 'dark' | 'light';

interface ThemeColors {
  // Core colors
  background: string;
  accent: string;       // gold highlight
  accentDark: string;   // darker gold
  text: string;         // primary text
  textSecondary: string;// secondary/muted text
  textMuted: string;    // muted/placeholder text
  other: string;        // card/border/secondary bg

  // Glass styles
  glassBackground: string;
  glassBorder: string;
  glassShadow: string;

  // Sidebar
  sidebarBackground: string;
  sidebarBorder: string;
  sidebarShadow: string;
  sidebarInfoBg: string;
  sidebarInfoItemBg: string;
  sidebarTextPrimary: string;
  sidebarTextSecondary: string;
  sidebarTextMuted: string;
  sidebarHoverBg: string;

  // Inputs
  inputBackground: string;
  inputBorder: string;
  inputText: string;
  inputPlaceholder: string;

  // Cards
  cardItemBg: string;
  cardItemBorder: string;

  // Modals
  modalBackground: string;

  // Blob opacity
  blobOpacity: string;
}

const darkColors: ThemeColors = {
  background: '#0a1929',
  accent: 'rgb(220, 181, 21)',
  accentDark: 'rgb(180, 141, 11)',
  text: '#ffffff',
  textSecondary: '#e5e7eb',
  textMuted: '#9ca3af',
  other: 'rgba(255, 255, 255, 0.1)',

  glassBackground: 'rgba(255, 255, 255, 0.1)',
  glassBorder: 'rgba(255, 255, 255, 0.2)',
  glassShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',

  sidebarBackground: '#0a1929',
  sidebarBorder: '1px solid rgba(255, 255, 255, 0.2)',
  sidebarShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
  sidebarInfoBg: 'rgb(0, 28, 46)',
  sidebarInfoItemBg: 'rgba(255, 255, 255, 0.1)',
  sidebarTextPrimary: '#ffffff',
  sidebarTextSecondary: '#9ca3af',
  sidebarTextMuted: '#6b7280',
  sidebarHoverBg: 'rgba(255, 255, 255, 0.1)',

  inputBackground: 'rgba(255, 255, 255, 0.1)',
  inputBorder: 'rgba(255, 255, 255, 0.2)',
  inputText: '#ffffff',
  inputPlaceholder: '#9ca3af',

  cardItemBg: 'rgba(255, 255, 255, 0.3)',
  cardItemBorder: 'rgba(255, 255, 255, 0.2)',

  modalBackground: '#0a1929',

  blobOpacity: '0.1',
};

const lightColors: ThemeColors = {
  background: '#FFFFFF',
  accent: 'rgb(220, 181, 21)',
  accentDark: 'rgb(180, 141, 11)',
  text: 'rgb(64, 63, 52)',
  textSecondary: 'rgb(90, 89, 78)',
  textMuted: 'rgb(130, 129, 118)',
  other: 'rgb(231, 230, 221)',

  glassBackground: 'rgba(231, 230, 221, 0.5)',
  glassBorder: 'rgba(200, 199, 190, 0.6)',
  glassShadow: '0 8px 32px rgba(64, 63, 52, 0.08)',

  sidebarBackground: '#FFFFFF',
  sidebarBorder: '1px solid rgba(200, 199, 190, 0.6)',
  sidebarShadow: '0 12px 40px rgba(64, 63, 52, 0.1)',
  sidebarInfoBg: 'rgb(64, 63, 52)',
  sidebarInfoItemBg: 'rgba(255, 255, 255, 0.15)',
  sidebarTextPrimary: 'rgb(64, 63, 52)',
  sidebarTextSecondary: 'rgb(130, 129, 118)',
  sidebarTextMuted: 'rgb(160, 159, 148)',
  sidebarHoverBg: 'rgba(220, 181, 21, 0.1)',

  inputBackground: 'rgba(231, 230, 221, 0.5)',
  inputBorder: 'rgba(200, 199, 190, 0.6)',
  inputText: 'rgb(64, 63, 52)',
  inputPlaceholder: 'rgb(160, 159, 148)',

  cardItemBg: 'rgba(231, 230, 221, 0.4)',
  cardItemBorder: 'rgba(200, 199, 190, 0.5)',

  modalBackground: '#FFFFFF',

  blobOpacity: '0.06',
};

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  glassStyle: React.CSSProperties;
}

const defaultGlassStyle: React.CSSProperties = {
  backdropFilter: 'blur(16px)',
  background: darkColors.glassBackground,
  border: `1px solid ${darkColors.glassBorder}`,
  boxShadow: darkColors.glassShadow,
};

const defaultContextValue: ThemeContextType = {
  mode: 'dark',
  colors: darkColors,
  toggleTheme: () => {},
  setTheme: () => {},
  glassStyle: defaultGlassStyle,
};

const ThemeContext = createContext<ThemeContextType>(defaultContextValue);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');

  const colors = mode === 'dark' ? darkColors : lightColors;

  const glassStyle: React.CSSProperties = {
    backdropFilter: 'blur(16px)',
    background: colors.glassBackground,
    border: `1px solid ${colors.glassBorder}`,
    boxShadow: colors.glassShadow,
  };

  const toggleTheme = useCallback(() => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setTheme = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, colors, toggleTheme, setTheme, glassStyle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  return context;
}