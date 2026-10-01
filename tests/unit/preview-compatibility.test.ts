import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { mapCatalogProduct } from "../../src/lib/catalog-model.ts";
import { fetchCatalog, fetchProduct } from "../../src/lib/catalog-api.ts";

const apollo = {
  id: "appollo-1",
  name: "Tea Mug",
  category: "Tea Mugs",
  price: 500,
  details: ["brand:Appollo", "source:appollo"],
};
test("legacy Apollo catalog defaults to Coming Soon without deleting original details", () => {
  const p = mapCatalogProduct(apollo);
  assert.equal(p.status, "coming_soon");
  assert.equal(p.brand, "Appollo");
  assert.deepEqual(p.details, apollo.details);
});
test("legacy schema loads real products and excludes unreleased Apollo before pagination", async () => {
  const c = createClient("https://fixture.supabase.co", "public-test", {
    auth: { persistSession: false },
    global: {
      fetch: async (input) => {
        const url = new URL(String(input));
        if (url.searchParams.has("status") || /availability_rank/.test(url.search))
          return Response.json(
            { code: "42703", message: "column does not exist" },
            { status: 400 },
          );
        return Response.json([
          apollo,
          {
            id: "real-sheet",
            name: "Dining Table Sheet",
            category: "Home Sheets & Covers",
            price: 1200,
          },
        ]);
      },
    },
  });
  const result = await fetchCatalog(c, { category: "Sheets" });
  assert.equal(result.total, 1);
  assert.equal(result.products[0].id, "real-sheet");
});
test("direct lookup does not expose unreleased Apollo", async () => {
  const c = createClient("https://fixture.supabase.co", "public-test", {
    auth: { persistSession: false },
    global: { fetch: async () => Response.json(apollo) },
  });
  assert.equal(await fetchProduct(c, apollo.id), undefined);
});
test("sheet mats and fridge stickers do not become wallpaper", () => {
  for (const [name, expected] of [
    ["Fridge Sticker Sheet", "Fridge Mats / Sticker Sheets"],
    ["Dining Table Mats Set of 6", "Table Mats / Dastarkhwan"],
    ["Dining Table Sheet", "Table / Dining Sheets"],
  ]) {
    assert.equal(
      mapCatalogProduct({ id: name, name, category: "Home Sheets & Covers", price: 100 })
        .subCategory,
      expected,
    );
  }
});
