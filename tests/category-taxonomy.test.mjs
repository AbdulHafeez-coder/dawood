import test from "node:test";
import assert from "node:assert/strict";
import { findTaxonomy } from "../src/lib/category-taxonomy.js";

test("maps verified Sheets products without classifying ambiguous sheet products", () => {
  assert.equal(findTaxonomy("Sheets").matches({ id: "prod-c5fd53b3", category: "Home Sheets & Covers", name: "Side Table Sheets" }), true);
  assert.equal(findTaxonomy("Sheets").matches({ id: "prod-154a2dea", category: "Home Sheets & Covers", name: "Table Sheets" }), false);
});

test("keeps Kitchen Towels and absent categories outside taxonomy", () => {
  assert.equal(findTaxonomy("Towels").matches({ id: "prod-f955056e", category: "Towels", name: "Kitchen Towels" }), false);
  assert.equal(findTaxonomy("Dastarkhwan Sheets"), undefined);
});
