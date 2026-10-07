import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../integrations/supabase/types";
export function canPurchase(p: { is_active?: boolean; in_stock?: boolean }) {
  return p.is_active !== false && p.in_stock !== false;
}
// Recheck saved baskets against the database, never trust localStorage availability.
export async function assertPurchasable(client: SupabaseClient<Database>, ids: string[]) {
  const unique = [...new Set(ids)];
  if (!unique.length) throw new Error("Your basket is empty.");
  for (let offset = 0; offset < unique.length; offset += 24) {
    const batch = unique.slice(offset, offset + 24);
    const { data, error } = await client
      .from("products")
      .select("id,in_stock")
      .eq("is_active", true)
      .in("id", batch)
      .limit(24);
    if (error) throw new Error("Unable to confirm availability. Please retry.");
    if (data?.length !== batch.length || data.some((p) => p.in_stock === false))
      throw new Error("An item is no longer available. Please review your basket before ordering.");
  }
}
export async function saveStock(client: SupabaseClient<Database>, id: string, inStock: boolean) {
  const { data, error } = await client
    .from("products")
    .update({ in_stock: inStock })
    .eq("id", id)
    .select("id,in_stock")
    .maybeSingle();
  if (error || data?.id !== id || data.in_stock !== inStock)
    throw new Error(error?.message || "Database did not confirm the stock save.");
}
