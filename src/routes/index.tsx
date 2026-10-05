import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  ArrowUpRight,
  Sparkles,
  Star,
  Plus,
  SlidersHorizontal,
  Leaf,
  Truck,
  ShieldCheck,
  Heart,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Camera,
} from "lucide-react";
import SlickSlider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Slider: typeof SlickSlider =
  typeof SlickSlider === "function" ? SlickSlider : (SlickSlider as any)?.default || SlickSlider;
import { useOrders } from "@/lib/orders";
import productTowel from "@/assets/product-towel.jpg";
import productWallpaper from "@/assets/product-wallpaper.jpg";
import productSponge from "@/assets/product-sponge.jpg";
import {
  useProducts,
  useCategories,
  useBrands,
  useCart,
  useFavourites,
  usePromotions,
  type Category,
  type Product,
} from "@/lib/shop";
import { useSettings } from "@/lib/settings";
import { SafeImage } from "@/components/ui/SafeImage";
import { LazyCartDrawer as CartDrawer } from "@/components/LazyCartDrawer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { SiteFooter } from "@/components/SiteFooter";


import { FiltersSkeleton, ProductGridSkeleton, useMounted } from "@/components/skeletons";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { formatPKR } from "@/lib/format";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Dawood Mart — Home Essentials Store" },
      {
        name: "description",
        content:
          "Shop Dawood Mart towels, wallpaper, cleaning cloths, sponges and practical home essentials in PKR.",
      },
      { property: "og:title", content: "Dawood Mart — Home Essentials Store" },
      {
        property: "og:description",
        content:
          "Shop towels, wallpaper, cleaning cloths, sponges and practical home essentials from Dawood Mart.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "preload", as: "image", href: "/images/products/crown-jar-dryfruits-gold-tray.png", fetchPriority: "high" }],
  }),
});

const dmSans = { fontFamily: "'DM Sans', sans-serif" };
const inter = { fontFamily: "'Inter', sans-serif" };

const cards = [
  { Icon: Leaf, bg: "bg-emerald-800", text: "OEKO-TEX certified fabrics, kind to skin and planet" },
  {
    Icon: Truck,
    bg: "bg-stone-800",
    text: "Free carbon-neutral delivery on orders over PKR 5,000",
  },
  {
    Icon: ShieldCheck,
    bg: "bg-amber-800",
    text: "60-day home trial — return anything, no questions",
  },
  { Icon: Sparkles, bg: "bg-rose-800", text: "Small-batch made in family-run European mills" },
];

const navLinks = ["Shop", "Collections"];

type SortKey = "featured" | "price-asc" | "price-desc" | "rating";

