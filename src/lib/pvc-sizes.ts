import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export const isPvcSheet = (id?: string) =>
  id === "fancy-pvc-dastarkhwan-sheet" || id === "pvc-center-table-sheet-waterproof-table-cover";

export type PvcSize = { size: string; price: number; available: number };
export type PvcLine = { product: string; size: string; price: number; qty: number };
export function usePvcSizes(enabled: boolean) {
  const [sizes, setSizes] = useState<PvcSize[]>([]);
  useEffect(() => {
    if (!enabled) return;
    let current = true;
    supabase.from("pvc_sheet_sizes").select("*").order("size").then(({ data }) => {
      if (current) setSizes(data || []);
    });
    return () => { current = false; };
  }, [enabled]);
  return sizes;
}
