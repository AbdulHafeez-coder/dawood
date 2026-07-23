-- Run this in your Supabase SQL editor (Dashboard → SQL → New query → Run).
-- Idempotent: safe to re-run.
--
-- Contents:
--   1. app_role enum + user_roles table + has_role() security definer
--   2. categories, products  (writes: admins only, reads: public)
--   3. settings              (single-row site settings; writes: admins only)

-- =============================================================
-- 1. Roles
-- =============================================================

do $$ begin
  create type public.app_role as enum ('admin', 'moderator', 'user');
exception when duplicate_object then null; end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

drop policy if exists "user_roles self read" on public.user_roles;
create policy "user_roles self read" on public.user_roles
  for select to authenticated
  using (user_id = auth.uid());

-- Security-definer role check. Bypasses RLS to avoid recursion.
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

grant execute on function public.has_role(uuid, public.app_role) to anon, authenticated;

-- =============================================================
-- 2. Categories + products (public read, admin-only write)
-- =============================================================

create table if not exists public.categories (
  name text primary key,
  created_at timestamptz not null default now()
);

grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;

alter table public.categories enable row level security;

drop policy if exists "categories read" on public.categories;
create policy "categories read" on public.categories for select using (true);

-- Legacy permissive policy — drop if it exists so we can replace with admin-only.
drop policy if exists "categories write" on public.categories;
drop policy if exists "categories admin write" on public.categories;
create policy "categories admin write" on public.categories
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

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

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;

alter table public.products enable row level security;

drop policy if exists "products read" on public.products;
create policy "products read" on public.products for select using (true);

drop policy if exists "products write" on public.products;
drop policy if exists "products admin write" on public.products;
create policy "products admin write" on public.products
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- =============================================================
-- 3. Site settings (single row; public read, admin-only write)
-- =============================================================

create table if not exists public.settings (
  id text primary key default 'global',
  brand_name text not null default 'Maison Terra',
  tagline text not null default 'Essentials for a tactile home',
  logo_url text not null default '',
  whatsapp_number text not null default '03011234567',
  contact_email text not null default 'hello@maisonterra.co',
  contact_phone text not null default '0301-1234567',
  address text not null default '12 Linden Row, Copenhagen',
  socials jsonb not null default '{
    "instagram": "https://instagram.com/maisonterra",
    "facebook": "",
    "twitter": "",
    "tiktok": "",
    "pinterest": "",
    "youtube": ""
  }'::jsonb,
  updated_at timestamptz not null default now(),
  constraint settings_singleton check (id = 'global')
);

-- Seed the singleton row if missing.
insert into public.settings (id) values ('global') on conflict (id) do nothing;

grant select on public.settings to anon, authenticated;
grant insert, update on public.settings to authenticated;
grant all on public.settings to service_role;

alter table public.settings enable row level security;

drop policy if exists "settings read" on public.settings;
create policy "settings read" on public.settings for select using (true);

drop policy if exists "settings admin write" on public.settings;
create policy "settings admin write" on public.settings
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- =============================================================
-- Making yourself an admin
-- =============================================================
-- 1. Create a user: Supabase Dashboard → Authentication → Users → Add user
--    (use "Auto Confirm User" so you can sign in immediately).
-- 2. Grant the admin role by running (replace the email):
--
--    insert into public.user_roles (user_id, role)
--    select id, 'admin'::public.app_role from auth.users
--    where email = 'you@example.com'
--    on conflict do nothing;

-- =============================================================
-- 4. Orders (WhatsApp drafts) — per-user RLS + admin read access
-- =============================================================
-- Customer-facing pages keep a fast localStorage cache for their own view.
-- Every saved draft is ALSO persisted here so admins can review all orders
-- and signed-in customers can see their history across devices.

create table if not exists public.orders (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  device_id text not null default '',
  kind text not null check (kind in ('cart', 'product')),
  url text not null,
  message text not null,
  total numeric not null default 0,
  item_count integer not null default 0,
  primary_name text not null default '',
  primary_img text,
  primary_bg text,
  extra_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_created_at_idx on public.orders(created_at desc);

-- Anyone (anon or signed in) may create an order draft. When signed in the
-- client stamps user_id = auth.uid() so RLS can scope reads to their own.
grant insert on public.orders to anon, authenticated;
grant select, delete on public.orders to authenticated;
grant all on public.orders to service_role;

alter table public.orders enable row level security;

drop policy if exists "orders insert any" on public.orders;
create policy "orders insert any" on public.orders
  for insert to anon, authenticated
  with check (
    -- Authenticated users must stamp their own uid (or leave null).
    user_id is null or user_id = auth.uid()
  );

drop policy if exists "orders self read" on public.orders;
create policy "orders self read" on public.orders
  for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

drop policy if exists "orders self delete" on public.orders;
create policy "orders self delete" on public.orders
  for delete to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

-- =============================================================
-- 5. Storage bucket for product images (public read, admin write)
-- =============================================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

-- Public can read (bucket is public, but keep an explicit policy for clarity)
drop policy if exists "product-images public read" on storage.objects;
create policy "product-images public read" on storage.objects
  for select
  using (bucket_id = 'product-images');

drop policy if exists "product-images admin write" on storage.objects;
create policy "product-images admin write" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and public.has_role(auth.uid(), 'admin')
  );

drop policy if exists "product-images admin update" on storage.objects;
create policy "product-images admin update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'product-images'
    and public.has_role(auth.uid(), 'admin')
  )
  with check (
    bucket_id = 'product-images'
    and public.has_role(auth.uid(), 'admin')
  );

drop policy if exists "product-images admin delete" on storage.objects;
create policy "product-images admin delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'product-images'
    and public.has_role(auth.uid(), 'admin')
  );
