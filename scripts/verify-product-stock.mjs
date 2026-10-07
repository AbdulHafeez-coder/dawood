import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { assertPurchasable, canPurchase, saveStock } from "../src/lib/product-availability.ts";
let stock = true,
  missing = false,
  failed = false;
const requests = [];
const client = createClient("https://catalog.test", "test-key", {
  auth: { persistSession: false, autoRefreshToken: false },
  global: {
    fetch: async (url, init) => {
      const q = new URL(url).searchParams;
      requests.push({ q, body: init.body });
      if (failed) return new Response("{}", { status: 500 });
      if (init.method === "PATCH") {
        stock = JSON.parse(init.body).in_stock;
        return Response.json([{ id: "p", in_stock: stock }]);
      }
      const ids = (q.get("id") || "in.(p)").slice(4, -1).split(",");
      return Response.json(missing ? [] : ids.map((id) => ({ id, in_stock: stock })));
    },
  },
});
assert.equal(canPurchase({ is_active: false, in_stock: true }), false);
assert.equal(canPurchase({ is_active: true, in_stock: false }), false);
assert.equal(canPurchase({ is_active: true, in_stock: true }), true);
for (const value of [false, true]) {
  await saveStock(client, "p", value);
  assert.deepEqual(JSON.parse(requests.at(-1).body), { in_stock: value });
  assert.equal(stock, value);
}
await assertPurchasable(
  client,
  Array.from({ length: 49 }, (_, i) => `p${i}`),
);
for (const { q } of requests.slice(-3)) {
  assert.equal(q.get("is_active"), "eq.true");
  assert.equal(q.get("limit"), "24");
  assert.equal(q.get("select"), "id,in_stock");
}
stock = false;
await assert.rejects(assertPurchasable(client, ["p"]), /no longer available/);
stock = true;
missing = true;
await assert.rejects(assertPurchasable(client, ["p"]), /no longer available/);
missing = false;
failed = true;
await assert.rejects(assertPurchasable(client, ["p"]), /Unable to confirm/);
await assert.rejects(assertPurchasable(client, []), /empty/);
console.log(
  "PASS: independent stock-only saves; inactive/out-of-stock/stale basket blocked; database checks batched 24; errors fail closed.",
);
