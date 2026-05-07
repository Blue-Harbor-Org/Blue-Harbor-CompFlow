'use client';

interface Props {
  calendlyUrl: string;
}

export default function StickyCallBanner({ calendlyUrl }: Props) {
  return (
    <div
      className="sticky-banner fixed bottom-0 left-0 right-0 z-50 flex flex-col items-stretch justify-between gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-6 sm:py-4"
      style={{
        background: 'rgba(5,12,26,0.97)',
        borderTop: '1px solid var(--border-gold)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <p className="banner-text text-center text-sm font-medium sm:text-left" style={{ color: 'var(--silver)' }}>
        Ready to turn this strategy into results?
      </p>
      <a
        href={calendlyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="banner-btn btn-primary shrink-0 px-6 py-3 text-center text-sm sm:py-2.5"
      >
        Book a Call with Blue Harbor →
      </a>
    </div>
  );
}
