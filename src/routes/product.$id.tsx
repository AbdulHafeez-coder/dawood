import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  PackageOpen,
  Banknote,
  ShieldCheck,
  Leaf,
  ArrowLeft,
  ShoppingBag,
  Star,
  Plus,
  Minus,
  Check,
  Truck,
  Heart,
  MessageCircle,
} from "lucide-react";
import { buildWhatsappProductOrder } from "@/lib/whatsapp";
import { saveOrder } from "@/lib/orders";
import {
  getProductAsync,
  getVariants,
  useProducts,
  useCart,
  useFavourites,
  type Product,
} from "@/lib/shop";
import { LazyCartDrawer as CartDrawer } from "@/components/LazyCartDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import {
  AddToCartSkeleton,
  ProductGallerySkeleton,
  VariantOptionsSkeleton,
  useMounted,
} from "@/components/skeletons";
import { toast } from "sonner";
import { formatPKR } from "@/lib/format";
import { SafeImage } from "@/components/ui/SafeImage";

export const Route = createFileRoute("/product/$id")({
  loader: async ({ params }) => {
    const product = await getProductAsync(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    const title = p ? `${p.name} — Dawood Mart` : "Product — Dawood Mart";
    const description = p?.tagline ?? "Considered home essentials from Dawood Mart.";
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
  errorComponent: ProductError,
  component: ProductPage,
});

const dmSans = { fontFamily: "'DM Sans', sans-serif" };
const inter = { fontFamily: "'Inter', sans-serif" };

function NotFoundProduct() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FEFDF9]" style={inter}>
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 py-20 text-center">
        <div style={{ ...dmSans, fontWeight: 500, fontSize: 28, letterSpacing: "-0.04em" }}>
          Not in the catalogue
        </div>
        <p className="text-black/60">We couldn't find that piece.</p>
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-black text-white rounded-md h-9 px-4 text-sm"
          >
            <ArrowLeft size={16} /> Back to home
          </Link>
          <a
            href="/#shop"
            className="inline-flex items-center gap-2 border border-black/15 rounded-md h-9 px-4 text-sm hover:bg-black/[0.03]"
          >
            <ShoppingBag size={16} /> Browse products
          </a>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

function ProductError() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FEFDF9]" style={inter}>
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 py-20 text-center">
        <div style={{ ...dmSans, fontWeight: 500, fontSize: 24, letterSpacing: "-0.04em" }}>
          Something went wrong
        </div>
        <p className="text-black/60">We couldn't load this product. Please try again.</p>
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-black text-white rounded-md h-9 px-4 text-sm"
          >
            <ArrowLeft size={16} /> Back to home
          </Link>
          <a
            href="/#shop"
            className="inline-flex items-center gap-2 border border-black/15 rounded-md h-9 px-4 text-sm hover:bg-black/[0.03]"
          >
            <ShoppingBag size={16} /> Browse products
          </a>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