function Word({
  children,
  delay,
  className = "",
}: {
  children: React.ReactNode;
  delay: string;
  className?: string;
}) {
  return (
    <span className="inline-block overflow-hidden align-bottom">
      <span
        className={`inline-block animate-word-reveal ${className}`}
        style={{ animationDelay: delay, animationFillMode: "both" }}
      >
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
  const { toggleFav, isFav, favCount } = useFavourites();
  const settings = useSettings();
  const mounted = useMounted();

  const { orderCount } = useOrders();
  const priceLimit = useProducts({ sort: "price-desc", pageSize: 1 });
  const { categories: liveCategories, categoryInfo, loadAll: loadAllCategories } = useCategories();
  const customerCategories = ["Table Sheets & Table Mats", "Wall Sheets & Wallpaper", ...liveCategories.filter(c => !/table.*(sheet|mat)|wall.*sheet|wallpaper/i.test(c))];
  const { brands: liveBrands } = useBrands();
  const { promotions } = usePromotions();

  const [activeCat, setActiveCat] = useState<Category | "All">("All");
  const [activeBrand, setActiveBrand] = useState<string>("All");

  const categorySliderRef = useRef<SlickSlider | null>(null);

  const categorySliderSettings = useMemo(
    () => ({
      dots: true,
      infinite: liveCategories.length > 4,
      speed: 500,
      slidesToShow: 4,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 3500,
      pauseOnHover: true,
      arrows: false,
      responsive: [
        {
          breakpoint: 1280,
          settings: {
            slidesToShow: 4,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
      ],
    }),
    [liveCategories.length],
  );

  const handleFav = useCallback(
    (p: Product) => {
      toggleFav(p);
    },
    [toggleFav],
  );

  const priceMin = 0;
  const priceMax = priceLimit.products[0]?.price || 0;
  const [maxPrice, setMaxPrice] = useState(priceMax);
  useEffect(() => {
    setMaxPrice(priceMax);
  }, [priceMax]);
  const [sort, setSort] = useState<SortKey>("featured");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 180);
  const [catalogPage, setCatalogPage] = useState(1);
  const { products, total: catalogTotal, loading: catalogLoading, error: catalogError, refetch: retryCatalog } = useProducts({
    page: catalogPage, pageSize: 24, search: debouncedQuery, category: activeCat,
    brand: activeBrand, sort, maxPrice: maxPrice > 0 ? String(maxPrice) : "",
  });
  useEffect(() => setCatalogPage(1), [debouncedQuery, activeCat, activeBrand, sort, maxPrice]);

  const focusSearch = () => {
    setTimeout(() => document.getElementById("header-search")?.focus(), 50);
  };
  const scrollToProducts = () => {
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const id = setInterval(() => setActiveCard((c) => (c + 1) % cards.length), 3500);
    return () => clearInterval(id);
  }, []);

  const addToCart = (p: Product) => {
    addToCartShared(p, 1);
  };

  const visibleProducts = products;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    for (const p of products) {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    }
    return counts;
  }, [products]);

  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    for (const p of products) {
      const b = p.brand;
      if (b) {
        counts[b] = (counts[b] || 0) + 1;
      }
    }
    return counts;
  }, [products]);


  const heroSlides = [
    {
      id: 1,
      bg: "linear-gradient(135deg, #000000 0%, #434343 100%)",
      img: "/images/products/crown-jar-dryfruits-gold-tray.png",
      tag: "Flat 20% Discount",
      title: (
        <>
          <div>
            <Word delay="0.3s">DeliSoga</Word> <Word delay="0.4s">Luxury</Word>{" "}
          </div>
          <div>
            <Word delay="0.5s" className="text-white/55">
              crown
            </Word>{" "}
            <Word delay="0.6s" className="text-white/55">
              jars.
            </Word>
          </div>
        </>
      ),
      subtitle:
        "Fast Delivery on all DeliSoga premium glassware products. Enhance your home with elegance.",
      link: "#shop",
      category: "All",
      cta: "Shop the offer",
    },
    {
      id: 2,
      bg: "linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)",
      img: "/images/products/timy-mugs-group.png",
      tag: "Flat 20% Discount",
      title: (
        <>
          <div>
            <Word delay="0.3s">Premium</Word> <Word delay="0.4s">Glass</Word>{" "}
          </div>
          <div>
            <Word delay="0.5s" className="text-white/55">
              tea
            </Word>{" "}
            <Word delay="0.6s" className="text-white/55">
              mugs.
            </Word>
          </div>
        </>
      ),
      subtitle:
        "Fast Delivery. Experience premium quality everyday with our exclusive DeliSoga mugs.",
      link: "#shop",
      category: "All",
      cta: "Shop the offer",
    },
    {
      id: 3,
      bg: "linear-gradient(135deg, #141E30 0%, #243B55 100%)",
      img: "/images/products/crown-jar-empty-gold-tray.png",
      tag: "Flat 20% Discount",
      title: (
        <>
          <div>
            <Word delay="0.3s">Elegant</Word> <Word delay="0.4s">Storage</Word>{" "}
          </div>
          <div>
            <Word delay="0.5s" className="text-white/55">
              for
            </Word>{" "}
            <Word delay="0.6s" className="text-white/55">
              home.
            </Word>
          </div>
        </>
      ),
      subtitle:
        "Fast Delivery. Perfect for gifts and home decor. Explore the latest DeliSoga arrivals.",
      link: "#shop",
      category: "All",
      cta: "Shop the offer",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col pb-20 lg:pb-0" style={inter}>
      {/* HERO SECTION */}

      <div className="relative flex flex-col overflow-hidden min-h-[500px] sm:min-h-[600px] lg:min-h-[700px] bg-stone-900">
        {/* Slider Backgrounds & Content */}
        <div className="absolute inset-0 z-0 [&_.slick-slider]:h-full [&_.slick-list]:h-full [&_.slick-track]:h-full [&_.slick-slide>div]:h-full">
          <Slider
            dots={true}
            infinite={true}
            speed={800}
            slidesToShow={1}
            slidesToScroll={1}
            autoplay={true}
            autoplaySpeed={5000}
            fade={true}
            arrows={false}
            pauseOnHover={false}
            customPaging={() => (
              <div className="w-2 h-2 rounded-full bg-white/40 mt-4 transition-all duration-300" />
            )}
            appendDots={(dots) => (
              <div
                style={{
                  position: "absolute",
                  bottom: "30px",
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <ul className="m-0 p-0 flex gap-2 [&_.slick-active_div]:bg-white [&_.slick-active_div]:w-6 [&_li]:w-auto [&_li]:h-auto">
                  {dots}
                </ul>
              </div>
            )}
          >
            {heroSlides.map((slide) => (
              <div key={slide.id} className="relative w-full h-full outline-none">
                <div
                  className="absolute inset-0 transition-transform duration-[10000ms] ease-out hover:scale-105"
                  style={{
                    background: slide.bg,
                  }}
                />
                <div className="absolute inset-0 z-0 flex items-center justify-end px-4 sm:px-10 opacity-30 md:opacity-100 md:w-1/2 md:left-1/2 pointer-events-none overflow-hidden">
                  {slide.img && (
                    <img 
                      src={slide.img} 
                      alt="" 
                      className="w-full max-w-lg max-h-[60%] sm:max-h-[70%] object-contain drop-shadow-2xl animate-fade-up delay-300"
                    />
                  )}
                </div>
                <div className="relative z-10 h-[500px] sm:h-[600px] lg:h-[700px] flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-10 pt-[80px] md:w-[60%]">
                  <span
                    className="inline-flex self-start items-center gap-2 rounded-full bg-red-600 px-4 py-1.5 text-white text-xs sm:text-sm font-bold uppercase tracking-wider animate-fade-up delay-200 shadow-md"
                    style={inter}
                  >
                    <Sparkles size={14} /> {slide.tag}
                  </span>
                  <h1
                    className="text-white mt-6 max-w-4xl"
                    style={{ ...dmSans, fontWeight: 300, letterSpacing: "-0.04em" }}
                  >
                    <style>{`
                      .hero-h1 { font-size: 32px; line-height: 1.1; }
                      @media (min-width: 640px) { .hero-h1 { font-size: 48px; } }
                      @media (min-width: 768px) { .hero-h1 { font-size: 60px; } }
                      @media (min-width: 1024px) { .hero-h1 { font-size: 72px; } }
                    `}</style>
                    <span className="hero-h1 block">{slide.title}</span>
                  </h1>

                  <div className="mt-8 sm:mt-12 lg:mt-14 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8 lg:gap-[50px] animate-fade-up delay-600">
                    <button
                      onClick={() => {
                        if (slide.category && slide.category !== "All") {
                          setActiveCat(slide.category as Category);
                          document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
                        } else {
                          document
                            .getElementById(slide.link.replace("#", ""))
                            ?.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      className="inline-flex items-center justify-center gap-2 bg-white text-black rounded-full w-full sm:w-[160px] md:w-[175px] lg:w-[185px] h-10 sm:h-11 lg:h-12 text-sm hover:bg-gray-200 hover:scale-105 transition-all cursor-pointer font-bold shadow-lg"
                      style={{ ...inter, letterSpacing: "-0.02em" }}
                    >
                      {slide.cta}
                      <ArrowUpRight size={18} strokeWidth={2} />
                    </button>
                    <p
                      className="text-white max-w-[340px]"
                      style={{
                        ...inter,
                        fontWeight: 500,
                        letterSpacing: "-0.02em",
                        lineHeight: 1.45,
                      }}
                    >
                      <span className="text-sm sm:text-sm lg:text-base">{slide.subtitle}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* Navbar Layer */}
        <div className="absolute top-0 left-0 right-0 z-20">
          <nav className="relative z-20 flex items-center justify-between px-5 py-4 sm:px-8 lg:px-10 lg:py-5 animate-fade-in">
            <div className="flex-1 flex items-center justify-start">
              <div className="type-wordmark animate-slide-left delay-200 text-white flex items-center gap-2">
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt=""
                    className="w-8 h-8 rounded-md object-cover bg-white/20"
                  />
                ) : null}
                {settings.brandName}
              </div>
            </div>

            <div
              className="flex-1 hidden md:flex items-center justify-center gap-6 lg:gap-10 animate-fade-in delay-400"
              style={dmSans}
            >
              {navLinks.map((l) => (
                <a
                  key={l}
                  href={`#${l.toLowerCase()}`}
                  className="text-white/90 hover:text-white transition-colors"
                  style={{ fontWeight: 500, fontSize: 14 }}
                >
                  {l}
                </a>
              ))}
            </div>
            <div className="flex-1 flex items-center justify-end gap-3 sm:gap-4 animate-slide-right delay-300">
              <div className="hidden lg:block w-[320px] xl:w-[480px]">
                <SearchAutocomplete
                  products={products}
                  categories={liveCategories}
                  brands={liveBrands}
                  query={query}
                  onQueryChange={(q) => {
                    setQuery(q);
                    if (q) setActiveCat("All");
                  }}
                  onSelectCategory={(c) => {
                    setActiveCat(c);
                    setActiveBrand("All");
                    scrollToProducts();
                  }}
                  onSelectBrand={(b) => {
                    setActiveBrand(b);
                    setActiveCat("All");
                    scrollToProducts();
                  }}
                  onSearchSubmit={scrollToProducts}
                  placeholder="Enter keyword, brand or product name…"
                  variant="header"
                />
              </div>
              <button
                aria-label="Search"
                onClick={focusSearch}
                className="sm:hidden text-white/90 hover:text-white"
              >
                <Search size={20} strokeWidth={1.5} />
              </button>
              <Link
                to="/favorites"
                aria-label="Favourites"
                className="relative text-white/90 hover:text-white"
              >
                <Heart size={20} strokeWidth={1.5} />
                {favCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[10px] font-medium min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                    {favCount}
                  </span>
                )}
              </Link>
              <Link
                to="/orders"
                aria-label="Orders"
                className="relative text-white/90 hover:text-white"
              >
                <ScrollText size={20} strokeWidth={1.5} />
                {orderCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[10px] font-medium min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                    {orderCount}
                  </span>
                )}
              </Link>
              <button
                aria-label="Cart"
                onClick={() => setCartOpen(true)}
                className="relative text-white/90 hover:text-white"
              >
                <ShoppingBag size={20} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[10px] font-medium min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                aria-label="Menu"
                className="md:hidden text-white"
                onClick={() => setMenuOpen((v) => !v)}
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </nav>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetContent
              side="right"
              className="w-[86%] max-w-sm bg-stone-950 text-white border-l border-white/10 p-0 flex flex-col"
            >
              <SheetHeader className="px-6 pt-6 pb-4 border-b border-white/10 text-left">
                <SheetTitle className="text-white type-wordmark flex items-center gap-2">
                  {settings.logoUrl ? (
                    <img
                      src={settings.logoUrl}
                      alt=""
                      className="w-7 h-7 rounded-md object-cover bg-white/10"
                    />
                  ) : null}
                  {settings.brandName}
                </SheetTitle>
                <SheetDescription className="text-white/60 text-xs" style={inter}>
                  Browse the shop
                </SheetDescription>
              </SheetHeader>

              <div className="px-6 py-5 border-b border-white/10">
                <SearchAutocomplete
                  products={products}
                  categories={liveCategories}
                  brands={liveBrands}
                  query={query}
                  onQueryChange={(q) => {
                    setQuery(q);
                    if (q) setActiveCat("All");
                  }}
                  onSelectCategory={(c) => {
                    setActiveCat(c);
                    setActiveBrand("All");
                    setMenuOpen(false);
                    setTimeout(scrollToProducts, 150);
                  }}
                  onSelectBrand={(b) => {
                    setActiveBrand(b);
                    setActiveCat("All");
                    setMenuOpen(false);
                    setTimeout(scrollToProducts, 150);
                  }}
                  onSelectProduct={() => setMenuOpen(false)}
                  onSearchSubmit={() => {
                    setMenuOpen(false);
                    setTimeout(scrollToProducts, 150);
                  }}
                  placeholder="Search products, brands…"
                  variant="mobile"
                />
              </div>


              <nav className="flex-1 overflow-y-auto px-3 py-4" style={dmSans}>
                <ul className="flex flex-col">
                  {navLinks.map((l, i) => (
                    <li
                      key={l}
                      className="animate-fade-in"
                      style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
                    >
                      <a
                        href={`#${l.toLowerCase()}`}
                        onClick={() => {
                          setMenuOpen(false);
                          if (l.toLowerCase() === "shop") setTimeout(scrollToProducts, 250);
                        }}
                        className="flex items-center justify-between px-3 py-3.5 rounded-lg text-white/90 hover:text-white hover:bg-white/5 focus-visible:bg-white/10 focus-visible:outline-none transition-colors text-lg"
                      >
                        <span>{l}</span>
                        <ArrowUpRight size={18} className="text-white/40" />
                      </a>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 px-3">
                  <div
                    className="text-[11px] uppercase tracking-[0.18em] text-white/40 mb-2"
                    style={inter}
                  >
                    Quick links
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Link
                      to="/favorites"
                      onClick={() => setMenuOpen(false)}
                      className="flex flex-col items-center gap-1.5 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <Heart size={18} />
                      <span className="text-xs" style={inter}>
                        Favourites{" "}
                        {favCount > 0 && <span className="text-white/60">({favCount})</span>}
                      </span>
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setMenuOpen(false)}
                      className="flex flex-col items-center gap-1.5 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <ScrollText size={18} />
                      <span className="text-xs" style={inter}>
                        Orders{" "}
                        {orderCount > 0 && <span className="text-white/60">({orderCount})</span>}
                      </span>
                    </Link>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setCartOpen(true);
                      }}
                      className="flex flex-col items-center gap-1.5 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <ShoppingBag size={18} />
                      <span className="text-xs" style={inter}>
                        Cart {cartCount > 0 && <span className="text-white/60">({cartCount})</span>}
                      </span>
                    </button>
                  </div>
                </div>
              </nav>

              <div
                className="px-6 py-4 border-t border-white/10 text-[11px] text-white/40"
                style={inter}
              >
                © {new Date().getFullYear()} {settings.brandName}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Promotion Cards anchored below hero */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 mt-auto">
        {(() => {
          const active = promotions.filter((p) => p.isActive);
          const cards =
            active.length > 0
              ? active.map((p) => ({
                  key: p.id,
                  label: p.label,
                  bg: p.bgColor,
                  chipBg: p.chipStyle === "dark" ? "bg-black" : "bg-white",
                  chipText: p.chipStyle === "dark" ? "text-white" : "text-black",
                  off: p.headline,
                  img: p.imageUrl || null,
                  linkCategory: p.linkCategory,
                }))
              : [
                  {
                    key: "TOWELS",
                    label: "TOWELS",
                    bg: "#ECEDEC",
                    chipBg: "bg-white",
                    chipText: "text-black",
                    off: "UP to 40% OFF",
                    img: productTowel,
                    linkCategory: "Towels",
                  },
                  {
                    key: "WALLPAPER",
                    label: "WALLPAPER",
                    bg: "#FEF3C7",
                    chipBg: "bg-black",
                    chipText: "text-white",
                    off: "UP to 60% OFF",
                    img: productWallpaper,
                    linkCategory: "Wallpaper",
                  },
                  {
                    key: "CLEANING",
                    label: "CLEANING",
                    bg: "#FCE7D8",
                    chipBg: "bg-white",
                    chipText: "text-black",
                    off: "UP to 35% OFF",
                    img: productSponge,
                    linkCategory: "Cloths",
                  },
                ];
          return cards.map((c, i) => (
            <a
              key={c.key}
              href={c.linkCategory ? `#collections` : undefined}
              onClick={(e) => {
                if (c.linkCategory) {
                  e.preventDefault();
                  setActiveCat(c.linkCategory as Category);
                  document.getElementById("collections")?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="relative overflow-hidden p-4 sm:p-5 md:p-6 lg:p-7 min-h-[140px] sm:h-[160px] md:min-h-[175px] lg:min-h-[190px] flex items-center gap-3 sm:gap-4 animate-fade-up cursor-pointer group"
              style={{
                backgroundColor: c.bg,
                animationDelay: `${900 + i * 100}ms`,
                animationFillMode: "both",
              }}
            >
              <div className="flex-1 min-w-0 flex flex-col gap-2 sm:gap-3">
                <span
                  className={`${c.chipBg} ${c.chipText} self-start text-[10px] sm:text-xs tracking-[0.15em] px-3 py-1.5 rounded-md`}
                  style={{ ...inter, fontWeight: 600 }}
                >
                  {c.label}
                </span>
                <div
                  className="text-black break-words"
                  style={{
                    ...dmSans,
                    fontWeight: 500,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.15,
                    fontSize: "clamp(15px, 2.2vw, 28px)",
                  }}
                >
                  {c.off}
                </div>
              </div>
              <div className="absolute -right-6 -top-6 w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-white/40 blur-2xl pointer-events-none" />
              {c.img && (
                <SafeImage
                  src={c.img}
                  alt=""
                  width={1024}
                  height={1024}
                  loading="lazy"
                  decoding="async"
                  className="relative w-[64px] h-[64px] sm:w-[88px] sm:h-[88px] md:w-[108px] md:h-[108px] lg:w-[130px] lg:h-[130px] rounded-xl object-cover shrink-0 transition-transform group-hover:scale-105"
                />
              )}
            </a>
          ));
        })()}
      </div>

      {/* CATEGORIES SECTION */}
      <section
        id="collections"
        className="bg-[#fbf9fd] px-4 sm:px-6 md:px-8 lg:px-10 py-8 sm:py-12 lg:py-16"
      >
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 lg:mb-8">
          <div>
            <h2 className="type-h1 text-black">Shop by room</h2>
            <p className="text-black/60 max-w-md text-sm sm:text-base mt-2">
              Four small edits with big impact — bath, walls, kitchen, and the daily reset.
            </p>
          </div>
          {liveCategories.length > 0 && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => categorySliderRef.current?.slickPrev()}
                className="w-9 h-9 rounded-full border border-black/15 bg-white text-black hover:bg-brand-primary-hover hover:text-white transition-all duration-200 flex items-center justify-center shadow-xs active:scale-95 cursor-pointer"
                aria-label="Previous categories"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => categorySliderRef.current?.slickNext()}
                className="w-9 h-9 rounded-full border border-black/15 bg-white text-black hover:bg-brand-primary-hover hover:text-white transition-all duration-200 flex items-center justify-center shadow-xs active:scale-95 cursor-pointer"
                aria-label="Next categories"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
        {liveCategories.length === 0 ? (
          <div className="rounded-2xl bg-white/60 border border-black/5 p-10 text-center text-black/60">
            No categories yet. Add some from the admin dashboard.
          </div>
        ) : (
          <div className="category-slick-slider -mx-2">
            <Slider ref={categorySliderRef} {...categorySliderSettings}>
              {customerCategories.slice(0, 6).map((name) => {
                const catProducts = products.filter((p) => p.category === name);
                const customImg = categoryInfo[name]?.imageUrl;
                const img = customImg || catProducts.find((p) => p.img)?.img;
                const bg = catProducts.find((p) => p.bg)?.bg || "bg-stone-200";

                return (
                  <div key={name} className="h-full py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCat(name);
                        document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={`${bg} group relative text-left rounded-xl overflow-hidden flex flex-col justify-between h-[180px] sm:h-[220px] lg:h-[260px] w-full hover:-translate-y-1 transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer`}
                    >
                      {img && (
                        <SafeImage
                          src={img}
                          alt={name}
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                      <div className="relative p-4 lg:p-5 flex flex-col justify-between h-full w-full">
                        <div className="w-9 h-9 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center text-black shadow-xs">
                          <Sparkles size={16} strokeWidth={1.5} />
                        </div>
                        <div>
                          <div className="type-h3 text-white drop-shadow-sm">{name}</div>
                          <div className="text-white/80 text-xs sm:text-sm mt-2 font-medium">
                            Explore collection
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </Slider>
          </div>
        )}
      </section>

      {/* PRODUCTS SECTION */}
      <section
        id="shop"
        className="bg-brand-lavender px-4 sm:px-6 md:px-8 lg:px-10 py-8 sm:py-12 lg:py-16"
      >
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 lg:mb-8">
          <h2 className="type-h1 text-black">The Home Edit</h2>
          <button onClick={() => void loadAllCategories()} className="text-sm underline">Browse all categories</button>
          <div className="flex items-center gap-2 text-black/60 text-sm">
            <SlidersHorizontal size={16} />{" "}
            {mounted ? `${visibleProducts.length} of ${catalogTotal}` : "Loading…"}
          </div>
        </div>

        {!mounted ? (
          <>
            <FiltersSkeleton />
            <ProductGridSkeleton count={8} />
          </>
        ) : (
          <>
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
              
              {/* DESKTOP SIDEBAR - STICKY INDEPENDENT SCROLL */}
              <aside className="hidden lg:block w-[280px] shrink-0 sticky top-20 max-h-[calc(100vh-5.5rem)] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-black/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-black/20">
                <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm flex flex-col gap-6">
                  
                  {/* Categories Section */}
                  <div>
                    <h3 className="font-bold text-base mb-3 text-black flex items-center justify-between" style={dmSans}>
                      <span>Categories</span>
                      {activeCat !== "All" && (
                        <button
                          onClick={() => setActiveCat("All")}
                          className="text-[11px] text-black/50 hover:text-brand-primary font-normal underline cursor-pointer"
                        >
                          All
                        </button>
                      )}
                    </h3>
                    <div className="flex flex-col gap-1 max-h-[220px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-black/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                      {(["All", ...customerCategories] as const).map((c) => {
                        const active = activeCat === c;
                        const count = categoryCounts[c];
                        return (
                          <button
                            key={c}
                            onClick={() => setActiveCat(c)}
                            aria-pressed={active}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                              active
                                ? "bg-brand-primary text-white shadow-sm font-semibold"
                                : "bg-transparent text-black/70 hover:bg-black/5 hover:text-brand-primary font-medium"
                            }`}
                          >
                            <span className="truncate pr-2">{c}</span>
                            {count !== undefined && (
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${
                                  active ? "bg-white/20 text-white" : "bg-black/5 text-black/50"
                                }`}
                              >
                                {count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Brands Section */}
                  <div className="pt-4 border-t border-black/5">
                    <h3 className="font-bold text-base mb-3 text-black flex items-center justify-between" style={dmSans}>
                      <span>Brands</span>
                      {activeBrand !== "All" && (
                        <button
                          onClick={() => setActiveBrand("All")}
                          className="text-[11px] text-black/50 hover:text-brand-primary font-normal underline cursor-pointer"
                        >
                          All
                        </button>
                      )}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 max-h-[160px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-black/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                      {(["All", ...liveBrands] as const).map((b) => {
                        const active = activeBrand === b;
                        const count = brandCounts[b];
                        return (
                          <button
                            key={b}
                            onClick={() => setActiveBrand(b)}
                            aria-pressed={active}
                            className={`px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer font-medium flex items-center gap-1 ${
                              active
                                ? "bg-brand-primary text-white shadow-sm font-bold"
                                : "bg-black/[0.04] text-black/70 hover:bg-black/10 hover:text-brand-primary"
                            }`}
                          >
                            <span>{b}</span>
                            {count !== undefined && b !== "All" && (
                              <span className="text-[10px] opacity-60">({count})</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Price Range Section */}
                  <div className="pt-4 border-t border-black/5">
                    <h3 className="font-bold text-base mb-3 text-black" style={dmSans}>Price Range</h3>
                    <div className="flex flex-col gap-2.5">
                      <div className="flex justify-between items-center text-xs font-medium text-black">
                        <span>Max Price:</span>
                        <span className="font-bold">{formatPKR(maxPrice)}</span>
                      </div>
                      <input
                        type="range"
                        min={priceMin}
                        max={priceMax}
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full accent-black h-1.5 bg-black/10 rounded-lg cursor-pointer"
                        aria-label="Max price filter"
                      />
                    </div>
                  </div>

                  {/* Reset button if filters active */}
                  {(activeCat !== "All" || activeBrand !== "All" || maxPrice < priceMax || debouncedQuery) && (
                    <button
                      onClick={() => {
                        setActiveCat("All");
                        setActiveBrand("All");
                        setMaxPrice(priceMax);
                        setSort("featured");
                        setQuery("");
                      }}
                      className="text-xs text-black hover:text-brand-primary flex items-center justify-center gap-2 bg-black/5 hover:bg-black/10 px-4 py-2.5 rounded-xl transition-colors font-semibold w-full cursor-pointer mt-1"
                    >
                      <RotateCcw size={14} /> Reset All Filters
                    </button>
                  )}
                </div>
              </aside>

              {/* MAIN CONTENT AREA */}
              <div className="flex-1 min-w-0 w-full">
                
                {/* Mobile Filter & Sort Bar */}
                <div className="lg:hidden sticky top-0 z-30 bg-brand-lavender/90 backdrop-blur-md py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 mb-4 transition-all">
                  <div className="bg-white rounded-2xl p-2 sm:p-2.5 border border-black/5 shadow-sm flex items-center justify-between gap-2">
                    
                    {/* Mobile Drawer Trigger */}
                    <Sheet>
                      <SheetTrigger asChild>
                        <button className="flex items-center gap-2 px-3 py-2 bg-black/5 hover:bg-black/10 transition-colors rounded-xl text-xs sm:text-sm font-semibold text-black cursor-pointer">
                          <SlidersHorizontal size={15} /> <span>Filters</span>
                          {(activeCat !== "All" || activeBrand !== "All") && (
                            <span className="w-2 h-2 rounded-full bg-red-600" />
                          )}
                        </button>
                      </SheetTrigger>
                      <SheetContent side="left" className="w-[85vw] max-w-[320px] bg-white p-6 overflow-y-auto">
                        <SheetHeader className="mb-5">
                          <SheetTitle className="text-left text-xl font-bold" style={dmSans}>Filters & Brands</SheetTitle>
                        </SheetHeader>
                        <div className="flex flex-col gap-6">
                          
                          {/* Categories */}
                          <div>
                            <h3 className="font-bold text-sm mb-2.5 text-black" style={dmSans}>Categories</h3>
                            <div className="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                              {(["All", ...customerCategories] as const).map((c) => {
                                const active = activeCat === c;
                                const count = categoryCounts[c];
                                return (
                                  <button
                                    key={c}
                                    onClick={() => setActiveCat(c)}
                                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                                      active
                                        ? "bg-brand-primary text-white shadow-sm font-semibold"
                                        : "bg-transparent text-black/70 hover:bg-black/5 hover:text-brand-primary font-medium"
                                    }`}
                                  >
                                    <span>{c}</span>
                                    {count !== undefined && (
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${active ? "bg-white/20 text-white" : "bg-black/5 text-black/50"}`}>
                                        {count}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Brands */}
                          <div className="pt-4 border-t border-black/5">
                            <h3 className="font-bold text-sm mb-2.5 text-black" style={dmSans}>Brands</h3>
                            <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                              {(["All", ...liveBrands] as const).map((b) => {
                                const active = activeBrand === b;
                                const count = brandCounts[b];
                                return (
                                  <button
                                    key={b}
                                    onClick={() => setActiveBrand(b)}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer font-medium flex items-center gap-1 ${
                                      active
                                        ? "bg-brand-primary text-white shadow-sm font-bold"
                                        : "bg-black/[0.04] text-black/70 hover:bg-black/10 hover:text-brand-primary"
                                    }`}
                                  >
                                    <span>{b}</span>
                                    {count !== undefined && b !== "All" && (
                                      <span className="text-[10px] opacity-60">({count})</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Price Range */}
                          <div className="pt-4 border-t border-black/5">
                            <h3 className="font-bold text-sm mb-2.5 text-black" style={dmSans}>Price Range</h3>
                            <div className="flex flex-col gap-2">
                              <div className="flex justify-between items-center text-xs font-medium text-black">
                                <span>Up to:</span>
                                <span className="font-bold">{formatPKR(maxPrice)}</span>
                              </div>
                              <input
                                type="range"
                                min={priceMin}
                                max={priceMax}
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(Number(e.target.value))}
                                className="w-full accent-black h-1.5 bg-black/10 rounded-lg cursor-pointer"
                              />
                            </div>
                          </div>

                          {(activeCat !== "All" || activeBrand !== "All" || maxPrice < priceMax || debouncedQuery) && (
                            <SheetTrigger asChild>
                              <button
                                onClick={() => {
                                  setActiveCat("All");
                                  setActiveBrand("All");
                                  setMaxPrice(priceMax);
                                  setSort("featured");
                                  setQuery("");
                                }}
                                className="text-xs text-black flex items-center justify-center gap-2 bg-black/5 hover:bg-black/10 px-4 py-2.5 rounded-xl transition-colors font-semibold w-full cursor-pointer mt-2"
                              >
                                <RotateCcw size={14} /> Reset Filters
                              </button>
                            </SheetTrigger>
                          )}

                        </div>
                      </SheetContent>
                    </Sheet>

                    {/* Active filter badge display on mobile */}
                    <div className="flex items-center gap-1 text-[11px] text-black/60 truncate flex-1 justify-center">
                      <span className="font-medium text-black truncate">
                        {activeCat !== "All" ? activeCat : activeBrand !== "All" ? activeBrand : "All Products"}
                      </span>
                      <span>({visibleProducts.length})</span>
                    </div>

                    {/* Sort Select */}
                    <div className="flex items-center gap-1.5 bg-black/[0.02] hover:bg-black/[0.04] transition-colors px-2.5 py-1.5 rounded-xl border border-black/5 shrink-0">
                      <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as SortKey)}
                        className="bg-transparent text-xs text-black font-semibold outline-none cursor-pointer pr-1"
                        aria-label="Sort products"
                      >
                        <option value="featured">Featured</option>
                        <option value="price-asc">Price: Low-High</option>
                        <option value="price-desc">Price: High-Low</option>
                        <option value="rating">Top Rated</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Desktop Sort Bar */}
                <div className="hidden lg:flex items-center justify-between mb-6">
                   <div className="flex items-center gap-2 text-sm text-black/70">
                      <span className="font-medium">Showing {visibleProducts.length}</span>
                      {activeCat !== "All" && <span className="bg-black/5 px-2 py-0.5 rounded text-xs">Category: <b>{activeCat}</b></span>}
                      {activeBrand !== "All" && <span className="bg-black/5 px-2 py-0.5 rounded text-xs">Brand: <b>{activeBrand}</b></span>}
                   </div>
                   <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-black/5 shadow-sm">
                      <SlidersHorizontal size={14} className="text-black/50 shrink-0" />
                      <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as SortKey)}
                        className="bg-transparent text-sm text-black font-semibold outline-none cursor-pointer pr-1"
                        aria-label="Sort products"
                      >
                        <option value="featured">Featured</option>
                        <option value="price-asc">Price: low to high</option>
                        <option value="price-desc">Price: high to low</option>
                        <option value="rating">Top rated</option>
                      </select>
                    </div>
                </div>

            {catalogLoading ? <ProductGridSkeleton count={8} /> : catalogError ? <div role="alert">{catalogError} <button onClick={retryCatalog}>Retry</button></div> : visibleProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center text-black/60">
                No products match your filters.{" "}
                <button
                  onClick={() => {
                    setActiveCat("All");
                    setActiveBrand("All");
                    setMaxPrice(priceMax);
                    setSort("featured");
                    setQuery("");
                  }}
                  className="underline text-black font-semibold cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 lg:gap-4">
                {visibleProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isFavourite={isFav(p.id)}
                    onToggleFav={handleFav}
                  />
                ))}
              </div>
            )}
            
              <nav aria-label="Product pages" className="mt-6 flex items-center justify-center gap-4">
                <button disabled={catalogPage === 1 || catalogLoading} onClick={() => setCatalogPage(p => p - 1)} className="rounded-full border px-4 py-2 disabled:opacity-40">Previous</button>
                <span>{catalogPage} / {Math.max(1, Math.ceil(catalogTotal / 24))}</span>
                <button disabled={catalogPage * 24 >= catalogTotal || catalogLoading} onClick={() => setCatalogPage(p => p + 1)} className="rounded-full border px-4 py-2 disabled:opacity-40">Next</button>
              </nav>
            </div>
          </div>
          </>
        )}
      </section>

      {/* FOOTER */}
      <SiteFooter />

      {/* MOBILE BOTTOM NAVIGATION DOCK */}
      <MobileBottomNav
        onOpenCart={() => setCartOpen(true)}
        onOpenCategories={() => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" })}
      />

      {/* CART DRAWER */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

