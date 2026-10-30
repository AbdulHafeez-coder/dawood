import type { Product } from "./types";
type MatchProduct = Pick<Product, "id" | "name" | "category">;
export const CATEGORY_TAXONOMY_VERSION: string;
export const taxonomyGroups: {
  name: string;
  image: string;
  subcategories: { name: string; matches: (product: MatchProduct) => boolean }[];
}[];
export function findTaxonomy(
  value?: string,
): { group: string; subcategory?: string; matches: (product: MatchProduct) => boolean } | undefined;
export function isTaxonomyCategory(value?: string): boolean;
