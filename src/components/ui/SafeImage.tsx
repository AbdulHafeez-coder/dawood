import { useState, useEffect, type ImgHTMLAttributes, type ReactElement } from "react";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";

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
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);

  useEffect(() => {
    setImgSrc(src || fallbackSrc);
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
