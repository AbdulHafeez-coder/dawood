import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { sheetInventory } from "./sheet-inventory.js";

export const isPvcSheet = (id?: string) => !!sheetInventory(id);

export type PvcSize = { size: string; price: number; available: number };
export type PvcLine = { product: string; size: string; price: number; qty: number; design?: string };
export function usePvcSizes(enabled: boolean, productId?: string) {
  const [sizes, setSizes] = useState<PvcSize[]>([]);
  useEffect(() => {
    setSizes([]);
    if (!enabled) return;
    let current = true;
    supabase.from(sheetInventory(productId) || "pvc_sheet_sizes").select("*").order("size").then(({ data }) => {
      if (current) setSizes(data || []);
    });
    return () => { current = false; };
  }, [enabled, productId]);
  return sizes;
}
