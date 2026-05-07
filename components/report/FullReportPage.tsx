import type { Lead } from '@/types/lead';
import type { Report } from '@/types/report';
import FindingCard from './FindingCard';
import ComparisonTable from './ComparisonTable';
import RetainerPitch from './RetainerPitch';
import StickyCallBanner from './StickyCallBanner';
import Link from 'next/link';

interface Props {
  lead: Lead;
  report: Report;
  variant?: 'standard' | 'deepdive';
}

const priorityColors = {
  high: { border: 'var(--green)', bg: 'rgba(46,204,138,0.08)', badge: 'var(--green)' },
  medium: { border: 'var(--gold)', bg: 'rgba(212,168,67,0.08)', badge: 'var(--gold)' },
  low: { border: 'var(--silver)', bg: 'rgba(143,168,200,0.08)', badge: 'var(--silver)' },
};

type PriorityKey = keyof typeof priorityColors;

function normalizeOpportunityPriority(raw: string | undefined): PriorityKey {
  const p = raw?.toLowerCase().trim() ?? '';
  if (p === 'high' || p === 'medium' || p === 'low') return p;
  if (p === 'critical' || p === 'highest') return 'high';
  return 'medium';
}

// Safely read a string from an object trying multiple field-name variants.
// This protects against Claude using different key names than the schema specifies.
function str(obj: unknown, ...keys: string[]): string {
  if (!obj || typeof obj !== 'object') return '';
  const o = obj as Record<string, unknown>;
  for (const k of keys) {
    const v = o[k];
    if (typeof v === 'string' && v.trim()) return v;
  }
  return '';
}

