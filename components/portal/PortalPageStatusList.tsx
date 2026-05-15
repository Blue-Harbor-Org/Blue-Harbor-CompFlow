export type PageRow = { slug: string; title: string; status: string | null };

export function PortalPageStatusList({ pages }: { pages: PageRow[] }) {
  if (!pages.length) return null;
  return (
    <section className="mt-10">
      <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#C9A84C' }}>
        Pages
      </h2>
      <ul className="mt-4 space-y-2">
        {pages.map((p) => (
          <li
            key={p.slug}
            className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm"
            style={{ borderColor: '#E9ECEF', background: '#fff' }}
          >
            <span style={{ color: '#212529' }}>{p.title || p.slug}</span>
            <span className="text-xs capitalize" style={{ color: '#868E96' }}>
              {p.status === 'done' && '✓ Ready'}
              {p.status === 'generating' && '● Generating…'}
              {p.status === 'failed' && 'Failed'}
              {(!p.status || p.status === 'pending') && '○ Pending'}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
