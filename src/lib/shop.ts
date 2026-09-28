import { reconcileCartCatalog } from "./cart-catalog";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/integrations/supabase/types";
import type { Product, Category, CartItem } from "./types";
import { SEED_CATEGORIES, SEED_BRANDS, AVAILABLE_COUPONS, getVariants } from "./constants";
import { classifyCategory } from "./categories";
import {
  mapCatalogProduct,
  normalizeStatus,
  STOREFRONT_CATEGORIES as SHOP_CATEGORIES,
} from "./catalog-model";
import { fetchProduct } from "./catalog-api";
import { saveCatalogProduct } from "./catalog-writes";
export * from "./types";
export * from "./constants";

// ---------- LIVE STORE (products + categories) ----------
// Backed by Supabase (public.products, public.categories). Cart + favourites
// stay in localStorage — they're per-visitor session data.

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];

function rowToProduct(r: ProductRow): Product {
  return mapCatalogProduct(r);
}

function productToRow(p: Product): ProductInsert {
  return {
    id: p.id,
    name: p.name,
    tag: p.tag ?? "",
    price: p.price,
    status: normalizeStatus(p.status),
    storefront_category: classifyCategory(p),
    subcategory: p.subCategory ?? "",
    slug: p.slug,
    seo_title: p.seo_title,
    seo_description: p.seo_description,
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
export const products: Product[] = [];
export const categoriesLive: string[] = [...SHOP_CATEGORIES];

// Per-category metadata (image, sort order). Keyed by category name.
export type CategoryInfo = { name: string; imageUrl: string; sortOrder: number };
export const categoryInfoLive: Record<string, CategoryInfo> = {};

const productListeners = new Set<(p: Product[]) => void>();
const categoryListeners = new Set<(c: string[]) => void>();
const categoryInfoListeners = new Set<(m: Record<string, CategoryInfo>) => void>();

function emitProducts() {
  for (const l of productListeners) l([...products]);
}
function emitCategories() {
  for (const l of categoryListeners) l([...categoriesLive]);
  const snap = { ...categoryInfoLive };
  for (const l of categoryInfoListeners) l(snap);
}

// ---------- PROMOTIONS ----------
export type Promotion = {
  id: string;
  label: string;
  headline: string;
  imageUrl: string;
  bgColor: string;
  chipStyle: "light" | "dark";
  linkCategory: string;
  sortOrder: number;
  isActive: boolean;
};
type PromotionRow = Database["public"]["Tables"]["promotions"]["Row"];
type PromotionInsert = Database["public"]["Tables"]["promotions"]["Insert"];
type PromotionUpdate = Database["public"]["Tables"]["promotions"]["Update"];
function rowToPromo(r: PromotionRow): Promotion {
  return {
    id: r.id,
    label: r.label,
    headline: r.headline,
    imageUrl: r.image_url ?? "",
    bgColor: r.bg_color || "#ECEDEC",
    chipStyle: r.chip_style === "dark" ? "dark" : "light",
    linkCategory: r.link_category ? classifyCategory({ name: "", category: r.link_category }) : "",
    sortOrder: r.sort_order ?? 0,
    isActive: r.is_active ?? true,
  };
}
export const promotionsLive: Promotion[] = [];
const promotionListeners = new Set<(p: Promotion[]) => void>();
function emitPromotions() {
  for (const l of promotionListeners) l([...promotionsLive]);
}

let hydratePromise: Promise<void> | null = null;
let storeHydrated = false;

async function hydrateFromSupabase() {
  const [{ data: catData, error: catErr }, { data: promoData, error: promoErr }] =
    await Promise.all([
      supabase
        .from("categories")
        .select("name, image_url, sort_order")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
      supabase.from("promotions").select("*").order("sort_order", { ascending: true }),
    ]);
  if (catErr) console.error("[shop] categories load failed:", catErr.message);
  if (promoErr) console.error("[shop] promotions load failed:", promoErr.message);

  const rows = (catData ?? []) as {
    name: string;
    image_url: string | null;
    sort_order: number | null;
  }[];
  categoriesLive.splice(0, categoriesLive.length, ...SHOP_CATEGORIES);
  for (const k of Object.keys(categoryInfoLive)) delete categoryInfoLive[k];
  SHOP_CATEGORIES.forEach((name, i) => {
    const row = rows.find((r) => r.name === name);
    categoryInfoLive[name] = {
      name,
      imageUrl: row?.image_url ?? "",
      sortOrder: i,
    };
  });
  promotionsLive.splice(
    0,
    promotionsLive.length,
    ...((promoData ?? []) as PromotionRow[]).map(rowToPromo),
  );
  if (catErr || promoErr) throw new Error("Unable to load store settings");
  storeHydrated = true;
  emitCategories();
  emitPromotions();
  refreshCartFromCatalog();
}

function ensureStoreHydrated() {
  if (storeHydrated || hydratePromise) return;
  hydratePromise = hydrateFromSupabase()
    .catch((e) => {
      console.error("[shop] hydrate failed:", e);
    })
    .finally(() => {
      hydratePromise = null;
    });
}

export async function ensureStoreHydratedAsync() {
  if (storeHydrated) return;
  ensureStoreHydrated();
  if (hydratePromise) await hydratePromise;
}

export function getProduct(id: string): Product | undefined {
  ensureStoreHydrated();
  return products.find((p) => p.id === id);
}

export async function getProductAsync(id: string): Promise<Product | undefined> {
  return fetchProduct(supabase, id);
}

// ---------- REACTIVE HOOKS ----------
export function useProducts() {
  const [list, setList] = useState<Product[]>([]);
  useEffect(() => {
    let cancelled = false;
    async function loadAdminCatalog() {
      const rows: ProductRow[] = [];
      for (let offset = 0; ; offset += 100) {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("id")
          .range(offset, offset + 99);
        if (error) throw error;
        rows.push(...(data ?? []));
        if (!data || data.length < 100) break;
      }
      if (!cancelled) {
        products.splice(0, products.length, ...rows.map(rowToProduct));
        emitProducts();
      }
    }
    const listener = (items: Product[]) => setList(items);
    productListeners.add(listener);
    void loadAdminCatalog().catch(() => toast.error("Unable to load catalog. Reload to retry."));
    return () => {
      cancelled = true;
      productListeners.delete(listener);
    };
  }, []);
  const addProduct = useCallback(
    async (p: Omit<Product, "id"> & { id?: string }): Promise<string> => {
      const id = p.id ?? crypto.randomUUID();
      const next: Product = { ...p, id };
      const { error } = await saveCatalogProduct(supabase, productToRow(next));
      if (error) throw new Error(error.message);
      products.unshift(next);
      emitProducts();
      return id;
    },
    [],
  );
  const updateProduct = useCallback(async (id: string, patch: Partial<Product>): Promise<void> => {
    const index = products.findIndex((p) => p.id === id);
    if (index < 0) throw new Error("Product not found. Reload the catalog.");
    const next = { ...products[index], ...patch };
    const { error } = await saveCatalogProduct(supabase, productToRow(next), true);
    if (error) throw new Error(error.message);
    products[index] = next;
    emitProducts();
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
    throw new Error("Catalog reset is disabled to protect real products.");
  }, []);

  return { products: list, addProduct, updateProduct, deleteProduct, resetProducts };
}

export function useCategories() {
  ensureStoreHydrated();
  const [list, setList] = useState<string[]>([...categoriesLive]);
  const [info, setInfo] = useState<Record<string, CategoryInfo>>({ ...categoryInfoLive });

  useEffect(() => {
    ensureStoreHydrated();
    setList([...categoriesLive]);
    setInfo({ ...categoryInfoLive });
    const l = (c: string[]) => setList(c);
    const il = (m: Record<string, CategoryInfo>) => setInfo(m);
    categoryListeners.add(l);
    categoryInfoListeners.add(il);
    return () => {
      categoryListeners.delete(l);
      categoryInfoListeners.delete(il);
    };
  }, []);

  const addCategory = useCallback((name: string, imageUrl = "") => {
    const clean = name.trim();
    if (!SHOP_CATEGORIES.some((category) => category === clean)) {
      toast.error("Use Sheets, Crockery, Towels or Home Essentials.");
      return false;
    }
    if (!clean) return false;
    if (categoriesLive.some((c) => c.toLowerCase() === clean.toLowerCase())) return false;
    categoriesLive.push(clean);
    categoryInfoLive[clean] = { name: clean, imageUrl, sortOrder: categoriesLive.length };
    emitCategories();
    supabase
      .from("categories")
      .insert({ name: clean, image_url: imageUrl, sort_order: categoriesLive.length })
      .then(({ error }) => {
        if (error) {
          console.error("[shop] addCategory failed:", error.message);
          const idx = categoriesLive.indexOf(clean);
          if (idx >= 0) categoriesLive.splice(idx, 1);
          delete categoryInfoLive[clean];
          emitCategories();
        }
      });
    return true;
  }, []);

  const renameCategory = useCallback((oldName: string, newName: string) => {
    if (oldName !== newName.trim()) {
      toast.error("The three shop categories cannot be renamed.");
      return false;
    }
    const clean = newName.trim();
    if (!clean) return false;
    const idx = categoriesLive.indexOf(oldName);
    if (idx < 0) return false;
    if (categoriesLive.some((c, i) => i !== idx && c.toLowerCase() === clean.toLowerCase()))
      return false;
    categoriesLive[idx] = clean;
    const prevInfo = categoryInfoLive[oldName];
    if (prevInfo) {
      categoryInfoLive[clean] = { ...prevInfo, name: clean };
      delete categoryInfoLive[oldName];
    }
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

  const updateCategoryImage = useCallback((name: string, imageUrl: string) => {
    const prev = categoryInfoLive[name];
    if (!prev) {
      // Row may exist without an info entry yet — create one.
      categoryInfoLive[name] = { name, imageUrl, sortOrder: categoriesLive.indexOf(name) };
    } else {
      categoryInfoLive[name] = { ...prev, imageUrl };
    }
    emitCategories();
    supabase
      .from("categories")
      .upsert(
        { name, image_url: imageUrl, sort_order: categoriesLive.indexOf(name) },
        { onConflict: "name" },
      )
      .then(({ error }) => {
        if (error) {
          console.error("[shop] updateCategoryImage failed:", error.message);
          if (prev) categoryInfoLive[name] = prev;
          else delete categoryInfoLive[name];
          emitCategories();
        }
      });
    return true;
  }, []);

  const deleteCategory = useCallback((name: string) => {
    if (SHOP_CATEGORIES.some((category) => category === name)) {
      toast.error("Keep all three shop categories. Move or edit products instead.");
      return { ok: false as const, orphaned: 0 };
    }
    const idx = categoriesLive.indexOf(name);
    if (idx < 0) return { ok: false as const, orphaned: 0 };
    const orphaned = products.filter((p) => p.category === name).length;
    categoriesLive.splice(idx, 1);
    delete categoryInfoLive[name];
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
    for (const k of Object.keys(categoryInfoLive)) delete categoryInfoLive[k];
    emitCategories();
    await supabase.from("categories").upsert(
      SEED_CATEGORIES.map((name) => ({ name })),
      { onConflict: "name" },
    );
  }, []);

  return {
    categories: list,
    categoryInfo: info,
    addCategory,
    renameCategory,
    updateCategoryImage,
    deleteCategory,
    resetCategories,
  };
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
  snapshot?: Product;
};

function parsePersistedCart(): PersistedRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PersistedRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function resolvePersistedCart(rows: PersistedRow[]): CartItem[] {
  return rows
    .map((row) => {
      const baseId = row.baseId ?? row.id.split("::")[0];
      const base = products.find((p) => p.id === baseId) ?? row.snapshot;
      if (!base) return null;
      const qty = Number.isFinite(row.qty) && row.qty > 0 ? Math.floor(row.qty) : 1;
      if (row.variantSize && row.variantColor) {
        const v = getVariants(base.category);
        const s = v.sizes.find((x) => x.id === row.variantSize);
        const c = v.colors.find((x) => x.id === row.variantColor);
        if (s && c) {
          return {
            ...base,
            id: row.id,
            name: `${base.name} — ${s.label} / ${c.label}`,
            qty,
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
      return { ...base, qty } satisfies CartItem;
    })
    .filter((x): x is CartItem => !!x);
}

function refreshCartFromCatalog() {
  if (!cartHydrated || typeof window === "undefined") return;
  const next = resolvePersistedCart(parsePersistedCart());
  cartState = next;
  for (const l of listeners) l(cartState);
}

let cartHydrated = false;
function ensureHydrated() {
  if (cartHydrated || typeof window === "undefined") return;
  cartHydrated = true;
  cartState = resolvePersistedCart(parsePersistedCart());
}

function emit() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        cartState.map(
          ({
            id,
            qty,
            baseId,
            variantSize,
            variantColor,
            baseName,
            variantSizeLabel,
            variantSizeNote,
            variantColorLabel,
            variantColorSwatch,
            ...snapshot
          }) => ({
            id,
            qty,
            baseId,
            variantSize,
            variantColor,
            snapshot,
          }),
        ),
      ),
    );
  }
  for (const l of listeners) l(cartState);
}

let cartRefresh: Promise<void> | null = null;
function refreshCartRows() {
  if (cartRefresh || !cartState.length) return;
  const ids = [...new Set(cartState.map((item) => item.baseId || item.id))];
  cartRefresh = (async () => {
    const fresh = new Map<string, Product>();
    for (let offset = 0; offset < ids.length; offset += 24) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .in("id", ids.slice(offset, offset + 24));
      if (error) throw error;
      (data || []).map(rowToProduct).forEach((p) => fresh.set(p.id, p));
    }
    cartState = reconcileCartCatalog(cartState, ids, fresh);
    emit();
  })()
    .catch(() => {
      toast.error("Unable to refresh cart prices. They will be checked again at checkout.");
    })
    .finally(() => {
      cartRefresh = null;
    });
}
export function useCart() {
  ensureHydrated();
  const [cart, setCart] = useState<CartItem[]>(cartState);

  useEffect(() => {
    ensureHydrated();
    setCart(cartState);
    refreshCartRows();
    const l = (c: CartItem[]) => setCart(c);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const addToCart = useCallback((p: Product, qty = 1, extras: Partial<CartItem> = {}) => {
    if (normalizeStatus(p.status) !== "available") {
      toast.error("This product is not currently available. Request it on WhatsApp.");
      return;
    }
    const found = cartState.find((i) => i.id === p.id);
    if (found) {
      cartState = cartState.map((i) =>
        i.id === p.id ? { ...i, ...p, ...extras, qty: i.qty + qty } : i,
      );
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

// ---------- BRANDS HOOK ----------
export function useBrands() {
  const { products } = useProducts();
  const [brands, setBrands] = useState<string[]>(() => {
    const set = new Set<string>(SEED_BRANDS);
    for (const p of products) {
      if (p.brand) set.add(p.brand);
    }
    return Array.from(set);
  });

  useEffect(() => {
    const set = new Set<string>(SEED_BRANDS);
    for (const p of products) {
      if (p.brand) set.add(p.brand);
    }
    setBrands(Array.from(set));
  }, [products]);

  return { brands };
}

// ---------- COUPONS HOOK ----------
const COUPON_STORAGE_KEY = "dm-active-coupon";
let activeCouponState: string | null = null;
const couponListeners = new Set<(c: string | null) => void>();

function parsePersistedCoupon(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(COUPON_STORAGE_KEY);
}

let couponHydrated = false;
function ensureCouponHydrated() {
  if (couponHydrated || typeof window === "undefined") return;
  couponHydrated = true;
  activeCouponState = parsePersistedCoupon();
}

function emitCoupon() {
  if (typeof window !== "undefined") {
    if (activeCouponState) {
      window.localStorage.setItem(COUPON_STORAGE_KEY, activeCouponState);
    } else {
      window.localStorage.removeItem(COUPON_STORAGE_KEY);
    }
  }
  for (const l of couponListeners) l(activeCouponState);
}

export function useCoupon() {
  ensureCouponHydrated();
  const [couponCode, setCouponCode] = useState<string | null>(activeCouponState);

  useEffect(() => {
    ensureCouponHydrated();
    setCouponCode(activeCouponState);
    const l = (c: string | null) => setCouponCode(c);
    couponListeners.add(l);
    return () => {
      couponListeners.delete(l);
    };
  }, []);

  const applyCoupon = useCallback(
    (code: string, subtotal: number): { ok: boolean; message: string } => {
      const clean = code.trim().toUpperCase();
      const found = AVAILABLE_COUPONS[clean];
      if (!found) {
        return { ok: false, message: "Invalid coupon code. Try WELCOME10 or FLAT500." };
      }
      if (found.minSpend && subtotal < found.minSpend) {
        return {
          ok: false,
          message: `Minimum order of PKR ${found.minSpend.toLocaleString()} required for this coupon.`,
        };
      }
      activeCouponState = clean;
      emitCoupon();
      return { ok: true, message: `Coupon ${clean} applied! (${found.description})` };
    },
    [],
  );

  const removeCoupon = useCallback(() => {
    activeCouponState = null;
    emitCoupon();
  }, []);

  const activeCouponData = couponCode ? AVAILABLE_COUPONS[couponCode] : null;

  const calculateDiscount = useCallback(
    (subtotal: number): number => {
      if (!couponCode || !activeCouponData) return 0;
      if (activeCouponData.minSpend && subtotal < activeCouponData.minSpend) return 0;
      if (activeCouponData.discountType === "percent") {
        return Math.round((subtotal * activeCouponData.discountValue) / 100);
      }
      return Math.min(subtotal, activeCouponData.discountValue);
    },
    [couponCode, activeCouponData],
  );

  return {
    couponCode,
    activeCoupon: activeCouponData ? { code: couponCode!, ...activeCouponData } : null,
    applyCoupon,
    removeCoupon,
    calculateDiscount,
  };
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

  const toggleFav = useCallback((product: Product) => {
    const id = product.id;
    const isNowFav = !favState.includes(id);
    favState = isNowFav ? [...favState, id] : favState.filter((x) => x !== id);
    emitFavs();
    if (isNowFav) {
      toast.success(`${product.name} added to favourites`, { description: product.category });
    } else {
      toast(`${product.name} removed from favourites`);
    }
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
        cartState = resolvePersistedCart(parsePersistedCart());
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

// ---------- PROMOTIONS HOOK ----------
export function usePromotions() {
  ensureStoreHydrated();
  const [list, setList] = useState<Promotion[]>([...promotionsLive]);
  useEffect(() => {
    ensureStoreHydrated();
    setList([...promotionsLive]);
    const l = (p: Promotion[]) => setList(p);
    promotionListeners.add(l);
    return () => {
      promotionListeners.delete(l);
    };
  }, []);

  const addPromotion = useCallback(
    async (data: Omit<Promotion, "id">): Promise<{ ok: boolean; id?: string; error?: string }> => {
      const tmpId = `tmp-${Date.now().toString(36)}`;
      const optimistic: Promotion = { ...data, id: tmpId };
      promotionsLive.push(optimistic);
      promotionsLive.sort((a, b) => a.sortOrder - b.sortOrder);
      emitPromotions();
      try {
        const { data: row, error } = await supabase
          .from("promotions")
          .insert({
            label: data.label,
            headline: data.headline,
            image_url: data.imageUrl || null,
            bg_color: data.bgColor,
            chip_style: data.chipStyle,
            link_category: data.linkCategory || null,
            sort_order: data.sortOrder,
            is_active: data.isActive,
          } satisfies PromotionInsert)
          .select()
          .maybeSingle();
        const idx = promotionsLive.findIndex((p) => p.id === tmpId);
        if (error || !row) {
          const message = error?.message ?? "The promotion was not returned after saving.";
          console.error("[shop] addPromotion failed:", message);
          if (idx >= 0) promotionsLive.splice(idx, 1);
          emitPromotions();
          return { ok: false, error: message };
        }
        const saved = rowToPromo(row as PromotionRow);
        if (idx >= 0) promotionsLive[idx] = saved;
        promotionsLive.sort((a, b) => a.sortOrder - b.sortOrder);
        emitPromotions();
        return { ok: true, id: saved.id };
      } catch (error) {
        const idx = promotionsLive.findIndex((p) => p.id === tmpId);
        if (idx >= 0) promotionsLive.splice(idx, 1);
        emitPromotions();
        const message = error instanceof Error ? error.message : "Failed to save promotion.";
        console.error("[shop] addPromotion failed:", error);
        return { ok: false, error: message };
      }
    },
    [],
  );

  const updatePromotion = useCallback(
    async (
      id: string,
      patch: Partial<Omit<Promotion, "id">>,
    ): Promise<{ ok: boolean; error?: string }> => {
      const idx = promotionsLive.findIndex((p) => p.id === id);
      if (idx < 0) return { ok: false, error: "Promotion not found." };
      const prev = promotionsLive[idx];
      promotionsLive[idx] = { ...prev, ...patch };
      promotionsLive.sort((a, b) => a.sortOrder - b.sortOrder);
      emitPromotions();
      const dbPatch: PromotionUpdate = {};
      if (patch.label !== undefined) dbPatch.label = patch.label;
      if (patch.headline !== undefined) dbPatch.headline = patch.headline;
      if (patch.imageUrl !== undefined) dbPatch.image_url = patch.imageUrl || null;
      if (patch.bgColor !== undefined) dbPatch.bg_color = patch.bgColor;
      if (patch.chipStyle !== undefined) dbPatch.chip_style = patch.chipStyle;
      if (patch.linkCategory !== undefined) dbPatch.link_category = patch.linkCategory || null;
      if (patch.sortOrder !== undefined) dbPatch.sort_order = patch.sortOrder;
      if (patch.isActive !== undefined) dbPatch.is_active = patch.isActive;
      try {
        const { error } = await supabase.from("promotions").update(dbPatch).eq("id", id);
        if (error) {
          console.error("[shop] updatePromotion failed:", error.message);
          const i2 = promotionsLive.findIndex((p) => p.id === id);
          if (i2 >= 0) promotionsLive[i2] = prev;
          promotionsLive.sort((a, b) => a.sortOrder - b.sortOrder);
          emitPromotions();
          return { ok: false, error: error.message };
        }
        return { ok: true };
      } catch (error) {
        const i2 = promotionsLive.findIndex((p) => p.id === id);
        if (i2 >= 0) promotionsLive[i2] = prev;
        promotionsLive.sort((a, b) => a.sortOrder - b.sortOrder);
        emitPromotions();
        const message = error instanceof Error ? error.message : "Failed to update promotion.";
        console.error("[shop] updatePromotion failed:", error);
        return { ok: false, error: message };
      }
    },
    [],
  );

  const deletePromotion = useCallback(
    async (id: string): Promise<{ ok: boolean; error?: string }> => {
      const idx = promotionsLive.findIndex((p) => p.id === id);
      if (idx < 0) return { ok: false, error: "Promotion not found." };
      const removed = promotionsLive[idx];
      promotionsLive.splice(idx, 1);
      emitPromotions();
      try {
        const { error } = await supabase.from("promotions").delete().eq("id", id);
        if (error) {
          console.error("[shop] deletePromotion failed:", error.message);
          promotionsLive.splice(idx, 0, removed);
          emitPromotions();
          return { ok: false, error: error.message };
        }
        return { ok: true };
      } catch (error) {
        promotionsLive.splice(idx, 0, removed);
        emitPromotions();
        const message = error instanceof Error ? error.message : "Failed to delete promotion.";
        console.error("[shop] deletePromotion failed:", error);
        return { ok: false, error: message };
      }
    },
    [],
  );

  return { promotions: list, addPromotion, updatePromotion, deletePromotion };
}
