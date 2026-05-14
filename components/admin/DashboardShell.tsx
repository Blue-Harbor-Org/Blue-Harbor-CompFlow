'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { useState } from 'react';
import type { TeamMember } from '@/types/dashboard';

interface DashboardShellProps {
  children: React.ReactNode;
  currentMember: TeamMember | null;
}

const sidebarNav = [
  { href: '/dashboard', label: 'Pipeline', icon: 'P' },
  { href: '/dashboard/team', label: 'Team', icon: 'T' },
] as const;

function pathMatches(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname.startsWith(href);
}

function Avatar({ member, size = 32 }: { member: TeamMember | null; size?: number }) {
  if (member?.avatar_url) {
    return (
      <Image
        src={member.avatar_url}
        alt={member.full_name}
        width={size}
        height={size}
        unoptimized
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
      />
    );
  }
  const initials = member?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?';
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--gold-dim)',
        border: '1px solid var(--border-gold)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.38,
        fontWeight: 700,
        color: 'var(--gold)',
      }}
    >
      {initials}
    </div>
  );
}

export { Avatar };

export default function DashboardShell({ children, currentMember }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  }

  return (
    <div style={{ background: 'var(--navy)', minHeight: '100vh' }}>
      {/* Mobile header */}
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
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="min-h-[44px] rounded-lg px-3 py-2 text-lg leading-none"
          style={{ color: 'var(--silver)', border: '1px solid var(--border)' }}
          aria-label="Open menu"
        >
          ☰
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="admin-mobile-header fixed inset-0 z-[60]"
          style={{ background: 'var(--admin-drawer-scrim)' }}
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="absolute right-0 top-0 flex h-full w-[min(100%,300px)] flex-col"
            style={{ background: 'var(--navy2)', borderLeft: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-sm font-semibold" style={{ color: 'var(--light)' }}>Menu</span>
              <button onClick={() => setMobileOpen(false)} className="p-2 text-xl" style={{ color: 'var(--muted)' }}>×</button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
              {sidebarNav.map((item) => {
                const isActive = pathMatches(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium"
                    style={{
                      background: isActive ? 'var(--gold-dim)' : 'transparent',
                      color: isActive ? 'var(--gold)' : 'var(--silver)',
                      border: isActive ? '1px solid var(--border-gold)' : '1px solid transparent',
                    }}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded text-xs font-bold"
                      style={{ background: 'var(--navy3)', color: isActive ? 'var(--gold)' : 'var(--muted)' }}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="px-3 py-4" style={{ borderTop: '1px solid var(--border)' }}>
              <button onClick={handleSignOut} disabled={signingOut}
                className="w-full rounded-lg px-3 py-2.5 text-left text-sm"
                style={{ color: 'var(--muted)' }}>
                {signingOut ? 'Signing out…' : '→ Sign out'}
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className="admin-sidebar-desktop fixed left-0 top-0 z-40 h-full w-[220px]"
        style={{ background: 'var(--navy2)', borderRight: '1px solid var(--border)' }}
      >
        <div className="flex h-full flex-col">
          <div className="px-5 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
            <Link href="/dashboard" className="font-heading text-xl" style={{ color: 'var(--gold)' }}>
              Blue Harbor
            </Link>
            <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
              Agency Dashboard
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {sidebarNav.map((item) => {
              const isActive = pathMatches(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150"
                  style={{
                    background: isActive ? 'var(--gold-dim)' : 'transparent',
                    color: isActive ? 'var(--gold)' : 'var(--silver)',
                    border: isActive ? '1px solid var(--border-gold)' : '1px solid transparent',
                  }}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded text-xs font-bold"
                    style={{ background: 'var(--navy3)', color: isActive ? 'var(--gold)' : 'var(--muted)' }}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="px-3 py-4" style={{ borderTop: '1px solid var(--border)' }}>
            {currentMember && (
              <div className="mb-3 flex items-center gap-2 px-2">
                <Avatar member={currentMember} size={28} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium" style={{ color: 'var(--light)' }}>
                    {currentMember.full_name}
                  </div>
                  <div className="truncate text-[10px]" style={{ color: 'var(--muted)' }}>
                    {currentMember.role}
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full rounded-lg px-3 py-2 text-left text-sm transition-colors"
              style={{ color: 'var(--muted)' }}
            >
              {signingOut ? 'Signing out…' : '→ Sign out'}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="admin-main">{children}</div>
    </div>
  );
}
