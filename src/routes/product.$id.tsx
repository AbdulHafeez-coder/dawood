import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Minus, Plus, ArrowLeft } from "lucide-react";
import { getProductAsync, useProducts, useCart, useFavourites } from "@/lib/shop";
import { assertPurchasable, canPurchase } from "@/lib/product-availability";
import { supabase } from "@/lib/supabase";
import { customerCategory } from "@/lib/storefront-categories";
import { formatPKR } from "@/lib/format";
import { toast } from "sonner";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreImage } from "@/components/StoreImage";
import { ProductCard } from "@/components/ProductCard";
import { SiteFooter } from "@/components/SiteFooter";
import { LazyCartDrawer } from "@/components/LazyCartDrawer";
export const Route = createFileRoute("/product/$id")({
  loader: async ({ params }) => {
    const product = await getProductAsync(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.product.display_name || "Product"} — Dawood Mart` },
      {
        name: "description",
        content:
          loaderData?.product.seo_description ||
          "Explore home and kitchen essentials at Dawood Mart.",
      },
    ],
  }),
  component: ProductPage,
  notFoundComponent: () => <ProductMessage text="This product is not available." />,
  errorComponent: () => <ProductMessage text="Unable to load this product. Please try again." />,
});
function ProductMessage({ text }: { text: string }) {
  return (
    <div className="storefront">
      <main className="dm-empty">
        <h1>{text}</h1>
        <Link to="/" className="dm-button">
          Back to shop
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
function ProductPage() {
  const { product: p } = Route.useLoaderData(),
    { addToCart } = useCart(),
    { isFav, toggleFav } = useFavourites();
  const [cart, setCart] = useState(false),
    [qty, setQty] = useState(1),
    [active, setActive] = useState(0),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    setActive(0);
    setQty(1);
  }, [p.id]);
  const gallery = [...new Set([p.img, ...p.gallery].filter(Boolean))];
  const name = p.display_name || p.name;
  const { products: related } = useProducts({ category: p.category, pageSize: 5 });
  async function add() {
    if (busy || !canPurchase(p)) return;
    setBusy(true);
    try {
      await assertPurchasable(supabase, [p.id]);
      if (addToCart(p, qty, { baseId: p.id, baseName: name })) {
        toast.success("Added to your cart");
        setCart(true);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to check availability. Please retry.");
    } finally {
      setBusy(false);
    }
  }
  const details = p.details.filter(
    (d) => !/^\s*(brand|source|compare_at_price|seo|tags?|vendor|import|supplier)\s*:/i.test(d),
  );
  return (
    <div className="storefront dm-detail-page">
      <StoreHeader onOpenCart={() => setCart(true)} />
      <main>
        <div className="dm-breadcrumb">
          <Link to="/">
            <ArrowLeft size={16} />
            Shop
          </Link>
          <span>/</span>
          <a href={`/?category=${encodeURIComponent(customerCategory(p.category))}#shop`}>
            {customerCategory(p.category)}
          </a>
        </div>
        <section className="dm-detail">
          <div className="dm-gallery">
            <div className="dm-main-image">
              <StoreImage
                src={gallery[active] || p.img}
                alt={name}
                sizes="(max-width:767px) 100vw, 55vw"
                fetchPriority="high"
              />
            </div>
            {gallery.length > 1 && (
              <div className="dm-thumbnails">
                {gallery.map((src, i) => (
                  <button
                    key={src}
                    className={i === active ? "is-active" : ""}
                    aria-label={`View image ${i + 1}`}
                    aria-pressed={i === active}
                    onClick={() => setActive(i)}
                  >
                    <StoreImage src={src} alt="" sizes="72px" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="dm-detail-copy">
            <p className="dm-eyebrow">MADE FOR YOUR EVERYDAY</p>
            <h1>{name}</h1>
            <div className="dm-price">
              <strong>{formatPKR(p.price)}</strong>
              {p.original_price && p.original_price > p.price ? (
                <del>{formatPKR(p.original_price)}</del>
              ) : null}
            </div>
            <p className="dm-availability" role="status">
              {canPurchase(p) ? "In stock" : "Out of stock"}
            </p>
            <p className="dm-description">{p.description}</p>
            <div className="dm-purchase">
              <div className="dm-quantity">
                <button
                  aria-label="Decrease quantity"
                  disabled={qty === 1}
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <Minus size={16} />
                </button>
                <span>{qty}</span>
                <button aria-label="Increase quantity" onClick={() => setQty((q) => q + 1)}>
                  <Plus size={16} />
                </button>
              </div>
              <button className="dm-button" disabled={!canPurchase(p) || busy} onClick={add}>
                {busy ? "Checking…" : canPurchase(p) ? "Add to cart" : "Out of stock"}
              </button>
              <button
                className="dm-icon dm-outline"
                aria-label="Save to favourites"
                aria-pressed={isFav(p.id)}
                onClick={() => toggleFav(p)}
              >
                <Heart size={20} fill={isFav(p.id) ? "currentColor" : "none"} />
              </button>
            </div>
            {details.length > 0 && (
              <details open className="dm-product-details">
                <summary>Product details</summary>
                <ul>
                  {details.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </details>
            )}
            <details className="dm-product-details">
              <summary>Delivery & returns</summary>
              <p>
                View our <Link to="/shipping">delivery information</Link> and{" "}
                <Link to="/returns">returns policy</Link>. Need help?{" "}
                <Link to="/support">Contact Dawood Mart</Link>.
              </p>
            </details>
          </div>
        </section>
        {related.some((r) => r.id !== p.id) && (
          <section className="dm-section">
            <div className="dm-section-heading">
              <h2>A little more to discover.</h2>
            </div>
            <div className="dm-product-grid">
              {related
                .filter((r) => r.id !== p.id)
                .slice(0, 4)
                .map((r) => (
                  <ProductCard
                    key={r.id}
                    product={r}
                    isFavourite={isFav(r.id)}
                    onToggleFav={toggleFav}
                  />
                ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
      <LazyCartDrawer open={cart} onClose={() => setCart(false)} />
    </div>
  );
}
