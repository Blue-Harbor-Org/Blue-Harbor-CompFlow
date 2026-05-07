-- Run in Supabase SQL Editor (once)

alter table public.reports
  add column if not exists report_type text not null default 'standard';

alter table public.reports
  add column if not exists deepdive_token text unique;

alter table public.leads
  add column if not exists deepdive_status text default null;

alter table public.leads
  add column if not exists deepdive_unlocked_at timestamp with time zone;

alter table public.leads
  add column if not exists deepdive_viewed_at timestamp with time zone;

do $$
begin
  alter table public.reports
    add constraint reports_report_type_check
    check (report_type in ('standard', 'deepdive'));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.leads
    add constraint leads_deepdive_status_check
    check (
      deepdive_status is null
      or deepdive_status in ('generating', 'ready', 'unlocked', 'viewed')
    );
exception
  when duplicate_object then null;
end $$;

update public.reports set report_type = 'standard' where report_type is null;

update public.reports
set deepdive_token = encode(gen_random_bytes(32), 'hex')
where deepdive_token is null and report_type = 'deepdive';

create table if not exists public.seo_cache (
  id uuid primary key default gen_random_uuid(),
  domain text not null unique,
  data jsonb not null,
  fetched_at timestamp with time zone default now()
);

create table if not exists public.places_cache (
  id uuid primary key default gen_random_uuid(),
  domain text not null unique,
  data jsonb not null,
  fetched_at timestamp with time zone default now()
);

create index if not exists seo_cache_domain_idx on public.seo_cache (domain);
create index if not exists places_cache_domain_idx on public.places_cache (domain);
