import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { fetchCatalog, fetchProduct } from "../../src/lib/catalog-api.ts";
const row = {
  id: "prod-25",
  name: "Glass mug",
  category: "Crockery",
  storefront_category: "Crockery",
  price: 500,
  status: "available",
  slug: "glass-mug",
};
function client(handler: (url: URL) => Response) {
  return createClient("https://example.supabase.co", "test-key", {
    auth: { persistSession: false },
    global: { fetch: async (input) => handler(new URL(String(input))) },
  });
}
test("catalog filters legacy rows before paging and uses current real prices", async () => {
  const rows = Array.from({ length: 25 }, (_, i) => ({ ...row, id: "prod-" + i }));
  const result = await fetchCatalog(
    client(() => Response.json(rows)),
    { page: 1, category: "Crockery", status: "available", search: "mug", maxPrice: 1000 },
  );
  assert.equal(result.total, 25);
  assert.equal(result.products.length, 1);
  assert.equal(result.products[0].price, 500);
});
test("database errors are surfaced, never replaced by demo products", async () => {
  await assert.rejects(
    () =>
      fetchCatalog(
        client(
          () =>
            new Response(JSON.stringify({ message: "network denied", code: "500" }), {
              status: 500,
              headers: { "content-type": "application/json" },
            }),
        ),
      ),
    /Unable to load/,
  );
});
test("detail looks up slug directly and hides discontinued records", async () => {
  const calls: string[] = [];
  const c = client((url) => {
    calls.push(url.search);
    return new Response(JSON.stringify(url.searchParams.has("slug") ? row : null), {
      headers: { "content-type": "application/json" },
    });
  });
  const result = await fetchProduct(c, "glass-mug");
  assert.equal(result?.id, "prod-25");
  assert.equal(calls.length, 2);
  const hidden = await fetchProduct(
    client(
      () =>
        new Response(JSON.stringify({ ...row, status: "discontinued" }), {
          headers: { "content-type": "application/json" },
        }),
    ),
    "prod-25",
  );
  assert.equal(hidden, undefined);
});
