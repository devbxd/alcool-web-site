-- Whiskey & More — Supabase setup
-- Run this once in the Supabase SQL Editor (Dashboard > SQL Editor > New query > Run)

-- 1. Products table
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null,
  description text,
  category text not null,
  image_url text,
  created_at timestamptz not null default now()
);

alter table products enable row level security;

-- No login on the admin page (client request), so read/write is open to
-- anyone with the site's public API key. The admin page URL is not linked
-- from the public site — treat it as a private, unlisted link.
drop policy if exists "Public can read products" on products;
create policy "Public can read products"
  on products for select
  using (true);

drop policy if exists "Public can insert products" on products;
create policy "Public can insert products"
  on products for insert
  with check (true);

drop policy if exists "Public can update products" on products;
create policy "Public can update products"
  on products for update
  using (true);

drop policy if exists "Public can delete products" on products;
create policy "Public can delete products"
  on products for delete
  using (true);

-- 2. Storage bucket for product photos
insert into storage.buckets (id, name, public)
values ('product-photos', 'product-photos', true)
on conflict (id) do nothing;

drop policy if exists "Public read product photos" on storage.objects;
create policy "Public read product photos"
  on storage.objects for select
  using (bucket_id = 'product-photos');

drop policy if exists "Public upload product photos" on storage.objects;
create policy "Public upload product photos"
  on storage.objects for insert
  with check (bucket_id = 'product-photos');

drop policy if exists "Public delete product photos" on storage.objects;
create policy "Public delete product photos"
  on storage.objects for delete
  using (bucket_id = 'product-photos');
