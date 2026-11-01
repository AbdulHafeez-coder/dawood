import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { useSheetConfig } from "@/hooks/use-sheet-config";
import { quoteSheets, estimateWall } from "@/lib/wallpaper-sheets";
import { useCart } from "@/lib/shop";
import { useSettings } from "@/lib/settings";
import { formatPKR } from "@/lib/format";
import { assertPurchasable } from "@/lib/product-availability";
import { supabase } from "@/lib/supabase";
import "./wallpaper-calculator.css";

export function isWallpaperProduct(p: Product) {
  return /wall\s*paper|wall\s*sheet/i.test(p.name);
}
export function WallpaperPurchase({
  product,
  onAdded,
}: {
  product: Product;
  onAdded?: () => void;
}) {
  const config = useSheetConfig(product.id),
    settings = useSettings();
  const { addToCart } = useCart();
  const [cut, setCut] = useState("10"),
    [customLength, setCustomLength] = useState("");
  const [quantity, setQuantity] = useState("1"),
    [busy, setBusy] = useState(false);
  const length = cut === "custom" ? Number(customLength) : Number(cut);
  let quote: ReturnType<typeof quoteSheets> | undefined;
  let error = "";
  try {
    quote = quoteSheets(config, length, Number(quantity));
    const rolls = Math.ceil(Number(quantity) / Math.floor(60 / length));
    if (config.sourceRolls !== null && rolls > config.sourceRolls)
      throw new Error("Not enough source rolls for these cuts. Please enquire.");
    if (product.in_stock === false || product.is_active === false)
      throw new Error("Currently out of stock / فی الحال دستیاب نہیں");
  } catch (e) {
    error = (e as Error).message;
  }
  const phoneRaw = settings.whatsappNumber.replace(/\D/g, "");
  const phone = phoneRaw.startsWith("03") ? "92" + phoneRaw.slice(1) : phoneRaw;
  function inquire(roll = false) {
    const message = roll
      ? `Dawood Mart — Full roll inquiry\n${product.name}\nPlease manually quote the full roll price and shipping. Not an online order.`
      : `Dawood Mart — Sheet inquiry\n${product.name}\n${quantity} sheets, each 5 × ${length} ft\n${quote && !error ? formatPKR(quote.total) : "Please confirm price and availability."}\nShipping and installation separate.`;
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }
  async function add() {
    if (error || !quote || busy) return;
    setBusy(true);
    try {
      await assertPurchasable(supabase, [product.id]);
      const label = `5 × ${length} ft sheet`;
      const item: Product = {
        ...product,
        id: `${product.id}::wallpaper:${length}`,
        name: `${product.name} — ${label}`,
        display_name: `${product.display_name || product.name} — ${label}`,
        price: quote.unit,
        original_price: quote.normalUnit,
        wallpaperSheet: { length, config, normalUnit: quote.normalUnit, savings: quote.savings },
      };
      if (
        addToCart(item, Number(quantity), {
          baseId: product.id,
          baseName: product.name,
          variantSizeLabel: label,
        })
      ) {
        toast.success("Sheets added to preview basket");
        onAdded?.();
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="dm-wallpaper-calculator" aria-labelledby="wallpaper-order-title">
      <p className="dm-eyebrow">CUT SHEETS FOR YOUR HOME</p>
      <h2 id="wallpaper-order-title">
        Order wallpaper sheets{" "}
        <span lang="ur" dir="rtl">
          وال پیپر شیٹس خریدیں
        </span>
      </h2>
      <p className="dm-price">
        <strong>{formatPKR(config.base10)}</strong> / 5 × 10 ft sheet
      </p>
      <p>
        Special savings on multiple sheets.{" "}
        <span lang="ur" dir="rtl">
          زیادہ شیٹس پر خصوصی بچت۔
        </span>
      </p>
      <div className="dm-wallpaper-fields">
        <label>
          Sheet length / شیٹ کی لمبائی
          <select value={cut} onChange={(e) => setCut(e.target.value)}>
            <option value="10" disabled={!config.enabled10}>
              5 × 10 ft{!config.enabled10 ? " — unavailable" : ""}
            </option>
            {config.enabled12 && <option value="12">5 × 12 ft</option>}
            {config.custom && <option value="custom">Custom length / حسبِ ضرورت</option>}
          </select>
        </label>
        {cut === "custom" && (
          <label>
            Custom length (ft) / کٹ کی لمبائی
            <input
              type="number"
              min="0.01"
              max="59.99"
              step="0.01"
              inputMode="decimal"
              value={customLength}
              placeholder="Length in feet"
              onChange={(e) => setCustomLength(e.target.value)}
            />
          </label>
        )}
        <label>
          Quantity / شیٹس کی تعداد
          <input
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </label>
      </div>
      {error && (
        <p role="alert" className="dm-wallpaper-warning">
          {error}
        </p>
      )}
      {quote && (
        <div className="dm-wallpaper-result" aria-live="polite">
          <dl>
            <div>
              <dt>Each sheet / فی شیٹ</dt>
              <dd>
                5 × {length} ft · {formatPKR(quote.unit)}
              </dd>
            </div>
            <div>
              <dt>Quantity / تعداد</dt>
              <dd>{quantity} sheets</dd>
            </div>
            <div>
              <dt>Savings / بچت</dt>
              <dd>{formatPKR(quote.savings)}</dd>
            </div>
            <div>
              <dt>Sheet total / کل قیمت</dt>
              <dd>{formatPKR(quote.total)}</dd>
            </div>
          </dl>
          <p className="dm-wallpaper-note">
            Delivery and installation separate. Quantity discounts apply across this product’s
            sheets in the basket; promotions do not stack.
          </p>
        </div>
      )}
      <button className="dm-button" disabled={!!error || !quote || busy} onClick={add}>
        {busy ? "Checking…" : "Add sheets to cart / کارٹ میں شامل کریں"}
      </button>
      <button
        className="dm-button dm-outline"
        style={{ marginTop: 10 }}
        disabled={!phone}
        onClick={() => inquire()}
      >
        WhatsApp inquiry / واٹس ایپ پر پوچھیں
      </button>
      <p className="dm-wallpaper-note">
        Pattern matching, installation waste and wall irregularities may increase quantity. / ڈیزائن
        ملانے، تنصیب کے ضیاع اور ناہمواری سے مقدار بڑھ سکتی ہے۔
      </p>
      <button className="dm-roll-inquiry" disabled={!phone} onClick={() => inquire(true)}>
        Ask About Full Roll / مکمل رول کے بارے میں پوچھیں
      </button>
      <p className="dm-wallpaper-note">
        Full rolls are manually quoted, including shipping, and cannot be added online.
      </p>
      <Link to="/admin/wallpaper" search={{ product: product.id }} className="dm-wallpaper-note">
        Preview admin: edit sheet pricing
      </Link>
    </section>
  );
}

export function WallpaperCalculator({ product }: { product: Product }) {
  const config = useSheetConfig(product.id);
  const [mode, setMode] = useState<"full" | "half">("full");
  const [width, setWidth] = useState(""),
    [height, setHeight] = useState("");
  let estimate: ReturnType<typeof estimateWall> | undefined,
    error = "";
  if (width && (mode === "half" || height)) {
    try {
      if (product.in_stock === false)
        throw new Error("Currently out of stock / فی الحال دستیاب نہیں");
      estimate = estimateWall(config, mode, Number(width), mode === "half" ? 5 : Number(height));
    } catch (e) {
      error = (e as Error).message;
    }
  }
  return (
    <section className="dm-wallpaper-calculator" aria-labelledby="wallpaper-calculator-title">
      <h2 id="wallpaper-calculator-title">
        Wall size calculator{" "}
        <span lang="ur" dir="rtl">
          دیوار کا سادہ حساب
        </span>
      </h2>
      <label>
        Coverage / کوریج
        <select value={mode} onChange={(e) => setMode(e.target.value as "full" | "half")}>
          <option value="full">Full Wall / پوری دیوار</option>
          <option value="half">Half Wall / آدھی دیوار</option>
        </select>
      </label>
      <div className="dm-wallpaper-fields">
        <label>
          {mode === "half"
            ? "Wall horizontal length (ft) / دیوار کی لمبائی"
            : "Wall width (ft) / دیوار کی چوڑائی"}
          <input
            type="number"
            inputMode="decimal"
            min={mode === "half" ? 10 : 0.01}
            max={mode === "half" ? (config.custom ? 59.99 : 18) : undefined}
            step=".01"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
          />
        </label>
        {mode === "full" ? (
          <label>
            Wall height (ft) / دیوار کی اونچائی
            <input
              type="number"
              inputMode="decimal"
              min=".01"
              max="12"
              step=".01"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </label>
        ) : (
          <p>
            Installation height: 5 ft / تنصیب کی اونچائی: 5 فٹ
            <br />
            Horizontal lengths: 10–18 ft; custom lengths only when configured.
          </p>
        )}
      </div>
      {error && (
        <p role="alert" className="dm-wallpaper-warning">
          {error}
        </p>
      )}
      {estimate && (
        <dl className="dm-wallpaper-result" aria-live="polite">
          <div>
            Recommended sheet / تجویز کردہ شیٹ: <strong>5 × {estimate.length} ft</strong>
          </div>
          <div>
            Quantity / تعداد: <strong>{estimate.quantity}</strong>
          </div>
          <div>
            Estimated price / تخمینی قیمت: <strong>{formatPKR(estimate.total)}</strong>
          </div>
        </dl>
      )}
      <p className="dm-wallpaper-note">
        Estimate only; does not change your cart. Full-wall sheets run vertically; half-wall
        material runs horizontally at 5-ft height. Pattern matching and installation waste may
        increase material. / یہ صرف تخمینہ ہے، کارٹ تبدیل نہیں ہوگا۔ ڈیزائن ملانے اور تنصیب میں
        اضافی مواد لگ سکتا ہے۔
      </p>
    </section>
  );
}
