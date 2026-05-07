import Link from 'next/link';

export default function FinalCTA() {
  return (
    <section
      className="section-padding relative overflow-hidden py-16 text-center md:py-32"
      style={{ background: 'var(--navy)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,168,67,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto">
        <h2
          className="font-heading text-4xl md:text-6xl mb-6"
          style={{ color: 'var(--light)' }}
        >
          Ready to See Where You Stand?
        </h2>
        <p className="text-lg mb-10" style={{ color: 'var(--silver)' }}>
          Get a full competitive audit on your business in under 2 minutes. Free.
          No pitch, no pressure — just clarity.
        </p>
        <Link
          href="/get-my-report"
          className="btn-primary inline-block w-full px-10 py-4 text-base sm:w-auto"
        >
          Get Your Free Competitive Analysis →
        </Link>
        <p className="mt-4 text-sm" style={{ color: 'var(--muted)' }}>
          Takes 60 seconds · No credit card · No obligation
        </p>
      </div>
    </section>
  );
}
