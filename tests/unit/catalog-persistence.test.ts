import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { saveCatalogProduct } from "../../src/lib/catalog-writes.ts";
import { mapCatalogProduct } from "../../src/lib/catalog-model.ts";

test("legacy database save round-trips status and visibility while preserving brand and original category", async () => {
  let stored = {
    id: "appollo-1",
    name: "Tea Mug",
    category: "Tea Mugs",
    price: 500,
    details: ["brand:Appollo", "source:appollo"],
    img: "original.jpg",
    gallery: ["original.jpg"],
  };
  const c = createClient("https://preview.supabase.co", "public-test", {
    auth: { persistSession: false },
    global: {
      fetch: async (input, init) => {
        const url = new URL(String(input));
        if (!url.pathname.endsWith("products"))
          throw new Error("An edit must not create or overwrite categories");
        if ((init?.method || "GET") === "PATCH") {
          const payload = JSON.parse(String(init?.body));
          for (const column of ["status", "storefront_category", "subcategory", "is_visible"]) {
            if (column in payload)
              return Response.json(
                { code: "PGRST204", message: "Column missing" },
                { status: 400 },
              );
          }
          stored = { ...stored, ...payload };
        }
        return Response.json(stored);
      },
    },
  });
  const result = await saveCatalogProduct(
    c,
    {
      id: "appollo-1",
      name: "Tea Mug",
      category: "Tea Mugs",
      price: 525,
      status: "available",
      storefront_category: "Crockery",
      subcategory: "Cups / Mugs",
      is_visible: true,
    },
    true,
  );
  assert.equal(result.error, null);
  assert.equal(stored.category, "Tea Mugs");
  assert.equal(stored.img, "original.jpg");
  assert.ok(stored.details.includes("brand:Appollo"));
  const reloaded = mapCatalogProduct(stored);
  assert.equal(reloaded.status, "available");
  assert.equal(reloaded.price, 525);
  assert.equal(reloaded.subCategory, "Cups / Mugs");
  assert.equal(reloaded.visible, true);
});
test("zero-row updates are errors, not successful saves", async () => {
  const c = createClient("https://preview.supabase.co", "public-test", {
    auth: { persistSession: false },
    global: { fetch: async () => Response.json(null) },
  });
  const result = await saveCatalogProduct(
    c,
    { id: "missing", name: "Missing", category: "Crockery" },
    true,
  );
  assert.ok(result.error);
});
