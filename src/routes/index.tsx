import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Search,
  ShoppingBag,
  CornerUpLeft,
  Menu,
  X,
  ArrowUpRight,
  FlaskConical,
  Leaf,
  Droplets,
  Sun,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

const BG_URL =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260624_110248_b62f758d-f68c-4045-a7b4-91771d6d0a0f.png&w=1280&q=85";
const AVATAR =
  "https://polo-pecan-73837341.figma.site/_assets/v11/ca8093996e970200cbcf8bde8744175e52da5a79.png";
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

const navLinks = ["About", "Products", "Promotions", "Contact"];

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
    <div
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{
        backgroundImage: `url(${BG_URL})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        ...inter,
      }}
    >
      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-5 py-4 sm:px-8 lg:px-10 lg:py-5 animate-fade-in">
        <div className="animate-slide-left delay-200 text-white" style={{ ...dmSans, fontWeight: 500, fontSize: 30, letterSpacing: "-0.05em" }}>
          TerraElix
        </div>
        <div className="hidden md:flex items-center gap-6 lg:gap-10 animate-fade-in delay-400" style={dmSans}>
          {navLinks.map((l) => (
            <a key={l} href="#" className="text-white/90 hover:text-white transition-colors" style={{ fontWeight: 500, fontSize: 18 }}>
              {l}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3 sm:gap-4 animate-slide-right delay-300">
          <button aria-label="Search" className="text-white/90 hover:text-white"><Search size={20} strokeWidth={1.5} /></button>
          <button aria-label="Cart" className="text-white/90 hover:text-white"><ShoppingBag size={20} strokeWidth={1.5} /></button>
          <button aria-label="Return" className="text-white/90 hover:text-white"><CornerUpLeft size={20} strokeWidth={1.5} /></button>
          <img src={AVATAR} alt="Account" className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover" />
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
            <a key={l} href="#" onClick={() => setMenuOpen(false)} className="text-white text-2xl" style={dmSans}>
              {l}
            </a>
          ))}
        </div>
      )}

      {/* Hero */}
      <section className="relative z-10 flex flex-1 flex-col justify-center px-5 sm:px-8 lg:px-10 py-8 lg:py-12">
        <h1
          className="text-white"
          style={{
            ...dmSans,
            fontWeight: 400,
            letterSpacing: "-0.05em",
          }}
        >
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
              <img
                src={CAPSULE_INLINE}
                alt=""
                className="capsule-inline hidden sm:inline-block align-middle ml-2 lg:ml-4 animate-scale-in delay-1000"
              />
            </div>
          </span>
        </h1>

        {/* CTA */}
        <div className="mt-8 sm:mt-12 lg:mt-[75px] flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8 lg:gap-[50px] animate-fade-up delay-600">
          <button
            className="inline-flex items-center justify-center gap-2 bg-black text-white rounded-md w-full sm:w-[240px] md:w-[280px] lg:w-[310px] h-14 sm:h-16 lg:h-[72px] text-base sm:text-xl lg:text-2xl"
            style={{ ...inter, fontWeight: 500, letterSpacing: "-0.03em" }}
          >
            Explore Now
            <ArrowUpRight size={22} strokeWidth={1.75} />
          </button>
          <p
            className="text-white max-w-[310px]"
            style={{ ...inter, fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1.45 }}
          >
            <span className="text-sm sm:text-base lg:text-lg">
              Discover our new plant-based supplements for daily balance and clean energy.
            </span>
          </p>
        </div>
      </section>

      {/* Mobile/tablet product image */}
      <div className="lg:hidden relative z-10 -mb-[180px] sm:-mb-[220px] pointer-events-none">
        <img
          src={PRODUCT_LARGE}
          alt="TerraElix product"
          className="w-[180%] sm:w-[151%] max-w-[1296px] object-contain mx-auto drop-shadow-2xl animate-scale-in delay-800"
        />
      </div>

      {/* 3-panel grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-[2fr_1fr_2fr]">
        {/* Panel 1 */}
        <div className="relative overflow-hidden bg-[#ECEDEC] p-6 sm:p-8 lg:p-10 min-h-[220px] flex flex-col justify-between animate-fade-up delay-900">
          <p
            className="max-w-[350px] text-black"
            style={{ ...dmSans, fontWeight: 400, letterSpacing: "-0.05em", lineHeight: 1.1 }}
          >
            <span className="text-2xl sm:text-[28px] lg:text-[35px]">
              Start your personalized path to natural balance
            </span>
          </p>
          <a
            href="#"
            className="mt-6 inline-block underline text-black relative z-10"
            style={{ ...inter, fontWeight: 400, letterSpacing: "-0.03em" }}
          >
            <span className="text-base lg:text-lg">Personal Assessment</span>
          </a>
          <img
            src={PANEL1_DECO}
            alt=""
            className="absolute right-0 bottom-0 h-full object-contain mix-blend-multiply pointer-events-none"
          />
        </div>

        {/* Panel 2 */}
        <div className="relative bg-[#FEFDF9] p-6 sm:p-8 lg:p-10 min-h-[220px] flex flex-col justify-between animate-fade-up delay-1000">
          <div className="relative flex-1">
            {cards.map(({ Icon, bg, text }, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 sm:gap-4 transition-all duration-700 ${
                  i === activeCard ? "opacity-100 translate-y-0 relative" : "opacity-0 translate-y-4 absolute inset-0"
                }`}
              >
                <div className={`shrink-0 ${bg} rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center`}>
                  <Icon size={18} strokeWidth={1.75} className="text-white" />
                </div>
                <p
                  className="text-black/80"
                  style={{ ...inter, fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1.2 }}
                >
                  <span className="text-sm sm:text-base lg:text-lg">{text}</span>
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-2">
            {cards.map((_, i) => (
              <div
                key={i}
                className={`h-0.5 flex-1 rounded-full transition-colors ${i === activeCard ? "bg-black" : "bg-black/20"}`}
              />
            ))}
          </div>
        </div>

        {/* Panel 3 */}
        <div className="bg-black p-6 sm:p-8 lg:p-10 min-h-[220px] flex items-center gap-4 sm:gap-6 lg:gap-8 animate-fade-up delay-1100">
          <img
            src={PANEL3_PRODUCT}
            alt="Product"
            className="w-[120px] h-[82px] sm:w-[160px] sm:h-[110px] lg:w-[208px] lg:h-[142px] object-contain shrink-0"
          />
          <div className="min-w-0">
            <div
              className="text-white"
              style={{ ...inter, fontWeight: 400, letterSpacing: "-0.05em" }}
            >
              <span className="text-2xl sm:text-3xl lg:text-[35px]">+14K</span>
            </div>
            <p
              className="text-white/60 mt-1"
              style={{ ...inter, fontWeight: 400, lineHeight: 1.2 }}
            >
              <span className="text-sm sm:text-base lg:text-lg">
                People have already optimized their wellness
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Desktop floating product */}
      <img
        src={PRODUCT_LARGE}
        alt=""
        className="hidden lg:block absolute z-0 animate-scale-in delay-700 pointer-events-none"
        style={{
          width: "clamp(600px, 80vw, 1412px)",
          height: "auto",
          bottom: "-10%",
          right: "clamp(-400px, -20vw, -100px)",
        }}
      />
    </div>
  );
}
