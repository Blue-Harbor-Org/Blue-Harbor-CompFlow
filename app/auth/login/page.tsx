'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--navy)' }}
    >
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(212,168,67,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="font-heading text-3xl mb-2"
            style={{ color: 'var(--gold)' }}
          >
            Blue Harbor
          </div>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Clarity. Strategy. Growth.
          </p>
        </div>

        <div
          className="card p-8"
          style={{ background: 'rgba(9,20,40,0.8)', backdropFilter: 'blur(12px)' }}
        >
          <h1
            className="font-heading text-2xl mb-2"
            style={{ color: 'var(--light)' }}
          >
            Admin Access
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
            Sign in to access your dashboard.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: 'var(--silver)' }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                style={{
                  background: 'rgba(13,31,60,0.8)',
                  border: '1px solid var(--border)',
                  color: 'var(--light)',
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = 'var(--border-gold)')
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = 'var(--border)')
                }
                placeholder="you@blueharbor.com"
              />
            </div>

            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: 'var(--silver)' }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                style={{
                  background: 'rgba(13,31,60,0.8)',
                  border: '1px solid var(--border)',
                  color: 'var(--light)',
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = 'var(--border-gold)')
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = 'var(--border)')
                }
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div
                className="text-sm px-4 py-3 rounded-lg"
                style={{
                  background: 'rgba(224,80,80,0.1)',
                  border: '1px solid rgba(224,80,80,0.3)',
                  color: 'var(--red)',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In to Dashboard'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--muted)' }}>
          © 2026 Blue Harbor · Internal use only
        </p>
      </div>
    </div>
  );
}
