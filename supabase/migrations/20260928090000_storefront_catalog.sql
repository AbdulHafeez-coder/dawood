-- Target: jowinhlsiofthbrtjind only. Additive catalog metadata; never deletes products/categories.
BEGIN;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'on_demand';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS storefront_category text NOT NULL DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS subcategory text;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_status_allowed' AND conrelid = 'public.products'::regclass) THEN
    ALTER TABLE public.products ADD CONSTRAINT products_status_allowed CHECK (status IN ('available','on_demand','sold_out','coming_soon','discontinued'));
  END IF;
END $$;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS availability_rank integer GENERATED ALWAYS AS
  (CASE status WHEN 'available' THEN 0 WHEN 'on_demand' THEN 1 WHEN 'sold_out' THEN 2 WHEN 'coming_soon' THEN 3 ELSE 4 END) STORED;
-- Database classifier also covers future imports. Explicit admin overrides remain authoritative.
CREATE OR REPLACE FUNCTION public.catalog_category(product_name text, legacy_category text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
 SELECT CASE
  WHEN legacy_category IN ('Sheets','Crockery','Towels','Home Essentials') THEN legacy_category
  WHEN product_name ~* '\m(towels?|bath sheets?)\M' THEN 'Towels'
  WHEN legacy_category ~* 'sheet house|home sheets|wallpaper|textiles|linens' OR product_name ~* '\msheets?\M|wallpaper|dastarkhwan|dastarkhan|دسترخوان|table[ -]?(cloth|cover|runner|mat)|placemat' THEN 'Sheets'
  WHEN legacy_category ~* 'crockery|glassware|kitchen|drinkware|dinnerware|cookware' OR product_name ~* '\m(cups?|mugs?|glasses|glass|bowls?|plates?|dishes|dinner|spoons?|forks?|knives|jugs?|jars?|bottles?|trays?|pans?|pots?|kettles?|teapots?|tumblers?|flasks?|lunch|cutlery|serving|spice|strainer|casserole)\M' THEN 'Crockery'
  ELSE 'Home Essentials' END;
$$;
UPDATE public.products SET storefront_category = public.catalog_category(name,category) WHERE storefront_category = '';
UPDATE public.products SET subcategory = CASE WHEN name ~* 'wallpaper|\mwall\M|sticker' THEN 'Wallpaper Sheets' WHEN name ~* 'table|dast|دسترخوان|placemat' THEN 'Table Sheets' ELSE '' END WHERE storefront_category='Sheets' AND subcategory IS NULL;
UPDATE public.products SET subcategory='' WHERE subcategory IS NULL;
CREATE OR REPLACE FUNCTION public.fill_catalog_category() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NEW.storefront_category = '' OR NEW.storefront_category IS NULL THEN NEW.storefront_category := public.catalog_category(NEW.name,NEW.category); END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS products_catalog_category ON public.products;
CREATE TRIGGER products_catalog_category BEFORE INSERT OR UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.fill_catalog_category();
CREATE INDEX IF NOT EXISTS products_storefront_page_idx ON public.products(storefront_category,availability_rank,created_at DESC,id);
CREATE INDEX IF NOT EXISTS products_availability_page_idx ON public.products(availability_rank,created_at DESC,id);
-- Restrictive policy also protects deployments containing other permissive SELECT policies.
DROP POLICY IF EXISTS "hide discontinued catalog" ON public.products;
CREATE POLICY "hide discontinued catalog" ON public.products AS RESTRICTIVE FOR SELECT TO anon,authenticated
 USING(status <> 'discontinued' OR public.has_role(auth.uid(),'admin'));
COMMIT;
