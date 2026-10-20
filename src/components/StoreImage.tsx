import { SafeImage } from "./ui/SafeImage";
import type { ComponentProps } from "react";
export function StoreImage({
  src,
  sizes = "(max-width: 639px) 46vw, (max-width: 1023px) 31vw, 23vw",
  ...props
}: ComponentProps<typeof SafeImage>) {
  const resize = (width: number) => {
    try {
      const url = new URL(src || "");
      if (url.hostname === "cdn.shopify.com") {
        url.searchParams.set("width", String(width));
        return url.href;
      }
    } catch {
      /* local asset */
    }
    return src;
  };
  return (
    <SafeImage
      {...props}
      src={resize(640)}
      srcSet={
        resize(480) !== src
          ? [240, 480, 640, 960].map((w) => `${resize(w)} ${w}w`).join(", ")
          : undefined
      }
      sizes={sizes}
      width={800}
      height={800}
      decoding="async"
    />
  );
}
