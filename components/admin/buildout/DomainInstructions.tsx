'use client';

import { useState } from 'react';

type Registrar = 'godaddy' | 'namecheap' | 'squarespace' | 'cloudflare' | 'google' | 'other';

const REGISTRAR_STEPS: Record<Registrar, string[]> = {
  godaddy: [
    'Log in to GoDaddy and go to My Products > Domains',
    'Click the domain, then Manage DNS',
    'Under Records, click Add',
    'Add the A record: Type=A, Name=@, Value=76.76.21.21, TTL=1 Hour',
    'Add the CNAME record: Type=CNAME, Name=www, Value=cname.vercel-dns.com, TTL=1 Hour',
    'Click Save. DNS changes take 1-48 hours to propagate.',
  ],
  namecheap: [
    'Log in to Namecheap, go to Domain List and click Manage next to your domain',
    'Click the Advanced DNS tab',
    'Remove any existing A records for @ and www',
    'Add A Record: Host=@, Value=76.76.21.21, TTL=Automatic',
    'Add CNAME Record: Host=www, Value=cname.vercel-dns.com, TTL=Automatic',
    'Click Save All Changes.',
  ],
  squarespace: [
    'Log in to Squarespace, go to Settings > Domains',
    'Click your domain, then DNS Settings',
    'Add A Record: Host=@, Data=76.76.21.21',
    'Add CNAME: Host=www, Data=cname.vercel-dns.com',
    'Save. Allow up to 72 hours for propagation.',
  ],
  cloudflare: [
    'Log in to Cloudflare, select your domain',
    'Go to DNS > Records',
    'Add A record: Name=@, IPv4=76.76.21.21, Proxy=DNS only (grey cloud)',
    'Add CNAME: Name=www, Target=cname.vercel-dns.com, Proxy=DNS only',
    'Save. Cloudflare propagates within minutes.',
  ],
  google: [
    'Go to Google Domains (now Squarespace Domains) and select your domain',
    'Click DNS, then Manage custom records',
    'Add A record: Host name=@, Type=A, Data=76.76.21.21',
    'Add CNAME: Host name=www, Type=CNAME, Data=cname.vercel-dns.com',
    'Save. Changes propagate within 1-24 hours.',
  ],
  other: [
    "Log in to your domain registrar's control panel",
    'Find the DNS or Name Server management section',
    'Add an A record: Host/Name = @ (or blank), Points to = 76.76.21.21',
    'Add a CNAME record: Host/Name = www, Points to = cname.vercel-dns.com',
    'Save and wait 1-48 hours for propagation.',
  ],
};

interface Props {
  domain: string;
  previewUrl: string;
  domainStatus: string;
}

export function DomainInstructions({ domain, previewUrl, domainStatus }: Props) {
  const [registrar, setRegistrar] = useState<Registrar>('godaddy');

  return (
    <div className="space-y-5">
      <div
        className="flex items-start gap-3 rounded-xl border p-4"
        style={{
          background: domainStatus === 'live' ? 'rgba(46,204,138,0.1)' : 'rgba(212,168,67,0.1)',
          borderColor: domainStatus === 'live' ? 'rgba(46,204,138,0.3)' : 'rgba(212,168,67,0.3)',
        }}
      >
        <span className="text-lg">{domainStatus === 'live' ? '✓' : '...'}</span>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--light)' }}>
            {domainStatus === 'live' ? `${domain} is live!` : 'Waiting for DNS propagation'}
          </p>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>
            {domainStatus === 'live'
              ? `Your site is accessible at https://${domain}`
              : `Preview URL: ${previewUrl || 'Deploy first'} - add DNS records below to connect your domain`}
          </p>
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold" style={{ color: 'var(--light)' }}>
          DNS Records to Add
        </h4>
        <div className="overflow-hidden rounded-xl border text-sm" style={{ borderColor: 'var(--border)' }}>
          <div className="grid grid-cols-4 px-4 py-2 text-xs font-semibold" style={{ background: 'rgba(9,20,40,0.6)', color: 'var(--muted)' }}>
            <span>Type</span><span>Name</span><span>Value</span><span>TTL</span>
          </div>
          <div className="grid grid-cols-4 border-t px-4 py-3 font-mono text-xs" style={{ borderColor: 'var(--border)', color: 'var(--silver)' }}>
            <span>A</span><span>@</span><span>76.76.21.21</span><span>1 hr</span>
          </div>
          <div className="grid grid-cols-4 border-t px-4 py-3 font-mono text-xs" style={{ borderColor: 'var(--border)', color: 'var(--silver)' }}>
            <span>CNAME</span><span>www</span><span>cname.vercel-dns.com</span><span>1 hr</span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold" style={{ color: 'var(--light)' }}>
          Step-by-step instructions for your registrar
        </h4>
        <div className="mb-4 flex flex-wrap gap-2">
          {(['godaddy', 'namecheap', 'squarespace', 'cloudflare', 'google', 'other'] as Registrar[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRegistrar(item)}
              className="rounded-full border px-3 py-1.5 text-xs capitalize transition-colors"
              style={{
                background: registrar === item ? 'var(--gold-dim)' : 'transparent',
                borderColor: registrar === item ? 'var(--border-gold)' : 'var(--border)',
                color: registrar === item ? 'var(--gold)' : 'var(--muted)',
              }}
            >
              {item === 'godaddy' ? 'GoDaddy' : item === 'namecheap' ? 'Namecheap' : item === 'google' ? 'Google Domains' : item}
            </button>
          ))}
        </div>
        <ol className="space-y-2">
          {REGISTRAR_STEPS[registrar].map((step, index) => (
            <li key={step} className="flex gap-3 text-sm">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{ background: 'var(--navy3)', color: 'var(--gold)' }}
              >
                {index + 1}
              </span>
              <span style={{ color: 'var(--muted)' }}>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
