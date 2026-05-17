import { createContext, useContext, useEffect, useState } from 'react';

export type AppTheme = 'dark' | 'light' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: AppTheme;
  storageKey?: string;
}

interface ThemeState {
  theme: AppTheme;
  changeTheme: (theme: AppTheme) => void;
}

const defaultState: ThemeState = {
  theme: 'system',
  changeTheme: () => undefined,
};

const ThemeContext = createContext<ThemeState>(defaultState);

export function AppThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'chulhaksan-theme-preference',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<AppTheme>(
    () => (localStorage.getItem(storageKey) as AppTheme) || defaultTheme
  );

  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    changeTheme: (newTheme: AppTheme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useAppTheme debe utilizarse dentro de un AppThemeProvider');
  }
  return context;
};
