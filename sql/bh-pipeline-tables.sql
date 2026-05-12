-- Blue Harbor pipeline schema
-- Run in Supabase SQL Editor (once)
--
-- Prefixed bh_ to avoid collisions with existing CompFlow tables
-- (clients, proposals, intake_submissions).
--
-- NOTE: report_id on bh_clients is a plain UUID because the "reports"
-- table does not yet exist in this database.  Once it is created, add:
--   ALTER TABLE public.bh_clients
--     ADD CONSTRAINT bh_clients_report_id_fkey
--     FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE SET NULL;

-- ── 1. Status ENUM ──────────────────────────────────────────────────────────

CREATE TYPE public.bh_client_status AS ENUM (
  'intake_pending',
  'intake_complete',
  'proposal_draft',
  'proposal_sent',
  'signed',
  'in_buildout',
  'live',
  'paused'
);

-- ── 2. bh_clients ───────────────────────────────────────────────────────────

CREATE TABLE public.bh_clients (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id     uuid,
  company_name  text        NOT NULL,
  contact_name  text,
  contact_email text,
  contact_phone text,
  status        public.bh_client_status NOT NULL DEFAULT 'intake_pending',
  assigned_to   uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  notes         text
);

CREATE INDEX bh_clients_report_id_idx   ON public.bh_clients(report_id);
CREATE INDEX bh_clients_status_idx      ON public.bh_clients(status);
CREATE INDEX bh_clients_assigned_to_idx ON public.bh_clients(assigned_to);

-- ── 3. bh_intake_submissions ────────────────────────────────────────────────

CREATE TABLE public.bh_intake_submissions (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         uuid        NOT NULL REFERENCES public.bh_clients(id) ON DELETE CASCADE,
  submitted_at      timestamptz NOT NULL DEFAULT now(),
  total_volume      numeric,
  years_in_business integer,
  deals_closed      integer,
  deal_examples     jsonb       DEFAULT '[]'::jsonb,
  office_phone      text,
  contact_email     text,
  address           text,
  loan_min          numeric,
  loan_max          numeric,
  geo_focus         text,
  testimonials      text,
  team_bios         jsonb       DEFAULT '[]'::jsonb,
  existing_copy     text,
  completed         boolean     NOT NULL DEFAULT false
);

CREATE INDEX bh_intake_client_id_idx ON public.bh_intake_submissions(client_id);

-- ── 4. bh_proposals ─────────────────────────────────────────────────────────

CREATE TABLE public.bh_proposals (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    uuid        NOT NULL REFERENCES public.bh_clients(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  sent_at      timestamptz,
  accepted_at  timestamptz,
  created_by   uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  title        text        NOT NULL,
  tagline      text,
  deliverables jsonb       DEFAULT '[]'::jsonb,
  pricing      jsonb       DEFAULT '{}'::jsonb,
  roadmap      jsonb       DEFAULT '[]'::jsonb,
  status       public.bh_client_status NOT NULL DEFAULT 'proposal_draft',
  public_slug  text        UNIQUE
);

CREATE INDEX bh_proposals_client_id_idx ON public.bh_proposals(client_id);

-- ── 5. bh_team_members ──────────────────────────────────────────────────────

CREATE TABLE public.bh_team_members (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  email      text NOT NULL,
  role       text NOT NULL DEFAULT 'member',
  avatar_url text
);

-- ── 6. bh_activity_log ──────────────────────────────────────────────────────

CREATE TABLE public.bh_activity_log (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id  uuid        REFERENCES public.bh_clients(id) ON DELETE CASCADE,
  actor_id   uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  action     text        NOT NULL,
  metadata   jsonb       DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX bh_activity_client_id_idx  ON public.bh_activity_log(client_id);
CREATE INDEX bh_activity_created_at_idx ON public.bh_activity_log(created_at DESC);

-- ── 7. Enable RLS ───────────────────────────────────────────────────────────

ALTER TABLE public.bh_clients             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bh_intake_submissions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bh_proposals           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bh_team_members        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bh_activity_log        ENABLE ROW LEVEL SECURITY;

-- ── 8. RLS Policies ─────────────────────────────────────────────────────────
--
-- Access model:
--   • Authenticated team members → full CRUD on all bh_ tables
--   • Anon (public intake form)  → INSERT only on bh_intake_submissions
--   • Anon (public proposal)     → SELECT on bh_proposals where public_slug is set
--
-- The service-role admin client bypasses all of this.

-- Helper: "is the caller a BH team member?"
-- Repeated as a sub-select; if perf matters, extract to a
-- SECURITY DEFINER function in a private schema later.

-- ── bh_clients ──

CREATE POLICY "team_select_clients" ON public.bh_clients
  FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.bh_team_members));

CREATE POLICY "team_insert_clients" ON public.bh_clients
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.bh_team_members));

CREATE POLICY "team_update_clients" ON public.bh_clients
  FOR UPDATE TO authenticated
  USING  (auth.uid() IN (SELECT user_id FROM public.bh_team_members))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.bh_team_members));

CREATE POLICY "team_delete_clients" ON public.bh_clients
  FOR DELETE TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.bh_team_members));

-- ── bh_intake_submissions ──

CREATE POLICY "team_select_intake" ON public.bh_intake_submissions
  FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.bh_team_members));

CREATE POLICY "team_update_intake" ON public.bh_intake_submissions
  FOR UPDATE TO authenticated
  USING  (auth.uid() IN (SELECT user_id FROM public.bh_team_members))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.bh_team_members));

CREATE POLICY "team_delete_intake" ON public.bh_intake_submissions
  FOR DELETE TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.bh_team_members));

CREATE POLICY "anon_insert_intake" ON public.bh_intake_submissions
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow authenticated users to insert too (admin creating on behalf of client)
CREATE POLICY "team_insert_intake" ON public.bh_intake_submissions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.bh_team_members));

-- ── bh_proposals ──

CREATE POLICY "team_select_proposals" ON public.bh_proposals
  FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.bh_team_members));

CREATE POLICY "team_insert_proposals" ON public.bh_proposals
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.bh_team_members));

CREATE POLICY "team_update_proposals" ON public.bh_proposals
  FOR UPDATE TO authenticated
  USING  (auth.uid() IN (SELECT user_id FROM public.bh_team_members))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.bh_team_members));

CREATE POLICY "team_delete_proposals" ON public.bh_proposals
  FOR DELETE TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.bh_team_members));

CREATE POLICY "anon_read_proposal_by_slug" ON public.bh_proposals
  FOR SELECT TO anon
  USING (public_slug IS NOT NULL);

-- ── bh_team_members ──

CREATE POLICY "team_select_members" ON public.bh_team_members
  FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.bh_team_members));

CREATE POLICY "team_insert_members" ON public.bh_team_members
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.bh_team_members));

CREATE POLICY "team_update_members" ON public.bh_team_members
  FOR UPDATE TO authenticated
  USING  (auth.uid() IN (SELECT user_id FROM public.bh_team_members))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.bh_team_members));

CREATE POLICY "team_delete_members" ON public.bh_team_members
  FOR DELETE TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.bh_team_members));

-- ── bh_activity_log ──

CREATE POLICY "team_select_activity" ON public.bh_activity_log
  FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.bh_team_members));

CREATE POLICY "team_insert_activity" ON public.bh_activity_log
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.bh_team_members));
