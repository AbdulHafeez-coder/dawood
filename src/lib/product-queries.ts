import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../integrations/supabase/types";

export function publicProducts(client: SupabaseClient<Database>) {
  return client.from("products").select("*", { count: "exact" }).eq("is_active", true);
}

export function productPageQuery(client: SupabaseClient<Database>, options: { admin?: boolean; page?: number; pageSize?: number }) {
  const size = Math.min(options.admin ? 100 : 24, Math.max(1, Math.floor(options.pageSize || 24)));
  const offset = Math.max(0, Math.floor(options.page || 1) - 1) * size;
  const query = options.admin ? client.from("products").select("*", { count: "exact" }) : publicProducts(client);
  return query.range(offset, offset + size - 1);
}

export async function saveProductVisibility(client: SupabaseClient<Database>, id: string, active: boolean) {
  const { data, error } = await client.from("products").update({ is_active: active }).eq("id", id).select("id,is_active").maybeSingle();
  if (error || data?.id !== id || data?.is_active !== active) throw new Error(error?.message || "Database did not confirm the visibility save.");
}
