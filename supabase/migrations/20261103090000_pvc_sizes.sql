begin;
create table public.pvc_sheet_sizes (
  size text primary key check (size in ('36x57','36x60')),
  price integer not null check (price > 0),
  available integer not null check (available >= 0)
);
alter table public.pvc_sheet_sizes enable row level security;
grant select on public.pvc_sheet_sizes to anon, authenticated;
grant update (price, available) on public.pvc_sheet_sizes to authenticated;
create policy pvc_read on public.pvc_sheet_sizes for select using (true);
create policy pvc_admin on public.pvc_sheet_sizes for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
insert into public.pvc_sheet_sizes values ('36x57',699,20),('36x60',850,20);
alter table public.orders add column pvc_lines jsonb;
create function public.reserve_pvc_sizes() returns trigger language plpgsql security definer set search_path = '' as $$
declare line record;
begin
  for line in select * from jsonb_to_recordset(new.pvc_lines) as x(size text,qty integer,price integer,product text) order by size loop
    if line.qty is null or line.qty <= 0 or not exists (select 1 from public.products where id=line.product and id in ('fancy-pvc-dastarkhwan-sheet','pvc-center-table-sheet-waterproof-table-cover') and is_active and in_stock) then raise exception 'Invalid or unavailable PVC sheet'; end if;
    update public.pvc_sheet_sizes set available=available-line.qty where size=line.size and price=line.price and available>=line.qty;
    if not found then raise exception 'PVC sheet price or stock changed. Please review your basket.'; end if;
  end loop;
  return new;
end $$;
revoke all on function public.reserve_pvc_sizes() from public;
create trigger reserve_pvc_order before insert on public.orders for each row when (new.pvc_lines is not null) execute function public.reserve_pvc_sizes();
insert into public.products (id,slug,name,category,tagline,description,seo_title,seo_description,img,gallery,details,price,rating,is_active,in_stock) values ('fancy-pvc-dastarkhwan-sheet','fancy-pvc-dastarkhwan-sheet','Fancy PVC Dastarkhwan Sheet – Waterproof Dining & Mehman Dastarkhwan','Sheets','Dastarkhwan Sheets','Set the table for daily meals or guests with a reusable, waterproof PVC dastarkhwan. The multicolour printed surface wipes clean after meals.','Fancy PVC Dastarkhwan Sheet for Dining | Dawood Mart','Set the table for daily meals or guests with a reusable, waterproof PVC dastarkhwan. The multicolour printed surface wipes clean after meals.','https://pk-live-21.slatic.net/kf/S1d023c6910574d7fbb7bb566f4a81bb9c.jpg',array['https://pk-live-21.slatic.net/kf/S1d023c6910574d7fbb7bb566f4a81bb9c.jpg','https://pk-live-21.slatic.net/kf/S93b4e31ed56b4931bc99bde6996d0758S.jpg','https://pk-live-21.slatic.net/kf/Sbf80e79a87e24c56b6fae5a75c37edaeV.jpg','https://pk-live-21.slatic.net/kf/Sd8c9abec41c04746ad845e72119dc278w.jpg'],array['Multi-design, multi-color PVC','36 × 57 inches or 36 × 60 inches'],699,0,true,true);
insert into public.products (id,slug,name,category,tagline,description,seo_title,seo_description,img,gallery,details,price,rating,is_active,in_stock) values ('pvc-center-table-sheet-waterproof-table-cover','pvc-center-table-sheet-waterproof-table-cover','PVC Center Table Sheet – Waterproof Fancy Table Cover','Sheets','Center & Side Table Sheets','Protect your center table from water, stains and everyday dust with a reusable printed PVC table cover. Wipe the surface clean between uses.','Waterproof PVC Center Table Sheet | Dawood Mart Pakistan','Protect your center table from water, stains and everyday dust with a reusable printed PVC table cover. Wipe the surface clean between uses.','https://pk-live-21.slatic.net/kf/S1d023c6910574d7fbb7bb566f4a81bb9c.jpg',array['https://pk-live-21.slatic.net/kf/S1d023c6910574d7fbb7bb566f4a81bb9c.jpg','https://pk-live-21.slatic.net/kf/S93b4e31ed56b4931bc99bde6996d0758S.jpg','https://pk-live-21.slatic.net/kf/Sbf80e79a87e24c56b6fae5a75c37edaeV.jpg','https://pk-live-21.slatic.net/kf/Sd8c9abec41c04746ad845e72119dc278w.jpg'],array['Multi-design, multi-color PVC','36 × 57 inches or 36 × 60 inches'],699,0,true,true);
commit;
