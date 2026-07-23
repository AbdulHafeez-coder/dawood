import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Heart, ShoppingBag, Star, Plus, X } from "lucide-react";
import { useProducts, useCart, useFavourites, getVariants, type Category, type Product } from "@/lib/shop";
import { LazyCartDrawer as CartDrawer } from "@/components/LazyCartDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductGridSkeleton, useMounted } from "@/components/skeletons";
import { toast } from "sonner";
import { formatPKR } from "@/lib/format";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Your Favourites — Dawood Mart" },
      { name: "description", content: "The Dawood Mart pieces you've saved for later." },
      { property: "og:title", content: "Your Favourites — Dawood Mart" },
      { property: "og:description", content: "The Dawood Mart pieces you've saved for later." },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FavoritesPage,
});

const dmSans = { fontFamily: "'DM Sans', sans-serif" };
const inter = { fontFamily: "'Inter', sans-serif" };

function FavoritesPage() {
  const { favs, toggleFav, favCount } = useFavourites();
  const { cartCount } = useCart();
  const { products } = useProducts();
  const [cartOpen, setCartOpen] = useState(false);
  const mounted = useMounted();

  const items = products.filter((p) => favs.includes(p.id));

  const handleRemove = (p: Product) => {
    toggleFav(p.id);
    toast(`${p.name} removed from favourites`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FEFDF9]" style={inter}>
      <nav className="sticky top-0 z-20 bg-[#FEFDF9]/90 backdrop-blur border-b border-black/5 flex items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
        <Link to="/" className="type-wordmark text-black">
          Dawood Mart
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

      <div className="px-5 sm:px-8 lg:px-10 pt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-black/70 hover:text-black">
          <ArrowLeft size={16} /> Back to shop
        </Link>
        <span className="text-black/20">|</span>
        <div className="text-xs text-black/50 flex items-center gap-2">
          <Link to="/" className="hover:text-black">Shop</Link>
          <span>/</span>
          <span className="text-black/80">Favourites</span>
        </div>
      </div>

      <section className="px-5 sm:px-8 lg:px-10 py-8 lg:py-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 lg:mb-10">
          <div>
            <h1 className="type-h1 text-black flex items-center gap-3">
              <Heart className="fill-black text-black" size={36} /> Favourites
            </h1>
            <p className="mt-3 text-black/60 max-w-md">
              {favCount === 0
                ? "You haven't saved anything yet. Tap the heart on any piece to keep it here."
                : `${favCount} piece${favCount === 1 ? "" : "s"} you've saved for later.`}
            </p>
          </div>
        </div>

        {!mounted ? (
          <ProductGridSkeleton count={4} />
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 sm:p-16 text-center flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-black/5 flex items-center justify-center">
              <Heart size={26} className="text-black/50" />
            </div>
            <div className="type-h3 text-black">
              No favourites yet
            </div>
            <p className="text-black/60 max-w-sm">Browse the edit and tap the heart on any piece to keep it here for later.</p>
            <Link to="/" className="mt-2 inline-flex items-center gap-2 bg-black text-white rounded-md h-11 px-5 text-sm" style={{ fontWeight: 500 }}>
              Explore the shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {items.map((p) => {
              const v = getVariants(p.category as Category);
              const colors = v.colors.slice(0, 4);
              const extraColors = Math.max(0, v.colors.length - colors.length);
              const sizes = v.sizes.slice(0, 3);
              return (
              <div key={p.id} className="bg-white rounded-2xl overflow-hidden flex flex-col h-full group relative">
                <Link to="/product/$id" params={{ id: p.id }} className={`${p.bg} relative aspect-square overflow-hidden block`}>
                  <span className="absolute top-4 left-4 z-10 bg-black text-white text-xs px-3 py-1 rounded-full">{p.tag}</span>
                  <span className="absolute bottom-4 left-4 z-10 bg-white/85 text-black text-[11px] px-2 py-1 rounded-full">{p.category}</span>
                  <img
                    src={p.img}
                    alt={p.name}
                    width={1024}
                    height={1024}
                    loading="lazy" decoding="async"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <button
                  onClick={() => handleRemove(p)}
                  aria-label="Remove from favourites"
                  className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                >
                  <X size={16} className="text-black" />
                </button>
                <div className="p-4 sm:p-5 flex flex-col gap-2.5 flex-1">
                  <div className="min-w-0">
                    <Link to="/product/$id" params={{ id: p.id }} className="type-title text-black hover:underline block truncate" title={p.name}>
                      {p.name}
                    </Link>
                    <div className="flex items-center gap-1 mt-1 text-black/60 text-xs">
                      <Star size={12} className="fill-black text-black" /> {p.rating}
                    </div>
                  </div>

                  <div className="type-price text-black">{formatPKR(p.price)}</div>

                  <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1.5 min-h-[20px]" aria-label="Available colours">
                    {colors.map((c) => {
                      const isGradient = c.swatch.startsWith("linear-gradient");
                      return (
                        <span
                          key={c.id}
                          title={c.label}
                          className="h-4 w-4 sm:h-[18px] sm:w-[18px] rounded-full border border-black/15 ring-1 ring-white shrink-0"
                          style={isGradient ? { backgroundImage: c.swatch } : { backgroundColor: c.swatch }}
                        />
                      );
                    })}
                    {extraColors > 0 && (
                      <span className="text-[11px] leading-none text-black/50 ml-0.5 shrink-0">+{extraColors}</span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1.5 min-h-[22px]" aria-label="Available sizes">
                    {sizes.map((s) => (
                      <span
                        key={s.id}
                        title={s.note ?? s.label}
                        className="text-[10px] uppercase tracking-wider text-black/70 border border-black/15 rounded-full px-1.5 py-0.5 leading-none shrink-0 max-w-full truncate"
                      >
                        {s.label.length > 6 ? s.label.slice(0, 4) : s.label}
                      </span>
                    ))}
                  </div>



                  <Link
                    to="/product/$id"
                    params={{ id: p.id }}
                    className="mt-auto inline-flex items-center justify-center gap-2 bg-black text-white rounded-md h-11 text-sm hover:bg-black/85 transition-colors"
                    style={{ fontWeight: 500 }}
                  >
                    <Plus size={16} /> Choose options
                  </Link>
                </div>
              </div>
              );
            })}

          </div>
        )}
      </section>

      <div className="mt-auto">
        <SiteFooter />
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
