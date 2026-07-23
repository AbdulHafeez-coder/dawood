import { useCallback, useEffect, useState } from "react";
import productTowel from "@/assets/product-towel.jpg";
import productWallpaper from "@/assets/product-wallpaper.jpg";
import productCloth from "@/assets/product-cloth.jpg";
import productSponge from "@/assets/product-sponge.jpg";
import productBathset from "@/assets/product-bathset.jpg";
import heroBg from "@/assets/hero-home.jpg";
import { supabase } from "@/lib/supabase";

// Category is a free-form string so admins can add/rename categories.
export type Category = string;

export const SEED_CATEGORIES: readonly string[] = [];


// Kept for backwards-compat imports in existing components; treat as seed.
export const CATEGORY_LIST = SEED_CATEGORIES;

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

const DEFAULT_VARIANTS: VariantOptions = {
  sizes: [
    { id: "s", label: "Small" },
    { id: "m", label: "Medium" },
    { id: "l", label: "Large" },
  ],
  colors: [
    { id: "natural", label: "Natural", swatch: "#D9C6AA" },
    { id: "sage", label: "Sage", swatch: "#A9B79A" },
    { id: "ink", label: "Ink", swatch: "#2A2E33" },
  ],
};

const VARIANTS_BY_CATEGORY: Record<string, VariantOptions> = {
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
  Candles: {
    sizes: [
      { id: "votive", label: "Votive", note: "80 g · ~15 hr" },
      { id: "classic", label: "Classic", note: "220 g · ~45 hr" },
      { id: "grand", label: "Grand", note: "480 g · ~90 hr" },
    ],
    colors: [
      { id: "fig", label: "Fig & Cedar", swatch: "#6B4A2B" },
      { id: "linen", label: "Linen Blossom", swatch: "#E8DBC2" },
      { id: "smoke", label: "Smoke & Amber", swatch: "#4A4038" },
    ],
  },
  Linens: {
    sizes: [
      { id: "throw", label: "Throw", note: "130 × 170 cm" },
      { id: "queen", label: "Queen", note: "220 × 240 cm" },
      { id: "king", label: "King", note: "260 × 260 cm" },
    ],
    colors: [
      { id: "ivory", label: "Ivory", swatch: "#F2ECDE" },
      { id: "oat", label: "Oat", swatch: "#E8DBC2" },
      { id: "stone", label: "Stone", swatch: "#B8B0A4" },
      { id: "ink", label: "Ink", swatch: "#2A2E33" },
    ],
  },
  Bath: {
    sizes: [
      { id: "trial", label: "Trial", note: "100 ml" },
      { id: "full", label: "Full", note: "300 ml" },
      { id: "duo", label: "Duo", note: "2 × 300 ml" },
    ],
    colors: [
      { id: "eucalyptus", label: "Eucalyptus", swatch: "#A9B79A" },
      { id: "rose", label: "Rose Clay", swatch: "#D4A79A" },
      { id: "cedar", label: "Cedar", swatch: "#7A5A3D" },
    ],
  },
};

export function getVariants(category: Category): VariantOptions {
  return VARIANTS_BY_CATEGORY[category] ?? DEFAULT_VARIANTS;
}

// ---------- SEED PRODUCTS ----------
// Store starts empty — real products are added through the admin dashboard.
const SEED_PRODUCTS: Product[] = [];


export const PRODUCT_IMAGE_CHOICES = [
  { id: "towel", label: "Towel", url: productTowel },
  { id: "wallpaper", label: "Wallpaper", url: productWallpaper },
  { id: "cloth", label: "Cloth", url: productCloth },
  { id: "sponge", label: "Sponge", url: productSponge },
  { id: "bathset", label: "Bath set", url: productBathset },
  { id: "hero", label: "Hero", url: heroBg },
];

export const PRODUCT_BG_CHOICES = [
  "bg-[#F3ECE3]",
  "bg-[#F5EFE4]",
  "bg-[#EFEBE3]",
  "bg-[#EDE7DB]",
  "bg-[#EAEEE6]",
  "bg-[#E8EFEA]",
  "bg-[#F5EEDF]",
  "bg-[#F3E9D8]",
];

// ---------- LIVE STORE (products + categories) ----------
// Backed by Supabase (public.products, public.categories). Cart + favourites
// stay in localStorage — they're per-visitor session data.

type ProductRow = {
  id: string;
  name: string;
  tag: string;
  price: number | string;
  rating: number | string;
  img: string;
  bg: string;
  category: string;
  tagline: string;
  description: string;
  details: string[] | null;
  gallery: string[] | null;
};

function rowToProduct(r: ProductRow): Product {
  return {
    id: r.id,
    name: r.name,
    tag: r.tag ?? "",
    price: typeof r.price === "string" ? Number(r.price) : r.price,
    rating: typeof r.rating === "string" ? Number(r.rating) : r.rating,
    img: r.img ?? "",
    bg: r.bg ?? "",
    category: r.category,
    tagline: r.tagline ?? "",
    description: r.description ?? "",
    details: r.details ?? [],
    gallery: r.gallery && r.gallery.length ? r.gallery : [r.img],
  };
}

