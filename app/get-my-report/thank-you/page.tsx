import Link from 'next/link';
import NavBar from '@/components/layout/NavBar';

interface Props {
  searchParams: Promise<{ name?: string; token?: string; leadId?: string }>;
}

export default async function ThankYouPage({ searchParams }: Props) {
  const params = await searchParams;
  const businessName = params.name ? decodeURIComponent(params.name) : 'Your Business';
  const token = params.token;

  return (
    <main style={{ background: 'var(--navy)', minHeight: '100vh' }}>
      <NavBar />

      <div className="relative overflow-hidden px-6 py-20 md:py-32">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(212,168,67,0.06) 0%, transparent 65%)',
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          {/* Pulse circle */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 pulse-gold"
            style={{
              background: 'var(--gold-dim)',
              border: '2px solid var(--gold)',
            }}
          >
            <span style={{ color: 'var(--gold)', fontSize: 32 }}>✓</span>
          </div>

          <h1
            className="font-heading text-4xl md:text-5xl mb-4"
            style={{ color: 'var(--light)' }}
          >
            Your Report Is Being Prepared
          </h1>

          <p className="text-lg mb-10" style={{ color: 'var(--silver)' }}>
            We&apos;re analyzing <strong style={{ color: 'var(--light)' }}>{businessName}</strong>{' '}
            against your competitor. Your report will be in your inbox within 2 minutes.
          </p>

          {/* While you wait */}
          <div className="card p-8 text-left mb-10">
            <h3
              className="font-heading text-xl mb-5"
              style={{ color: 'var(--light)' }}
            >
              While you wait — what&apos;s at stake:
            </h3>
            <ul className="space-y-3">
              {[
                '68% of customers do online research before choosing a local business — if your competitor looks better, they win.',
                'Businesses that actively track their competitive position grow 2.5x faster than those that don\'t.',
                'The #1 reason small businesses lose to competitors: they don\'t know what the competitor is doing differently.',
              ].map((stat, i) => (
                <li key={i} className="flex gap-3">
                  <span style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 2 }}>→</span>
                  <span className="text-sm leading-relaxed" style={{ color: 'var(--silver)' }}>
                    {stat}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {token && (
            <Link
              href={`/report/${token}`}
              className="btn-primary px-8 py-4 text-base inline-block"
            >
              Check Your Report Now →
            </Link>
          )}

          <p className="mt-4 text-sm" style={{ color: 'var(--muted)' }}>
            Also check your email — your report link will arrive in moments.
          </p>
        </div>
      </div>
    </main>
  );
}
