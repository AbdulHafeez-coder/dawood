import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  ArrowUpRight,
  FlaskConical,
  Leaf,
  Droplets,
  Sun,
  Star,
  Plus,
  Minus,
  Trash2,
  SlidersHorizontal,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

const BG_URL =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260624_110248_b62f758d-f68c-4045-a7b4-91771d6d0a0f.png&w=1280&q=85";
const CAPSULE_INLINE =
  "https://polo-pecan-73837341.figma.site/_assets/v11/6a7de4fbe9c9e2315040607320a9ff5e93117bf4.png";
const PRODUCT_LARGE =
  "https://polo-pecan-73837341.figma.site/_assets/v11/50ad042b3cd48a2e120ea3ba17c8cfeaf3cc334c.png";
const PANEL1_DECO =
  "https://polo-pecan-73837341.figma.site/_assets/v11/6736cbe6e26afa2cd7c04a91892a79f7640785b5.png";
const PANEL3_PRODUCT =
  "https://polo-pecan-73837341.figma.site/_assets/v11/30e8f38d1f993c357a3be2721557fc899d5640fc.png";

const dmSans = { fontFamily: "'DM Sans', sans-serif" };
const inter = { fontFamily: "'Inter', sans-serif" };

const cards = [
  { Icon: FlaskConical, bg: "bg-black", text: "Experience our newly enhanced natural formula" },
  { Icon: Leaf, bg: "bg-emerald-800", text: "Pure organic ingredients sourced sustainably" },
  { Icon: Droplets, bg: "bg-cyan-800", text: "Advanced bioavailability for maximum absorption" },
  { Icon: Sun, bg: "bg-amber-700", text: "Clinically tested for daily energy & vitality" },
];

const navLinks = ["Shop", "Categories", "About", "Contact"];

const CATEGORY_LIST = ["Immunity", "Energy", "Hydration", "Focus"] as const;
type Category = (typeof CATEGORY_LIST)[number];

const categories: { Icon: typeof Leaf; name: Category; count: number; bg: string; accent: string }[] = [
  { Icon: Leaf, name: "Immunity", count: 24, bg: "bg-emerald-100", accent: "text-emerald-800" },
  { Icon: Sun, name: "Energy", count: 18, bg: "bg-amber-100", accent: "text-amber-800" },
  { Icon: Droplets, name: "Hydration", count: 12, bg: "bg-cyan-100", accent: "text-cyan-800" },
  { Icon: FlaskConical, name: "Focus", count: 15, bg: "bg-rose-100", accent: "text-rose-800" },
];

type Product = {
  id: string;
  name: string;
  tag: string;
  price: number;
  rating: number;
  img: string;
  bg: string;
  category: Category;
};

const products: Product[] = [
  { id: "p1", name: "Daily Balance", tag: "Bestseller", price: 38, rating: 4.9, img: PRODUCT_LARGE, bg: "bg-[#ECEDEC]", category: "Immunity" },
  { id: "p2", name: "Clean Energy", tag: "New", price: 42, rating: 4.8, img: PANEL3_PRODUCT, bg: "bg-[#FEFDF9]", category: "Energy" },
  { id: "p3", name: "Immune Boost", tag: "Popular", price: 34, rating: 4.7, img: PANEL1_DECO, bg: "bg-[#F1EFE9]", category: "Immunity" },
  { id: "p4", name: "Deep Focus", tag: "Limited", price: 46, rating: 4.9, img: CAPSULE_INLINE, bg: "bg-[#E8E9E4]", category: "Focus" },
  { id: "p5", name: "Hydra Salts", tag: "New", price: 28, rating: 4.6, img: PANEL3_PRODUCT, bg: "bg-[#E6EEF0]", category: "Hydration" },
  { id: "p6", name: "Morning Spark", tag: "Popular", price: 52, rating: 4.8, img: PRODUCT_LARGE, bg: "bg-[#F5EFE4]", category: "Energy" },
  { id: "p7", name: "Calm Mind", tag: "Bestseller", price: 44, rating: 4.9, img: CAPSULE_INLINE, bg: "bg-[#EEEAE1]", category: "Focus" },
  { id: "p8", name: "Elix Electrolytes", tag: "Limited", price: 32, rating: 4.7, img: PANEL1_DECO, bg: "bg-[#E9EFEA]", category: "Hydration" },
];

