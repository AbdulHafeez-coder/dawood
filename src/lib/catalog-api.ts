import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../integrations/supabase/types";
import type { Product } from "./types";
import {
  catalogSearchTerm,
  mapCatalogProduct,
  isStorefrontVisible,
  type CatalogRow,
  type ProductStatus,
} from "./catalog-model.ts";
export type CatalogFilters = {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  subcategory?: string;
  status?: ProductStatus | "";
  minPrice?: number;
  maxPrice?: number;
  sort?: "recommended" | "price-asc" | "price-desc";
};
const cache = new WeakMap<SupabaseClient<Database>, { time: number; products: Product[] }>();
export function invalidateCatalog(client: SupabaseClient<Database>) {
  cache.delete(client);
}
export async function loadCatalogRows(
  client: SupabaseClient<Database>,
  signal?: AbortSignal,
): Promise<Product[]> {
  const saved = cache.get(client);
  if (saved && Date.now() - saved.time < 15000) return saved.products;
  const rows: CatalogRow[] = [];
  // Only existing columns are queried. Classify before pagination so hidden imports
  // cannot cause empty pages, incorrect counts, or incomplete category filters.
  for (let offset = 0; ; offset += 100) {
    let query = client
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .order("id")
      .range(offset, offset + 99);
    if (signal) query = query.abortSignal(signal);
    const { data, error } = await query;
    if (error) throw new Error("Unable to load products. Please try again.");
    rows.push(...((data || []) as unknown as CatalogRow[]));
    if (!data || data.length < 100) break;
  }
  const products = rows.map(mapCatalogProduct);
  cache.set(client, { time: Date.now(), products });
  return products;
}
export async function fetchCatalog(
  client: SupabaseClient<Database>,
  filters: CatalogFilters = {},
  signal?: AbortSignal,
) {
  const page = Math.max(0, Math.floor(filters.page || 0));
  const size = Math.min(48, Math.max(1, Math.floor(filters.pageSize || 24)));
  const visible = (await loadCatalogRows(client, signal)).filter(isStorefrontVisible);
  const term = catalogSearchTerm(filters.search || "").toLocaleLowerCase();
  const matches = visible.filter(
    (p) =>
      (!filters.category || p.category === filters.category) &&
      (!filters.subcategory || p.subCategory === filters.subcategory) &&
      (!filters.status || p.status === filters.status) &&
      (filters.minPrice === undefined || p.price >= filters.minPrice) &&
      (filters.maxPrice === undefined || p.price <= filters.maxPrice) &&
      (!term ||
        [p.name, p.id, p.description, p.tagline].join(" ").toLocaleLowerCase().includes(term)),
  );
  const rank: Record<string, number> = {
    available: 0,
    on_demand: 1,
    sold_out: 2,
    coming_soon: 3,
    discontinued: 4,
  };
  matches.sort((a, b) => {
    if (filters.sort === "price-asc") return a.price - b.price || a.id.localeCompare(b.id);
    if (filters.sort === "price-desc") return b.price - a.price || a.id.localeCompare(b.id);
    return rank[a.status || "on_demand"] - rank[b.status || "on_demand"];
  });
  return {
    products: matches.slice(page * size, (page + 1) * size),
    total: matches.length,
    page,
    pageSize: size,
    subcategories: [
      ...new Set(
        visible
          .filter((p) => !filters.category || p.category === filters.category)
          .map((p) => p.subCategory)
          .filter((s): s is string => !!s),
      ),
    ],
    highlights: ["Sheets", "Towels", "Crockery"]
      .map((category) => {
        const candidates = visible.filter((p) => p.category === category && p.img);
        // Prefer original hosted catalog photos over fragile import URLs or generic placeholders.
        return candidates.find((p) => p.img.includes('/storage/v1/object/public/product-images/') && !p.img.includes('generic_')) || candidates[0];
      })
      .filter((p): p is Product => !!p),
  };
}
export async function fetchProduct(client: SupabaseClient<Database>, id: string) {
  let result = await client.from("products").select("*").eq("id", id).maybeSingle();
  if (result.error) throw new Error("Unable to load this product. Please try again.");
  if (!result.data) result = await client.from("products").select("*").eq("slug", id).maybeSingle();
  if (result.error) throw new Error("Unable to load this product. Please try again.");
  if (!result.data) return undefined;
  const product = mapCatalogProduct(result.data as unknown as CatalogRow);
  return isStorefrontVisible(product) ? product : undefined;
}
