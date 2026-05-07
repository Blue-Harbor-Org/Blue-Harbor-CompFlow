-- Run once on your Supabase project (SQL Editor)
alter table leads add column industry text not null default 'general';
