/**
 * Anthropic models for competitive reports.
 * Toggle in admin uses cookie + these IDs; optional env overrides everything.
 */

export const REPORT_MODELS = {
  haiku: 'claude-haiku-4-5-20251001',
  sonnet: 'claude-sonnet-4-5-20250514',
} as const;

export type ReportModelKey = keyof typeof REPORT_MODELS;

export const REPORT_MODEL_COOKIE = 'bh_report_model';

/** If set (full model string), used for every generation — overrides UI toggle */
export function envModelOverride(): string | null {
  const v = process.env.ANTHROPIC_REPORT_MODEL?.trim();
  return v || null;
}

export function modelIdFromKey(key: ReportModelKey): string {
  return REPORT_MODELS[key];
}

/** Resolve which Anthropic model ID to call */
export function resolveReportModelId(cookieValue?: string | null): string {
  const env = envModelOverride();
  if (env) return env;

  const key: ReportModelKey = cookieValue === 'sonnet' ? 'sonnet' : 'haiku';
  return REPORT_MODELS[key];
}
