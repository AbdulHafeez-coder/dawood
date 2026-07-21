import { useCallback, useEffect, useState } from "react";
import productTowel from "@/assets/product-towel.jpg";
import productWallpaper from "@/assets/product-wallpaper.jpg";
import productCloth from "@/assets/product-cloth.jpg";
import productSponge from "@/assets/product-sponge.jpg";
import productBathset from "@/assets/product-bathset.jpg";
import heroBg from "@/assets/hero-home.jpg";

export const CATEGORY_LIST = ["Towels", "Wallpaper", "Cloths", "Sponges"] as const;
export type Category = (typeof CATEGORY_LIST)[number];

export type Product = {
  id: string;
  name: string;
  tag: string;
  price: number;
  rating: number;
  img: string;
  bg: string;
  category: Category;
  tagline: string;
  description: string;
  details: string[];
  gallery: string[];
};

export type CartItem = Product & {
  qty: number;
  baseId?: string;
  baseName?: string;
  variantSize?: string;
  variantColor?: string;
  variantSizeLabel?: string;
  variantSizeNote?: string;
  variantColorLabel?: string;
  variantColorSwatch?: string;
};

export type VariantOptions = {
  sizes: { id: string; label: string; note?: string }[];
  colors: { id: string; label: string; swatch: string }[];
};

const VARIANTS_BY_CATEGORY: Record<Category, VariantOptions> = {
  Towels: {
    sizes: [
      { id: "hand", label: "Hand", note: "50 × 90 cm" },
      { id: "bath", label: "Bath", note: "70 × 140 cm" },
      { id: "sheet", label: "Bath Sheet", note: "90 × 170 cm" },
    ],
    colors: [
      { id: "sand", label: "Sand", swatch: "#D9C6AA" },
      { id: "clay", label: "Clay", swatch: "#B57B5A" },
      { id: "sage", label: "Sage", swatch: "#A9B79A" },
      { id: "ivory", label: "Ivory", swatch: "#F2ECDE" },
    ],
  },
  Wallpaper: {
    sizes: [
      { id: "single", label: "Single Roll", note: "0.9 × 2.4 m" },
      { id: "double", label: "Double Roll", note: "1.8 × 2.4 m" },
      { id: "wall", label: "Wall Pack", note: "3 rolls" },
    ],
    colors: [
      { id: "oat", label: "Oat", swatch: "#E8DBC2" },
      { id: "moss", label: "Moss", swatch: "#7A8567" },
      { id: "ink", label: "Ink", swatch: "#2A2E33" },
    ],
  },
  Cloths: {
    sizes: [
      { id: "pack3", label: "Pack of 3" },
      { id: "pack5", label: "Pack of 5" },
      { id: "pack10", label: "Pack of 10" },
    ],
    colors: [
      { id: "mixed", label: "Mixed", swatch: "linear-gradient(135deg,#D9C6AA,#A9B79A,#B57B5A)" },
      { id: "neutral", label: "Neutral", swatch: "#E8DBC2" },
      { id: "grey", label: "Slate", swatch: "#8A8F94" },
    ],
  },
  Sponges: {
    sizes: [
      { id: "pack2", label: "Pack of 2" },
      { id: "pack4", label: "Pack of 4" },
      { id: "pack8", label: "Pack of 8" },
    ],
    colors: [
      { id: "natural", label: "Natural", swatch: "#D9C6AA" },
      { id: "kitchen", label: "Kitchen", swatch: "#A9B79A" },
      { id: "bath", label: "Bath", swatch: "#B7C7D6" },
    ],
  },
};

export function getVariants(category: Category): VariantOptions {
  return VARIANTS_BY_CATEGORY[category];
}


