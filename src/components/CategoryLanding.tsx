import { useEffect, useState } from "react";
import {
  ArrowRight,
  Utensils,
  Coffee,
  GlassWater,
  CookingPot,
  Package,
  Wrench,
  Container,
  Brush,
  Zap,
  Archive,
  House,
} from "lucide-react";
import { taxonomyGroups, productPlacement } from "@/lib/category-taxonomy.js";
import { publicProducts } from "@/lib/product-queries";
import { supabase } from "@/lib/supabase";
import { rowToProduct, type Product } from "@/lib/shop";
import { StoreImage } from "./StoreImage";
import { formatPKR } from "@/lib/format";
import "./category-landing.css";

export const collections: Record<string, { title: string; intro: string }> = {
  Sheets: {
    title: "A fresh layer of living.",
    intro: "Table coverings, protective sheets and wallpaper for your everyday spaces.",
  },
  Towels: {
    title: "Everyday rituals, beautifully simple.",
    intro: "Find the right towel for your bathroom, washbasin and daily routine.",
  },
  Crockery: {
    title: "Gather around something lovely.",
    intro:
      "From your morning cup to a table full of guests. Discover pieces for serving, sipping and sharing.",
  },
  Household: {
    title: "Make everyday feel effortless.",
    intro: "Practical kitchen helpers, useful storage and thoughtful essentials for your home.",
  },
};
const positions: Record<string, number> = { Sheets: 0, Towels: 1, Crockery: 2, Household: 3 };
let categoryImageRequest: Promise<Record<string, string>> | undefined;
function useCategoryImages() {
  const [images, setImages] = useState<Record<string, string>>({});
  useEffect(() => {
    let active = true;
    categoryImageRequest ||= Promise.resolve(
      supabase.from("categories").select("name,image_url"),
    ).then(({ data }) =>
      Object.fromEntries(
        (data || []).filter((c) => c.image_url).map((c) => [c.name, c.image_url!]),
      ),
    );
    categoryImageRequest
      .then((images) => {
        if (active) setImages(images);
      })
      .catch(() => {
        categoryImageRequest = undefined;
      });
    return () => {
      active = false;
    };
  }, []);
  return images;
}
export function CategoryArtwork({ name, eager = false }: { name: string; eager?: boolean }) {
  const images = useCategoryImages();
  if (images[name])
    return (
      <div className="dm-category-custom">
        <StoreImage src={images[name]} alt={name} loading={eager ? "eager" : "lazy"} />
      </div>
    );
  return (
    <div className="dm-category-art" role="img" aria-label={`${name} lifestyle collection`}>
      <img
        src="/images/storefront/category-editorial.webp"
        alt=""
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        style={{ left: `-${(positions[name] || 0) * 100}%` }}
      />
    </div>
  );
}
export function collectionSubcategories(name: string) {
  const group = taxonomyGroups.find((g) => g.name === name);
  return (group?.subcategories || []).map((sub) => ({
    ...sub,
    matches: (p: Product) =>
      sub.matches(p) ||
      (name === "Sheets" && sub.name === "Wallpaper Sheets" && p.category === "Wall paper sheets"),
  }));
}
function belongs(p: Product, name: string) {
  if (name === "Sheets")
    return [
      "Sheets",
      "Home Sheets & Covers",
      "Textiles",
      "Wall paper sheets",
      "Daining Table Sheets",
    ].includes(p.category);
  if (name === "Towels") return p.category === "Towels";
  return productPlacement(p)?.group === name;
}
// Full active catalog pagination avoids losing matching products after the first API page.
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
    const timeout = setTimeout(() => controller.abort(), 20000);
    let active = true;
    setState({ name, products: [], loading: true, error: "" });
    void (async () => {
      try {
        const products: Product[] = [];
        for (let offset = 0; ; offset += 100) {
          const { data, error } = await publicProducts(supabase)
            .order("created_at", { ascending: false })
            .order("id")
            .range(offset, offset + 99)
            .abortSignal(controller.signal);
          if (error || controller.signal.aborted) throw error || new Error("Timed out");
          products.push(
            ...(data || [])
              .map(rowToProduct)
              .filter((p) => p.is_active === true && belongs(p, name)),
          );
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
const subcategoryIcons: Record<string, typeof Utensils> = {
  "Dinner Sets": Utensils,
  "Cups & Mugs": Coffee,
  Glasses: GlassWater,
  "Jugs & Water Sets": GlassWater,
  "Serving & Storage": CookingPot,
  "Kitchen Tools": Wrench,
  "Plastic Kitchen Items": Container,
  "Cleaning Items": Brush,
  "Electric Kettles": Zap,
  "Kitchen Gadgets": Wrench,
  "Storage & Organizers": Archive,
  "Cleaning Essentials": Brush,
  "Home Utility Items": House,
  "Other Household Items": Package,
};
function EmptyCategoryImage({ name, loading }: { name: string; loading: boolean }) {
  const Icon = subcategoryIcons[name] || Package;
  return (
    <div className="dm-subcategory-empty">
      <Icon size={52} strokeWidth={1} aria-label={name} />
      <p>{loading ? "Loading collection…" : "Coming to the collection"}</p>
    </div>
  );
}
export function CategoryLanding({
  name,
  products,
  loading,
  sub,
  onSubcategory,
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
  const images = useCategoryImages();
  const categories = collectionSubcategories(name).map((s) => {
    const matching = products.filter((p) => s.matches(p));
    return {
      ...s,
      products: matching,
      preview: matching.find((p) => p.img && p.in_stock !== false) || matching.find((p) => p.img),
    };
  });
  return (
    <div className="dm-collection">
      <nav className="dm-collection-nav dm-section" aria-label="Collections">
        <a href="/">Home</a>
        {taxonomyGroups.map((g) => (
          <a
            key={g.name}
            href={`/category/${g.name.toLowerCase()}`}
            aria-current={g.name === name ? "page" : undefined}
          >
            {g.name}
          </a>
        ))}
      </nav>
      <section className="dm-collection-hero">
        <div className="dm-collection-copy">
          <p className="dm-eyebrow">THE DAWOOD MART EDIT / {name}</p>
          <h1>{content.title}</h1>
          <p>{content.intro}</p>
          <a className="dm-button" href="#shop">
            Shop {name} <ArrowRight size={18} />
          </a>
        </div>
        <CategoryArtwork name={name} eager />
      </section>
      <section className="dm-section dm-collection-discover">
        <div className="dm-section-heading">
          <div>
            <p className="dm-eyebrow">FIND YOUR EVERYDAY</p>
            <h2>Explore {name.toLowerCase()}</h2>
          </div>
          <a href="#shop" onClick={() => onSubcategory(undefined)}>
            View all <ArrowRight size={16} />
          </a>
        </div>
        <nav className="dm-subcategory-grid" aria-label={`${name} subcategories`}>
          {categories.map((s) => (
            <a
              key={s.name}
              className="dm-subcategory-card"
              href={`/category/${name.toLowerCase()}?sub=${encodeURIComponent(s.name)}#shop`}
              aria-current={sub === s.name ? "true" : undefined}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
                  e.preventDefault();
                  onSubcategory(s.name);
                }
              }}
            >
              {s.preview || images[`${name} / ${s.name}`] ? (
                <StoreImage
                  className="dm-subcategory-cover"
                  src={images[`${name} / ${s.name}`] || s.preview!.img}
                  alt={s.name}
                  loading="lazy"
                  sizes="(max-width: 600px) 45vw, 25vw"
                />
              ) : (
                <EmptyCategoryImage name={s.name} loading={loading} />
              )}
              <div className="dm-subcategory-copy">
                <h3>
                  {s.name}
                  <ArrowRight size={17} />
                </h3>
                <p className="dm-subcategory-count">
                  {loading ? "Loading…" : `${s.products.length} products`}
                </p>
                {s.preview && (
                  <>
                    <p className="dm-preview-name">{s.preview.display_name || s.preview.name}</p>
                    <strong>{formatPKR(s.preview.price)}</strong>
                    <div className="dm-preview-thumbnails">
                      {[...new Set([s.preview.img, ...(s.preview.gallery || [])])]
                        .filter(Boolean)
                        .slice(0, 4)
                        .map((src) => (
                          <StoreImage
                            key={src}
                            src={src}
                            alt={s.preview!.name}
                            loading="lazy"
                            sizes="48px"
                          />
                        ))}
                    </div>
                  </>
                )}
              </div>
            </a>
          ))}
        </nav>
      </section>
    </div>
  );
}
