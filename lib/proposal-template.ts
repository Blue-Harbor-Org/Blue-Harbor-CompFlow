export type ProposalData = {
  businessName: string;
  contactName: string;
  contactEmail: string;
  industry: string;
  websiteUrl: string;
  reportScore?: number;
  reportFindings?: string[];
  competitorName?: string;
  competitorStrengths?: string[];
  archetypeName?: string;
  mockupScreenshotUrl?: string;
  executiveSummary: string;
  scopeOfWork: string[];
  investmentTier: {
    name: string;
    price: number;
    monthlyHosting: number;
    includes: string[];
  };
  timeline: Array<{
    phase: string;
    duration: string;
    deliverable: string;
  }>;
  nextSteps: string[];
  proposalNumber: string;
  preparedBy: string;
  validUntil: string;
  companyLogoUrl?: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildProposalHtml(data: ProposalData): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
  const price = formatter.format(data.investmentTier.price);
  const monthly = formatter.format(data.investmentTier.monthlyHosting);
  const validDate = new Date(data.validUntil).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const safe = {
    businessName: escapeHtml(data.businessName),
    contactName: escapeHtml(data.contactName),
    industry: escapeHtml(data.industry),
    websiteUrl: escapeHtml(data.websiteUrl),
    preparedBy: escapeHtml(data.preparedBy),
    proposalNumber: escapeHtml(data.proposalNumber),
    archetypeName: data.archetypeName ? escapeHtml(data.archetypeName) : '',
    competitorName: data.competitorName ? escapeHtml(data.competitorName) : '',
    mockupScreenshotUrl: data.mockupScreenshotUrl ? escapeHtml(data.mockupScreenshotUrl) : '',
    executiveParas: data.executiveSummary.split('\n\n').map((p) => escapeHtml(p)),
    scopeOfWork: data.scopeOfWork.map((item) => escapeHtml(item)),
    investmentName: escapeHtml(data.investmentTier.name),
    includes: data.investmentTier.includes.map((item) => escapeHtml(item)),
    timeline: data.timeline.map((item) => ({
      phase: escapeHtml(item.phase),
      duration: escapeHtml(item.duration),
      deliverable: escapeHtml(item.deliverable),
    })),
    nextSteps: data.nextSteps.map((step) => escapeHtml(step)),
    findings: (data.reportFindings ?? []).map((f) => escapeHtml(f)),
  };

  const scoreBlock =
    data.reportScore !== undefined
      ? `
    <div class="score-card">
      <div class="score-circle">
        <div class="score-number">${data.reportScore}</div>
        <div class="score-label">/ 100</div>
      </div>
      <div class="score-detail">
        <h4>Current Website Score</h4>
        <p>Your website was analyzed against your top competitor${
          data.competitorName ? ` (${safe.competitorName})` : ''
        }
        across design quality, conversion optimization, mobile experience, content clarity, and SEO fundamentals.
        ${
          data.reportScore < 50
            ? 'There is significant opportunity for improvement.'
            : data.reportScore < 70
              ? 'Targeted improvements will have a meaningful impact.'
              : 'Strong foundation — we can push this further.'
        }</p>
      </div>
    </div>
    `
      : '';

  const findingsBlock =
    safe.findings.length > 0
      ? `
    <h4 style="font-size: 13px; font-weight: 600; color: var(--gray-900); margin-bottom: 12px;">Key findings from the audit:</h4>
    <div class="findings-grid">
      ${safe.findings
        .map(
          (f) => `
      <div class="finding-item">
        <p>${f}</p>
      </div>`
        )
        .join('')}
    </div>
    `
      : '';

  const designSection =
    data.mockupScreenshotUrl || data.archetypeName
      ? `
  <div class="section">
    <div class="section-label">03 — The Design</div>
    <h2 class="section-title">Your Approved Design Direction</h2>
    ${data.archetypeName ? `<div class="mockup-archetype-badge">${safe.archetypeName} Style</div>` : ''}
    ${
      data.mockupScreenshotUrl
        ? `
    <div class="mockup-preview">
      <div class="mockup-browser-bar">
        <div class="mockup-dot" style="background: #FF5F57;"></div>
        <div class="mockup-dot" style="background: #FFBD2E;"></div>
        <div class="mockup-dot" style="background: #28CA41;"></div>
        <div class="mockup-url">${safe.websiteUrl}</div>
      </div>
      <img src="${safe.mockupScreenshotUrl}" alt="Approved mockup" class="mockup-img" />
    </div>
    `
        : `<p style="color: var(--gray-400); font-size: 13px; font-style: italic;">Design mockup shared separately.</p>`
    }
  </div>
  `
      : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Website Proposal — ${safe.businessName}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy: #0f1f38;
    --gold: #C9A84C;
    --gold-light: #F5E6C0;
    --gray-100: #F8F9FA;
    --gray-200: #E9ECEF;
    --gray-400: #868E96;
    --gray-700: #495057;
    --gray-900: #212529;
    --white: #FFFFFF;
    --green: #1D9E75;
  }

  body {
    font-family: 'Inter', sans-serif;
    color: var(--gray-900);
    background: var(--white);
    line-height: 1.6;
    font-size: 14px;
  }

  .page-break { page-break-before: always; padding-top: 60px; }

  .cover {
    background: var(--navy);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 60px;
    color: var(--white);
  }
  .cover-header { display: flex; justify-content: space-between; align-items: flex-start; }
  .cover-logo { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 600; letter-spacing: 0.05em; color: var(--gold); }
  .cover-proposal-num { font-size: 11px; color: rgba(255,255,255,0.5); letter-spacing: 0.1em; text-transform: uppercase; text-align: right; }
  .cover-main { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 80px 0 40px; }
  .cover-tag { display: inline-block; background: var(--gold); color: var(--navy); font-size: 10px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; padding: 4px 12px; border-radius: 2px; margin-bottom: 24px; }
  .cover-title { font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 700; line-height: 1.15; margin-bottom: 16px; }
  .cover-subtitle { font-size: 18px; color: rgba(255,255,255,0.65); font-weight: 300; margin-bottom: 40px; }
  .cover-divider { width: 60px; height: 2px; background: var(--gold); margin-bottom: 32px; }
  .cover-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .cover-meta-item label { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.4); display: block; margin-bottom: 4px; }
  .cover-meta-item span { font-size: 15px; font-weight: 500; }
  .cover-footer { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px; display: flex; justify-content: space-between; align-items: center; }
  .cover-footer-text { font-size: 11px; color: rgba(255,255,255,0.4); }
  .cover-valid { font-size: 11px; color: rgba(255,255,255,0.4); }

  .content { padding: 60px; max-width: 800px; margin: 0 auto; }
  .section { margin-bottom: 48px; }

  .section-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 8px;
  }
  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 600;
    color: var(--navy);
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--gray-200);
  }

  .score-card {
    background: var(--navy);
    color: var(--white);
    border-radius: 12px;
    padding: 32px;
    display: flex;
    align-items: center;
    gap: 32px;
    margin-bottom: 28px;
  }
  .score-circle {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 3px solid var(--gold);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .score-number { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 700; color: var(--gold); line-height: 1; }
  .score-label { font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.5); margin-top: 4px; }
  .score-detail h4 { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
  .score-detail p { font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.5; }

  .findings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
  .finding-item {
    background: var(--gray-100);
    border-left: 3px solid var(--gold);
    padding: 14px 16px;
    border-radius: 0 8px 8px 0;
  }
  .finding-item p { font-size: 13px; color: var(--gray-700); }

  .mockup-preview {
    border: 1px solid var(--gray-200);
    border-radius: 12px;
    overflow: hidden;
    margin: 24px 0;
  }
  .mockup-browser-bar {
    background: var(--gray-100);
    padding: 10px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid var(--gray-200);
  }
  .mockup-dot { width: 10px; height: 10px; border-radius: 50%; }
  .mockup-url { background: var(--white); border: 1px solid var(--gray-200); border-radius: 4px; padding: 3px 12px; font-size: 11px; color: var(--gray-400); flex: 1; max-width: 300px; }
  .mockup-img { width: 100%; display: block; }
  .mockup-archetype-badge {
    display: inline-block;
    background: var(--navy);
    color: var(--gold);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 4px;
    margin-bottom: 16px;
  }

  .scope-list { list-style: none; }
  .scope-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--gray-200);
  }
  .scope-item:last-child { border-bottom: none; }
  .scope-check {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--green);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .scope-check svg { width: 10px; height: 10px; }
  .scope-text { font-size: 14px; color: var(--gray-700); line-height: 1.5; }

  .investment-card {
    border: 2px solid var(--navy);
    border-radius: 16px;
    overflow: hidden;
  }
  .investment-header {
    background: var(--navy);
    padding: 24px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .investment-tier { font-family: 'Playfair Display', serif; font-size: 22px; color: var(--white); }
  .investment-price-block { text-align: right; }
  .investment-price { font-family: 'Playfair Display', serif; font-size: 36px; color: var(--gold); font-weight: 700; }
  .investment-price-label { font-size: 11px; color: rgba(255,255,255,0.5); }
  .investment-monthly { font-size: 13px; color: rgba(255,255,255,0.6); margin-top: 4px; }
  .investment-includes { padding: 28px 32px; }
  .investment-includes h4 { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gray-400); margin-bottom: 16px; }
  .includes-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .includes-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--gray-700); }
  .includes-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); flex-shrink: 0; }

  .timeline { position: relative; padding-left: 24px; }
  .timeline::before { content: ''; position: absolute; left: 6px; top: 8px; bottom: 8px; width: 1px; background: var(--gray-200); }
  .timeline-item { position: relative; padding-bottom: 28px; }
  .timeline-item:last-child { padding-bottom: 0; }
  .timeline-dot { position: absolute; left: -24px; top: 4px; width: 13px; height: 13px; border-radius: 50%; background: var(--gold); border: 2px solid var(--white); box-shadow: 0 0 0 2px var(--gold); }
  .timeline-phase { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--gold); margin-bottom: 2px; }
  .timeline-duration { font-size: 12px; color: var(--gray-400); margin-bottom: 4px; }
  .timeline-deliverable { font-size: 14px; color: var(--gray-700); }

  .next-steps-list { counter-reset: steps; }
  .next-step {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    padding: 16px 0;
    border-bottom: 1px solid var(--gray-200);
  }
  .next-step:last-child { border-bottom: none; }
  .step-num {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--navy);
    color: var(--white);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
    flex-shrink: 0;
  }
  .step-text { font-size: 14px; color: var(--gray-700); line-height: 1.5; padding-top: 5px; }

  .signature-section {
    background: var(--gray-100);
    border-radius: 12px;
    padding: 32px;
    margin-top: 48px;
  }
  .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
  .sig-block label { font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--gray-400); display: block; margin-bottom: 8px; }
  .sig-line { border-bottom: 1px solid var(--gray-400); height: 40px; margin-bottom: 6px; }
  .sig-name { font-size: 13px; color: var(--gray-700); }

  .page-footer {
    margin-top: 60px;
    padding-top: 20px;
    border-top: 1px solid var(--gray-200);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .page-footer-brand { font-family: 'Playfair Display', serif; font-size: 14px; color: var(--navy); font-weight: 600; }
  .page-footer-meta { font-size: 11px; color: var(--gray-400); }

  @media print {
    .cover { min-height: 100vh; }
    .page-break { page-break-before: always; }
  }
</style>
</head>
<body>

<div class="cover">
  <div class="cover-header">
    <div class="cover-logo">Blue Harbor</div>
    <div class="cover-proposal-num">
      Proposal ${safe.proposalNumber}<br>
      Prepared by ${safe.preparedBy}
    </div>
  </div>

  <div class="cover-main">
    <div class="cover-tag">Website Redesign Proposal</div>
    <h1 class="cover-title">${safe.businessName}</h1>
    <p class="cover-subtitle">A complete digital presence for ${safe.industry}</p>
    <div class="cover-divider"></div>
    <div class="cover-meta">
      <div class="cover-meta-item">
        <label>Prepared for</label>
        <span>${safe.contactName}</span>
      </div>
      <div class="cover-meta-item">
        <label>Design Style</label>
        <span>${data.archetypeName ? safe.archetypeName : 'Custom'}</span>
      </div>
      <div class="cover-meta-item">
        <label>Industry</label>
        <span>${safe.industry}</span>
      </div>
      <div class="cover-meta-item">
        <label>Current Site</label>
        <span>${safe.websiteUrl}</span>
      </div>
    </div>
  </div>

  <div class="cover-footer">
    <div class="cover-footer-text">Blue Harbor · blueharbor.com</div>
    <div class="cover-valid">Valid until ${validDate}</div>
  </div>
</div>

<div class="page-break">
<div class="content">
  <div class="section">
    <div class="section-label">01 — The Audit</div>
    <h2 class="section-title">Where Your Website Stands Today</h2>
    ${scoreBlock}
    ${findingsBlock}
  </div>

  <div class="section">
    <div class="section-label">02 — The Vision</div>
    <h2 class="section-title">Executive Summary</h2>
    ${safe.executiveParas.map((p) => `<p style="margin-bottom: 16px; color: var(--gray-700); line-height: 1.7;">${p}</p>`).join('')}
  </div>

  ${designSection}
</div>
</div>

<div class="page-break">
<div class="content">
  <div class="section">
    <div class="section-label">04 — Scope of Work</div>
    <h2 class="section-title">What We Will Build</h2>
    <ul class="scope-list">
      ${safe.scopeOfWork
        .map(
          (item) => `
      <li class="scope-item">
        <div class="scope-check">
          <svg viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 5l2 2 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="scope-text">${item}</span>
      </li>`
        )
        .join('')}
    </ul>
  </div>

  <div class="section">
    <div class="section-label">05 — Investment</div>
    <h2 class="section-title">Pricing</h2>
    <div class="investment-card">
      <div class="investment-header">
        <div class="investment-tier">${safe.investmentName} Package</div>
        <div class="investment-price-block">
          <div class="investment-price">${price}</div>
          <div class="investment-price-label">one-time investment</div>
          <div class="investment-monthly">+ ${monthly}/mo hosting & maintenance</div>
        </div>
      </div>
      <div class="investment-includes">
        <h4>Everything Included</h4>
        <div class="includes-grid">
          ${safe.includes
            .map(
              (item) => `
          <div class="includes-item">
            <div class="includes-dot"></div>
            <span>${item}</span>
          </div>`
            )
            .join('')}
        </div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-label">06 — Timeline</div>
    <h2 class="section-title">How We Get There</h2>
    <div class="timeline">
      ${safe.timeline
        .map(
          (item) => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-phase">${item.phase}</div>
        <div class="timeline-duration">${item.duration}</div>
        <div class="timeline-deliverable">${item.deliverable}</div>
      </div>`
        )
        .join('')}
    </div>
  </div>

  <div class="section">
    <div class="section-label">07 — Next Steps</div>
    <h2 class="section-title">How to Move Forward</h2>
    <div class="next-steps-list">
      ${safe.nextSteps
        .map(
          (step, i) => `
      <div class="next-step">
        <div class="step-num">${i + 1}</div>
        <div class="step-text">${step}</div>
      </div>`
        )
        .join('')}
    </div>
  </div>

  <div class="signature-section">
    <p style="font-size: 13px; color: var(--gray-700); margin-bottom: 28px;">
      By signing below, you authorize Blue Harbor to proceed with the scope of work described in this proposal
      at the investment outlined above. A 50% deposit is due upon signing, with the balance due at launch.
    </p>
    <div class="signature-grid">
      <div class="sig-block">
        <label>Client Signature</label>
        <div class="sig-line"></div>
        <div class="sig-name">${safe.contactName} · ${safe.businessName}</div>
      </div>
      <div class="sig-block">
        <label>Date</label>
        <div class="sig-line"></div>
        <div class="sig-name">&nbsp;</div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <div class="page-footer-brand">Blue Harbor</div>
    <div class="page-footer-meta">Proposal ${safe.proposalNumber} · Valid until ${validDate} · Confidential</div>
  </div>
</div>
</div>

</body>
</html>`;
}
