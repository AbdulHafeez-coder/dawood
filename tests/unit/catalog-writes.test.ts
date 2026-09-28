import assert from "node:assert/strict";
import test from "node:test";
import { createClient } from "@supabase/supabase-js";
import { saveCatalogProduct } from "../../src/lib/catalog-writes.ts";

function fixture(denyCategory = false) {
  const categories = new Set<string>();
  const products = new Map<string, Record<string, unknown>>();
  const client = createClient("https://catalog-test.supabase.co", "sb_publishable_test", {
    auth: { persistSession: false },
    global: {
      fetch: async (url, init) => {
        const table = new URL(String(url)).pathname.split("/").pop();
        const row = JSON.parse(String(init?.body));
        if (table === "categories") {
          if (denyCategory)
            return Response.json({ message: "Category denied", code: "42501" }, { status: 403 });
          categories.add(row.name);
        } else {
          if (!categories.has(row.category))
            return Response.json({ message: "Missing category", code: "23503" }, { status: 409 });
          products.set(row.id, row);
        }
        return new Response(null, { status: 201 });
      },
    },
  });
  return { client, products };
}

test("new products save when their canonical category does not exist yet", async () => {
  const { client, products } = fixture();
  const result = await saveCatalogProduct(client, {
    id: "test-sheet",
    name: "Table Sheet",
    category: "Sheet House",
  });
  assert.equal(result.error, null);
  assert.equal(products.get("test-sheet")?.category, "Sheet House");
});

test("legacy product edits can move into a new canonical category", async () => {
  const { client, products } = fixture();
  products.set("existing", { id: "existing", category: "Cups & Drinkware" });
  const result = await saveCatalogProduct(
    client,
    { id: "existing", name: "Glass Cup", category: "Crockery" },
    true,
  );
  assert.equal(result.error, null);
  assert.equal(products.get("existing")?.category, "Crockery");
});

test("category permission errors preserve the existing product", async () => {
  const { client, products } = fixture(true);
  products.set("existing", { id: "existing", category: "Cups & Drinkware" });
  const result = await saveCatalogProduct(
    client,
    { id: "existing", name: "Glass Cup", category: "Crockery" },
    true,
  );
  assert.equal(result.error?.code, "42501");
  assert.equal(products.get("existing")?.category, "Cups & Drinkware");
});
