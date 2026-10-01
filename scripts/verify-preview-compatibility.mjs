import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { saveCatalogProduct } from "../src/lib/catalog-writes.ts";
import { fetchProduct, fetchCatalog, invalidateCatalog } from "../src/lib/catalog-api.ts";
import { mapCatalogProduct } from "../src/lib/catalog-model.ts";
import { isApolloProduct } from "../src/lib/catalog-metadata.ts";
const { PGlite } = await import(pathToFileURL(process.argv[2]).href);
const rows = JSON.parse(await fs.readFile("scratch/catalog-baseline.json", "utf8"));
const directory = await fs.mkdtemp(path.resolve("scratch/preview-db-"));
let db = new PGlite(directory);
await db.exec(
  `CREATE TABLE products(id text PRIMARY KEY,name text NOT NULL,tag text,price numeric,rating numeric,img text,bg text,category text,tagline text,description text,details text[],gallery text[],created_at timestamptz,slug text,seo_title text,seo_description text);`,
);
await db.query(
  "INSERT INTO products SELECT * FROM json_populate_recordset(NULL::products,$1::json)",
  [JSON.stringify(rows)],
);
const before = (await db.query("SELECT * FROM products ORDER BY id")).rows;
// Exercise the actual Supabase writer/reader against a local PostgreSQL engine.
// The adapter is test-only; it is not a hosted Supabase/RLS verification.
const client = createClient("http://127.0.0.1:54999", "local-validation", {
  auth: { persistSession: false },
  global: {
    fetch: async (input, init) => {
      const url = new URL(String(input));
      assert.ok(url.pathname.endsWith("/products"));
      const id = url.searchParams.get("id")?.slice(3);
      const slug = url.searchParams.get("slug")?.slice(3);
      if (init?.method === "PATCH") {
        const patch = JSON.parse(String(init.body));
        const keys = Object.keys(patch);
        assert.ok(keys.every((k) => Object.keys(before[0]).includes(k)));
        const result = await db.query(
          `UPDATE products SET ${keys.map((k, i) => '"' + k + '"=$' + (i + 1)).join(",")} WHERE id=$${keys.length + 1} RETURNING *`,
          [...keys.map((k) => patch[k]), id],
        );
        return Response.json(result.rows[0] || null);
      }
      assert.ok(!init?.method || init.method === "GET");
      if (id || slug)
        return Response.json(
          (await db.query(`SELECT * FROM products WHERE ${id ? "id" : "slug"}=$1`, [id || slug]))
            .rows[0] || null,
        );
      return Response.json(
        (
          await db.query("SELECT * FROM products ORDER BY created_at DESC,id LIMIT $1 OFFSET $2", [
            Number(url.searchParams.get("limit") || 100),
            Number(url.searchParams.get("offset") || 0),
          ])
        ).rows,
      );
    },
  },
});
const initial = await fetchCatalog(client);
assert.equal(initial.total, 368);
const apollo = rows.find((p) => isApolloProduct(p));
assert.equal(await fetchProduct(client, apollo.id), undefined);
let result = await saveCatalogProduct(
  client,
  {
    id: apollo.id,
    name: apollo.name,
    category: apollo.category,
    status: "available",
    storefront_category: "Crockery",
    subcategory: "Other Crockery",
    price: apollo.price + 1,
    is_visible: true,
  },
  true,
);
assert.equal(result.error, null);
await db.close();
db = new PGlite(directory);
assert.equal((await fetchProduct(client, apollo.id)).status, "available");
assert.equal((await fetchProduct(client, apollo.id)).price, apollo.price + 1);
invalidateCatalog(client);
assert.equal((await fetchCatalog(client)).total, 369);
result = await saveCatalogProduct(
  client,
  {
    id: apollo.id,
    name: apollo.name,
    category: apollo.category,
    status: "available",
    is_visible: false,
  },
  true,
);
assert.equal(result.error, null);
assert.equal(await fetchProduct(client, apollo.id), undefined);
const regular = rows.find((p) => mapCatalogProduct(p).category === "Towels");
for (const status of ["sold_out", "coming_soon", "available"]) {
  result = await saveCatalogProduct(
    client,
    { id: regular.id, name: regular.name, category: regular.category, status, is_visible: true },
    true,
  );
  assert.equal(result.error, null);
  assert.equal((await fetchProduct(client, regular.id)).status, status);
}
const after = (await db.query("SELECT * FROM products ORDER BY id")).rows;
assert.equal(after.length, 702);
assert.equal(after.filter(isApolloProduct).length, 334);
for (let i = 0; i < before.length; i++) {
  for (const key of Object.keys(before[i])) {
    if ([apollo.id, regular.id].includes(before[i].id) && ["details", "price"].includes(key))
      continue;
    assert.deepEqual(after[i][key], before[i][key], `${before[i].id}: ${key} changed`);
  }
  for (const detail of before[i].details) assert.ok(after[i].details.includes(detail));
}
await db.close();
console.log(
  JSON.stringify({
    passed: true,
    products: 702,
    apollo: 334,
    visibleBefore: 368,
    visibleAfterApolloRelease: 369,
    persistence: "verified after database close/reopen",
    preserved:
      "all IDs, names, original categories, brands, images, galleries and existing details",
    scope: "local real-catalog PostgreSQL copy; hosted admin/RLS not verified",
  }),
);
