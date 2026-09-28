import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ShoppingBag, Heart, MessageCircle } from "lucide-react";
import { getProductAsync, useCart, useFavourites } from "@/lib/shop";
import { normalizeStatus, STATUS_LABELS } from "@/lib/catalog-model";
import { useCatalog } from "@/lib/use-catalog";
import { buildWhatsappProductRequest } from "@/lib/whatsapp";
import { formatPKR } from "@/lib/format";
import { SafeImage } from "@/components/ui/SafeImage";
import { ProductCard } from "@/components/ProductCard";
import { LazyCartDrawer } from "@/components/LazyCartDrawer";
import { SiteFooter } from "@/components/SiteFooter";
export const Route = createFileRoute("/product/$id")({
  loader: async ({ params }) => {
    const product = await getProductAsync(params.id);
    if (!product) throw notFound();
    if (product.slug && params.id !== product.slug)
      throw redirect({ to: "/product/$id", params: { id: product.slug }, statusCode: 301 });
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    const title = p?.seo_title || `${p?.name || "Product"} — Dawood Mart`;
    const description =
      p?.seo_description ||
      p?.description?.slice(0, 160) ||
      p?.tagline ||
      "Home essentials from Dawood Mart, Pakistan.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        ...(p?.img ? [{ property: "og:image", content: p.img }] : []),
      ],
      links: p
        ? [
            {
              rel: "canonical",
              href: `https://dawood-virid.vercel.app/product/${encodeURIComponent(p.slug || p.id)}`,
            },
          ]
        : [],
    };
  },
  notFoundComponent: () => (
    <div className="p-12 text-center">
      <h1 className="text-2xl">Product not found</h1>
      <Link to="/" className="mt-4 inline-block underline">
        Browse the catalog
      </Link>
    </div>
  ),
  errorComponent: () => (
    <div role="alert" className="p-12 text-center">
      <h1 className="text-2xl">Unable to load this product</h1>
      <button onClick={() => window.location.reload()} className="m-4 underline">
        Try again
      </button>
      <Link to="/">Back to catalog</Link>
    </div>
  ),
  component: ProductRoute,
});
function ProductRoute() {
  const { product } = Route.useLoaderData();
  return <ProductDetail key={product.id} />;
}

function ProductDetail() {
  const { product: p } = Route.useLoaderData();
  const [image, setImage] = useState(""),
    [qty, setQty] = useState(1),
    [cartOpen, setCartOpen] = useState(false);
  const { addToCart, cartCount } = useCart();
  const { toggleFav, isFav } = useFavourites();
  const status = normalizeStatus(p.status);
  const related = useCatalog({ category: p.category, pageSize: 5 });
  const gallery = Array.from(new Set([p.img, ...p.gallery])).filter(Boolean);
  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <ArrowLeft size={18} />
            Dawood Mart
          </Link>
          <button
            onClick={() => setCartOpen(true)}
            aria-label="Open cart"
            className="flex items-center gap-2"
          >
            <ShoppingBag size={20} />
            {cartCount}
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap gap-2 text-xs text-stone-500">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>{p.category}</span>
          <span>/</span>
          <span>{p.name}</span>
        </nav>
        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          <section aria-label="Product images">
            <div className="aspect-square overflow-hidden rounded-3xl border bg-white">
              <SafeImage
                src={image || p.img}
                alt={p.name}
                width={900}
                height={900}
                loading="eager"
                className="h-full w-full object-contain p-5"
              />
            </div>
            {gallery.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {gallery.map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setImage(src)}
                    aria-label={`View image ${i + 1}`}
                    aria-pressed={(image || p.img) === src}
                    className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-white"
                  >
                    <SafeImage
                      src={src}
                      alt={`${p.name}, view ${i + 1}`}
                      width={100}
                      height={100}
                      loading="lazy"
                      className="h-full w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>
          <section>
            <p className="text-xs uppercase tracking-widest text-emerald-800">
              {p.category}
              {p.subCategory ? ` / ${p.subCategory}` : ""}
            </p>
            <h1 className="mt-3 text-2xl font-semibold leading-tight sm:text-3xl">{p.name}</h1>
            <p className="mt-4 text-2xl font-bold">{formatPKR(p.price)}</p>
            <p className="mt-2 text-sm font-medium text-emerald-800">{STATUS_LABELS[status]}</p>
            <p className="mt-2 break-all text-xs text-stone-500">Product ID: {p.id}</p>
            {p.description && (
              <p className="mt-6 whitespace-pre-line text-sm leading-7 text-stone-600">
                {p.description}
              </p>
            )}
            <div className="mt-6 space-y-3">
              {status === "available" ? (
                <>
                  <label className="flex items-center gap-4 text-sm">
                    Quantity
                    <input
                      aria-label="Quantity"
                      type="number"
                      min={1}
                      max={99}
                      value={qty}
                      onChange={(e) =>
                        setQty(Math.max(1, Math.min(99, Math.floor(Number(e.target.value) || 1))))
                      }
                      className="h-11 w-20 rounded-lg border bg-white px-3"
                    />
                  </label>
                  <button
                    onClick={() => {
                      addToCart(p, qty);
                      setCartOpen(true);
                    }}
                    className="min-h-12 w-full rounded-xl bg-emerald-900 px-6 py-3 font-semibold text-white"
                  >
                    Add to cart
                  </button>
                </>
              ) : status === "on_demand" || status === "sold_out" ? (
                <>
                  <p className="text-sm text-stone-600">
                    Request this item and our team will confirm availability.
                  </p>
                  <a
                    href={buildWhatsappProductRequest(p).url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-900 px-4 py-3 font-semibold text-white"
                  >
                    <MessageCircle size={19} />
                    Request this product
                  </a>
                </>
              ) : (
                <button disabled className="w-full rounded-xl bg-stone-200 py-3 text-stone-500">
                  Coming soon
                </button>
              )}
              <button
                onClick={() => toggleFav(p)}
                aria-pressed={isFav(p.id)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm"
              >
                <Heart size={17} className={isFav(p.id) ? "fill-rose-600 text-rose-600" : ""} />
                {isFav(p.id) ? "Saved to favourites" : "Save to favourites"}
              </button>
            </div>
            {p.details.filter((d) => !/^brand:/i.test(d)).length > 0 && (
              <div className="mt-8 border-t pt-5">
                <h2 className="font-semibold">Product details</h2>
                <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-stone-600">
                  {p.details
                    .filter((d) => !/^brand:/i.test(d))
                    .map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                </ul>
              </div>
            )}
          </section>
        </div>
        {related.products.some((item) => item.id !== p.id) && (
          <section className="mt-14">
            <h2 className="mb-5 text-xl font-semibold">More to explore</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {related.products
                .filter((item) => item.id !== p.id)
                .slice(0, 4)
                .map((item) => (
                  <ProductCard
                    key={item.id}
                    product={item}
                    isFavourite={isFav(item.id)}
                    onToggleFav={toggleFav}
                  />
                ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
      <LazyCartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
