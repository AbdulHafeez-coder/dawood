import assert from "node:assert/strict";
import test from "node:test";
import { classifyCategory, getSheetType } from "../../src/lib/categories.ts";
test("sheet, towel, crockery and other household products stay distinct", () => {
  for (const [name, category, expected] of [
    ["Dining Table Sheet", "Plastic Items", "Sheets"],
    ["Bath Sheet", "Textiles", "Towels"],
    ["Glass Cups", "Old Brand", "Crockery"],
    ["Wall Clock", "Clocks", "Home Essentials"],
    ["Kids Chair", "Furniture", "Home Essentials"],
  ])
    assert.equal(classifyCategory({ name, category }), expected);
});
test("explicit admin categories are respected", () => {
  assert.equal(
    classifyCategory({ name: "Glass vase", category: "Home Essentials" }),
    "Home Essentials",
  );
});
test("table and wallpaper sheets stay separate", () => {
  assert.equal(getSheetType({ name: "Wall Sheet", category: "Sheets" }), "Wallpaper Sheets");
  assert.equal(getSheetType({ name: "Dining Table Sheet", category: "Sheets" }), "Table Sheets");
  assert.equal(getSheetType({ name: "Bath Sheet", category: "Towels" }), null);
});
