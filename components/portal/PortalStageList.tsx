type StageState = 'done' | 'active' | 'pending';

export type PortalStage = {
  id: string;
  label: string;
  state: StageState;
  detail?: string;
};

export function PortalStageList({ stages }: { stages: PortalStage[] }) {
  return (
    <ul className="space-y-4">
      {stages.map((s) => (
        <li key={s.id} className="flex gap-4">
          <div className="flex w-8 shrink-0 justify-center pt-0.5">
            {s.state === 'done' && (
              <span className="flex h-7 w-7 items-center justify-center rounded-full text-sm text-white" style={{ background: '#1D9E75' }}>
                ✓
              </span>
            )}
            {s.state === 'active' && (
              <span
                className="flex h-7 w-7 animate-pulse items-center justify-center rounded-full border-2 text-xs font-bold"
                style={{ borderColor: '#C9A84C', color: '#0f1f38' }}
              >
                ●
              </span>
            )}
            {s.state === 'pending' && (
              <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs" style={{ borderColor: '#dee2e6', color: '#adb5bd' }}>
                ○
              </span>
            )}
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: '#0f1f38' }}>
              {s.label}
            </div>
            {s.detail && <div className="mt-0.5 text-xs" style={{ color: '#868E96' }}>{s.detail}</div>}
          </div>
        </li>
      ))}
    </ul>
  );
}
