import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { SlidersHorizontal, ArrowRight } from "lucide-react";
import { useProducts, useFavourites } from "@/lib/shop";
import { CategoryArtwork } from "@/components/CategoryLanding";
import {
  CategoryLanding,
  collections,
  useCollection,
  collectionSubcategories,
} from "@/components/CategoryLanding";
import { taxonomyGroups } from "@/lib/category-taxonomy.js";
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
    sub?: string;
    q?: string;
    category?: string;
    page?: number;
    sort?: string;
    stock?: string;
    min?: string;
    max?: string;
  } => ({
    sub: typeof s.sub === "string" ? s.sub : undefined,
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
export function Index({ fixedCategory }: { fixedCategory?: string } = {}) {
  const rawSearch = useSearch({ strict: false }) as ReturnType<typeof Route.useSearch>;
  const search = {
      ...rawSearch,
      category:
        fixedCategory || (rawSearch.category === "Gadgets" ? "Household" : rawSearch.category),
    },
    navigate = useNavigate(),
    [cart, setCart] = useState(false),
    [filters, setFilters] = useState(false);
  const { isFav, toggleFav } = useFavourites();
  const collectionName =
    search.category && collections[search.category] ? search.category : undefined;
  const collection = useCollection(collectionName);
  const catalog = useProducts({
    enabled: !collectionName,
    page: search.page || 1,
    pageSize: 24,
    search: search.q,
    category: search.category,
    sort: search.sort,
    stock: search.stock,
    minPrice: search.min,
    maxPrice: search.max,
  });
  const selectedSub = collectionSubcategories(collectionName || "").find(
    (s) => s.name === search.sub,
  );
  const matching = collection.products.filter(
    (p) =>
      (!selectedSub || selectedSub.matches(p)) &&
      (!search.q || (p.name + " " + p.category).toLowerCase().includes(search.q.toLowerCase())) &&
      (!search.stock || (search.stock === "in" ? p.in_stock !== false : p.in_stock === false)) &&
      (!search.min || p.price >= Number(search.min)) &&
      (!search.max || p.price <= Number(search.max)),
  );
  if (search.sort === "price-asc") matching.sort((a, b) => a.price - b.price);
  if (search.sort === "price-desc") matching.sort((a, b) => b.price - a.price);
  const { products, total, loading, error, refetch } = collectionName
    ? {
        ...collection,
        products: matching.slice(((search.page || 1) - 1) * 24, (search.page || 1) * 24),
        total: matching.length,
      }
    : catalog;
  const filtered = !!(search.q || search.category || search.stock || search.min || search.max);
  function update(patch: Partial<typeof search>) {
    void navigate({
      to: fixedCategory && patch.category !== "" ? "/category/$category" : "/",
      params: { category: (patch.category || fixedCategory || "").toLowerCase() },
      search: {
        ...search,
        ...(patch.category !== undefined ? { sub: undefined } : {}),
        ...patch,
        page: patch.page || 1,
      },
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
          {taxonomyGroups.map((c) => (
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
        onClick={() =>
          void navigate({
            to: "/",
            search: collectionName ? { category: collectionName } : {},
            hash: "shop",
          })
        }
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
      <StoreHeader onOpenCart={() => setCart(true)} floating={false} />
      <main>
        {!filtered && (search.page || 1) === 1 && (
          <>
            <section
              className="dm-category-edit dm-section"
              aria-label="Shop Dawood Mart collections"
            >
              <div className="dm-edit-heading">
                <div>
                  <p className="dm-eyebrow">MADE FOR EVERYDAY LIVING</p>
                  <h1>A little more home.</h1>
                </div>
                <p>Thoughtful finds for the spaces you love.</p>
              </div>
              <div className="dm-edit-grid">
                {taxonomyGroups.map((group, index) => (
                  <a
                    key={group.name}
                    href={`/category/${group.name.toLowerCase()}`}
                    className="dm-edit-card"
                  >
                    <CategoryArtwork name={group.name} eager={index < 2} />
                    <div className="dm-edit-label">
                      <span className="dm-eyebrow">0{index + 1} / THE COLLECTION</span>
                      <h2>{group.name}</h2>
                      <span>
                        Explore collection <ArrowRight size={18} />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          </>
        )}
        {collectionName && (
          <CategoryLanding
            name={collectionName}
            products={collection.products}
            loading={collection.loading}
            sub={search.sub}
            onSubcategory={(sub) => update({ sub })}
            isFav={isFav}
            toggleFav={toggleFav}
          />
        )}
        <section id="shop" className="dm-section dm-shop">
          <div className="dm-section-heading">
            <div>
              <p className="dm-eyebrow">THE DAWOOD MART COLLECTION</p>
              <h2>
                {search.q
                  ? `Results for “${search.q}”`
                  : selectedSub?.name ||
                    search.category ||
                    "Everyday favourites, waiting to be found."}
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
