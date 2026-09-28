import type { Product } from "./types";

export const PRODUCT_STATUSES = [
  "available",
  "on_demand",
  "sold_out",
  "coming_soon",
  "discontinued",
] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];
export const STATUS_LABELS: Record<ProductStatus, string> = {
  available: "Available",
  on_demand: "On Demand",
  sold_out: "Sold Out",
  coming_soon: "Coming Soon",
  discontinued: "Discontinued",
};
export const STOREFRONT_CATEGORIES = ["Sheets", "Crockery", "Towels", "Home Essentials"] as const;
export function normalizeStatus(value: unknown): ProductStatus {
  return PRODUCT_STATUSES.includes(value as ProductStatus) ? (value as ProductStatus) : "on_demand";
}
export function catalogSearchTerm(value: string): string {
  return value
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}
export function customerCategory(name: string, category: string): string {
  if (STOREFRONT_CATEGORIES.includes(category as (typeof STOREFRONT_CATEGORIES)[number]))
    return category;
  if (/\btowels?\b|\bbath sheets?\b/i.test(name)) return "Towels";
  if (
    /sheet house|home sheets|wallpaper|textiles|linens/i.test(category) ||
    /\bsheets?\b|wallpaper|dastarkhwan|dastarkhan|دسترخوان|table[ -]?(cloth|cover|runner|mat)|placemat/i.test(
      name,
    )
  )
    return "Sheets";
  if (
    /crockery|glassware|kitchen|drinkware|dinnerware|cookware/i.test(category) ||
    /\b(cups?|mugs?|glasses|glass|bowls?|plates?|dishes|dinner|spoons?|forks?|knives|jugs?|jars?|bottles?|trays?|pans?|pots?|kettles?|teapots?|tumblers?|flasks?|lunch|cutlery|serving|spice|strainer|casserole)\b/i.test(
      name,
    )
  )
    return "Crockery";
  return "Home Essentials";
}
export type CatalogRow = {
  id: string;
  name: string;
  category: string;
  price: number;
  [key: string]: unknown;
};
export function mapCatalogProduct(row: CatalogRow): Product {
  const details = Array.isArray(row.details)
    ? row.details.filter((s): s is string => typeof s === "string")
    : [];
  const brand =
    typeof row.brand === "string" && row.brand.trim()
      ? row.brand.trim()
      : details
          .find((s) => /^brand:/i.test(s))
          ?.replace(/^brand:\s*/i, "")
          .trim();
  const category =
    typeof row.storefront_category === "string" && row.storefront_category
      ? row.storefront_category
      : customerCategory(row.name, row.category);
  const subCategory =
    typeof row.subcategory === "string"
      ? row.subcategory || undefined
      : category === "Sheets"
        ? /wallpaper|\bwall\b|sticker/i.test(row.name)
          ? "Wallpaper Sheets"
          : /table|dast|دسترخوان|placemat/i.test(row.name)
            ? "Table Sheets"
            : undefined
        : undefined;
  const img = typeof row.img === "string" ? row.img : "";
  return {
    id: row.id,
    name: row.name,
    display_name: row.name,
    category,
    subCategory,
    brand,
    status: normalizeStatus(row.status),
    price: Number(row.price),
    rating: Number(row.rating) || 0,
    img,
    bg: "bg-stone-100",
    tag: typeof row.tag === "string" ? row.tag : "",
    tagline: typeof row.tagline === "string" ? row.tagline : "",
    description: typeof row.description === "string" ? row.description : "",
    details,
    gallery: Array.isArray(row.gallery) && row.gallery.length ? (row.gallery as string[]) : [img],
    slug: typeof row.slug === "string" ? row.slug : null,
    seo_title: typeof row.seo_title === "string" ? row.seo_title : null,
    seo_description: typeof row.seo_description === "string" ? row.seo_description : null,
  };
}
