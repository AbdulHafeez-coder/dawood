import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sheetInventory, sheetDesigns } from '../src/lib/sheet-inventory.js';
test('new listings share one pool without sharing legacy PVC stock', () => {
  assert.equal(sheetInventory('decorative-pvc-center-table-sheet'), 'decorative_sheet_sizes');
  assert.equal(sheetInventory('decorative-pvc-dastarkhwan-sheet'), 'decorative_sheet_sizes');
  assert.equal(sheetInventory('fancy-pvc-dastarkhwan-sheet'), 'pvc_sheet_sizes');
  assert.equal(sheetInventory('unrelated-product'), null);
});
test('five selectable designs have unique identifiers and photographs', () => {
  assert.equal(sheetDesigns.length, 5);
  assert.equal(new Set(sheetDesigns.map(d => d.id)).size, 5);
  assert.equal(new Set(sheetDesigns.map(d => d.image)).size, 5);
});
