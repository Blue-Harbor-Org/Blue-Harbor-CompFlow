import Link from 'next/link';

export default function HeroSection() {
  return (
    <section
      className="section-padding relative overflow-hidden py-16 text-center md:py-36"
      style={{ background: 'var(--navy)' }}
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 20%, rgba(212,168,67,0.07) 0%, transparent 65%)',
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Eyebrow */}
        <div
          className="inline-block text-xs font-semibold tracking-[0.2em] px-4 py-1.5 rounded-full mb-6 uppercase"
          style={{
            background: 'var(--gold-dim)',
            border: '1px solid var(--border-gold)',
            color: 'var(--gold)',
          }}
        >
          Free Competitive Analysis
        </div>

        <h1
          className="font-heading mb-6 text-4xl leading-tight md:text-7xl"
          style={{ color: 'var(--light)' }}
        >
          Find Out Exactly Where You&apos;re{' '}
          <span style={{ color: 'var(--gold)' }}>Losing to Your Competition</span>
        </h1>

        <p
          className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
          style={{ color: 'var(--silver)' }}
        >
          Enter your website and your competitor&apos;s. Blue Harbor builds you a full
          AI-powered competitive audit — free. No catch. Just clarity.
        </p>

        <div className="flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
          <Link
            href="/get-my-report"
            className="btn-primary inline-block w-full px-8 py-4 text-center text-base sm:w-auto"
          >
            Get My Free Report →
          </Link>
        </div>

        <p className="mt-4 text-sm" style={{ color: 'var(--muted)' }}>
          Takes 60 seconds to request · Report delivered in under 2 minutes
        </p>
      </div>
    </section>
  );
}
