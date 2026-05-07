export type LeadStatus =
  | 'pending'
  | 'report_ready'
  | 'call_booked'
  | 'unlocked'
  | 'proposal_sent'
  | 'closed_won'
  | 'closed_lost';

export type LeadSource = 'public_form' | 'manual';

export interface Lead {
  id: string;
  created_at: string;
  contact_name: string;
  business_name: string;
  email: string;
  phone: string | null;
  website_url: string;
  competitor_url: string;
  competitor_name: string | null;
  /** Industry vertical — drives AI tone (see lib/verticals.ts) */
  industry?: string;
  source: LeadSource;
  status: LeadStatus;
  report_token: string;
  notes: string | null;
  owner_id: string | null;
}
