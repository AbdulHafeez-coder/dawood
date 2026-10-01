import assert from "node:assert/strict";
import test from "node:test";
import { createClient } from "@supabase/supabase-js";
import { saveCatalogProduct } from "../../src/lib/catalog-writes.ts";
function fixture(deny = false) {
  const categories = new Set<string>(["Cups & Drinkware"]);
  const products = new Map<string, Record<string, unknown>>();
  const client = createClient("https://catalog-test.supabase.co", "test-key", {
    auth: { persistSession: false },
    global: {
      fetch: async (input, init) => {
        const url = new URL(String(input));
        const table = url.pathname.split("/").pop();
        const id = url.searchParams.get("id")?.replace(/^eq\./, "");
        if ((init?.method || "GET") === "GET") return Response.json(products.get(id || "") || null);
        if (deny) return Response.json({ message: "Write denied", code: "42501" }, { status: 403 });
        const row = JSON.parse(String(init?.body));
        if (table === "categories") {
          categories.add(row.name);
          return new Response(null, { status: 201 });
        }
        if (!categories.has(row.category))
          return Response.json({ message: "Missing category", code: "23503" }, { status: 409 });
        const next = { ...products.get(row.id), ...row };
        products.set(row.id, next);
        return Response.json(next);
      },
    },
  });
  return { client, products };
}
test("new products create their category only when needed", async () => {
  const { client, products } = fixture();
  const result = await saveCatalogProduct(client, {
    id: "new",
    name: "Table Sheet",
    category: "Sheets",
  });
  assert.equal(result.error, null);
  assert.equal(products.get("new")?.category, "Sheets");
});
test("category mapping edits preserve the historical category", async () => {
  const { client, products } = fixture();
  products.set("existing", {
    id: "existing",
    name: "Cup",
    category: "Cups & Drinkware",
    details: [],
  });
  const result = await saveCatalogProduct(
    client,
    { id: "existing", name: "Cup", category: "Crockery", storefront_category: "Crockery" },
    true,
  );
  assert.equal(result.error, null);
  assert.equal(products.get("existing")?.category, "Cups & Drinkware");
});
test("permission errors preserve the existing product and are returned", async () => {
  const { client, products } = fixture(true);
  products.set("existing", {
    id: "existing",
    name: "Cup",
    category: "Cups & Drinkware",
    details: [],
  });
  const result = await saveCatalogProduct(
    client,
    { id: "existing", name: "Cup", category: "Crockery" },
    true,
  );
  assert.equal(result.error?.code, "42501");
  assert.equal(products.get("existing")?.category, "Cups & Drinkware");
});
