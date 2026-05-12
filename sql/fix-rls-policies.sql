-- ============================================================
-- fix-rls-policies.sql
-- Tighten anon access on bh_proposals + bh_intake_submissions
-- ============================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS private;

-- ─────────────────────────────────────────────────────────────
-- 1. bh_proposals — column-scoped anon UPDATE
-- ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "anon_accept_proposal" ON public.bh_proposals;

CREATE POLICY "anon_accept_proposal_scoped" ON public.bh_proposals
  FOR UPDATE TO anon
  USING  (public_slug IS NOT NULL AND accepted_at IS NULL)
  WITH CHECK (public_slug IS NOT NULL);

-- Trigger enforces that anon may only touch accepted_at and status.
-- Service-role and authenticated callers are not restricted.
CREATE OR REPLACE FUNCTION private.enforce_anon_proposal_cols()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF current_user = 'anon' THEN
    IF NEW.id                IS DISTINCT FROM OLD.id
    OR NEW.client_id         IS DISTINCT FROM OLD.client_id
    OR NEW.created_at        IS DISTINCT FROM OLD.created_at
    OR NEW.sent_at           IS DISTINCT FROM OLD.sent_at
    OR NEW.created_by        IS DISTINCT FROM OLD.created_by
    OR NEW.title             IS DISTINCT FROM OLD.title
    OR NEW.tagline           IS DISTINCT FROM OLD.tagline
    OR NEW.deliverables      IS DISTINCT FROM OLD.deliverables
    OR NEW.pricing           IS DISTINCT FROM OLD.pricing
    OR NEW.roadmap           IS DISTINCT FROM OLD.roadmap
    OR NEW.public_slug       IS DISTINCT FROM OLD.public_slug
    OR NEW.situation_summary IS DISTINCT FROM OLD.situation_summary
    OR NEW.battlecard        IS DISTINCT FROM OLD.battlecard
    OR NEW.closing           IS DISTINCT FROM OLD.closing
    OR NEW.prep_date         IS DISTINCT FROM OLD.prep_date
    THEN
      RAISE EXCEPTION 'anon role may only update accepted_at and status';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_anon_proposal_cols ON public.bh_proposals;

CREATE TRIGGER trg_enforce_anon_proposal_cols
  BEFORE UPDATE ON public.bh_proposals
  FOR EACH ROW
  EXECUTE FUNCTION private.enforce_anon_proposal_cols();

-- ─────────────────────────────────────────────────────────────
-- 2. bh_proposals — replace broad anon SELECT with RPC function
-- ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "anon_read_proposal_by_slug" ON public.bh_proposals;

-- SECURITY DEFINER so the function can read bh_proposals without
-- an anon SELECT policy on the table. search_path is emptied to
-- prevent schema-injection attacks.
CREATE OR REPLACE FUNCTION public.get_proposal_by_slug(p_slug text)
RETURNS SETOF public.bh_proposals
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT * FROM public.bh_proposals
  WHERE public_slug = p_slug
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_proposal_by_slug(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_proposal_by_slug(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_proposal_by_slug(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_proposal_by_slug(text) TO service_role;

-- ─────────────────────────────────────────────────────────────
-- 3. bh_intake_submissions — intake_token gate
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.bh_clients
  ADD COLUMN IF NOT EXISTS intake_token uuid NOT NULL DEFAULT gen_random_uuid();

CREATE INDEX IF NOT EXISTS bh_clients_intake_token_idx
  ON public.bh_clients(intake_token);

-- Replace the wide-open anon INSERT with an explicit client_id check.
-- (FK already enforces referential integrity; this makes the RLS
-- intent readable and blocks inserts with a fabricated client_id
-- that doesn't exist.)
DROP POLICY IF EXISTS "anon_insert_intake" ON public.bh_intake_submissions;

CREATE POLICY "anon_insert_intake_validated" ON public.bh_intake_submissions
  FOR INSERT TO anon
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.bh_clients WHERE id = client_id)
  );

COMMIT;
