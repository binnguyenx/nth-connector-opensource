-- Run once on an existing DB so new rows (e.g. Table Editor) default to public-visible.
alter table public.posts alter column approved set default true;
