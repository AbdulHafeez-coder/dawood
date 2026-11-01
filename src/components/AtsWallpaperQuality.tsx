import type { Product } from "@/lib/types";
import { useSheetConfig } from "@/hooks/use-sheet-config";
const features = [
  [
    "Non-woven fiber backing",
    "A supportive fiber base for wall covering.",
    "غیر بُنے ریشوں کی پشت، وال پیپر کو سہارا دیتی ہے۔",
  ],
  [
    "Breathable material",
    "Fiber construction lets air pass through.",
    "ریشے دار ساخت ہوا کے گزرنے کی گنجائش رکھتی ہے۔",
  ],
  [
    "Tear-resistant structure",
    "Designed for easier handling during installation.",
    "تنصیب کے دوران سنبھالنے میں آسان، پھٹنے کے خلاف مزاحم۔",
  ],
  [
    "Shape stability",
    "Helps the sheet keep its shape when fitted.",
    "لگانے کے دوران شیٹ کی شکل برقرار رکھنے میں مدد۔",
  ],
  [
    "Paste-the-wall installation",
    "Apply suitable paste to the wall before fitting.",
    "مناسب گوند دیوار پر لگائیں، پھر شیٹ نصب کریں۔",
  ],
  [
    "Smooth finish",
    "A smooth surface for a refined room finish.",
    "کمرے کی خوبصورتی کے لیے ہموار سطح۔",
  ],
];
export function AtsWallpaperQuality({ product }: { product: Product }) {
  const config = useSheetConfig(product.id);
  if (
    !config.atsFleeceVerified ||
    /\b(china|chinese)\b/i.test(`${product.name} ${product.brand || ""}`)
  )
    return null;
  return (
    <section className="dm-ats-quality" aria-labelledby="ats-quality-title">
      <p className="dm-eyebrow">ATS FABRIC / FLEECE</p>
      <h2 id="ats-quality-title">
        Made for a considered finish.
        <br />
        <span lang="ur" dir="rtl">
          خوبصورت دیواروں کے لیے موزوں ساخت
        </span>
      </h2>
      <div>
        {features.map(([title, description, urdu]) => (
          <article key={title}>
            <h3>{title}</h3>
            <p>{description}</p>
            <p lang="ur" dir="rtl">
              {urdu}
            </p>
          </article>
        ))}
      </div>
      <p className="dm-wallpaper-note">
        ATS fleece only; other fabric wallpapers have their own specifications. / یہ خصوصیات صرف ATS
        فلیس کے لیے ہیں۔{" "}
        <a
          href="https://www.atssynthetic.com.pk/fleece-wallpaper/"
          target="_blank"
          rel="noreferrer"
        >
          Manufacturer details
        </a>
      </p>
    </section>
  );
}
