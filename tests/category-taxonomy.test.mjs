import test from "node:test";
import assert from "node:assert/strict";
import { findTaxonomy } from "../src/lib/category-taxonomy.js";

test("maps verified Sheets products without classifying ambiguous sheet products", () => {
  assert.equal(findTaxonomy("Sheets").matches({ id: "prod-c5fd53b3", category: "Home Sheets & Covers", name: "Side Table Sheets" }), true);
  assert.equal(findTaxonomy("Sheets").matches({ id: "prod-154a2dea", category: "Home Sheets & Covers", name: "Table Sheets" }), false);
});

test("keeps Kitchen Towels and absent categories outside taxonomy", () => {
  assert.equal(findTaxonomy("Towels").matches({ id: "prod-f955056e", category: "Towels", name: "Kitchen Towels" }), false);
  assert.equal(findTaxonomy("Dastarkhwan Sheets").matches({ category: "Sheets", tagline: "Dastarkhwan Sheets" }), true);
});

test("separates drinkware, tools and electrical appliances", () => {
  const mug = { id: "mug", category: "Tea Mugs", name: "Glass Coffee Mug" };
  const glasses = { id: "glasses", category: "Drinkware", name: "Water Glass Set Glass Tumbler 6 Pcs" };
  const kettle = { id: "kettle", category: "Electronics & Gadgets", name: "Electric Kettle" };
  assert.equal(findTaxonomy("Cups & Mugs").matches(mug), true);
  assert.equal(findTaxonomy("Glasses").matches(mug), false);
  assert.equal(findTaxonomy("Glasses").matches(glasses), true);
  assert.equal(findTaxonomy("Cups & Mugs").matches(glasses), false);
  assert.equal(findTaxonomy("Electric Kettles").matches(kettle), true);
  assert.equal(findTaxonomy("Kitchen Gadgets").matches(kettle), false);
  assert.equal(findTaxonomy("Kitchen Tools").matches({id:"spoon",name:"Tea Spoon",category:"Serving & Dining"}), true);
});
test("admin assignment overrides names and legacy Gadgets links remain valid", () => {
  const p = { id: "a", name: "Cup", category: "Household / Other Household Items" };
  assert.equal(findTaxonomy("Cups & Mugs").matches(p), false);
  assert.equal(findTaxonomy("Household").matches(p), true);
  assert.equal(findTaxonomy("Gadgets").matches(p), true);
});
