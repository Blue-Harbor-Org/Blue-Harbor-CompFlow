'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50 px-4 py-3 md:px-6 md:py-4"
      style={{
        background: 'rgba(5,12,26,0.92)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
        paddingTop: 'max(12px, env(safe-area-inset-top))',
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <Link href="/" className="font-heading text-xl md:text-2xl" style={{ color: 'var(--gold)' }}>
          Blue Harbor
        </Link>

        <Link
          href="/get-my-report"
          className="btn-primary hidden px-4 py-2.5 text-sm md:inline-block md:px-5"
        >
          Get Free Competitive Analysis
        </Link>

        <button
          type="button"
          className="rounded-lg px-3 py-2 text-xl leading-none md:hidden"
          style={{ color: 'var(--silver)', border: '1px solid var(--border)' }}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          {open ? '×' : '☰'}
        </button>
      </div>

      {open && (
        <div
          className="mx-auto mt-3 flex max-w-6xl flex-col gap-2 border-t pt-3 md:hidden"
          style={{ borderColor: 'var(--border)' }}
        >
          <Link
            href="/get-my-report"
            className="btn-primary w-full py-3 text-center text-sm"
            onClick={() => setOpen(false)}
          >
            Get Free Competitive Analysis
          </Link>
          <Link
            href="/auth/login"
            className="btn-ghost w-full py-3 text-center text-sm"
            onClick={() => setOpen(false)}
          >
            Admin login
          </Link>
        </div>
      )}
    </nav>
  );
}
