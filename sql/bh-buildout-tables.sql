-- Tracks full site buildouts from approved mockups
create table if not exists public.bh_site_buildouts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.bh_clients(id) on delete cascade,
  mockup_id uuid references public.bh_site_mockups(id),
  status text not null default 'queued'
    check (status in ('queued','generating','generated','deployed','live','failed')),
  archetype_id text,
  pages jsonb default '[]'::jsonb,
  cms_data jsonb default '{}'::jsonb,
  vercel_project_id text,
  vercel_deployment_id text,
  preview_url text,
  custom_domain text,
  domain_status text default 'pending'
    check (domain_status in ('pending','propagating','live','failed')),
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tracks individual generated pages
create table if not exists public.bh_buildout_pages (
  id uuid primary key default gen_random_uuid(),
  buildout_id uuid references public.bh_site_buildouts(id) on delete cascade,
  slug text not null,
  title text not null,
  html_content text,
  status text default 'pending'
    check (status in ('pending','generating','done','failed')),
  created_at timestamptz default now()
);

-- RLS: team members only
alter table public.bh_site_buildouts enable row level security;
alter table public.bh_buildout_pages enable row level security;

drop policy if exists "team_buildouts" on public.bh_site_buildouts;
create policy "team_buildouts" on public.bh_site_buildouts
  for all to authenticated
  using (exists (
    select 1 from public.bh_team_members where user_id = auth.uid()
  ));

drop policy if exists "team_buildout_pages" on public.bh_buildout_pages;
create policy "team_buildout_pages" on public.bh_buildout_pages
  for all to authenticated
  using (exists (
    select 1 from public.bh_team_members where user_id = auth.uid()
  ));
