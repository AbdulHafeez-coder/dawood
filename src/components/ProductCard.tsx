import { memo } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle } from "lucide-react";
import { SafeImage } from "./ui/SafeImage";
import type { Product } from "@/lib/types";
import { normalizeStatus, STATUS_LABELS, isStorefrontVisible } from "@/lib/catalog-model";
import { formatPKR } from "@/lib/format";
import { buildWhatsappProductRequest } from "@/lib/whatsapp";

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
}: Props) {
  const status = normalizeStatus(p.status);
  if (!isStorefrontVisible(p)) return null;
  return (
    <article
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white"
      data-testid="product-card"
    >
      <div className="relative aspect-square bg-stone-100">
        <Link to="/product/$id" params={{ id: p.slug || p.id }} className="block h-full">
          <SafeImage
            src={p.img}
            alt={p.name}
            width={480}
            height={480}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain p-3 transition-transform group-hover:scale-105"
          />
        </Link>
        <button
          onClick={() => onToggleFav(p)}
          aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
          aria-pressed={isFavourite}
          className="absolute right-2 top-2 grid h-10 w-10 place-items-center rounded-full bg-white/95 shadow-sm"
        >
          <Heart
            size={18}
            className={isFavourite ? "fill-rose-600 text-rose-600" : "text-stone-500"}
          />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <Link
          to="/product/$id"
          params={{ id: p.slug || p.id }}
          className="line-clamp-2 min-h-10 text-sm font-medium leading-5 text-stone-900"
        >
          {p.name}
        </Link>
        <p className="text-base font-bold text-stone-950">{formatPKR(p.price)}</p>
        <p
          className={`text-xs font-medium ${status === "available" ? "text-emerald-700" : "text-stone-600"}`}
        >
          {STATUS_LABELS[status]}
        </p>
        {status === "on_demand" || status === "sold_out" ? (
          <a
            href={buildWhatsappProductRequest(p).url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto flex min-h-10 items-center justify-center gap-1 rounded-lg border border-emerald-700 px-2 text-center text-xs font-semibold text-emerald-800"
          >
            <MessageCircle size={14} />
            Request this product
          </a>
        ) : status === "available" ? (
          <Link
            to="/product/$id"
            params={{ id: p.slug || p.id }}
            className="mt-auto rounded-lg bg-emerald-800 px-2 py-3 text-center text-xs font-semibold text-white"
          >
            View & order
          </Link>
        ) : (
          <span className="mt-auto rounded-lg bg-stone-100 py-3 text-center text-xs text-stone-500">
            Coming soon
          </span>
        )}
      </div>
    </article>
  );
});
