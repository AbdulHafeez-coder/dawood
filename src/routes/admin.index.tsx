import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  LogOut,
  Package,
  Heart,
  ShoppingBag,
  ScrollText,
  TrendingUp,
  Trash2,
  Plus,
  Pencil,
  Tag,
  LayoutDashboard,
  RotateCcw,
  Settings as SettingsIcon,

} from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/lib/admin-auth";
import {
  useCart,
  useFavourites,
  useProducts,
  useCategories,
  PRODUCT_IMAGE_CHOICES,
  PRODUCT_BG_CHOICES,
  type Product,
} from "@/lib/shop";
import { useOrders, removeOrder } from "@/lib/orders";
import { useSettings, updateSettings, resetSettings, type SocialKey } from "@/lib/settings";
import { SiteFooter } from "@/components/SiteFooter";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const dmSans = { fontFamily: "'DM Sans', sans-serif" };
const inter = { fontFamily: "'Inter', sans-serif" };

type TabId = "overview" | "products" | "categories" | "settings";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Maison Terra" },
      { name: "description", content: "Manage products, categories and orders." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const { isAuthed, ready, logout } = useAdminAuth();
  const { cartCount, subtotal } = useCart();
  const { favs, favCount } = useFavourites();
  const { orders } = useOrders();
  const { products, addProduct, updateProduct, deleteProduct, resetProducts } = useProducts();
  const { categories, addCategory, renameCategory, deleteCategory, resetCategories } = useCategories();

  const [tab, setTab] = useState<TabId>("overview");
  const [productDialog, setProductDialog] = useState<{ mode: "create" | "edit"; product?: Product } | null>(null);
  const [categoryDialog, setCategoryDialog] = useState<{ mode: "create" | "edit"; name?: string } | null>(null);
  const [confirmProduct, setConfirmProduct] = useState<Product | null>(null);
  const [confirmCategory, setConfirmCategory] = useState<string | null>(null);
  const [confirmResetProducts, setConfirmResetProducts] = useState(false);
  const [confirmResetCategories, setConfirmResetCategories] = useState(false);

  useEffect(() => {
    if (ready && !isAuthed) navigate({ to: "/admin/login" });
  }, [ready, isAuthed, navigate]);

  const revenue = useMemo(() => orders.reduce((s, o) => s + (o.total || 0), 0), [orders]);
  const byCategory = useMemo(
    () =>
      categories.map((c) => ({
        name: c,
        count: products.filter((p) => p.category === c).length,
      })),
    [categories, products],
  );

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
      {/* HEADER */}
      <header className="border-b border-black/10 bg-[#FEFDF9]/95 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Link to="/" className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-black/55 hover:text-black transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Shop
            </Link>
            <div className="h-4 w-px bg-black/15" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.22em] text-black/45">Maison Terra</div>
              <h1 className="truncate" style={{ ...dmSans, fontWeight: 400, letterSpacing: "-0.02em", fontSize: 20 }}>
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

        {/* Tabs */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <nav className="flex gap-1 -mb-px overflow-x-auto">
            <TabButton active={tab === "overview"} onClick={() => setTab("overview")} icon={<LayoutDashboard className="w-3.5 h-3.5" />}>
              Overview
            </TabButton>
            <TabButton active={tab === "products"} onClick={() => setTab("products")} icon={<Package className="w-3.5 h-3.5" />}>
              Products <span className="ml-1 text-black/40">{products.length}</span>
            </TabButton>
            <TabButton active={tab === "categories"} onClick={() => setTab("categories")} icon={<Tag className="w-3.5 h-3.5" />}>
              Categories <span className="ml-1 text-black/40">{categories.length}</span>
            </TabButton>
            <TabButton active={tab === "settings"} onClick={() => setTab("settings")} icon={<SettingsIcon className="w-3.5 h-3.5" />}>
              Settings
            </TabButton>

          </nav>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 sm:py-10">
        <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
          {tab === "overview" && (
            <>
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <KpiCard icon={<Package className="w-4 h-4" />} label="Products" value={products.length.toString()} hint={`${categories.length} categories`} />
                <KpiCard icon={<Heart className="w-4 h-4" />} label="Favorites" value={favCount.toString()} hint="Saved by visitors" accent="#FEF3C7" />
                <KpiCard icon={<ShoppingBag className="w-4 h-4" />} label="Cart items" value={cartCount.toString()} hint={`Subtotal $${subtotal.toFixed(2)}`} accent="#ECEDEC" />
                <KpiCard icon={<ScrollText className="w-4 h-4" />} label="Saved orders" value={orders.length.toString()} hint={`Revenue $${revenue.toFixed(2)}`} accent="#EAEEE6" />
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <section className="lg:col-span-1 bg-white border border-black/10 rounded-2xl p-5 sm:p-6">
                  <SectionTitle icon={<TrendingUp className="w-3.5 h-3.5" />} label="By category" />
                  <ul className="mt-4 space-y-3">
                    {byCategory.length === 0 && <li className="text-sm text-black/40">No categories yet.</li>}
                    {byCategory.map((c) => {
                      const pct = Math.min(100, Math.round((c.count / Math.max(1, products.length)) * 100));
                      return (
                        <li key={c.name}>
                          <div className="flex items-center justify-between text-sm">
                            <span>{c.name}</span>
                            <span className="text-black/50 text-xs">{c.count}</span>
                          </div>
                          <div className="mt-1.5 h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                            <div className="h-full bg-black rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>

                <section className="lg:col-span-2 bg-white border border-black/10 rounded-2xl p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <SectionTitle icon={<ScrollText className="w-3.5 h-3.5" />} label="Recent orders" />
                    <Link to="/orders" className="text-[10px] uppercase tracking-[0.18em] text-black/55 hover:text-black underline underline-offset-4">
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
                        <li key={o.id} className="py-3 flex items-center gap-3 sm:gap-4">
                          <div className={`w-10 h-10 rounded-lg overflow-hidden shrink-0 ${o.primaryBg ?? "bg-black/5"} grid place-items-center`}>
                            {o.primaryImg ? <img src={o.primaryImg} alt="" className="w-full h-full object-cover" /> : <ShoppingBag className="w-4 h-4 text-black/40" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="truncate">{o.primaryName}</span>
                              {o.extraCount ? <span className="text-[10px] uppercase tracking-[0.15em] text-black/45">+{o.extraCount}</span> : null}
                            </div>
                            <div className="text-[11px] text-black/50 flex items-center gap-2">
                              <span>{new Date(o.createdAt).toLocaleString()}</span>
                              <span>·</span>
                              <span>{o.itemCount} item{o.itemCount === 1 ? "" : "s"}</span>
                            </div>
                          </div>
                          <div className="text-sm tabular-nums shrink-0">${o.total.toFixed(2)}</div>
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
            </>
          )}

          {tab === "products" && (
            <section className="bg-white border border-black/10 rounded-2xl p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <SectionTitle icon={<Package className="w-3.5 h-3.5" />} label={`Products (${products.length})`} />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setConfirmResetProducts(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-black/15 hover:border-black transition text-[10px] uppercase tracking-[0.18em]"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                  <button
                    onClick={() => setProductDialog({ mode: "create" })}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-black text-white hover:bg-black/85 transition text-[10px] uppercase tracking-[0.18em] active:scale-[0.98]"
                  >
                    <Plus className="w-3 h-3" /> New product
                  </button>
                </div>
              </div>

              {products.length === 0 ? (
                <EmptyState label="No products yet" cta="Create your first product" onCta={() => setProductDialog({ mode: "create" })} />
              ) : (
                <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
                  <table className="w-full text-sm min-w-[720px]">
                    <thead>
                      <tr className="text-left text-[10px] uppercase tracking-[0.18em] text-black/45 border-b border-black/10">
                        <th className="py-2 pr-3 font-medium">Item</th>
                        <th className="py-2 pr-3 font-medium">Category</th>
                        <th className="py-2 pr-3 font-medium">Tag</th>
                        <th className="py-2 pr-3 font-medium">Rating</th>
                        <th className="py-2 pr-3 font-medium text-right">Price</th>
                        <th className="py-2 pr-3 font-medium text-right">Fav</th>
                        <th className="py-2 pl-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-black/[0.02]">
                          <td className="py-3 pr-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-10 h-10 rounded-lg ${p.bg} grid place-items-center overflow-hidden shrink-0`}>
                                <img src={p.img} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div className="min-w-0">
                                <div className="truncate">{p.name}</div>
                                <div className="text-[11px] text-black/50 truncate">{p.tagline}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pr-3 text-black/70">{p.category}</td>
                          <td className="py-3 pr-3 text-black/70">{p.tag}</td>
                          <td className="py-3 pr-3 text-black/70 tabular-nums">{p.rating.toFixed(1)}</td>
                          <td className="py-3 pr-3 text-right tabular-nums">${p.price.toFixed(2)}</td>
                          <td className="py-3 pr-3 text-right">
                            {favs.includes(p.id) ? (
                              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full bg-black text-white">
                                <Heart className="w-3 h-3 fill-current" />
                              </span>
                            ) : (
                              <span className="text-black/30 text-xs">—</span>
                            )}
                          </td>
                          <td className="py-3 pl-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setProductDialog({ mode: "edit", product: p })}
                                className="w-8 h-8 rounded-full grid place-items-center text-black/60 hover:text-black hover:bg-black/5 transition"
                                aria-label={`Edit ${p.name}`}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setConfirmProduct(p)}
                                className="w-8 h-8 rounded-full grid place-items-center text-black/60 hover:text-white hover:bg-black transition"
                                aria-label={`Delete ${p.name}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {tab === "categories" && (
            <section className="bg-white border border-black/10 rounded-2xl p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <SectionTitle icon={<Tag className="w-3.5 h-3.5" />} label={`Categories (${categories.length})`} />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setConfirmResetCategories(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-black/15 hover:border-black transition text-[10px] uppercase tracking-[0.18em]"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                  <button
                    onClick={() => setCategoryDialog({ mode: "create" })}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-black text-white hover:bg-black/85 transition text-[10px] uppercase tracking-[0.18em] active:scale-[0.98]"
                  >
                    <Plus className="w-3 h-3" /> New category
                  </button>
                </div>
              </div>

              {categories.length === 0 ? (
                <EmptyState label="No categories yet" cta="Create your first category" onCta={() => setCategoryDialog({ mode: "create" })} />
              ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categories.map((c) => {
                    const count = products.filter((p) => p.category === c).length;
                    return (
                      <li
                        key={c}
                        className="border border-black/10 rounded-xl p-4 flex items-start justify-between gap-3 hover:border-black/25 transition"
                      >
                        <div className="min-w-0">
                          <div className="text-[10px] uppercase tracking-[0.22em] text-black/45">Category</div>
                          <div className="mt-1 text-lg truncate" style={{ ...dmSans, fontWeight: 400, letterSpacing: "-0.02em" }}>
                            {c}
                          </div>
                          <div className="mt-1 text-xs text-black/50">{count} product{count === 1 ? "" : "s"}</div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setCategoryDialog({ mode: "edit", name: c })}
                            aria-label={`Rename ${c}`}
                            className="w-8 h-8 rounded-full grid place-items-center text-black/60 hover:text-black hover:bg-black/5 transition"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmCategory(c)}
                            aria-label={`Delete ${c}`}
                            className="w-8 h-8 rounded-full grid place-items-center text-black/60 hover:text-white hover:bg-black transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          )}

          {tab === "settings" && <SettingsPanel />}

        </div>
      </main>

      <SiteFooter />

      {/* Product dialog */}
      {productDialog && (
        <ProductFormDialog
          key={productDialog.product?.id ?? "new"}
          mode={productDialog.mode}
          product={productDialog.product}
          categories={categories}
          onClose={() => setProductDialog(null)}
          onCreate={(data) => {
            addProduct(data);
            toast.success("Product created", { description: data.name });
            setProductDialog(null);
          }}
          onSave={(id, patch) => {
            updateProduct(id, patch);
            toast.success("Product updated", { description: patch.name });
            setProductDialog(null);
          }}
        />
      )}

      {/* Category dialog */}
      {categoryDialog && (
        <CategoryFormDialog
          mode={categoryDialog.mode}
          name={categoryDialog.name}
          existing={categories}
          onClose={() => setCategoryDialog(null)}
          onCreate={(name) => {
            if (addCategory(name)) {
              toast.success("Category created", { description: name });
              setCategoryDialog(null);
            } else {
              toast.error("Category already exists");
            }
          }}
          onSave={(oldName, newName) => {
            if (renameCategory(oldName, newName)) {
              toast.success("Category renamed", { description: `${oldName} → ${newName}` });
              setCategoryDialog(null);
            } else {
              toast.error("Rename failed", { description: "Name is empty or duplicated." });
            }
          }}
        />
      )}

      {/* Delete product confirm */}
      <AlertDialog open={!!confirmProduct} onOpenChange={(o) => !o && setConfirmProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              “{confirmProduct?.name}” will be removed from the shop. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmProduct) {
                  deleteProduct(confirmProduct.id);
                  toast.success("Product deleted", { description: confirmProduct.name });
                }
                setConfirmProduct(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete category confirm */}
      <AlertDialog open={!!confirmCategory} onOpenChange={(o) => !o && setConfirmCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              Products in “{confirmCategory}” will also be removed
              {confirmCategory
                ? ` (${products.filter((p) => p.category === confirmCategory).length} affected).`
                : "."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmCategory) {
                  const res = deleteCategory(confirmCategory);
                  if (res.ok) {
                    toast.success("Category deleted", {
                      description: res.orphaned
                        ? `${res.orphaned} product${res.orphaned === 1 ? "" : "s"} removed`
                        : undefined,
                    });
                  }
                }
                setConfirmCategory(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset confirms */}
      <AlertDialog open={confirmResetProducts} onOpenChange={setConfirmResetProducts}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset products to seed?</AlertDialogTitle>
            <AlertDialogDescription>All local changes to products will be replaced with the original catalogue.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resetProducts();
                toast.success("Products reset to seed");
                setConfirmResetProducts(false);
              }}
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={confirmResetCategories} onOpenChange={setConfirmResetCategories}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset categories to seed?</AlertDialogTitle>
            <AlertDialogDescription>The original four categories will be restored.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resetCategories();
                toast.success("Categories reset to seed");
                setConfirmResetCategories(false);
              }}
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ------------------------------ SUBCOMPONENTS ------------------------------ */

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-3 border-b-2 transition whitespace-nowrap text-[11px] uppercase tracking-[0.18em] ${
        active ? "border-black text-black" : "border-transparent text-black/45 hover:text-black"
      }`}
    >
      {icon}
      {children}
    </button>
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
    <div className="rounded-2xl border border-black/10 p-4 sm:p-5 transition hover:shadow-sm" style={{ background: accent }}>
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-black/55">
        <span className="w-6 h-6 rounded-full bg-black text-white grid place-items-center">{icon}</span>
        {label}
      </div>
      <div className="mt-3 text-black tabular-nums" style={{ ...dmSans, fontWeight: 400, letterSpacing: "-0.02em", fontSize: 34 }}>
        {value}
      </div>
      <div className="mt-1 text-[11px] text-black/50">{hint}</div>
    </div>
  );
}

function SectionTitle({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-black/55">
      <span className="w-5 h-5 rounded-full bg-black/5 grid place-items-center text-black/70">{icon}</span>
      {label}
    </div>
  );
}

function EmptyState({ label, cta, onCta }: { label: string; cta: string; onCta: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-black/15 p-8 text-center">
      <div className="text-sm text-black/50">{label}</div>
      <button
        onClick={onCta}
        className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black text-white hover:bg-black/85 transition text-[10px] uppercase tracking-[0.18em]"
      >
        <Plus className="w-3 h-3" /> {cta}
      </button>
    </div>
  );
}

/* ----------------------------- PRODUCT DIALOG ----------------------------- */

function ProductFormDialog({
  mode,
  product,
  categories,
  onClose,
  onCreate,
  onSave,
}: {
  mode: "create" | "edit";
  product?: Product;
  categories: string[];
  onClose: () => void;
  onCreate: (p: Omit<Product, "id">) => void;
  onSave: (id: string, patch: Partial<Product>) => void;
}) {
  const initial: Omit<Product, "id"> = product
    ? { ...product }
    : {
        name: "",
        tag: "New",
        price: 20,
        rating: 4.7,
        img: PRODUCT_IMAGE_CHOICES[0].url,
        bg: PRODUCT_BG_CHOICES[0],
        category: categories[0] ?? "",
        tagline: "",
        description: "",
        details: [],
        gallery: [PRODUCT_IMAGE_CHOICES[0].url],
      };

  const [form, setForm] = useState<Omit<Product, "id">>(initial);
  const [detailsText, setDetailsText] = useState((initial.details ?? []).join("\n"));

  function set<K extends keyof Omit<Product, "id">>(key: K, value: Omit<Product, "id">[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.category.trim()) return toast.error("Category is required");
    if (form.price < 0) return toast.error("Price must be positive");
    const details = detailsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const payload: Omit<Product, "id"> = {
      ...form,
      details,
      gallery: form.gallery && form.gallery.length ? form.gallery : [form.img],
    };
    if (mode === "create") onCreate(payload);
    else if (product) onSave(product.id, payload);
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ ...dmSans, fontWeight: 400, letterSpacing: "-0.02em" }}>
            {mode === "create" ? "New product" : "Edit product"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Add a new item to the Maison Terra catalogue." : `Editing “${product?.name}”.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4" style={inter}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Name">
              <input
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="mt-input"
                placeholder="Aegean Bath Towel"
              />
            </Field>
            <Field label="Tag">
              <input value={form.tag} onChange={(e) => set("tag", e.target.value)} className="mt-input" placeholder="Bestseller" />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="mt-input mt-select"
              >
                {categories.length === 0 && <option value="">— none —</option>}
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Price ($)">
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(e) => set("price", Number(e.target.value))}
                className="mt-input"
              />
            </Field>
            <Field label="Rating">
              <input
                type="number"
                min={0}
                max={5}
                step="0.1"
                value={form.rating}
                onChange={(e) => set("rating", Number(e.target.value))}
                className="mt-input"
              />
            </Field>
          </div>

          <Field label="Tagline">
            <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} className="mt-input" placeholder="Short elevator pitch" />
          </Field>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="mt-input min-h-[96px] resize-y"
              placeholder="Full description shown on the product page."
            />
          </Field>

          <Field label="Details (one per line)">
            <textarea
              value={detailsText}
              onChange={(e) => setDetailsText(e.target.value)}
              className="mt-input min-h-[96px] resize-y font-mono text-[13px]"
              placeholder={"600 GSM combed cotton\nOEKO-TEX certified"}
            />
          </Field>

          <Field label="Image">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PRODUCT_IMAGE_CHOICES.map((choice) => {
                const active = form.img === choice.url;
                return (
                  <button
                    type="button"
                    key={choice.id}
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        img: choice.url,
                        gallery:
                          f.gallery && f.gallery.length
                            ? [choice.url, ...f.gallery.filter((x) => x !== choice.url)].slice(0, 4)
                            : [choice.url],
                      }))
                    }
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition ${
                      active ? "border-black" : "border-transparent hover:border-black/30"
                    }`}
                    aria-label={choice.label}
                  >
                    <img src={choice.url} alt="" className="w-full h-full object-cover" />
                    {active && <div className="absolute inset-0 ring-2 ring-black rounded-lg" />}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Card background">
            <div className="flex flex-wrap gap-2">
              {PRODUCT_BG_CHOICES.map((bg) => {
                const active = form.bg === bg;
                return (
                  <button
                    type="button"
                    key={bg}
                    onClick={() => set("bg", bg)}
                    className={`${bg} w-8 h-8 rounded-full border-2 transition ${
                      active ? "border-black" : "border-black/10 hover:border-black/40"
                    }`}
                    aria-label={bg}
                  />
                );
              })}
            </div>
          </Field>

          <DialogFooter className="pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-full border border-black/15 text-[11px] uppercase tracking-[0.18em] hover:bg-black/5">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 rounded-full bg-black text-white text-[11px] uppercase tracking-[0.18em] hover:bg-black/85 active:scale-[0.98]">
              {mode === "create" ? "Create product" : "Save changes"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------- CATEGORY DIALOG ----------------------------- */

function CategoryFormDialog({
  mode,
  name,
  existing,
  onClose,
  onCreate,
  onSave,
}: {
  mode: "create" | "edit";
  name?: string;
  existing: string[];
  onClose: () => void;
  onCreate: (name: string) => void;
  onSave: (oldName: string, newName: string) => void;
}) {
  const [value, setValue] = useState(name ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = value.trim();
    if (!clean) return toast.error("Name is required");
    if (mode === "edit" && name) onSave(name, clean);
    else onCreate(clean);
  }

  const isDup =
    value.trim().length > 0 &&
    existing.some((c) => c.toLowerCase() === value.trim().toLowerCase() && c !== name);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle style={{ ...dmSans, fontWeight: 400, letterSpacing: "-0.02em" }}>
            {mode === "create" ? "New category" : "Rename category"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Group products under a new department name."
              : `Rename the “${name}” category — products will follow.`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3" style={inter}>
          <Field label="Name">
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="mt-input"
              placeholder="e.g. Bath, Kitchen, Bedroom"
            />
            {isDup && <div className="mt-1 text-[11px] text-red-600">This name already exists.</div>}
          </Field>
          <DialogFooter className="pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-full border border-black/15 text-[11px] uppercase tracking-[0.18em] hover:bg-black/5">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDup || !value.trim()}
              className="px-5 py-2 rounded-full bg-black text-white text-[11px] uppercase tracking-[0.18em] hover:bg-black/85 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {mode === "create" ? "Create" : "Rename"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------------- FIELD ---------------------------------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.2em] text-black/50">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
