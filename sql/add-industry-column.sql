-- Run once in Supabase → SQL Editor (Dashboard)
alter table public.leads
  add column if not exists industry text not null default 'general';
