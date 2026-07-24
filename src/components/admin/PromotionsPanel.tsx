import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Megaphone, ImageIcon, EyeOff, Eye } from "lucide-react";
import { usePromotions, type Promotion } from "@/lib/shop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PromotionImageUploader } from "./PromotionImageUploader";

const dmSans = { fontFamily: "'DM Sans', sans-serif" };
const inter = { fontFamily: "'Inter', sans-serif" };

const PALETTE = [
  { label: "Stone", value: "#ECEDEC" },
  { label: "Butter", value: "#FEF3C7" },
  { label: "Peach", value: "#FCE7D8" },
  { label: "Mist", value: "#E5EEF2" },
  { label: "Sand", value: "#F3ECE1" },
  { label: "Blush", value: "#FADDE1" },
  { label: "Sage", value: "#DDE7D5" },
  { label: "Ink", value: "#0F0F10" },
];

export function PromotionsPanel({ categories }: { categories: string[] }) {
  const { promotions, addPromotion, updatePromotion, deletePromotion } = usePromotions();
  const [dialog, setDialog] = useState<{ mode: "create" | "edit"; promo?: Promotion } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Promotion | null>(null);

  return (
    <section className="bg-white border border-black/10 rounded-2xl p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-black/60">
          <Megaphone className="w-3.5 h-3.5" />
          Promotions ({promotions.length})
        </div>
        <button
          onClick={() => setDialog({ mode: "create" })}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-black text-white hover:bg-black/85 transition text-[10px] uppercase tracking-[0.18em] active:scale-[0.98]"
        >
          <Plus className="w-3 h-3" /> New promotion
        </button>
      </div>

      {promotions.length === 0 ? (
        <div className="border border-dashed border-black/15 rounded-xl py-12 text-center text-black/50">
          <div>No promotions yet</div>
          <button
            onClick={() => setDialog({ mode: "create" })}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black text-white text-[10px] uppercase tracking-[0.18em] hover:bg-black/85"
          >
            <Plus className="w-3 h-3" /> Create your first promotion
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {promotions.map((p) => (
            <li
              key={p.id}
              className="border border-black/10 rounded-xl overflow-hidden hover:border-black/25 transition"
            >
              <div
                className="relative flex items-center gap-3 p-4 min-h-[130px]"
                style={{ backgroundColor: p.bgColor }}
              >
                <div className="flex-1 min-w-0">
                  <span
                    className={`inline-block text-[10px] tracking-[0.15em] px-2 py-1 rounded-md ${
                      p.chipStyle === "dark" ? "bg-black text-white" : "bg-white text-black"
                    }`}
                    style={{ ...inter, fontWeight: 600 }}
                  >
                    {p.label}
                  </span>
                  <div
                    className="mt-2 text-black whitespace-nowrap"
                    style={{ ...dmSans, fontWeight: 500, letterSpacing: "-0.02em", fontSize: 18 }}
                  >
                    {p.headline}
                  </div>
                </div>
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/60 grid place-items-center shrink-0">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-black/40" />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between px-3 py-2 text-[11px] text-black/60 border-t border-black/10">
                <div className="flex items-center gap-2 truncate">
                  <span className="uppercase tracking-[0.16em]">#{p.sortOrder}</span>
                  {p.linkCategory && <span className="truncate">→ {p.linkCategory}</span>}
                  {!p.isActive && (
                    <span className="inline-flex items-center gap-1 text-amber-700">
                      <EyeOff className="w-3 h-3" /> hidden
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={async () => {
                      const result = await updatePromotion(p.id, { isActive: !p.isActive });
                      if (result.ok) {
                        toast.success(p.isActive ? "Promotion hidden" : "Promotion shown", {
                          description: `${p.label} — ${p.headline}`,
                        });
                      } else {
                        toast.error("Promotion update failed", { description: result.error });
                      }
                    }}
                    aria-label={p.isActive ? "Hide" : "Show"}
                    className="w-8 h-8 rounded-full grid place-items-center text-black/60 hover:text-black hover:bg-black/5 transition"
                  >
                    {p.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => setDialog({ mode: "edit", promo: p })}
                    aria-label="Edit"
                    className="w-8 h-8 rounded-full grid place-items-center text-black/60 hover:text-black hover:bg-black/5 transition"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(p)}
                    aria-label="Delete"
                    className="w-8 h-8 rounded-full grid place-items-center text-black/60 hover:text-white hover:bg-black transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {dialog && (
        <PromotionFormDialog
          mode={dialog.mode}
          promo={dialog.promo}
          categories={categories}
          nextSort={promotions.length ? Math.max(...promotions.map((p) => p.sortOrder)) + 1 : 1}
          onClose={() => setDialog(null)}
          onCreate={async (data) => {
            const result = await addPromotion(data);
            if (result.ok) {
              toast.success("Promotion created", { description: `${data.label} — ${data.headline}` });
              setDialog(null);
            } else {
              toast.error("Promotion was not saved", { description: result.error });
            }
          }}
          onSave={async (id, patch) => {
            const result = await updatePromotion(id, patch);
            if (result.ok) {
              toast.success("Promotion updated");
              setDialog(null);
            } else {
              toast.error("Promotion was not saved", { description: result.error });
            }
          }}
        />
      )}

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete promotion?</AlertDialogTitle>
            <AlertDialogDescription>
              “{confirmDelete?.label} — {confirmDelete?.headline}” will be permanently removed from
              the storefront. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-600"
              onClick={async () => {
                if (confirmDelete) {
                  const result = await deletePromotion(confirmDelete.id);
                  if (result.ok) toast.success("Promotion deleted");
                  else toast.error("Promotion delete failed", { description: result.error });
                }
                setConfirmDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function PromotionFormDialog({
  mode,
  promo,
  categories,
  nextSort,
  onClose,
  onCreate,
  onSave,
}: {
  mode: "create" | "edit";
  promo?: Promotion;
  categories: string[];
  nextSort: number;
  onClose: () => void;
  onCreate: (data: Omit<Promotion, "id">) => Promise<void>;
  onSave: (id: string, patch: Partial<Omit<Promotion, "id">>) => Promise<void>;
}) {
  const [label, setLabel] = useState(promo?.label ?? "");
  const [headline, setHeadline] = useState(promo?.headline ?? "");
  const [imageUrl, setImageUrl] = useState(promo?.imageUrl ?? "");
  const [bgColor, setBgColor] = useState(promo?.bgColor ?? PALETTE[0].value);
  const [chipStyle, setChipStyle] = useState<"light" | "dark">(promo?.chipStyle ?? "light");
  const [linkCategory, setLinkCategory] = useState(promo?.linkCategory ?? "");
  const [sortOrder, setSortOrder] = useState<number>(promo?.sortOrder ?? nextSort);
  const [isActive, setIsActive] = useState<boolean>(promo?.isActive ?? true);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    const cleanLabel = label.trim();
    const cleanHead = headline.trim();
    if (!cleanLabel || !cleanHead) {
      toast.error("Label and headline are required");
      return;
    }
    const data: Omit<Promotion, "id"> = {
      label: cleanLabel,
      headline: cleanHead,
      imageUrl: imageUrl.trim(),
      bgColor,
      chipStyle,
      linkCategory: linkCategory || "",
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      isActive,
    };
    setSaving(true);
    try {
      if (mode === "edit" && promo) await onSave(promo.id, data);
      else await onCreate(data);
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black/40 transition";

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg w-[calc(100vw-1rem)] sm:w-full max-h-[calc(100dvh-1rem)] sm:max-h-[min(90dvh,720px)] p-0 gap-0 flex flex-col">
        <DialogHeader className="px-5 sm:px-6 pt-5 sm:pt-6 pb-3 shrink-0 border-b border-black/5">
          <DialogTitle style={{ ...dmSans, fontWeight: 400, letterSpacing: "-0.02em" }}>
            {mode === "create" ? "New promotion" : "Edit promotion"}
          </DialogTitle>
          <DialogDescription>
            Promotional card shown above “Shop by room” on the home page.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4 overflow-y-auto px-5 sm:px-6 py-4 flex-1 min-h-0" style={inter}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.18em] text-black/60">Label / chip</span>
              <input
                autoFocus
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className={inputCls + " mt-1"}
                placeholder="e.g. TOWELS"
              />
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.18em] text-black/60">Headline</span>
              <input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className={inputCls + " mt-1"}
                placeholder="e.g. UP to 40% OFF"
              />
            </label>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-[0.18em] text-black/60">Image</span>
            <div className="mt-1.5">
              <PromotionImageUploader value={imageUrl} onChange={setImageUrl} />
            </div>
            <div className="mt-1 text-[11px] text-black/50">
              Small product image shown on the right of the card. Auto-resized and optimised on upload.
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-[0.18em] text-black/60">Background</span>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {PALETTE.map((c) => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => setBgColor(c.value)}
                  className={`w-8 h-8 rounded-full border-2 transition ${
                    bgColor === c.value ? "border-black scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c.value }}
                  aria-label={c.label}
                  title={c.label}
                />
              ))}
              <label className="inline-flex items-center gap-2 border border-black/15 rounded-lg px-2 py-1 text-xs">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-6 h-6 cursor-pointer"
                />
                <span className="text-black/60">Custom</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.18em] text-black/60">Chip style</span>
              <select
                value={chipStyle}
                onChange={(e) => setChipStyle(e.target.value as "light" | "dark")}
                className={inputCls + " mt-1"}
              >
                <option value="light">Light (white)</option>
                <option value="dark">Dark (black)</option>
              </select>
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.18em] text-black/60">Links to</span>
              <select
                value={linkCategory}
                onChange={(e) => setLinkCategory(e.target.value)}
                className={inputCls + " mt-1"}
              >
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.18em] text-black/60">Sort order</span>
              <input
                type="number"
                value={Number.isFinite(sortOrder) ? sortOrder : ""}
                onChange={(e) =>
                  setSortOrder(e.target.value === "" ? 0 : Number(e.target.value))
                }
                className={inputCls + " mt-1"}
              />
            </label>
          </div>

          <label className="inline-flex items-center gap-2 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 accent-black"
            />
            <span className="text-sm">Active (visible on storefront)</span>
          </label>

          {/* Preview */}
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-black/60 mb-1.5">Preview</div>
            <div
              className="rounded-xl p-5 flex items-center gap-4 min-h-[130px]"
              style={{ backgroundColor: bgColor }}
            >
              <div className="flex-1 min-w-0">
                <span
                  className={`inline-block text-[10px] tracking-[0.15em] px-2 py-1 rounded-md ${
                    chipStyle === "dark" ? "bg-black text-white" : "bg-white text-black"
                  }`}
                  style={{ ...inter, fontWeight: 600 }}
                >
                  {label || "LABEL"}
                </span>
                <div
                  className="mt-2 text-black whitespace-nowrap"
                  style={{ ...dmSans, fontWeight: 500, letterSpacing: "-0.02em", fontSize: 22 }}
                >
                  {headline || "UP to XX% OFF"}
                </div>
              </div>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt=""
                  className="w-20 h-20 rounded-lg object-cover shrink-0"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-white/60 grid place-items-center shrink-0">
                  <ImageIcon className="w-5 h-5 text-black/40" />
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-2 sticky bottom-0 -mx-5 sm:-mx-6 px-5 sm:px-6 py-3 bg-white border-t border-black/5 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-black/15 text-[11px] uppercase tracking-[0.18em] hover:bg-black/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !label.trim() || !headline.trim()}
              className="px-5 py-2 rounded-full bg-black text-white text-[11px] uppercase tracking-[0.18em] hover:bg-black/85 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {saving ? "Saving..." : mode === "create" ? "Create" : "Save"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
