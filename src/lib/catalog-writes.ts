import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../integrations/supabase/types";

export async function saveCatalogProduct(
  client: SupabaseClient<Database>,
  row: Database["public"]["Tables"]["products"]["Insert"],
  update = false,
) {
  // Safe during rollout while legacy categories still exist. RLS remains in force.
  const { error } = await client
    .from("categories")
    .upsert({ name: row.category }, { onConflict: "name", ignoreDuplicates: true });
  if (error) return { error };
  return update
    ? await client.from("products").update(row).eq("id", row.id)
    : await client.from("products").insert(row);
}
