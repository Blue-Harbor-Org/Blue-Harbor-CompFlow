import NavBar from '@/components/layout/NavBar';
import HeroSection from '@/components/public/HeroSection';
import HowItWorks from '@/components/public/HowItWorks';
import WhatIsInReport from '@/components/public/WhatIsInReport';
import TestimonialsSection from '@/components/public/TestimonialsSection';
import FinalCTA from '@/components/public/FinalCTA';

export default function HomePage() {
  return (
    <main style={{ background: 'var(--navy)' }}>
      <NavBar />
      <HeroSection />
      <HowItWorks />
      <WhatIsInReport />
      <TestimonialsSection />
      <FinalCTA />

      {/* Footer */}
      <footer
        className="text-center py-8 px-4"
        style={{
          borderTop: '1px solid var(--border)',
          color: 'var(--muted)',
        }}
      >
        <div className="font-heading text-lg mb-1" style={{ color: 'var(--gold)' }}>
          Blue Harbor
        </div>
        <p className="text-sm">© 2026 Blue Harbor · Clarity. Strategy. Growth.</p>
      </footer>
    </main>
  );
}