export const products: Product[] = [
  {
    id: "p1",
    name: "Aegean Bath Towel",
    tag: "Bestseller",
    price: 38,
    rating: 4.9,
    img: productTowel,
    bg: "bg-[#F3ECE3]",
    category: "Towels",
    tagline: "Long-staple Turkish cotton, woven for daily softness.",
    description:
      "Woven in a family-run Aegean mill from long-staple Turkish cotton, the Aegean towel gets plusher with every wash. A generous 70×140 cm sheet that dries fast and folds neatly onto any shelf.",
    details: [
      "600 GSM combed cotton",
      "OEKO-TEX certified, low-impact dyes",
      "Machine wash cool, tumble dry low",
      "Dimensions: 70 × 140 cm",
    ],
    gallery: [productTowel, productBathset, productCloth, heroBg],
  },
  {
    id: "p2",
    name: "Sunday Roll",
    tag: "New",
    price: 24,
    rating: 4.8,
    img: productBathset,
    bg: "bg-[#F5EFE4]",
    category: "Towels",
    tagline: "A three-piece rollup for slow weekend rituals.",
    description:
      "A hand, face and bath towel set rolled into a linen band — pared-back palettes designed to sit on an open shelf. Made from the same combed cotton as our Aegean sheet.",
    details: [
      "Set of 3 (hand, face, bath)",
      "500 GSM combed cotton",
      "Gift-ready linen band",
      "Machine wash cool",
    ],
    gallery: [productBathset, productTowel, productCloth, heroBg],
  },
  {
    id: "p3",
    name: "Botanical Wallpaper",
    tag: "Popular",
    price: 46,
    rating: 4.7,
    img: productWallpaper,
    bg: "bg-[#EFEBE3]",
    category: "Wallpaper",
    tagline: "Hand-drawn stems, peel-and-stick in minutes.",
    description:
      "Illustrated in our studio and printed on removable matte vinyl. Reposition as you go — no paste, no drips, no landlord letters. Each sheet covers 0.9 × 2.4 m.",
    details: [
      "Removable matte vinyl",
      "0.9 × 2.4 m per sheet",
      "PVC-free, low-VOC inks",
      "Repositionable up to 5×",
    ],
    gallery: [productWallpaper, heroBg, productCloth, productTowel],
  },
  {
    id: "p4",
    name: "Linen Peel-Stick",
    tag: "New",
    price: 52,
    rating: 4.8,
    img: productWallpaper,
    bg: "bg-[#EDE7DB]",
    category: "Wallpaper",
    tagline: "The look of raw linen, on any wall.",
    description:
      "A woven-linen texture reproduced in fine detail on removable vinyl. Warms up hallways and nurseries without the commitment of paste-up paper.",
    details: [
      "Removable matte vinyl",
      "0.9 × 2.4 m per sheet",
      "PVC-free, low-VOC inks",
      "Warm oat colourway",
    ],
    gallery: [productWallpaper, heroBg, productBathset, productCloth],
  },
  {
    id: "p5",
    name: "Everyday Cloth Set",
    tag: "Bestseller",
    price: 18,
    rating: 4.9,
    img: productCloth,
    bg: "bg-[#EAEEE6]",
    category: "Cloths",
    tagline: "Five reusable microfibre cloths, colour-coded by room.",
    description:
      "Replace weeks of paper towels with a set of five soft microfibre cloths — one for each zone of the home. Washable up to 300 times.",
    details: [
      "Set of 5, colour-coded",
      "300+ machine washes",
      "Streak-free on glass",
      "Recycled poly-blend fibre",
    ],
    gallery: [productCloth, productSponge, productTowel, heroBg],
  },
  {
    id: "p6",
    name: "Glass & Mirror Cloth",
    tag: "Popular",
    price: 14,
    rating: 4.7,
    img: productCloth,
    bg: "bg-[#E8EFEA]",
    category: "Cloths",
    tagline: "The lint-free finish for glass, screens and chrome.",
    description:
      "A tight-weave microfibre cloth engineered for a streak-free finish. Use dry on screens, damp on mirrors, and pair with our vinegar spray for windows.",
    details: [
      "40 × 40 cm, tight weave",
      "Lint-free on screens & glass",
      "Machine washable",
      "Sold as a pair",
    ],
    gallery: [productCloth, productSponge, heroBg, productTowel],
  },
  {
    id: "p7",
    name: "Cellulose Kitchen Sponge",
    tag: "Eco",
    price: 9,
    rating: 4.6,
    img: productSponge,
    bg: "bg-[#F5EEDF]",
    category: "Sponges",
    tagline: "Plant-based sponges that compost when they're done.",
    description:
      "Cellulose and loofah pressed into a soft-firm sponge that tackles dishes without shredding. Snip in half and drop into home compost at end of life.",
    details: [
      "100% plant-based",
      "Home-compostable",
      "Pack of 4",
      "Boil to sanitise",
    ],
    gallery: [productSponge, productCloth, heroBg, productBathset],
  },
  {
    id: "p8",
    name: "Heavy-Duty Scrub Duo",
    tag: "Limited",
    price: 12,
    rating: 4.8,
    img: productSponge,
    bg: "bg-[#F3E9D8]",
    category: "Sponges",
    tagline: "Two-sided scrubs for pans, tile and grout days.",
    description:
      "A dense cellulose base bonded to a coconut-fibre scour — tough on baked-on grease, gentle enough for enamel. Comes as a duo, one for kitchen, one for bath.",
    details: [
      "Pack of 2",
      "Coconut-fibre scour side",
      "Safe on enamel",
      "Home-compostable base",
    ],
    gallery: [productSponge, productCloth, heroBg, productTowel],
  },
];

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

