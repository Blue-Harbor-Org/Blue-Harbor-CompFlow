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

export default function TestimonialsSection() {
  return (
    <section className="px-6 py-20 md:py-28" style={{ background: 'var(--navy2)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="gold-divider mb-16" />

        <div className="text-center mb-16">
          <h2
            className="font-heading text-4xl md:text-5xl mb-4"
            style={{ color: 'var(--light)' }}
          >
            What Clients Say
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="card p-7 flex flex-col">
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: 'var(--gold)' }}>★</span>
                ))}
              </div>

              <p
                className="text-sm leading-relaxed flex-1 mb-6 italic"
                style={{ color: 'var(--silver)' }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3 mt-auto">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{
                    background: 'var(--gold-dim)',
                    border: '1px solid var(--border-gold)',
                    color: 'var(--gold)',
                  }}
                >
                  {t.initials}
                </div>
                <div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: 'var(--light)' }}
                  >
                    {t.name}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>
                    {t.title} · {t.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="gold-divider mt-16" />
      </div>
    </section>
  );
}
