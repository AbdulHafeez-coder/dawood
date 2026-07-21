import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  ArrowUpRight,
  Sparkles,
  Bath,
  Wallpaper,
  SprayCan,
  Star,
  Plus,
  SlidersHorizontal,
  Leaf,
  Truck,
  ShieldCheck,
} from "lucide-react";
import heroBg from "@/assets/hero-home.jpg";
import productTowel from "@/assets/product-towel.jpg";
import productWallpaper from "@/assets/product-wallpaper.jpg";
import productCloth from "@/assets/product-cloth.jpg";
import productSponge from "@/assets/product-sponge.jpg";
import { products, CATEGORY_LIST, useCart, type Category, type Product } from "@/lib/shop";
import { CartDrawer } from "@/components/CartDrawer";

export const Route = createFileRoute("/")({
  component: Index,
});

const dmSans = { fontFamily: "'DM Sans', sans-serif" };
const inter = { fontFamily: "'Inter', sans-serif" };

const cards = [
  { Icon: Leaf, bg: "bg-emerald-800", text: "OEKO-TEX certified fabrics, kind to skin and planet" },
  { Icon: Truck, bg: "bg-stone-800", text: "Free carbon-neutral delivery on orders over $50" },
  { Icon: ShieldCheck, bg: "bg-amber-800", text: "60-day home trial — return anything, no questions" },
  { Icon: Sparkles, bg: "bg-rose-800", text: "Small-batch made in family-run European mills" },
];

const navLinks = ["Shop", "Collections", "Journal", "Contact"];

const categories: { Icon: typeof Bath; name: Category; count: number; bg: string; accent: string; desc: string; img: string }[] = [
  { Icon: Bath, name: "Towels", count: 18, bg: "bg-orange-100", accent: "text-orange-800", desc: "Plush cotton, quick-dry", img: productTowel },
  { Icon: Wallpaper, name: "Wallpaper", count: 24, bg: "bg-stone-200", accent: "text-stone-800", desc: "Peel-and-stick sheets", img: productWallpaper },
  { Icon: Sparkles, name: "Cloths", count: 12, bg: "bg-emerald-100", accent: "text-emerald-800", desc: "Reusable microfibre", img: productCloth },
  { Icon: SprayCan, name: "Sponges", count: 9, bg: "bg-amber-100", accent: "text-amber-800", desc: "Plant-based scrubs", img: productSponge },
];

type SortKey = "featured" | "price-asc" | "price-desc" | "rating";