type CartItem = Product & { qty: number };
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
  const [cart, setCart] = useState<CartItem[]>([]);

  const [activeCat, setActiveCat] = useState<Category | "All">("All");
  const priceMax = Math.max(...products.map((p) => p.price));
  const priceMin = Math.min(...products.map((p) => p.price));
  const [maxPrice, setMaxPrice] = useState(priceMax);
  const [sort, setSort] = useState<SortKey>("featured");

  useEffect(() => {
    const id = setInterval(() => setActiveCard((c) => (c + 1) % cards.length), 3500);
    return () => clearInterval(id);
  }, []);

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const found = prev.find((i) => i.id === p.id);
      if (found) return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...p, qty: 1 }];
    });
    setCartOpen(true);
  };
  const changeQty = (id: string, delta: number) =>
    setCart((prev) =>
      prev.flatMap((i) => (i.id === id ? (i.qty + delta <= 0 ? [] : [{ ...i, qty: i.qty + delta }]) : [i]))
    );
  const removeItem = (id: string) => setCart((prev) => prev.filter((i) => i.id !== id));

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal = cart.reduce((s, i) => s + i.qty * i.price, 0);

  const visibleProducts = useMemo(() => {
    let list = products.filter((p) => (activeCat === "All" ? true : p.category === activeCat));
    list = list.filter((p) => p.price <= maxPrice);
    switch (sort) {
      case "price-asc": list = [...list].sort((a, b) => a.price - b.price); break;
      case "price-desc": list = [...list].sort((a, b) => b.price - a.price); break;
      case "rating": list = [...list].sort((a, b) => b.rating - a.rating); break;
    }
    return list;
  }, [activeCat, maxPrice, sort]);

  return (
    <div className="flex min-h-screen flex-col" style={inter}>
      {/* HERO SECTION */}
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          backgroundImage: `url(${BG_URL})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <nav className="relative z-20 flex items-center justify-between px-5 py-4 sm:px-8 lg:px-10 lg:py-5 animate-fade-in">
          <div className="animate-slide-left delay-200 text-white" style={{ ...dmSans, fontWeight: 500, fontSize: 30, letterSpacing: "-0.05em" }}>
            TerraElix
          </div>
          <div className="hidden md:flex items-center gap-6 lg:gap-10 animate-fade-in delay-400" style={dmSans}>
            {navLinks.map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} className="text-white/90 hover:text-white transition-colors" style={{ fontWeight: 500, fontSize: 18 }}>
                {l}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3 sm:gap-4 animate-slide-right delay-300">
            <button aria-label="Search" className="text-white/90 hover:text-white"><Search size={20} strokeWidth={1.5} /></button>
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

        <section className="relative z-10 flex flex-1 flex-col justify-center px-5 sm:px-8 lg:px-10 py-8 lg:py-12">
          <h1 className="text-white" style={{ ...dmSans, fontWeight: 400, letterSpacing: "-0.05em" }}>
            <style>{`
              .hero-h1 { font-size: 48px; line-height: 50px; }
              @media (min-width: 640px) { .hero-h1 { font-size: 80px; line-height: 72px; } }
              @media (min-width: 768px) { .hero-h1 { font-size: 110px; line-height: 95px; } }
              @media (min-width: 1024px) { .hero-h1 { font-size: 130px; line-height: 110px; } }
              @media (min-width: 1280px) { .hero-h1 { font-size: 155px; line-height: 125px; } }
              .capsule-inline { height: clamp(60px, 10vw, 160px); width: auto; }
            `}</style>
            <span className="hero-h1 block">
              <div>
                <Word delay="0.3s">The</Word>{" "}
                <Word delay="0.4s">Power</Word>{" "}
                <Word delay="0.5s" className="text-white/45">of</Word>
              </div>
              <div>
                <Word delay="0.6s" className="text-white/45">Nature</Word>{" "}
                <Word delay="0.7s" className="text-white/45">in</Word>{" "}
                <Word delay="0.8s">Every</Word>
              </div>
              <div>
                <Word delay="0.9s">Capsule</Word>
                <img src={CAPSULE_INLINE} alt="" className="capsule-inline hidden sm:inline-block align-middle ml-2 lg:ml-4 animate-scale-in delay-1000" />
              </div>
            </span>
          </h1>

          <div className="mt-8 sm:mt-12 lg:mt-[75px] flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8 lg:gap-[50px] animate-fade-up delay-600">
            <a
              href="#shop"
              className="inline-flex items-center justify-center gap-2 bg-black text-white rounded-md w-full sm:w-[240px] md:w-[280px] lg:w-[310px] h-14 sm:h-16 lg:h-[72px] text-base sm:text-xl lg:text-2xl"
              style={{ ...inter, fontWeight: 500, letterSpacing: "-0.03em" }}
            >
              Shop Now
              <ArrowUpRight size={22} strokeWidth={1.75} />
            </a>
            <p className="text-white max-w-[310px]" style={{ ...inter, fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1.45 }}>
              <span className="text-sm sm:text-base lg:text-lg">
                Discover our new plant-based supplements for daily balance and clean energy.
              </span>
            </p>
          </div>
        </section>

        <div className="lg:hidden relative z-10 -mb-[180px] sm:-mb-[220px] pointer-events-none">
          <img src={PRODUCT_LARGE} alt="TerraElix product" className="w-[180%] sm:w-[151%] max-w-[1296px] object-contain mx-auto drop-shadow-2xl animate-scale-in delay-800" />
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-[2fr_1fr_2fr]">
          <div className="relative overflow-hidden bg-[#ECEDEC] p-6 sm:p-8 lg:p-10 min-h-[220px] flex flex-col justify-between animate-fade-up delay-900">
            <p className="max-w-[350px] text-black" style={{ ...dmSans, fontWeight: 400, letterSpacing: "-0.05em", lineHeight: 1.1 }}>
              <span className="text-2xl sm:text-[28px] lg:text-[35px]">Free shipping on every order over $50</span>
            </p>
            <img src={PANEL1_DECO} alt="" className="absolute right-0 bottom-0 h-full object-contain mix-blend-multiply pointer-events-none" />
          </div>

          <div className="relative bg-[#FEFDF9] p-6 sm:p-8 lg:p-10 min-h-[220px] flex flex-col justify-between animate-fade-up delay-1000">
            <div className="relative flex-1">
              {cards.map(({ Icon, bg, text }, i) => (
                <div key={i} className={`flex items-start gap-3 sm:gap-4 transition-all duration-700 ${i === activeCard ? "opacity-100 translate-y-0 relative" : "opacity-0 translate-y-4 absolute inset-0"}`}>
                  <div className={`shrink-0 ${bg} rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center`}>
                    <Icon size={18} strokeWidth={1.75} className="text-white" />
                  </div>
                  <p className="text-black/80" style={{ ...inter, fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1.2 }}>
                    <span className="text-sm sm:text-base lg:text-lg">{text}</span>
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-2">
              {cards.map((_, i) => (
                <div key={i} className={`h-0.5 flex-1 rounded-full transition-colors ${i === activeCard ? "bg-black" : "bg-black/20"}`} />
              ))}
            </div>
          </div>

          <div className="bg-black p-6 sm:p-8 lg:p-10 min-h-[220px] flex items-center gap-4 sm:gap-6 lg:gap-8 animate-fade-up delay-1100">
            <img src={PANEL3_PRODUCT} alt="Product" className="w-[120px] h-[82px] sm:w-[160px] sm:h-[110px] lg:w-[208px] lg:h-[142px] object-contain shrink-0" />
            <div className="min-w-0">
              <div className="text-white" style={{ ...inter, fontWeight: 400, letterSpacing: "-0.05em" }}>
                <span className="text-2xl sm:text-3xl lg:text-[35px]">+14K</span>
              </div>
              <p className="text-white/60 mt-1" style={{ ...inter, fontWeight: 400, lineHeight: 1.2 }}>
                <span className="text-sm sm:text-base lg:text-lg">Happy customers already restocked this month</span>
              </p>
            </div>
          </div>
        </div>

        <img src={PRODUCT_LARGE} alt="" className="hidden lg:block absolute z-0 animate-scale-in delay-700 pointer-events-none" style={{ width: "clamp(600px, 80vw, 1412px)", height: "auto", bottom: "-10%", right: "clamp(-400px, -20vw, -100px)" }} />
      </div>

      {/* CATEGORIES SECTION */}
      <section id="categories" className="bg-[#FEFDF9] px-5 sm:px-8 lg:px-10 py-16 lg:py-24">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 lg:mb-14">
          <h2 className="text-black" style={{ ...dmSans, fontWeight: 400, letterSpacing: "-0.05em", fontSize: "clamp(36px, 6vw, 72px)", lineHeight: 1 }}>
            Shop by category
          </h2>
          <p className="text-black/60 max-w-md text-sm sm:text-base lg:text-lg">
            Curated by our herbalists — find the exact support your body is asking for.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map(({ Icon, name, count, bg, accent }) => (
            <button
              key={name}
              onClick={() => {
                setActiveCat(name);
                document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`${bg} text-left rounded-2xl p-6 lg:p-8 flex flex-col justify-between min-h-[180px] lg:min-h-[220px] hover:-translate-y-1 transition-transform`}
            >
              <div className={`${accent} w-12 h-12 rounded-full bg-white/70 flex items-center justify-center`}>
                <Icon size={22} strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-black" style={{ ...dmSans, fontWeight: 500, fontSize: "clamp(22px, 3vw, 30px)", letterSpacing: "-0.03em" }}>
                  {name}
                </div>
                <div className="text-black/50 text-sm mt-1">{count} products</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* PRODUCTS SECTION */}
      <section id="shop" className="bg-[#ECEDEC] px-5 sm:px-8 lg:px-10 py-16 lg:py-24">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 lg:mb-10">
          <h2 className="text-black" style={{ ...dmSans, fontWeight: 400, letterSpacing: "-0.05em", fontSize: "clamp(36px, 6vw, 72px)", lineHeight: 1 }}>
            Featured products
          </h2>
          <div className="flex items-center gap-2 text-black/60 text-sm">
            <SlidersHorizontal size={16} /> {visibleProducts.length} of {products.length}
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-2xl p-4 lg:p-5 mb-8 lg:mb-10 flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-8">
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

          <div className="flex items-center gap-3 flex-1 min-w-0 lg:max-w-xs">
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
              onClick={() => { setActiveCat("All"); setMaxPrice(priceMax); setSort("featured"); }}
              className="underline text-black"
            >
              Reset
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {visibleProducts.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl overflow-hidden flex flex-col group">
                <div className={`${p.bg} relative aspect-square flex items-center justify-center overflow-hidden`}>
                  <span className="absolute top-4 left-4 bg-black text-white text-xs px-3 py-1 rounded-full">{p.tag}</span>
                  <span className="absolute top-4 right-4 bg-white/80 text-black text-[11px] px-2 py-1 rounded-full">{p.category}</span>
                  <img src={p.img} alt={p.name} className="w-3/4 h-3/4 object-contain group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-black" style={{ ...dmSans, fontWeight: 500, fontSize: 20, letterSpacing: "-0.03em" }}>
                        {p.name}
                      </div>
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
            <div style={{ ...dmSans, fontWeight: 500, fontSize: 36, letterSpacing: "-0.05em" }}>TerraElix</div>
            <p className="text-white/60 mt-3 max-w-sm text-sm lg:text-base">
              Plant-based supplements for daily balance and clean energy.
            </p>
          </div>
          <div className="text-white/50 text-sm">© {new Date().getFullYear()} TerraElix. All rights reserved.</div>
        </div>
      </footer>

      {/* CART DRAWER */}
      <div
        className={`fixed inset-0 z-40 transition-opacity ${cartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        aria-hidden={!cartOpen}
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setCartOpen(false)} />
        <aside
          className={`absolute top-0 right-0 h-full w-full sm:w-[420px] bg-white flex flex-col shadow-2xl transition-transform duration-300 ${cartOpen ? "translate-x-0" : "translate-x-full"}`}
          role="dialog"
          aria-label="Shopping cart"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/10">
            <div className="flex items-center gap-2 text-black" style={{ ...dmSans, fontWeight: 500, fontSize: 22, letterSpacing: "-0.03em" }}>
              <ShoppingBag size={20} strokeWidth={1.75} /> Your cart
              <span className="text-black/40 text-sm">({cartCount})</span>
            </div>
            <button onClick={() => setCartOpen(false)} aria-label="Close cart" className="text-black/60 hover:text-black">
              <X size={22} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-black/50 gap-3">
                <ShoppingBag size={36} strokeWidth={1.25} />
                <p>Your cart is empty.</p>
                <button onClick={() => setCartOpen(false)} className="text-black underline text-sm">Keep shopping</button>
              </div>
            ) : (
              <ul className="flex flex-col gap-4">
                {cart.map((i) => (
                  <li key={i.id} className="flex gap-3">
                    <div className={`${i.bg} w-20 h-20 rounded-xl shrink-0 flex items-center justify-center overflow-hidden`}>
                      <img src={i.img} alt={i.name} className="w-4/5 h-4/5 object-contain" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-black truncate" style={{ ...dmSans, fontWeight: 500, fontSize: 16, letterSpacing: "-0.02em" }}>
                            {i.name}
                          </div>
                          <div className="text-black/50 text-xs">{i.category}</div>
                        </div>
                        <div className="text-black text-sm whitespace-nowrap" style={{ fontWeight: 500 }}>
                          ${(i.price * i.qty).toFixed(2)}
                        </div>
                      </div>
                      <div className="mt-auto pt-2 flex items-center justify-between">
                        <div className="inline-flex items-center border border-black/10 rounded-full h-8">
                          <button onClick={() => changeQty(i.id, -1)} className="w-8 h-8 flex items-center justify-center text-black/70 hover:text-black" aria-label="Decrease">
                            <Minus size={14} />
                          </button>
                          <span className="w-6 text-center text-sm text-black">{i.qty}</span>
                          <button onClick={() => changeQty(i.id, 1)} className="w-8 h-8 flex items-center justify-center text-black/70 hover:text-black" aria-label="Increase">
                            <Plus size={14} />
                          </button>
                        </div>
                        <button onClick={() => removeItem(i.id)} className="text-black/50 hover:text-black inline-flex items-center gap-1 text-xs" aria-label={`Remove ${i.name}`}>
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t border-black/10 px-5 py-4 flex flex-col gap-3">
              <div className="flex justify-between text-sm text-black/60">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-black/60">
                <span>Shipping</span>
                <span>{subtotal >= 50 ? "Free" : "$5.00"}</span>
              </div>
              <div className="flex justify-between text-black pt-2 border-t border-black/10" style={{ ...dmSans, fontWeight: 500, fontSize: 18 }}>
                <span>Total</span>
                <span>${(subtotal + (subtotal >= 50 || subtotal === 0 ? 0 : 5)).toFixed(2)}</span>
              </div>
              <button className="mt-2 inline-flex items-center justify-center gap-2 bg-black text-white rounded-md h-12 text-base hover:bg-black/85" style={{ fontWeight: 500 }}>
                Checkout <ArrowUpRight size={18} />
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
