import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, gradients, spacing, typography, borderRadius, shadows, glowEffects, durations, iconSizes } from './tokens';

type ThemeMode = 'light' | 'dark' | 'system';
type ActualTheme = 'light' | 'dark';

interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  accent: string;
  accentAlt: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  border: string;
  divider: string;
  // Backward compatibility aliases
  text: string;
  cardBackground: string;
  buttonText: string;
}

interface Theme {
  colors: ThemeColors;
  gradients: typeof gradients;
  spacing: typeof spacing;
  typography: typeof typography;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  glowEffects: typeof glowEffects;
  durations: typeof durations;
  iconSizes: typeof iconSizes;
  isDark: boolean;
}

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  isDark: boolean;
  // Backward compatibility with old theme context
  colors: ThemeColors;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@orniva_theme_mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  
  // Determine the actual theme based on mode and system preference
  const getActualTheme = (): ActualTheme => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return themeMode as ActualTheme;
  };
  
  const actualTheme = getActualTheme();
  const isDark = actualTheme === 'dark';
  
  // Build complete theme object
  const theme: Theme = {
    colors: colors[actualTheme],
    gradients,
    spacing,
    typography,
    borderRadius,
    shadows,
    glowEffects,
    durations,
    iconSizes,
    isDark,
  };
  
  // Load saved theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);
  
  const loadThemePreference = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
        setThemeModeState(saved as ThemeMode);
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    }
  };
  
  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };
  
  // Backward compatibility - simple toggle between light and dark
  const toggleTheme = async () => {
    const newMode = isDark ? 'light' : 'dark';
    await setThemeMode(newMode);
  };
  
  return (
    <ThemeContext.Provider value={{ 
      theme, 
      themeMode, 
      setThemeMode, 
      isDark,
      toggleTheme,
      // Backward compatibility - expose colors directly
      colors: theme.colors,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Helper hook to get theme colors directly
export function useThemeColors(): ThemeColors {
  const { theme } = useTheme();
  return theme.colors;
}

// Helper hook to check if dark mode is active
export function useIsDark(): boolean {
  const { isDark } = useTheme();
  return isDark;
}
