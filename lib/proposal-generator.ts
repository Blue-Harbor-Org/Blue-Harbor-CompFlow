import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type ProposalInputs = {
  businessName: string;
  industry: string;
  contactName: string;
  websiteUrl: string;
  reportScore?: number;
  reportFindings?: string[];
  competitorName?: string;
  competitorStrengths?: string[];
  archetypeName?: string;
  preparedBy: string;
};

export type GeneratedProposalContent = {
  executiveSummary: string;
  scopeOfWork: string[];
  investmentTier: {
    name: string;
    price: number;
    monthlyHosting: number;
    includes: string[];
  };
  timeline: Array<{ phase: string; duration: string; deliverable: string }>;
  nextSteps: string[];
};

export async function generateProposalContent(
  inputs: ProposalInputs
): Promise<GeneratedProposalContent> {
  const prompt = `You are a senior account executive writing a professional website redesign proposal for a client.

CLIENT: ${inputs.businessName}
INDUSTRY: ${inputs.industry}
CONTACT: ${inputs.contactName}
CURRENT SITE: ${inputs.websiteUrl}
WEBSITE SCORE: ${inputs.reportScore !== undefined ? `${inputs.reportScore}/100` : 'Not scored'}
${inputs.archetypeName ? `APPROVED DESIGN STYLE: ${inputs.archetypeName}` : ''}
${inputs.competitorName ? `MAIN COMPETITOR ANALYZED: ${inputs.competitorName}` : ''}

KEY AUDIT FINDINGS:
${inputs.reportFindings?.length ? inputs.reportFindings.map((f) => `- ${f}`).join('\n') : '- Full audit findings available in the competitive report'}

${inputs.competitorStrengths?.length ? `COMPETITOR ADVANTAGES TO ADDRESS:\n${inputs.competitorStrengths.map((s) => `- ${s}`).join('\n')}` : ''}

Write a professional, compelling proposal. Be specific to this industry and client — never generic. Tone: confident, expert, concise. No fluff.

Respond ONLY with a valid JSON object, no markdown, no explanation:

{
  "executiveSummary": "2-3 paragraphs separated by double newlines. Reference specific findings. Explain the opportunity. Make it feel written specifically for this client.",
  "scopeOfWork": [
    "10-12 specific deliverables. Each should be a complete sentence describing exactly what is delivered.",
    "Example: Custom 4-page website (Home, About, Services, Contact) built in the approved ${inputs.archetypeName ?? 'custom'} design style",
    "..."
  ],
  "investmentTier": {
    "name": "Professional",
    "price": 2497,
    "monthlyHosting": 49,
    "includes": [
      "10-12 items of what's included",
      "Be specific — e.g. '12 months of hosting on enterprise infrastructure'",
      "..."
    ]
  },
  "timeline": [
    { "phase": "Phase 1 — Design Approval", "duration": "Days 1-3", "deliverable": "Review and finalize the approved mockup design" },
    { "phase": "Phase 2 — Development", "duration": "Days 4-10", "deliverable": "Full 4-page site built from approved design with real content" },
    { "phase": "Phase 3 — Content & Review", "duration": "Days 11-13", "deliverable": "Content populated, client review and revision round" },
    { "phase": "Phase 4 — Launch", "duration": "Day 14", "deliverable": "Domain connected, site goes live, handover call" }
  ],
  "nextSteps": [
    "4-5 clear action steps for the client",
    "Example: Sign and return this proposal with your 50% deposit to reserve your project slot",
    "..."
  ]
}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = message.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('')
    .replace(/```json|```/g, '')
    .trim();

  try {
    return JSON.parse(raw) as GeneratedProposalContent;
  } catch {
    throw new Error('[proposal-generator] Model did not return valid JSON');
  }
}
