import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import type { Product } from "@/lib/types";
import { publicProducts } from "@/lib/product-queries";
import { rowToProduct } from "@/lib/shop";
import { supabase } from "@/lib/supabase";
import { customerCategory } from "@/lib/storefront-categories";
import { StoreImage } from "./StoreImage";
import { formatPKR } from "@/lib/format";
type Props = {
  query: string;
  onQueryChange: (q: string) => void;
  onSearchSubmit?: () => void;
  onSelectCategory?: (c: string) => void;
  onSelectProduct?: (p: Product) => void;
  className?: string;
  placeholder?: string;
  products?: Product[];
  categories?: string[];
  brands?: string[];
  variant?: string;
  onSelectBrand?: (b: string) => void;
};
export function SearchAutocomplete({
  query,
  onQueryChange,
  onSearchSubmit,
  onSelectCategory,
  onSelectProduct,
  className = "",
  placeholder = "Search your everyday essentials",
}: Props) {
  const [open, setOpen] = useState(false),
    [selected, setSelected] = useState(-1);
  const [result, setResult] = useState<{ query: string; items: Product[]; error?: boolean }>({
    query: "",
    items: [],
  });
  const root = useRef<HTMLDivElement>(null),
    id = useId(),
    navigate = useNavigate();
  const term = query
    .trim()
    .replace(/[%,().*\\]/g, " ")
    .trim();
  const items = result.query === term ? result.items : [];
  const categories = [...new Set(items.map((p) => customerCategory(p.category)))].slice(0, 2);
  useEffect(() => {
    if (!open || !term) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => { controller.abort(); setResult({ query: term, items: [], error: true }); }, 10000);
    const timer = setTimeout(async () => {
      const { data, error } = await publicProducts(supabase)
        .or(`name.ilike.%${term}%,category.ilike.%${term}%,id.ilike.%${term}%`)
        .order("name")
        .limit(6)
        .abortSignal(controller.signal);
      clearTimeout(timeout);
      if (!controller.signal.aborted)
        setResult({
          query: term,
          items: error ? [] : (data || []).map(rowToProduct),
          error: !!error,
        });
    }, 120);
    return () => {
      clearTimeout(timeout);
      clearTimeout(timer);
      controller.abort();
    };
  }, [term, open]);
  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  function choose(index: number) {
    if (index < 0 || index >= items.length + categories.length) return;
    setOpen(false);
    if (index < items.length) {
      const p = items[index];
      if (onSelectProduct) onSelectProduct(p);
      else void navigate({ to: "/product/$id", params: { id: p.slug || p.id } });
    } else onSelectCategory?.(categories[index - items.length]);
  }
  return (
    <div
      className={`dm-search ${className}`}
      ref={root}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (selected >= 0 && open) choose(selected);
          else {
            setOpen(false);
            onSearchSubmit?.();
          }
        }}
      >
        <Search size={19} aria-hidden="true" />
        <input
          aria-label="Search products"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open && !!term}
          aria-controls={id}
          aria-activedescendant={selected >= 0 ? `${id}-${selected}` : undefined}
          value={query}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            onQueryChange(e.target.value);
            setSelected(-1);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              setSelected(-1);
            }
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              setOpen(true);
              const length = items.length + categories.length;
              if (length)
                setSelected((n) => (n + (e.key === "ArrowDown" ? 1 : -1) + length) % length);
            }
          }}
        />
        {query && (
          <button
            type="button"
            className="dm-icon"
            aria-label="Clear search"
            onClick={() => {
              onQueryChange("");
              setSelected(-1);
            }}
          >
            <X size={18} />
          </button>
        )}
      </form>
      {open && term && (
        <div className="dm-suggestions" id={id} role="listbox" aria-label="Search suggestions">
          {items.map((p, index) => (
            <button
              type="button"
              role="option"
              aria-selected={index === selected}
              id={`${id}-${index}`}
              key={p.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(index)}
            >
              <StoreImage src={p.img} sizes="48px" alt="" />
              <span>
                {p.display_name || p.name}
                <small>
                  {formatPKR(p.price)}
                  {p.in_stock === false ? " · Out of stock" : ""}
                </small>
              </span>
            </button>
          ))}
          {categories.map((c, i) => (
            <button
              type="button"
              role="option"
              aria-selected={selected === items.length + i}
              id={`${id}-${items.length + i}`}
              key={c}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(items.length + i)}
            >
              <span>
                Shop {c}
                <small>Category</small>
              </span>
            </button>
          ))}
          {!items.length && (
            <p role="status">
              {result.query !== term
                ? "Searching…"
                : result.error
                  ? "Search unavailable. Please try again."
                  : "No matching products. Try another word."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
