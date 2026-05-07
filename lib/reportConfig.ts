export type ReportTier = 'standard' | 'deep';

export interface ReportConfig {
  tier: ReportTier;
  multiPage: boolean;
  googleReviews: boolean;
  seoData: boolean;
  adminIntel: boolean;
  /** Anthropic model id */
  model: string;
}

/** Haiku — deep dives use resolveReportModelId() at call site (cookie/env VIP Sonnet) */
export const DEEP_CONFIG: ReportConfig = {
  tier: 'deep',
  multiPage: true,
  googleReviews: true,
  seoData: true,
  adminIntel: true,
  model: 'claude-haiku-4-5-20251001',
};

export function estimateCost(config: ReportConfig): string {
  let cost = 0;

  if (config.multiPage) {
    cost += 0.003;
  } else {
    cost += 0.001;
  }

  if (config.model?.includes('sonnet')) {
    cost += 0.12;
  }

  if (config.googleReviews) cost += 0.005;
  if (config.seoData) cost += 0.005;

  return `~$${cost.toFixed(3)}`;
}
