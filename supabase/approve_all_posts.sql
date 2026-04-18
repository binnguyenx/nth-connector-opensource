-- Run once in Supabase → SQL Editor if old rows still have approved = false
-- (Edge Function `submit-post` always inserts approved = true for new posts.)
-- This sets every existing row to visible on the public site (RLS requires approved = true).

update posts
set approved = true
where approved = false;
