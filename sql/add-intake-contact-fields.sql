-- Add john_cell / craig_cell to bh_intake_submissions
-- These existed in the legacy intake_submissions table and are needed by the intake form.
-- Run in Supabase SQL Editor.

ALTER TABLE public.bh_intake_submissions
  ADD COLUMN IF NOT EXISTS john_cell text,
  ADD COLUMN IF NOT EXISTS craig_cell text;
