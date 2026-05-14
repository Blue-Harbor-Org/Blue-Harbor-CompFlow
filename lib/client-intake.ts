import type { SupabaseClient } from '@supabase/supabase-js';
import type { ClientIntakeRecord } from '@/types/client-intake';

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function normalizeGeoFocus(value: unknown): string | null {
  if (Array.isArray(value)) {
    const joined = value.map((entry) => asString(entry)).filter(Boolean).join(', ');
    return joined || null;
  }
  return asString(value);
}

function normalizeTestimonials(value: unknown): string | null {
  if (Array.isArray(value)) {
    const joined = value
      .map((entry) => {
        if (typeof entry === 'string') return entry.trim();
        if (entry && typeof entry === 'object' && 'text' in entry) {
          return asString((entry as { text?: unknown }).text) ?? '';
        }
        return '';
      })
      .filter(Boolean)
      .join('\n---\n');
    return joined || null;
  }
  return asString(value);
}

function normalizeArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function normalizeLegacyIntake(row: Record<string, unknown>, clientId: string): ClientIntakeRecord {
  return {
    id: asString(row.id) ?? `legacy-${clientId}`,
    client_id: asString(row.client_id) ?? clientId,
    submitted_at:
      asString(row.submitted_at) ??
      asString(row.created_at) ??
      new Date(0).toISOString(),
    completed: Boolean(row.completed),
    total_volume: asNumber(row.total_loan_volume ?? row.total_volume),
    years_in_business: asNumber(row.years_in_business),
    deals_closed: asNumber(row.total_deals_closed ?? row.deals_closed),
    deal_examples: normalizeArray(row.deal_history ?? row.deal_examples),
    office_phone: asString(row.office_phone),
    contact_email: asString(row.contact_email),
    address: asString(row.physical_address ?? row.address),
    john_cell: asString(row.john_cell),
    craig_cell: asString(row.craig_cell),
    loan_min: asNumber(row.direct_lending_min ?? row.loan_min),
    loan_max: asNumber(row.direct_lending_max ?? row.loan_max),
    geo_focus: normalizeGeoFocus(row.geographic_focus ?? row.geo_focus),
    testimonials: normalizeTestimonials(row.testimonials),
    team_bios: normalizeArray(row.team_bios),
    existing_copy: asString(row.awards_press ?? row.existing_copy),
    source: 'legacy',
  };
}

export async function getLatestClientIntake(
  supabase: SupabaseClient,
  clientId: string,
  leadId?: string | null
): Promise<ClientIntakeRecord | null> {
  const { data: bhIntake } = await supabase
    .from('bh_intake_submissions')
    .select('*')
    .eq('client_id', clientId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (bhIntake) {
    return {
      ...(bhIntake as Omit<ClientIntakeRecord, 'source'>),
      source: 'bh',
    };
  }

  const legacyByClient = await supabase
    .from('intake_submissions')
    .select('*')
    .eq('client_id', clientId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (legacyByClient.data) {
    return normalizeLegacyIntake(legacyByClient.data as Record<string, unknown>, clientId);
  }

  if (leadId) {
    const legacyByLead = await supabase
      .from('intake_submissions')
      .select('*')
      .eq('lead_id', leadId)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (legacyByLead.data) {
      return normalizeLegacyIntake(legacyByLead.data as Record<string, unknown>, clientId);
    }
  }

  return null;
}
