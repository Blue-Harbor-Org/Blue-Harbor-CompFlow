export interface ClientIntakeRecord {
  id: string;
  client_id: string;
  submitted_at: string;
  completed: boolean;
  total_volume: number | null;
  years_in_business: number | null;
  deals_closed: number | null;
  deal_examples: unknown[];
  office_phone: string | null;
  contact_email: string | null;
  address: string | null;
  john_cell: string | null;
  craig_cell: string | null;
  loan_min: number | null;
  loan_max: number | null;
  geo_focus: string | null;
  testimonials: string | null;
  team_bios: unknown[];
  existing_copy: string | null;
  source: 'bh' | 'legacy';
}
