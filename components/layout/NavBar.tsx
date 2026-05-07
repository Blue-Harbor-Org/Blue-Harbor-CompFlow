import Link from 'next/link';

export default function NavBar() {
  return (
    <nav
      className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
      style={{
        background: 'rgba(5,12,26,0.92)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <Link href="/" className="font-heading text-2xl" style={{ color: 'var(--gold)' }}>
        Blue Harbor
      </Link>

      <Link
        href="/get-my-report"
        className="btn-primary px-5 py-2.5 text-sm"
      >
        Get Free Competitive Analysis
      </Link>
    </nav>
  );
}
