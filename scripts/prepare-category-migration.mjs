throw new Error(
  "This legacy migration is superseded by 20260928090000_storefront_catalog.sql. Do not run it.",
);
// Node 24+. Generates files only; never connects to or mutates a database.
import fs from "node:fs";
import path from "node:path";
import { classifyCategory, getSheetType } from "../src/lib/categories.ts";

const inventory = JSON.parse(fs.readFileSync(process.argv[2], "utf8").replace(/^\uFEFF/, ""));
if (inventory.project !== "jowinhlsiofthbrtjind") throw new Error("Unexpected Supabase project");
if (
  inventory.products.length !== 702 ||
  new Set(inventory.products.map((p) => p.id)).size !== 702
) {
  throw new Error("Expected the reviewed inventory of 702 unique products");
}
const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;
const mapping = inventory.products.map((p) => ({
  id: p.id,
  name: p.name,
  oldCategory: p.category,
  category: classifyCategory(p),
  sheetType: getSheetType(p),
}));
const values = mapping
  .map((p) => `(${quote(p.id)}, ${quote(p.name)}, ${quote(p.oldCategory)}, ${quote(p.category)})`)
  .join(",\n");
const sql = `-- Target: jowinhlsiofthbrtjind only. Reviewed: 702 products.
-- Run as database owner. No product rows are deleted.
-- Backups are private. Abort on inventory drift instead of guessing.
BEGIN;
LOCK TABLE public.products, public.categories, public.promotions IN SHARE ROW EXCLUSIVE MODE;
CREATE TEMP TABLE category_plan (id text PRIMARY KEY, name text, old_category text, new_category text) ON COMMIT DROP;
INSERT INTO category_plan VALUES
${values};
DO $$ BEGIN
  IF (SELECT count(*) FROM public.products) <> 702 OR EXISTS (
    SELECT 1 FROM category_plan m LEFT JOIN public.products p ON p.id = m.id
    WHERE p.id IS NULL OR p.name IS DISTINCT FROM m.name
      OR p.category NOT IN (m.old_category, m.new_category)
  ) THEN RAISE EXCEPTION 'Inventory changed. Refresh and review category mapping before migration.'; END IF;
END $$;
CREATE SCHEMA IF NOT EXISTS category_reorg_backup;
REVOKE ALL ON SCHEMA category_reorg_backup FROM PUBLIC, anon, authenticated;
CREATE TABLE IF NOT EXISTS category_reorg_backup.categories_20260926 AS SELECT * FROM public.categories;
CREATE TABLE IF NOT EXISTS category_reorg_backup.products_20260926 AS SELECT id, old_category, new_category FROM category_plan;
CREATE TABLE IF NOT EXISTS category_reorg_backup.promotions_20260926 AS SELECT id, link_category FROM public.promotions;
REVOKE ALL ON ALL TABLES IN SCHEMA category_reorg_backup FROM PUBLIC, anon, authenticated;
INSERT INTO public.categories(name, image_url, sort_order) VALUES
  ('Sheet House', '', 0), ('Towels', '', 1), ('Crockery', '', 2)
ON CONFLICT(name) DO UPDATE SET sort_order = EXCLUDED.sort_order;
UPDATE public.products p SET category = m.new_category FROM category_plan m
WHERE p.id = m.id AND p.category IS DISTINCT FROM m.new_category;
UPDATE public.promotions SET link_category = CASE
  WHEN lower(link_category) = 'towels' THEN 'Towels'
  WHEN lower(link_category) IN ('sheet house', 'home sheets & covers', 'wallpaper', 'textiles', 'linens') THEN 'Sheet House'
  ELSE 'Crockery' END
WHERE coalesce(link_category, '') <> '';
-- Contract only after all products have moved; never cascade-delete products.
DELETE FROM public.categories c
WHERE c.name NOT IN ('Sheet House', 'Towels', 'Crockery')
AND NOT EXISTS (SELECT 1 FROM public.products p WHERE p.category = c.name);
DO $$ BEGIN
  IF (SELECT count(*) FROM public.products) <> 702
    OR (SELECT count(*) FROM public.categories) <> 3
    OR EXISTS (SELECT 1 FROM public.products p JOIN category_plan m ON p.id = m.id WHERE p.category <> m.new_category)
  THEN RAISE EXCEPTION 'Category migration verification failed'; END IF;
END $$;
COMMIT;
SELECT category, count(*) FROM public.products GROUP BY category ORDER BY category;
`;
const rollback = `-- Run on jowinhlsiofthbrtjind only, as database owner.
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
`;
fs.mkdirSync("db/rollback", { recursive: true });
fs.mkdirSync("docs/category-reorganization", { recursive: true });
fs.writeFileSync("supabase/migrations/20260926090000_three_shop_categories.sql", sql);
fs.writeFileSync("db/rollback/20260926090000_three_shop_categories.sql", rollback);
fs.writeFileSync(
  "docs/category-reorganization/product-mapping.json",
  JSON.stringify(mapping, null, 2) + "\n",
);
console.log(
  mapping.reduce((counts, p) => ({ ...counts, [p.category]: (counts[p.category] ?? 0) + 1 }), {}),
);
