import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceSubtle: string;
  card: string;
  cardBorder: string;
  border: string;
  borderSubtle: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryText: string;
  accent: string;
  tint: string;
  success: string;
  warning: string;
  error: string;
  destructive: string;
  destructiveBg: string;
  tabBar: string;
  tabBarBorder: string;
  inputBg: string;
  inputBorder: string;
}

export const lightColors: ThemeColors = {
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceSubtle: '#f1f5f9',
  card: '#ffffff',
  cardBorder: '#e2e8f0',
  border: '#cbd5e1',
  borderSubtle: '#e2e8f0',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#64748b',
  primary: '#4ade80',
  primaryLight: '#86efac',
  primaryDark: '#22c55e',
  primaryText: '#15803d',
  accent: '#4ade80',
  tint: '#4ade80',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  destructive: '#ef4444',
  destructiveBg: 'rgba(239, 68, 68, 0.08)',
  tabBar: '#ffffff',
  tabBarBorder: '#e2e8f0',
  inputBg: '#f4f4f5',
  inputBorder: '#e4e4e7',
};

export const darkColors: ThemeColors = {
  background: '#0a0a0a',
  surface: '#171717',
  surfaceSubtle: '#262626',
  card: '#171717',
  cardBorder: '#262626',
  border: '#404040',
  borderSubtle: '#262626',
  text: '#f8fafc',
  textSecondary: '#a3a3a3',
  textMuted: '#737373',
  primary: '#4ade80',
  primaryLight: '#86efac',
  primaryDark: '#22c55e',
  primaryText: '#4ade80',
  accent: '#4ade80',
  tint: '#4ade80',
  success: '#34d399',
  warning: '#fbbf24',
  error: '#ef4444',
  destructive: '#f43f5e',
  destructiveBg: 'rgba(244, 63, 94, 0.1)',
  tabBar: '#0a0a0a',
  tabBarBorder: '#262626',
  inputBg: '#18181b',
  inputBorder: '#27272a',
};

interface ThemeContextType {
  theme: ThemeMode;
  effectiveTheme: ResolvedTheme;
  isDark: boolean;
  isThemeLoaded: boolean;
  colors: ThemeColors;
  setTheme: (mode: ThemeMode) => Promise<void>;
}

const THEME_STORAGE_KEY = '@app_theme_mode';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);
  const deviceColorScheme = useDeviceColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();

  // Load saved theme on launch
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setThemeState(saved);
        }
      } catch (e) {
        console.warn('Failed to load theme preference:', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.warn('Failed to persist theme preference:', e);
    }
  };

  const effectiveTheme: ResolvedTheme = useMemo(() => {
    if (theme === 'system') {
      return deviceColorScheme === 'light' ? 'light' : 'dark';
    }
    return theme;
  }, [theme, deviceColorScheme]);

  const colors = effectiveTheme === 'dark' ? darkColors : lightColors;
  const isDark = effectiveTheme === 'dark';

  useEffect(() => {
    setColorScheme(theme === 'system' ? 'system' : effectiveTheme);
  }, [theme, effectiveTheme, setColorScheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        effectiveTheme,
        isDark,
        isThemeLoaded: isLoaded,
        colors,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

