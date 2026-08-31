import { useState, useEffect, type ImgHTMLAttributes, type ReactElement } from "react";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";

// Statically import all product images so Vite bundles them natively
const productImages = import.meta.glob("/public/images/products/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
  query: "?url",
}) as Record<string, string>;

function getResolvedSrc(src?: string): string {
  if (!src) return "";
  if (src.startsWith("/images/products/")) {
    const filename = src.split("/").pop();
    if (filename) {
      for (const [path, url] of Object.entries(productImages)) {
        if (path.endsWith(`/${filename}`)) return url;
      }
    }
  }
  return src;
}

export interface SafeImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export function SafeImage({
  src,
  fallbackSrc = PLACEHOLDER_IMAGE,
  alt = "",
  className = "",
  onError,
  ...props
}: SafeImageProps): ReactElement {
  const [imgSrc, setImgSrc] = useState<string>(getResolvedSrc(src) || fallbackSrc);

  useEffect(() => {
    setImgSrc(getResolvedSrc(src) || fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <img
      {...props}
      src={imgSrc || fallbackSrc}
      alt={alt}
      className={className}
      onError={(e) => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
        if (onError) {
          onError(e);
        }
      }}
    />
  );
}
