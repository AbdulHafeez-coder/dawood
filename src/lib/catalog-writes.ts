import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../integrations/supabase/types";
import { readCatalogMetadata, writeCatalogMetadata } from "./catalog-metadata.ts";
import { invalidateCatalog } from "./catalog-api.ts";
import { mapCatalogProduct } from "./catalog-model.ts";
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"] & { is_visible?: boolean };
export async function saveCatalogProduct(
  client: SupabaseClient<Database>,
  row: ProductInsert,
  update = false,
) {
  const { status, storefront_category, subcategory, is_visible, ...payload } = row;
  let previous: Database["public"]["Tables"]["products"]["Row"] | null = null;
  if (update) {
    const result = await client.from("products").select("*").eq("id", row.id).maybeSingle();
    if (result.error) return { error: result.error };
    if (!result.data)
      return {
        error: {
          code: "NOT_FOUND",
          message: "Product not found or not editable. Reload the catalog.",
        },
      };
    previous = result.data;
    // Customer category mapping never rewrites the original category/brand data.
    payload.category = previous.category;
  } else {
    const { error } = await client
      .from("categories")
      .upsert({ name: payload.category }, { onConflict: "name", ignoreDuplicates: true });
    if (error) return { error };
  }
  const previousDetails = previous?.details || [];
  const protectedDetails = previousDetails.filter((value) =>
    /^(brand|source|source_id|source_url|compare_at_price):/i.test(value),
  );
  const details = [...new Set([...(payload.details ?? previousDetails), ...protectedDetails])];
  const previousProduct = previous ? mapCatalogProduct(previous) : null;
  payload.details = writeCatalogMetadata(details, {
    ...readCatalogMetadata(previousDetails),
    status: status ?? previousProduct?.status ?? "coming_soon",
    category: storefront_category ?? previousProduct?.category ?? row.category,
    subcategory: subcategory ?? previousProduct?.subCategory ?? "",
    visible: is_visible ?? previousProduct?.visible ?? true,
  });
  const result = update
    ? await client.from("products").update(payload).eq("id", row.id).select("*").maybeSingle()
    : await client.from("products").insert(payload).select("*").maybeSingle();
  if (result.error) return { error: result.error };
  if (!result.data || result.data.id !== row.id)
    return {
      error: {
        code: "NOT_SAVED",
        message: "Database did not confirm the save. Check admin permissions and retry.",
      },
    };
  invalidateCatalog(client);
  return { error: null, data: result.data };
}
