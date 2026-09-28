import assert from "node:assert/strict";
import test from "node:test";
import { reconcileCartCatalog } from "../../src/lib/cart-catalog.ts";
test("cart items added while a refresh is pending are untouched", () => {
  const items = [
    { id: "old", price: 80, status: "available" },
    { id: "new", price: 40, status: "available" },
  ];
  const result = reconcileCartCatalog(items as never, ["old"], new Map());
  assert.equal(result[0].status, "discontinued");
  assert.equal(result[1], items[1]);
});
test("fresh database values replace old discounted cart snapshots", () => {
  const items = [{ id: "old", price: 80, original_price: 100, qty: 2, status: "available" }];
  const result = reconcileCartCatalog(
    items as never,
    ["old"],
    new Map([["old", { id: "old", price: 100, status: "available", img: "real.jpg" }]]) as never,
  );
  assert.equal(result[0].price, 100);
  assert.equal(result[0].original_price, undefined);
  assert.equal(result[0].qty, 2);
});
