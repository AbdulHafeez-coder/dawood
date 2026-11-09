begin;
create table public.decorative_sheet_sizes (
  size text primary key check (size = '36x60'),
  price integer not null check (price > 0),
  available integer not null check (available >= 0)
);
alter table public.decorative_sheet_sizes enable row level security;
grant select on public.decorative_sheet_sizes to anon, authenticated;
grant update (price, available) on public.decorative_sheet_sizes to authenticated;
create policy decorative_read on public.decorative_sheet_sizes for select using (true);
create policy decorative_admin on public.decorative_sheet_sizes for update to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
insert into public.decorative_sheet_sizes values ('36x60',650,20);

-- Separate stock pool; old PVC listings retain their original reservation path.
create or replace function public.reserve_pvc_sizes() returns trigger language plpgsql security definer set search_path = '' as $$
declare line record;
begin
  for line in select * from jsonb_to_recordset(new.pvc_lines) as x(size text,qty integer,price integer,product text,design text) order by product,size loop
    if line.qty is null or line.qty <= 0 or not exists (select 1 from public.products where id=line.product and is_active and in_stock) then
      raise exception 'Invalid or unavailable PVC sheet';
    end if;
    if line.product in ('decorative-pvc-center-table-sheet','decorative-pvc-dastarkhwan-sheet') then
      if line.design is null or line.design not in ('blue','green','gold-pink','cream-gold','pink') then raise exception 'Please select a sheet design.'; end if;
      update public.decorative_sheet_sizes set available=available-line.qty where size=line.size and price=line.price and available>=line.qty;
    elsif line.product in ('fancy-pvc-dastarkhwan-sheet','pvc-center-table-sheet-waterproof-table-cover') then
      update public.pvc_sheet_sizes set available=available-line.qty where size=line.size and price=line.price and available>=line.qty;
    else
      raise exception 'Invalid PVC sheet';
    end if;
    if not found then raise exception 'PVC sheet price or stock changed. Please review your basket.'; end if;
  end loop;
  return new;
end $$;
revoke all on function public.reserve_pvc_sizes() from public;

-- Keep the existing admin product-price field and shared-stock editor consistent.
create function public.sync_decorative_price() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if pg_trigger_depth() > 1 then return new; end if;
  if tg_table_name = 'products' then
    if new.price <= 0 or new.price <> trunc(new.price) then raise exception 'Enter a positive whole-rupee sheet price.'; end if;
    update public.decorative_sheet_sizes set price=new.price where size='36x60';
    update public.products set price=new.price where id in ('decorative-pvc-center-table-sheet','decorative-pvc-dastarkhwan-sheet') and id<>new.id;
  else
    update public.products set price=new.price where id in ('decorative-pvc-center-table-sheet','decorative-pvc-dastarkhwan-sheet');
  end if;
  return new;
end $$;
revoke all on function public.sync_decorative_price() from public;
create trigger decorative_product_price after update of price on public.products for each row
  when (new.id in ('decorative-pvc-center-table-sheet','decorative-pvc-dastarkhwan-sheet') and old.price is distinct from new.price)
  execute function public.sync_decorative_price();
create trigger decorative_inventory_price after update of price on public.decorative_sheet_sizes for each row
  when (old.price is distinct from new.price) execute function public.sync_decorative_price();

-- Publish only after the storefront supporting design selection has deployed.
insert into public.products (id,slug,name,category,tagline,description,seo_title,seo_description,img,gallery,details,price,rating,is_active,in_stock)
select id,id,name,'Sheets',subcategory,description,seo_title,seo_description,
  '/images/products/decorative-sheets/blue.webp',
  array['/images/products/decorative-sheets/blue.webp','/images/products/decorative-sheets/green.webp','/images/products/decorative-sheets/gold-pink.webp','/images/products/decorative-sheets/cream-gold.webp','/images/products/decorative-sheets/pink.webp'],
  array['Material: printed PVC sheet','Size: 36 × 60 inches (3 × 5 feet)','Pack: 1 sheet; table and accessories not included','Waterproof surface; helps keep everyday dust and spills off your table','Easy to wash and wipe clean; reusable for long-lasting everyday use','Choose Blue, Green, Gold & Pink, Cream & Gold or Pink','Use a soft damp cloth; keep away from direct heat and sharp objects','Images show styled product views, not customer reviews'],
  650,0,false,true
from (values
  ('decorative-pvc-center-table-sheet','Fancy PVC Center Table Sheet – Waterproof Decorative Table Cover','Center & Side Table Sheets',
   'Refresh your living-room center table with a decorative printed PVC sheet. The waterproof surface helps protect the table from everyday dust and spills and is easy to wipe clean or wash. A reusable cover for daily decoration and practical table care. Choose your preferred design. سینٹر ٹیبل کی سجاوٹ اور روزمرہ گرد و پانی سے حفاظت کے لیے؛ صاف کرنا اور دھونا آسان ہے۔',
   'PVC Center Table Sheet 3×5 ft | Waterproof Table Cover',
   'Shop a 36×60 inch PVC center table sheet for Rs. 650. Choose from five designs for living-room decoration, everyday dust and spill protection, and easy cleaning.'),
  ('decorative-pvc-dastarkhwan-sheet','Fancy PVC Dastarkhwan Sheet – Waterproof Dining & Mehman Table Cover','Dastarkhwan Sheets',
   'Prepare a neat dining space for everyday meals and mehman with this reusable printed PVC dastarkhwan sheet. Its waterproof surface is easy to wipe clean or wash after food spills. Select your design for daily dining or guest gatherings; serve food in dishes. روزمرہ کھانے اور مہمانوں کے لیے واٹرپروف دسترخوان؛ استعمال کے بعد صاف کرنا اور دھونا آسان ہے۔',
   'PVC Dastarkhwan Sheet 3×5 ft | Dining & Mehman Cover',
   'Buy a 36×60 inch waterproof PVC dastarkhwan for Rs. 650. Five selectable designs for daily meals and mehman, with an easy-clean reusable surface.')
) as p(id,name,subcategory,description,seo_title,seo_description);
commit;
