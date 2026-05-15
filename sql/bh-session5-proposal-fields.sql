-- Session 5: extended proposal fields for public page + PDF sync
-- Run in Supabase SQL Editor.

ALTER TABLE public.bh_proposals
  ADD COLUMN IF NOT EXISTS proposal_number text,
  ADD COLUMN IF NOT EXISTS investment_amount integer,
  ADD COLUMN IF NOT EXISTS monthly_hosting integer DEFAULT 49,
  ADD COLUMN IF NOT EXISTS investment_tier_name text DEFAULT 'Professional',
  ADD COLUMN IF NOT EXISTS investment_includes jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS scope_of_work jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS client_timeline jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS executive_summary text,
  ADD COLUMN IF NOT EXISTS accepted_by_name text,
  ADD COLUMN IF NOT EXISTS accepted_by_title text,
  ADD COLUMN IF NOT EXISTS pdf_url text,
  ADD COLUMN IF NOT EXISTS valid_until timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

COMMENT ON COLUMN public.bh_proposals.client_timeline IS 'PDF proposal timeline phases (phase, duration, deliverable); distinct from roadmap JSON for builder UI.';
