-- Clear cached SEO / Places stubs so fresh DataForSEO + Places responses are fetched.
-- Run in Supabase SQL Editor when deploying SEO parsing fixes.

truncate table seo_cache;
truncate table places_cache;
