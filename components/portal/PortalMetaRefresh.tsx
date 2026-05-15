'use client';

import { useEffect } from 'react';

/** Full document reload every 30s while work is in progress (disabled when site is live). */
export function PortalMetaRefresh({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return;
    const meta = document.createElement('meta');
    meta.httpEquiv = 'refresh';
    meta.content = '30';
    document.head.appendChild(meta);
    return () => {
      meta.remove();
    };
  }, [enabled]);

  return null;
}
