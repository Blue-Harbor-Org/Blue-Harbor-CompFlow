export interface DealEntry {
  id: string;
  loan_amount: number | null;
  property_type: string;
  location: string;
  close_timeline_days: number | null;
  anonymized_ok: boolean;
}

export interface Testimonial {
  id: string;
  text: string;
}

export interface TeamBio {
  id: string;
  name: string;
  title: string;
  bio: string;
}

export interface UploadedFile {
  name: string;
  url: string;
  size: number;
}

export interface IntakeFormData {
  // Step 1: Company Overview
  company_name: string;
  years_in_business: number | null;
  total_loan_volume: number | null;
  total_deals_closed: number | null;

  // Step 2: Deal History
  deal_history: DealEntry[];

  // Step 3: Contact & Office Info
  office_phone: string;
  contact_email: string;
  physical_address: string;
  john_cell: string;
  craig_cell: string;

  // Step 4: Loan Programs
  direct_lending_min: number | null;
  direct_lending_max: number | null;
  brokered_loan_min: number | null;
  brokered_loan_max: number | null;
  geographic_focus: string[];
  geographic_focus_other: string;
  property_types_served: string[];

  // Step 5: Brand Assets
  testimonials: Testimonial[];
  team_bios: TeamBio[];
  awards_press: string;
  marketing_file_urls: UploadedFile[];
}

export interface IntakeSubmission extends IntakeFormData {
  id: string;
  client_id: string;
  organization_id: string;
  current_step: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export const INTAKE_STEPS = [
  'Company Overview',
  'Deal History',
  'Contact & Office',
  'Loan Programs',
  'Brand Assets',
  'Review & Submit',
] as const;

export const GEOGRAPHIC_OPTIONS = [
  'NY Metro',
  'South Florida',
  'Nationwide',
  'Other',
] as const;

export const PROPERTY_TYPE_OPTIONS = [
  'Residential',
  'Commercial',
  'Multi-Family',
  'Mixed-Use',
  'Industrial',
  'Retail',
  'Office',
  'Land',
  'Hospitality',
  'Healthcare',
] as const;

export function emptyFormData(): IntakeFormData {
  return {
    company_name: '',
    years_in_business: null,
    total_loan_volume: null,
    total_deals_closed: null,
    deal_history: [],
    office_phone: '',
    contact_email: '',
    physical_address: '',
    john_cell: '',
    craig_cell: '',
    direct_lending_min: null,
    direct_lending_max: null,
    brokered_loan_min: null,
    brokered_loan_max: null,
    geographic_focus: [],
    geographic_focus_other: '',
    property_types_served: [],
    testimonials: [],
    team_bios: [],
    awards_press: '',
    marketing_file_urls: [],
  };
}