export default function FullReportPage({
  lead,
  report,
  variant = 'standard',
}: Props) {
  const data = report.report_data!;
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || '#';

  const generatedDate =
    data.meta?.generatedAt ??
    new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'America/New_York',
    }).format(new Date());

  return (
    <div
      className="pb-32 md:pb-28"
      style={{ background: 'var(--navy)', minHeight: '100vh' }}
    >
      {/* Nav */}
      <nav
        className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-2 px-4 py-3 md:px-6 md:py-4"
        style={{
          background: 'rgba(5,12,26,0.95)',
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Link href="/" className="font-heading text-xl" style={{ color: 'var(--gold)' }}>
          Blue Harbor
        </Link>
        <span
          className="text-xs px-3 py-1 rounded-full"
          style={{
            background: 'rgba(46,204,138,0.1)',
            border: '1px solid rgba(46,204,138,0.3)',
            color: 'var(--green)',
          }}
        >
          {variant === 'deepdive' ? '🔬 Deep Dive Unlocked' : '✓ Full Report Unlocked'}
        </span>
      </nav>

      <div className="mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-14">

        {/* A. Hero */}
        <section className="relative mb-10 overflow-hidden rounded-xl p-6 text-center md:mb-14 md:p-10"
          style={{
            background: 'var(--navy2)',
            border: '1px solid var(--border-gold)',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(212,168,67,0.07) 0%, transparent 70%)',
            }}
          />
          <div className="relative z-10">
            <div
              className="inline-block text-xs font-semibold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-6"
              style={{
                background: 'var(--gold-dim)',
                border: '1px solid var(--border-gold)',
                color: 'var(--gold)',
              }}
            >
              {variant === 'deepdive'
                ? 'Deep Dive Competitive Intelligence'
                : 'Competitive Strategy Report'}
            </div>
            <h1
              className="hero-title font-heading mb-4 text-3xl leading-tight md:text-6xl"
              style={{ color: 'var(--light)' }}
            >
              {str(data.hero, 'headline', 'title', 'heading')}
            </h1>
            <p className="hero-subtitle mx-auto mb-10 max-w-2xl text-base md:text-lg" style={{ color: 'var(--silver)' }}>
              {str(data.hero, 'subheadline', 'subtitle', 'subTitle', 'description')}
            </p>

            <div className="stat-grid mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {(data.hero?.stats ?? []).map((stat, i) => (
                <div
                  key={i}
                  className="stat-box card p-3 text-center md:p-4"
                  style={{ background: 'rgba(10,30,60,0.5)' }}
                >
                  <div
                    className="stat-val font-heading mb-1 text-2xl font-light md:text-3xl"
                    style={{ color: 'var(--gold)' }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs font-semibold mb-1" style={{ color: 'var(--light)' }}>
                    {stat.label}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>
                    {stat.note}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Prepared exclusively for{' '}
              <strong style={{ color: 'var(--light)' }}>{lead.business_name}</strong> by Blue
              Harbor · {generatedDate}
            </p>
          </div>
        </section>

        <div className="gold-divider mb-14" />

        {/* B. Top Findings */}
        <section className="mb-14">
          <div className="mb-8">
            <h2
              className="font-heading text-3xl md:text-4xl mb-2"
              style={{ color: 'var(--light)' }}
            >
              3 Things Your Competitor Is Doing That You Need to Know
            </h2>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Full analysis — no filters.
            </p>
          </div>
          <div className="space-y-4">
            {(data.topFindings ?? []).map((finding, i) => (
              <FindingCard key={i} finding={finding} index={i} showFull={true} />
            ))}
          </div>
        </section>

        <div className="gold-divider mb-14" />

        {/* C. Comparison Table */}
        <section className="mb-14">
          <h2
            className="font-heading text-3xl md:text-4xl mb-8"
            style={{ color: 'var(--light)' }}
          >
            Head-to-Head Comparison
          </h2>
          <div className="card overflow-hidden">
            <ComparisonTable
              rows={data.comparison ?? []}
              clientName={lead.business_name}
              competitorName={data.meta?.competitorName ?? 'Competitor'}
            />
          </div>
        </section>

        {variant === 'deepdive' && !data.deepDive && (
          <>
            <div className="gold-divider mb-14" />
            <section className="mb-14">
              <div
                className="card p-8 text-center"
                style={{ borderColor: 'var(--border-gold)' }}
              >
                <div className="text-3xl mb-3">🔬</div>
                <h3 className="font-heading text-xl mb-2" style={{ color: 'var(--gold)' }}>
                  Deep Dive Sections Pending
                </h3>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  The SEO analysis and reputation sections are being reprocessed. An updated
                  report will be sent to you shortly.
                </p>
              </div>
            </section>
          </>
        )}

        {data.deepDive && (
          <>
            <div className="gold-divider mb-14" />
            <section className="mb-14">
              <h2
                className="font-heading text-3xl md:text-4xl mb-6"
                style={{ color: 'var(--light)' }}
              >
                SEO & Search Visibility
              </h2>
              <div className="card p-6 mb-4" style={{ borderColor: 'var(--border-gold)' }}>
                <h3 className="font-heading text-xl mb-3" style={{ color: 'var(--gold)' }}>
                  {data.deepDive.seo?.headline}
                </h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--silver)' }}>
                  {data.deepDive.seo?.summary}
                </p>
                {data.deepDive.seo?.keywordNotes && (
                  <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
                    {data.deepDive.seo.keywordNotes}
                  </p>
                )}
                <ul className="space-y-2 text-sm" style={{ color: 'var(--silver)' }}>
                  {(data.deepDive.seo?.bullets ?? []).map((b, i) => (
                    <li key={i}>• {b}</li>
                  ))}
                </ul>
              </div>
            </section>

            <div className="gold-divider mb-14" />
            <section className="mb-14">
              <h2
                className="font-heading text-3xl md:text-4xl mb-6"
                style={{ color: 'var(--light)' }}
              >
                Reviews & Reputation
              </h2>
              <div className="card p-6" style={{ borderColor: 'var(--border-gold)' }}>
                <h3 className="font-heading text-xl mb-4" style={{ color: 'var(--gold)' }}>
                  {data.deepDive.reviews?.headline}
                </h3>
                <div className="grid gap-4 md:grid-cols-2 mb-4">
                  <div>
                    <div className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--muted)' }}>
                      You
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--silver)' }}>
                      {data.deepDive.reviews?.clientSummary}
                    </p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--muted)' }}>
                      Competitor
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--silver)' }}>
                      {data.deepDive.reviews?.competitorSummary}
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed border-t pt-4" style={{ borderColor: 'var(--border)', color: 'var(--light)' }}>
                  <strong style={{ color: 'var(--gold)' }}>Recommendation:</strong>{' '}
                  {data.deepDive.reviews?.recommendation}
                </p>
              </div>
            </section>
          </>
        )}

        <div className="gold-divider mb-14" />

        {/* D. Advantages */}
        <section className="mb-14">
          <h2
            className="font-heading text-3xl md:text-4xl mb-2"
            style={{ color: 'var(--light)' }}
          >
            Where You Already Win
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
            Real, verifiable advantages you have right now.
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            {(data.advantages ?? []).map((adv, i) => (
              <div
                key={i}
                className="card p-6"
                style={{ borderColor: 'var(--border-gold)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3
                    className="font-heading text-xl"
                    style={{ color: 'var(--light)' }}
                  >
                    {str(adv, 'title', 'name', 'heading')}
                  </h3>
                  <span
                    className="text-xs font-semibold px-2 py-1 rounded flex-shrink-0 ml-2"
                    style={{
                      background: 'var(--gold-dim)',
                      border: '1px solid var(--border-gold)',
                      color: 'var(--gold)',
                    }}
                  >
                    {str(adv, 'badge', 'tag', 'label', 'category')}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--silver)' }}>
                  {str(adv, 'description', 'body', 'detail', 'summary', 'content')}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="gold-divider mb-14" />

        {/* E. Opportunities */}
        <section className="mb-14">
          <h2
            className="font-heading text-3xl md:text-4xl mb-2"
            style={{ color: 'var(--light)' }}
          >
            Where You Can Win More
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
            Gaps in your competitor&apos;s strategy you can move into now.
          </p>
          <div className="space-y-4">
            {(data.opportunities ?? []).map((opp, i) => {
              const pKey = normalizeOpportunityPriority(opp.priority);
              const pColors = priorityColors[pKey];
              return (
                <div
                  key={i}
                  className="card p-6"
                  style={{
                    borderLeft: `3px solid ${pColors.border}`,
                    background: pColors.bg,
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3
                      className="font-heading text-lg"
                      style={{ color: 'var(--light)' }}
                    >
                      {str(opp, 'title', 'name', 'heading')}
                    </h3>
                    <span
                      className="text-xs font-bold px-2 py-1 rounded flex-shrink-0 ml-2 uppercase"
                      style={{
                        color: pColors.badge,
                        background: `${pColors.bg}`,
                        border: `1px solid ${pColors.border}`,
                      }}
                    >
                      {pKey}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--silver)' }}>
                    {str(opp, 'description', 'body', 'detail', 'summary', 'content')}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <div className="gold-divider mb-14" />

        {/* F. Threats */}
        <section className="mb-14">
          <h2
            className="font-heading text-3xl md:text-4xl mb-2"
            style={{ color: 'var(--light)' }}
          >
            What to Watch Out For
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
            Honest intelligence on where your competitor has the edge.
          </p>
          <div className="space-y-4">
            {(data.threats ?? []).map((threat, i) => (
              <div
                key={i}
                className="card p-6"
                style={{ borderLeft: '3px solid var(--red)' }}
              >
                <h3
                  className="font-heading text-lg mb-2"
                  style={{ color: 'var(--light)' }}
                >
                  {str(threat, 'title', 'name', 'heading')}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--silver)' }}>
                  {str(threat, 'description', 'body', 'detail', 'summary', 'content')}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="gold-divider mb-14" />

        {/* G. Roadmap */}
        <section className="mb-14">
          <h2
            className="font-heading text-3xl md:text-4xl mb-2"
            style={{ color: 'var(--light)' }}
          >
            Your 90-Day Action Roadmap
          </h2>
          <p className="text-sm mb-10" style={{ color: 'var(--muted)' }}>
            Prioritized steps — start here, do these in order.
          </p>
          <div className="space-y-0">
            {(data.roadmap ?? []).map((step, i) => (
              <div key={i} className="flex gap-6">
                {/* Timeline */}
                <div className="flex flex-shrink-0 flex-col items-center">
                  <div
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold md:h-10 md:w-10 md:text-sm"
                    style={{
                      background: 'var(--gold-dim)',
                      border: '2px solid var(--gold)',
                      color: 'var(--gold)',
                    }}
                  >
                    {step.step}
                  </div>
                  {i < (data.roadmap ?? []).length - 1 && (
                    <div
                      className="w-0.5 flex-1 my-2"
                      style={{ background: 'var(--border)', minHeight: 40 }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="pb-10 flex-1">
                  <div
                    className="text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{ color: 'var(--gold)' }}
                  >
                    {str(step, 'phase', 'stage', 'timeframe', 'period')}
                  </div>
                  <h3
                    className="font-heading text-xl mb-2"
                    style={{ color: 'var(--light)' }}
                  >
                    {str(step, 'title', 'name', 'action', 'heading')}
                  </h3>
                  <p
                    className="text-sm leading-relaxed mb-3"
                    style={{ color: 'var(--silver)' }}
                  >
                    {str(step, 'description', 'body', 'detail', 'summary', 'content')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(step.tags ?? []).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          background: 'rgba(13,31,60,0.8)',
                          border: '1px solid var(--border)',
                          color: 'var(--muted)',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="gold-divider mb-14" />

        {/* H. Retainer Pitch */}
        <RetainerPitch
          calendlyUrl={calendlyUrl}
          ctaHeadline={data.cta?.headline}
          ctaBody={data.cta?.body}
        />

        {/* I. Footer */}
        <div className="gold-divider mt-14 mb-8" />
        <div className="text-center">
          <div className="font-heading text-lg mb-1" style={{ color: 'var(--gold)' }}>
            Blue Harbor
          </div>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            © 2026 Blue Harbor · Clarity. Strategy. Growth.
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
            This report was prepared exclusively for{' '}
            <strong style={{ color: 'var(--silver)' }}>{lead.business_name}</strong> and is
            confidential.
          </p>
        </div>
      </div>

      {/* Sticky CTA */}
      <StickyCallBanner calendlyUrl={calendlyUrl} />
    </div>
  );
}
