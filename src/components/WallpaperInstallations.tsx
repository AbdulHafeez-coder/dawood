import type { Product } from "@/lib/shop";

export function hasWallpaperInstallations(product: Product) {
  const name = `${product.display_name || ""} ${product.id}`;
  return !/glue|adhesive glue/i.test(name) &&
    (product.category === "Wall paper sheets" || /wall\s*paper/i.test(name));
}

export function WallpaperInstallations() {
  return (
    <section className="dm-section" aria-labelledby="wallpaper-installations">
      <h2 id="wallpaper-installations">Our school installations · ہمارے لگائے ہوئے وال پیپر</h2>
      <p>Real project photos supplied by Dawood Mart, showing full-wall and half-wall installations. Designs shown may differ from the selected product. These are installation examples, not customer ratings.</p>
      <p lang="ur" dir="rtl">اسکول میں ہمارے کیے ہوئے کام کی اصل تصاویر۔ خریدنے سے پہلے اپنا ڈیزائن منتخب کریں۔ سیلن یا رساؤ پہلے درست کریں اور وال پیپر صاف، خشک دیوار پر لگائیں۔</p>
      <div style={{ display: "grid", gap: 24, maxWidth: 900, margin: "24px auto" }}>
        {Array.from({ length: 20 }, (_, index) => (
          <figure key={index} style={{ margin: 0 }}>
            <img src={`/images/wallpaper-installations/school-${String(index + 1).padStart(2, "0")}.jpeg`}
              alt={`Dawood Mart school wallpaper installation — view ${index + 1}`}
              loading="lazy" decoding="async"
              style={{ display: "block", width: "100%", height: "auto", borderRadius: 10 }} />
            <figcaption style={{ fontSize: 12, marginTop: 8 }}>School installation · {index + 1} / 20</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
