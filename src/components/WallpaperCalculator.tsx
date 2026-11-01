import { useState } from "react";
import type { Product } from "@/lib/types";
import {
  calculateWallpaper,
  estimateWallpaper,
  wallpaperConfiguration,
} from "@/lib/wallpaper-calculator";
import { useSettings } from "@/lib/settings";
import { formatPKR } from "@/lib/format";
import "./wallpaper-calculator.css";

export function isWallpaperProduct(p: Product) {
  return /wall\s*paper|wall\s*sheet/i.test(p.name);
}
export function WallpaperCalculator({ product }: { product: Product }) {
  const settings = useSettings();
  const [wall, setWall] = useState("half");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [mode, setMode] = useState("custom");
  const [cut, setCut] = useState("");
  const config = wallpaperConfiguration(product.price, product.details);
  // These are the customer's requested sizes, not a claim of verified inventory.
  const cutOptions = config.readyCuts.length ? config.readyCuts : [10, 12, 14, 20, 30, 40, 50, 60];
  const ready = Number(cut || cutOptions[0]);
  let result: ReturnType<typeof calculateWallpaper> | undefined;
  let error = "";
  if (width && height) {
    try {
      if (mode === "ready" && !cutOptions.includes(ready))
        throw new Error(
          "Ready-cut stock is not confirmed. Please enquire. / تیار کٹ کی دستیابی پوچھیں۔",
        );
      result = calculateWallpaper(
        Number(width),
        Number(height),
        mode === "custom" ? Number(height) : ready,
      );
    } catch (e) {
      error = (e as Error).message;
    }
  }
  const cost = result ? estimateWallpaper(result, config) : null;
  const insufficient =
    result && config.availableRolls !== undefined && result.rolls > config.availableRolls;
  const stockNote =
    product.in_stock === false
      ? "Currently out of stock / فی الحال دستیاب نہیں"
      : insufficient
        ? "Not enough source rolls in configured stock / مطلوبہ رول اسٹاک میں نہیں"
        : "Cut lengths and stock need confirmation / کٹ اور اسٹاک کی تصدیق ضروری ہے";
  const message = result
    ? [
        "Dawood Mart — Wallpaper inquiry (not a confirmed order)",
        product.display_name || product.name,
        `${wall === "half" ? "Half" : "Full"} wall: ${width} ft wide × ${height} ft wallpaper height`,
        `${mode === "custom" ? "Custom" : "Ready"} cuts: ${result.strips} strips × 5 ft wide × ${result.stripLength} ft long`,
        `Total: ${result.runningFeet} running ft; ${result.rolls} source rolls needed (5 × 60 ft).`,
        `Maximum ${result.stripsPerRoll} complete strips per roll; source offcuts: ${result.offcutFeet} running ft.`,
        cost === null
          ? "Please confirm selling rate and total price."
          : `Estimated cut price: ${formatPKR(cost)} (delivery and installation excluded).`,
        result.short ? "WARNING: selected cut is shorter than required height." : "",
        stockNote,
        "Please confirm pattern matching, waste allowance and availability before any order.",
      ]
        .filter(Boolean)
        .join("\n")
    : "";
  const raw = settings.whatsappNumber?.replace(/\D/g, "") || "";
  const phone = raw.startsWith("03") && raw.length === 11 ? "92" + raw.slice(1) : raw;
  return (
    <section className="dm-wallpaper-calculator" aria-labelledby="wallpaper-calculator-title">
      <p className="dm-eyebrow">MEASURE BEFORE YOU CHOOSE</p>
      <h2 id="wallpaper-calculator-title">
        Wallpaper calculator{" "}
        <span lang="ur" dir="rtl">
          وال پیپر کیلکولیٹر
        </span>
      </h2>
      <p>
        Fixed width: <strong>5 ft</strong> · Source roll: <strong>60 running ft</strong>
        <br />
        <span lang="ur" dir="rtl">
          چوڑائی ہمیشہ 5 فٹ؛ اصل رول کی لمبائی 60 فٹ ہے۔
        </span>
      </p>
      <div className="dm-wallpaper-fields">
        <label>
          Wall coverage / دیوار کی کوریج
          <select value={wall} onChange={(e) => setWall(e.target.value)}>
            <option value="half">Half Wall / آدھی دیوار</option>
            <option value="full">Full Wall / پوری دیوار</option>
          </select>
        </label>
        <label>
          Cut type / کٹ کی قسم
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="custom">Custom Cut / حسبِ ضرورت کٹ</option>
            <option value="ready">Ready Cut / تیار کٹ</option>
          </select>
        </label>
        <label>
          Wall width (ft) / دیوار کی چوڑائی
          <input
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            placeholder="e.g. 14"
          />
        </label>
        <label>
          Wallpaper height (ft) / مطلوبہ اونچائی
          <input
            type="number"
            inputMode="decimal"
            min="0.01"
            max="60"
            step="0.01"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="e.g. 10"
          />
        </label>
      </div>
      <p className="dm-wallpaper-note">
        Enter the height you want covered; Half Wall does not halve your measurement.{" "}
        <span lang="ur" dir="rtl">
          مطلوبہ اونچائی خود درج کریں؛ آدھی دیوار منتخب کرنے سے پیمائش آدھی نہیں ہوگی۔
        </span>
      </p>
      {mode === "ready" && (
        <label>
          Ready cut length (ft; confirm stock) / تیار کٹ، اسٹاک کی تصدیق ضروری
          <select value={cut || String(cutOptions[0])} onChange={(e) => setCut(e.target.value)}>
            {cutOptions.map((n) => (
              <option key={n} value={n}>
                {n} ft × 5 ft
              </option>
            ))}
          </select>
        </label>
      )}
      {error && (
        <p role="alert" className="dm-wallpaper-warning">
          {error}
        </p>
      )}
      {result && (
        <div className="dm-wallpaper-result" aria-live="polite">
          <dl>
            <div>
              <dt>Quantity / پٹیاں</dt>
              <dd>{result.strips} strips</dd>
            </div>
            <div>
              <dt>Each cut / ہر کٹ</dt>
              <dd>5 × {result.stripLength} ft</dd>
            </div>
            <div>
              <dt>Running feet / رننگ فٹ</dt>
              <dd>{result.runningFeet} ft</dd>
            </div>
            <div>
              <dt>Source rolls / اصل رول</dt>
              <dd>{result.rolls} × 60 ft</dd>
            </div>
            <div>
              <dt>Estimated cut cost / تخمینی قیمت</dt>
              <dd>{cost === null ? "Confirm rate / ریٹ کی تصدیق" : formatPKR(cost)}</dd>
            </div>
          </dl>
          <p>
            Up to {result.stripsPerRoll} complete strips per roll. Source offcuts:{" "}
            {result.offcutFeet} running ft, not extra wallpaper ordered.{" "}
            <span lang="ur" dir="rtl">
              ہر رول سے {result.stripsPerRoll} مکمل پٹیاں؛ بچا ہوا حصہ آرڈر کی مقدار میں شامل نہیں۔
            </span>
          </p>
          {result.short && (
            <p role="alert" className="dm-wallpaper-warning">
              Selected cut is shorter than your wall height. It will not cover the full height. /
              منتخب کٹ دیوار کی مطلوبہ اونچائی سے چھوٹا ہے۔
            </p>
          )}
          <p>{stockNote}</p>
        </div>
      )}
      {config.rate === undefined && (
        <p className="dm-wallpaper-note">
          The listed product price is {formatPKR(product.price)}, but its length/unit is not
          configured. No per-foot price is assumed.{" "}
          <span lang="ur" dir="rtl">
            درج قیمت کی لمبائی واضح نہیں؛ فی فٹ قیمت کی تصدیق لیں۔
          </span>
        </p>
      )}
      <p className="dm-wallpaper-note">
        Pattern matching, installation waste and uneven walls may increase quantity. Delivery and
        installation are excluded.{" "}
        <span lang="ur" dir="rtl">
          ڈیزائن ملانے، تنصیب کے ضیاع اور ناہموار دیواروں سے مقدار بڑھ سکتی ہے۔ ڈیلیوری اور تنصیب
          الگ ہیں۔
        </span>
      </p>
      <button
        type="button"
        className="dm-button"
        disabled={!result || !phone}
        onClick={() =>
          window.open(
            `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
            "_blank",
            "noopener,noreferrer",
          )
        }
      >
        WhatsApp inquiry / واٹس ایپ پر پوچھیں
      </button>
      <p className="dm-wallpaper-note">
        Inquiry only. No order is placed or saved. / صرف معلومات؛ آرڈر محفوظ نہیں ہوگا۔
      </p>
    </section>
  );
}
