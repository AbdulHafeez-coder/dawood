import { supabase } from "@/lib/supabase";

export const PRODUCT_IMAGES_BUCKET = "product-images";

export const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
];

export const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/ogg",
  "video/x-matroska",
  "video/x-msvideo",
];

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB per image
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB per video

function extFromType(type: string, fallback = "jpg"): string {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
    "image/avif": "avif",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
    "video/ogg": "ogg",
    "video/x-matroska": "mkv",
    "video/x-msvideo": "avi",
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

  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, file, {
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
}

/**
 * Upload a product video to Supabase Storage with optional progress reporting.
 */
export async function uploadProductVideo(
  file: File,
  onProgress?: (fraction: number) => void,
  signal?: AbortSignal,
): Promise<string> {
  const ext = extFromType(file.type, (file.name.split(".").pop() || "mp4").toLowerCase());
  const path = `videos/${new Date().getFullYear()}/${randomId()}.${ext}`;

  if (onProgress) {
    try {
      const { data: signed, error: signErr } = await supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .createSignedUploadUrl(path);

      if (!signErr && signed) {
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
          xhr.onerror = () => reject(new Error("Network error during video upload"));
          xhr.ontimeout = () => reject(new Error("Video upload timed out"));
          if (signal) {
            signal.addEventListener("abort", () => {
              xhr.abort();
              reject(new DOMException("Upload cancelled", "AbortError"));
            });
          }
          xhr.send(file);
        });

        const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(signed.path);
        return data.publicUrl;
      }
    } catch {
      // Fall through to standard upload if signed upload fails
    }
  }

  // Standard direct upload
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || "video/mp4",
  });
  if (error) throw error;

  if (onProgress) onProgress(1);
  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Best-effort deletion of a previously uploaded product image or video by its public
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

export const deleteProductMediaByUrl = deleteProductImageByUrl;
