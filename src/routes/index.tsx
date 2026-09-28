import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, ShoppingBag, MessageCircle, ArrowRight, RefreshCw } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { LazyCartDrawer } from "@/components/LazyCartDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useCatalog } from "@/lib/use-catalog";
import { STOREFRONT_CATEGORIES, STATUS_LABELS, type ProductStatus } from "@/lib/catalog-model";
import { useCart, useFavourites } from "@/lib/shop";
import { useSettings } from "@/lib/settings";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
export const Route = createFileRoute("/")({
  component: Storefront,
  head: () => ({
    meta: [
      { title: "Dawood Mart — Sheets, Crockery & Home Essentials" },
      {
        name: "description",
        content:
          "Browse real home essentials at Dawood Mart. Shop sheets, crockery and towels in Pakistan, or request products on WhatsApp.",
      },
      { property: "og:title", content: "Dawood Mart — Your everyday home store" },
    ],
    links: [{ rel: "canonical", href: "https://dawood-virid.vercel.app/" }],
  }),
});
function Storefront() {
  const [search, setSearch] = useState(""),
    [category, setCategory] = useState(""),
    [subcategory, setSubcategory] = useState(""),
    [status, setStatus] = useState<ProductStatus | "">(""),
    [page, setPage] = useState(0),
    [maxPrice, setMaxPrice] = useState(""),
    [sort, setSort] = useState<"recommended" | "price-asc" | "price-desc">("recommended"),
    [cartOpen, setCartOpen] = useState(false);
  const term = useDebouncedValue(search, 300);
  const { cartCount } = useCart();
  const { isFav, toggleFav } = useFavourites();
  const settings = useSettings();
  const catalog = useCatalog({
    search: term,
    category,
    subcategory,
    status,
    page,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    sort,
  });
  const chooseCategory = (value: string) => {
    setCategory(value);
    setSubcategory("");
    setPage(0);
  };
  const phone = settings.whatsappNumber.replace(/\D/g, "").replace(/^0/, "92");
  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900">
      <div className="bg-emerald-950 px-4 py-2 text-center text-xs text-white">
        Home essentials, thoughtfully selected. Lahore, Pakistan.
      </div>
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-4 sm:px-6">
          <Link to="/" className="mr-auto text-xl font-extrabold tracking-tight text-emerald-950">
            Dawood<span className="font-normal"> Mart</span>
          </Link>
          <a
            href={`https://wa.me/${phone}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Contact Dawood Mart on WhatsApp"
            className="p-2 text-emerald-800"
          >
            <MessageCircle size={22} />
          </a>
          <button
            onClick={() => setCartOpen(true)}
            aria-label={`Open cart, ${cartCount} items`}
            className="flex items-center gap-2 rounded-full bg-stone-100 px-3 py-2"
          >
            <ShoppingBag size={20} />
            <span className="text-sm">{cartCount}</span>
          </button>
          <label className="relative order-last w-full sm:order-none sm:mx-auto sm:max-w-lg">
            <Search size={18} className="absolute left-3 top-3 text-stone-500" />
            <span className="sr-only">Search products</span>
            <input
              id="catalog-search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search products or product ID"
              className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50 pl-10 pr-3 text-sm outline-emerald-700"
            />
          </label>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <nav
          id="collections"
          aria-label="Product categories"
          className="flex gap-2 overflow-x-auto py-5"
        >
          <button
            onClick={() => chooseCategory("")}
            className={`shrink-0 rounded-full px-5 py-2.5 text-sm ${!category ? "bg-emerald-900 text-white" : "border bg-white"}`}
          >
            All products
          </button>
          {STOREFRONT_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => chooseCategory(c)}
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm ${category === c ? "bg-emerald-900 text-white" : "border bg-white"}`}
            >
              {c}
            </button>
          ))}
        </nav>
        {!search && !category && page === 0 && (
          <section className="mb-8 rounded-3xl bg-emerald-950 px-6 py-9 text-white sm:px-10 sm:py-12">
            <p className="mb-3 text-xs uppercase tracking-[.2em] text-emerald-200">
              Dawood Mart · Everyday essentials
            </p>
            <h1 className="max-w-xl text-3xl font-semibold leading-tight sm:text-5xl">
              A little more comfort.
              <br />A home that feels yours.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-emerald-100">
              Explore sheets, crockery and towels. Can't find it in stock? Request it directly from
              our team.
            </p>
            <a
              href="#shop"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-emerald-950"
            >
              Explore the catalog <ArrowRight size={16} />
            </a>
          </section>
        )}
        <section id="shop" className="scroll-mt-40">
          <div className="mb-4 flex items-end justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-widest text-stone-500">The catalog</p>
              <h2 className="mt-1 text-2xl font-semibold">
                {search ? "Search results" : category || "Explore our products"}
              </h2>
            </div>
            {!catalog.loading && !catalog.error && (
              <span className="text-xs text-stone-500">{catalog.total} products</span>
            )}
          </div>
          <div className="mb-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <label className="text-xs text-stone-600">
              Availability
              <select
                aria-label="Availability"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as ProductStatus | "");
                  setPage(0);
                }}
                className="mt-1 block h-11 w-full rounded-lg border bg-white px-3 text-sm"
              >
                <option value="">All availability</option>
                {(["available", "on_demand", "sold_out", "coming_soon"] as const).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-stone-600">
              Sort
              <select
                aria-label="Sort products"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as typeof sort);
                  setPage(0);
                }}
                className="mt-1 block h-11 w-full rounded-lg border bg-white px-3 text-sm"
              >
                <option value="recommended">Available first</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </label>
            <label className="text-xs text-stone-600">
              Maximum price (PKR)
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setPage(0);
                }}
                placeholder="Any price"
                className="mt-1 block h-11 w-full rounded-lg border bg-white px-3 text-sm"
              />
            </label>
            {category === "Sheets" && (
              <label className="text-xs text-stone-600">
                Sheet type
                <select
                  aria-label="Sheet type"
                  value={subcategory}
                  onChange={(e) => {
                    setSubcategory(e.target.value);
                    setPage(0);
                  }}
                  className="mt-1 block h-11 w-full rounded-lg border bg-white px-3 text-sm"
                >
                  <option value="">All sheets</option>
                  <option>Table Sheets</option>
                  <option>Wallpaper Sheets</option>
                </select>
              </label>
            )}
          </div>
          {catalog.loading ? (
            <div
              aria-label="Loading products"
              className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4"
            >
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="aspect-[.7] animate-pulse rounded-2xl bg-stone-200" />
              ))}
            </div>
          ) : catalog.error ? (
            <div role="alert" className="rounded-2xl border bg-white p-8 text-center">
              <p>{catalog.error}</p>
              <button
                onClick={catalog.retry}
                className="mx-auto mt-4 flex items-center gap-2 rounded-lg bg-emerald-900 px-5 py-3 text-white"
              >
                <RefreshCw size={16} />
                Try again
              </button>
            </div>
          ) : catalog.products.length ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {catalog.products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isFavourite={isFav(p.id)}
                  onToggleFav={toggleFav}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border bg-white p-10 text-center">
              <h3 className="font-semibold">No matching products</h3>
              <p className="mt-2 text-sm text-stone-500">Try another name, product ID or filter.</p>
              <button
                onClick={() => {
                  setSearch("");
                  chooseCategory("");
                  setStatus("");
                  setMaxPrice("");
                }}
                className="mt-4 underline"
              >
                Clear filters
              </button>
            </div>
          )}
          {!catalog.loading && catalog.total > 24 && (
            <nav aria-label="Catalog pages" className="mt-7 flex items-center justify-center gap-5">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border bg-white px-4 py-3 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm">
                {page + 1} / {Math.ceil(catalog.total / 24)}
              </span>
              <button
                disabled={(page + 1) * 24 >= catalog.total}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border bg-white px-4 py-3 disabled:opacity-40"
              >
                Next
              </button>
            </nav>
          )}
        </section>
      </main>
      <SiteFooter />
      <div className="h-20 lg:hidden" />
      <MobileBottomNav
        onOpenCart={() => setCartOpen(true)}
        onOpenCategories={() =>
          document.getElementById("collections")?.scrollIntoView({ behavior: "smooth" })
        }
      />
      <LazyCartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
