'use client';

const features = [
  {
    icon: '⚖',
    title: 'Head-to-Head Comparison',
    subtitle: '12 Categories',
    description: 'Side-by-side scoring across website quality, SEO, trust signals, messaging, pricing, and more.',
  },
  {
    icon: '◆',
    title: 'Your Competitive Advantages',
    subtitle: 'Where You Already Win',
    description: 'What you do better right now — and how to amplify it before your competitor catches up.',
  },
  {
    icon: '◉',
    title: 'Market Opportunities',
    subtitle: 'What They\'re Missing',
    description: 'Gaps in your competitor\'s strategy that you can move into quickly.',
  },
  {
    icon: '⚠',
    title: 'Threats to Know About',
    subtitle: 'Where They\'re Stronger',
    description: 'Honest intelligence on where your competitor has the edge — and how to neutralize it.',
  },
  {
    icon: '→',
    title: '90-Day Action Roadmap',
    subtitle: 'Prioritized Steps',
    description: 'A clear, sequenced plan: what to do first, second, and third to close the gap.',
  },
  {
    icon: '✦',
    title: 'Full Marketing Strategy',
    subtitle: 'Complete Recommendations',
    description: 'Specific recommendations across SEO, ads, website, social, and positioning.',
  },
];

export default function WhatIsInReport() {
  return (
    <section className="section-padding py-16 md:py-28" style={{ background: 'var(--navy)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2
            className="font-heading text-4xl md:text-5xl mb-4"
            style={{ color: 'var(--light)' }}
          >
            What&apos;s In Your Report
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--muted)' }}>
            Not generic advice. A full competitive audit built around your specific business.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="card p-6 group hover:border-gold transition-all duration-300"
              style={{ transition: 'border-color 0.3s ease' }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border-gold)')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(100,140,200,0.15)')
              }
            >
              <div
                className="text-2xl mb-4"
                style={{ color: 'var(--gold)' }}
              >
                {f.icon}
              </div>
              <div
                className="font-heading text-xl mb-1"
                style={{ color: 'var(--light)' }}
              >
                {f.title}
              </div>
              <div
                className="text-xs font-semibold mb-3 uppercase tracking-wider"
                style={{ color: 'var(--gold)' }}
              >
                {f.subtitle}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--silver)' }}>
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
