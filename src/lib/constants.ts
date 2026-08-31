import productTowel from "@/assets/product-towel.jpg";
import productWallpaper from "@/assets/product-wallpaper.jpg";
import productCloth from "@/assets/product-cloth.jpg";
import productSponge from "@/assets/product-sponge.jpg";
import productBathset from "@/assets/product-bathset.jpg";
import heroBg from "@/assets/hero-home.jpg";
import type { Category, VariantOptions } from "./types";

export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23F9F8F6'/%3E%3Cstop offset='100%25' stop-color='%23EBE9E4'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='800' fill='url(%23a)'/%3E%3Cpath d='M384 384h32v32h-32z' fill='%23D4D1CB'/%3E%3C/svg%3E";

export const SEED_CATEGORIES: readonly string[] = [
  "Cups & Drinkware",
  "Serving & Dining",
  "Watches",
  "Plastic Items",
  "Kitchen Items",
  "Towels",
  "Cleaning Items",
  "Home Sheets & Covers",
  "Decoration & Gift Items",
  "Electronics & Gadgets",
];

// Kept for backwards-compat imports in existing components; treat as seed.
export const CATEGORY_LIST = SEED_CATEGORIES;

export const DEFAULT_VARIANTS: VariantOptions = {
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

export const VARIANTS_BY_CATEGORY: Record<string, VariantOptions> = {
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

// ---------- SHIPPING (single source of truth, in PKR) ----------
export const FREE_SHIPPING_THRESHOLD = 5000;
export const SHIPPING_FEE = 500;
export function computeShipping(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

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
