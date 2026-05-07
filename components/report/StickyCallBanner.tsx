'use client';

interface Props {
  calendlyUrl: string;
}

export default function StickyCallBanner({ calendlyUrl }: Props) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4"
      style={{
        background: 'rgba(5,12,26,0.97)',
        borderTop: '1px solid var(--border-gold)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <p className="text-sm font-medium" style={{ color: 'var(--silver)' }}>
        Ready to turn this strategy into results?
      </p>
      <a
        href={calendlyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary px-6 py-2.5 text-sm flex-shrink-0"
      >
        Book a Call with Blue Harbor →
      </a>
    </div>
  );
}
