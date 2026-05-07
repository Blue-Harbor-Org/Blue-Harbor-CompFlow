import Link from 'next/link';

export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden px-6 py-24 md:py-36 text-center"
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
          className="font-heading text-5xl md:text-7xl leading-tight mb-6"
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

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link
            href="/get-my-report"
            className="btn-primary px-8 py-4 text-base inline-block"
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
