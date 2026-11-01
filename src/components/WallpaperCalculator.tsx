import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { useSheetConfig } from "@/hooks/use-sheet-config";
import { quoteSheets, roomSheets } from "@/lib/wallpaper-sheets";
import { useCart } from "@/lib/shop";
import { useSettings } from "@/lib/settings";
import { formatPKR } from "@/lib/format";
import { assertPurchasable } from "@/lib/product-availability";
import { supabase } from "@/lib/supabase";
import "./wallpaper-calculator.css";

export function isWallpaperProduct(p: Product) {
  return /wall\s*paper|wall\s*sheet/i.test(p.name);
}
export function WallpaperCalculator({
  product,
  onAdded,
}: {
  product: Product;
  onAdded?: () => void;
}) {
  const config = useSheetConfig(product.id),
    settings = useSettings();
  const { addToCart } = useCart();
  const [coverage, setCoverage] = useState("single"),
    [width, setWidth] = useState("");
  const [depth, setDepth] = useState(""),
    [height, setHeight] = useState("");
  const [cut, setCut] = useState("10"),
    [customLength, setCustomLength] = useState("");
  const [quantity, setQuantity] = useState("1"),
    [busy, setBusy] = useState(false);
  const length = cut === "custom" ? Number(customLength || height) : Number(cut);
  useEffect(() => {
    try {
      if (!width || !height || (coverage === "room" && !depth)) return;
      const walls =
        coverage === "room"
          ? [Number(width), Number(depth), Number(width), Number(depth)]
          : [Number(width)];
      setQuantity(String(roomSheets(walls, Number(height), length).strips));
    } catch {
      /* Keep entered quantity until measurements are valid. */
    }
  }, [width, height, depth, coverage, length]);
  let geometry: ReturnType<typeof roomSheets> | undefined;
  let quote: ReturnType<typeof quoteSheets> | undefined;
  let error = "";
  const measuring = !!(width || height || (coverage === "room" && depth));
  try {
    if (measuring) {
      if (!width || !height || (coverage === "room" && !depth))
        throw new Error("Complete the wall measurements. / مکمل پیمائش درج کریں۔");
      const walls =
        coverage === "room"
          ? [Number(width), Number(depth), Number(width), Number(depth)]
          : [Number(width)];
      geometry = roomSheets(walls, Number(height), length);
    }
    quote = quoteSheets(config, length, Number(quantity));
    if (geometry?.short)
      throw new Error(
        "Selected sheet is shorter than your wallpaper height. Choose a longer cut. / منتخب کٹ اونچائی سے چھوٹا ہے۔",
      );
    if (geometry && Number(quantity) < geometry.strips)
      throw new Error(
        "Use the calculated quantity or add enough sheets. / حساب کے مطابق مقدار منتخب کریں۔",
      );
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
      ? `Dawood Mart — Full roll inquiry\n${product.name}\nPlease manually quote the full roll price and shipping. This is not an online order.`
      : `Dawood Mart — Wallpaper sheets inquiry\n${product.name}\n${quantity} sheets, each 5 × ${length} ft\n${geometry ? `${coverage} wall dimensions: ${width}${coverage === "room" ? ` × ${depth} room` : ""} ft, wallpaper height ${height} ft; ${geometry.strips} strips required.\n` : ""}${quote && !error ? `Sheet total: ${formatPKR(quote.total)}; savings: ${formatPKR(quote.savings)}.` : "Please confirm dimensions, stock and price."}\nDelivery and installation separate. Please confirm pattern matching and waste allowance.`;
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
    <section className="dm-wallpaper-calculator" aria-labelledby="wallpaper-calculator-title">
      <p className="dm-eyebrow">CUT SHEETS FOR YOUR HOME</p>
      <h2 id="wallpaper-calculator-title">
        Wallpaper sheets & calculator{" "}
        <span lang="ur" dir="rtl">
          وال پیپر شیٹس اور کیلکولیٹر
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
              placeholder="Use wallpaper height"
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
      <details open className="dm-product-details">
        <summary>Calculate your walls / دیواروں کا حساب</summary>
        <div className="dm-wallpaper-fields">
          <label>
            Wall coverage / دیوار کی کوریج
            <select value={coverage} onChange={(e) => setCoverage(e.target.value)}>
              <option value="single">Single Wall / ایک دیوار</option>
              <option value="half">Half Wall / آدھی دیوار</option>
              <option value="room">Full Room / پورا کمرہ</option>
            </select>
          </label>
          <label>
            {coverage === "room"
              ? "Room length (ft) / کمرے کی لمبائی"
              : "Wall width (ft) / دیوار کی چوڑائی"}
            <input
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
            />
          </label>
          {coverage === "room" && (
            <label>
              Room width (ft) / کمرے کی چوڑائی
              <input
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
              />
            </label>
          )}
          <label>
            Wallpaper height (ft) / مطلوبہ اونچائی
            <input
              type="number"
              min="0.01"
              max="59.99"
              step="0.01"
              inputMode="decimal"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </label>
        </div>
        <p className="dm-wallpaper-note">
          Full Room covers four rectangular walls, not the ceiling. Each wall rounds up separately.
          Half Wall uses your entered height. Doors/windows are not deducted. / چار دیواروں کا الگ
          حساب؛ دروازے اور کھڑکیاں منہا نہیں۔
        </p>
        {geometry && (
          <div className="dm-wallpaper-result" aria-live="polite">
            <p>
              Required: <strong>{geometry.strips} sheets</strong>, each 5 × {length} ft ·{" "}
              {geometry.runningFeet} running ft.
            </p>
            <p>Strips per wall: {geometry.perWall.join(" + ")}</p>
            <button
              type="button"
              className="dm-button dm-outline"
              onClick={() => setQuantity(String(geometry!.strips))}
            >
              Use calculated quantity / حساب والی مقدار لیں
            </button>
          </div>
        )}
      </details>
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
