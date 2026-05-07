import type { Lead } from '@/types/lead';
import type { Report } from '@/types/report';
import FindingCard from './FindingCard';
import BlurLock from './BlurLock';
import Link from 'next/link';

interface TeaserPageProps {
  lead: Lead;
  report: Report;
}

export default function TeaserPage({ lead, report }: TeaserPageProps) {
  const reportData = report.report_data;
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || '#';
  const competitorName =
    lead.competitor_name ||
    reportData?.meta?.competitorName ||
    'your competitor';

  const generatedDate =
    reportData?.meta?.generatedAt ??
    new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'America/New_York',
    }).format(new Date());

  return (
    <div style={{ background: 'var(--navy)', minHeight: '100vh' }}>
      {/* Nav */}
      <nav
        className="sticky top-0 z-50 flex flex-col gap-2 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between md:px-6 md:py-4"
        style={{
          background: 'rgba(5,12,26,0.92)',
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Link href="/" className="font-heading text-xl" style={{ color: 'var(--gold)' }}>
          Blue Harbor
        </Link>
        <div className="text-xs sm:ml-auto" style={{ color: 'var(--muted)' }}>
          Confidential Report
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
        {/* Header */}
        <div className="mb-10">
          <div
            className="text-sm font-semibold mb-2 uppercase tracking-wider"
            style={{ color: 'var(--gold)' }}
          >
            Competitive Analysis
          </div>
          <h1
            className="font-heading text-3xl md:text-4xl mb-2"
            style={{ color: 'var(--light)' }}
          >
            {lead.business_name}&apos;s Competitive Analysis
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Prepared by Blue Harbor · {generatedDate}
          </p>
          <div className="gold-divider mt-6" />
        </div>

        {/* Section 1: Top 3 Findings */}
        {reportData ? (
          <>
            <div className="mb-8">
              <h2
                className="font-heading text-2xl md:text-3xl mb-2"
                style={{ color: 'var(--light)' }}
              >
                We found 3 things you need to know about{' '}
                <span style={{ color: 'var(--gold)' }}>{competitorName}</span>
              </h2>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                These are your most urgent strategic insights.
              </p>
            </div>

            <div className="space-y-4 mb-14">
              {reportData.topFindings.slice(0, 3).map((finding, i) => (
                <FindingCard key={i} finding={finding} index={i} showFull={false} />
              ))}
            </div>
          </>
        ) : (
          <div className="card p-10 text-center mb-14">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 pulse-gold"
              style={{ background: 'var(--gold-dim)', border: '2px solid var(--gold)' }}
            >
              <span style={{ color: 'var(--gold)', fontSize: 20 }}>⟳</span>
            </div>
            <h3 className="font-heading text-xl mb-2" style={{ color: 'var(--light)' }}>
              Your report is being generated...
            </h3>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              This usually takes less than 2 minutes. Refresh this page shortly.
            </p>
          </div>
        )}

        {/* Section 2: Blur lock */}
        {reportData && (
          <div className="relative mb-14">
            {/* Blurred preview */}
            <div className="locked-preview select-none pointer-events-none" aria-hidden="true">
              {/* Mock comparison table */}
              <div className="card p-6 mb-4">
                <h3 className="font-heading text-xl mb-4" style={{ color: 'var(--light)' }}>
                  Full Competitive Comparison
                </h3>
                <div className="space-y-3">
                  {['Website Quality', 'SEO Strength', 'Social Proof', 'Content Strategy', 'Pricing Clarity'].map((row) => (
                    <div key={row} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                      <span className="text-sm" style={{ color: 'var(--silver)' }}>{row}</span>
                      <div className="flex gap-4">
                        <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(46,204,138,0.2)', color: 'var(--green)' }}>You Win</span>
                        <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(224,80,80,0.2)', color: 'var(--red)' }}>They Win</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mock advantages */}
              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="card p-4">
                    <div className="w-8 h-8 rounded mb-2" style={{ background: 'var(--gold-dim)' }} />
                    <div className="h-4 rounded mb-2" style={{ background: 'rgba(143,168,200,0.2)', width: '80%' }} />
                    <div className="h-3 rounded" style={{ background: 'rgba(143,168,200,0.1)', width: '100%' }} />
                  </div>
                ))}
              </div>

              {/* Mock roadmap */}
              <div className="card p-6">
                <h3 className="font-heading text-xl mb-4" style={{ color: 'var(--light)' }}>90-Day Action Roadmap</h3>
                <div className="space-y-3">
                  {[1,2,3].map((i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ background: 'var(--gold-dim)' }} />
                      <div className="flex-1">
                        <div className="h-4 rounded mb-1" style={{ background: 'rgba(143,168,200,0.2)', width: '60%' }} />
                        <div className="h-3 rounded" style={{ background: 'rgba(143,168,200,0.1)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Unlock overlay */}
            <BlurLock token={lead.report_token} calendlyUrl={calendlyUrl} />
          </div>
        )}

        {/* Urgency section */}
        <div className="gold-divider mb-10" />
        <div className="card p-8">
          <h3
            className="font-heading text-2xl mb-6"
            style={{ color: 'var(--light)' }}
          >
            What happens if you wait?
          </h3>
          <div className="space-y-4">
            {[
              {
                icon: '⚡',
                text: 'Your competitor is executing their strategy right now. Every day without a plan is ground they\'re gaining.',
              },
              {
                icon: '📊',
                text: 'The businesses that win are the ones that act on intelligence first — not the ones who see the same report 6 months later.',
              },
              {
                icon: '🎯',
                text: 'A 30-minute strategy call is all it takes to turn this analysis into a plan you can start executing this week.',
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--silver)' }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
