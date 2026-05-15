'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { CmsEditor } from '@/components/admin/buildout/CmsEditor';
import { DomainInstructions } from '@/components/admin/buildout/DomainInstructions';

type BuildoutStatus = 'queued' | 'generating' | 'generated' | 'deployed' | 'live' | 'failed';
type Tab = 'pages' | 'content' | 'deploy' | 'domain';

export type BuildoutRow = {
  id: string;
  client_id: string;
  mockup_id: string | null;
  status: BuildoutStatus;
  archetype_id: string | null;
  cms_data: Record<string, string> | null;
  preview_url: string | null;
  custom_domain: string | null;
  domain_status: string | null;
  error_message: string | null;
};

export type BuildoutPageRow = {
  id: string;
  buildout_id: string;
  slug: string;
  title: string;
  html_content: string | null;
  status: 'pending' | 'generating' | 'done' | 'failed';
};

interface Props {
  clientId: string;
  initialBuildout: BuildoutRow | null;
  initialPages: BuildoutPageRow[];
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'pages', label: 'Pages' },
  { id: 'content', label: 'Content' },
  { id: 'deploy', label: 'Deploy' },
  { id: 'domain', label: 'Domain' },
];

export function BuildoutManager({ clientId, initialBuildout, initialPages }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('pages');
  const [buildout, setBuildout] = useState(initialBuildout);
  const [pages, setPages] = useState(initialPages);
  const [selectedSlug, setSelectedSlug] = useState(initialPages[0]?.slug ?? 'index');
  const [deploying, setDeploying] = useState(false);
  const [domain, setDomain] = useState(initialBuildout?.custom_domain ?? '');
  const buildoutId = buildout?.id;

  const refresh = useCallback(async () => {
    if (!buildoutId) return;
    const supabase = createBrowserClient();
    const [{ data: nextBuildout }, { data: nextPages }] = await Promise.all([
      supabase.from('bh_site_buildouts').select('*').eq('id', buildoutId).maybeSingle(),
      supabase.from('bh_buildout_pages').select('*').eq('buildout_id', buildoutId).order('slug'),
    ]);
    if (nextBuildout) setBuildout(nextBuildout as BuildoutRow);
    if (nextPages) setPages(nextPages as BuildoutPageRow[]);
  }, [buildoutId]);

  useEffect(() => {
    if (!buildout || buildout.status !== 'generating') return;
    const timer = setInterval(() => {
      void refresh();
    }, 5000);
    return () => clearInterval(timer);
  }, [buildout, refresh]);

  const selectedPage = useMemo(
    () => pages.find((page) => page.slug === selectedSlug) ?? pages[0] ?? null,
    [pages, selectedSlug]
  );

  async function deploy() {
    if (!buildout?.id) return;
    setDeploying(true);
    try {
      const res = await fetch('/api/dashboard/buildout/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buildoutId: buildout.id }),
      });
      if (res.ok) await refresh();
    } finally {
      setDeploying(false);
    }
  }

  if (!buildout) {
    return (
      <div className="rounded-xl p-8 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="mb-2 text-2xl" aria-hidden>
          🏗️
        </div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--light)' }}>
          Site not built yet
        </h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
          Start a full site buildout from the Website tab after the mockup is approved.
        </p>
        <a
          href={`/dashboard/clients/${clientId}?tab=website`}
          className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-lg px-5 text-sm font-semibold"
          style={{ background: 'var(--gold)', color: 'var(--navy)' }}
        >
          Start building →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold" style={{ color: 'var(--light)' }}>
              Full Site Buildout
            </h1>
            <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>
              Status: <span className="font-semibold">{buildout.status}</span>
              {buildout.error_message ? ` - ${buildout.error_message}` : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="rounded-lg px-3 py-2 text-xs font-semibold"
                style={{
                  background: activeTab === tab.id ? 'var(--gold-dim)' : 'rgba(9,20,40,0.45)',
                  color: activeTab === tab.id ? 'var(--gold)' : 'var(--muted)',
                  border: activeTab === tab.id ? '1px solid var(--border-gold)' : '1px solid var(--border)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'pages' && (
        <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
          <div className="space-y-2">
            {pages.map((page) => (
              <button
                key={page.id}
                type="button"
                onClick={() => setSelectedSlug(page.slug)}
                className="w-full rounded-lg border p-3 text-left"
                style={{
                  background: selectedPage?.id === page.id ? 'var(--gold-dim)' : 'var(--card)',
                  borderColor: selectedPage?.id === page.id ? 'var(--border-gold)' : 'var(--border)',
                }}
              >
                <div className="text-sm font-semibold" style={{ color: 'var(--light)' }}>
                  {page.title}
                </div>
                <div className="mt-1 text-xs" style={{ color: page.status === 'done' ? 'var(--green)' : 'var(--muted)' }}>
                  {page.status}
                </div>
              </button>
            ))}
          </div>
          <div className="overflow-hidden rounded-xl" style={{ border: '1px solid var(--border)', minHeight: 600 }}>
            {selectedPage?.html_content ? (
              <iframe
                srcDoc={selectedPage.html_content}
                title={selectedPage.title}
                className="h-[600px] w-full border-0"
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              <div className="p-8 text-center text-sm" style={{ color: 'var(--muted)' }}>
                Page preview is not ready yet.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <CmsEditor
            buildoutId={buildout.id}
            initialData={buildout.cms_data ?? {}}
            onSaved={(data) => setBuildout((prev) => prev ? { ...prev, cms_data: data } : prev)}
          />
        </div>
      )}

      {activeTab === 'deploy' && (
        <div className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--light)' }}>
            Vercel Deploy
          </h3>
          <p className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>
            Deploy the generated static pages to a Vercel preview URL.
          </p>
          {buildout.preview_url && (
            <a href={buildout.preview_url} target="_blank" rel="noopener noreferrer" className="mt-3 block text-sm underline" style={{ color: 'var(--gold)' }}>
              {buildout.preview_url}
            </a>
          )}
          <button
            type="button"
            onClick={() => void deploy()}
            disabled={deploying || buildout.status === 'generating'}
            className="mt-4 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
            style={{ background: 'var(--gold)', color: 'var(--navy)' }}
          >
            {deploying ? 'Deploying...' : buildout.preview_url ? 'Redeploy Site' : 'Deploy to Vercel'}
          </button>
        </div>
      )}

      {activeTab === 'domain' && (
        <div className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <label className="mb-4 block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Custom Domain
            </span>
            <input
              className="input"
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
              placeholder="example.com"
            />
          </label>
          <DomainInstructions
            domain={domain || 'yourdomain.com'}
            previewUrl={buildout.preview_url ?? ''}
            domainStatus={buildout.domain_status ?? 'pending'}
          />
        </div>
      )}
    </div>
  );
}
