import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { getProductAsync } from "@/lib/shop";
import { useSheetConfig } from "@/hooks/use-sheet-config";
import { defaultSheetConfig, saveSheetConfig, type SheetConfig } from "@/lib/wallpaper-sheets";
import "@/components/wallpaper-calculator.css";

export const Route = createFileRoute("/admin/wallpaper")({
  validateSearch: (s: Record<string, unknown>) => ({
    product: typeof s.product === "string" ? s.product : "p-mvjofm73-rrll",
  }),
  loaderDeps: ({ search }) => ({ product: search.product }),
  loader: async ({ deps }) => {
    const p = await getProductAsync(deps.product);
    if (!p || !/wall\s*paper|wall\s*sheet/i.test(p.name)) throw notFound();
    return p;
  },
  component: WallpaperAdmin,
});
function WallpaperAdmin() {
  const product = Route.useLoaderData();
  const saved = useSheetConfig(product.id);
  return (
    <main className="storefront dm-section" style={{ maxWidth: 820, paddingBlock: 32 }}>
      <Link to="/product/$id" params={{ id: product.id }}>
        ← Back to wallpaper
      </Link>
      <h1>Wallpaper pricing — preview admin</h1>
      <p>{product.name}</p>
      <p>
        Sandbox controls: changes apply only in this browser and preview origin. No production
        database writes. These are not shared live inventory records.
      </p>
      <ConfigEditor key={JSON.stringify(saved)} productId={product.id} initial={saved} />
    </main>
  );
}
function ConfigEditor({ productId, initial }: { productId: string; initial: SheetConfig }) {
  const [config, setConfig] = useState(initial),
    [message, setMessage] = useState("");
  const number = (key: keyof SheetConfig, label: string, nullable = false) => (
    <label>
      {label}
      <input
        type="number"
        min="0"
        step={key.startsWith("stock") || key === "sourceRolls" ? "1" : "0.01"}
        value={(config[key] as number) ?? ""}
        onChange={(e) =>
          setConfig({
            ...config,
            [key]: e.target.value === "" && nullable ? null : Number(e.target.value),
          })
        }
      />
    </label>
  );
  const check = (key: "enabled10" | "enabled12" | "custom", label: string) => (
    <label>
      <input
        style={{ width: 20, minHeight: 20, display: "inline", marginRight: 8 }}
        type="checkbox"
        checked={config[key]}
        onChange={(e) => setConfig({ ...config, [key]: e.target.checked })}
      />
      {label}
    </label>
  );
  return (
    <form
      className="dm-wallpaper-calculator"
      onSubmit={(e) => {
        e.preventDefault();
        try {
          saveSheetConfig(productId, config);
          toast.success("Saved in this preview browser only.");
          setMessage("Saved in this preview browser only.");
        } catch (error) {
          setMessage((error as Error).message);
        }
      }}
    >
      <h2>Single-sheet pricing / فی شیٹ قیمت</h2>
      <div className="dm-wallpaper-fields">
        {number("base10", "Normal 5 × 10 ft price (PKR)")}
        {number("floor10", "Minimum 5 × 10 ft price (PKR)")}
        {number("promo10", "Promotional 5 × 10 ft price (optional)", true)}
        {number("stock10", "10-ft sheets in stock (blank = confirm)", true)}
        {check("enabled10", "10-ft sheets available")}
      </div>
      <h2>Other cuts / دیگر کٹ</h2>
      <div className="dm-wallpaper-fields">
        {check("enabled12", "12-ft sheets available")}
        {number("price12", "Normal 5 × 12 ft price (PKR)")}
        {number("stock12", "12-ft sheets in stock (blank = confirm)", true)}
        {check("custom", "Custom lengths available")}
        {number("customRate", "Custom selling price per running ft (PKR)")}
        {number("sourceRolls", "Source rolls available for cutting (optional)", true)}
      </div>
      <p>
        12-ft and custom cuts stay unavailable until enabled with valid prices. No full-roll online
        sales. Minimums scale with cut length.
      </p>
      <h2>Quantity savings / مقدار پر رعایت</h2>
      <p>
        Per product, across cut lengths. Best promotion or quantity discount applies; discounts do
        not stack.
      </p>
      {config.tiers.map((tier, index) => (
        <div className="dm-wallpaper-fields" key={index}>
          <label>
            Minimum sheets
            <input
              type="number"
              min="2"
              step="1"
              value={tier.quantity}
              onChange={(e) =>
                setConfig({
                  ...config,
                  tiers: config.tiers.map((t, i) =>
                    i === index ? { ...t, quantity: Number(e.target.value) } : t,
                  ),
                })
              }
            />
          </label>
          <label>
            Discount percent
            <input
              type="number"
              min="0"
              max="100"
              value={tier.percent}
              onChange={(e) =>
                setConfig({
                  ...config,
                  tiers: config.tiers.map((t, i) =>
                    i === index ? { ...t, percent: Number(e.target.value) } : t,
                  ),
                })
              }
            />
          </label>
          <button
            type="button"
            className="dm-button dm-outline"
            onClick={() =>
              setConfig({ ...config, tiers: config.tiers.filter((_, i) => i !== index) })
            }
          >
            Remove discount
          </button>
        </div>
      ))}
      <button
        type="button"
        className="dm-button dm-outline"
        onClick={() =>
          setConfig({
            ...config,
            tiers: [
              ...config.tiers,
              { quantity: Math.max(1, ...config.tiers.map((t) => t.quantity)) + 1, percent: 0 },
            ],
          })
        }
      >
        Add quantity discount
      </button>
      <button className="dm-button" type="submit" style={{ marginTop: 16 }}>
        Save preview settings
      </button>
      <button
        type="button"
        className="dm-button dm-outline"
        style={{ marginTop: 12 }}
        onClick={() => setConfig(defaultSheetConfig())}
      >
        Reset form to confirmed single-sheet rate
      </button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
