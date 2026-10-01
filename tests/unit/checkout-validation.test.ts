import assert from "node:assert/strict";
import test from "node:test";
import { validateCheckoutItems, persistConfirmedOrder } from "../../src/lib/checkout-validation.ts";

const cart = [{ id: "one", name: "Cup", price: 100, qty: 2 }];
test("hidden in-stock products cannot be checked out", () => {
  assert.throws(
    () =>
      validateCheckoutItems(cart, [{ id: "one", price: 100, status: "available", visible: false }]),
    /not available/,
  );
});
test("only available products with current prices can be ordered", () => {
  assert.doesNotThrow(() =>
    validateCheckoutItems(cart, [{ id: "one", price: 100, status: "available" }]),
  );
  for (const status of [undefined, "on_demand", "discontinued", "unexpected"]) {
    assert.throws(
      () => validateCheckoutItems(cart, [{ id: "one", price: 100, status }]),
      /not available/,
    );
  }
  assert.throws(() => validateCheckoutItems(cart, []), /no longer/);
  assert.throws(
    () => validateCheckoutItems(cart, [{ id: "one", price: 120, status: "available" }]),
    /price has changed/,
  );
  assert.throws(
    () =>
      validateCheckoutItems(
        [{ ...cart[0], qty: 0 }],
        [{ id: "one", price: 100, status: "available" }],
      ),
    /quantity/,
  );
});

test("failed database insert never publishes local success", async () => {
  let published = false;
  await assert.rejects(
    persistConfirmedOrder(
      async () => {
        throw new Error("denied");
      },
      () => {
        published = true;
      },
    ),
    /denied/,
  );
  assert.equal(published, false);
});

test("local success waits for database acknowledgment", async () => {
  let release!: () => void;
  let published = false;
  const pending = persistConfirmedOrder(
    () =>
      new Promise<void>((resolve) => {
        release = resolve;
      }),
    () => {
      published = true;
    },
  );
  assert.equal(published, false);
  release();
  await pending;
  assert.equal(published, true);
});
