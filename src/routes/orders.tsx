import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ShoppingBag,
  MessageCircle,
  Trash2,
  ClipboardCopy,
  ScrollText,
  Check,
} from "lucide-react";
import { useCart } from "@/lib/shop";
import { useOrders, type SavedOrder } from "@/lib/orders";
import { LazyCartDrawer as CartDrawer } from "@/components/LazyCartDrawer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { SiteFooter } from "@/components/SiteFooter";
import { OrdersListSkeleton, useMounted } from "@/components/skeletons";
import { toast } from "sonner";
import { formatPKR } from "@/lib/format";
import { SafeImage } from "@/components/ui/SafeImage";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Your Orders — Dawood Mart" },
      {
        name: "description",
        content: "Review your WhatsApp order drafts and resend them in one click.",
      },
      { property: "og:title", content: "Your Orders — Dawood Mart" },
      {
        property: "og:description",
        content: "Review your WhatsApp order drafts and resend them in one click.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrdersPage,
});

const inter = { fontFamily: "'Inter', sans-serif" };

function formatDate(ts: number) {
  return new Date(ts).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function OrdersPage() {
  const { orders, removeOrder, clearOrders } = useOrders();
  const { cartCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const mounted = useMounted();

  const resend = (o: SavedOrder) => {
    window.open(o.url, "_blank", "noopener,noreferrer");
  };

  const copy = (o: SavedOrder) => {
    navigator.clipboard.writeText(o.message);
    setCopiedId(o.id);
    toast.success("Order message copied to clipboard");
    setTimeout(() => setCopiedId(null), 1800);
  };

  const remove = (o: SavedOrder) => {
    removeOrder(o.id);
    toast("Order removed from history");
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FEFDF9] pb-20 lg:pb-0" style={inter}>
      <nav className="sticky top-0 z-20 bg-[#FEFDF9]/90 backdrop-blur border-b border-black/5 flex items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
        <Link to="/" className="type-wordmark text-black">
          Dawood Mart
        </Link>
        <button aria-label="Cart" onClick={() => setCartOpen(true)} className="relative text-black">
          <ShoppingBag size={20} strokeWidth={1.5} />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[10px] font-medium min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </nav>

      <div className="px-4 sm:px-6 md:px-8 lg:px-10 pt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-black/70 hover:text-black"
        >
          <ArrowLeft size={16} /> Back to shop
        </Link>
      </div>

      <section className="px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 lg:py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 lg:mb-8">
          <div>
            <h1 className="type-h1 text-black flex items-center gap-3">
              <ScrollText size={22} /> Your Orders
            </h1>
            <p className="mt-2 text-black/60 text-sm max-w-md">
              Past WhatsApp order drafts saved on this device. Resend anytime in one click.
            </p>
          </div>
          {orders.length > 0 && (
            <button
              onClick={clearOrders}
              className="self-start sm:self-auto text-xs text-black/60 hover:text-red-600 underline cursor-pointer"
            >
              Clear order history
            </button>
          )}
        </div>

        {!mounted ? (
          <OrdersListSkeleton />
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl p-8 sm:p-12 text-center flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-black/5 flex items-center justify-center">
              <ScrollText size={20} className="text-black/50" />
            </div>
            <div className="type-h3 text-black">No saved orders</div>
            <p className="text-black/60 max-w-sm text-sm">
              When you send an order on WhatsApp, a copy will be saved here so you can review or
              re-order.
            </p>
            <Link
              to="/"
              className="mt-2 inline-flex items-center gap-2 bg-black text-white rounded-md h-9 px-4 text-sm"
              style={{ fontWeight: 500 }}
            >
              Explore the shop
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {orders.map((o) => {
              const isOpen = expanded === o.id;
              return (
                <li
                  key={o.id}
                  className="bg-white rounded-xl border border-black/5 overflow-hidden shadow-xs"
                >
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    {o.primaryImg && (
                      <div
                        className={`${o.primaryBg ?? "bg-stone-100"} w-16 h-16 rounded-lg overflow-hidden shrink-0`}
                      >
                        <SafeImage
                          src={o.primaryImg}
                          alt=""
                          className="w-full h-full object-cover"
                          width={64}
                          height={64}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="font-mono text-xs text-black/50">{o.id}</span>
                        <span className="text-xs text-black/40">{formatDate(o.createdAt)}</span>
                      </div>
                      <div className="text-black font-medium mt-1 truncate">{o.primaryName}</div>
                      <div className="text-xs text-black/60 mt-0.5">
                        {o.itemCount} item{o.itemCount === 1 ? "" : "s"} · Total{" "}
                        {formatPKR(o.total)}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => resend(o)}
                          className="inline-flex items-center gap-1.5 bg-[#25D366] text-white rounded-full px-3.5 h-8 text-xs font-medium hover:bg-[#20ba59] transition-colors"
                        >
                          <MessageCircle size={14} /> Resend on WhatsApp
                        </button>
                        <button
                          onClick={() => copy(o)}
                          className="inline-flex items-center gap-1.5 border border-black/15 rounded-full px-3 h-8 text-xs text-black/80 hover:text-black hover:border-black transition-colors cursor-pointer"
                        >
                          {copiedId === o.id ? (
                            <>
                              <Check size={13} /> Copied
                            </>
                          ) : (
                            <>
                              <ClipboardCopy size={13} /> Copy
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setExpanded(isOpen ? null : o.id)}
                          className="inline-flex items-center gap-1 text-xs text-black/60 hover:text-black px-2 h-8 cursor-pointer"
                        >
                          {isOpen ? "Hide draft" : "View draft"}
                        </button>
                        <button
                          onClick={() => remove(o)}
                          aria-label="Delete order"
                          className="ml-auto inline-flex items-center gap-1 text-xs text-black/40 hover:text-red-600 px-2 h-8 cursor-pointer transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                  {isOpen && (
                    <pre className="whitespace-pre-wrap break-words border-t border-black/10 bg-black/[0.02] px-5 py-4 text-[12px] text-black/80 font-mono">
                      {o.message}
                    </pre>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="mt-auto">
        <SiteFooter />
      </div>

      <MobileBottomNav onOpenCart={() => setCartOpen(true)} />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
