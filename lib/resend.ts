import { Resend } from 'resend';
import type { ReportData } from '@/types/report';
import type { Lead } from '@/types/lead';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = process.env.RESEND_FROM_EMAIL || 'reports@blueharbor.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blueharbor.com';

function emailBase(content: string) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background-color: #050c1a; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #e8edf5; }
  .wrapper { max-width: 580px; margin: 0 auto; padding: 40px 20px; }
  .logo { font-size: 22px; font-weight: 700; color: #d4a843; letter-spacing: 0.05em; margin-bottom: 32px; }
  .divider { height: 1px; background: linear-gradient(90deg, transparent, #d4a843, transparent); opacity: 0.4; margin: 28px 0; }
  .heading { font-size: 26px; font-weight: 700; color: #e8edf5; margin-bottom: 16px; line-height: 1.3; }
  .body-text { font-size: 15px; line-height: 1.7; color: #8fa8c8; margin-bottom: 20px; }
  .finding { padding: 14px 18px; background: rgba(10,30,60,0.6); border-left: 3px solid; border-radius: 6px; margin-bottom: 12px; }
  .finding-high { border-color: #e05050; }
  .finding-med { border-color: #d4a843; }
  .finding-title { font-size: 14px; font-weight: 600; color: #e8edf5; }
  .btn { display: inline-block; background: #d4a843; color: #050c1a; padding: 14px 28px; border-radius: 6px; font-weight: 700; font-size: 15px; text-decoration: none; margin: 24px 0; }
  .footer { font-size: 13px; color: #5a7294; margin-top: 40px; }
  .footer-tagline { color: #d4a843; font-weight: 600; }
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
    <p class="body-text">We analyzed <strong style="color:#e8edf5">${businessName}</strong> against <strong style="color:#e8edf5">${competitorName}</strong> and found 3 things you need to know:</p>

    ${findings.map((f, i) => `
      <div class="finding ${i === 0 ? 'finding-high' : 'finding-med'}">
        <div class="finding-title">${i === 0 ? '🔴' : '🟡'} ${f.title}</div>
      </div>
    `).join('')}

    <p class="body-text" style="margin-top:20px">Your full report has a 12-category comparison, your top advantages, and a 90-day action plan — but it's locked until we talk.</p>

    <a href="${teaserUrl}" class="btn">See Your Findings + Book a Strategy Call →</a>

    <p class="body-text">— Blue Harbor</p>
  `;

  return getResend().emails.send({
    from: FROM,
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
    <ul style="margin:0 0 20px 0;padding-left:20px;color:#8fa8c8;line-height:2">
      <li>How you compare to ${competitorName} across 12 categories</li>
      <li>Your top competitive advantages right now</li>
      <li>The market opportunities ${competitorName} is missing</li>
      <li>A 90-day roadmap you can start executing today</li>
    </ul>

    <a href="${fullUrl}" class="btn">View Your Full Report →</a>

    <p class="body-text">Talk soon,<br/><strong style="color:#e8edf5">Blue Harbor</strong></p>
  `;

  return getResend().emails.send({
    from: FROM,
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
      analysis on <strong style="color:#e8edf5">${lead.business_name}</strong> vs <strong style="color:#e8edf5">${competitorName}</strong>.</p>
    <p class="body-text">This goes beyond the initial report — it includes:</p>
    <ul style="margin:0 0 20px 0;padding-left:20px;color:#8fa8c8;line-height:2">
      <li>Real traffic + keyword framing for both businesses</li>
      <li>Google review / reputation comparison</li>
      <li>Full category competitive breakdown</li>
      <li>A refined strategy section tailored to your vertical</li>
    </ul>
    <a href="${deepDiveUrl}" class="btn">View Your Deep Dive Report →</a>
    <p class="body-text">Happy to walk through it together — just reply here.</p>
    <p class="body-text">— Blue Harbor</p>
  `;

  return getResend().emails.send({
    from: FROM,
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
        <tr><td style="color:#5a7294;padding:6px 0;font-size:14px">Business</td><td style="color:#e8edf5;font-weight:600;font-size:14px">${businessName}</td></tr>
        <tr><td style="color:#5a7294;padding:6px 0;font-size:14px">Contact</td><td style="color:#e8edf5;font-size:14px">${contactName}</td></tr>
        <tr><td style="color:#5a7294;padding:6px 0;font-size:14px">Email</td><td style="color:#e8edf5;font-size:14px">${email}</td></tr>
        <tr><td style="color:#5a7294;padding:6px 0;font-size:14px">Phone</td><td style="color:#e8edf5;font-size:14px">${phone || 'Not provided'}</td></tr>
        <tr><td style="color:#5a7294;padding:6px 0;font-size:14px">Competitor</td><td style="color:#e8edf5;font-size:14px">${competitorName || 'Unknown'}</td></tr>
      </table>
    </div>

    <a href="${dashboardUrl}" class="btn">View in Dashboard →</a>
  `;

  return getResend().emails.send({
    from: FROM,
    to: adminEmail,
    subject: `🔥 ${businessName} just booked a call`,
    html: emailBase(content),
  });
}
