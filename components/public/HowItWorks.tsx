const steps = [
  {
    number: '01',
    title: 'Tell us who you\'re up against',
    description: 'Enter your website and your competitor\'s. That\'s all we need to start.',
  },
  {
    number: '02',
    title: 'We analyze everything',
    description: 'AI scans positioning, pricing, products, trust signals, messaging, and more — in under 2 minutes.',
  },
  {
    number: '03',
    title: 'Get your strategy',
    description: 'Book a call, unlock your full report, and start executing a plan that puts you ahead.',
  },
];

export default function HowItWorks() {
  return (
    <section className="section-padding py-16 md:py-28" style={{ background: 'var(--navy2)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="gold-divider mb-16" />

        <div className="text-center mb-16">
          <h2
            className="font-heading text-4xl md:text-5xl mb-4"
            style={{ color: 'var(--light)' }}
          >
            How It Works
          </h2>
          <p style={{ color: 'var(--muted)' }}>Three steps. Under two minutes. Real intelligence.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {steps.map((step) => (
            <div key={step.number} className="card p-8 relative">
              <div
                className="font-heading text-6xl font-light absolute top-4 right-6 opacity-20"
                style={{ color: 'var(--gold)' }}
              >
                {step.number}
              </div>
              <div
                className="font-heading text-xl mb-4 mt-2"
                style={{ color: 'var(--light)' }}
              >
                {step.title}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--silver)' }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="gold-divider mt-16" />
      </div>
    </section>
  );
}
