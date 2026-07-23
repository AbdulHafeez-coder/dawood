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
