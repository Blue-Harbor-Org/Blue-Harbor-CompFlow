-- Align bh_proposals.client_id with the bh_clients-based pipeline model.
-- Assumes all existing client_id values already exist in public.bh_clients(id).

BEGIN;

ALTER TABLE public.bh_proposals
  DROP CONSTRAINT IF EXISTS bh_proposals_client_id_fkey;

ALTER TABLE public.bh_proposals
  ADD CONSTRAINT bh_proposals_client_id_fkey
  FOREIGN KEY (client_id)
  REFERENCES public.bh_clients(id)
  ON DELETE CASCADE;

COMMIT;

-- Verification:
-- SELECT pg_get_constraintdef(c.oid) AS fk_definition
-- FROM pg_constraint c
-- JOIN pg_class t ON t.oid = c.conrelid
-- JOIN pg_namespace n ON n.oid = t.relnamespace
-- WHERE n.nspname = 'public'
--   AND t.relname = 'bh_proposals'
--   AND c.conname = 'bh_proposals_client_id_fkey';