function productToRow(p: Product): ProductRow {
  return {
    id: p.id,
    name: p.name,
    tag: p.tag ?? "",
    price: p.price,
    rating: p.rating,
    img: p.img,
    bg: p.bg,
    category: p.category,
    tagline: p.tagline ?? "",
    description: p.description ?? "",
    details: p.details ?? [],
    gallery: p.gallery && p.gallery.length ? p.gallery : [p.img],
  };
}

// Exported live arrays. Seeded synchronously so SSR + first paint have data.
export const products: Product[] = [...SEED_PRODUCTS];
export const categoriesLive: string[] = [...SEED_CATEGORIES];

const productListeners = new Set<(p: Product[]) => void>();
const categoryListeners = new Set<(c: string[]) => void>();

function emitProducts() {
  for (const l of productListeners) l([...products]);
}
function emitCategories() {
  for (const l of categoryListeners) l([...categoriesLive]);
}

let hydratePromise: Promise<void> | null = null;

async function seedIfEmpty() {
  const catRows = SEED_CATEGORIES.map((name) => ({ name }));
  await supabase.from("categories").upsert(catRows, { onConflict: "name" });
  const prodRows = SEED_PRODUCTS.map(productToRow);
  await supabase.from("products").upsert(prodRows, { onConflict: "id" });
}

async function hydrateFromSupabase() {
  const [{ data: catData, error: catErr }, { data: prodData, error: prodErr }] = await Promise.all([
    supabase.from("categories").select("name").order("created_at", { ascending: true }),
    supabase.from("products").select("*").order("created_at", { ascending: false }),
  ]);
  if (catErr) console.error("[shop] categories load failed:", catErr.message);
  if (prodErr) console.error("[shop] products load failed:", prodErr.message);

  const isEmpty = (!catData || catData.length === 0) && (!prodData || prodData.length === 0);
  if (isEmpty && !catErr && !prodErr) {
    await seedIfEmpty();
    const [cats, prods] = await Promise.all([
      supabase.from("categories").select("name").order("created_at", { ascending: true }),
      supabase.from("products").select("*").order("created_at", { ascending: false }),
    ]);
    if (cats.data)
      categoriesLive.splice(0, categoriesLive.length, ...cats.data.map((r) => r.name));
    if (prods.data)
      products.splice(0, products.length, ...(prods.data as ProductRow[]).map(rowToProduct));
  } else {
    if (catData) categoriesLive.splice(0, categoriesLive.length, ...catData.map((r) => r.name));
    if (prodData)
      products.splice(0, products.length, ...(prodData as ProductRow[]).map(rowToProduct));
  }
  emitCategories();
  emitProducts();
}

function ensureStoreHydrated() {
  if (typeof window === "undefined") return;
  if (hydratePromise) return;
  hydratePromise = hydrateFromSupabase().catch((e) => {
    console.error("[shop] hydrate failed:", e);
  });
}

export function getProduct(id: string): Product | undefined {
  ensureStoreHydrated();
  return products.find((p) => p.id === id);
}

