import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DARK_COLORS, HIGH_CONTRAST_COLORS, LIGHT_COLORS } from '../constants/colors';
import { createAppStyles } from '../styles/styles';

const STORAGE_KEY = 'librashub_theme_preferences';

type ThemeContextValue = {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  colors: typeof LIGHT_COLORS;
  styles: ReturnType<typeof createAppStyles>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkModeState] = useState(false);
  const [highContrast, setHighContrastState] = useState(false);

  useEffect(() => {
    void SecureStore.getItemAsync(STORAGE_KEY).then((saved) => {
      if (!saved) return;
      const preferences = JSON.parse(saved) as Partial<{
        darkMode: boolean;
        highContrast: boolean;
      }>;
      setDarkModeState(preferences.darkMode === true);
      setHighContrastState(preferences.highContrast === true);
    }).catch(() => undefined);
  }, []);

  const save = (nextDarkMode: boolean, nextHighContrast: boolean) => {
    void SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify({
      darkMode: nextDarkMode,
      highContrast: nextHighContrast,
    })).catch(() => undefined);
  };

  const setDarkMode = (value: boolean) => {
    setDarkModeState(value);
    save(value, highContrast);
  };

  const setHighContrast = (value: boolean) => {
    setHighContrastState(value);
    save(darkMode, value);
  };

  const colors = highContrast
    ? HIGH_CONTRAST_COLORS
    : darkMode
      ? DARK_COLORS
      : LIGHT_COLORS;

  const value = useMemo(() => ({
    darkMode,
    setDarkMode,
    highContrast,
    setHighContrast,
    colors,
    styles: createAppStyles(colors),
  }), [darkMode, highContrast, colors]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAppTheme deve ser usado dentro de ThemeProvider.');
  return context;
}
