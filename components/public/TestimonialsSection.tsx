'use client';

const testimonials = [
  {
    quote:
      "I had no idea we were losing customers because our competitor had a 4.9 rating and we had never asked for reviews. Blue Harbor spotted it in the first line of the report.",
    name: 'Marcus T.',
    title: 'Owner',
    company: 'Riverstone Plumbing',
    initials: 'MT',
  },
  {
    quote:
      "The report showed us exactly why we were losing to the new spa down the street. We booked the call, made the changes, and our bookings went up 40% in 60 days.",
    name: 'Sandra K.',
    title: 'Founder',
    company: 'Coastal Med Spa',
    initials: 'SK',
  },
  {
    quote:
      "Most agencies show up with vague ideas. Blue Harbor showed up with data. We signed the retainer the same day.",
    name: 'Derek M.',
    title: 'CEO',
    company: 'Summit Financial Group',
    initials: 'DM',
  },
];

function TestimonialCard({ t }: { t: (typeof testimonials)[0] }) {
  return (
    <div className="testimonial-card card flex flex-col p-7">
      <div className="mb-5 flex gap-1">
        {[...Array(5)].map((_, i) => (
          <span key={i} style={{ color: 'var(--gold)' }}>
            ★
          </span>
        ))}
      </div>
      <p className="mb-6 flex-1 text-sm italic leading-relaxed" style={{ color: 'var(--silver)' }}>
        &ldquo;{t.quote}&rdquo;
      </p>
      <div className="mt-auto flex items-center gap-3">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
          style={{
            background: 'var(--gold-dim)',
            border: '1px solid var(--border-gold)',
            color: 'var(--gold)',
          }}
        >
          {t.initials}
        </div>
        <div>
          <div className="text-sm font-semibold" style={{ color: 'var(--light)' }}>
            {t.name}
          </div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>
            {t.title} · {t.company}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="section-padding py-16 md:py-28" style={{ background: 'var(--navy2)' }}>
      <div className="mx-auto max-w-5xl">
        <div className="gold-divider mb-12 md:mb-16" />

        <div className="mb-12 text-center md:mb-16">
          <h2 className="font-heading mb-4 text-3xl md:text-5xl" style={{ color: 'var(--light)' }}>
            What Clients Say
          </h2>
        </div>

        <div className="testimonial-track md:hidden">
          {testimonials.map((t) => (
            <TestimonialCard key={t.name} t={t} />
          ))}
        </div>

        <div className="hidden gap-6 md:grid md:grid-cols-3">
          {testimonials.map((t) => (
            <TestimonialCard key={t.name} t={t} />
          ))}
        </div>

        <div className="gold-divider mt-12 md:mt-16" />
      </div>
    </section>
  );
}
