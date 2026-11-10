import { isPvcSheet, usePvcSizes } from "@/lib/pvc-sizes";
import { sheetInventory, sheetDesigns } from "@/lib/sheet-inventory.js";
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
import { ProductGallery } from "@/components/ProductGallery";
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
      { title: `${loaderData?.product.seo_title || loaderData?.product.display_name || "Product"} — Dawood Mart` },
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
    [busy, setBusy] = useState(false);
  useEffect(() => {
    setQty(1);
  }, [p.id]);
  const linked = isPvcSheet(p.id);
  const decorative = sheetInventory(p.id) === 'decorative_sheet_sizes';
  const sizes = usePvcSizes(linked, p.id);
  const [size, setSize] = useState(decorative ? "36x60" : "36x57");
  const [designId, setDesignId] = useState('blue');
  const design = sheetDesigns.find(d => d.id === designId) || sheetDesigns[0];
  useEffect(() => { setSize(decorative ? '36x60' : '36x57'); setDesignId('blue'); }, [p.id, decorative]);
  const variant = linked ? sizes.find(row => row.size === size) : undefined;
  const available = canPurchase(p) && (!linked || !!variant && qty <= variant.available);
  const name = p.display_name || p.name;
  const { products: related } = useProducts({ category: p.category, pageSize: 5 });
  async function add() {
    if (busy || !available) return;
    setBusy(true);
    try {
      await assertPurchasable(supabase, [p.id]);
      const item = linked && variant ? { ...p, id: p.id + "::" + size + (decorative ? '::' + design.id : ''), price: variant.price, ...(decorative ? { img: p.gallery[sheetDesigns.indexOf(design)] || design.image } : {}) } : p;
      if (addToCart(item, qty, { baseId: p.id, baseName: name, ...(linked ? { variantSize: size, variantSizeLabel: size + " inches" } : {}), ...(decorative ? { variantColor: design.id, variantColorLabel: design.label } : {}) })) {
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
    (d) =>
      !/^\s*(brand|source|compare_at_price|seo|tags?|vendor|import|supplier|__video__|video_url)\s*:/i.test(
        d,
      ),
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
          <a href={decorative ? `/category/sheets?sub=${encodeURIComponent(p.tagline)}#shop` : `/?category=${encodeURIComponent(customerCategory(p.category))}#shop`}>
            {decorative ? `Sheets / ${p.tagline}` : customerCategory(p.category)}
          </a>
        </div>
        <section className="dm-detail">
          <ProductGallery key={p.id + (decorative ? designId : '')} images={decorative ? [p.gallery[sheetDesigns.indexOf(design)] || design.image, p.img, ...p.gallery] : [p.img, ...(p.gallery ?? [])]} video={p.video} name={name} />
          <div className="dm-detail-copy">
            <p className="dm-eyebrow">MADE FOR YOUR EVERYDAY</p>
            <h1>{name}</h1>
            <div className="dm-price">
              <strong>{formatPKR(variant?.price ?? p.price)}</strong>
              {p.original_price && p.original_price > p.price ? (
                <del>{formatPKR(p.original_price)}</del>
              ) : null}
            </div>
            <>{linked && <label>Sheet size <select value={size} onChange={e => { setSize(e.target.value); setQty(1); }}>{sizes.map(row => <option key={row.size} value={row.size}>{row.size.replace("x"," × ")} inches</option>)}</select></label>}</>
            {decorative && <fieldset style={{border:0,padding:0,margin:'16px 0'}}><legend>Choose your design / ڈیزائن منتخب کریں</legend><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{sheetDesigns.map((d,i) => <button key={d.id} type="button" aria-pressed={designId === d.id} onClick={() => setDesignId(d.id)} style={{width:82,padding:4,border:designId === d.id ? '2px solid #49735b' : '1px solid #ddd',borderRadius:8}}><img src={p.gallery[i] || d.image} alt={d.label} loading="lazy" style={{width:'100%',aspectRatio:'1',objectFit:'cover'}}/><span>{d.label}</span></button>)}</div><p>36 × 60 inches / 3 × 5 feet · One sheet</p></fieldset>}
            <p className="dm-availability" role="status">
              {linked && variant && canPurchase(p) ? variant.available + (decorative ? " available — shared stock for Center Table & Dastarkhwan" : " available") : available ? "In stock" : "Out of stock"}
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
                <button aria-label="Increase quantity" disabled={linked && qty >= (variant?.available ?? 0)} onClick={() => setQty((q) => q + 1)}>
                  <Plus size={16} />
                </button>
              </div>
              <button className="dm-button" disabled={!available || busy} onClick={add}>
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
        {decorative && <section className="dm-section"><h2>Installed Photos</h2><p>Product styling photos supplied by Dawood Mart. These are not customer reviews. Table and accessories are not included.</p><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12}}>{[...new Set([p.img,...p.gallery])].map((src,i) => <img key={src} src={src} alt={`Table sheet installed view ${i+1}`} loading="lazy" style={{width:'100%',borderRadius:12}}/>)}</div></section>}
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
