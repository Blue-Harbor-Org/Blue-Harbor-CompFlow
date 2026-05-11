'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { useState } from 'react';
import ReportModelToggle from '@/components/admin/ReportModelToggle';
import AdminThemeToggle from '@/components/admin/AdminThemeToggle';

interface AdminShellProps {
  children: React.ReactNode;
  userEmail?: string | null;
  /** Main header title (desktop + sticky inner header) */
  title?: string;
  subtitle?: string;
  /** Right side of inner header (e.g. + New Lead) */
  headerActions?: React.ReactNode;
}

const sidebarNav = [
  { href: '/dashboard', label: 'Pipeline', icon: '📊' },
  { href: '/dashboard/leads/new', label: 'New Lead', icon: '➕' },
  { href: '/dashboard/stats', label: 'Stats', icon: '📈' },
] as const;

const bottomTabs = [
  { href: '/dashboard', label: 'Pipeline', icon: '📊' },
  { href: '/dashboard/leads/new', label: 'New', icon: '➕' },
  { href: '/dashboard/stats', label: 'Stats', icon: '📈' },
] as const;

function pathMatches(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname.startsWith(href);
}

export default function AdminShell({
  children,
  userEmail,
  title,
  subtitle,
  headerActions,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    setDrawerOpen(false);
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  }

  const sidebarInner = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 px-5 py-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <Link
          href="/dashboard"
          className="block font-heading text-xl transition-opacity hover:opacity-90"
          style={{ color: 'var(--gold)' }}
          onClick={() => setDrawerOpen(false)}
        >
          Blue Harbor
        </Link>
        <div className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>
          Admin
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {sidebarNav.map((item) => {
          const isActive = pathMatches(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setDrawerOpen(false)}
              className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ease-out"
              style={{
                background: isActive ? 'var(--gold-dim)' : 'transparent',
                color: isActive ? 'var(--gold)' : 'var(--silver)',
                border: isActive ? '1px solid var(--border-gold)' : '1px solid transparent',
              }}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 space-y-3 px-3 pt-4">
        <AdminThemeToggle />
        <ReportModelToggle />
      </div>

      <div className="shrink-0 px-3 py-4" style={{ borderTop: '1px solid var(--border)' }}>
        {userEmail && (
          <div className="mb-3 truncate px-2 text-xs" style={{ color: 'var(--muted)' }}>
            {userEmail}
          </div>
        )}
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="btn-ghost flex min-h-[44px] w-full items-center justify-start px-3 py-2.5 text-sm"
          style={{ color: 'var(--muted)', borderColor: 'transparent' }}
        >
          {signingOut ? 'Signing out…' : '→ Sign out'}
        </button>
      </div>
    </div>
  );

  const showInnerHeader = Boolean(title || headerActions);

  return (
    <div style={{ background: 'var(--navy)', minHeight: '100vh' }}>
      <header
        className="admin-mobile-header fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-4 py-3"
        style={{
          background: 'var(--admin-sticky-bg)',
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(12px)',
          paddingTop: 'max(12px, env(safe-area-inset-top))',
        }}
      >
        <Link href="/dashboard" className="font-heading text-lg" style={{ color: 'var(--gold)' }}>
          Blue Harbor
        </Link>
        <div className="flex items-center gap-2">
          {headerActions && <div className="md:hidden">{headerActions}</div>}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="min-h-[44px] rounded-lg px-3 py-2 text-lg leading-none"
            style={{ color: 'var(--silver)', border: '1px solid var(--border)' }}
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>
      </header>

      {drawerOpen && (
        <div
          className="admin-mobile-header fixed inset-0 z-[60] md:hidden"
          style={{ background: 'var(--admin-drawer-scrim)' }}
          role="presentation"
          onClick={() => setDrawerOpen(false)}
        >
          <aside
            className="absolute right-0 top-0 flex h-full w-[min(100%,320px)] flex-col"
            style={{
              background: 'var(--navy2)',
              borderLeft: '1px solid var(--border)',
              boxShadow: 'var(--admin-drawer-shadow)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex shrink-0 items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <span className="text-sm font-semibold" style={{ color: 'var(--light)' }}>
                Settings
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="min-h-[44px] p-2 text-xl leading-none"
                style={{ color: 'var(--muted)' }}
                aria-label="Close menu"
              >
                ×
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">{sidebarInner}</div>
          </aside>
        </div>
      )}

      <aside
        className="admin-sidebar-desktop fixed left-0 top-0 z-40 h-full w-[220px]"
        style={{
          background: 'var(--navy2)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {sidebarInner}
      </aside>

      <nav
        className="admin-bottom-nav fixed bottom-0 left-0 right-0 z-50 flex items-stretch justify-around gap-1 border-t px-1 py-1 md:hidden"
        style={{
          background: 'var(--navy2)',
          borderColor: 'var(--border)',
          paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
          minHeight: '64px',
        }}
      >
        {bottomTabs.map((tab) => {
          const active = pathMatches(pathname, tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-2 text-[10px] font-semibold uppercase tracking-wide transition-colors duration-150"
              style={{
                color: active ? 'var(--gold)' : 'var(--muted)',
                background: active ? 'var(--gold-dim)' : 'transparent',
              }}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-2 text-[10px] font-semibold uppercase tracking-wide transition-colors duration-150"
          style={{ color: 'var(--muted)' }}
        >
          <span className="text-lg leading-none">⚙</span>
          More
        </button>
      </nav>

      <div className="admin-main">
        {showInnerHeader && (
          <div
            className="sticky top-0 z-30 hidden flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:flex md:px-8 md:py-5"
            style={{
              background: 'var(--admin-sticky-bg)',
              borderBottom: '1px solid var(--border)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div>
              {title && (
                <h1 className="font-body text-2xl font-semibold" style={{ color: 'var(--light)' }}>
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>
                  {subtitle}
                </p>
              )}
            </div>
            {userEmail && (
              <div className="hidden text-right text-xs md:block" style={{ color: 'var(--muted)' }}>
                {userEmail}
              </div>
            )}
            {headerActions && <div className="flex shrink-0 items-center gap-2">{headerActions}</div>}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
