import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { fetchCatalog, type CatalogFilters } from "./catalog-api";
import type { Product } from "./types";
export function useCatalog(filters: CatalogFilters) {
  const key = JSON.stringify(filters);
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState<{
    products: Product[];
    highlights: Product[];
    subcategories: string[];
    total: number;
    loading: boolean;
    error: string;
  }>({ products: [], highlights: [], subcategories: [], total: 0, loading: true, error: "" });
  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: "" }));
    fetchCatalog(supabase, JSON.parse(key), controller.signal)
      .then((result) => {
        if (!controller.signal.aborted)
          setState({
            products: result.products,
            highlights: result.highlights,
            subcategories: result.subcategories,
            total: result.total,
            loading: false,
            error: "",
          });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({
            products: [],
            highlights: [],
            subcategories: [],
            total: 0,
            loading: false,
            error: error instanceof Error ? error.message : "Unable to load products.",
          });
      });
    return () => controller.abort();
  }, [key, retry]);
  return { ...state, retry: () => setRetry((n) => n + 1) };
}
