import { Resend } from 'resend';
import type { ReportData } from '@/types/report';
import type { Lead } from '@/types/lead';
import { getFindingTitle } from '@/lib/reportUtils';
import { getPublicSiteUrl } from '@/lib/siteUrl';

export type EmailSendResult = { id: string | null; error: string | null };

function isPlaceholderResendKey(key: string): boolean {
  const k = key.trim();
  if (!k) return true;
  if (k.startsWith('re_REPLACE')) return true;
  if (k === 're_your_real_key_here') return true;
  if (k.includes('your_resend') || k.includes('your_real_key')) return true;
  return false;
}

export function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim() ?? '';
  if (isPlaceholderResendKey(key)) {
    console.warn('[Resend] RESEND_API_KEY not configured — emails will not send');
    return null;
  }
  return new Resend(key);
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blueharbor.com';

function fromHeader(): string {
  const email = process.env.RESEND_FROM_EMAIL || 'reports@blueharbor.com';
  const name = process.env.RESEND_FROM_NAME || 'Blue Harbor';
  return `${name} <${email}>`;
}

function emailBase(content: string) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background-color: #0b1425; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #edf1f7; }
  .wrapper { max-width: 580px; margin: 0 auto; padding: 40px 20px; }
  .logo { font-size: 22px; font-weight: 700; color: #e5b84a; letter-spacing: 0.05em; margin-bottom: 32px; }
  .divider { height: 1px; background: linear-gradient(90deg, transparent, #e5b84a, transparent); opacity: 0.4; margin: 28px 0; }
  .heading { font-size: 26px; font-weight: 700; color: #edf1f7; margin-bottom: 16px; line-height: 1.3; }
  .body-text { font-size: 15px; line-height: 1.7; color: #9cb3d4; margin-bottom: 20px; }
  .finding { padding: 14px 18px; background: rgba(16,35,62,0.65); border-left: 3px solid; border-radius: 6px; margin-bottom: 12px; }
  .finding-high { border-color: #f06060; }
  .finding-med { border-color: #e5b84a; }
  .finding-title { font-size: 14px; font-weight: 600; color: #edf1f7; }
  .btn { display: inline-block; background: #e5b84a; color: #0b1425; padding: 14px 28px; border-radius: 6px; font-weight: 700; font-size: 15px; text-decoration: none; margin: 24px 0; }
  .footer { font-size: 13px; color: #7490b3; margin-top: 40px; }
  .footer-tagline { color: #e5b84a; font-weight: 600; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="logo">Blue Harbor</div>
  <div class="divider"></div>
  ${content}
  <div class="divider"></div>
  <div class="footer">
    <div class="footer-tagline">Clarity. Strategy. Growth.</div>
    <div style="margin-top:8px">© 2026 Blue Harbor · blueharbor.com</div>
  </div>
</div>
</body>
</html>`;
}

async function sendEmail(
  payload: Parameters<Resend['emails']['send']>[0]
): Promise<EmailSendResult> {
  const resend = getResendClient();
  if (!resend) return { id: null, error: 'not_configured' };
  try {
    const result = await resend.emails.send(payload);
    if (result.error) {
      console.error('[Resend] API error:', result.error);
      return { id: null, error: String(result.error.message ?? result.error) };
    }
    return { id: result.data?.id ?? null, error: null };
  } catch (err) {
    console.error('[Resend] send failed:', err);
    return { id: null, error: String(err) };
  }
}

export async function sendReportReadyEmail(
  to: string,
  firstName: string,
  businessName: string,
  competitorName: string,
  reportToken: string,
  reportData: ReportData
) {
  const findings = reportData.topFindings.slice(0, 3);
  const teaserUrl = `${APP_URL}/report/${reportToken}`;

  const content = `
    <div class="heading">Your report is ready, ${firstName}.</div>
    <p class="body-text">We analyzed <strong style="color:#edf1f7">${businessName}</strong> against <strong style="color:#edf1f7">${competitorName}</strong> and found 3 things you need to know:</p>

    ${findings.map((f, i) => `
      <div class="finding ${i === 0 ? 'finding-high' : 'finding-med'}">
        <div class="finding-title">${i === 0 ? '🔴' : '🟡'} ${getFindingTitle(f)}</div>
      </div>
    `).join('')}

    <p class="body-text" style="margin-top:20px">Your full report has a 12-category comparison, your top advantages, and a 90-day action plan — but it's locked until we talk.</p>

    <a href="${teaserUrl}" class="btn">See Your Findings + Book a Strategy Call →</a>

    <p class="body-text">— Blue Harbor</p>
  `;

  return sendEmail({
    from: fromHeader(),
    to,
    subject: `${businessName} — Your competitive analysis is ready`,
    html: emailBase(content),
  });
}

export async function sendUnlockEmail(
  to: string,
  firstName: string,
  businessName: string,
  competitorName: string,
  reportToken: string
) {
  const fullUrl = `${APP_URL}/report/${reportToken}/full`;

  const content = `
    <div class="heading">${firstName} —</div>
    <div class="heading" style="font-size:22px;margin-top:-8px">Your full competitive strategy report is live.</div>

    <p class="body-text">Inside you'll find:</p>
    <ul style="margin:0 0 20px 0;padding-left:20px;color:#9cb3d4;line-height:2">
      <li>How you compare to ${competitorName} across 12 categories</li>
      <li>Your top competitive advantages right now</li>
      <li>The market opportunities ${competitorName} is missing</li>
      <li>A 90-day roadmap you can start executing today</li>
    </ul>

    <a href="${fullUrl}" class="btn">View Your Full Report →</a>

    <p class="body-text">Talk soon,<br/><strong style="color:#edf1f7">Blue Harbor</strong></p>
  `;

  return sendEmail({
    from: fromHeader(),
    to,
    subject: `Your full Blue Harbor report is unlocked — ${businessName}`,
    html: emailBase(content),
  });
}

export async function sendDeepDiveUnlocked(lead: Lead, deepDiveUrl: string) {
  const competitorName =
    lead.competitor_name || lead.competitor_url || 'your competitor';
  const content = `
    <div class="heading">Your full deep-dive competitive report is ready</div>
    <p class="body-text">${lead.contact_name.split(' ')[0]} —</p>
    <p class="body-text">Great talking with you. Based on our conversation, we ran a full deep-dive competitive
      analysis on <strong style="color:#edf1f7">${lead.business_name}</strong> vs <strong style="color:#edf1f7">${competitorName}</strong>.</p>
    <p class="body-text">This goes beyond the initial report — it includes:</p>
    <ul style="margin:0 0 20px 0;padding-left:20px;color:#9cb3d4;line-height:2">
      <li>Real traffic + keyword framing for both businesses</li>
      <li>Google review / reputation comparison</li>
      <li>Full category competitive breakdown</li>
      <li>A refined strategy section tailored to your vertical</li>
    </ul>
    <a href="${deepDiveUrl}" class="btn">View Your Deep Dive Report →</a>
    <p class="body-text">Happy to walk through it together — just reply here.</p>
    <p class="body-text">— Blue Harbor</p>
  `;

  return sendEmail({
    from: fromHeader(),
    to: lead.email,
    subject: `Your full deep-dive competitive report is ready — ${lead.business_name}`,
    html: emailBase(content),
  });
}

export async function sendAdminNotificationEmail(
  businessName: string,
  contactName: string,
  email: string,
  phone: string | null,
  competitorName: string | null,
  leadId: string
) {
  const adminEmail = process.env.ADMIN_EMAIL!;
  const dashboardUrl = `${APP_URL}/dashboard/leads/${leadId}`;

  const content = `
    <div class="heading">🔥 ${businessName} just booked a call</div>
    <p class="body-text">New call booked.</p>

    <div style="background:rgba(10,30,60,0.6);border:1px solid rgba(100,140,200,0.15);border-radius:10px;padding:20px;margin:20px 0">
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="color:#7490b3;padding:6px 0;font-size:14px">Business</td><td style="color:#edf1f7;font-weight:600;font-size:14px">${businessName}</td></tr>
        <tr><td style="color:#7490b3;padding:6px 0;font-size:14px">Contact</td><td style="color:#edf1f7;font-size:14px">${contactName}</td></tr>
        <tr><td style="color:#7490b3;padding:6px 0;font-size:14px">Email</td><td style="color:#edf1f7;font-size:14px">${email}</td></tr>
        <tr><td style="color:#7490b3;padding:6px 0;font-size:14px">Phone</td><td style="color:#edf1f7;font-size:14px">${phone || 'Not provided'}</td></tr>
        <tr><td style="color:#7490b3;padding:6px 0;font-size:14px">Competitor</td><td style="color:#edf1f7;font-size:14px">${competitorName || 'Unknown'}</td></tr>
      </table>
    </div>

    <a href="${dashboardUrl}" class="btn">View in Dashboard →</a>
  `;

  return sendEmail({
    from: fromHeader(),
    to: adminEmail,
    subject: `🔥 ${businessName} just booked a call`,
    html: emailBase(content),
  });
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function sendProposalEmail({
  toEmail,
  toName,
  businessName,
  proposalNumber,
  pdfUrl,
  preparedBy,
  validUntil,
  investmentAmount,
}: {
  toEmail: string;
  toName: string;
  businessName: string;
  proposalNumber: string;
  pdfUrl: string;
  preparedBy: string;
  validUntil: string;
  investmentAmount: number;
}): Promise<EmailSendResult> {
  const resend = getResendClient();
  if (!resend) return { id: null, error: 'not_configured' };

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'proposals@blueharbor.com';
  const fromName = process.env.RESEND_FROM_NAME ?? 'Blue Harbor';
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
  const validDate = new Date(validUntil).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const safe = {
    toName: escHtml(toName),
    businessName: escHtml(businessName),
    proposalNumber: escHtml(proposalNumber),
    preparedBy: escHtml(preparedBy),
  };

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8F9FA;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">

    <div style="background:#0f1f38;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
      <div style="font-family:Georgia,serif;font-size:22px;color:#C9A84C;letter-spacing:0.05em;font-weight:600;">Blue Harbor</div>
    </div>

    <div style="background:#ffffff;padding:40px;border:1px solid #E9ECEF;border-top:none;">
      <p style="font-size:16px;color:#212529;margin:0 0 8px;">Hi ${safe.toName},</p>
      <p style="font-size:15px;color:#495057;line-height:1.6;margin:0 0 28px;">
        Your website redesign proposal for <strong>${safe.businessName}</strong> is ready.
        We've put together a complete plan based on your competitive audit and approved design direction.
      </p>

      <div style="background:#F8F9FA;border:1px solid #E9ECEF;border-radius:8px;padding:24px;margin-bottom:28px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <span style="font-size:12px;color:#868E96;text-transform:uppercase;letter-spacing:0.08em;">Proposal</span>
          <span style="font-size:12px;color:#868E96;">${safe.proposalNumber}</span>
        </div>
        <div style="font-size:24px;font-family:Georgia,serif;color:#0f1f38;font-weight:700;margin-bottom:4px;">${formatter.format(investmentAmount)}</div>
        <div style="font-size:13px;color:#868E96;">Investment · Valid until ${validDate}</div>
      </div>

      <div style="text-align:center;margin-bottom:28px;">
        <a href="${pdfUrl}" style="display:inline-block;background:#0f1f38;color:#C9A84C;font-size:14px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;letter-spacing:0.05em;">
          View Your Proposal →
        </a>
      </div>

      <p style="font-size:13px;color:#868E96;line-height:1.6;margin:0 0 24px;">
        Review the proposal at your convenience. When you're ready to move forward,
        simply reply to this email or click the link above to get started.
      </p>

      <p style="font-size:14px;color:#212529;margin:0;">
        ${safe.preparedBy}<br>
        <span style="color:#868E96;font-size:13px;">Blue Harbor</span>
      </p>
    </div>

    <div style="padding:20px 40px;text-align:center;">
      <p style="font-size:11px;color:#ADB5BD;margin:0;">
        This proposal is confidential and intended only for ${safe.toName} at ${safe.businessName}.
        It expires on ${validDate}.
      </p>
    </div>
  </div>
</body>
</html>`;

  try {
    const result = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: toEmail,
      subject: `Your Website Proposal — ${businessName} (${proposalNumber})`,
      html,
    });
    if (result.error) {
      console.error('[Resend] sendProposalEmail API error:', result.error);
      return { id: null, error: String(result.error.message ?? result.error) };
    }
    return { id: result.data?.id ?? null, error: null };
  } catch (err) {
    console.error('[Resend] sendProposalEmail failed:', err);
    return { id: null, error: String(err) };
  }
}

export async function sendProposalAcceptedNotification({
  toEmail,
  toName,
  businessName,
  contactName,
  proposalNumber,
  investmentAmount,
  portalUrl,
}: {
  toEmail: string;
  toName: string;
  businessName: string;
  contactName: string;
  proposalNumber: string;
  investmentAmount: number;
  portalUrl?: string | null;
}): Promise<EmailSendResult> {
  const resend = getResendClient();
  if (!resend) return { id: null, error: 'not_configured' };

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  const safe = {
    toName: escHtml(toName),
    businessName: escHtml(businessName),
    contactName: escHtml(contactName),
    proposalNumber: escHtml(proposalNumber),
  };

  const dash = `${getPublicSiteUrl()}/dashboard`;
  const portalHref = portalUrl && portalUrl.length > 0 ? encodeURI(portalUrl) : '';
  const portalBlock =
    portalHref.length > 0
      ? `<p style="font-size:14px;color:#495057;line-height:1.6;">
    Client status portal: <a href="${portalHref}" style="color:#0f1f38;font-weight:600;">Open portal →</a>
  </p>`
      : '';

  const html = `
<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px 20px;">
  <div style="background:#0f1f38;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
    <div style="font-size:18px;color:#C9A84C;font-weight:600;">Proposal accepted</div>
  </div>
  <p style="font-size:15px;color:#212529;">Hi ${safe.toName},</p>
  <p style="font-size:15px;color:#495057;line-height:1.6;">
    <strong>${safe.contactName}</strong> at <strong>${safe.businessName}</strong> has accepted proposal
    <strong>${safe.proposalNumber}</strong> for <strong>${formatter.format(investmentAmount)}</strong>.
  </p>
  ${portalBlock}
  <p style="font-size:14px;color:#495057;">
    Log in to the dashboard to send the deposit invoice and kick off the project.
  </p>
  <a href="${dash}"
     style="display:inline-block;margin-top:16px;background:#0f1f38;color:#C9A84C;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">
    View in Dashboard →
  </a>
</div>`;

  try {
    const result = await resend.emails.send({
      from: fromHeader(),
      to: toEmail,
      subject: `Proposal accepted — ${businessName} (${proposalNumber})`,
      html,
    });
    if (result.error) {
      return { id: null, error: String(result.error.message ?? result.error) };
    }
    return { id: result.data?.id ?? null, error: null };
  } catch (err) {
    return { id: null, error: String(err) };
  }
}

export async function sendProjectStartedEmail({
  toEmail,
  toName,
  businessName,
  portalUrl,
  preparedBy,
}: {
  toEmail: string;
  toName: string;
  businessName: string;
  portalUrl: string;
  preparedBy: string;
}): Promise<EmailSendResult> {
  const resend = getResendClient();
  if (!resend) return { id: null, error: 'not_configured' };

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'proposals@blueharbor.com';
  const fromName = process.env.RESEND_FROM_NAME ?? 'Blue Harbor';

  const safe = {
    toName: escHtml(toName),
    businessName: escHtml(businessName),
    preparedBy: escHtml(preparedBy),
  };

  const html = `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;">
  <div style="background:#0f1f38;border-radius:12px;padding:28px 32px;margin-bottom:32px;text-align:center;">
    <div style="font-family:Georgia,serif;font-size:20px;color:#C9A84C;font-weight:600;">Blue Harbor</div>
  </div>

  <h2 style="font-family:Georgia,serif;font-size:24px;color:#0f1f38;margin:0 0 12px;">
    Your project has officially started, ${safe.toName}.
  </h2>
  <p style="font-size:15px;color:#495057;line-height:1.6;margin:0 0 24px;">
    We're building your new website for <strong>${safe.businessName}</strong> right now.
    You can track our progress in real time using the link below.
  </p>

  <div style="background:#F8F9FA;border:1px solid #E9ECEF;border-radius:8px;padding:24px;margin-bottom:28px;text-align:center;">
    <div style="font-size:12px;color:#868E96;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Your project dashboard</div>
    <a href="${portalUrl}"
       style="display:inline-block;background:#0f1f38;color:#C9A84C;font-size:14px;font-weight:600;padding:14px 28px;border-radius:8px;text-decoration:none;">
      Track your project →
    </a>
    <div style="font-size:11px;color:#ADB5BD;margin-top:12px;">Bookmark this link — it's your project status page</div>
  </div>

  <p style="font-size:14px;color:#495057;line-height:1.6;">
    ${safe.preparedBy} will be in touch within 1 business day.
    In the meantime, if you have any questions just reply to this email.
  </p>
</div>`;

  try {
    const result = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: toEmail,
      subject: `Your new website is being built — ${businessName}`,
      html,
    });
    if (result.error) {
      return { id: null, error: String(result.error.message ?? result.error) };
    }
    return { id: result.data?.id ?? null, error: null };
  } catch (err) {
    return { id: null, error: String(err) };
  }
}
