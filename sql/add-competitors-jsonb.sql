-- Multi-competitor support: JSON array on leads + nullable legacy competitor_url
-- Run in Supabase SQL Editor.

alter table public.leads
  add column if not exists competitors jsonb default '[]'::jsonb;

alter table public.leads
  alter column competitor_url drop not null;

-- Migrate existing single competitor into competitors array
update public.leads
set competitors = jsonb_build_array(
  jsonb_build_object(
    'id', gen_random_uuid()::text,
    'name', coalesce(competitor_name, 'Competitor'),
    'url', competitor_url,
    'source', 'manual',
    'autoFound', false
  )
)
where competitor_url is not null
  and trim(competitor_url) <> ''
  and (
    competitors is null
    or competitors = '[]'::jsonb
    or jsonb_array_length(competitors) = 0
  );
