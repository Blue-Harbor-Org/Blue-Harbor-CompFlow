'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { useState } from 'react';
import ReportModelToggle from '@/components/admin/ReportModelToggle';
import AdminThemeToggle from '@/components/admin/AdminThemeToggle';

interface AdminNavProps {
  userEmail?: string;
}

const navItems = [
  { href: '/dashboard', label: 'Pipeline', icon: '⬡' },
  { href: '/dashboard?view=all', label: 'All Leads', icon: '◈' },
  { href: '/dashboard/leads/new', label: 'Add Lead', icon: '+' },
];

const bottomTabs = [
  { href: '/dashboard', label: 'Home', icon: '🏠' },
  { href: '/dashboard?view=all', label: 'Leads', icon: '📋' },
  { href: '/dashboard/leads/new', label: 'Add', icon: '➕' },
] as const;

function pathMatches(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname.startsWith(href.split('?')[0]);
}

export default function AdminNav({ userEmail }: AdminNavProps) {
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
      <div className="shrink-0 px-6 py-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="font-heading text-xl" style={{ color: 'var(--gold)' }}>
          Blue Harbor
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
          Admin Dashboard
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-4 py-6">
        {navItems.map((item) => {
          const isActive = pathMatches(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setDrawerOpen(false)}
              className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
              style={{
                background: isActive ? 'var(--gold-dim)' : 'transparent',
                color: isActive ? 'var(--gold)' : 'var(--silver)',
                border: isActive ? '1px solid var(--border-gold)' : '1px solid transparent',
              }}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 space-y-3 px-4 pt-4">
        <AdminThemeToggle />
        <ReportModelToggle />
      </div>

      <div className="shrink-0 px-4 py-4" style={{ borderTop: '1px solid var(--border)' }}>
        {userEmail && (
          <div className="mb-3 truncate px-3 text-xs" style={{ color: 'var(--muted)' }}>
            {userEmail}
          </div>
        )}
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="btn-ghost w-full min-h-[48px] px-3 py-2.5 text-sm justify-start"
          style={{ color: 'var(--muted)', borderColor: 'transparent' }}
        >
          {signingOut ? 'Signing out…' : '→ Sign Out'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <header
        className="admin-mobile-header fixed left-0 right-0 top-0 z-50 items-center justify-between px-4 py-3"
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
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="rounded-lg px-3 py-2 text-lg leading-none"
          style={{ color: 'var(--silver)', border: '1px solid var(--border)' }}
          aria-label="Open menu"
        >
          ☰
        </button>
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
                Menu
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-2 text-xl leading-none"
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
        className="admin-sidebar-desktop fixed left-0 top-0 z-40 h-full w-60"
        style={{
          background: 'var(--navy2)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {sidebarInner}
      </aside>

      <nav
        className="admin-bottom-nav fixed bottom-0 left-0 right-0 z-50 items-stretch justify-around gap-1 border-t px-1 py-1"
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
              className="flex min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-2 text-[10px] font-semibold uppercase tracking-wide"
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
          className="flex min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-2 text-[10px] font-semibold uppercase tracking-wide"
          style={{ color: 'var(--muted)' }}
        >
          <span className="text-lg leading-none">⚙</span>
          More
        </button>
      </nav>
    </>
  );
}
