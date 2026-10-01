import type { Product } from "./types";
import {
  CATALOG_METADATA_PREFIX,
  isApolloProduct,
  readCatalogMetadata,
} from "./catalog-metadata.ts";

export const PRODUCT_STATUSES = [
  "available",
  "on_demand",
  "sold_out",
  "coming_soon",
  "discontinued",
] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];
export const STATUS_LABELS: Record<ProductStatus, string> = {
  available: "In Stock",
  on_demand: "On Demand",
  sold_out: "Out of Stock",
  coming_soon: "Coming Soon",
  discontinued: "Discontinued",
};
export const STOREFRONT_CATEGORIES = ["Sheets", "Towels", "Crockery"] as const;
export const SUBCATEGORIES: Record<string, readonly string[]> = {
  Sheets: [
    "Wallpaper Sheets",
    "Table / Dining Sheets",
    "Table Mats / Dastarkhwan",
    "Fridge Mats / Sticker Sheets",
  ],
  Towels: [],
  Crockery: ["Cups / Mugs", "Glasses", "Kitchen Tools / Gadgets", "Other Crockery"],
};
export function customerSubcategory(name: string, category: string): string {
  if (category === "Sheets") {
    if (/fridge|refrigerator|sticker/i.test(name) && !/wallpaper|wall\s/i.test(name))
      return "Fridge Mats / Sticker Sheets";
    if (/wallpaper|\bwall\b/i.test(name)) return "Wallpaper Sheets";
    if (/placemat|table[ -]?mats?|dastarkhwan|dastarkhan|دسترخوان/i.test(name))
      return "Table Mats / Dastarkhwan";
    return "Table / Dining Sheets";
  }
  if (category === "Crockery") {
    if (/\b(cups?|mugs?)\b/i.test(name)) return "Cups / Mugs";
    if (/\b(glass|glasses|tumblers?)\b/i.test(name) && !/\b(bowl|jar|plate)\b/i.test(name))
      return "Glasses";
    if (
      /\b(tool|gadget|peeler|grater|chopper|strainer|spatula|knife|knives|scissors|whisk|opener)\b/i.test(
        name,
      )
    )
      return "Kitchen Tools / Gadgets";
    return "Other Crockery";
  }
  return "";
}
export function isStorefrontVisible(product: Product): boolean {
  return (
    product.visible !== false &&
    product.status !== "discontinued" &&
    (!isApolloProduct(product) || product.status === "available")
  );
}
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
    /\bsheets?\b|wallpaper|dastarkhwan|dastarkhan|دسترخوان|table[ -]?(cloth|cover|runner|mat)|placemat|fridge[ -]?mat/i.test(
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
  return "Crockery";
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
  const metadata = readCatalogMetadata(details);
  const categoryOverride = metadata.category ?? row.storefront_category;
  const category =
    typeof categoryOverride === "string" &&
    STOREFRONT_CATEGORIES.includes(categoryOverride as (typeof STOREFRONT_CATEGORIES)[number])
      ? categoryOverride
      : customerCategory(row.name, row.category);
  const subcategoryOverride = metadata.subcategory ?? row.subcategory;
  const subCategory =
    typeof subcategoryOverride === "string" &&
    SUBCATEGORIES[category]?.includes(subcategoryOverride)
      ? subcategoryOverride
      : customerSubcategory(row.name, category);
  const apollo = isApolloProduct({ id: row.id, brand, details });
  const explicitStatus = metadata.status ?? row.status;
  const status = explicitStatus == null && apollo ? "coming_soon" : normalizeStatus(explicitStatus);
  const img = typeof row.img === "string" ? row.img : "";
  return {
    id: row.id,
    name: row.name,
    display_name: row.name,
    category,
    subCategory,
    brand,
    status,
    visible: typeof metadata.visible === "boolean" ? metadata.visible : row.is_visible !== false,
    legacyCategory: row.category,
    price: Number(row.price),
    rating: Number(row.rating) || 0,
    img,
    bg: "bg-stone-100",
    tag: typeof row.tag === "string" ? row.tag : "",
    tagline: typeof row.tagline === "string" ? row.tagline : "",
    description: typeof row.description === "string" ? row.description : "",
    details: details.filter((value) => !value.startsWith(CATALOG_METADATA_PREFIX)),
    gallery: Array.isArray(row.gallery) && row.gallery.length ? (row.gallery as string[]) : [img],
    slug: typeof row.slug === "string" ? row.slug : null,
    seo_title: typeof row.seo_title === "string" ? row.seo_title : null,
    seo_description: typeof row.seo_description === "string" ? row.seo_description : null,
  };
}
