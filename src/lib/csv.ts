import type { Product } from "@/lib/shop";

// ---------- Generic CSV ----------
export function stringifyCsv(rows: (string | number)[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const s = cell === null || cell === undefined ? "" : String(cell);
          if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
          return s;
        })
        .join(","),
    )
    .join("\r\n");
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(/^\uFEFF/, ""); // strip BOM
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        row.push(field);
        field = "";
      } else if (c === "\n" || c === "\r") {
        row.push(field);
        field = "";
        rows.push(row);
        row = [];
        if (c === "\r" && src[i + 1] === "\n") i++;
      } else {
        field += c;
      }
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------- Products ----------
export const PRODUCT_CSV_COLUMNS = [
  "id",
  "name",
  "tag",
  "category",
  "price",
  "rating",
  "tagline",
  "description",
  "details",
  "img",
  "bg",
  "gallery",
] as const;

export function productsToCsv(products: Product[]): string {
  const header = [...PRODUCT_CSV_COLUMNS];
  const rows: (string | number)[][] = [header as unknown as string[]];
  for (const p of products) {
    rows.push([
      p.id,
      p.name,
      p.tag,
      p.category,
      p.price,
      p.rating,
      p.tagline,
      p.description,
      (p.details ?? []).join(" | "),
      p.img,
      p.bg,
      (p.gallery ?? []).join(" | "),
    ]);
  }
  return stringifyCsv(rows);
}

export type ParsedProductRow = {
  row: number;
  data?: Partial<Product> & { name: string; category: string; price: number };
  error?: string;
};

export function parseProductsCsv(text: string): ParsedProductRow[] {
  const table = parseCsv(text);
  if (table.length === 0) return [];
  const header = table[0].map((h) => h.trim().toLowerCase());
  const idx = (k: string) => header.indexOf(k);
  const need = ["name", "category", "price"];
  const missing = need.filter((k) => idx(k) === -1);
  if (missing.length) {
    return [{ row: 1, error: `Missing columns: ${missing.join(", ")}` }];
  }
  const out: ParsedProductRow[] = [];
  for (let r = 1; r < table.length; r++) {
    const cells = table[r];
    const get = (k: string) => {
      const i = idx(k);
      return i === -1 ? "" : (cells[i] ?? "").trim();
    };
    const name = get("name");
    const category = get("category");
    const priceRaw = get("price");
    if (!name || !category) {
      out.push({ row: r + 1, error: "Name and category are required" });
      continue;
    }
    const price = Number(priceRaw);
    if (!Number.isFinite(price) || price < 0) {
      out.push({ row: r + 1, error: `Invalid price "${priceRaw}"` });
      continue;
    }
    const rating = Number(get("rating"));
    const splitList = (s: string) =>
      s
        .split(/\s*\|\s*/)
        .map((x) => x.trim())
        .filter(Boolean);
    const details = splitList(get("details"));
    const gallery = splitList(get("gallery"));
    out.push({
      row: r + 1,
      data: {
        id: get("id") || undefined,
        name,
        category,
        price,
        rating: Number.isFinite(rating) && rating >= 0 ? rating : 4.7,
        tag: get("tag") || "New",
        tagline: get("tagline"),
        description: get("description"),
        details,
        img: get("img"),
        bg: get("bg"),
        gallery,
      },
    });
  }
  return out;
}

// ---------- Categories ----------
export function categoriesToCsv(categories: string[]): string {
  return stringifyCsv([["name"], ...categories.map((c) => [c])]);
}

export function parseCategoriesCsv(text: string): string[] {
  const table = parseCsv(text);
  if (table.length === 0) return [];
  const header = table[0].map((h) => h.trim().toLowerCase());
  const nameIdx = header.indexOf("name");
  const startRow = nameIdx === -1 ? 0 : 1;
  const col = nameIdx === -1 ? 0 : nameIdx;
  const out: string[] = [];
  for (let r = startRow; r < table.length; r++) {
    const v = (table[r][col] ?? "").trim();
    if (v) out.push(v);
  }
  return out;
}
