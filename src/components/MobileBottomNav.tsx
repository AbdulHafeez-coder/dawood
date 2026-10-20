import { Link, useLocation } from "@tanstack/react-router";
import { Home, LayoutGrid, Heart, ScrollText, ShoppingBag } from "lucide-react";
import { useCart, useFavourites } from "@/lib/shop";
import { useOrders } from "@/lib/orders";

type Props = {
  onOpenCart?: () => void;
  onOpenCategories?: () => void;
};

export function MobileBottomNav({ onOpenCart, onOpenCategories }: Props) {
  const { cartCount } = useCart();
  const { favCount } = useFavourites();
  const { orderCount } = useOrders();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-black/10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2 py-1.5 flex items-center justify-around safe-area-bottom"
    >
      {/* Home */}
      <Link
        to="/"
        className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
          currentPath === "/" ? "text-black font-semibold" : "text-black/50 hover:text-brand-primary"
        }`}
      >
        <Home size={20} strokeWidth={currentPath === "/" ? 2.25 : 1.75} />
        <span className="text-[10px] tracking-tight">Home</span>
      </Link>

      {/* Categories */}
      {onOpenCategories ? (
        <button
          type="button"
          onClick={onOpenCategories}
          className="flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl text-black/50 hover:text-brand-primary transition-all cursor-pointer"
        >
          <LayoutGrid size={20} strokeWidth={1.75} />
          <span className="text-[10px] tracking-tight">Categories</span>
        </button>
      ) : (
        <a
          href="/#collections"
          className="flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl text-black/50 hover:text-brand-primary transition-all"
        >
          <LayoutGrid size={20} strokeWidth={1.75} />
          <span className="text-[10px] tracking-tight">Categories</span>
        </a>
      )}

      {/* Wishlist */}
      <Link
        to="/favorites"
        className={`relative flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
          currentPath === "/favorites"
            ? "text-black font-semibold"
            : "text-black/50 hover:text-brand-primary"
        }`}
      >
        <div className="relative">
          <Heart size={20} strokeWidth={currentPath === "/favorites" ? 2.25 : 1.75} />
          {favCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-brand-primary text-white text-[9px] font-bold min-w-3.5 h-3.5 px-0.5 rounded-full flex items-center justify-center">
              {favCount}
            </span>
          )}
        </div>
        <span className="text-[10px] tracking-tight">Wishlist</span>
      </Link>

      {/* Orders */}
      <Link
        to="/orders"
        className={`relative flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
          currentPath === "/orders" ? "text-black font-semibold" : "text-black/50 hover:text-brand-primary"
        }`}
      >
        <div className="relative">
          <ScrollText size={20} strokeWidth={currentPath === "/orders" ? 2.25 : 1.75} />
          {orderCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-brand-primary text-white text-[9px] font-bold min-w-3.5 h-3.5 px-0.5 rounded-full flex items-center justify-center">
              {orderCount}
            </span>
          )}
        </div>
        <span className="text-[10px] tracking-tight">Orders</span>
      </Link>

      {/* Cart */}
      <button
        type="button"
        onClick={onOpenCart}
        className="relative flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl text-black/70 hover:text-brand-primary transition-all cursor-pointer"
        aria-label="Open cart"
      >
        <div className="relative">
          <ShoppingBag size={20} strokeWidth={1.75} />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[9px] font-bold min-w-3.5 h-3.5 px-0.5 rounded-full flex items-center justify-center animate-scale-in">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] tracking-tight">Cart</span>
      </button>
    </nav>
  );
}
