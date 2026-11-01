import { test } from "node:test";
import assert from "node:assert/strict";
import {
  defaultSheetConfig,
  quoteSheets,
  roomSheets,
  validateSheetConfig,
  repriceSheetCart,
} from "../src/lib/wallpaper-sheets.ts";

test("sheet pricing applies editable tiers and floor without stacking discounts", () => {
  const c = {
    ...defaultSheetConfig(1600),
    tiers: [
      { quantity: 3, percent: 10 },
      { quantity: 5, percent: 30 },
    ],
  };
  assert.equal(quoteSheets(c, 10, 1).total, 1600);
  assert.equal(quoteSheets(c, 10, 3).total, 4320);
  assert.equal(quoteSheets(c, 10, 5).unit, 1200);
  assert.equal(quoteSheets({ ...c, promo10: 1300 }, 10, 5).unit, 1200);
  assert.throws(() => quoteSheets(c, 60, 1));
  assert.throws(() => quoteSheets(c, 12, 1));
  assert.throws(() => quoteSheets(c, 10, 0));
});
test("full room rounds strips separately for each wall and accounts for roll cutting", () => {
  const r = roomSheets([11, 11, 9, 9], 10, 10);
  assert.equal(r.strips, 10);
  assert.equal(r.runningFeet, 100);
  assert.equal(r.rolls, 2);
  assert.equal(roomSheets([15], 40, 40).rolls, 3);
});
test("config validation rejects invalid discounts and quantities", () => {
  assert.throws(() => validateSheetConfig({ ...defaultSheetConfig(1600), floor10: 1800 }));
  assert.throws(() =>
    validateSheetConfig({ ...defaultSheetConfig(1600), tiers: [{ quantity: 2, percent: -1 }] }),
  );
  assert.throws(() => quoteSheets({ ...defaultSheetConfig(1600), stock10: 2 }, 10, 3));
});
test("cart quantity changes and mixed cuts use product-level discounts", () => {
  const config = {
    ...defaultSheetConfig(1600),
    price12: 1920,
    enabled12: true,
    tiers: [{ quantity: 3, percent: 10 }],
  };
  const items = [
    { id: "a::10", baseId: "a", qty: 2, price: 1600, wallpaperSheet: { length: 10, config } },
    { id: "a::12", baseId: "a", qty: 1, price: 1920, wallpaperSheet: { length: 12, config } },
  ];
  const priced = repriceSheetCart(items);
  assert.equal(priced[0].price, 1440);
  assert.equal(priced[1].price, 1728);
  assert.equal(repriceSheetCart([items[0]])[0].price, 1600);
});
