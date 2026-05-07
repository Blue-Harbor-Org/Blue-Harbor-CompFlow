const services = [
  {
    icon: '◻',
    title: 'Website Design & Development',
    description:
      'A high-converting site built to outperform your competitor\'s. Custom design, fast, mobile-first.',
  },
  {
    icon: '◈',
    title: 'SEO & Content Strategy',
    description:
      'We get you ranking for the searches your competitor is winning. Long-term organic growth.',
  },
  {
    icon: '⬡',
    title: 'Google & Meta Ads',
    description:
      'Paid campaigns engineered for ROI. We manage the budget, creative, and optimization.',
  },
  {
    icon: '✦',
    title: 'Social Media Management',
    description:
      'Consistent, branded content across your channels. We handle it so you don\'t have to.',
  },
  {
    icon: '◉',
    title: 'Monthly Performance Reporting',
    description:
      'Full transparency on what\'s working. Clear dashboards, real numbers, no fluff.',
  },
  {
    icon: '→',
    title: 'Dedicated Account Manager',
    description:
      'One point of contact who knows your business. Available, responsive, invested in your growth.',
  },
];

interface Props {
  calendlyUrl: string;
  ctaHeadline?: string;
  ctaBody?: string;
}

export default function RetainerPitch({ calendlyUrl, ctaHeadline, ctaBody }: Props) {
  return (
    <section className="py-16 md:py-24">
      <div className="text-center mb-12">
        <h2
          className="font-heading text-4xl md:text-5xl mb-3"
          style={{ color: 'var(--light)' }}
        >
          {ctaHeadline || 'You Have the Strategy. Now You Need the Team.'}
        </h2>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--silver)' }}>
          Blue Harbor executes this plan for you — end to end. Here&apos;s what a full retainer includes:
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
        {services.map((service) => (
          <div
            key={service.title}
            className="card p-6"
            style={{ borderColor: 'var(--border-gold)' }}
          >
            <div className="text-2xl mb-3" style={{ color: 'var(--gold)' }}>
              {service.icon}
            </div>
            <h3
              className="font-heading text-lg mb-2"
              style={{ color: 'var(--light)' }}
            >
              {service.title}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--silver)' }}>
              {service.description}
            </p>
          </div>
        ))}
      </div>

      {ctaBody && (
        <p
          className="text-center text-sm mb-8"
          style={{ color: 'var(--muted)' }}
        >
          {ctaBody}
        </p>
      )}

      <p className="text-center text-sm mb-8" style={{ color: 'var(--muted)' }}>
        Most clients see results within 60–90 days.
      </p>

      <div className="text-center">
        <a
          href={calendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary px-10 py-4 text-base inline-block"
        >
          Let&apos;s Talk — Book Your Strategy Call →
        </a>
        <p className="mt-3 text-sm" style={{ color: 'var(--muted)' }}>
          Free 30-minute call. No pressure. Just strategy.
        </p>
      </div>
    </section>
  );
}
