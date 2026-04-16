-- Run this in your Supabase project's SQL editor
-- (Dashboard → SQL Editor → New query)

-- ============================================================
-- 1. Create the posts table
-- ============================================================
create table if not exists posts (
  id               uuid        primary key default gen_random_uuid(),
  name             text        not null,
  class            text        not null,
  secondary_class  text,
  school_year      text        not null,
  city             text        not null,
  country          text        not null,
  caption          text,
  image_url        text,
  lat              float8,
  lng              float8,
  instagram        text,
  facebook         text,
  linkedin         text,
  approved         boolean     not null default false,
  created_at       timestamptz not null default now()
);

-- ============================================================
-- 2. Enable Row Level Security
-- ============================================================
alter table posts enable row level security;

-- Anyone can read approved posts
create policy "Public read approved posts" on posts
  for select using (approved = true);

-- Anyone can submit (no login required)
create policy "Public insert" on posts
  for insert with check (true);

-- No update or delete policies → only you can modify data via the Supabase dashboard

