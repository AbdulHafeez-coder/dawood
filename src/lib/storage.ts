import { supabase } from "@/lib/supabase";

export const PRODUCT_IMAGES_BUCKET = "product-images";

function extFromType(type: string, fallback = "jpg"): string {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
    "image/avif": "avif",
  };
  return map[type] ?? fallback;
}

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Upload a product image to Supabase Storage and return its public URL.
 * Requires the caller to be a signed-in admin (enforced by RLS on
 * storage.objects for the `product-images` bucket).
 */
export async function uploadProductImage(file: File): Promise<string> {
  const ext = extFromType(file.type, (file.name.split(".").pop() || "jpg").toLowerCase());
  const path = `${new Date().getFullYear()}/${randomId()}.${ext}`;

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type || undefined,
    });
  if (error) throw error;

  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Upload with real progress via a signed upload URL + XHR.
 * onProgress receives a 0..1 fraction while bytes are uploading.
 */
export async function uploadProductImageWithProgress(
  file: File,
  onProgress: (fraction: number) => void,
  signal?: AbortSignal,
): Promise<string> {
  const ext = extFromType(file.type, (file.name.split(".").pop() || "jpg").toLowerCase());
  const path = `${new Date().getFullYear()}/${randomId()}.${ext}`;

  const { data: signed, error: signErr } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .createSignedUploadUrl(path);
  if (signErr || !signed) throw signErr ?? new Error("Could not create upload URL");

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signed.signedUrl, true);
    if (file.type) xhr.setRequestHeader("Content-Type", file.type);
    xhr.setRequestHeader("cache-control", "max-age=31536000");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.min(1, e.loaded / e.total));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(1);
        resolve();
      } else {
        let msg = `Upload failed (${xhr.status})`;
        try {
          const body = JSON.parse(xhr.responseText);
          if (body?.message) msg = body.message;
        } catch {
          if (xhr.responseText) msg = xhr.responseText.slice(0, 200);
        }
        reject(new Error(msg));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.ontimeout = () => reject(new Error("Upload timed out"));
    if (signal) {
      if (signal.aborted) {
        xhr.abort();
        reject(new DOMException("Upload cancelled", "AbortError"));
        return;
      }
      signal.addEventListener("abort", () => {
        xhr.abort();
        reject(new DOMException("Upload cancelled", "AbortError"));
      });
    }
    xhr.send(file);
  });

  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(signed.path);
  return data.publicUrl;

/**
 * Best-effort deletion of a previously uploaded product image by its public
 * URL. Silently no-ops for external / preset URLs.
 */
export async function deleteProductImageByUrl(url: string): Promise<void> {
  if (!url) return;
  const marker = `/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = url.slice(idx + marker.length).split("?")[0];
  if (!path) return;
  await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([path]);
}
