import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Heart, ShoppingBag, Star, Plus, X } from "lucide-react";
import { useProducts, useCart, useFavourites, type Product } from "@/lib/shop";
import { CartDrawer } from "@/components/CartDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { toast } from "sonner";
import { formatPKR } from "@/lib/format";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Your Favourites — Maison Terra" },
      { name: "description", content: "The Maison Terra pieces you've saved for later." },
      { property: "og:title", content: "Your Favourites — Maison Terra" },
      { property: "og:description", content: "The Maison Terra pieces you've saved for later." },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FavoritesPage,
});

const dmSans = { fontFamily: "'DM Sans', sans-serif" };
const inter = { fontFamily: "'Inter', sans-serif" };

function FavoritesPage() {
  const { favs, toggleFav, favCount } = useFavourites();
  const { addToCart, cartCount } = useCart();
  const { products } = useProducts();
  const [cartOpen, setCartOpen] = useState(false);

  const items = products.filter((p) => favs.includes(p.id));

  const handleAdd = (p: Product) => {
    addToCart(p, 1);
    toast.success(`${p.name} added to cart`, { description: `${formatPKR(p.price)} · ${p.category}` });
  };

  const handleRemove = (p: Product) => {
    toggleFav(p.id);
    toast(`${p.name} removed from favourites`);
  };

  const addAllToCart = () => {
    items.forEach((p) => addToCart(p, 1));
    toast.success(`${items.length} item${items.length === 1 ? "" : "s"} added to cart`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FEFDF9]" style={inter}>
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
            <h1 className="text-black flex items-center gap-3" style={{ ...dmSans, fontWeight: 400, letterSpacing: "-0.04em", fontSize: "clamp(36px, 6vw, 64px)", lineHeight: 1 }}>
              <Heart className="fill-black text-black" size={36} /> Favourites
            </h1>
            <p className="mt-3 text-black/60 max-w-md">
              {favCount === 0
                ? "You haven't saved anything yet. Tap the heart on any piece to keep it here."
                : `${favCount} piece${favCount === 1 ? "" : "s"} you've saved for later.`}
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={addAllToCart}
              className="inline-flex items-center justify-center gap-2 bg-black text-white rounded-md h-12 px-6 text-sm hover:bg-black/85 transition-colors self-start sm:self-auto"
              style={{ fontWeight: 500 }}
            >
              <ShoppingBag size={16} /> Add all to cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 sm:p-16 text-center flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-black/5 flex items-center justify-center">
              <Heart size={26} className="text-black/50" />
            </div>
            <div className="text-black" style={{ ...dmSans, fontWeight: 500, fontSize: 24, letterSpacing: "-0.03em" }}>
              No favourites yet
            </div>
            <p className="text-black/60 max-w-sm">Browse the edit and tap the heart on any piece to keep it here for later.</p>
            <Link to="/" className="mt-2 inline-flex items-center gap-2 bg-black text-white rounded-md h-11 px-5 text-sm" style={{ fontWeight: 500 }}>
              Explore the shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {items.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl overflow-hidden flex flex-col h-full group relative">
                <Link to="/product/$id" params={{ id: p.id }} className={`${p.bg} relative aspect-square overflow-hidden block`}>
                  <span className="absolute top-4 left-4 z-10 bg-black text-white text-xs px-3 py-1 rounded-full">{p.tag}</span>
                  <span className="absolute bottom-4 left-4 z-10 bg-white/85 text-black text-[11px] px-2 py-1 rounded-full">{p.category}</span>
                  <img
                    src={p.img}
                    alt={p.name}
                    width={1024}
                    height={1024}
                    loading="lazy"
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
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                    <div className="min-w-0">
                      <Link to="/product/$id" params={{ id: p.id }} className="text-black hover:underline block" style={{ ...dmSans, fontWeight: 500, fontSize: 20, letterSpacing: "-0.03em" }}>
                        {p.name}
                      </Link>
                      <div className="flex items-center gap-1 mt-1 text-black/60 text-xs">
                        <Star size={12} className="fill-black text-black" /> {p.rating}
                      </div>
                    </div>
                    <div className="text-black shrink-0" style={{ ...dmSans, fontWeight: 500, fontSize: 20 }}>{formatPKR(p.price)}</div>
                  </div>
                  <button
                    onClick={() => handleAdd(p)}
                    className="mt-auto inline-flex items-center justify-center gap-2 bg-black text-white rounded-md h-11 text-sm hover:bg-black/85 transition-colors"
                    style={{ fontWeight: 500 }}
                  >
                    <Plus size={16} /> Add to cart
                  </button>
                </div>
              </div>
            ))}
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
