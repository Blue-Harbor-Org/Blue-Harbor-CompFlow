-- Session 4: proposal PDF storage + optional proposal row fields
-- Run in Supabase SQL Editor when using PDF generation + email flows.

-- Public bucket for proposal files (adjust RLS/policies to your security model).
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

ALTER TABLE public.bh_proposals
  ADD COLUMN IF NOT EXISTS pdf_url text,
  ADD COLUMN IF NOT EXISTS proposal_number text,
  ADD COLUMN IF NOT EXISTS investment_amount numeric,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
