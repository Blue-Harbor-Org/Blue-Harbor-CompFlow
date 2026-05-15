export function PortalProgressBar({ pct }: { pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="rounded-full p-1" style={{ background: '#E9ECEF' }}>
      <div
        className="h-3 rounded-full transition-all duration-500"
        style={{
          width: `${clamped}%`,
          background: 'linear-gradient(90deg, #0f1f38, #1a3a6e)',
        }}
      />
    </div>
  );
}
