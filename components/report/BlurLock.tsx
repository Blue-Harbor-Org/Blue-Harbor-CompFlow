'use client';

import { useState } from 'react';

interface BlurLockProps {
  token: string;
  calendlyUrl: string;
}

export default function BlurLock({ token, calendlyUrl }: BlurLockProps) {
  const [clicked, setClicked] = useState(false);

  async function handleBookCall() {
    setClicked(true);
    try {
      await fetch('/api/book-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
    } catch (err) {
      console.error('Book call error:', err);
    }
    window.open(calendlyUrl, '_blank');
  }

  return (
    <div className="unlock-overlay">
      <div
        className="card p-8 md:p-12 text-center max-w-lg mx-4 relative z-20"
        style={{ background: 'rgba(9,20,40,0.97)', backdropFilter: 'blur(20px)' }}
      >
        {/* Lock icon */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'var(--gold-dim)', border: '1px solid var(--border-gold)' }}
        >
          <span style={{ color: 'var(--gold)', fontSize: 24 }}>🔒</span>
        </div>

        <h3
          className="font-heading text-2xl md:text-3xl mb-2"
          style={{ color: 'var(--light)' }}
        >
          Your Full Report Is Ready
        </h3>
        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
          Book a free 30-minute strategy call to unlock everything.
        </p>

        <ul className="text-left space-y-2.5 mb-8">
          {[
            'Head-to-head comparison across 12 categories',
            'Your top competitive advantages',
            'Market opportunities your competitor is missing',
            '90-day action roadmap',
            'Full marketing strategy',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--silver)' }}>
              <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span>
              {item}
            </li>
          ))}
        </ul>

        <button
          onClick={handleBookCall}
          disabled={clicked}
          className="btn-primary w-full py-4 text-sm"
        >
          {clicked ? 'Opening calendar...' : 'Book Your Free Strategy Call to Unlock →'}
        </button>

        <p className="text-xs mt-4" style={{ color: 'var(--muted)' }}>
          Free 30-minute call · No pressure · Just strategy
        </p>
      </div>
    </div>
  );
}
