import assert from "node:assert/strict";
import test from "node:test";
import {
  mapCatalogProduct,
  normalizeStatus,
  catalogSearchTerm,
} from "../../src/lib/catalog-model.ts";

test("real prices and SEO survive mapping without demo metadata", () => {
  const p = mapCatalogProduct({
    id: "real-1",
    name: "Glass mug",
    price: 1000,
    category: "Glassware",
    slug: "glass-mug",
    details: [],
    gallery: [],
    img: "https://example.com/mug.jpg",
  });
  assert.equal(p.price, 1000);
  assert.equal(p.original_price, undefined);
  assert.equal(p.brand, undefined);
  assert.equal(p.status, "on_demand");
  assert.equal(p.slug, "glass-mug");
});
test("explicit admin stock and subcategory take precedence", () => {
  const p = mapCatalogProduct({
    id: "x",
    name: "Table cover",
    category: "Sheets",
    price: 50,
    status: "sold_out",
    subcategory: "Wallpaper Sheets",
    brand: "Real Brand",
  });
  assert.equal(p.status, "sold_out");
  assert.equal(p.subCategory, "Wallpaper Sheets");
  assert.equal(p.brand, "Real Brand");
});
test("unknown availability cannot become purchasable", () => {
  assert.equal(normalizeStatus("in stock"), "on_demand");
  assert.equal(normalizeStatus("available"), "available");
});
test("search input cannot inject PostgREST operators", () => {
  assert.equal(catalogSearchTerm(" mug%,(status.eq.available) "), "mug status eq available");
});
