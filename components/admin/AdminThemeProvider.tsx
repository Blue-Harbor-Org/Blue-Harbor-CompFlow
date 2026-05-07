'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export type AdminTheme = 'dark' | 'light';

const STORAGE_KEY = 'bh-admin-theme';

type Ctx = {
  theme: AdminTheme;
  setTheme: (t: AdminTheme) => void;
  toggle: () => void;
};

const AdminThemeContext = createContext<Ctx | null>(null);

export function useAdminTheme() {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) {
    throw new Error('useAdminTheme must be used within AdminThemeProvider');
  }
  return ctx;
}

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AdminTheme>('dark');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as AdminTheme | null;
      if (stored === 'light' || stored === 'dark') setThemeState(stored);
    } catch {
      /* ignore */
    }
  }, []);

  const setTheme = useCallback((t: AdminTheme) => {
    setThemeState(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return (
    <AdminThemeContext.Provider value={{ theme, setTheme, toggle }}>
      <div
        className="admin-theme-scope"
        data-admin-theme={theme}
        style={{
          minHeight: '100vh',
          background: 'var(--navy)',
          color: 'var(--light)',
        }}
      >
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}
