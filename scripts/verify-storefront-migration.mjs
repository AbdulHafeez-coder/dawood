import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
const { PGlite } = await import(pathToFileURL(process.argv[2]).href);
const db = new PGlite();
await db.exec(
  `CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA auth; CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT NULL::uuid $$; CREATE FUNCTION public.has_role(uuid,text) RETURNS boolean LANGUAGE sql AS $$ SELECT false $$; CREATE TABLE public.products(id text PRIMARY KEY,name text,category text,price numeric,created_at timestamptz DEFAULT now());`,
);
const inventory = JSON.parse(await readFile("../category-inventory.json", "utf8"));
for (const p of inventory.products)
  await db.query("INSERT INTO products(id,name,category,price) VALUES($1,$2,$3,1234)", [
    p.id,
    p.name,
    p.category,
  ]);
const before = await db.query("SELECT id,name,category,price FROM products ORDER BY id");
const sql = await readFile("supabase/migrations/20260928090000_storefront_catalog.sql", "utf8");
await db.exec(sql);
await db.exec(sql);
assert.deepEqual(
  (await db.query("SELECT id,name,category,price FROM products ORDER BY id")).rows,
  before.rows,
);
assert.equal(
  (await db.query("SELECT count(*)::int n FROM products WHERE status='on_demand'")).rows[0].n,
  702,
);
await db.exec(
  "UPDATE products SET status='available',storefront_category='Sheets',subcategory='' WHERE id=(SELECT id FROM products LIMIT 1)",
);
await db.exec(sql);
assert.equal(
  (await db.query("SELECT count(*)::int n FROM products WHERE availability_rank=0")).rows[0].n,
  1,
);
await assert.rejects(() => db.exec("UPDATE products SET status='fake'"));
console.log(
  "PASS: 702 products preserved, old categories unchanged, retry safe, admin availability retained, invalid status rejected.",
);
console.log(
  (
    await db.query(
      "SELECT storefront_category,count(*)::int AS count FROM products GROUP BY 1 ORDER BY 1",
    )
  ).rows,
);
await db.close();
