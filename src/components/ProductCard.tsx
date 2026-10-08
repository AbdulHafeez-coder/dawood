import { memo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, X } from "lucide-react";
import type { Product } from "@/lib/shop";
import { formatPKR } from "@/lib/format";
import { StoreImage } from "./StoreImage";
type Props = {
  product: Product;
  isFavourite: boolean;
  onToggleFav: (p: Product) => void;
  favAction?: "heart" | "remove";
};
export const ProductCard = memo(function ProductCard({
  product: p,
  isFavourite,
  onToggleFav,
  favAction = "heart",
}: Props) {
  const second = p.gallery?.find((src) => src && src !== p.img);
  const [hovered, setHovered] = useState(false),
    [loaded, setLoaded] = useState(false),
    [failed, setFailed] = useState(false);
  const name = p.display_name || p.name;
  return (
    <article
      className="dm-product"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setHovered(true);
      }}
    >
      <div className="dm-product-photo">
        <Link to="/product/$id" params={{ id: p.slug || p.id }} aria-label={name}>
          <StoreImage src={p.img} alt={name} loading="lazy" className="dm-primary" />
          {hovered && second && !failed && (
            <StoreImage
              key={second}
              src={second}
              alt=""
              className={`dm-secondary ${loaded ? "is-loaded" : ""}`}
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
            />
          )}
        </Link>
        <button
          className="dm-icon dm-save"
          onClick={() => onToggleFav(p)}
          aria-label={
            favAction === "remove" || isFavourite ? "Remove from favourites" : "Save to favourites"
          }
          aria-pressed={isFavourite}
        >
          {favAction === "remove" ? (
            <X size={19} />
          ) : (
            <Heart size={19} fill={isFavourite ? "currentColor" : "none"} />
          )}
        </button>
        {p.in_stock === false && <span className="dm-stock-label">Out of stock</span>}
      </div>
      <div className="dm-product-info">
        <Link to="/product/$id" params={{ id: p.slug || p.id }} className="dm-product-name">
          {name}
        </Link>
        <div className="dm-price">
          <strong>{formatPKR(p.price)}</strong>
          {p.original_price && p.original_price > p.price ? (
            <del>{formatPKR(p.original_price)}</del>
          ) : null}
        </div>
        <Link to="/product/$id" params={{ id: p.slug || p.id }} className="dm-product-action">
          {p.in_stock === false ? "View details" : "Choose options"}
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
});
