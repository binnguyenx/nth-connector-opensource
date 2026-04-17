-- Run once in Supabase → SQL Editor after turning off moderation
-- (Edge Function `submit-post` with REQUIRE_APPROVAL = false only affects NEW posts.)
-- This sets every existing row to visible on the public site (RLS requires approved = true).

update posts
set approved = true
where approved = false;
