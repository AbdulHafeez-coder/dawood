import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { taxonomyGroups } from "@/lib/category-taxonomy.js";
import { publicProducts } from "@/lib/product-queries";
import { supabase } from "@/lib/supabase";
import { rowToProduct, type Product } from "@/lib/shop";
import { ProductCard } from "./ProductCard";
import { StoreImage } from "./StoreImage";
import { formatPKR } from "@/lib/format";
import "./category-landing.css";

export const collections: Record<
  string,
  { title: string; intro: string; note: string; sources: string[]; tone: string }
> = {
  Sheets: {
    title: "A fresh perspective on your everyday spaces.",
    intro:
      "Start with the table. Find sheets, runners and wall coverings for the corners you call home.",
    note: "Match the size to your surface. Check each product’s listed dimensions, material and care information before choosing.",
    sources: ["Home Sheets & Covers", "Textiles", "Wall paper sheets"],
    tone: "sand",
  },
  Towels: {
    title: "Make room for your daily rituals.",
    intro: "Find a towel for the bathroom, the washbasin and the everyday moments in between.",
    note: "Choose by use and size. Materials, set contents and care instructions vary; consult the individual product description.",
    sources: ["Towels"],
    tone: "sage",
  },
  Crockery: {
    title: "Good company. A table that feels like you.",
    intro: "Bring your table together with bowls, drinkware, serving pieces and kitchen storage.",
    note: "Build around how you eat and serve. Check the listed material, piece count and care instructions for each item.",
    sources: [
      "Containers",
      "Jars",
      "Glasses",
      "Tea Mugs",
      "Serving Bowls",
      "Serving Plates",
      "Serving & Dining",
      "Cups & Drinkware",
      "Ceramics",
      "Food Warmers",
      "Kitchenware",
      "Kitchen Ware",
      "Glass Bottle",
      "Drinkware",
      "JUGS",
      "Tumbler",
      "Kitchen Items",
      "Air-tight Containers",
    ],
    tone: "sky",
  },
  Gadgets: {
    title: "Little discoveries for everyday tasks.",
    intro: "Explore household and kitchen gadgets, and find the right fit for your routine.",
    note: "Choose for the task at hand. Check dimensions, power requirements and included accessories where listed on the product.",
    sources: ["Electronics & Gadgets"],
    tone: "peach",
  },
};

// Preserve the existing navigation taxonomy while accepting current source labels.
export function collectionSubcategories(name: string) {
  const group = taxonomyGroups.find((g) => g.name === name);
  return (group?.subcategories || []).map((sub) => ({
    ...sub,
    matches: (p: Product) => {
      const category =
        p.category === "Wall paper sheets"
          ? "Home Sheets & Covers"
          : p.category === "Kitchen Items"
            ? "Kitchenware"
            : p.category === "Air-tight Containers"
              ? "Containers"
              : p.category;
      return (
        sub.matches({ ...p, category }) ||
        (name === "Sheets" &&
          sub.name === "Wallpaper Sheets" &&
          /wall\s*paper|wall\s*sheet/i.test(p.name))
      );
    },
  }));
}

