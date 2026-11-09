export function sheetInventory(id) {
  if (['decorative-pvc-center-table-sheet', 'decorative-pvc-dastarkhwan-sheet'].includes(id)) return 'decorative_sheet_sizes';
  if (['fancy-pvc-dastarkhwan-sheet', 'pvc-center-table-sheet-waterproof-table-cover'].includes(id)) return 'pvc_sheet_sizes';
  return null;
}
export const sheetDesigns = [
  { id: 'blue', label: 'Blue', image: '/images/products/decorative-sheets/blue.webp' },
  { id: 'green', label: 'Green', image: '/images/products/decorative-sheets/green.webp' },
  { id: 'gold-pink', label: 'Gold & Pink', image: '/images/products/decorative-sheets/gold-pink.webp' },
  { id: 'cream-gold', label: 'Cream & Gold', image: '/images/products/decorative-sheets/cream-gold.webp' },
  { id: 'pink', label: 'Pink', image: '/images/products/decorative-sheets/pink.webp' },
];
