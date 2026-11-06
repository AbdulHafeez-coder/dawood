import type { Product } from "./types";
type CatalogProduct = Pick<Product, "id" | "name" | "category"> & Partial<Product>;
type Subcategory = { name: string; matches: (product: CatalogProduct) => boolean };
export const CATEGORY_TAXONOMY_VERSION: string;
export const taxonomyGroups: { name: string; image: string; subcategories: Subcategory[] }[];
export function productPlacement(
  product: CatalogProduct,
): { group: string; subcategory: string } | undefined;
export function findTaxonomy(
  value?: string,
):
  | { group: string; subcategory?: string; matches: (product: CatalogProduct) => boolean }
  | undefined;
export function isTaxonomyCategory(value?: string): boolean;
