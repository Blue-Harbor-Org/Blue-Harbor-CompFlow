import NavBar from '@/components/layout/NavBar';
import RequestForm from '@/components/public/RequestForm';

export default function GetMyReportPage() {
  return (
    <main style={{ background: 'var(--navy)', minHeight: '100vh' }}>
      <NavBar />

      <div className="relative overflow-hidden">
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 40% at 50% 10%, rgba(212,168,67,0.06) 0%, transparent 65%)',
          }}
        />

        <div className="relative z-10 px-6 py-16 md:py-24">
          <div className="max-w-lg mx-auto text-center mb-10">
            <h1
              className="font-heading text-4xl md:text-5xl mb-4"
              style={{ color: 'var(--light)' }}
            >
              Get Your Free Competitive Analysis
            </h1>
            <p className="text-lg" style={{ color: 'var(--silver)' }}>
              We&apos;ll map your competitive landscape (up to three peers) and send you a
              personalized report in minutes. Add a competitor URL if you already know who to
              benchmark — or leave it blank and we&apos;ll discover them for you.
            </p>
          </div>

          <RequestForm />
        </div>
      </div>
    </main>
  );
}
