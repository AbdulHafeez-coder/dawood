import { memo } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Plus, Star, X } from "lucide-react";
import { getVariants, type Category, type Product } from "@/lib/shop";
import { formatPKR } from "@/lib/format";

type Props = {
  product: Product;
  isFavourite: boolean;
  onToggleFav: (p: Product) => void;
  /** "heart" toggles favourite state; "remove" always removes (used on favourites page) */
  favAction?: "heart" | "remove";
};

function ProductCardImpl({ product: p, isFavourite, onToggleFav, favAction = "heart" }: Props) {
  const v = getVariants(p.category as Category);
  const colors = v.colors.slice(0, 4);
  const extraColors = Math.max(0, v.colors.length - colors.length);
  const sizes = v.sizes.slice(0, 3);

  return (
    <div className="bg-white rounded-2xl overflow-hidden flex flex-col h-full group relative">
      <Link
        to="/product/$id"
        params={{ id: p.id }}
        className={`${p.bg} relative aspect-square overflow-hidden block`}
      >
        <span className="absolute top-4 left-4 z-10 bg-black text-white text-xs px-3 py-1 rounded-full">
          {p.tag}
        </span>
        <span className="absolute bottom-4 left-4 z-10 bg-white/85 text-black text-[11px] px-2 py-1 rounded-full">
          {p.category}
        </span>
        <img
          src={p.img}
          alt={p.name}
          width={1024}
          height={1024}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>
      <button
        onClick={() => onToggleFav(p)}
        aria-label={
          favAction === "remove"
            ? "Remove from favourites"
            : isFavourite
              ? "Remove from favourites"
              : "Add to favourites"
        }
        aria-pressed={favAction === "heart" ? isFavourite : undefined}
        className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition-colors shadow-sm"
      >
        {favAction === "remove" ? (
          <X size={16} className="text-black" />
        ) : (
          <Heart size={16} className={isFavourite ? "fill-black text-black" : "text-black/60"} />
        )}
      </button>
      <div className="p-4 sm:p-5 flex flex-col gap-2.5 flex-1">
        <div className="min-w-0">
          <Link
            to="/product/$id"
            params={{ id: p.id }}
            className="type-title text-black hover:underline block truncate"
            title={p.name}
          >
            {p.name}
          </Link>
          <div className="flex items-center gap-1 mt-1 text-black/60 text-xs">
            <Star size={12} className="fill-black text-black" /> {p.rating}
          </div>
        </div>

        <div className="type-price text-black">{formatPKR(p.price)}</div>

        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1.5 min-h-[20px]" aria-label="Available colours">
          {colors.map((c) => {
            const isGradient = c.swatch.startsWith("linear-gradient");
            return (
              <span
                key={c.id}
                title={c.label}
                className="h-4 w-4 sm:h-[18px] sm:w-[18px] rounded-full border border-black/15 ring-1 ring-white shrink-0"
                style={isGradient ? { backgroundImage: c.swatch } : { backgroundColor: c.swatch }}
              />
            );
          })}
          {extraColors > 0 && (
            <span className="text-[11px] leading-none text-black/50 ml-0.5 shrink-0">+{extraColors}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1.5 min-h-[22px]" aria-label="Available sizes">
          {sizes.map((s) => (
            <span
              key={s.id}
              title={s.note ?? s.label}
              className="text-[10px] uppercase tracking-wider text-black/70 border border-black/15 rounded-full px-1.5 py-0.5 leading-none shrink-0 max-w-full truncate"
            >
              {s.label.length > 6 ? s.label.slice(0, 4) : s.label}
            </span>
          ))}
        </div>

        <Link
          to="/product/$id"
          params={{ id: p.id }}
          className="mt-auto inline-flex items-center justify-center gap-2 bg-black text-white rounded-md h-11 text-sm hover:bg-black/85 transition-colors"
          style={{ fontWeight: 500 }}
        >
          {favAction === "remove" ? (
            <>
              <Plus size={16} /> Choose options
            </>
          ) : (
            <>
              Choose options <Plus size={16} />
            </>
          )}
        </Link>
      </div>
    </div>
  );
}

export const ProductCard = memo(ProductCardImpl);
