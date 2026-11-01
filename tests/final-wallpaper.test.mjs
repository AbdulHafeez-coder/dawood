import { test } from "node:test";
import assert from "node:assert/strict";
import { computeShipping } from "../src/lib/shipping.ts";
import { defaultSheetConfig, estimateWall } from "../src/lib/wallpaper-sheets.ts";
test("shipping is advance-only at inclusive threshold", () => {
  assert.equal(computeShipping(2999, "advance"), 200);
  assert.equal(computeShipping(3000, "advance"), 0);
  assert.equal(computeShipping(3000, "cod"), 200);
  assert.equal(computeShipping(9000), 200);
  assert.equal(computeShipping(0), 0);
});
test("full walls select smallest configured sufficient sheet", () => {
  const c = {
    ...defaultSheetConfig(),
    enabled11: true,
    price11: 1650,
    enabled12: true,
    price12: 1800,
  };
  const a = estimateWall(c, "full", 14, 10.5);
  assert.equal(a.length, 11);
  assert.equal(a.quantity, 3);
  assert.equal(a.total, 4950);
  assert.equal(estimateWall(c, "full", 15, 12).length, 12);
  assert.throws(() => estimateWall(c, "full", 10, 13));
  assert.throws(() => estimateWall(defaultSheetConfig(), "full", 10, 11));
});
test("half walls use 5ft height and a horizontal cut; unknown rates do not prorate", () => {
  assert.equal(estimateWall(defaultSheetConfig(), "half", 10, 5).quantity, 1);
  assert.throws(() => estimateWall(defaultSheetConfig(), "half", 14, 5));
  const r = estimateWall({ ...defaultSheetConfig(), custom: true, customRate: 150 }, "half", 14, 5);
  assert.equal(r.length, 14);
  assert.equal(r.total, 2100);
  assert.throws(() => estimateWall(defaultSheetConfig(), "half", 9, 5));
});
