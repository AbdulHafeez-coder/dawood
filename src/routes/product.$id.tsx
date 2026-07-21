import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ShoppingBag, Star, Plus, Minus, Check, Truck, ShieldCheck, Leaf, Heart } from "lucide-react";
import { getProduct, products, useCart, useFavourites, type Product } from "@/lib/shop";
import { CartDrawer } from "@/components/CartDrawer";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    const title = p ? `${p.name} — Maison Terra` : "Product — Maison Terra";
    const description = p?.tagline ?? "Considered home essentials from Maison Terra.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: NotFoundProduct,
  errorComponent: () => (
    <div className="min-h-screen flex items-center justify-center text-black/60">Something went wrong.</div>
  ),
  component: ProductPage,
});

const dmSans = { fontFamily: "'DM Sans', sans-serif" };
const inter = { fontFamily: "'Inter', sans-serif" };

function NotFoundProduct() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#FEFDF9]" style={inter}>
      <div style={{ ...dmSans, fontWeight: 500, fontSize: 42, letterSpacing: "-0.04em" }}>Not in the catalogue</div>
      <p className="text-black/60">We couldn't find that piece.</p>
      <Link to="/" className="inline-flex items-center gap-2 bg-black text-white rounded-md h-11 px-5 text-sm">
        <ArrowLeft size={16} /> Back to shop
      </Link>
    </div>
  );
}

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { addToCart, cartCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FEFDF9]" style={inter}>
      {/* NAV */}
      <nav className="sticky top-0 z-20 bg-[#FEFDF9]/90 backdrop-blur border-b border-black/5 flex items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
        <Link to="/" className="text-black" style={{ ...dmSans, fontWeight: 500, fontSize: 26, letterSpacing: "-0.05em" }}>
          Maison Terra
        </Link>
        <button aria-label="Cart" onClick={() => setCartOpen(true)} className="relative text-black">
          <ShoppingBag size={22} strokeWidth={1.5} />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[10px] font-medium min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </nav>

      {/* BACK + BREADCRUMB */}
      <div className="px-5 sm:px-8 lg:px-10 pt-6 flex flex-col gap-3">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-black/70 hover:text-black w-fit">
          <ArrowLeft size={16} /> Back to shop
        </Link>
        <div className="text-xs text-black/50 flex items-center gap-2">
          <Link to="/" className="hover:text-black">Shop</Link>
          <span>/</span>
          <span>{product.category}</span>
          <span>/</span>
          <span className="text-black/80">{product.name}</span>
        </div>
      </div>


      {/* MAIN */}
      <section className="px-5 sm:px-8 lg:px-10 py-8 lg:py-12 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14">
        {/* GALLERY */}
        <div className="flex flex-col-reverse md:flex-row gap-4">
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[560px] pb-1 md:pb-0">
            {product.gallery.map((src: string, i: number) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`shrink-0 w-20 h-20 lg:w-24 lg:h-24 rounded-xl overflow-hidden border-2 transition-colors ${
                  i === activeImg ? "border-black" : "border-transparent"
                } ${product.bg}`}
                aria-label={`View image ${i + 1}`}
              >
                <img src={src} alt="" width={256} height={256} loading="lazy" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <div className={`${product.bg} relative flex-1 rounded-3xl overflow-hidden aspect-square md:aspect-auto md:min-h-[480px] lg:min-h-[560px]`}>
            <span className="absolute top-5 left-5 z-10 bg-black text-white text-xs px-3 py-1 rounded-full">{product.tag}</span>
            <img
              src={product.gallery[activeImg]}
              alt={product.name}
              width={1200}
              height={1200}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
            />
          </div>
        </div>

        {/* INFO */}
        <div className="flex flex-col">
          <div className="text-black/50 text-xs uppercase tracking-[0.15em]">{product.category}</div>
          <h1 className="text-black mt-3" style={{ ...dmSans, fontWeight: 400, letterSpacing: "-0.04em", fontSize: "clamp(36px, 5vw, 56px)", lineHeight: 1.02 }}>
            {product.name}
          </h1>
          <p className="text-black/70 mt-4 max-w-md text-base lg:text-lg" style={{ letterSpacing: "-0.01em" }}>
            {product.tagline}
          </p>

          <div className="mt-6 flex items-center gap-4">
            <div className="text-black" style={{ ...dmSans, fontWeight: 500, fontSize: 32 }}>${product.price}</div>
            <div className="flex items-center gap-1 text-black/60 text-sm">
              <Star size={14} className="fill-black text-black" /> {product.rating} · 240 reviews
            </div>
          </div>

          <p className="mt-6 text-black/80 leading-relaxed max-w-md">{product.description}</p>

          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 max-w-md">
            {product.details.map((d: string) => (
              <li key={d} className="flex items-start gap-2 text-sm text-black/70">
                <Check size={16} className="mt-0.5 shrink-0 text-black" /> {d}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex items-center gap-3">
            <div className="inline-flex items-center border border-black/15 rounded-full h-12">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-12 flex items-center justify-center text-black/70 hover:text-black" aria-label="Decrease">
                <Minus size={16} />
              </button>
              <span className="w-8 text-center text-sm text-black">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="w-10 h-12 flex items-center justify-center text-black/70 hover:text-black" aria-label="Increase">
                <Plus size={16} />
              </button>
            </div>
            <button
              onClick={handleAdd}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-black text-white rounded-md h-12 text-base hover:bg-black/85 transition-colors"
              style={{ fontWeight: 500 }}
            >
              {added ? (<><Check size={18} /> Added</>) : (<>Add to cart · ${(product.price * qty).toFixed(2)}</>)}
            </button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
            {[
              { Icon: Truck, label: "Free over $50" },
              { Icon: ShieldCheck, label: "60-day returns" },
              { Icon: Leaf, label: "OEKO-TEX" },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex flex-col items-center text-center gap-1 rounded-xl bg-black/[0.04] p-3">
                <Icon size={18} className="text-black" strokeWidth={1.5} />
                <span className="text-[11px] text-black/70">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="px-5 sm:px-8 lg:px-10 py-14 lg:py-20 border-t border-black/5">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-black" style={{ ...dmSans, fontWeight: 400, letterSpacing: "-0.04em", fontSize: "clamp(28px, 4vw, 44px)", lineHeight: 1 }}>
              More in {product.category}
            </h2>
            <Link to="/" className="text-sm text-black/60 hover:text-black">View all</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {related.map((p) => (
              <RelatedCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <footer className="bg-black text-white px-5 sm:px-8 lg:px-10 py-10 mt-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div style={{ ...dmSans, fontWeight: 500, fontSize: 24, letterSpacing: "-0.04em" }}>Maison Terra</div>
          <div className="text-white/50 text-sm">© {new Date().getFullYear()} Maison Terra.</div>
        </div>
      </footer>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

function RelatedCard({ product: p }: { product: Product }) {
  return (
    <Link
      to="/product/$id"
      params={{ id: p.id }}
      className="bg-white rounded-2xl overflow-hidden flex flex-col group border border-black/5 hover:border-black/20 transition-colors"
    >
      <div className={`${p.bg} relative aspect-square overflow-hidden`}>
        <img src={p.img} alt={p.name} width={800} height={800} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="p-4 flex items-start justify-between gap-2">
        <div className="text-black" style={{ ...dmSans, fontWeight: 500, fontSize: 16, letterSpacing: "-0.02em" }}>{p.name}</div>
        <div className="text-black" style={{ ...dmSans, fontWeight: 500, fontSize: 16 }}>${p.price}</div>
      </div>
    </Link>
  );
}
