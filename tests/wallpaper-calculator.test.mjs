import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateWallpaper, estimateWallpaper } from "../src/lib/wallpaper-calculator.ts";

test("requested wall examples keep fixed five-foot strips", () => {
  for (const [width, height, strips, runningFeet] of [
    [10, 10, 2, 20],
    [14, 10, 3, 30],
    [15, 12, 3, 36],
  ]) {
    const r = calculateWallpaper(width, height, height);
    assert.equal(r.strips, strips);
    assert.equal(r.runningFeet, runningFeet);
  }
});
test("cutting feasibility requires whole strips from each source roll", () => {
  const r = calculateWallpaper(15, 40, 40);
  assert.equal(r.rolls, 3);
  assert.equal(r.stripsPerRoll, 1);
  assert.equal(r.runningFeet, 120);
  assert.equal(r.offcutFeet, 60);
  assert.equal(calculateWallpaper(15, 30, 30).rolls, 2);
  assert.equal(calculateWallpaper(5, 60, 60).rolls, 1);
});
test("ready cuts warn about insufficient height; invalid measurements fail", () => {
  assert.equal(calculateWallpaper(10, 14, 12).short, true);
  assert.equal(calculateWallpaper(10, 10, 12).runningFeet, 24);
  assert.equal(calculateWallpaper(5.01, 12.5, 12.5).strips, 2);
  for (const n of [0, -1, NaN, Infinity, 60.01]) assert.throws(() => calculateWallpaper(10, n, n));
  assert.throws(() => calculateWallpaper(0, 10, 10));
});
test("pricing needs an explicit rate or exact cut price; never guesses price units", () => {
  const r = calculateWallpaper(14, 10, 10);
  assert.equal(estimateWallpaper(r, {}), null);
  assert.equal(estimateWallpaper(r, { rate: 100 }), 3000);
  assert.equal(estimateWallpaper(r, { cutPrices: { 10: 900 } }), 2700);
  assert.equal(estimateWallpaper(r, { cutPrices: { 12: 900 } }), null);
});
