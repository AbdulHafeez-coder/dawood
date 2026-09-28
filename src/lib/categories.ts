import { customerCategory, STOREFRONT_CATEGORIES } from "./catalog-model.ts";
export type CatalogCategory = (typeof STOREFRONT_CATEGORIES)[number];
export type SheetType = "Wallpaper Sheets" | "Table Sheets";
export const SHOP_CATEGORIES = STOREFRONT_CATEGORIES;
export const SHEET_TYPES: readonly SheetType[] = ["Wallpaper Sheets", "Table Sheets"];
type CategorySource = { name: string; category: string };
export function classifyCategory(product: CategorySource): CatalogCategory {
  return customerCategory(product.name, product.category) as CatalogCategory;
}
export function getSheetType(product: CategorySource): SheetType | null {
  if (classifyCategory(product) !== "Sheets") return null;
  if (/wallpaper|\bwall\b|sticker/i.test(product.name)) return "Wallpaper Sheets";
  if (/table|dast|دسترخوان|placemat/i.test(product.name)) return "Table Sheets";
  return null;
}
