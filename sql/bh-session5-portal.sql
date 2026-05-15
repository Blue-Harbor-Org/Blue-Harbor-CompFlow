-- Session 5: client portal tokens + public snapshot RPC
-- Run in Supabase SQL Editor.

ALTER TABLE public.bh_site_buildouts
  ADD COLUMN IF NOT EXISTS portal_token uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS client_notes text;

ALTER TABLE public.bh_proposals
  ADD COLUMN IF NOT EXISTS portal_token uuid DEFAULT gen_random_uuid();

CREATE INDEX IF NOT EXISTS idx_buildouts_portal_token ON public.bh_site_buildouts(portal_token);
CREATE INDEX IF NOT EXISTS idx_proposals_portal_token ON public.bh_proposals(portal_token);

UPDATE public.bh_site_buildouts
SET portal_token = gen_random_uuid()
WHERE portal_token IS NULL;

-- Public read: single JSON snapshot for /portal/[token] (token = buildout.portal_token)
CREATE OR REPLACE FUNCTION public.get_portal_snapshot(p_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'buildout', to_jsonb(b.*),
    'pages', COALESCE(
      (SELECT jsonb_agg(to_jsonb(p.*) ORDER BY p.slug) FROM bh_buildout_pages p WHERE p.buildout_id = b.id),
      '[]'::jsonb
    ),
    'client', to_jsonb(c.*),
    'proposal', (
      SELECT to_jsonb(pr.*)
      FROM bh_proposals pr
      WHERE pr.client_id = c.id
      ORDER BY pr.created_at DESC NULLS LAST
      LIMIT 1
    )
  )
  INTO result
  FROM bh_site_buildouts b
  JOIN bh_clients c ON c.id = b.client_id
  WHERE b.portal_token = p_token
  LIMIT 1;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_portal_snapshot(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_portal_snapshot(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_portal_snapshot(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_portal_snapshot(uuid) TO service_role;
