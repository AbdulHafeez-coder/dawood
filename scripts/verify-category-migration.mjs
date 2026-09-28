throw new Error(
  "This legacy migration is superseded by 20260928090000_storefront_catalog.sql. Do not run it.",
);
// Run with Node 24+ and an isolated installation of @electric-sql/pglite.
// Optional first argument: path to that package's dist/index.js.
import assert from "node:assert/strict";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
const { PGlite } = await import(
  process.argv[2] ? pathToFileURL(process.argv[2]).href : "@electric-sql/pglite"
);
const db = new PGlite();
const plan = JSON.parse(
  fs.readFileSync("docs/category-reorganization/product-mapping.json", "utf8"),
);
const migration = fs.readFileSync(
  "supabase/migrations/20260926090000_three_shop_categories.sql",
  "utf8",
);
const rollback = fs.readFileSync("db/rollback/20260926090000_three_shop_categories.sql", "utf8");
const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;
await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated;
CREATE TABLE categories(name text PRIMARY KEY, created_at timestamptz DEFAULT now(), image_url text DEFAULT '', sort_order integer DEFAULT 0);
CREATE TABLE products(id text PRIMARY KEY, name text, category text REFERENCES categories(name) ON UPDATE CASCADE ON DELETE CASCADE, untouched text DEFAULT 'preserve me');
CREATE TABLE promotions(id text PRIMARY KEY, link_category text);
INSERT INTO categories(name) VALUES ${[...new Set(plan.map((p) => p.oldCategory)), "Empty original category"].map((c) => `(${quote(c)})`).join(",")};
INSERT INTO products(id,name,category) VALUES ${plan.map((p) => `(${quote(p.id)},${quote(p.name)},${quote(p.oldCategory)})`).join(",")};
INSERT INTO promotions VALUES ('old', 'Wallpaper'), ('all', '');`);
const snapshot = async () => (await db.query("SELECT * FROM products ORDER BY id")).rows;
const before = await snapshot();
const categoriesBefore = (await db.query("SELECT * FROM categories ORDER BY name")).rows;
await db.exec(migration);
assert.deepEqual(
  (
    await db.query(
      "SELECT category, count(*)::int AS count FROM products GROUP BY category ORDER BY category",
    )
  ).rows,
  [
    { category: "Crockery", count: 603 },
    { category: "Sheet House", count: 91 },
    { category: "Towels", count: 8 },
  ],
);
assert.equal((await snapshot()).length, 702);
assert.ok((await snapshot()).every((p) => p.untouched === "preserve me"));
assert.equal((await db.query("SELECT count(*)::int AS n FROM categories")).rows[0].n, 3);
await db.exec(migration);
assert.equal((await snapshot()).length, 702, "Retry must not delete or duplicate products");
await db.exec(rollback);
assert.deepEqual(await snapshot(), before, "Rollback must restore every original association");
assert.deepEqual((await db.query("SELECT * FROM categories ORDER BY name")).rows, categoriesBefore);
assert.equal(
  (await db.query("SELECT link_category FROM promotions WHERE id='old'")).rows[0].link_category,
  "Wallpaper",
);
await db.exec(
  "INSERT INTO products(id,name,category) SELECT 'new-product','New product',name FROM categories LIMIT 1",
);
await assert.rejects(db.exec(migration), /Inventory changed/);
await db.exec("ROLLBACK");
assert.equal((await snapshot()).length, 703, "Drift must abort without deleting anything");
await db.close();
console.log(
  "PASS: 702 products preserved; three categories; safe retry; complete rollback; inventory drift rejected.",
);
