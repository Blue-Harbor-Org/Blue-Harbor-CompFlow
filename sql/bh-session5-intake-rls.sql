-- Session 5: intake hardening — intake_token column (may already exist from fix-rls-policies.sql)
-- + backfill. App validates clientId + x-intake-token against bh_clients.intake_token.

ALTER TABLE public.bh_clients
  ADD COLUMN IF NOT EXISTS intake_token uuid DEFAULT gen_random_uuid();

CREATE INDEX IF NOT EXISTS idx_clients_intake_token ON public.bh_clients(intake_token);

UPDATE public.bh_clients
SET intake_token = gen_random_uuid()
WHERE intake_token IS NULL;
