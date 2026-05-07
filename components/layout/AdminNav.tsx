'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { useState } from 'react';
import ReportModelToggle from '@/components/admin/ReportModelToggle';

interface AdminNavProps {
  userEmail?: string;
}

const navItems = [
  { href: '/dashboard', label: 'Pipeline', icon: '⬡' },
  { href: '/dashboard?view=all', label: 'All Leads', icon: '◈' },
  { href: '/dashboard/leads/new', label: 'Add Lead', icon: '+' },
];

export default function AdminNav({ userEmail }: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  }

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-60 flex flex-col z-40"
      style={{
        background: 'var(--navy2)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <div className="px-6 py-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="font-heading text-xl" style={{ color: 'var(--gold)' }}>
          Blue Harbor
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
          Admin Dashboard
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href.split('?')[0]);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
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

      {/* AI model toggle */}
      <div className="px-4 pt-4">
        <ReportModelToggle />
      </div>

      {/* User + Sign out */}
      <div className="px-4 py-4" style={{ borderTop: '1px solid var(--border)' }}>
        {userEmail && (
          <div
            className="text-xs mb-3 px-3 truncate"
            style={{ color: 'var(--muted)' }}
          >
            {userEmail}
          </div>
        )}
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all"
          style={{ color: 'var(--muted)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--red)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
        >
          {signingOut ? 'Signing out...' : '→ Sign Out'}
        </button>
      </div>
    </aside>
  );
}
