import { useState, useRef, useEffect, useMemo, type KeyboardEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Search,
  X,
  Camera,
  Sparkles,
  TrendingUp,
  ChevronRight,
  Tag,
  ArrowRight,
} from "lucide-react";
import { formatPKR } from "@/lib/format";
import { SafeImage } from "@/components/ui/SafeImage";
import type { Product, Category } from "@/lib/types";

interface SearchAutocompleteProps {
  products: Product[];
  categories: string[];
  brands: string[];
  query: string;
  onQueryChange: (q: string) => void;
  onSelectProduct?: (p: Product) => void;
  onSelectCategory?: (c: Category) => void;
  onSelectBrand?: (b: string) => void;
  onSearchSubmit?: () => void;
  placeholder?: string;
  variant?: "header" | "mobile" | "compact";
  className?: string;
}

const TRENDING_SEARCHES = [
  "Dry Fruit Jars",
  "Water Bottles",
  "Tea & Mug Sets",
  "Bedsheets",
  "Sponge & Cleaning",
  "Classic",
  "Sonex",
  "Crown Gold Tray",
];

export function SearchAutocomplete({
  products,
  categories,
  brands,
  query,
  onQueryChange,
  onSelectProduct,
  onSelectCategory,
  onSelectBrand,
  onSearchSubmit,
  placeholder = "Search products, brands, categories…",
  variant = "header",
  className = "",
}: SearchAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cleanQ = query.trim().toLowerCase();

  // Matched products computation (fuzzy-like token match across name, brand, category, tags, description)
  const matchedProducts = useMemo(() => {
    if (!cleanQ) return [];
    const tokens = cleanQ.split(/\s+/).filter(Boolean);
    return products
      .filter((p) => {
        const fullText =
          `${p.name} ${p.display_name || ""} ${p.category} ${p.brand || ""} ${p.tag || ""} ${p.tagline || ""} ${p.description || ""}`.toLowerCase();
        return tokens.every((token) => fullText.includes(token));
      })
      .slice(0, 6);
  }, [products, cleanQ]);

  // Matched Categories
  const matchedCategories = useMemo(() => {
    if (!cleanQ) return [];
    return categories.filter((c) => c.toLowerCase().includes(cleanQ)).slice(0, 3);
  }, [categories, cleanQ]);

  // Matched Brands
  const matchedBrands = useMemo(() => {
    if (!cleanQ) return [];
    return brands.filter((b) => b !== "All" && b.toLowerCase().includes(cleanQ)).slice(0, 3);
  }, [brands, cleanQ]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && matchedProducts[selectedIndex]) {
        const sel = matchedProducts[selectedIndex];
        navigate({ to: "/product/$id", params: { id: sel.slug || sel.id } });
        setIsOpen(false);
      } else {
        setIsOpen(false);
        onSearchSubmit?.();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, matchedProducts.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const highlightMatch = (text: string, q: string) => {
    if (!q) return text;
    const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === q.toLowerCase() ? (
            <span key={i} className="font-bold text-[#ff0055] bg-[#ff0055]/10 rounded px-0.5">
              {part}
            </span>
          ) : (
            part
          ),
        )}
      </>
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Bar Input Container */}
      <div
        className={`flex items-stretch bg-white rounded-xl overflow-hidden transition-all duration-300 ${
          variant === "header"
            ? "border-[1.5px] border-[#ff0055] focus-within:ring-4 focus-within:ring-[#ff0055]/15 shadow-sm"
            : variant === "mobile"
              ? "bg-white/10 text-white rounded-xl border border-white/15 focus-within:bg-white/15"
              : "border border-black/10 rounded-xl focus-within:border-black"
        }`}
      >
        {variant === "header" && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              document.dispatchEvent(new Event("open-sourcing"));
            }}
            className="pl-3.5 pr-2 flex items-center justify-center bg-white hover:bg-gray-50 transition-colors cursor-pointer shrink-0"
            aria-label="Search by Image"
            title="Search with Image / Sourcing"
          >
            <Camera size={18} strokeWidth={2} className="text-[#ff0055]" />
          </button>
        )}

        {variant === "mobile" && (
          <div className="pl-3.5 flex items-center justify-center">
            <Search size={16} className="text-white/70" />
          </div>
        )}

        <input
          ref={inputRef}
          id={variant === "header" ? "header-search" : "mobile-menu-search"}
          type="search"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onQueryChange(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className={`bg-transparent outline-none text-[13px] w-full py-2.5 px-2.5 ${
            variant === "mobile"
              ? "text-white placeholder:text-white/50"
              : "text-black placeholder:text-black/40"
          }`}
        />

        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              onQueryChange("");
              setSelectedIndex(-1);
              inputRef.current?.focus();
            }}
            className={`shrink-0 px-2.5 flex items-center transition-colors cursor-pointer ${
              variant === "mobile"
                ? "text-white/70 hover:text-white"
                : "text-gray-400 hover:text-black bg-white"
            }`}
          >
            <X size={15} />
          </button>
        )}

        {variant === "header" && (
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onSearchSubmit?.();
            }}
            className="bg-[#ff0055] hover:bg-[#e6004c] text-white px-5 xl:px-7 flex items-center justify-center transition-colors shrink-0 cursor-pointer shadow-sm"
            aria-label="Submit Search"
          >
            <Search size={18} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* INTELLIGENT PREDICTIVE DROPDOWN POPUP */}
      {isOpen && (
        <div
          className={`absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-black/10 overflow-hidden text-black animate-in fade-in-50 zoom-in-95 duration-150 ${
            variant === "header" ? "min-w-[340px] xl:min-w-[480px] -left-2 -right-2" : "w-full"
          }`}
          style={{ maxHeight: "80vh", overflowY: "auto" }}
        >
          {/* STATE 1: User typed something and matches exist */}
          {cleanQ &&
            (matchedProducts.length > 0 ||
              matchedCategories.length > 0 ||
              matchedBrands.length > 0) && (
              <div className="p-3 space-y-3">
                {/* Category & Brand Pills */}
                {(matchedCategories.length > 0 || matchedBrands.length > 0) && (
                  <div className="pb-2 border-b border-black/5 flex flex-wrap items-center gap-1.5 px-1">
                    <span className="text-[11px] font-semibold text-black/40 uppercase tracking-wider mr-1">
                      Matching:
                    </span>
                    {matchedCategories.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          onSelectCategory?.(c as Category);
                          setIsOpen(false);
                          onSearchSubmit?.();
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/5 hover:bg-black hover:text-white text-xs text-black/80 font-medium transition-all cursor-pointer"
                      >
                        <Tag size={11} /> {c}
                      </button>
                    ))}
                    {matchedBrands.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => {
                          onSelectBrand?.(b);
                          setIsOpen(false);
                          onSearchSubmit?.();
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#ff0055]/10 text-[#ff0055] hover:bg-[#ff0055] hover:text-white text-xs font-semibold transition-all cursor-pointer"
                      >
                        <Sparkles size={11} /> Brand: {b}
                      </button>
                    ))}
                  </div>
                )}

                {/* Matched Products List */}
                {matchedProducts.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between px-2 pb-1 text-xs font-bold text-black/50">
                      <span>Products ({matchedProducts.length})</span>
                      <span className="text-[11px] font-normal text-black/40">
                        Use ↑↓ arrows to pick
                      </span>
                    </div>

                    <div className="space-y-1 mt-1">
                      {matchedProducts.map((p, idx) => {
                        const isSelected = selectedIndex === idx;
                        return (
                          <Link
                            key={p.id}
                            to="/product/$id"
                            params={{ id: p.slug || p.id }}
                            onClick={() => {
                              onSelectProduct?.(p);
                              setIsOpen(false);
                            }}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
                              isSelected
                                ? "bg-black/5 ring-1 ring-black/10 scale-[1.005]"
                                : "hover:bg-black/[0.03]"
                            }`}
                          >
                            <div
                              className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 ${p.bg}`}
                            >
                              <SafeImage
                                src={p.img}
                                alt=""
                                className="w-full h-full object-cover"
                                width={48}
                                height={48}
                              />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <span className="text-xs font-bold text-black truncate leading-tight">
                                {highlightMatch(p.display_name || p.name, query)}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-black/50">
                                <span className="truncate">{p.category}</span>
                                {p.brand && (
                                  <>
                                    <span>·</span>
                                    <span className="font-semibold text-black/70">{p.brand}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-bold text-black block">
                                {formatPKR(p.price)}
                              </span>
                              {p.original_price && p.original_price > p.price && (
                                <span className="text-[10px] text-red-600 font-semibold line-through">
                                  {formatPKR(p.original_price)}
                                </span>
                              )}
                            </div>
                            <ChevronRight size={14} className="text-black/30 shrink-0" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* View All Search Results Bar */}
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onSearchSubmit?.();
                  }}
                  className="w-full mt-2 py-2.5 px-4 bg-black/5 hover:bg-black hover:text-white rounded-xl text-xs font-semibold text-black flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>View all products matching &ldquo;{query}&rdquo;</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}

          {/* STATE 2: User typed something but NO matches */}
          {cleanQ &&
            matchedProducts.length === 0 &&
            matchedCategories.length === 0 &&
            matchedBrands.length === 0 && (
              <div className="p-6 text-center">
                <p className="text-sm font-semibold text-black/80">
                  No direct matches found for &ldquo;{query}&rdquo;
                </p>
                <p className="text-xs text-black/50 mt-1">
                  Try searching for general keywords like &ldquo;glass&rdquo;,
                  &ldquo;bedsheet&rdquo;, &ldquo;bottle&rdquo;, or &ldquo;jar&rdquo;.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onSearchSubmit?.();
                  }}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#ff0055] hover:underline"
                >
                  Search all catalog <ArrowRight size={12} />
                </button>
              </div>
            )}

          {/* STATE 3: Query is EMPTY — Show Trending & Popular Searches */}
          {!cleanQ && (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-black/60 px-1">
                <TrendingUp size={14} className="text-[#ff0055]" />
                <span>Trending Searches</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TRENDING_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      onQueryChange(term);
                      setIsOpen(false);
                      onSearchSubmit?.();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-black/[0.04] hover:bg-black hover:text-white text-xs font-medium text-black/75 transition-all cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>

              {/* Featured Categories Quick Jump */}
              <div className="pt-3 border-t border-black/5">
                <span className="text-[11px] font-bold text-black/40 uppercase tracking-wider px-1 block mb-2">
                  Popular Categories
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {categories.slice(0, 6).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        onSelectCategory?.(cat as Category);
                        setIsOpen(false);
                        onSearchSubmit?.();
                      }}
                      className="text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-black/70 hover:bg-black/5 hover:text-black truncate flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate">{cat}</span>
                      <ChevronRight size={12} className="text-black/30 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