function ProductPage() {
  const { product } = Route.useLoaderData();
  const mounted = useMounted();
  const { addToCart, cartCount } = useCart();
  const { toggleFav, isFav, favCount } = useFavourites();

  const handleFav = () => {
    toggleFav(product);
  };
  const [cartOpen, setCartOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product, qty, {
      baseId: product.id,
      baseName: product.display_name || product.name,
    });
    toast.success(`${product.display_name || product.name} added to cart`, {
      description: `Qty ${qty} · ${formatPKR(product.price * qty)}`,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const { products: liveProducts } = useProducts();
  const related = liveProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="flex min-h-screen flex-col bg-[#FEFDF9]" style={inter}>
      {/* NAV */}
      <nav className="sticky top-0 z-20 bg-[#FEFDF9]/90 backdrop-blur border-b border-black/5 flex items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
        <Link to="/" className="type-wordmark text-black">
          Dawood Mart
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/favorites" aria-label="Favourites" className="relative text-black">
            <Heart size={20} strokeWidth={1.5} />
            {favCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[10px] font-medium min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                {favCount}
              </span>
            )}
          </Link>
          <button
            aria-label="Cart"
            onClick={() => setCartOpen(true)}
            className="relative text-black"
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[10px] font-medium min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* BACK + BREADCRUMB */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 pt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-black/70 hover:text-black"
        >
          <ArrowLeft size={16} /> Back to shop
        </Link>
        <span className="text-black/20">|</span>
        <div className="text-xs text-black/50 flex items-center gap-2 min-w-0">
          <Link to="/" className="hover:text-black">
            Shop
          </Link>
          <span>/</span>
          <span>{product.category}</span>
          <span>/</span>
          <span className="text-black/80 truncate">{product.display_name || product.name}</span>
        </div>
      </div>

      {/* PRODUCT */}
      <section className="px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 lg:py-12 grid md:grid-cols-2 gap-8 lg:gap-14">
        {/* GALLERY */}
        {!mounted ? (
          <ProductGallerySkeleton />
        ) : (
          <div className="flex flex-col gap-3">
            {/* Mobile Touch-Friendly Swipe Gallery */}
            <div className="flex md:hidden overflow-x-auto snap-x snap-mandatory -mx-4 px-4 gap-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {product.gallery.map((g: string, i: number) => (
                <div
                  key={i}
                  className={`${product.bg} min-w-[85vw] shrink-0 snap-center rounded-2xl overflow-hidden aspect-square`}
                >
                  <SafeImage
                    src={g}
                    alt={`${product.display_name || product.name} ${i + 1}`}
                    width={800}
                    height={800}
                    className="w-full h-full object-cover"
                    loading={i === 0 ? "eager" : "lazy"}
                  />
                </div>
              ))}
            </div>

            {/* Desktop Main Image */}
            <div
              className={`hidden md:block ${product.bg} rounded-2xl aspect-square overflow-hidden`}
            >
              <SafeImage
                src={product.gallery[activeImg] ?? product.img}
                alt={product.display_name || product.name}
                width={1600}
                height={1600}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Desktop Thumbnails */}
            {product.gallery.length > 1 && (
              <div className="hidden md:grid grid-cols-4 lg:grid-cols-5 gap-3">
                {product.gallery.map((g: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    aria-label={`Show image ${i + 1}`}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-colors ${activeImg === i ? "border-black" : "border-transparent hover:border-black/20"} ${product.bg}`}
                  >
                    <SafeImage
                      src={g}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* INFO */}
        <div>
          <div className="type-eyebrow text-black/50">{product.category}</div>
          <h1 className="type-h1 mt-3 text-black">{product.display_name || product.name}</h1>
          <p className="mt-3 text-black/70 max-w-md">{product.tagline}</p>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex flex-col gap-1">
              {product.original_price && product.original_price > product.price ? (
                <>
                  <div className="flex items-center gap-3">
                    <span className="text-black/50 line-through text-lg">
                      {formatPKR(product.original_price)}
                    </span>
                    <span className="text-red-600 text-sm font-bold bg-red-50 px-2 py-1 rounded">
                      20% OFF
                    </span>
                  </div>
                  <div className="type-price-lg text-black whitespace-nowrap">
                    {formatPKR(product.price)}
                  </div>
                </>
              ) : (
                <div className="type-price-lg text-black whitespace-nowrap">
                  {formatPKR(product.price)}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-black/60 text-sm whitespace-nowrap">
              <Star size={14} className="fill-black text-black" /> {product.rating} · 240 reviews
            </div>
          </div>

          <p className="mt-6 text-black/80 leading-relaxed max-w-md">{product.description}</p>

          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 max-w-md">
            {product.details.map((d: string, idx: number) => (
              <li key={`${idx}-${d}`} className="flex items-start gap-2 text-sm text-black/70">
                <Check size={16} className="mt-0.5 shrink-0 text-black" /> {d}
              </li>
            ))}
          </ul>

          {/* Variants Removed for simplicity */}

          {!mounted ? (
            <div className="mt-8">
              <AddToCartSkeleton />
            </div>
          ) : (
            <>
              {/* QUANTITY + ADD */}
              <div className="mt-8 flex items-center gap-3">
                <div className="inline-flex items-center border border-black/15 rounded-full h-10">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-9 h-10 flex items-center justify-center text-black/70 hover:text-black"
                    aria-label="Decrease"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center text-sm text-black">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="w-9 h-10 flex items-center justify-center text-black/70 hover:text-black"
                    aria-label="Increase"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex-1">
                  <button
                    onClick={handleAdd}
                    className="w-full inline-flex items-center justify-center gap-2 bg-black text-white rounded-md h-10 text-sm hover:bg-black/85"
                    style={{ fontWeight: 500 }}
                  >
                    {added ? (
                      <>
                        <Check size={18} /> Added
                      </>
                    ) : (
                      <>Add to cart · {formatPKR(product.price * qty)}</>
                    )}
                  </button>
                </div>
                <button
                  onClick={handleFav}
                  aria-label={isFav(product.id) ? "Remove from favourites" : "Add to favourites"}
                  aria-pressed={isFav(product.id)}
                  className="h-10 w-10 shrink-0 inline-flex items-center justify-center rounded-full border border-black/15 hover:border-black transition-colors"
                >
                  <Heart
                    size={18}
                    className={isFav(product.id) ? "fill-black text-black" : "text-black"}
                  />
                </button>
              </div>

            </>
          )}

          {/* Order on WhatsApp button removed to enforce Checkout Flow */}

          <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
            {[
              { Icon: Truck, label: "3-5 Days Delivery" },
              { Icon: Banknote, label: "COD Available" },
              { Icon: PackageOpen, label: "Open & Check" },
            ].map(({ Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center gap-1 rounded-xl bg-black/[0.04] p-3"
              >
                <Icon size={18} className="text-black" strokeWidth={1.5} />
                <span className="text-[11px] text-black/70">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="px-4 sm:px-6 md:px-8 lg:px-10 py-8 sm:py-12 lg:py-16 border-t border-black/5">
          <div className="flex items-end justify-between mb-6">
            <h2 className="type-h2 text-black">More in {product.category}</h2>
            <Link to="/" className="text-sm text-black/60 hover:text-black">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
            {related.map((p) => (
              <RelatedCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-auto">
        <SiteFooter />
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

function RelatedCard({ product: p }: { product: Product }) {
  return (
    <Link
      to="/product/$id"
      params={{ id: p.slug || p.id }}
      className="bg-white rounded-xl overflow-hidden flex flex-col group border border-black/5 hover:border-black/20 transition-colors"
    >
      <div className={`${p.bg} relative aspect-square overflow-hidden`}>
        <SafeImage
          src={p.img}
          alt={p.name}
          width={800}
          height={800}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-3 flex items-start justify-between gap-2">
        <div
          className="text-black"
          style={{ ...dmSans, fontWeight: 500, fontSize: 14, letterSpacing: "-0.02em" }}
        >
          {p.name}
        </div>
        <div className="text-black" style={{ ...dmSans, fontWeight: 500, fontSize: 14 }}>
          {formatPKR(p.price)}
        </div>
      </div>
    </Link>
  );
}