// Read-only, category-scoped catalog. Page through all matching rows so subcategory
// discovery and totals do not silently stop at the first API page.
export function useCollection(name?: string) {
  const [state, setState] = useState<{
    name?: string;
    products: Product[];
    loading: boolean;
    error: string;
  }>({ products: [], loading: true, error: "" });
  const [revision, retry] = useState(0);
  useEffect(() => {
    if (!name || !collections[name]) return;
    const controller = new AbortController();
    let active = true;
    setState({ name, products: [], loading: true, error: "" });
    const timeout = setTimeout(() => controller.abort(), 20000);
    void (async () => {
      try {
        const products: Product[] = [];
        for (let offset = 0; ; offset += 100) {
          const { data, error } = await publicProducts(supabase)
            .in("category", collections[name].sources)
            .order("created_at", { ascending: false })
            .order("id")
            .range(offset, offset + 99)
            .abortSignal(controller.signal);
          if (error || controller.signal.aborted) throw error || new Error("Request timed out");
          products.push(...(data || []).map(rowToProduct).filter((p) => p.is_active === true));
          if (!data || data.length < 100) break;
        }
        if (active) setState({ name, products, loading: false, error: "" });
      } catch {
        if (active)
          setState({
            name,
            products: [],
            loading: false,
            error: "Unable to load this collection. Please retry.",
          });
      } finally {
        clearTimeout(timeout);
      }
    })();
    return () => {
      active = false;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [name, revision]);
  return {
    ...(state.name === name ? state : { products: [], loading: true, error: "" }),
    refetch: () => retry((n) => n + 1),
  };
}

export function CategoryLanding({
  name,
  products,
  loading,
  sub,
  onSubcategory,
  isFav,
  toggleFav,
}: {
  name: string;
  products: Product[];
  loading: boolean;
  sub?: string;
  onSubcategory: (name?: string) => void;
  isFav: (id: string) => boolean;
  toggleFav: (p: Product) => void;
}) {
  const content = collections[name];
  const hero = products.find((p) => p.img && p.in_stock !== false) || products.find((p) => p.img);
  const categories = collectionSubcategories(name)
    .map((s) => ({ ...s, product: products.find((p) => s.matches(p) && p.img) }))
    .filter((s) => s.product);
  const picks = products.filter((p) => p.in_stock !== false).slice(0, 4);
  return (
    <div className="dm-collection">
      <nav className="dm-collection-nav dm-section" aria-label="Collections">
        <a href="/">Home</a>
        <span aria-hidden="true">/</span>
        {taxonomyGroups.map((g) => (
          <a
            key={g.name}
            href={`/?category=${g.name}`}
            aria-current={g.name === name ? "page" : undefined}
          >
            {g.name}
          </a>
        ))}
      </nav>
      <section
        className={`dm-collection-hero dm-panel-${content.tone}`}
        aria-label={`${name} collection`}
      >
        <div className="dm-collection-copy">
          <p className="dm-eyebrow">THE DAWOOD MART EDIT · {name.toUpperCase()}</p>
          <h1>
            <span>{name}</span>
            {content.title}
          </h1>
          <p>{content.intro}</p>
          <a className="dm-button" href="#shop">
            Shop Now <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
        <div className="dm-collection-visual">
          {hero ? (
            <>
              <StoreImage
                key={hero.id}
                src={hero.gallery?.find((src) => src && src !== hero.img) || hero.img}
                alt={hero.display_name || hero.name}
                loading="eager"
                fetchPriority="high"
                sizes="(max-width: 767px) 100vw, 55vw"
              />
              <a className="dm-collection-caption" href={`/product/${hero.slug || hero.id}`}>
                <span>
                  {hero.display_name || hero.name}
                  <strong>{formatPKR(hero.price)}</strong>
                </span>
                <ArrowRight size={20} aria-hidden="true" />
              </a>
            </>
          ) : (
            <div className="dm-collection-placeholder" aria-busy={loading}>
              <span>{name}</span>
              <p>
                {loading
                  ? "Finding your next everyday favourite…"
                  : "Explore the collection below."}
              </p>
            </div>
          )}
        </div>
      </section>
      {categories.length > 0 && (
        <section className="dm-section dm-collection-discover">
          <div className="dm-section-heading">
            <div>
              <p className="dm-eyebrow">FIND YOUR FIT</p>
              <h2>Shop {name.toLowerCase()} your way.</h2>
            </div>
            <a href="#shop" onClick={() => onSubcategory(undefined)}>
              Shop all <ArrowRight size={16} />
            </a>
          </div>
          <nav className="dm-collection-subcategories" aria-label={`${name} subcategories`}>
            {categories.map((s) => (
              <a
                key={s.name}
                href={`/?category=${name}&sub=${encodeURIComponent(s.name)}#shop`}
                aria-current={sub === s.name ? "true" : undefined}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
                    e.preventDefault();
                    onSubcategory(s.name);
                  }
                }}
              >
                <StoreImage
                  src={s.product!.img}
                  alt={s.name}
                  loading="lazy"
                  sizes="(max-width: 767px) 40vw, 18vw"
                />
                <span>
                  {s.name}
                  <ArrowRight size={16} aria-hidden="true" />
                </span>
              </a>
            ))}
          </nav>
        </section>
      )}
      {picks.length > 0 && (
        <section className="dm-section dm-collection-featured" aria-label="Featured products">
          <div className="dm-section-heading">
            <div>
              <p className="dm-eyebrow">A CLOSER LOOK</p>
              <h2>Discover your next favourite.</h2>
            </div>
            <a href="#shop">
              See the collection <ArrowRight size={16} />
            </a>
          </div>
          <div className="dm-product-grid">
            {picks.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                isFavourite={isFav(p.id)}
                onToggleFav={toggleFav}
              />
            ))}
          </div>
        </section>
      )}
      <aside className="dm-section dm-collection-guide">
        <div>
          <p className="dm-eyebrow">THOUGHTFUL CHOICES, EVERY DAY</p>
          <h2>Find what works for your home.</h2>
          <p>{content.note}</p>
        </div>
        {hero?.description && (
          <div className="dm-collection-detail">
            <p className="dm-eyebrow">FROM THE PRODUCT DETAILS</p>
            <h3>{hero.display_name || hero.name}</h3>
            <p>
              {hero.description.replace(/<[^>]*>/g, " ").slice(0, 350)}
              {hero.description.length > 350 ? "…" : ""}
            </p>
            <a href={`/product/${hero.slug || hero.id}`}>
              Read product details <ArrowRight size={16} />
            </a>
          </div>
        )}
      </aside>
    </div>
  );
}
