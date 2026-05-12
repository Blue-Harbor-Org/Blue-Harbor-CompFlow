-- Add missing JSONB columns to bh_proposals for the full proposal builder
-- Run in Supabase SQL Editor

ALTER TABLE public.bh_proposals
  ADD COLUMN IF NOT EXISTS situation_summary text,
  ADD COLUMN IF NOT EXISTS battlecard jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS closing jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS prep_date date DEFAULT CURRENT_DATE;

-- Allow anonymous users to update accepted_at (Accept Proposal button)
CREATE POLICY "anon_accept_proposal" ON public.bh_proposals
  FOR UPDATE TO anon
  USING (public_slug IS NOT NULL)
  WITH CHECK (public_slug IS NOT NULL);
