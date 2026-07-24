import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { ArrowLeft, Heart, ShoppingBag } from "lucide-react";
import { useProducts, useCart, useFavourites, type Product } from "@/lib/shop";
import { LazyCartDrawer as CartDrawer } from "@/components/LazyCartDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton, useMounted } from "@/components/skeletons";
import { toast } from "sonner";

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

const inter = { fontFamily: "'Inter', sans-serif" };

function FavoritesPage() {
  const { favs, toggleFav, favCount } = useFavourites();
  const { cartCount } = useCart();
  const { products } = useProducts();
  const [cartOpen, setCartOpen] = useState(false);
  const mounted = useMounted();

  const items = products.filter((p) => favs.includes(p.id));

  const handleRemove = useCallback((p: Product) => {
    toggleFav(p.id);
    toast(`${p.name} removed from favourites`);
  }, [toggleFav]);

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
            {items.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                isFavourite
                onToggleFav={handleRemove}
                favAction="remove"
              />
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
