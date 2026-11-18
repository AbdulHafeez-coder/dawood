import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { createRequire } from 'node:module';

const source = fs.readFileSync(new URL('../src/lib/shop.ts', import.meta.url), 'utf8');
const fn = source.slice(source.indexOf('export function rowToProduct'), source.indexOf('\nfunction productToRow'));
const js = ts.transpile(fn.replace('export ', ''), { target: ts.ScriptTarget.ES2022 });
const rowToProduct = new Function('isPvcSheet', 'getDisplayName', 'extractBrand', js + ';return rowToProduct;')(() => false, n => n, () => 'Classic');

test('China wallpaper keeps exact package totals and media', () => {
  [1600, 3000, 4000, 5000].forEach((price, i) => {
    const n = i + 1;
    const row = { id: `china-fabric-wallpaper-${n}-${n === 1 ? 'sheet' : 'sheets'}`, name: 'China Fabric Wallpaper', price: price / 0.8, rating: 0, category: 'Wall paper sheets', gallery: ['design.jpg'], video: 'paper5.mp4' };
    const product = rowToProduct(row);
    assert.equal(product.price, price);
    assert.equal(product.original_price, price / 0.8);
    assert.deepEqual(product.gallery, row.gallery);
    assert.equal(product.video, row.video);
  });
});

test('existing wallpaper pricing and unrelated discounts stay unchanged', () => {
  assert.equal(rowToProduct({ id: 'fabric-wallpaper-1-sheet', name: 'Wallpaper', price: 1600 }).price, 1600);
  assert.equal(rowToProduct({ id: 'other-product', name: 'Other', price: 1000 }).price, 800);
});

test('package chooser keeps China packages separate from existing packages', () => {
  const require = createRequire(import.meta.url);
  let requested;
  const input = fs.readFileSync(new URL('../src/components/WallpaperPackages.tsx', import.meta.url), 'utf8');
  const compiled = ts.transpile(input, { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX });
  const exports = {};
  new Function('require', 'exports', compiled)((name) => {
    if (name === '@/lib/shop') return { useProducts: options => { requested = options.ids; return { products: [] }; } };
    if (name === '@/lib/format') return { formatPKR: String };
    if (name === '@tanstack/react-router') return { Link: 'a' };
    return require(name);
  }, exports);
  assert.equal(exports.isWallpaperPackage('china-fabric-wallpaper-1-sheet'), true);
  exports.WallpaperPackages({ product: { id: 'china-fabric-wallpaper-1-sheet', price: 1600 } });
  assert.deepEqual(requested, [1, 2, 3, 4].map(n => `china-fabric-wallpaper-${n}-${n === 1 ? 'sheet' : 'sheets'}`));
  exports.WallpaperPackages({ product: { id: 'fabric-wallpaper-1-sheet', price: 1600 } });
  assert.equal(requested.length, 9);
  assert.ok(requested.every(id => !id.startsWith('china-')));
});
