import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../integrations/supabase/types";
import {
  catalogSearchTerm,
  mapCatalogProduct,
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
export async function fetchCatalog(
  client: SupabaseClient<Database>,
  filters: CatalogFilters = {},
  signal?: AbortSignal,
) {
  const page = Math.max(0, Math.floor(filters.page || 0));
  const size = Math.min(48, Math.max(1, Math.floor(filters.pageSize || 24)));
  let query = client.from("products").select("*", { count: "exact" }).neq("status", "discontinued");
  if (filters.category) query = query.eq("storefront_category", filters.category);
  if (filters.subcategory) query = query.eq("subcategory", filters.subcategory);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.minPrice !== undefined) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("price", filters.maxPrice);
  const term = catalogSearchTerm(filters.search || "");
  if (term)
    query = query.or(
      `name.ilike.%${term}%,id.ilike.%${term}%,description.ilike.%${term}%,tagline.ilike.%${term}%`,
    );
  query = query.order("availability_rank", { ascending: true });
  if (filters.sort === "price-asc" || filters.sort === "price-desc")
    query = query.order("price", { ascending: filters.sort === "price-asc" });
  query = query
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .range(page * size, (page + 1) * size - 1);
  if (signal) query = query.abortSignal(signal);
  const { data, error, count } = await query;
  if (error)
    throw new Error(
      error.code === "42703" || error.code === "PGRST204"
        ? "Catalog setup is pending. Please contact Dawood Mart on WhatsApp."
        : "Unable to load products. Please try again.",
    );
  return {
    products: (data || []).map((row) => mapCatalogProduct(row as unknown as CatalogRow)),
    total: count || 0,
    page,
    pageSize: size,
  };
}
export async function fetchProduct(client: SupabaseClient<Database>, id: string) {
  // Separate equality queries keep arbitrary IDs/slugs out of PostgREST filter syntax.
  let result = await client.from("products").select("*").eq("id", id).maybeSingle();
  if (result.error) throw new Error("Unable to load this product. Please try again.");
  if (!result.data) result = await client.from("products").select("*").eq("slug", id).maybeSingle();
  if (result.error) throw new Error("Unable to load this product. Please try again.");
  if (!result.data) return undefined;
  const product = mapCatalogProduct(result.data as unknown as CatalogRow);
  return product.status === "discontinued" ? undefined : product;
}