const STORAGE_KEY = "maison-terra-cart";

// Module-level store so cart state is shared across routes without a provider.
let cartState: CartItem[] = [];
const listeners = new Set<(c: CartItem[]) => void>();

type PersistedRow = {
  id: string;
  qty: number;
  baseId?: string;
  variantSize?: string;
  variantColor?: string;
};

function loadInitial(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PersistedRow[];
    return parsed
      .map((row) => {
        const baseId = row.baseId ?? row.id.split("::")[0];
        const base = getProduct(baseId);
        if (!base) return null;
        if (row.variantSize && row.variantColor) {
          const v = getVariants(base.category);
          const s = v.sizes.find((x) => x.id === row.variantSize);
          const c = v.colors.find((x) => x.id === row.variantColor);
          if (s && c) {
            return {
              ...base,
              id: row.id,
              name: `${base.name} — ${s.label} / ${c.label}`,
              qty: row.qty,
              baseId: base.id,
              baseName: base.name,
              variantSize: s.id,
              variantColor: c.id,
              variantSizeLabel: s.label,
              variantSizeNote: s.note,
              variantColorLabel: c.label,
              variantColorSwatch: c.swatch,
            } satisfies CartItem;
          }
        }
        return { ...base, qty: row.qty } satisfies CartItem;
      })
      .filter((x): x is CartItem => !!x);
  } catch {
    return [];
  }
}

let hydrated = false;
function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  cartState = loadInitial();
}

function emit() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        cartState.map(({ id, qty, baseId, variantSize, variantColor }) => ({
          id,
          qty,
          baseId,
          variantSize,
          variantColor,
        })),
      ),
    );
  }
  for (const l of listeners) l(cartState);
}

export function useCart() {
  ensureHydrated();
  const [cart, setCart] = useState<CartItem[]>(cartState);

  useEffect(() => {
    ensureHydrated();
    setCart(cartState);
    const l = (c: CartItem[]) => setCart(c);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const addToCart = useCallback(
    (p: Product, qty = 1, extras: Partial<CartItem> = {}) => {
      const found = cartState.find((i) => i.id === p.id);
      if (found) {
        cartState = cartState.map((i) => (i.id === p.id ? { ...i, qty: i.qty + qty } : i));
      } else {
        cartState = [...cartState, { ...p, ...extras, qty }];
      }
      emit();
    },
    [],
  );

  const changeQty = useCallback((id: string, delta: number) => {
    cartState = cartState.flatMap((i) =>
      i.id === id ? (i.qty + delta <= 0 ? [] : [{ ...i, qty: i.qty + delta }]) : [i],
    );
    emit();
  }, []);

  const removeItem = useCallback((id: string) => {
    cartState = cartState.filter((i) => i.id !== id);
    emit();
  }, []);

  const restoreItem = useCallback((item: CartItem) => {
    const exists = cartState.find((i) => i.id === item.id);
    if (exists) {
      cartState = cartState.map((i) => (i.id === item.id ? { ...i, qty: i.qty + item.qty } : i));
    } else {
      cartState = [...cartState, item];
    }
    emit();
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal = cart.reduce((s, i) => s + i.qty * i.price, 0);

  return { cart, addToCart, changeQty, removeItem, restoreItem, cartCount, subtotal };
}

// ---------- FAVOURITES ----------
const FAV_KEY = "mt-favs-v1";
let favState: string[] = [];
let favHydrated = false;
const favListeners = new Set<(f: string[]) => void>();

function ensureFavHydrated() {
  if (favHydrated || typeof window === "undefined") return;
  favHydrated = true;
  try {
    const raw = window.localStorage.getItem(FAV_KEY);
    if (raw) favState = JSON.parse(raw) as string[];
  } catch {
    favState = [];
  }
}

function emitFavs() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(FAV_KEY, JSON.stringify(favState));
  }
  for (const l of favListeners) l(favState);
}

export function useFavourites() {
  ensureFavHydrated();
  const [favs, setFavs] = useState<string[]>(favState);

  useEffect(() => {
    ensureFavHydrated();
    setFavs(favState);
    const l = (f: string[]) => setFavs([...f]);
    favListeners.add(l);
    return () => {
      favListeners.delete(l);
    };
  }, []);

  const toggleFav = useCallback((id: string) => {
    favState = favState.includes(id) ? favState.filter((x) => x !== id) : [...favState, id];
    emitFavs();
  }, []);

  const isFav = useCallback((id: string) => favs.includes(id), [favs]);

  return { favs, toggleFav, isFav, favCount: favs.length };
}

