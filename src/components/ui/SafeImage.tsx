import { useState, useEffect, type ImgHTMLAttributes, type ReactElement } from "react";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";

// Public assets are served directly; do not eagerly import the entire image library.
function getResolvedSrc(src?: string): string { return src || ""; }

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
      srcSet={imgSrc === fallbackSrc ? undefined : props.srcSet}
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
