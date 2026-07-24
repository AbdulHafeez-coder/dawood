import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { UploadCloud, Image as ImageIcon, X, Loader2, Crop as CropIcon } from "lucide-react";
import Cropper, { type Area } from "react-easy-crop";
import { uploadProductImageWithProgress } from "@/lib/storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const ACCEPTED = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
const MAX_BYTES = 3 * 1024 * 1024;
const MAX_DIM = 800;
const OUT_QUALITY = 0.85;

type AspectKey = "1:1" | "4:3" | "16:9" | "free";
const ASPECTS: { key: AspectKey; label: string; value: number | undefined }[] = [
  { key: "1:1", label: "Square", value: 1 },
  { key: "4:3", label: "4:3", value: 4 / 3 },
  { key: "16:9", label: "16:9", value: 16 / 9 },
  { key: "free", label: "Free", value: undefined },
];

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("Could not read file"));
    r.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("Could not decode image"));
    i.src = src;
  });
}

async function cropAndResize(
  src: string,
  area: Area,
  outType: "image/webp" | "image/png",
): Promise<Blob> {
  const img = await loadImage(src);
  // Guard against fractional / out-of-bounds boxes from the cropper.
  const sx = Math.max(0, Math.round(area.x));
  const sy = Math.max(0, Math.round(area.y));
  const sw = Math.max(1, Math.round(area.width));
  const sh = Math.max(1, Math.round(area.height));

  const scale = Math.min(1, MAX_DIM / Math.max(sw, sh));
  const dw = Math.max(1, Math.round(sw * scale));
  const dh = Math.max(1, Math.round(sh * scale));

  const canvas = document.createElement("canvas");
  canvas.width = dw;
  canvas.height = dh;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, outType, OUT_QUALITY),
  );
  if (!blob) throw new Error("Could not encode image");
  return blob;
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
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"idle" | "processing" | "uploading" | "finalizing">("idle");
  const [cropSrc, setCropSrc] = useState<string>("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  function resetUploadState() {
    setBusy(false);
    setPhase("idle");
    setProgress(0);
    abortRef.current = null;
  }

  function cancelUpload() {
    abortRef.current?.abort();
  }

  function pickFile(file: File | null | undefined) {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Unsupported file", { description: "Use PNG, JPG, WEBP, or GIF." });
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("File too large", {
        description: `Max ${(MAX_BYTES / 1024 / 1024).toFixed(0)} MB. Yours is ${(file.size / 1024 / 1024).toFixed(2)} MB.`,
      });
      return;
    }
    // GIFs: skip crop (would lose animation), upload as-is
    if (file.type === "image/gif") {
      uploadWithProgress(file, "Image uploaded");
      return;
    }
    readAsDataURL(file)
      .then((url) => {
        setPendingFile(file);
        setCropSrc(url);
      })
      .catch(() => toast.error("Could not read file"));
  }

  async function uploadWithProgress(file: File, successTitle: string, successDescription?: string) {
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);
    setProgress(0);
    setPhase("uploading");
    const toastId = toast.loading("Uploading image…", {
      description: `${file.name} · 0%`,
    });
    try {
      const url = await uploadProductImageWithProgress(
        file,
        (fraction) => {
          const pct = Math.round(fraction * 100);
          setProgress(pct);
          toast.loading("Uploading image…", {
            id: toastId,
            description: `${file.name} · ${pct}%`,
          });
          if (fraction >= 1) setPhase("finalizing");
        },
        controller.signal,
      );
      onChange(url);
      toast.success(successTitle, {
        id: toastId,
        description: successDescription ?? file.name,
      });
      return true;
    } catch (err) {
      const aborted =
        (err instanceof DOMException && err.name === "AbortError") ||
        (err instanceof Error && /aborted|cancel/i.test(err.message));
      if (aborted) {
        toast.warning("Upload cancelled", { id: toastId, description: file.name });
      } else {
        toast.error("Could not upload image", {
          id: toastId,
          description: err instanceof Error ? err.message : "Upload failed. Check your connection and try again.",
          action: {
            label: "Retry",
            onClick: () => void uploadWithProgress(file, successTitle, successDescription),
          },
        });
      }
      return false;
    } finally {
      resetUploadState();
    }
  }

  async function handleCropConfirm(area: Area) {
    if (!pendingFile || !cropSrc) return;
    setBusy(true);
    setPhase("processing");
    setProgress(0);
    const outType: "image/webp" | "image/png" =
      pendingFile.type === "image/png" ? "image/png" : "image/webp";
    try {
      const blob = await cropAndResize(cropSrc, area, outType);
      const ext = outType === "image/png" ? "png" : "webp";
      const cropped = new File(
        [blob],
        pendingFile.name.replace(/\.[^.]+$/, "") + `.${ext}`,
        { type: outType },
      );
      const saved = pendingFile.size - cropped.size;
      const desc =
        saved > 1024
          ? `Cropped and optimised — saved ${(saved / 1024).toFixed(0)} KB`
          : "Cropped and optimised";
      const ok = await uploadWithProgress(cropped, "Image uploaded", desc);
      if (ok) {
        setCropSrc("");
        setPendingFile(null);
      }
    } catch (err) {
      toast.error("Could not process image", {
        description: err instanceof Error ? err.message : "Try a different image.",
      });
      resetUploadState();
    }
  }

  return (
    <>
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
            pickFile(e.dataTransfer.files?.[0]);
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
          <div className="flex flex-col items-center gap-2 text-black/60 w-full">
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
            <div className="text-sm">
              <span className="font-medium text-black">
                {busy
                  ? phase === "processing"
                    ? "Processing…"
                    : phase === "finalizing"
                      ? "Finalizing…"
                      : `Uploading… ${progress}%`
                  : "Drop an image"}
              </span>{" "}
              {!busy && "or click to browse"}
            </div>
            {busy ? (
              <div className="w-full max-w-[220px] mt-1">
                <div className="h-1.5 rounded-full bg-black/10 overflow-hidden">
                  <div
                    className="h-full bg-black transition-[width] duration-150"
                    style={{
                      width: phase === "processing" ? "100%" : `${progress}%`,
                      opacity: phase === "processing" ? 0.35 : 1,
                    }}
                  />
                </div>
                {phase === "uploading" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelUpload();
                    }}
                    className="mt-2 text-[10px] uppercase tracking-[0.16em] text-black/55 hover:text-red-600"
                  >
                    Cancel upload
                  </button>
                )}
              </div>
            ) : (
              <div className="text-[11px] text-black/45">
                PNG, JPG, WEBP, GIF · up to 3 MB · crop before saving
              </div>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            className="hidden"
            onChange={(e) => {
              pickFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
        <div className="w-full sm:w-40 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-[0.18em] text-black/45">Preview</span>
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
            {value ? (
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-6 h-6 text-black/25" />
            )}
            {busy && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-white/70 backdrop-blur-[1px]">
                <Loader2 className="w-5 h-5 animate-spin text-black/70" />
                <span className="text-[10px] tabular-nums text-black/70">
                  {phase === "processing" ? "…" : `${progress}%`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <CropDialog
        src={cropSrc}
        open={!!cropSrc}
        busy={busy}
        progress={progress}
        phase={phase}
        onCancelUpload={cancelUpload}
        onCancel={() => {
          if (busy) return;
          setCropSrc("");
          setPendingFile(null);
        }}
        onConfirm={handleCropConfirm}
    </>
  );
}
  );
}

function CropDialog({
  src,
  open,
  busy,
  onCancel,
  onConfirm,
}: {
  src: string;
  open: boolean;
  busy: boolean;
  onCancel: () => void;
  onConfirm: (area: Area) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspectKey, setAspectKey] = useState<AspectKey>("1:1");
  const [pixels, setPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setPixels(areaPixels);
  }, []);

  const aspect = ASPECTS.find((a) => a.key === aspectKey)?.value;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CropIcon className="w-4 h-4" /> Crop image
          </DialogTitle>
          <DialogDescription>
            Adjust the framing and choose an aspect ratio so all promotion cards look consistent.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {ASPECTS.map((a) => (
              <button
                key={a.key}
                type="button"
                onClick={() => {
                  setAspectKey(a.key);
                  // Reset framing when aspect switches
                  setCrop({ x: 0, y: 0 });
                  setZoom(1);
                }}
                className={`px-3 py-1.5 rounded-full text-[11px] uppercase tracking-[0.16em] border transition ${
                  aspectKey === a.key
                    ? "bg-black text-white border-black"
                    : "border-black/15 text-black/70 hover:border-black/40"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>

          <div className="relative w-full h-[320px] bg-black/85 rounded-xl overflow-hidden">
            {src && (
              <Cropper
                image={src}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                restrictPosition
                showGrid
              />
            )}
          </div>

          <label className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.18em] text-black/60 w-12">Zoom</span>
            <input
              type="range"
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-black"
            />
            <span className="text-[11px] tabular-nums text-black/60 w-10 text-right">
              {zoom.toFixed(2)}×
            </span>
          </label>
        </div>

        <DialogFooter className="pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 rounded-full border border-black/15 text-[11px] uppercase tracking-[0.18em] hover:bg-black/5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!pixels || busy}
            onClick={() => pixels && onConfirm(pixels)}
            className="px-5 py-2 rounded-full bg-black text-white text-[11px] uppercase tracking-[0.18em] hover:bg-black/85 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none inline-flex items-center gap-2"
          >
            {busy ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…
              </>
            ) : (
              "Apply & upload"
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
