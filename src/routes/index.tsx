import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SlidersHorizontal, ArrowRight } from "lucide-react";
import { useProducts, useFavourites } from "@/lib/shop";
import { storefrontCategories } from "@/lib/storefront-categories";
import { StoreHeader } from "@/components/StoreHeader";
import { ProductCard } from "@/components/ProductCard";
import { SiteFooter } from "@/components/SiteFooter";
import { LazyCartDrawer } from "@/components/LazyCartDrawer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
export const Route = createFileRoute("/")({
  validateSearch: (
    s: Record<string, unknown>,
  ): {
    q?: string;
    category?: string;
    page?: number;
    sort?: string;
    stock?: string;
    min?: string;
    max?: string;
  } => ({
    q: typeof s.q === "string" ? s.q : undefined,
    category: typeof s.category === "string" ? s.category : undefined,
    page: s.page == null ? undefined : Math.max(1, Math.floor(Number(s.page) || 1)),
    sort: typeof s.sort === "string" ? s.sort : undefined,
    stock: typeof s.stock === "string" ? s.stock : undefined,
    min: typeof s.min === "string" ? s.min : undefined,
    max: typeof s.max === "string" ? s.max : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Dawood Mart — Home, kitchen & everyday essentials" },
      {
        name: "description",
        content:
          "Explore crockery, kitchenware, table sheets, towels and home essentials at Dawood Mart. Shop the collection in Pakistan.",
      },
    ],
  }),
  component: Index,
});
const heroPanels = [
  {
    title: "NEW ARRIVALS",
    image: "timy-mugs-group",
    alt: "Colourful insulated mugs from Dawood Mart",
    href: "/?sort=newest#shop",
    cta: "Discover new",
    tone: "sand",
  },
  {
    title: "KITCHEN & DINING",
    image: "7-pcs-bowl-set",
    alt: "Amber glass bowls and serving set",
    href: "/?category=Crockery%20%26%20Dining#shop",
    cta: "Set your table",
    tone: "sage",
  },
  {
    title: "WOMEN’S HOME PICKS",
    image: "crown-jar-dryfruits-gold-tray",
    alt: "Gold-accented glass jars on a serving tray",
    href: "/?category=Decoration%20%26%20Gifts#shop",
    cta: "Find your favourites",
    tone: "peach",
  },
  // This existing product is explicitly marked Bestseller in the catalog.
  {
    title: "BEST SELLERS",
    image: "luxury-lavender-bath-towel-set",
    alt: "Luxury lavender bath towel set",
    href: "/product/luxury-lavender-bath-towel-set",
    cta: "Explore the favourite",
    tone: "sky",
  },
];
const featured = storefrontCategories.filter((c) => c.image).slice(0, 6);
function Index() {
  const search = Route.useSearch(),
    navigate = useNavigate(),
    [cart, setCart] = useState(false),
    [filters, setFilters] = useState(false);
  const { isFav, toggleFav } = useFavourites();
  const { products, total, loading, error, refetch } = useProducts({
    page: search.page || 1,
    pageSize: 24,
    search: search.q,
    category: search.category,
    sort: search.sort,
    stock: search.stock,
    minPrice: search.min,
    maxPrice: search.max,
  });
  const filtered = !!(search.q || search.category || search.stock || search.min || search.max);
  function update(patch: Partial<typeof search>) {
    void navigate({
      to: "/",
      search: { ...search, ...patch, page: patch.page || 1 },
      hash: "shop",
    });
  }
  const controls = (
    <div className="dm-filter-fields">
      <label>
        Category
        <select
          value={search.category || ""}
          onChange={(e) => update({ category: e.target.value })}
        >
          <option value="">All categories</option>
          {storefrontCategories.map((c) => (
            <option key={c.name}>{c.name}</option>
          ))}
        </select>
      </label>
      <label>
        Availability
        <select value={search.stock || ""} onChange={(e) => update({ stock: e.target.value })}>
          <option value="">All products</option>
          <option value="in">In stock</option>
          <option value="out">Out of stock</option>
        </select>
      </label>
      <label>
        Minimum price (PKR)
        <input
          type="number"
          min="0"
          value={search.min || ""}
          onChange={(e) => update({ min: e.target.value })}
        />
      </label>
      <label>
        Maximum price (PKR)
        <input
          type="number"
          min="0"
          value={search.max || ""}
          onChange={(e) => update({ max: e.target.value })}
        />
      </label>
      <button
        className="dm-button dm-outline"
        onClick={() => void navigate({ to: "/", search: {}, hash: "shop" })}
      >
        Clear filters
      </button>
      <button className="dm-button" onClick={() => setFilters(false)}>
        Show results
      </button>
    </div>
  );
  return (
    <div className="storefront dm-home">
      <StoreHeader
        onOpenCart={() => setCart(true)}
        floating={!filtered && (search.page || 1) === 1}
      />
      <main>
        {!filtered && (search.page || 1) === 1 && (
          <>
            <section className="dm-editorial-hero" aria-label="Shop Dawood Mart collections">
              <h1 className="sr-only">Dawood Mart — everyday home essentials</h1>
              <div className="dm-hero-panels">
                {heroPanels.map((panel, index) => (
                  <a
                    key={panel.title}
                    href={panel.href}
                    className={`dm-hero-panel dm-panel-${panel.tone}`}
                  >
                    <h2>{panel.title}</h2>
                    <div className="dm-panel-visual">
                      <img
                        src={`/images/storefront/${panel.image}-480.webp`}
                        srcSet={`/images/storefront/${panel.image}-480.webp 480w, /images/storefront/${panel.image}-800.webp 800w`}
                        sizes="(max-width: 767px) 82vw, 25vw"
                        width={800}
                        height={800}
                        loading={index === 0 ? "eager" : "lazy"}
                        fetchPriority={index === 0 ? "high" : "auto"}
                        decoding="async"
                        alt={panel.alt}
                      />
                    </div>
                    <span className="dm-panel-cta">
                      {panel.cta}
                      <ArrowRight size={15} aria-hidden="true" />
                    </span>
                  </a>
                ))}
              </div>
              <p className="dm-hero-swipe">
                Swipe to explore <span aria-hidden="true">→</span>
              </p>
            </section>
            <section className="dm-section dm-categories">
              <div className="dm-section-heading">
                <div>
                  <p className="dm-eyebrow">FIND YOUR EVERYDAY</p>
                  <h2>A place for everything.</h2>
                </div>
                <a href="#shop">
                  Explore all <span aria-hidden="true">↗</span>
                </a>
              </div>
              <div className="dm-category-grid">
                {featured.map((c) => (
                  <a key={c.name} href={`/?category=${encodeURIComponent(c.name)}#shop`}>
                    <div>
                      <img
                        src={`/images/storefront/${c.image}-480.webp`}
                        sizes="(max-width: 767px) 42vw, 16vw"
                        width={480}
                        height={480}
                        loading="lazy"
                        decoding="async"
                        alt={c.name}
                      />
                    </div>
                    <span>
                      {c.name}
                      <ArrowRight size={17} />
                    </span>
                  </a>
                ))}
              </div>
            </section>
          </>
        )}
        <section id="shop" className="dm-section dm-shop">
          <div className="dm-section-heading">
            <div>
              <p className="dm-eyebrow">THE DAWOOD MART COLLECTION</p>
              <h2>
                {search.q
                  ? `Results for “${search.q}”`
                  : search.category || "Everyday favourites, waiting to be found."}
              </h2>
            </div>
            <span className="dm-result-count" aria-live="polite">
              {loading ? "Finding your essentials…" : `${total} products`}
            </span>
          </div>
          <div className="dm-toolbar">
            <button className="dm-filter-button" onClick={() => setFilters(true)}>
              <SlidersHorizontal size={17} />
              Filters{filtered ? " · Active" : ""}
            </button>
            <label className="dm-sort">
              Sort by
              <select
                aria-label="Sort products"
                value={search.sort || "newest"}
                onChange={(e) => update({ sort: e.target.value })}
              >
                <option value="newest">Newest first</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </label>
          </div>
          {error ? (
            <div role="alert" className="dm-empty">
              {error}
              <button className="dm-button" onClick={refetch}>
                Retry
              </button>
            </div>
          ) : loading ? (
            <div className="dm-product-grid" aria-label="Loading products" aria-busy="true">
              {Array.from({ length: 8 }, (_, i) => (
                <div className="dm-skeleton" key={i} />
              ))}
            </div>
          ) : products.length ? (
            <div className="dm-product-grid">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isFavourite={isFav(p.id)}
                  onToggleFav={toggleFav}
                />
              ))}
            </div>
          ) : (
            <div className="dm-empty">
              <h3>No products found</h3>
              <p>Try another search or clear your filters.</p>
              <button
                className="dm-button"
                onClick={() => void navigate({ to: "/", search: {}, hash: "shop" })}
              >
                Browse all products
              </button>
            </div>
          )}
          {total > 24 && (
            <nav className="dm-pagination" aria-label="Product pages">
              <button
                className="dm-button dm-outline"
                disabled={loading || (search.page || 1) <= 1}
                onClick={() => update({ page: (search.page || 1) - 1 })}
              >
                Previous
              </button>
              <span>
                Page {search.page || 1} of {Math.ceil(total / 24)}
              </span>
              <button
                className="dm-button dm-outline"
                disabled={loading || (search.page || 1) * 24 >= total}
                onClick={() => update({ page: (search.page || 1) + 1 })}
              >
                Next
              </button>
            </nav>
          )}
        </section>
        <section className="dm-story">
          <p className="dm-eyebrow">A LITTLE MORE HOME</p>
          <h2>
            Simple choices.
            <br />
            Everyday possibilities.
          </h2>
          <p>Set the table. Refresh a corner. Make room for the little moments.</p>
          <a className="dm-button dm-outline" href="/?category=Kitchen#shop">
            Discover kitchen essentials <ArrowRight size={18} />
          </a>
        </section>
      </main>
      <SiteFooter />
      <LazyCartDrawer open={cart} onClose={() => setCart(false)} />
      <Sheet open={filters} onOpenChange={setFilters}>
        <SheetContent className="dm-menu-panel overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Find your essentials</SheetTitle>
            <SheetDescription>Refine the collection.</SheetDescription>
          </SheetHeader>
          {controls}
        </SheetContent>
      </Sheet>
    </div>
  );
}
