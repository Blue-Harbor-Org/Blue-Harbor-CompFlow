'use client';

import { useAdminTheme } from '@/components/admin/AdminThemeProvider';

export default function AdminThemeToggle() {
  const { theme, toggle } = useAdminTheme();
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex min-h-[44px] w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors"
      style={{
        borderColor: 'var(--border)',
        background: 'var(--gold-dim)',
        color: 'var(--silver)',
      }}
      aria-pressed={isLight}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <span style={{ color: 'var(--light)' }}>Appearance</span>
      <span
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wide"
        style={{
          background: 'var(--navy3)',
          color: 'var(--gold)',
          border: '1px solid var(--border-gold)',
        }}
      >
        {isLight ? '☀ Light' : '☾ Dark'}
      </span>
    </button>
  );
}
