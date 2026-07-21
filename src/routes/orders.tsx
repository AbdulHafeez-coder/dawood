import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ShoppingBag, MessageCircle, Trash2, ClipboardCopy, ScrollText, Check } from "lucide-react";
import { useCart } from "@/lib/shop";
import { useOrders, type SavedOrder } from "@/lib/orders";
import { CartDrawer } from "@/components/CartDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { toast } from "sonner";
import { formatPKR } from "@/lib/format";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Your Orders — Maison Terra" },
      { name: "description", content: "Review your WhatsApp order drafts and resend them in one click." },
      { property: "og:title", content: "Your Orders — Maison Terra" },
      { property: "og:description", content: "Review your WhatsApp order drafts and resend them in one click." },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrdersPage,
});

const dmSans = { fontFamily: "'DM Sans', sans-serif" };
const inter = { fontFamily: "'Inter', sans-serif" };

function formatDate(ts: number) {
  return new Date(ts).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function OrdersPage() {
  const { orders, removeOrder, clearOrders, orderCount } = useOrders();
  const { cartCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const resend = (o: SavedOrder) => {
    window.open(o.url, "_blank", "noopener,noreferrer");
    toast.success("Reopening WhatsApp draft");
  };

  const copy = async (o: SavedOrder) => {
    try {
      await navigator.clipboard.writeText(o.message);
      setCopiedId(o.id);
      setTimeout(() => setCopiedId((v) => (v === o.id ? null : v)), 1600);
      toast.success("Order message copied");
    } catch {
      toast.error("Couldn't copy — try again");
    }
  };

  const remove = (o: SavedOrder) => {
    removeOrder(o.id);
    toast(`Removed ${o.primaryName}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FEFDF9]" style={inter}>
      <nav className="sticky top-0 z-20 bg-[#FEFDF9]/90 backdrop-blur border-b border-black/5 flex items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
        <Link to="/" className="text-black" style={{ ...dmSans, fontWeight: 500, fontSize: 26, letterSpacing: "-0.05em" }}>
          Maison Terra
        </Link>
        <button aria-label="Cart" onClick={() => setCartOpen(true)} className="relative text-black">
          <ShoppingBag size={22} strokeWidth={1.5} />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[10px] font-medium min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </nav>

      <div className="px-5 sm:px-8 lg:px-10 pt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-black/70 hover:text-black">
          <ArrowLeft size={16} /> Back to shop
        </Link>
        <span className="text-black/20">|</span>
        <div className="text-xs text-black/50 flex items-center gap-2">
          <Link to="/" className="hover:text-black">Shop</Link>
          <span>/</span>
          <span className="text-black/80">Orders</span>
        </div>
      </div>

      <section className="px-5 sm:px-8 lg:px-10 py-8 lg:py-12 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 lg:mb-10">
          <div>
            <h1 className="text-black flex items-center gap-3" style={{ ...dmSans, fontWeight: 500, fontSize: 42, letterSpacing: "-0.03em", lineHeight: 1 }}>
              <ScrollText size={30} strokeWidth={1.5} /> Orders
            </h1>
            <p className="text-black/60 mt-2 text-sm">
              {orderCount === 0
                ? "No orders yet. Every WhatsApp order you send is saved here for one-click resend."
                : `${orderCount} saved draft${orderCount === 1 ? "" : "s"} — resend, copy, or remove any time.`}
            </p>
          </div>
          {orderCount > 0 && (
            <button
              onClick={() => {
                clearOrders();
                toast("All order drafts cleared");
              }}
              className="self-start inline-flex items-center gap-2 text-xs text-black/60 hover:text-black border border-black/15 rounded-full px-3 py-1.5"
            >
              <Trash2 size={13} /> Clear all
            </button>
          )}
        </div>

        {orderCount === 0 ? (
          <div className="border border-dashed border-black/15 rounded-2xl p-10 text-center text-black/60">
            <p className="mb-4">Your WhatsApp order drafts will appear here after your first order.</p>
            <Link to="/" className="inline-flex items-center gap-2 bg-black text-white rounded-full px-5 py-2.5 text-sm hover:bg-black/85">
              Browse the shop
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {orders.map((o) => {
              const isOpen = expanded === o.id;
              return (
                <li key={o.id} className="border border-black/10 rounded-2xl bg-white overflow-hidden">
                  <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-5">
                    <div className={`${o.primaryBg ?? "bg-black/[0.04]"} w-full sm:w-24 h-24 rounded-xl shrink-0 overflow-hidden`}>
                      {o.primaryImg && (
                        <img src={o.primaryImg} alt={o.primaryName} width={512} height={512} loading="lazy" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="inline-flex items-center rounded-full bg-black/[0.05] px-2 py-0.5 text-black/70 uppercase tracking-wider">
                          {o.kind === "cart" ? "Cart order" : "Product order"}
                        </span>
                        <span className="text-black/50">{formatDate(o.createdAt)}</span>
                      </div>
                      <div className="text-black truncate" style={{ ...dmSans, fontWeight: 500, fontSize: 18, letterSpacing: "-0.02em" }}>
                        {o.primaryName}
                        {o.extraCount && o.extraCount > 0 ? (
                          <span className="text-black/50 text-sm"> · +{o.extraCount} more</span>
                        ) : null}
                      </div>
                      <div className="text-sm text-black/60">
                        {o.itemCount} item{o.itemCount === 1 ? "" : "s"} · <span className="text-black">{formatPKR(o.total)}</span>
                      </div>
                      <div className="mt-auto flex flex-wrap gap-2 pt-2">
                        <button
                          onClick={() => resend(o)}
                          className="inline-flex items-center gap-2 bg-[#25D366] text-white rounded-full px-4 h-9 text-sm hover:bg-[#1ebe57] transition-colors"
                          style={{ fontWeight: 500 }}
                        >
                          <MessageCircle size={15} /> Resend on WhatsApp
                        </button>
                        <button
                          onClick={() => copy(o)}
                          className="inline-flex items-center gap-2 border border-black/15 rounded-full px-4 h-9 text-sm text-black/80 hover:text-black hover:border-black transition-colors"
                        >
                          {copiedId === o.id ? <><Check size={14} /> Copied</> : <><ClipboardCopy size={14} /> Copy message</>}
                        </button>
                        <button
                          onClick={() => setExpanded(isOpen ? null : o.id)}
                          className="inline-flex items-center gap-2 text-sm text-black/60 hover:text-black px-2 h-9"
                        >
                          {isOpen ? "Hide draft" : "View draft"}
                        </button>
                        <button
                          onClick={() => remove(o)}
                          aria-label="Delete order"
                          className="ml-auto inline-flex items-center gap-1 text-xs text-black/50 hover:text-black px-2 h-9"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  {isOpen && (
                    <pre className="whitespace-pre-wrap break-words border-t border-black/10 bg-black/[0.02] px-5 py-4 text-[12.5px] text-black/80 font-mono">
                      {o.message}
                    </pre>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <SiteFooter />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
