'use client';

import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export default function PWAInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    if (!deferred) return;
    const id = window.setTimeout(() => setShow(true), 30_000);
    return () => window.clearTimeout(id);
  }, [deferred]);

  if (!show || !deferred) return null;

  return (
    <div
      className="fixed left-4 right-4 z-[100] flex items-center gap-3 rounded-xl p-4 pr-3 shadow-lg md:left-auto md:right-6 md:max-w-md"
      style={{
        bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',
        background: 'var(--navy2)',
        border: '1px solid var(--border-gold)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold" style={{ color: 'var(--light)' }}>
          Add Blue Harbor to your home screen
        </div>
        <div className="text-xs" style={{ color: 'var(--muted)' }}>
          Manage leads from anywhere
        </div>
      </div>
      <button
        type="button"
        onClick={async () => {
          await deferred.prompt();
          setShow(false);
          setDeferred(null);
        }}
        className="btn-primary shrink-0 px-4 py-2.5 text-xs whitespace-nowrap"
      >
        Install
      </button>
      <button
        type="button"
        onClick={() => setShow(false)}
        className="shrink-0 p-2 text-lg leading-none"
        style={{ color: 'var(--muted)', minHeight: '44px', minWidth: '44px' }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
