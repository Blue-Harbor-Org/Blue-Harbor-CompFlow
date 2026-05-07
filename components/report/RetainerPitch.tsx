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

      <div className="adv-grid mb-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div
            key={service.title}
            className="adv-card card p-5 md:p-6"
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

      <div className="cta-buttons flex flex-col items-stretch gap-3 md:items-center">
        <a
          href={calendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-block min-h-14 w-full px-8 py-4 text-center text-base md:w-auto md:px-10"
        >
          Let&apos;s Talk — Book Your Strategy Call →
        </a>
        <p className="mt-1 text-center text-sm md:mt-3" style={{ color: 'var(--muted)' }}>
          Free 30-minute call. No pressure. Just strategy.
        </p>
      </div>
    </section>
  );
}
