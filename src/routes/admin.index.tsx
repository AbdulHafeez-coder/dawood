import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import {
  ArrowLeft,
  LogOut,
  Package,
  Heart,
  ShoppingBag,
  ScrollText,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/lib/admin-auth";
import { products, useCart, useFavourites, CATEGORY_LIST } from "@/lib/shop";
import { useOrders, removeOrder } from "@/lib/orders";
import { SiteFooter } from "@/components/SiteFooter";

const dmSans = { fontFamily: "'DM Sans', sans-serif" };
const inter = { fontFamily: "'Inter', sans-serif" };

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Maison Terra" },
      { name: "description", content: "Overview of products, favorites, cart, and saved orders." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const { isAuthed, ready, logout } = useAdminAuth();
  const { cart, cartCount, subtotal } = useCart();
  const { favs, favCount } = useFavourites();
  const { orders } = useOrders();

  useEffect(() => {
    if (ready && !isAuthed) {
      navigate({ to: "/admin/login" });
    }
  }, [ready, isAuthed, navigate]);

  const revenue = useMemo(
    () => orders.reduce((s, o) => s + (o.total || 0), 0),
    [orders],
  );

  const byCategory = useMemo(() => {
    return CATEGORY_LIST.map((c) => ({
      name: c,
      count: products.filter((p) => p.category === c).length,
    }));
  }, []);

  if (!ready || !isAuthed) {
    return (
      <div className="min-h-screen bg-[#FEFDF9] grid place-items-center text-black/40 text-xs uppercase tracking-[0.2em]">
        Checking access…
      </div>
    );
  }

  function handleLogout() {
    logout();
    toast.success("Signed out");
    navigate({ to: "/admin/login" });
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FEFDF9] text-black" style={inter}>
      <header className="border-b border-black/10 bg-[#FEFDF9]/95 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-black/55 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Shop
            </Link>
            <div className="h-4 w-px bg-black/15" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.22em] text-black/45">
                Maison Terra
              </div>
              <h1
                className="truncate"
                style={{ ...dmSans, fontWeight: 400, letterSpacing: "-0.02em", fontSize: 20 }}
              >
                Admin dashboard
              </h1>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border border-black/15 hover:border-black hover:bg-black hover:text-white transition text-[10px] uppercase tracking-[0.18em]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 sm:py-10">
        <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
          {/* KPI grid */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <KpiCard
              icon={<Package className="w-4 h-4" />}
              label="Products"
              value={products.length.toString()}
              hint={`${CATEGORY_LIST.length} categories`}
            />
            <KpiCard
              icon={<Heart className="w-4 h-4" />}
              label="Favorites"
              value={favCount.toString()}
              hint="Saved by visitors"
              accent="#FEF3C7"
            />
            <KpiCard
              icon={<ShoppingBag className="w-4 h-4" />}
              label="Cart items"
              value={cartCount.toString()}
              hint={`Subtotal $${subtotal.toFixed(2)}`}
              accent="#ECEDEC"
            />
            <KpiCard
              icon={<ScrollText className="w-4 h-4" />}
              label="Saved orders"
              value={orders.length.toString()}
              hint={`Revenue $${revenue.toFixed(2)}`}
              accent="#EAEEE6"
            />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Categories overview */}
            <section className="lg:col-span-1 bg-white border border-black/10 rounded-2xl p-5 sm:p-6">
              <SectionTitle icon={<TrendingUp className="w-3.5 h-3.5" />} label="By category" />
              <ul className="mt-4 space-y-3">
                {byCategory.map((c) => {
                  const pct = Math.min(
                    100,
                    Math.round((c.count / Math.max(1, products.length)) * 100),
                  );
                  return (
                    <li key={c.name}>
                      <div className="flex items-center justify-between text-sm">
                        <span>{c.name}</span>
                        <span className="text-black/50 text-xs">{c.count}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-black rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* Products table */}
            <section className="lg:col-span-2 bg-white border border-black/10 rounded-2xl p-5 sm:p-6">
              <SectionTitle icon={<Package className="w-3.5 h-3.5" />} label="Products" />
              <div className="mt-4 overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
                <table className="w-full text-sm min-w-[520px]">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-[0.18em] text-black/45 border-b border-black/10">
                      <th className="py-2 pr-3 font-medium">Item</th>
                      <th className="py-2 pr-3 font-medium">Category</th>
                      <th className="py-2 pr-3 font-medium">Rating</th>
                      <th className="py-2 pr-0 font-medium text-right">Price</th>
                      <th className="py-2 pl-3 font-medium text-right">Fav</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-black/[0.02]">
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-9 h-9 rounded-lg ${p.bg} grid place-items-center overflow-hidden shrink-0`}>
                              <img src={p.img} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <div className="truncate">{p.name}</div>
                              <div className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                                {p.tag}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-3 text-black/70">{p.category}</td>
                        <td className="py-3 pr-3 text-black/70">{p.rating.toFixed(1)}</td>
                        <td className="py-3 pr-0 text-right tabular-nums">
                          ${p.price.toFixed(2)}
                        </td>
                        <td className="py-3 pl-3 text-right">
                          {favs.includes(p.id) ? (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full bg-black text-white">
                              <Heart className="w-3 h-3 fill-current" /> Saved
                            </span>
                          ) : (
                            <span className="text-black/30 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Orders */}
          <section className="bg-white border border-black/10 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <SectionTitle icon={<ScrollText className="w-3.5 h-3.5" />} label="Recent orders" />
              <Link
                to="/orders"
                className="text-[10px] uppercase tracking-[0.18em] text-black/55 hover:text-black underline underline-offset-4"
              >
                View all
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-black/15 p-6 text-center text-sm text-black/50">
                No orders saved yet. WhatsApp drafts will appear here.
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-black/5">
                {orders.slice(0, 6).map((o) => (
                  <li
                    key={o.id}
                    className="py-3 flex items-center gap-3 sm:gap-4"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg overflow-hidden shrink-0 ${o.primaryBg ?? "bg-black/5"} grid place-items-center`}
                    >
                      {o.primaryImg ? (
                        <img src={o.primaryImg} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-4 h-4 text-black/40" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="truncate">{o.primaryName}</span>
                        {o.extraCount ? (
                          <span className="text-[10px] uppercase tracking-[0.15em] text-black/45">
                            +{o.extraCount}
                          </span>
                        ) : null}
                      </div>
                      <div className="text-[11px] text-black/50 flex items-center gap-2">
                        <span>{new Date(o.createdAt).toLocaleString()}</span>
                        <span>·</span>
                        <span className="uppercase tracking-[0.15em] text-[9px]">{o.kind}</span>
                        <span>·</span>
                        <span>{o.itemCount} item{o.itemCount === 1 ? "" : "s"}</span>
                      </div>
                    </div>
                    <div className="text-sm tabular-nums shrink-0">
                      ${o.total.toFixed(2)}
                    </div>
                    <button
                      onClick={() => {
                        removeOrder(o.id);
                        toast.success("Order removed");
                      }}
                      aria-label="Delete order"
                      className="shrink-0 w-8 h-8 rounded-full grid place-items-center text-black/40 hover:text-black hover:bg-black/5 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  hint,
  accent = "#FFFFFF",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  accent?: string;
}) {
  return (
    <div
      className="rounded-2xl border border-black/10 p-4 sm:p-5 transition hover:shadow-sm"
      style={{ background: accent }}
    >
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-black/55">
        <span className="w-6 h-6 rounded-full bg-black text-white grid place-items-center">
          {icon}
        </span>
        {label}
      </div>
      <div
        className="mt-3 text-black tabular-nums"
        style={{ ...dmSans, fontWeight: 400, letterSpacing: "-0.02em", fontSize: 34 }}
      >
        {value}
      </div>
      <div className="mt-1 text-[11px] text-black/50">{hint}</div>
    </div>
  );
}

function SectionTitle({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-black/55">
      <span className="w-5 h-5 rounded-full bg-black/5 grid place-items-center text-black/70">
        {icon}
      </span>
      {label}
    </div>
  );
}
