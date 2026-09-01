-- Create the sourcing_requests table
create table if not exists public.sourcing_requests (
  id text primary key, -- e.g. DM-10482
  customer_name text not null,
  customer_phone text not null,
  product_query text,
  image_url text,
  quantity text,
  specs text,
  status text not null default 'New',
  supplier_availability boolean,
  supplier_cost numeric,
  quoted_price numeric,
  advance_amount numeric,
  estimated_delivery text,
  internal_notes text,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.sourcing_requests enable row level security;

-- Policies
drop policy if exists "sourcing_requests read admin" on public.sourcing_requests;
create policy "sourcing_requests read admin" on public.sourcing_requests for select
  using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "sourcing_requests insert public" on public.sourcing_requests;
create policy "sourcing_requests insert public" on public.sourcing_requests for insert
  with check (true);

drop policy if exists "sourcing_requests update admin" on public.sourcing_requests;
create policy "sourcing_requests update admin" on public.sourcing_requests for update
  using (public.has_role(auth.uid(), 'admin'));

-- Allow public to read their own request by ID (for tracking)
drop policy if exists "sourcing_requests read public" on public.sourcing_requests;
create policy "sourcing_requests read public" on public.sourcing_requests for select
  using (true);

-- Insert bucket for sourcing images
insert into storage.buckets (id, name, public)
values ('sourcing_images', 'sourcing_images', true)
on conflict (id) do nothing;

-- Set up storage policies
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'sourcing_images' );

create policy "Public Insert"
  on storage.objects for insert
  with check ( bucket_id = 'sourcing_images' );
