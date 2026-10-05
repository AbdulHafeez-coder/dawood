// Category is a free-form string so admins can add/rename categories.
export type Category = string;

export type Product = {
  id: string;
  is_active?: boolean;
  name: string;
  display_name: string;
  tag: string;
  price: number;
  rating: number;
  img: string;
  bg: string;
  category: Category;
  brand?: string;
  subCategory?: string;
  tagline: string;
  description: string;
  details: string[];
  gallery: string[];
  slug?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  original_price?: number;
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

export type CouponType = "percent" | "fixed";

export type Coupon = {
  code: string;
  discountType: CouponType;
  discountValue: number; // e.g. 10 for 10% or 500 for PKR 500
  minSpend?: number;
  description: string;
};