// ---------- REACTIVE HOOKS ----------
export function useProducts() {
  ensureStoreHydrated();
  const [list, setList] = useState<Product[]>([...products]);

  useEffect(() => {
    ensureStoreHydrated();
    setList([...products]);
    const l = (p: Product[]) => setList(p);
    productListeners.add(l);
    return () => {
      productListeners.delete(l);
    };
  }, []);

  const addProduct = useCallback((p: Omit<Product, "id"> & { id?: string }) => {
    const id = p.id ?? `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const gallery = p.gallery && p.gallery.length ? p.gallery : [p.img];
    const next: Product = { ...p, id, gallery };
    products.unshift(next);
    emitProducts();
    supabase
      .from("products")
      .insert(productToRow(next))
      .then(({ error }) => {
        if (error) {
          console.error("[shop] addProduct failed:", error.message);
          const idx = products.findIndex((x) => x.id === id);
          if (idx >= 0) products.splice(idx, 1);
          emitProducts();
        }
      });
    return id;
  }, []);

  const updateProduct = useCallback((id: string, patch: Partial<Product>) => {
    const idx = products.findIndex((p) => p.id === id);
    if (idx < 0) return;
    const prev = products[idx];
    const next = { ...prev, ...patch };
    if (!next.gallery || next.gallery.length === 0) next.gallery = [next.img];
    products[idx] = next;
    emitProducts();
    supabase
      .from("products")
      .update(productToRow(next))
      .eq("id", id)
      .then(({ error }) => {
        if (error) {
          console.error("[shop] updateProduct failed:", error.message);
          products[idx] = prev;
          emitProducts();
        }
      });
  }, []);

  const deleteProduct = useCallback((id: string) => {
    const idx = products.findIndex((p) => p.id === id);
    if (idx < 0) return;
    const removed = products[idx];
    products.splice(idx, 1);
    emitProducts();
    supabase
      .from("products")
      .delete()
      .eq("id", id)
      .then(({ error }) => {
        if (error) {
          console.error("[shop] deleteProduct failed:", error.message);
          products.splice(idx, 0, removed);
          emitProducts();
        }
      });
  }, []);

  const resetProducts = useCallback(async () => {
    const snapshot = [...products];
    products.splice(0, products.length, ...SEED_PRODUCTS);
    emitProducts();
    const { error: delErr } = await supabase.from("products").delete().neq("id", "");
    if (delErr) {
      console.error("[shop] resetProducts delete failed:", delErr.message);
      products.splice(0, products.length, ...snapshot);
      emitProducts();
      return;
    }
    const { error: insErr } = await supabase
      .from("products")
      .insert(SEED_PRODUCTS.map(productToRow));
    if (insErr) console.error("[shop] resetProducts insert failed:", insErr.message);
  }, []);

  return { products: list, addProduct, updateProduct, deleteProduct, resetProducts };
}

export function useCategories() {
  ensureStoreHydrated();
  const [list, setList] = useState<string[]>([...categoriesLive]);

  useEffect(() => {
    ensureStoreHydrated();
    setList([...categoriesLive]);
    const l = (c: string[]) => setList(c);
    categoryListeners.add(l);
    return () => {
      categoryListeners.delete(l);
    };
  }, []);

  const addCategory = useCallback((name: string) => {
    const clean = name.trim();
    if (!clean) return false;
    if (categoriesLive.some((c) => c.toLowerCase() === clean.toLowerCase())) return false;
    categoriesLive.push(clean);
    emitCategories();
    supabase
      .from("categories")
      .insert({ name: clean })
      .then(({ error }) => {
        if (error) {
          console.error("[shop] addCategory failed:", error.message);
          const idx = categoriesLive.indexOf(clean);
          if (idx >= 0) categoriesLive.splice(idx, 1);
          emitCategories();
        }
      });
    return true;
  }, []);

  const renameCategory = useCallback((oldName: string, newName: string) => {
    const clean = newName.trim();
    if (!clean) return false;
    const idx = categoriesLive.indexOf(oldName);
    if (idx < 0) return false;
    if (categoriesLive.some((c, i) => i !== idx && c.toLowerCase() === clean.toLowerCase())) return false;
    categoriesLive[idx] = clean;
    for (const p of products) if (p.category === oldName) p.category = clean;
    emitCategories();
    emitProducts();
    // ON UPDATE CASCADE on products.category takes care of the FK side.
    supabase
      .from("categories")
      .update({ name: clean })
      .eq("name", oldName)
      .then(({ error }) => {
        if (error) console.error("[shop] renameCategory failed:", error.message);
      });
    return true;
  }, []);

  const deleteCategory = useCallback((name: string) => {
    const idx = categoriesLive.indexOf(name);
    if (idx < 0) return { ok: false as const, orphaned: 0 };
    const orphaned = products.filter((p) => p.category === name).length;
    categoriesLive.splice(idx, 1);
    for (let i = products.length - 1; i >= 0; i--) {
      if (products[i].category === name) products.splice(i, 1);
    }
    emitCategories();
    emitProducts();
    // ON DELETE CASCADE on products.category clears the child rows.
    supabase
      .from("categories")
      .delete()
      .eq("name", name)
      .then(({ error }) => {
        if (error) console.error("[shop] deleteCategory failed:", error.message);
      });
    return { ok: true as const, orphaned };
  }, []);

  const resetCategories = useCallback(async () => {
    categoriesLive.splice(0, categoriesLive.length, ...SEED_CATEGORIES);
    emitCategories();
    await supabase
      .from("categories")
      .upsert(SEED_CATEGORIES.map((name) => ({ name })), { onConflict: "name" });
  }, []);

  return { categories: list, addCategory, renameCategory, deleteCategory, resetCategories };
}

// ---------- CART (unchanged behaviour) ----------
const STORAGE_KEY = "maison-terra-cart";
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

let cartHydrated = false;
function ensureHydrated() {
  if (cartHydrated || typeof window === "undefined") return;
  cartHydrated = true;
  ensureStoreHydrated();
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

  const addToCart = useCallback((p: Product, qty = 1, extras: Partial<CartItem> = {}) => {
    const found = cartState.find((i) => i.id === p.id);
    if (found) {
      cartState = cartState.map((i) => (i.id === p.id ? { ...i, qty: i.qty + qty } : i));
    } else {
      cartState = [...cartState, { ...p, ...extras, qty }];
    }
    emit();
  }, []);

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

// Cross-tab sync for cart + favourites (products/categories now live in Supabase).
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (!e.key) return;
    try {
      if (e.key === STORAGE_KEY) {
        cartState = loadInitial();
        for (const l of listeners) l(cartState);
      } else if (e.key === FAV_KEY) {
        favState = e.newValue ? (JSON.parse(e.newValue) as string[]) : [];
        for (const l of favListeners) l([...favState]);
      }
    } catch {
      /* ignore malformed cross-tab payload */
    }
  });
}

