import { useRef, useState } from "react";
import { toast } from "sonner";
import { UploadCloud, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { uploadProductImage } from "@/lib/storage";

const ACCEPTED = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
const MAX_BYTES = 3 * 1024 * 1024; // 3 MB source
const MAX_DIM = 800; // resize longest side to this
const OUT_QUALITY = 0.85;

async function resizeImage(file: File): Promise<File> {
  // SVGs and gifs: skip resize (preserve animation / vector)
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("Could not read file"));
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("Could not decode image"));
    i.src = dataUrl;
  });

  const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
  if (scale === 1 && file.size < 400 * 1024) return file; // already small enough

  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, w, h);

  const outType = file.type === "image/png" ? "image/png" : "image/webp";
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, outType, OUT_QUALITY),
  );
  if (!blob) return file;
  const ext = outType === "image/png" ? "png" : "webp";
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + `.${ext}`, { type: outType });
}

export function PromotionImageUploader({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [localPreview, setLocalPreview] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | null | undefined) {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Unsupported file", { description: "Use PNG, JPG, WEBP, or GIF." });
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("File too large", {
        description: `Max ${(MAX_BYTES / 1024 / 1024).toFixed(0)} MB. Yours is ${(
          file.size /
          1024 /
          1024
        ).toFixed(2)} MB.`,
      });
      return;
    }
    setBusy(true);
    // Show instant local preview
    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);
    try {
      const resized = await resizeImage(file);
      const url = await uploadProductImage(resized);
      onChange(url);
      const saved = file.size - resized.size;
      toast.success("Image uploaded", {
        description:
          saved > 1024
            ? `Optimised — saved ${(saved / 1024).toFixed(0)} KB`
            : file.name,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error("Could not upload image", { description: msg });
    } finally {
      URL.revokeObjectURL(preview);
      setLocalPreview("");
      setBusy(false);
    }
  }

  const shown = localPreview || value;

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => !busy && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !busy) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        aria-busy={busy}
        className={`flex-1 rounded-xl border-2 border-dashed transition grid place-items-center p-5 text-center ${
          busy ? "cursor-wait opacity-70" : "cursor-pointer"
        } ${
          dragging
            ? "border-black bg-black/[0.03]"
            : "border-black/15 hover:border-black/40 hover:bg-black/[0.02]"
        }`}
      >
        <div className="flex flex-col items-center gap-2 text-black/60">
          {busy ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <UploadCloud className="w-5 h-5" />
          )}
          <div className="text-sm">
            <span className="font-medium text-black">
              {busy ? "Uploading…" : "Drop an image"}
            </span>{" "}
            {!busy && "or click to browse"}
          </div>
          <div className="text-[11px] text-black/45">
            PNG, JPG, WEBP, GIF · up to 3 MB · auto-resized to {MAX_DIM}px
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      <div className="w-full sm:w-40 shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] uppercase tracking-[0.18em] text-black/45">
            Preview
          </span>
          {value && !busy && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-[10px] uppercase tracking-[0.16em] text-black/45 hover:text-red-600 inline-flex items-center gap-1"
              aria-label="Remove image"
            >
              <X className="w-3 h-3" /> Remove
            </button>
          )}
        </div>
        <div className="aspect-square rounded-xl overflow-hidden bg-black/5 border border-black/10 grid place-items-center relative">
          {shown ? (
            <img src={shown} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-6 h-6 text-black/25" />
          )}
          {busy && (
            <div className="absolute inset-0 grid place-items-center bg-white/60 backdrop-blur-[1px]">
              <Loader2 className="w-5 h-5 animate-spin text-black/70" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
