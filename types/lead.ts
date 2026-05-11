export type LeadStatus =
  | 'pending'
  | 'report_ready'
  | 'call_booked'
  | 'unlocked'
  | 'proposal_sent'
  | 'closed_won'
  | 'closed_lost';

export type LeadSource = 'public_form' | 'manual';

export type DeepDiveStatus = 'generating' | 'ready' | 'unlocked' | 'viewed';

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
  deepdive_status?: DeepDiveStatus | null;
  deepdive_unlocked_at?: string | null;
  deepdive_viewed_at?: string | null;
  /** Report generation toggles (optional columns — may be absent until migrated) */
  report_tier?: string | null;
  enable_multi_page?: boolean | null;
  enable_google_reviews?: boolean | null;
  enable_seo_data?: boolean | null;
  enable_admin_intel?: boolean | null;
  client_intel?: string | null;
  competitor_intel?: string | null;
}
