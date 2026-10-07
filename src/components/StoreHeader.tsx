import { useState } from "react";
import { Heart, Menu, ShoppingBag, UserRound } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useCart, useFavourites } from "@/lib/shop";
import { useSettings } from "@/lib/settings";
import { storefrontCategories } from "@/lib/storefront-categories";
import { SearchAutocomplete } from "./SearchAutocomplete";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "./ui/sheet";
export function StoreHeader({
  onOpenCart,
  floating = false,
}: {
  onOpenCart: () => void;
  floating?: boolean;
}) {
  const { cartCount } = useCart(),
    { favCount } = useFavourites(),
    settings = useSettings();
  const [menu, setMenu] = useState(false),
    [query, setQuery] = useState("");
  const navigate = useNavigate();
  function browse(category = "", q = "") {
    setMenu(false);
    void navigate({ to: "/", search: { category, q }, hash: "shop" });
  }
  return (
    <>
      {!floating && (
        <div className="dm-announcement">Everyday essentials. A home that feels like you.</div>
      )}
      <header className={`dm-header ${floating ? "dm-header-floating" : ""}`}>
        <button
          className="dm-icon dm-menu"
          aria-label="Open categories"
          onClick={() => setMenu(true)}
        >
          <Menu size={23} />
        </button>
        <Link to="/" className="dm-wordmark" aria-label="Dawood Mart home">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt={settings.brandName} width={180} height={48} />
          ) : (
            <span>
              Dawood Mart<span className="dm-wordmark-dot">.</span>
            </span>
          )}
        </Link>
        <nav className="dm-desktop-nav" aria-label="Main navigation">
          <button onClick={() => setMenu(true)}>Shop by category</button>
          <a href="/#shop">Shop all</a>
        </nav>
        <SearchAutocomplete
          query={query}
          onQueryChange={setQuery}
          onSearchSubmit={() => browse("", query)}
          onSelectCategory={(c) => browse(c)}
        />
        <nav className="dm-header-actions" aria-label="Your shopping">
          <Link className="dm-icon dm-account" to="/orders" aria-label="Your orders">
            <UserRound size={22} />
          </Link>
          <Link className="dm-icon" to="/favorites" aria-label={`Favourites, ${favCount} saved`}>
            <Heart size={22} />
            {favCount > 0 && <span className="dm-count">{favCount}</span>}
          </Link>
          <button
            className="dm-icon"
            aria-label={`Open cart, ${cartCount} items`}
            onClick={onOpenCart}
          >
            <ShoppingBag size={22} />
            {cartCount > 0 && <span className="dm-count">{cartCount}</span>}
          </button>
        </nav>
      </header>
      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent side="left" className="dm-menu-panel overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Find your essentials</SheetTitle>
            <SheetDescription>Explore home, kitchen and everyday living.</SheetDescription>
          </SheetHeader>
          <nav className="dm-category-menu" aria-label="Categories">
            <button onClick={() => browse()}>Shop all products</button>
            {storefrontCategories.map((c) => (
              <button key={c.name} onClick={() => browse(c.name)}>
                {c.name}
                <span aria-hidden="true">↗</span>
              </button>
            ))}
            <Link to="/orders" onClick={() => setMenu(false)}>
              Your orders
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
