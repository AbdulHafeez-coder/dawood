import { CATEGORY_MAP, DEFAULT_CATEGORY } from "./config";

export function normalizeTitle(rawTitle: string): string {
  let clean = rawTitle.replace(/\|/g, "").replace(/\s+/g, " ").trim();
  clean = clean.replace(/(\d+)\s*Pieces?/i, "$1 Pcs");
  const pcsMatch = clean.match(/(.*?)\s+(\d+\s*Pcs)$/i);
  if (pcsMatch) {
    clean = `${pcsMatch[2]} ${pcsMatch[1]}`;
  }
  const fakeWords = ["Premium", "Luxury", "Imported", "Original", "High Quality", "DeliSoga"];
  for (const word of fakeWords) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    clean = clean.replace(regex, "");
  }
  return clean.replace(/\s+/g, " ").trim();
}

export function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function generateSEOTitle(normalizedTitle: string): string {
  return `${normalizedTitle} | Dawood Mart`;
}

export function generateSEODescription(normalizedTitle: string, category: string): string {
  return `Shop the ${normalizedTitle} at Dawood Mart. Premium ${category} with fast shipping across Pakistan. View product details and availability.`;
}

export function mapCategory(sourceCategory: string, title: string): string {
  if (sourceCategory && CATEGORY_MAP[sourceCategory]) {
    return CATEGORY_MAP[sourceCategory];
  }
  const t = title.toLowerCase();
  if (t.includes("bowl") || t.includes("plate") || t.includes("dish") || t.includes("serving")) return "Serving & Dining";
  if (t.includes("cup") || t.includes("glass") || t.includes("mug") || t.includes("jug") || t.includes("water set") || t.includes("tea set")) return "Cups & Drinkware";
  if (t.includes("jar") || t.includes("candy")) return "Decoration & Gift Items";
  return DEFAULT_CATEGORY;
}

export function cleanDescription(rawHtml: string): string {
  let text = rawHtml.replace(/<[^>]*>?/gm, "\n");
  text = text.replace(/&nbsp;/gi, " ");
  text = text.replace(/\n\s*\n/g, "\n\n").trim();
  text = text.replace(/DeliSoga/gi, "this product");
  return text;
}
