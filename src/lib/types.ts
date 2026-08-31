// Category is a free-form string so admins can add/rename categories.
export type Category = string;

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
  slug?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
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
