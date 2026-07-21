import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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

const categories = [
  { Icon: Leaf, name: "Immunity", count: 24, bg: "bg-emerald-100", accent: "text-emerald-800" },
  { Icon: Sun, name: "Energy", count: 18, bg: "bg-amber-100", accent: "text-amber-800" },
  { Icon: Droplets, name: "Hydration", count: 12, bg: "bg-cyan-100", accent: "text-cyan-800" },
  { Icon: FlaskConical, name: "Focus", count: 15, bg: "bg-rose-100", accent: "text-rose-800" },
];

const products = [
  {
    name: "Daily Balance",
    tag: "Bestseller",
    price: 38,
    rating: 4.9,
    img: PRODUCT_LARGE,
    bg: "bg-[#ECEDEC]",
  },
  {
    name: "Clean Energy",
    tag: "New",
    price: 42,
    rating: 4.8,
    img: PANEL3_PRODUCT,
    bg: "bg-[#FEFDF9]",
  },
  {
    name: "Immune Boost",
    tag: "Popular",
    price: 34,
    rating: 4.7,
    img: PANEL1_DECO,
    bg: "bg-[#F1EFE9]",
  },
  {
    name: "Deep Focus",
    tag: "Limited",
    price: 46,
    rating: 4.9,
    img: CAPSULE_INLINE,
    bg: "bg-[#E8E9E4]",
  },
];

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

  useEffect(() => {
    const id = setInterval(() => setActiveCard((c) => (c + 1) % cards.length), 3500);
    return () => clearInterval(id);
  }, []);

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
        {/* Navbar */}
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
            <button aria-label="Cart" className="relative text-white/90 hover:text-white">
              <ShoppingBag size={20} strokeWidth={1.5} />
              <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[10px] font-medium w-4 h-4 rounded-full flex items-center justify-center">2</span>
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

        {/* Hero */}
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

        {/* Mobile/tablet product image */}
        <div className="lg:hidden relative z-10 -mb-[180px] sm:-mb-[220px] pointer-events-none">
          <img src={PRODUCT_LARGE} alt="TerraElix product" className="w-[180%] sm:w-[151%] max-w-[1296px] object-contain mx-auto drop-shadow-2xl animate-scale-in delay-800" />
        </div>

        {/* 3-panel grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-[2fr_1fr_2fr]">
          <div className="relative overflow-hidden bg-[#ECEDEC] p-6 sm:p-8 lg:p-10 min-h-[220px] flex flex-col justify-between animate-fade-up delay-900">
            <p className="max-w-[350px] text-black" style={{ ...dmSans, fontWeight: 400, letterSpacing: "-0.05em", lineHeight: 1.1 }}>
              <span className="text-2xl sm:text-[28px] lg:text-[35px]">
                Free shipping on every order over $50
              </span>
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
          <p className="text-black/60 max-w-md text-sm sm:text-base lg:text-lg" style={inter}>
            Curated by our herbalists — find the exact support your body is asking for.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map(({ Icon, name, count, bg, accent }) => (
            <a key={name} href="#shop" className={`${bg} rounded-2xl p-6 lg:p-8 flex flex-col justify-between min-h-[180px] lg:min-h-[220px] hover:-translate-y-1 transition-transform`}>
              <div className={`${accent} w-12 h-12 rounded-full bg-white/70 flex items-center justify-center`}>
                <Icon size={22} strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-black" style={{ ...dmSans, fontWeight: 500, fontSize: "clamp(22px, 3vw, 30px)", letterSpacing: "-0.03em" }}>
                  {name}
                </div>
                <div className="text-black/50 text-sm mt-1" style={inter}>{count} products</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* PRODUCTS SECTION */}
      <section id="shop" className="bg-[#ECEDEC] px-5 sm:px-8 lg:px-10 py-16 lg:py-24">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 lg:mb-14">
          <h2 className="text-black" style={{ ...dmSans, fontWeight: 400, letterSpacing: "-0.05em", fontSize: "clamp(36px, 6vw, 72px)", lineHeight: 1 }}>
            Featured products
          </h2>
          <a href="#" className="inline-flex items-center gap-2 text-black underline" style={{ ...inter, fontWeight: 500 }}>
            View all <ArrowUpRight size={18} />
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((p) => (
            <div key={p.name} className="bg-white rounded-2xl overflow-hidden flex flex-col group">
              <div className={`${p.bg} relative aspect-square flex items-center justify-center overflow-hidden`}>
                <span className="absolute top-4 left-4 bg-black text-white text-xs px-3 py-1 rounded-full" style={inter}>{p.tag}</span>
                <img src={p.img} alt={p.name} className="w-3/4 h-3/4 object-contain group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-black" style={{ ...dmSans, fontWeight: 500, fontSize: 20, letterSpacing: "-0.03em" }}>
                      {p.name}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-black/60 text-xs" style={inter}>
                      <Star size={12} className="fill-black text-black" /> {p.rating}
                    </div>
                  </div>
                  <div className="text-black" style={{ ...dmSans, fontWeight: 500, fontSize: 20 }}>${p.price}</div>
                </div>
                <button className="mt-1 inline-flex items-center justify-center gap-2 bg-black text-white rounded-md h-11 text-sm hover:bg-black/85" style={{ ...inter, fontWeight: 500 }}>
                  Add to cart <Plus size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black text-white px-5 sm:px-8 lg:px-10 py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div>
            <div style={{ ...dmSans, fontWeight: 500, fontSize: 36, letterSpacing: "-0.05em" }}>TerraElix</div>
            <p className="text-white/60 mt-3 max-w-sm text-sm lg:text-base" style={inter}>
              Plant-based supplements for daily balance and clean energy.
            </p>
          </div>
          <div className="text-white/50 text-sm" style={inter}>
            © {new Date().getFullYear()} TerraElix. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
