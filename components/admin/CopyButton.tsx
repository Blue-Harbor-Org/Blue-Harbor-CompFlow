'use client';

import { useState } from 'react';

interface Props {
  text: string;
}

export default function CopyButton({ text }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs flex-shrink-0 px-2 py-1 rounded transition-all"
      style={{
        background: copied ? 'rgba(46,204,138,0.15)' : 'var(--gold-dim)',
        color: copied ? 'var(--green)' : 'var(--gold)',
        border: `1px solid ${copied ? 'rgba(46,204,138,0.3)' : 'var(--border-gold)'}`,
      }}
    >
      {copied ? 'Copied ✓' : 'Copy'}
    </button>
  );
}