function Word({ children, delay, className = "" }: { children: React.ReactNode; delay: string; className?: string }) {
  return (
    <span className="inline-block overflow-hidden align-bottom">
      <span className={`inline-block animate-word-reveal ${className}`} style={{ animationDelay: delay, animationFillMode: "both" }}>
        {children}
      </span>
    </span>
  );
}

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCard, setActiveCard] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const { addToCart: addToCartShared, cartCount } = useCart();

  const [activeCat, setActiveCat] = useState<Category | "All">("All");
  const priceMax = Math.max(...products.map((p) => p.price));
  const priceMin = Math.min(...products.map((p) => p.price));
  const [maxPrice, setMaxPrice] = useState(priceMax);
  const [sort, setSort] = useState<SortKey>("featured");
  const [query, setQuery] = useState("");

  const focusSearch = () => {
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => document.getElementById("product-search")?.focus(), 400);
  };

  useEffect(() => {
    const id = setInterval(() => setActiveCard((c) => (c + 1) % cards.length), 3500);
    return () => clearInterval(id);
  }, []);

  const addToCart = (p: Product) => {
    addToCartShared(p, 1);
    setCartOpen(true);
  };


  const visibleProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => (activeCat === "All" ? true : p.category === activeCat));
    list = list.filter((p) => p.price <= maxPrice);
    if (q) {
      list = list.filter((p) =>
        [p.name, p.category, p.tag, p.tagline]
          .filter(Boolean)
          .some((s) => String(s).toLowerCase().includes(q))
      );
    }
    switch (sort) {
      case "price-asc": list = [...list].sort((a, b) => a.price - b.price); break;
      case "price-desc": list = [...list].sort((a, b) => b.price - a.price); break;
      case "rating": list = [...list].sort((a, b) => b.rating - a.rating); break;
    }
    return list;
  }, [activeCat, maxPrice, sort, query]);

  return (
    <div className="flex min-h-screen flex-col" style={inter}>
      {/* HERO SECTION */}
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.55)), url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <nav className="relative z-20 flex items-center justify-between px-5 py-4 sm:px-8 lg:px-10 lg:py-5 animate-fade-in">
          <div className="animate-slide-left delay-200 text-white" style={{ ...dmSans, fontWeight: 500, fontSize: 30, letterSpacing: "-0.05em" }}>
            Maison Terra
          </div>
          <div className="hidden md:flex items-center gap-6 lg:gap-10 animate-fade-in delay-400" style={dmSans}>
            {navLinks.map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} className="text-white/90 hover:text-white transition-colors" style={{ fontWeight: 500, fontSize: 18 }}>
                {l}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3 sm:gap-4 animate-slide-right delay-300">
            <button aria-label="Search" onClick={focusSearch} className="text-white/90 hover:text-white"><Search size={20} strokeWidth={1.5} /></button>
            <button aria-label="Cart" onClick={() => setCartOpen(true)} className="relative text-white/90 hover:text-white">
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[10px] font-medium min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button aria-label="Menu" className="md:hidden text-white" onClick={() => setMenuOpen((v) => !v)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div className="fixed inset-0 z-30 bg-black/90 flex flex-col items-center justify-center gap-8 md:hidden">
            <button className="absolute top-5 right-5 text-white" onClick={() => setMenuOpen(false)} aria-label="Close">
              <X size={28} />
            </button>
            {navLinks.map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMenuOpen(false)} className="text-white text-2xl" style={dmSans}>
                {l}
              </a>
            ))}
          </div>
        )}

        <section className="relative z-10 flex flex-1 flex-col justify-center px-5 sm:px-8 lg:px-10 py-12 lg:py-20">
          <span className="inline-flex self-start items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-4 py-1.5 text-white/90 text-xs sm:text-sm animate-fade-up delay-200" style={inter}>
            <Sparkles size={14} /> New autumn collection · 2026
          </span>
          <h1 className="text-white mt-6" style={{ ...dmSans, fontWeight: 400, letterSpacing: "-0.05em" }}>
            <style>{`
              .hero-h1 { font-size: 44px; line-height: 46px; }
              @media (min-width: 640px) { .hero-h1 { font-size: 72px; line-height: 68px; } }
              @media (min-width: 768px) { .hero-h1 { font-size: 96px; line-height: 88px; } }
              @media (min-width: 1024px) { .hero-h1 { font-size: 118px; line-height: 102px; } }
              @media (min-width: 1280px) { .hero-h1 { font-size: 140px; line-height: 118px; } }
            `}</style>
            <span className="hero-h1 block">
              <div>
                <Word delay="0.3s">Soft</Word>{" "}
                <Word delay="0.4s">homes,</Word>{" "}
              </div>
              <div>
                <Word delay="0.5s" className="text-white/55">clean</Word>{" "}
                <Word delay="0.6s" className="text-white/55">habits,</Word>
              </div>
              <div>
                <Word delay="0.7s">thoughtful</Word>{" "}
                <Word delay="0.8s">walls.</Word>
              </div>
            </span>
          </h1>

          <div className="mt-8 sm:mt-12 lg:mt-14 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8 lg:gap-[50px] animate-fade-up delay-600">
            <a
              href="#shop"
              className="inline-flex items-center justify-center gap-2 bg-white text-black rounded-md w-full sm:w-[240px] md:w-[260px] lg:w-[280px] h-14 sm:h-16 lg:h-[68px] text-base sm:text-xl lg:text-2xl hover:bg-white/90 transition-colors"
              style={{ ...inter, fontWeight: 500, letterSpacing: "-0.03em" }}
            >
              Shop the edit
              <ArrowUpRight size={22} strokeWidth={1.75} />
            </a>
            <p className="text-white max-w-[340px]" style={{ ...inter, fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1.45 }}>
              <span className="text-sm sm:text-base lg:text-lg">
                Everyday textiles, peel-and-stick wallpaper and plant-based cleaning made for calm, well-kept spaces.
              </span>
            </p>
          </div>
        </section>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3">
          {[
            { label: "TOWELS", bg: "bg-[#ECEDEC]", chipBg: "bg-white", chipText: "text-black", off: "UP to 40% OFF", img: productTowel },
            { label: "WALLPAPER", bg: "bg-[#FEF3C7]", chipBg: "bg-black", chipText: "text-white", off: "UP to 60% OFF", img: productWallpaper },
            { label: "CLEANING", bg: "bg-[#FCE7D8]", chipBg: "bg-white", chipText: "text-black", off: "UP to 35% OFF", img: productSponge },
          ].map((c, i) => (
            <div
              key={c.label}
              className={`${c.bg} relative overflow-hidden p-5 sm:p-6 md:p-7 lg:p-10 min-h-[180px] sm:min-h-[200px] md:min-h-[220px] lg:min-h-[240px] flex items-center gap-3 sm:gap-4 md:gap-6 animate-fade-up`}
              style={{ animationDelay: `${900 + i * 100}ms`, animationFillMode: "both" }}
            >
              <div className="flex-1 min-w-0 flex flex-col gap-2 sm:gap-3">
                <span className={`${c.chipBg} ${c.chipText} self-start text-[10px] sm:text-xs tracking-[0.15em] px-3 py-1.5 rounded-md`} style={{ ...inter, fontWeight: 600 }}>
                  {c.label}
                </span>
                <div className="text-black" style={{ ...dmSans, fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
                  <span className="text-lg sm:text-xl md:text-2xl lg:text-[28px]">{c.off}</span>
                </div>
              </div>
              <div className="absolute -right-6 -top-6 w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-white/40 blur-2xl pointer-events-none" />
              <img
                src={c.img}
                alt={c.label}
                width={1024}
                height={1024}
                loading="lazy"
                className="relative w-[92px] h-[92px] sm:w-[110px] sm:h-[110px] md:w-[130px] md:h-[130px] lg:w-[160px] lg:h-[160px] rounded-xl object-cover shrink-0"
              />
            </div>
          ))}
        </div>

      </div>

      {/* CATEGORIES SECTION */}
      <section id="collections" className="bg-[#FEFDF9] px-5 sm:px-8 lg:px-10 py-16 lg:py-24">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 lg:mb-14">
          <h2 className="text-black" style={{ ...dmSans, fontWeight: 400, letterSpacing: "-0.05em", fontSize: "clamp(36px, 6vw, 72px)", lineHeight: 1 }}>
            Shop by room
          </h2>
          <p className="text-black/60 max-w-md text-sm sm:text-base lg:text-lg">
            Four small edits with big impact — bath, walls, kitchen, and the daily reset.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {categories.map(({ Icon, name, count, bg, accent, desc, img }) => (
            <button
              key={name}
              onClick={() => {
                setActiveCat(name);
                document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`${bg} group relative text-left rounded-2xl overflow-hidden flex flex-col justify-between min-h-[240px] lg:min-h-[300px] hover:-translate-y-1 transition-transform`}
            >
              <img
                src={img}
                alt={name}
                width={1024}
                height={1024}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="relative p-6 lg:p-8 flex flex-col justify-between h-full min-h-[240px] lg:min-h-[300px]">
                <div className={`${accent} w-12 h-12 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center`}>
                  <Icon size={22} strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-white drop-shadow-sm" style={{ ...dmSans, fontWeight: 500, fontSize: "clamp(22px, 3vw, 30px)", letterSpacing: "-0.03em" }}>
                    {name}
                  </div>
                  <div className="text-white/85 text-sm mt-1">{desc}</div>
                  <div className="text-white/70 text-xs mt-2">{count} products</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* PRODUCTS SECTION */}
      <section id="shop" className="bg-[#ECEDEC] px-5 sm:px-8 lg:px-10 py-16 lg:py-24">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 lg:mb-10">
          <h2 className="text-black" style={{ ...dmSans, fontWeight: 400, letterSpacing: "-0.05em", fontSize: "clamp(36px, 6vw, 72px)", lineHeight: 1 }}>
            The Home Edit
          </h2>
          <div className="flex items-center gap-2 text-black/60 text-sm">
            <SlidersHorizontal size={16} /> {visibleProducts.length} of {products.length}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 lg:p-5 mb-4 flex items-center gap-3">
          <Search size={18} strokeWidth={1.75} className="text-black/50 shrink-0" />
          <input
            id="product-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search towels, wallpaper, cloths, sponges…"
            className="flex-1 bg-transparent outline-none text-black placeholder:text-black/40 text-sm sm:text-base"
            style={{ fontWeight: 400 }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-black/50 hover:text-black shrink-0"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4 lg:p-5 mb-8 lg:mb-10 flex flex-col md:flex-row md:items-center md:flex-wrap gap-4 md:gap-5 lg:gap-8">
          <div className="flex flex-wrap items-center gap-2">
            {(["All", ...CATEGORY_LIST] as const).map((c) => (
              <button
                key={c}
                onClick={() => setActiveCat(c)}
                className={`px-4 h-9 rounded-full text-sm transition-colors ${
                  activeCat === c ? "bg-black text-white" : "bg-black/5 text-black hover:bg-black/10"
                }`}
                style={{ fontWeight: 500 }}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-1 min-w-0 md:min-w-[200px] md:max-w-xs">
            <span className="text-sm text-black/60 whitespace-nowrap">Max ${maxPrice}</span>
            <input
              type="range"
              min={priceMin}
              max={priceMax}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-black"
              aria-label="Max price"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-black/60">Sort</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-9 rounded-full bg-black/5 hover:bg-black/10 text-sm px-3 pr-8 text-black outline-none"
              style={{ fontWeight: 500 }}
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="rating">Top rated</option>
            </select>
          </div>
        </div>

        {visibleProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center text-black/60">
            No products match your filters.{" "}
            <button
              onClick={() => { setActiveCat("All"); setMaxPrice(priceMax); setSort("featured"); setQuery(""); }}
              className="underline text-black"
            >
              Reset
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {visibleProducts.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl overflow-hidden flex flex-col group">
                <Link to="/product/$id" params={{ id: p.id }} className={`${p.bg} relative aspect-square overflow-hidden block`}>
                  <span className="absolute top-4 left-4 z-10 bg-black text-white text-xs px-3 py-1 rounded-full">{p.tag}</span>
                  <span className="absolute top-4 right-4 z-10 bg-white/85 text-black text-[11px] px-2 py-1 rounded-full">{p.category}</span>
                  <img
                    src={p.img}
                    alt={p.name}
                    width={1024}
                    height={1024}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link to="/product/$id" params={{ id: p.id }} className="text-black hover:underline block" style={{ ...dmSans, fontWeight: 500, fontSize: 20, letterSpacing: "-0.03em" }}>
                        {p.name}
                      </Link>
                      <div className="flex items-center gap-1 mt-1 text-black/60 text-xs">
                        <Star size={12} className="fill-black text-black" /> {p.rating}
                      </div>
                    </div>
                    <div className="text-black" style={{ ...dmSans, fontWeight: 500, fontSize: 20 }}>${p.price}</div>
                  </div>
                  <button
                    onClick={() => addToCart(p)}
                    className="mt-1 inline-flex items-center justify-center gap-2 bg-black text-white rounded-md h-11 text-sm hover:bg-black/85"
                    style={{ fontWeight: 500 }}
                  >
                    Add to cart <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="bg-black text-white px-5 sm:px-8 lg:px-10 py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div>
            <div style={{ ...dmSans, fontWeight: 500, fontSize: 36, letterSpacing: "-0.05em" }}>Maison Terra</div>
            <p className="text-white/60 mt-3 max-w-sm text-sm lg:text-base">
              Considered home essentials — towels, wallpaper, and everyday cleaning, made to last.
            </p>
          </div>
          <div className="text-white/50 text-sm">© {new Date().getFullYear()} Maison Terra. All rights reserved.</div>
        </div>
      </footer>

      {/* CART DRAWER */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

    </div>
  );
}
