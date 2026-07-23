-- Run this in your Supabase SQL editor (Dashboard → SQL → New query → Run).
-- Products + categories tables for the storefront.
--
-- NOTE: RLS is intentionally permissive for now — the admin gate is still a
-- client-only demo (localStorage). Once real Supabase Auth + a user_roles
-- table land, tighten the write policies to admins only.

create table if not exists public.categories (
  name text primary key,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.categories to anon, authenticated;
alter table public.categories enable row level security;
drop policy if exists "categories read" on public.categories;
create policy "categories read" on public.categories for select using (true);
drop policy if exists "categories write" on public.categories;
create policy "categories write" on public.categories for all using (true) with check (true);

create table if not exists public.products (
  id text primary key,
  name text not null,
  tag text not null default '',
  price numeric not null default 0,
  rating numeric not null default 0,
  img text not null default '',
  bg text not null default '',
  category text not null references public.categories(name) on update cascade on delete cascade,
  tagline text not null default '',
  description text not null default '',
  details text[] not null default '{}',
  gallery text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products(category);

grant select, insert, update, delete on public.products to anon, authenticated;
alter table public.products enable row level security;
drop policy if exists "products read" on public.products;
create policy "products read" on public.products for select using (true);
drop policy if exists "products write" on public.products;
create policy "products write" on public.products for all using (true) with check (true);
