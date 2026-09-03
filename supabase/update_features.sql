-- Whiskey & More — feature update (wishlist/search/sort are client-side,
-- no DB change needed for those). Run this once in the Supabase SQL Editor.

-- 1. Stock status on products (defaults everyone existing to "in stock")
alter table products add column if not exists in_stock boolean not null default true;

-- 2. Newsletter subscribers
create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table subscribers enable row level security;

drop policy if exists "Public can subscribe" on subscribers;
create policy "Public can subscribe"
  on subscribers for insert
  with check (true);

-- No public read policy on purpose — subscriber emails are private.
-- View them anytime in the Supabase dashboard: Table Editor > subscribers.
