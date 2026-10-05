import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { ArrowLeft, Heart, ShoppingBag } from "lucide-react";
import { useProducts, useCart, useFavourites, type Product } from "@/lib/shop";
import { LazyCartDrawer as CartDrawer } from "@/components/LazyCartDrawer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FavoritesPage,
});

const inter = { fontFamily: "'Inter', sans-serif" };

function FavoritesPage() {
  const { favs, toggleFav } = useFavourites();
  const { cartCount } = useCart();
  const [page, setPage] = useState(1);
  const { products, total, loading, error, refetch } = useProducts({ ids: favs, page, pageSize: 24 });
  const [cartOpen, setCartOpen] = useState(false);
  const mounted = useMounted();

  const items = products.filter((p) => favs.includes(p.id));

  const handleRemove = useCallback(
    (p: Product) => {
      toggleFav(p);
    },
    [toggleFav],
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#FEFDF9] pb-20 lg:pb-0" style={inter}>
      <nav className="sticky top-0 z-20 bg-[#FEFDF9]/90 backdrop-blur border-b border-black/5 flex items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
        <Link to="/" className="type-wordmark text-black">
          Dawood Mart
        </Link>
        <button aria-label="Cart" onClick={() => setCartOpen(true)} className="relative text-black">
          <ShoppingBag size={20} strokeWidth={1.5} />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[10px] font-medium min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </nav>

      <div className="px-4 sm:px-6 md:px-8 lg:px-10 pt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-black/70 hover:text-black"
        >
          <ArrowLeft size={16} /> Back to shop
        </Link>
      </div>

      <section className="px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 lg:py-10">
        {error && <div role="alert">{error} <button onClick={refetch}>Retry</button></div>}
        {total > 24 && <nav aria-label="Favourite pages" className="flex gap-4 py-3"><button disabled={page === 1 || loading} onClick={() => setPage(p => p - 1)}>Previous</button><span>{page} / {Math.ceil(total / 24)}</span><button disabled={page * 24 >= total || loading} onClick={() => setPage(p => p + 1)}>Next</button></nav>}
        <div className="flex items-baseline justify-between mb-6">
          <h1 className="type-h1 text-black">Favourites</h1>
          <span className="text-black/50 text-sm">{items.length} saved</span>
        </div>

        {!mounted ? (
          <ProductGridSkeleton count={4} />
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl p-8 sm:p-12 text-center flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-black/5 flex items-center justify-center">
              <Heart size={20} className="text-black/50" />
            </div>
            <div className="type-h3 text-black">No favourites yet</div>
            <p className="text-black/60 max-w-sm">
              Browse the edit and tap the heart on any piece to keep it here for later.
            </p>
            <Link
              to="/"
              className="mt-2 inline-flex items-center gap-2 bg-black text-white rounded-md h-9 px-4 text-sm"
              style={{ fontWeight: 500 }}
            >
              Explore the shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
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

      {/* MOBILE BOTTOM NAVIGATION DOCK */}
      <MobileBottomNav onOpenCart={() => setCartOpen(true)} />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
