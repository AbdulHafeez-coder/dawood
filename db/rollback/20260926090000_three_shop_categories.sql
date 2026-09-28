-- Run on jowinhlsiofthbrtjind only, as database owner.
-- Restore category associations and category metadata; product contents remain untouched.
BEGIN;
LOCK TABLE public.products, public.categories, public.promotions IN SHARE ROW EXCLUSIVE MODE;
DO $$ BEGIN
  IF (SELECT count(*) FROM public.products) <> 702 OR EXISTS (
    SELECT 1 FROM category_reorg_backup.products_20260926 b LEFT JOIN public.products p ON p.id = b.id
    WHERE p.id IS NULL OR p.category NOT IN (b.old_category, b.new_category)
  ) THEN RAISE EXCEPTION 'Inventory changed since migration; review rollback manually'; END IF;
END $$;
INSERT INTO public.categories SELECT * FROM category_reorg_backup.categories_20260926
ON CONFLICT(name) DO UPDATE SET image_url = EXCLUDED.image_url, sort_order = EXCLUDED.sort_order;
UPDATE public.products p SET category = b.old_category
FROM category_reorg_backup.products_20260926 b WHERE p.id = b.id;
UPDATE public.promotions p SET link_category = b.link_category
FROM category_reorg_backup.promotions_20260926 b WHERE p.id = b.id;
DELETE FROM public.categories c WHERE NOT EXISTS (
  SELECT 1 FROM category_reorg_backup.categories_20260926 b WHERE b.name = c.name
) AND NOT EXISTS (SELECT 1 FROM public.products p WHERE p.category = c.name);
DO $$ BEGIN
  IF (SELECT count(*) FROM public.products) <> 702
    OR EXISTS (SELECT 1 FROM public.products p JOIN category_reorg_backup.products_20260926 b ON p.id = b.id WHERE p.category <> b.old_category)
  THEN RAISE EXCEPTION 'Rollback verification failed'; END IF;
END $$;
COMMIT;
