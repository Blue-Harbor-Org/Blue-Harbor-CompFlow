import { jsPDF } from 'jspdf';
import type { ProposalData } from '@/lib/proposal-template';
import { buildProposalHtml } from '@/lib/proposal-template';

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function buildSimplePdfBuffer(data: ProposalData): Buffer {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 48;
  let y = margin;
  const line = (text: string, size = 11) => {
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, 515);
    for (const row of lines) {
      if (y > 780) {
        doc.addPage();
        y = margin;
      }
      doc.text(row, margin, y);
      y += size + 4;
    }
  };

  doc.setFontSize(18);
  doc.text(`Proposal — ${data.businessName}`, margin, y);
  y += 28;
  line(`Prepared for: ${data.contactName}`, 10);
  line(`Proposal #: ${data.proposalNumber}`, 10);
  line(`Valid until: ${new Date(data.validUntil).toLocaleDateString()}`, 10);
  y += 12;
  line('Executive summary', 12);
  line(data.executiveSummary.replace(/\n\n/g, '\n'), 10);
  y += 8;
  line('Scope (summary)', 12);
  data.scopeOfWork.slice(0, 8).forEach((s) => line(`• ${s}`, 10));
  y += 8;
  line(
    `Investment: ${data.investmentTier.name} — $${data.investmentTier.price} + $${data.investmentTier.monthlyHosting}/mo`,
    11
  );

  const out = doc.output('arraybuffer');
  return Buffer.from(new Uint8Array(out));
}

export async function generateProposalPdf(data: ProposalData): Promise<Buffer> {
  const html = buildProposalHtml(data);

  try {
    const Chromium = (await import('@sparticuz/chromium')).default;
    const puppeteer = await import('puppeteer-core');

    const executablePath = await Chromium.executablePath();

    const browser = await puppeteer.default.launch({
      args: Chromium.args,
      defaultViewport: { width: 1280, height: 2000 },
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load', timeout: 45000 });
    await sleep(2000);

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    await browser.close();
    return Buffer.from(pdf);
  } catch (err) {
    console.warn('[proposal-pdf] Puppeteer failed, falling back to jsPDF:', err);
    try {
      return buildSimplePdfBuffer(data);
    } catch (fallbackErr) {
      console.warn('[proposal-pdf] jsPDF failed, falling back to HTML buffer:', fallbackErr);
      return Buffer.from(html, 'utf-8');
    }
  }
}

export function isHtmlProposalBuffer(buf: Buffer): boolean {
  const head = buf.toString('utf-8', 0, 32).trimStart().toLowerCase();
  return head.startsWith('<!doctype') || head.startsWith('<html');
}
