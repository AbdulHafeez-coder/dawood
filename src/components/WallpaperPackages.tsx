import { Link } from "@tanstack/react-router";
import { useProducts, type Product } from "@/lib/shop";
import { formatPKR } from "@/lib/format";

const packages = [
  { id: "fabric-wallpaper-1-sheet", label: "5 × 10 ft wall", sheets: 1 },
  { id: "fabric-wallpaper-2-sheets", label: "10 × 10 ft wall", sheets: 2 },
  { id: "fabric-wallpaper-3-sheets", label: "Up to 15 × 10 ft wall", sheets: 3 },
  { id: "fabric-wallpaper-4-sheets", label: "Up to 20 × 10 ft wall", sheets: 4 },
  { id: "fabric-wallpaper-8-sheets", label: "10 × 10 ft room · 10 ft high", sheets: 8 },
  { id: "fabric-wallpaper-half-wall-10", label: "Half wall · up to 10 ft long × 5 ft high", sheets: 1 },
  { id: "fabric-wallpaper-half-wall-20", label: "Half wall · over 10 to 20 ft long × 5 ft high", sheets: 2 },
  { id: "fabric-wallpaper-half-room-10", label: "Half room · 10 × 10 ft · 5 ft high", sheets: 4 },
  { id: "fabric-wallpaper-half-room-13", label: "Half room · 10 × 11–13 ft · 5 ft high", sheets: 5 },
];

const chinaPackages = packages.slice(0, 4).map((pack) => ({
  ...pack,
  id: `china-${pack.id}`,
}));

export function isWallpaperPackage(id: string) {
  return [...packages, ...chinaPackages].some((pack) => pack.id === id);
}

export function WallpaperPackages({ product }: { product: Product }) {
  const availablePackages = product.id.startsWith("china-") ? chinaPackages : packages;
  const { products } = useProducts({ ids: availablePackages.map((pack) => pack.id), pageSize: availablePackages.length });
  const catalog = [product, ...products];
  return (
    <section aria-label="Wallpaper wall-size packages" style={{ marginBlock: 24 }}>
      <h2 style={{ fontSize: 18, marginBottom: 8 }}>Choose your wall size · دیوار کا سائز</h2>
      <p style={{ fontSize: 13, marginBottom: 12 }}>Each sheet is 5 × 10 ft. Half-wall sheets cover 10 ft horizontally at 5 ft high; check pattern direction before fitting. / ہر شیٹ 5 × 10 فٹ؛ ہاف وال کی اونچائی 5 فٹ ہے۔</p>
      <div style={{ display: "grid", gap: 8 }}>
        {availablePackages.map((pack) => {
          const item = catalog.find((p) => p.id === pack.id && p.is_active !== false);
          if (!item) return null;
          return (
            <Link key={pack.id} to="/product/$id" params={{ id: item.slug || item.id }}
              aria-current={product.id === pack.id ? "page" : undefined}
              style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: 12,
                border: `1px solid ${product.id === pack.id ? "#65705b" : "#deded6"}`, borderRadius: 6,
                background: product.id === pack.id ? "#f3f0e9" : "transparent", fontSize: 13 }}>
              <span>{pack.label}<small style={{ display: "block" }}>{pack.sheets} sheet{pack.sheets > 1 ? "s" : ""}</small></span>
              <strong>{formatPKR(item.price)}</strong>
            </Link>
          );
        })}
      </div>
      <p style={{ fontSize: 12, lineHeight: 1.6, marginTop: 12 }}>Coverage before trimming and pattern matching. Uneven walls may need extra material. Room package covers four walls, not the ceiling. / کٹنگ اور ڈیزائن ملانے کے لیے اضافی شیٹ لگ سکتی ہے۔</p>
      <p style={{ marginTop: 16 }}>Glue sold separately · گلو الگ خریدیں</p>
      <div style={{ display: "flex", gap: 18, marginTop: 8 }}>
        <Link to="/product/$id" params={{ id: "wallpaper-glue-500g" }} style={{ textDecoration: "underline" }}>Wallpaper glue · 500g</Link>
        <Link to="/product/$id" params={{ id: "wallpaper-glue-1kg" }} style={{ textDecoration: "underline" }}>Wallpaper glue · 1kg</Link>
      </div>
    </section>
  );
}
