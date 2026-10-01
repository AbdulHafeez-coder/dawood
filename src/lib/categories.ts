import { customerCategory, customerSubcategory, STOREFRONT_CATEGORIES } from "./catalog-model.ts";
export type CatalogCategory = (typeof STOREFRONT_CATEGORIES)[number];
export type SheetType =
  | "Wallpaper Sheets"
  | "Table / Dining Sheets"
  | "Table Mats / Dastarkhwan"
  | "Fridge Mats / Sticker Sheets";
export const SHOP_CATEGORIES = STOREFRONT_CATEGORIES;
export const SHEET_TYPES: readonly SheetType[] = [
  "Wallpaper Sheets",
  "Table / Dining Sheets",
  "Table Mats / Dastarkhwan",
  "Fridge Mats / Sticker Sheets",
];
type CategorySource = { name: string; category: string };
export function classifyCategory(product: CategorySource): CatalogCategory {
  return customerCategory(product.name, product.category) as CatalogCategory;
}
export function getSheetType(product: CategorySource): SheetType | null {
  return classifyCategory(product) === "Sheets"
    ? (customerSubcategory(product.name, "Sheets") as SheetType)
    : null;
}
