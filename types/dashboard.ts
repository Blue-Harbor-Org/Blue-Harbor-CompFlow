export type PipelineStatus =
  | 'intake_pending'
  | 'intake_complete'
  | 'proposal_sent'
  | 'signed'
  | 'in_buildout'
  | 'live';

export const PIPELINE_COLUMNS: { status: PipelineStatus; label: string; color: string }[] = [
  { status: 'intake_pending', label: 'Intake Pending', color: '#9cb3d4' },
  { status: 'intake_complete', label: 'Intake Complete', color: '#e5b84a' },
  { status: 'proposal_sent', label: 'Proposal Sent', color: '#f2cc60' },
  { status: 'signed', label: 'Signed', color: '#34d399' },
  { status: 'in_buildout', label: 'In Buildout', color: '#6ba3ff' },
  { status: 'live', label: 'Live', color: '#34d399' },
];

export interface TeamMember {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: 'admin' | 'member';
  created_at: string;
}

export interface ActivityLogEntry {
  id: string;
  client_id: string;
  team_member_id: string | null;
  type: 'status_change' | 'note' | 'assignment' | 'proposal' | 'general';
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
  team_member?: TeamMember | null;
}

export interface Client {
  id: string;
  created_at: string;
  report_id?: string | null;
  contact_name: string;
  business_name: string;
  email: string;
  phone: string | null;
  website_url: string;
  industry: string;
  source: string;
  pipeline_status: PipelineStatus;
  assigned_to: string | null;
  status_changed_at: string;
  notes: string | null;
  report_token: string;
  competitor_url: string | null;
  competitor_name: string | null;
  competitors: { id: string; name: string; url: string; source: string; autoFound: boolean }[] | null;
  assigned_member?: TeamMember | null;
}
