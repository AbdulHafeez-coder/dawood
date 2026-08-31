import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  ArrowLeft,
  LogOut,
  Package,
  ShoppingBag,
  ScrollText,
  TrendingUp,
  Trash2,
  Plus,
  Pencil,
  Tag,
  LayoutDashboard,
  RotateCcw,
  Wallet,
  UploadCloud,
  ImageIcon,
  Download,
  Upload,
  Search,
  ChevronLeft,
  ChevronRight,
  X as XIcon,
  Settings as SettingsIcon,
  AlertTriangle,
  RefreshCw,
  Megaphone,
} from "lucide-react";
import { PromotionsPanel } from "@/components/admin/PromotionsPanel";
import { toast } from "sonner";
import { useAdminAuth } from "@/lib/admin-auth";
import {
  useProducts,
  useCategories,
  PRODUCT_IMAGE_CHOICES,
  PRODUCT_BG_CHOICES,
  computeShipping,
  type Product,
} from "@/lib/shop";
import { useAllOrders, ORDER_STATUSES, type OrderStatus, type SavedOrder } from "@/lib/orders";
import { useSettings, type SettingsSection } from "@/lib/settings";
import { SafeImage } from "@/components/ui/SafeImage";
import {
  formatPkPhone,
  normalizePkDigits,
  isValidPkPhone,
  PK_PHONE_PLACEHOLDER,
} from "@/lib/pk-phone";
import { formatPKR } from "@/lib/format";
import {
  productsToCsv,
  parseProductsCsv,
  categoriesToCsv,
  parseCategoriesCsv,
  downloadCsv,
} from "@/lib/csv";
import {
  AdminDashboardSkeleton,
  ProductFormSkeleton,
  CategoryFormSkeleton,
  SettingsSectionSkeleton,
  useMounted,
} from "@/components/skeletons";
import { AdminError, AdminNotFound } from "@/components/AdminFallback";

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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const dmSans = { fontFamily: "'DM Sans', sans-serif" };
const inter = { fontFamily: "'Inter', sans-serif" };

type TabId = "overview" | "products" | "categories" | "promotions" | "orders" | "settings";

type ProductImportItem = {
  id?: string;
  name: string;
  category: string;
  payload: Omit<Product, "id">;
};
type ProductImportPlan = {
  fileName: string;
  create: ProductImportItem[];
  update: ProductImportItem[];
  skip: { row: number; error: string }[];
  newCategories: string[];
};
type CategoryImportPlan = {
  fileName: string;
  create: string[];
  skip: string[];
};

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Dawood Mart" },
      { name: "description", content: "Manage products, categories and orders." },
      { property: "og:title", content: "Admin Dashboard — Dawood Mart" },
      { property: "og:description", content: "Manage products, categories and orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
  pendingComponent: () => <AdminDashboardSkeleton tab="overview" />,
  errorComponent: AdminError,
  notFoundComponent: AdminNotFound,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const mounted = useMounted();
  const { isAuthed, ready, logout } = useAdminAuth();
  const {
    orders,
    removeOrder,
    updateStatus,
    loading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useAllOrders();
  const { products, addProduct, updateProduct, deleteProduct, resetProducts } = useProducts();
  const {
    categories,
    categoryInfo,
    addCategory,
    renameCategory,
    updateCategoryImage,
    deleteCategory,
    resetCategories,
  } = useCategories();

  const [tab, setTab] = useState<TabId>(() => {
    if (typeof window === "undefined") return "overview";
    const saved = window.localStorage.getItem("mt_admin_tab") as TabId | null;
    return saved &&
      ["overview", "products", "categories", "promotions", "orders", "settings"].includes(saved)
      ? saved
      : "overview";
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("mt_admin_tab", tab);
    }
  }, [tab]);
  const [productDialog, setProductDialog] = useState<{
    mode: "create" | "edit";
    product?: Product;
  } | null>(null);
  const [categoryDialog, setCategoryDialog] = useState<{
    mode: "create" | "edit";
    name?: string;
  } | null>(null);
  const [confirmProduct, setConfirmProduct] = useState<Product | null>(null);
  const [confirmCategory, setConfirmCategory] = useState<string | null>(null);
  const [confirmResetProducts, setConfirmResetProducts] = useState(false);
  const [confirmResetCategories, setConfirmResetCategories] = useState(false);
  const productImportRef = useRef<HTMLInputElement>(null);
  const categoryImportRef = useRef<HTMLInputElement>(null);
  const [productImportPlan, setProductImportPlan] = useState<ProductImportPlan | null>(null);
  const [categoryImportPlan, setCategoryImportPlan] = useState<CategoryImportPlan | null>(null);

  // Product filters + pagination
  const [pQuery, setPQuery] = useState("");
  const debouncedPQuery = useDebouncedValue(pQuery, 250);

  const [pCategory, setPCategory] = useState<string>("all");
  const [pMinPrice, setPMinPrice] = useState<string>("");
  const [pMaxPrice, setPMaxPrice] = useState<string>("");
  const [pMinRating, setPMinRating] = useState<string>("");
  const [pMaxRating, setPMaxRating] = useState<string>("");
  const [pPage, setPPage] = useState(1);
  const [pPageSize, setPPageSize] = useState(10);
  const [pShowFilters, setPShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkTag, setBulkTag] = useState("");
  const [bulkCategory, setBulkCategory] = useState("");
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const filteredProducts = useMemo(() => {
    const q = debouncedPQuery.trim().toLowerCase();
    const min = pMinPrice === "" ? -Infinity : Number(pMinPrice);
    const max = pMaxPrice === "" ? Infinity : Number(pMaxPrice);
    const rMin = pMinRating === "" ? -Infinity : Number(pMinRating);
    const rMax = pMaxRating === "" ? Infinity : Number(pMaxRating);
    return products.filter((p) => {
      if (pCategory !== "all" && p.category !== pCategory) return false;
      if (!Number.isNaN(min) && p.price < min) return false;
      if (!Number.isNaN(max) && p.price > max) return false;
      if (!Number.isNaN(rMin) && p.rating < rMin) return false;
      if (!Number.isNaN(rMax) && p.rating > rMax) return false;
      if (q) {
        const hay = `${p.name} ${p.tagline} ${p.category} ${p.tag}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [products, debouncedPQuery, pCategory, pMinPrice, pMaxPrice, pMinRating, pMaxRating]);

  const pTotalPages = Math.max(1, Math.ceil(filteredProducts.length / pPageSize));
  const pCurrentPage = Math.min(pPage, pTotalPages);
  const pagedProducts = useMemo(
    () => filteredProducts.slice((pCurrentPage - 1) * pPageSize, pCurrentPage * pPageSize),
    [filteredProducts, pCurrentPage, pPageSize],
  );

  useEffect(() => {
    setPPage(1);
  }, [debouncedPQuery, pCategory, pMinPrice, pMaxPrice, pMinRating, pMaxRating, pPageSize]);

  const hasActiveFilters =
    pQuery !== "" ||
    pCategory !== "all" ||
    pMinPrice !== "" ||
    pMaxPrice !== "" ||
    pMinRating !== "" ||
    pMaxRating !== "";

  function clearProductFilters() {
    setPQuery("");
    setPCategory("all");
    setPMinPrice("");
    setPMaxPrice("");
    setPMinRating("");
    setPMaxRating("");
  }

  // Prune selection when products list changes (e.g. deletes, imports)
  useEffect(() => {
    setSelectedIds((prev) => {
      const valid = new Set(products.map((p) => p.id));
      let changed = false;
      const next = new Set<string>();
      prev.forEach((id) => {
        if (valid.has(id)) next.add(id);
        else changed = true;
      });
      return changed ? next : prev;
    });
  }, [products]);

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const pageIds = pagedProducts.map((p) => p.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const somePageSelected = pageIds.some((id) => selectedIds.has(id));
  const togglePageSelection = () =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });

  const clearSelection = () => setSelectedIds(new Set());
  const selectedCount = selectedIds.size;

  function applyBulkDelete() {
    const ids = Array.from(selectedIds);
    const snapshot = ids
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
    ids.forEach((id) => deleteProduct(id));
    const names = snapshot.map((p) => p.name);
    const preview =
      names.slice(0, 3).join(", ") + (names.length > 3 ? ` +${names.length - 3} more` : "");
    toast.success(`${ids.length} product${ids.length === 1 ? "" : "s"} deleted`, {
      description: `Undo within 6s to restore: ${preview}`,
      duration: 6000,
      action: {
        label: "Undo",
        onClick: () => {
          snapshot.forEach((p) => addProduct(p));
          toast.success(`Restored ${snapshot.length} product${snapshot.length === 1 ? "" : "s"}`);
        },
      },
    });
    clearSelection();
    setConfirmBulkDelete(false);
  }

  function applyBulkCategory() {
    if (!bulkCategory) return;
    const ids = Array.from(selectedIds);
    ids.forEach((id) => updateProduct(id, { category: bulkCategory }));
    toast.success(`Moved ${ids.length} to ${bulkCategory}`);
    setBulkCategory("");
  }

  function applyBulkTag() {
    const t = bulkTag.trim();
    if (!t) return;
    const ids = Array.from(selectedIds);
    ids.forEach((id) => updateProduct(id, { tag: t }));
    toast.success(`Tagged ${ids.length} as “${t}”`);
    setBulkTag("");
  }

  function applyBulkExport() {
    const ids = Array.from(selectedIds);
    const rows = ids
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
    if (rows.length === 0) return toast.error("Nothing selected to export");
    const esc = (v: string) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = ["name", "price_pkr", "price_formatted", "currency", "category", "tags"];
    const body = rows.map((p) =>
      [
        esc(p.name),
        p.price.toFixed(2),
        esc(formatPKR(p.price)),
        "PKR",
        esc(p.category),
        esc(p.tag ?? ""),
      ].join(","),
    );
    const csv = [header.join(","), ...body].join("\n");
    downloadCsv(`dawood-mart-selected-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    toast.success(`Exported ${rows.length} product${rows.length === 1 ? "" : "s"}`);
  }

  function handleExportProducts() {
    if (products.length === 0) return toast.error("No products to export");
    downloadCsv(
      `dawood-mart-products-${new Date().toISOString().slice(0, 10)}.csv`,
      productsToCsv(products),
    );
    toast.success("Products exported", {
      description: `${products.length} row${products.length === 1 ? "" : "s"}`,
    });
  }

  function handleExportCategories() {
    if (categories.length === 0) return toast.error("No categories to export");
    downloadCsv(
      `dawood-mart-categories-${new Date().toISOString().slice(0, 10)}.csv`,
      categoriesToCsv(categories),
    );
    toast.success("Categories exported", {
      description: `${categories.length} row${categories.length === 1 ? "" : "s"}`,
    });
  }

  async function handleImportProducts(file: File) {
    try {
      const text = await file.text();
      const rows = parseProductsCsv(text);
      if (rows.length === 0) return toast.error("CSV is empty");
      const headerError = rows.find((r) => r.error && r.row === 1);
      if (headerError) return toast.error("Invalid CSV", { description: headerError.error });
      const fallbackImg = PRODUCT_IMAGE_CHOICES[0]?.url ?? "";
      const fallbackBg = PRODUCT_BG_CHOICES[0] ?? "";
      const knownCats = new Set(categories.map((c) => c.toLowerCase()));
      const createRows: ProductImportItem[] = [];
      const updateRows: ProductImportItem[] = [];
      const skipRows: { row: number; error: string }[] = [];
      const newCats = new Set<string>();
      for (const r of rows) {
        if (r.error || !r.data) {
          skipRows.push({ row: r.row, error: r.error ?? "Invalid row" });
          continue;
        }
        const d = r.data;
        if (!knownCats.has(d.category.toLowerCase()) && !newCats.has(d.category.toLowerCase())) {
          newCats.add(d.category.toLowerCase());
        }
        const payload = {
          name: d.name,
          tag: d.tag || "New",
          price: d.price,
          rating: d.rating ?? 4.7,
          img: d.img || fallbackImg,
          bg: d.bg || fallbackBg,
          category: d.category,
          tagline: d.tagline ?? "",
          description: d.description ?? "",
          details: d.details ?? [],
          gallery: d.gallery && d.gallery.length ? d.gallery : [d.img || fallbackImg],
        };
        const existing = d.id ? products.find((p) => p.id === d.id) : undefined;
        if (existing) {
          updateRows.push({ id: existing.id, name: d.name, category: d.category, payload });
        } else {
          createRows.push({ id: d.id, name: d.name, category: d.category, payload });
        }
      }
      if (createRows.length + updateRows.length + skipRows.length === 0) {
        return toast.error("No rows to import");
      }
      setProductImportPlan({
        fileName: file.name,
        create: createRows,
        update: updateRows,
        skip: skipRows,
        newCategories: Array.from(newCats),
      });
    } catch (err) {
      toast.error("Import failed", {
        description: err instanceof Error ? err.message : "Could not read file",
      });
    }
  }

  function applyProductImport(plan: ProductImportPlan) {
    const known = new Set(categories.map((c) => c.toLowerCase()));
    // Create missing categories first (preserve original casing from first occurrence)
    for (const item of [...plan.create, ...plan.update]) {
      const key = item.category.toLowerCase();
      if (!known.has(key)) {
        addCategory(item.category);
        known.add(key);
      }
    }
    for (const item of plan.update) updateProduct(item.id!, item.payload);
    for (const item of plan.create)
      addProduct(item.id ? { id: item.id, ...item.payload } : item.payload);
    toast.success("Products imported", {
      description: `${plan.create.length} created · ${plan.update.length} updated${plan.skip.length ? ` · ${plan.skip.length} skipped` : ""}`,
    });
    if (plan.skip.length)
      console.warn(
        "CSV import issues:\n" + plan.skip.map((s) => `Row ${s.row}: ${s.error}`).join("\n"),
      );
    setProductImportPlan(null);
  }

  async function handleImportCategories(file: File) {
    try {
      const text = await file.text();
      const names = parseCategoriesCsv(text);
      if (names.length === 0) return toast.error("No category rows found");
      const known = new Set(categories.map((c) => c.toLowerCase()));
      const create: string[] = [];
      const skip: string[] = [];
      const seen = new Set<string>();
      for (const n of names) {
        const key = n.toLowerCase();
        if (known.has(key) || seen.has(key)) skip.push(n);
        else {
          create.push(n);
          seen.add(key);
        }
      }
      setCategoryImportPlan({ fileName: file.name, create, skip });
    } catch (err) {
      toast.error("Import failed", {
        description: err instanceof Error ? err.message : "Could not read file",
      });
    }
  }

  function applyCategoryImport(plan: CategoryImportPlan) {
    let created = 0;
    for (const n of plan.create) if (addCategory(n)) created++;
    toast.success("Categories imported", {
      description: `${created} added${plan.skip.length ? ` · ${plan.skip.length} duplicates skipped` : ""}`,
    });
    setCategoryImportPlan(null);
  }

  useEffect(() => {
    if (ready && !isAuthed) {
      const here = typeof window !== "undefined" ? window.location.pathname : "/admin";
      navigate({ to: "/admin/login", search: { redirect: here } });
    }
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

  if (!ready || !isAuthed || !mounted) {
    return <AdminDashboardSkeleton tab={tab} />;
  }

  function handleLogout() {
    const here = typeof window !== "undefined" ? window.location.pathname : "/admin";
    // Reset in-memory admin UI state before signing out
    setSelectedIds(new Set());
    setPQuery("");
    setPPage(1);
    setPMinPrice("");
    setPMaxPrice("");
    setPMinRating("");
    setPMaxRating("");
    setPCategory("all");
    setPShowFilters(false);
    setBulkTag("");
    setBulkCategory("");
    logout();
    toast.success("Signed out successfully", {
      description: "Your admin session and cached dashboard state have been cleared.",
    });
    navigate({ to: "/admin/login", search: { redirect: here } });
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FEFDF9] text-black" style={inter}>
      {/* HEADER */}
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
                Dawood Mart
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
            onClick={() => setConfirmLogout(true)}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-black text-white hover:bg-red-600 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:outline-none transition text-[10px] uppercase tracking-[0.18em] font-medium active:scale-[0.98] shadow-sm"
            aria-label="Logout of admin dashboard"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <nav className="flex gap-1 -mb-px overflow-x-auto">
            <TabButton
              active={tab === "overview"}
              onClick={() => setTab("overview")}
              icon={<LayoutDashboard className="w-3.5 h-3.5" />}
            >
              Overview
            </TabButton>
            <TabButton
              active={tab === "products"}
              onClick={() => setTab("products")}
              icon={<Package className="w-3.5 h-3.5" />}
            >
              Products <span className="ml-1 text-black/40">{products.length}</span>
            </TabButton>
            <TabButton
              active={tab === "categories"}
              onClick={() => setTab("categories")}
              icon={<Tag className="w-3.5 h-3.5" />}
            >
              Categories <span className="ml-1 text-black/40">{categories.length}</span>
            </TabButton>
            <TabButton
              active={tab === "promotions"}
              onClick={() => setTab("promotions")}
              icon={<Megaphone className="w-3.5 h-3.5" />}
            >
              Promotions
            </TabButton>
            <TabButton
              active={tab === "orders"}
              onClick={() => setTab("orders")}
              icon={<ScrollText className="w-3.5 h-3.5" />}
            >
              Orders <span className="ml-1 text-black/40">{orders.length}</span>
            </TabButton>
            <TabButton
              active={tab === "settings"}
              onClick={() => setTab("settings")}
              icon={<SettingsIcon className="w-3.5 h-3.5" />}
            >
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
                <KpiCard
                  icon={<Package className="w-4 h-4" />}
                  label="Products"
                  value={products.length.toString()}
                  hint={`${categories.length} categories`}
                />
                <KpiCard
                  icon={<Tag className="w-4 h-4" />}
                  label="Categories"
                  value={categories.length.toString()}
                  hint="Active collections"
                  accent="#FEF3C7"
                />
                <KpiCard
                  icon={<ScrollText className="w-4 h-4" />}
                  label="Orders"
                  value={orders.length.toString()}
                  hint="WhatsApp drafts"
                  accent="#ECEDEC"
                />
                <KpiCard
                  icon={<Wallet className="w-4 h-4" />}
                  label="Revenue"
                  value={formatPKR(revenue)}
                  hint="From saved orders"
                  accent="#EAEEE6"
                />
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <section className="lg:col-span-1 bg-white border border-black/10 rounded-2xl p-5 sm:p-6">
                  <SectionTitle icon={<TrendingUp className="w-3.5 h-3.5" />} label="By category" />
                  <ul className="mt-4 space-y-3">
                    {byCategory.length === 0 && (
                      <li className="text-sm text-black/40">No categories yet.</li>
                    )}
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

                <section className="lg:col-span-2 bg-white border border-black/10 rounded-2xl p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <SectionTitle
                      icon={<ScrollText className="w-3.5 h-3.5" />}
                      label="Recent orders"
                    />
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
                        <li key={o.id} className="py-3 flex items-center gap-3 sm:gap-4">
                          <div
                            className={`w-10 h-10 rounded-lg overflow-hidden shrink-0 ${o.primaryBg ?? "bg-black/5"} grid place-items-center`}
                          >
                            {o.primaryImg ? (
                              <SafeImage
                                src={o.primaryImg}
                                alt=""
                                className="w-full h-full object-cover"
                              />
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
                              <span>
                                {o.itemCount} item{o.itemCount === 1 ? "" : "s"}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm tabular-nums shrink-0">{formatPKR(o.total)}</div>
                          <button
                            onClick={() => {
                              void removeOrder(o.id);
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
                <SectionTitle
                  icon={<Package className="w-3.5 h-3.5" />}
                  label={`Products (${filteredProducts.length}${filteredProducts.length !== products.length ? ` of ${products.length}` : ""})`}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={productImportRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleImportProducts(f);
                      e.target.value = "";
                    }}
                  />
                  <button
                    onClick={() => productImportRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-black/15 hover:border-black transition text-[10px] uppercase tracking-[0.18em]"
                  >
                    <Upload className="w-3 h-3" /> Import CSV
                  </button>
                  <button
                    onClick={handleExportProducts}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-black/15 hover:border-black transition text-[10px] uppercase tracking-[0.18em]"
                  >
                    <Download className="w-3 h-3" /> Export CSV
                  </button>
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
                <EmptyState
                  label="No products yet"
                  cta="Create your first product"
                  onCta={() => setProductDialog({ mode: "create" })}
                />
              ) : (
                <>
                  <div className="mb-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
                        <input
                          value={pQuery}
                          onChange={(e) => setPQuery(e.target.value)}
                          placeholder="Search name, tagline, category…"
                          className="w-full pl-9 pr-8 py-2 text-sm rounded-full border border-black/15 focus:border-black focus:outline-none transition"
                        />
                        {pQuery && (
                          <button
                            onClick={() => setPQuery("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 grid place-items-center rounded-full text-black/40 hover:text-black hover:bg-black/5"
                            aria-label="Clear search"
                          >
                            <XIcon className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <select
                        value={pCategory}
                        onChange={(e) => setPCategory(e.target.value)}
                        className="px-3 py-2 text-sm rounded-full border border-black/15 focus:border-black focus:outline-none transition bg-white"
                      >
                        <option value="all">All categories</option>
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => setPShowFilters((v) => !v)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full border transition text-[10px] uppercase tracking-[0.18em] ${pShowFilters ? "border-black bg-black text-white" : "border-black/15 hover:border-black"}`}
                      >
                        Advanced
                      </button>
                      {hasActiveFilters && (
                        <button
                          onClick={clearProductFilters}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-black/15 hover:border-black transition text-[10px] uppercase tracking-[0.18em]"
                        >
                          <XIcon className="w-3 h-3" /> Clear
                        </button>
                      )}
                    </div>
                    {pShowFilters && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-black/[0.03] border border-black/5">
                        <label className="block">
                          <span className="block text-[10px] uppercase tracking-[0.18em] text-black/50 mb-1">
                            Min price (PKR)
                          </span>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold tracking-wide text-black/55 pointer-events-none">
                              PKR
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={pMinPrice}
                              onChange={(e) => setPMinPrice(e.target.value)}
                              placeholder="0"
                              className="w-full pl-12 pr-3 py-1.5 text-sm rounded-lg border border-black/15 focus:border-black focus:outline-none bg-white tabular-nums"
                            />
                          </div>
                        </label>
                        <label className="block">
                          <span className="block text-[10px] uppercase tracking-[0.18em] text-black/50 mb-1">
                            Max price (PKR)
                          </span>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold tracking-wide text-black/55 pointer-events-none">
                              PKR
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={pMaxPrice}
                              onChange={(e) => setPMaxPrice(e.target.value)}
                              placeholder="Any"
                              className="w-full pl-12 pr-3 py-1.5 text-sm rounded-lg border border-black/15 focus:border-black focus:outline-none bg-white tabular-nums"
                            />
                          </div>
                        </label>
                        <label className="block">
                          <span className="block text-[10px] uppercase tracking-[0.18em] text-black/50 mb-1">
                            Min rating
                          </span>
                          <input
                            type="number"
                            min="0"
                            max="5"
                            step="0.1"
                            value={pMinRating}
                            onChange={(e) => setPMinRating(e.target.value)}
                            placeholder="0.0"
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-black/15 focus:border-black focus:outline-none bg-white"
                          />
                        </label>
                        <label className="block">
                          <span className="block text-[10px] uppercase tracking-[0.18em] text-black/50 mb-1">
                            Max rating
                          </span>
                          <input
                            type="number"
                            min="0"
                            max="5"
                            step="0.1"
                            value={pMaxRating}
                            onChange={(e) => setPMaxRating(e.target.value)}
                            placeholder="5.0"
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-black/15 focus:border-black focus:outline-none bg-white"
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  {filteredProducts.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="text-sm text-black/60">No products match your filters.</div>
                      <button
                        onClick={clearProductFilters}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-black/15 hover:border-black transition text-[10px] uppercase tracking-[0.18em]"
                      >
                        Clear filters
                      </button>
                    </div>
                  ) : (
                    <>
                      {selectedCount > 0 && (
                        <div className="mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3 rounded-xl bg-black text-white">
                          <div className="text-[11px] uppercase tracking-[0.18em]">
                            {selectedCount} selected
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              value={bulkCategory}
                              onChange={(e) => setBulkCategory(e.target.value)}
                              className="px-3 py-1.5 text-xs rounded-full bg-white text-black border border-white/20 focus:outline-none"
                            >
                              <option value="">Move to category…</option>
                              {categories.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={applyBulkCategory}
                              disabled={!bulkCategory}
                              className="px-3 py-1.5 rounded-full bg-white text-black text-[10px] uppercase tracking-[0.18em] disabled:opacity-40 hover:bg-white/90 transition"
                            >
                              Apply
                            </button>
                            <input
                              value={bulkTag}
                              onChange={(e) => setBulkTag(e.target.value)}
                              placeholder="Set tag…"
                              className="px-3 py-1.5 text-xs rounded-full bg-white text-black border border-white/20 focus:outline-none placeholder:text-black/40 w-32"
                            />
                            <button
                              onClick={applyBulkTag}
                              disabled={!bulkTag.trim()}
                              className="px-3 py-1.5 rounded-full bg-white text-black text-[10px] uppercase tracking-[0.18em] disabled:opacity-40 hover:bg-white/90 transition"
                            >
                              Apply
                            </button>
                            <button
                              onClick={applyBulkExport}
                              className="px-3 py-1.5 rounded-full bg-white text-black text-[10px] uppercase tracking-[0.18em] hover:bg-white/90 transition inline-flex items-center gap-1.5"
                            >
                              <Download className="w-3 h-3" /> Export CSV
                            </button>
                            <button
                              onClick={() => setConfirmBulkDelete(true)}
                              className="px-3 py-1.5 rounded-full bg-red-600 text-white text-[10px] uppercase tracking-[0.18em] hover:bg-red-700 transition inline-flex items-center gap-1.5"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                            <button
                              onClick={clearSelection}
                              className="px-3 py-1.5 rounded-full border border-white/30 text-white text-[10px] uppercase tracking-[0.18em] hover:bg-white/10 transition"
                            >
                              Clear
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
                        <table className="w-full text-sm min-w-[760px]">
                          <thead>
                            <tr className="text-left text-[10px] uppercase tracking-[0.18em] text-black/45 border-b border-black/10">
                              <th className="py-2 pr-3 font-medium w-8">
                                <input
                                  type="checkbox"
                                  checked={allPageSelected}
                                  ref={(el) => {
                                    if (el) el.indeterminate = !allPageSelected && somePageSelected;
                                  }}
                                  onChange={togglePageSelection}
                                  aria-label="Select all on this page"
                                  className="w-4 h-4 accent-black cursor-pointer"
                                />
                              </th>
                              <th className="py-2 pr-3 font-medium">Item</th>
                              <th className="py-2 pr-3 font-medium">Category</th>
                              <th className="py-2 pr-3 font-medium">Tag</th>
                              <th className="py-2 pr-3 font-medium">Rating</th>
                              <th className="py-2 pr-3 font-medium text-right">Price</th>
                              <th className="py-2 pl-3 font-medium text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-black/5">
                            {pagedProducts.map((p) => {
                              const checked = selectedIds.has(p.id);
                              return (
                                <tr
                                  key={p.id}
                                  className={`hover:bg-black/[0.02] ${checked ? "bg-black/[0.03]" : ""}`}
                                >
                                  <td className="py-3 pr-3">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => toggleSelect(p.id)}
                                      aria-label={`Select ${p.name}`}
                                      className="w-4 h-4 accent-black cursor-pointer"
                                    />
                                  </td>
                                  <td className="py-3 pr-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div
                                        className={`w-10 h-10 rounded-lg ${p.bg} grid place-items-center overflow-hidden shrink-0`}
                                      >
                                        <SafeImage
                                          src={p.img}
                                          alt=""
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <div className="min-w-0">
                                        <div className="truncate">{p.name}</div>
                                        <div className="text-[11px] text-black/50 truncate">
                                          {p.tagline}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 pr-3 text-black/70">{p.category}</td>
                                  <td className="py-3 pr-3 text-black/70">{p.tag}</td>
                                  <td className="py-3 pr-3 text-black/70 tabular-nums">
                                    {p.rating.toFixed(1)}
                                  </td>
                                  <td className="py-3 pr-3 text-right tabular-nums">
                                    {formatPKR(p.price)}
                                  </td>
                                  <td className="py-3 pl-3">
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        onClick={() =>
                                          setProductDialog({ mode: "edit", product: p })
                                        }
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
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[11px] text-black/60">
                        <div className="flex items-center gap-2">
                          <span>
                            Showing {(pCurrentPage - 1) * pPageSize + 1}–
                            {Math.min(pCurrentPage * pPageSize, filteredProducts.length)} of{" "}
                            {filteredProducts.length}
                          </span>
                          <span className="text-black/30">·</span>
                          <label className="inline-flex items-center gap-1.5">
                            <span>Per page</span>
                            <select
                              value={pPageSize}
                              onChange={(e) => setPPageSize(Number(e.target.value))}
                              className="px-2 py-1 rounded-md border border-black/15 focus:border-black focus:outline-none bg-white"
                            >
                              {[5, 10, 25, 50, 100].map((n) => (
                                <option key={n} value={n}>
                                  {n}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setPPage((p) => Math.max(1, p - 1))}
                            disabled={pCurrentPage <= 1}
                            className="w-8 h-8 rounded-full grid place-items-center border border-black/15 hover:border-black disabled:opacity-40 disabled:hover:border-black/15 transition"
                            aria-label="Previous page"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 tabular-nums">
                            {pCurrentPage} / {pTotalPages}
                          </span>
                          <button
                            onClick={() => setPPage((p) => Math.min(pTotalPages, p + 1))}
                            disabled={pCurrentPage >= pTotalPages}
                            className="w-8 h-8 rounded-full grid place-items-center border border-black/15 hover:border-black disabled:opacity-40 disabled:hover:border-black/15 transition"
                            aria-label="Next page"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </section>
          )}

          {tab === "categories" && (
            <section className="bg-white border border-black/10 rounded-2xl p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <SectionTitle
                  icon={<Tag className="w-3.5 h-3.5" />}
                  label={`Categories (${categories.length})`}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={categoryImportRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleImportCategories(f);
                      e.target.value = "";
                    }}
                  />
                  <button
                    onClick={() => categoryImportRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-black/15 hover:border-black transition text-[10px] uppercase tracking-[0.18em]"
                  >
                    <Upload className="w-3 h-3" /> Import CSV
                  </button>
                  <button
                    onClick={handleExportCategories}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-black/15 hover:border-black transition text-[10px] uppercase tracking-[0.18em]"
                  >
                    <Download className="w-3 h-3" /> Export CSV
                  </button>
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
                <EmptyState
                  label="No categories yet"
                  cta="Create your first category"
                  onCta={() => setCategoryDialog({ mode: "create" })}
                />
              ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categories.map((c) => {
                    const count = products.filter((p) => p.category === c).length;
                    const thumb = categoryInfo[c]?.imageUrl;
                    return (
                      <li
                        key={c}
                        className="border border-black/10 rounded-xl p-3 flex items-start gap-3 hover:border-black/25 transition"
                      >
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-black/5 border border-black/5 shrink-0 grid place-items-center">
                          {thumb ? (
                            <SafeImage src={thumb} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-black/30" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] uppercase tracking-[0.22em] text-black/45">
                            Category
                          </div>
                          <div
                            className="mt-0.5 text-lg truncate"
                            style={{ ...dmSans, fontWeight: 400, letterSpacing: "-0.02em" }}
                          >
                            {c}
                          </div>
                          <div className="mt-0.5 text-xs text-black/50">
                            {count} product{count === 1 ? "" : "s"}
                            {!thumb && <span className="ml-1 text-amber-700">· no image</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setCategoryDialog({ mode: "edit", name: c })}
                            aria-label={`Edit ${c}`}
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

          {tab === "orders" && (
            <OrdersPanel
              orders={orders}
              loading={ordersLoading}
              error={ordersError}
              onRefetch={refetchOrders}
              onRemove={removeOrder}
              onUpdateStatus={updateStatus}
            />
          )}

          {tab === "promotions" && <PromotionsPanel categories={categories} />}

          {tab === "settings" && <SettingsPanel />}
        </div>
      </main>

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
          initialImageUrl={
            categoryDialog.name ? (categoryInfo[categoryDialog.name]?.imageUrl ?? "") : ""
          }
          existing={categories}
          onClose={() => setCategoryDialog(null)}
          onCreate={(name, imageUrl) => {
            if (addCategory(name, imageUrl)) {
              toast.success("Category created", { description: name });
              setCategoryDialog(null);
            } else {
              toast.error("Category already exists");
            }
          }}
          onSave={(oldName, newName) => {
            if (renameCategory(oldName, newName)) {
              toast.success("Category renamed", { description: `${oldName} → ${newName}` });
            } else {
              toast.error("Rename failed", { description: "Name is empty or duplicated." });
            }
          }}
          onUpdateImage={(name, imageUrl) => {
            updateCategoryImage(name, imageUrl);
            toast.success(imageUrl ? "Category image updated" : "Category image removed", {
              description: name,
            });
            setCategoryDialog(null);
          }}
        />
      )}

      {/* Delete product confirm */}
      <AlertDialog open={!!confirmProduct} onOpenChange={(o) => !o && setConfirmProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{confirmProduct?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This product will be permanently removed from the shop. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {confirmProduct && (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-black/10 bg-black/[0.02]">
              <div
                className={`w-10 h-10 rounded-lg ${confirmProduct.bg} grid place-items-center overflow-hidden shrink-0`}
              >
                <SafeImage src={confirmProduct.img} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 text-sm">
                <div className="truncate font-medium">{confirmProduct.name}</div>
                <div className="text-[11px] text-black/50 truncate">
                  {confirmProduct.category} · {formatPKR(confirmProduct.price)}
                </div>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-600"
              onClick={() => {
                if (confirmProduct) {
                  deleteProduct(confirmProduct.id);
                  toast.success("Product deleted", { description: confirmProduct.name });
                }
                setConfirmProduct(null);
              }}
            >
              Delete product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Logout confirm */}
      <AlertDialog open={confirmLogout} onOpenChange={setConfirmLogout}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out of admin?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll be returned to the login screen. Unsaved changes in open dialogs will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay signed in</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmLogout(false);
                handleLogout();
              }}
              className="bg-black text-white hover:bg-red-600"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" /> Sign out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk delete confirm */}
      <AlertDialog open={confirmBulkDelete} onOpenChange={(o) => !o && setConfirmBulkDelete(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedCount} product{selectedCount === 1 ? "" : "s"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              These products will be permanently removed from the shop. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-600"
              onClick={applyBulkDelete}
            >
              Delete {selectedCount}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete category confirm */}
      <AlertDialog open={!!confirmCategory} onOpenChange={(o) => !o && setConfirmCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{confirmCategory}” category?</AlertDialogTitle>
            <AlertDialogDescription>
              This category will be permanently removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {confirmCategory &&
            (() => {
              const affected = products.filter((p) => p.category === confirmCategory);
              if (affected.length === 0) {
                return (
                  <div className="p-3 rounded-lg border border-black/10 bg-black/[0.02] text-[12px] text-black/60">
                    No products are assigned to this category.
                  </div>
                );
              }
              return (
                <div className="p-3 rounded-lg border border-red-200 bg-red-50 space-y-2">
                  <div className="flex items-start gap-2 text-[12px] text-red-800">
                    <Trash2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium uppercase tracking-[0.12em] text-[10px] mb-1">
                        Cascade warning
                      </div>
                      <div>
                        Deleting this category will also permanently remove{" "}
                        <span className="font-semibold">
                          {affected.length} product{affected.length === 1 ? "" : "s"}
                        </span>{" "}
                        assigned to it.
                      </div>
                    </div>
                  </div>
                  <ul className="max-h-32 overflow-y-auto text-[12px] text-red-900/80 space-y-0.5 pl-5 list-disc">
                    {affected.slice(0, 6).map((p) => (
                      <li key={p.id} className="truncate">
                        {p.name}
                      </li>
                    ))}
                    {affected.length > 6 && (
                      <li className="list-none text-red-800/70">+{affected.length - 6} more…</li>
                    )}
                  </ul>
                </div>
              );
            })()}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-600"
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
              {confirmCategory && products.some((p) => p.category === confirmCategory)
                ? "Delete category & products"
                : "Delete category"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset confirms */}
      <AlertDialog open={confirmResetProducts} onOpenChange={setConfirmResetProducts}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset products to seed?</AlertDialogTitle>
            <AlertDialogDescription>
              All local changes to products will be replaced with the original catalogue.
            </AlertDialogDescription>
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
            <AlertDialogDescription>
              The original four categories will be restored.
            </AlertDialogDescription>
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

      {/* Product import preview */}
      <AlertDialog
        open={!!productImportPlan}
        onOpenChange={(o) => !o && setProductImportPlan(null)}
      >
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Review product import</AlertDialogTitle>
            <AlertDialogDescription>
              {productImportPlan?.fileName ? `From ${productImportPlan.fileName}. ` : ""}
              Confirm the changes before applying them to your catalogue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {productImportPlan && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <ImportStat label="Create" value={productImportPlan.create.length} tone="green" />
                <ImportStat label="Update" value={productImportPlan.update.length} tone="blue" />
                <ImportStat label="Skip" value={productImportPlan.skip.length} tone="amber" />
              </div>
              {productImportPlan.newCategories.length > 0 && (
                <div className="text-[11px] text-black/70 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <span className="font-medium">{productImportPlan.newCategories.length}</span> new
                  categor{productImportPlan.newCategories.length === 1 ? "y" : "ies"} will be
                  auto-created:{" "}
                  <span className="text-black/60">
                    {productImportPlan.newCategories.slice(0, 6).join(", ")}
                    {productImportPlan.newCategories.length > 6 ? "…" : ""}
                  </span>
                </div>
              )}
              <ImportRowList
                title="Will be created"
                items={productImportPlan.create.map((c) => `${c.name} · ${c.category}`)}
              />
              <ImportRowList
                title="Will be updated"
                items={productImportPlan.update.map((c) => `${c.name} · ${c.category}`)}
              />
              {productImportPlan.skip.length > 0 && (
                <ImportRowList
                  title="Skipped rows"
                  tone="amber"
                  items={productImportPlan.skip.map((s) => `Row ${s.row}: ${s.error}`)}
                />
              )}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={
                !productImportPlan ||
                productImportPlan.create.length + productImportPlan.update.length === 0
              }
              onClick={() => productImportPlan && applyProductImport(productImportPlan)}
            >
              Apply import
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Category import preview */}
      <AlertDialog
        open={!!categoryImportPlan}
        onOpenChange={(o) => !o && setCategoryImportPlan(null)}
      >
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Review category import</AlertDialogTitle>
            <AlertDialogDescription>
              {categoryImportPlan?.fileName ? `From ${categoryImportPlan.fileName}. ` : ""}
              Duplicates of existing categories will be skipped.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {categoryImportPlan && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <ImportStat label="Create" value={categoryImportPlan.create.length} tone="green" />
                <ImportStat label="Skip" value={categoryImportPlan.skip.length} tone="amber" />
              </div>
              <ImportRowList title="Will be created" items={categoryImportPlan.create} />
              {categoryImportPlan.skip.length > 0 && (
                <ImportRowList
                  title="Skipped (duplicates)"
                  tone="amber"
                  items={categoryImportPlan.skip}
                />
              )}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!categoryImportPlan || categoryImportPlan.create.length === 0}
              onClick={() => categoryImportPlan && applyCategoryImport(categoryImportPlan)}
            >
              Apply import
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

  const ready = useMounted();

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ ...dmSans, fontWeight: 400, letterSpacing: "-0.02em" }}>
            {mode === "create" ? "New product" : "Edit product"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new item to the Dawood Mart catalogue."
              : `Editing “${product?.name}”.`}
          </DialogDescription>
        </DialogHeader>

        {!ready ? (
          <ProductFormSkeleton mode={mode} />
        ) : (
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
                <input
                  value={form.tag}
                  onChange={(e) => set("tag", e.target.value)}
                  className="mt-input"
                  placeholder="Bestseller"
                />
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
              <Field label="Price (PKR)">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  value={form.price === 0 ? "" : form.price}
                  onChange={(e) => {
                    const v = e.target.value;
                    set("price", v === "" ? 0 : Number(v));
                  }}
                  placeholder="0.00"
                  className="mt-input tabular-nums"
                />
                <div className="mt-1 text-[11px] text-black/55 tabular-nums">
                  Displays as{" "}
                  <span className="text-black font-medium">
                    {formatPKR(Number(form.price) || 0)}
                  </span>
                </div>
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
              <input
                value={form.tagline}
                onChange={(e) => set("tagline", e.target.value)}
                className="mt-input"
                placeholder="Short elevator pitch"
              />
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
              <ImageUploader
                value={form.img}
                onChange={(url) =>
                  setForm((f) => ({
                    ...f,
                    img: url,
                    gallery:
                      f.gallery && f.gallery.length
                        ? [url, ...f.gallery.filter((x) => x !== url)].slice(0, 4)
                        : [url],
                  }))
                }
              />
              <div className="mt-3">
                <div className="text-[10px] uppercase tracking-[0.18em] text-black/45 mb-2">
                  Or pick a preset
                </div>
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
                                ? [choice.url, ...f.gallery.filter((x) => x !== choice.url)].slice(
                                    0,
                                    4,
                                  )
                                : [choice.url],
                          }))
                        }
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition ${
                          active ? "border-black" : "border-transparent hover:border-black/30"
                        }`}
                        aria-label={choice.label}
                      >
                        <img src={choice.url} alt="" className="w-full h-full object-cover" />
                        {active && (
                          <div className="absolute inset-0 ring-2 ring-black rounded-lg" />
                        )}
                      </button>
                    );
                  })}
                </div>
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
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full border border-black/15 text-[11px] uppercase tracking-[0.18em] hover:bg-black/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-black text-white text-[11px] uppercase tracking-[0.18em] hover:bg-black/85 active:scale-[0.98]"
              >
                {mode === "create" ? "Create product" : "Save changes"}
              </button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------- CATEGORY DIALOG ----------------------------- */

function CategoryFormDialog({
  mode,
  name,
  initialImageUrl,
  existing,
  onClose,
  onCreate,
  onSave,
  onUpdateImage,
}: {
  mode: "create" | "edit";
  name?: string;
  initialImageUrl?: string;
  existing: string[];
  onClose: () => void;
  onCreate: (name: string, imageUrl: string) => void;
  onSave: (oldName: string, newName: string) => void;
  onUpdateImage: (name: string, imageUrl: string) => void;
}) {
  const [value, setValue] = useState(name ?? "");
  const [imageUrl, setImageUrl] = useState(initialImageUrl ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = value.trim();
    if (!clean) return toast.error("Name is required");
    if (mode === "edit" && name) {
      if (clean !== name) onSave(name, clean);
      if ((imageUrl ?? "") !== (initialImageUrl ?? "")) onUpdateImage(clean, imageUrl);
      if (clean === name && (imageUrl ?? "") === (initialImageUrl ?? "")) onClose();
    } else {
      onCreate(clean, imageUrl);
    }
  }

  const isDup =
    value.trim().length > 0 &&
    existing.some((c) => c.toLowerCase() === value.trim().toLowerCase() && c !== name);

  const ready = useMounted();

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle style={{ ...dmSans, fontWeight: 400, letterSpacing: "-0.02em" }}>
            {mode === "create" ? "New category" : "Edit category"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Group products under a new department name and add a hero image."
              : `Update the “${name}” category name or hero image — products will follow.`}
          </DialogDescription>
        </DialogHeader>
        {!ready ? (
          <CategoryFormSkeleton mode={mode} />
        ) : (
          <form onSubmit={submit} className="space-y-4" style={inter}>
            <Field label="Name">
              <input
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="mt-input"
                placeholder="e.g. Bath, Kitchen, Bedroom"
              />
              {isDup && (
                <div className="mt-1 text-[11px] text-red-600">This name already exists.</div>
              )}
            </Field>
            <Field label="Hero image">
              <ImageUploader value={imageUrl} onChange={setImageUrl} />
              <div className="mt-1 text-[11px] text-black/50">
                Shown on the “Shop by room” card. Falls back to a product image when empty.
              </div>
            </Field>
            <DialogFooter className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full border border-black/15 text-[11px] uppercase tracking-[0.18em] hover:bg-black/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isDup || !value.trim()}
                className="px-5 py-2 rounded-full bg-black text-white text-[11px] uppercase tracking-[0.18em] hover:bg-black/85 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                {mode === "create" ? "Create" : "Save"}
              </button>
            </DialogFooter>
          </form>
        )}
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

/* -------------------------------- SETTINGS -------------------------------- */

const SOCIAL_FIELDS: { key: SocialKey; label: string; placeholder: string }[] = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourbrand" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/yourbrand" },
  { key: "twitter", label: "Twitter / X", placeholder: "https://x.com/yourbrand" },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@yourbrand" },
  { key: "pinterest", label: "Pinterest", placeholder: "https://pinterest.com/yourbrand" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@yourbrand" },
];

function SectionErrorBanner({
  message,
  busy,
  onRetry,
  onDismiss,
}: {
  message: string;
  busy?: boolean;
  onRetry: () => void;
  onDismiss?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-red-200 bg-red-50 text-red-900 px-4 py-3"
    >
      <div className="flex items-start gap-2 flex-1 min-w-0">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
        <div className="text-[12px] leading-snug">
          <div className="font-medium">Something went wrong</div>
          <div className="text-red-800/80 truncate">{message}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onRetry}
          disabled={busy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-900 text-white hover:bg-red-800 transition text-[10px] uppercase tracking-[0.18em] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-3 h-3 ${busy ? "animate-spin" : ""}`} /> Retry
        </button>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-300 text-red-900 hover:bg-red-100 transition text-[10px] uppercase tracking-[0.18em]"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}

function EmptySectionPrompt({
  title,
  description,
  suggestions,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  suggestions: string[];
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="rounded-xl border border-dashed border-black/20 bg-black/[0.02] px-4 py-4 flex flex-col sm:flex-row sm:items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-black/5 border border-black/10 grid place-items-center shrink-0">
        <SettingsIcon className="w-3.5 h-3.5 text-black/60" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-black">{title}</div>
        <div className="text-[12px] text-black/60 mt-0.5">{description}</div>
        {suggestions.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <li
                key={s}
                className="text-[10px] uppercase tracking-[0.16em] text-black/60 border border-black/10 rounded-full px-2 py-1 bg-white"
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        onClick={onAction}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-black text-white hover:bg-black/85 transition text-[10px] uppercase tracking-[0.18em] active:scale-[0.98] self-start"
      >
        {actionLabel}
      </button>
    </div>
  );
}

type SettingsSection = "brand" | "contact" | "socials";

function SettingsPanel() {
  const ready = useMounted();
  const saved = useSettings();
  const [draft, setDraft] = useState(saved);
  const [confirmReset, setConfirmReset] = useState(false);
  const [savingSection, setSavingSection] = useState<null | SettingsSection | "all">(null);
  const [refreshingSection, setRefreshingSection] = useState<null | SettingsSection>(null);
  const [sectionErrors, setSectionErrors] = useState<Record<SettingsSection, string | null>>({
    brand: null,
    contact: null,
    socials: null,
  });
  const [simulateFailure, setSimulateFailure] = useState(false);

  useEffect(() => {
    setDraft(saved);
  }, [saved]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const setError = (section: SettingsSection, msg: string | null) =>
    setSectionErrors((prev) => ({ ...prev, [section]: msg }));

  const targetsForScope = (scope: SettingsSection | "all"): SettingsSection[] =>
    scope === "all" ? ["brand", "contact", "socials"] : [scope];

  const save = async (scope: SettingsSection | "all" = "all") => {
    if (savingSection) return;
    const prev = saved;
    const next = draft;
    const targets = targetsForScope(scope);
    setSavingSection(scope);
    targets.forEach((s) => setError(s, null));
    // Optimistic: apply immediately so UI reflects the new values.
    updateSettings(next);
    try {
      await saveSettingsAsync(next, {
        latencyMs: 500,
        failureRate: simulateFailure ? 1 : 0,
      });
      toast.success("Settings saved", { description: "Changes are live." });
    } catch (err) {
      // Rollback to the pre-save snapshot.
      updateSettings(prev);
      setDraft(prev);
      const message = err instanceof Error ? err.message : "Save failed. Changes reverted.";
      targets.forEach((s) => setError(s, message));
      toast.error("Save failed — changes reverted", {
        description: message,
        action: { label: "Retry", onClick: () => void save(scope) },
      });
    } finally {
      setSavingSection(null);
    }
  };

  const refresh = async (section: SettingsSection) => {
    if (refreshingSection) return;
    setRefreshingSection(section);
    setError(section, null);
    try {
      await saveSettingsAsync(saved, {
        latencyMs: 400,
        failureRate: simulateFailure ? 1 : 0,
      });
      setDraft(saved);
      toast.success("Section refreshed");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not load latest values.";
      setError(section, message);
      toast.error("Refresh failed", { description: message });
    } finally {
      setRefreshingSection(null);
    }
  };

  const brandBusy =
    savingSection === "brand" || savingSection === "all" || refreshingSection === "brand";
  const contactBusy =
    savingSection === "contact" || savingSection === "all" || refreshingSection === "contact";
  const socialsBusy =
    savingSection === "socials" || savingSection === "all" || refreshingSection === "socials";
  const showBrand = !ready || brandBusy;
  const showContact = !ready || contactBusy;
  const showSocials = !ready || socialsBusy;
  const brandFirstRef = useRef<HTMLInputElement>(null);
  const contactFirstRef = useRef<HTMLInputElement>(null);
  const socialsFirstRef = useRef<HTMLInputElement>(null);

  const focusField = (ref: { current: HTMLInputElement | null }) => {
    const el = ref.current;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => el.focus(), 250);
  };

  const brandEmpty =
    !saved.brandName.trim() &&
    !saved.tagline.trim() &&
    !saved.logoUrl.trim() &&
    !saved.whatsappNumber.trim();
  const contactEmpty =
    !saved.contactEmail.trim() && !saved.contactPhone.trim() && !saved.address.trim();
  const socialsEmpty = SOCIAL_FIELDS.every((f) => !saved.socials[f.key]?.trim());

  return (
    <>
      {showBrand ? (
        <SettingsSectionSkeleton rows={2} cols={2} actions />
      ) : (
        <section className="bg-white border border-black/10 rounded-2xl p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <SectionTitle icon={<SettingsIcon className="w-3.5 h-3.5" />} label="Site settings" />
            <div className="flex items-center gap-2 flex-wrap">
              <label className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-black/60 select-none cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-black"
                  checked={simulateFailure}
                  onChange={(e) => setSimulateFailure(e.target.checked)}
                />
                Simulate failure
              </label>
              <button
                onClick={() => void refresh("brand")}
                disabled={refreshingSection !== null || savingSection !== null}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-black/15 hover:border-black transition text-[10px] uppercase tracking-[0.18em] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  className={`w-3 h-3 ${brandBusy && refreshingSection ? "animate-spin" : ""}`}
                />{" "}
                Refresh
              </button>
              <button
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-black/15 hover:border-black transition text-[10px] uppercase tracking-[0.18em]"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button
                onClick={() => void save("brand")}
                disabled={!dirty || savingSection !== null}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black text-white hover:bg-black/85 transition text-[10px] uppercase tracking-[0.18em] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save changes
              </button>
            </div>
          </div>

          {sectionErrors.brand && (
            <SectionErrorBanner
              message={sectionErrors.brand}
              busy={brandBusy}
              onRetry={() => void save("brand")}
              onDismiss={() => setError("brand", null)}
            />
          )}

          {brandEmpty && !sectionErrors.brand && (
            <EmptySectionPrompt
              title="No brand details saved yet"
              description="Add your brand name, tagline, logo, and WhatsApp number so the storefront and order messages feel like yours."
              suggestions={["Brand name", "Tagline", "Logo URL", "WhatsApp"]}
              actionLabel="Set brand name"
              onAction={() => focusField(brandFirstRef)}
            />
          )}

          {/* Brand */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Brand name">
              <input
                ref={brandFirstRef}
                className="mt-input"
                value={draft.brandName}
                onChange={(e) => setDraft({ ...draft, brandName: e.target.value })}
                placeholder="Dawood Mart"
              />
            </Field>
            <Field label="Tagline">
              <input
                className="mt-input"
                value={draft.tagline}
                onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
                placeholder="Essentials for a tactile home"
              />
            </Field>
            <Field label="Logo URL">
              <div className="flex items-center gap-3">
                <input
                  className="mt-input flex-1"
                  value={draft.logoUrl}
                  onChange={(e) => setDraft({ ...draft, logoUrl: e.target.value })}
                  placeholder="https://…/logo.png"
                />
                {draft.logoUrl && (
                  <img
                    src={draft.logoUrl}
                    alt="logo preview"
                    className="w-10 h-10 rounded-lg object-cover bg-black/5 border border-black/10"
                  />
                )}
              </div>
            </Field>
            <Field label="WhatsApp number (Pakistan, e.g. 0301-1234567)">
              <input
                className="mt-input"
                value={formatPkPhone(draft.whatsappNumber)}
                onChange={(e) =>
                  setDraft({ ...draft, whatsappNumber: normalizePkDigits(e.target.value) })
                }
                inputMode="numeric"
                autoComplete="tel"
                maxLength={12}
                placeholder={PK_PHONE_PLACEHOLDER}
                aria-invalid={
                  draft.whatsappNumber.length > 0 && !isValidPkPhone(draft.whatsappNumber)
                }
              />
              {draft.whatsappNumber.length > 0 && !isValidPkPhone(draft.whatsappNumber) && (
                <p className="mt-1 text-[11px] text-red-600">
                  Enter an 11-digit Pakistani mobile starting with 03 (e.g. 0301-1234567).
                </p>
              )}
            </Field>
          </div>
        </section>
      )}

      {/* Contact */}
      {showContact ? (
        <SettingsSectionSkeleton rows={1} cols={3} />
      ) : (
        <section className="bg-white border border-black/10 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <SectionTitle icon={<SettingsIcon className="w-3.5 h-3.5" />} label="Contact" />
            <div className="flex items-center gap-2">
              <button
                onClick={() => void refresh("contact")}
                disabled={refreshingSection !== null || savingSection !== null}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-black/15 hover:border-black transition text-[10px] uppercase tracking-[0.18em] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  className={`w-3 h-3 ${contactBusy && refreshingSection ? "animate-spin" : ""}`}
                />{" "}
                Refresh
              </button>
              <button
                onClick={() => void save("contact")}
                disabled={!dirty || savingSection !== null}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black text-white hover:bg-black/85 transition text-[10px] uppercase tracking-[0.18em] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save changes
              </button>
            </div>
          </div>
          {sectionErrors.contact && (
            <SectionErrorBanner
              message={sectionErrors.contact}
              busy={contactBusy}
              onRetry={() => void save("contact")}
              onDismiss={() => setError("contact", null)}
            />
          )}
          {contactEmpty && !sectionErrors.contact && (
            <EmptySectionPrompt
              title="No contact details saved yet"
              description="Add an email, phone, and shop address so customers can reach you and orders include a shipping origin."
              suggestions={["Email", "Phone", "Address"]}
              actionLabel="Add email"
              onAction={() => focusField(contactFirstRef)}
            />
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Email">
              <input
                ref={contactFirstRef}
                type="email"
                className="mt-input"
                value={draft.contactEmail}
                onChange={(e) => setDraft({ ...draft, contactEmail: e.target.value })}
                placeholder="hello@brand.com"
              />
            </Field>
            <Field label="Phone">
              <input
                className="mt-input"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={12}
                value={formatPkPhone(draft.contactPhone)}
                onChange={(e) =>
                  setDraft({ ...draft, contactPhone: normalizePkDigits(e.target.value) })
                }
                placeholder={PK_PHONE_PLACEHOLDER}
                aria-invalid={draft.contactPhone.length > 0 && !isValidPkPhone(draft.contactPhone)}
              />
              {draft.contactPhone.length > 0 && !isValidPkPhone(draft.contactPhone) && (
                <p className="mt-1 text-[11px] text-red-600">
                  Enter an 11-digit Pakistani mobile starting with 03.
                </p>
              )}
            </Field>
            <Field label="Address">
              <input
                className="mt-input"
                value={draft.address}
                onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                placeholder="Street, City"
              />
            </Field>
          </div>
        </section>
      )}

      {/* Socials */}
      {showSocials ? (
        <SettingsSectionSkeleton rows={3} cols={2} />
      ) : (
        <section className="bg-white border border-black/10 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <SectionTitle icon={<SettingsIcon className="w-3.5 h-3.5" />} label="Social media" />
            <button
              onClick={() => void refresh("socials")}
              disabled={refreshingSection !== null || savingSection !== null}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-black/15 hover:border-black transition text-[10px] uppercase tracking-[0.18em] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`w-3 h-3 ${socialsBusy && refreshingSection ? "animate-spin" : ""}`}
              />{" "}
              Refresh
            </button>
          </div>
          <p className="text-xs text-black/50 -mt-1">
            Leave blank to hide the icon from the footer.
          </p>
          {sectionErrors.socials && (
            <SectionErrorBanner
              message={sectionErrors.socials}
              busy={socialsBusy}
              onRetry={() => void save("socials")}
              onDismiss={() => setError("socials", null)}
            />
          )}
          {socialsEmpty && !sectionErrors.socials && (
            <EmptySectionPrompt
              title="No social links added yet"
              description="Paste full URLs for your social profiles. Only the ones you fill in show up in the footer."
              suggestions={SOCIAL_FIELDS.map((f) => f.label)}
              actionLabel={`Add ${SOCIAL_FIELDS[0].label}`}
              onAction={() => focusField(socialsFirstRef)}
            />
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SOCIAL_FIELDS.map((f, i) => (
              <Field key={f.key} label={f.label}>
                <input
                  ref={i === 0 ? socialsFirstRef : undefined}
                  className="mt-input"
                  value={draft.socials[f.key]}
                  onChange={(e) =>
                    setDraft({ ...draft, socials: { ...draft.socials, [f.key]: e.target.value } })
                  }
                  placeholder={f.placeholder}
                />
              </Field>
            ))}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
            <button
              onClick={() => void save("socials")}
              disabled={!dirty || savingSection !== null}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black text-white hover:bg-black/85 transition text-[10px] uppercase tracking-[0.18em] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save changes
            </button>
          </div>
        </section>
      )}

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset settings to defaults?</AlertDialogTitle>
            <AlertDialogDescription>
              Brand, contact, WhatsApp number and social links will be restored to defaults.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resetSettings();
                toast.success("Settings reset");
                setConfirmReset(false);
              }}
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];
const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // 3 MB

function ImageUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Unsupported file", { description: "Use PNG, JPG, WEBP, GIF or SVG." });
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("File too large", {
        description: `Max ${(MAX_IMAGE_BYTES / 1024 / 1024).toFixed(0)} MB. Yours is ${(file.size / 1024 / 1024).toFixed(2)} MB.`,
      });
      return;
    }
    setLoading(true);
    try {
      const { uploadProductImage } = await import("@/lib/storage");
      const url = await uploadProductImage(file);
      onChange(url);
      toast.success("Image uploaded", { description: file.name });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error("Could not upload image", { description: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={`flex-1 rounded-xl border-2 border-dashed transition cursor-pointer grid place-items-center p-5 text-center ${
          dragging
            ? "border-black bg-black/[0.03]"
            : "border-black/15 hover:border-black/40 hover:bg-black/[0.02]"
        }`}
      >
        <div className="flex flex-col items-center gap-2 text-black/60">
          <UploadCloud className="w-5 h-5" />
          <div className="text-sm">
            <span className="font-medium text-black">Drop an image</span> or click to browse
          </div>
          <div className="text-[11px] text-black/45">PNG, JPG, WEBP, GIF, SVG · up to 3 MB</div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      <div className="w-full sm:w-40 shrink-0">
        <div className="text-[10px] uppercase tracking-[0.18em] text-black/45 mb-1.5">Preview</div>
        <div className="aspect-square rounded-xl overflow-hidden bg-black/5 border border-black/10 grid place-items-center relative">
          {loading ? (
            <div className="text-[11px] text-black/50">Reading…</div>
          ) : value ? (
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-6 h-6 text-black/25" />
          )}
        </div>
      </div>
    </div>
  );
}

function ImportStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "green" | "blue" | "amber";
}) {
  const toneClass =
    tone === "green"
      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
      : tone === "blue"
        ? "bg-sky-50 border-sky-200 text-sky-700"
        : "bg-amber-50 border-amber-200 text-amber-700";
  return (
    <div className={`rounded-xl border px-3 py-2.5 ${toneClass}`}>
      <div className="text-[10px] uppercase tracking-[0.18em] opacity-80">{label}</div>
      <div className="text-xl tabular-nums" style={{ fontWeight: 500 }}>
        {value}
      </div>
    </div>
  );
}

function ImportRowList({ title, items, tone }: { title: string; items: string[]; tone?: "amber" }) {
  if (items.length === 0) return null;
  const limit = 8;
  const shown = items.slice(0, limit);
  const rest = items.length - shown.length;
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-black/50 mb-1">
        {title} ({items.length})
      </div>
      <ul
        className={`text-[12px] rounded-lg border ${tone === "amber" ? "border-amber-200 bg-amber-50/50" : "border-black/10 bg-black/[0.02]"} divide-y divide-black/5 max-h-40 overflow-auto`}
      >
        {shown.map((s, i) => (
          <li key={i} className="px-3 py-1.5 truncate">
            {s}
          </li>
        ))}
        {rest > 0 && <li className="px-3 py-1.5 text-black/50 italic">+{rest} more…</li>}
      </ul>
    </div>
  );
}

// ============================================================
// Orders panel
// ============================================================

const STATUS_STYLES: Record<OrderStatus, { label: string; className: string }> = {
  new: { label: "New", className: "bg-blue-50 text-blue-800 border-blue-200" },
  processing: { label: "Processing", className: "bg-amber-50 text-amber-800 border-amber-200" },
  completed: { label: "Completed", className: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  cancelled: { label: "Cancelled", className: "bg-black/5 text-black/60 border-black/15" },
};

function OrdersPanel({
  orders,
  loading,
  error,
  onRefetch,
  onRemove,
  onUpdateStatus,
}: {
  orders: SavedOrder[];
  loading: boolean;
  error: string | null;
  onRefetch: () => Promise<void> | void;
  onRemove: (id: string) => Promise<void> | void;
  onUpdateStatus: (id: string, status: OrderStatus) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search, 250);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [confirmDelete, setConfirmDelete] = useState<SavedOrder | null>(null);
  const [selected, setSelected] = useState<SavedOrder | null>(null);

  // Keep selected order fresh when parent orders update (e.g. status change)
  useEffect(() => {
    if (!selected) return;
    const latest = orders.find((o) => o.id === selected.id);
    if (latest && latest !== selected) setSelected(latest);
    else if (!latest) setSelected(null);
  }, [orders, selected]);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && (o.status ?? "new") !== statusFilter) return false;
      if (!q) return true;
      return (
        o.primaryName.toLowerCase().includes(q) ||
        o.message.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
      );
    });
  }, [orders, debounced, statusFilter]);

  const counts = useMemo(() => {
    const c: Record<OrderStatus | "all", number> = {
      all: orders.length,
      new: 0,
      processing: 0,
      completed: 0,
      cancelled: 0,
    };
    for (const o of orders) c[(o.status ?? "new") as OrderStatus]++;
    return c;
  }, [orders]);

  const handleStatusChange = async (o: SavedOrder, next: OrderStatus) => {
    const prev = o.status ?? "new";
    if (prev === next) return;
    const res = await onUpdateStatus(o.id, next);
    if (res.ok) {
      toast.success(`Order marked ${STATUS_STYLES[next].label.toLowerCase()}`);
    } else {
      toast.error(res.error ?? "Could not update status");
    }
  };

  return (
    <section className="bg-white border border-black/10 rounded-2xl p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <SectionTitle
          icon={<ScrollText className="w-3.5 h-3.5" />}
          label={`Orders (${filtered.length}${filtered.length !== orders.length ? ` of ${orders.length}` : ""})`}
        />
        <button
          onClick={() => void onRefetch()}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-black/15 hover:border-black transition text-[10px] uppercase tracking-[0.18em] self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="flex-1">{error}</div>
          <button
            onClick={() => void onRefetch()}
            className="text-[10px] uppercase tracking-[0.18em] underline underline-offset-4"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 sm:items-center mb-4">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product, message or ID"
            className="w-full pl-9 pr-8 py-2 text-sm rounded-full border border-black/15 focus:border-black focus:outline-none transition"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-black/40 hover:text-black"
            >
              <XIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["all", ...ORDER_STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full border text-[10px] uppercase tracking-[0.18em] transition ${statusFilter === s ? "border-black bg-black text-white" : "border-black/15 hover:border-black"}`}
            >
              {s === "all" ? "All" : STATUS_STYLES[s].label}{" "}
              <span className="opacity-60 ml-1">{counts[s]}</span>
            </button>
          ))}
        </div>
      </div>

      {loading && orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-black/15 p-8 text-center text-sm text-black/50">
          Loading orders…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-black/15 p-8 text-center text-sm text-black/50">
          {orders.length === 0
            ? "No orders yet. WhatsApp drafts will appear here."
            : "No orders match your filters."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[860px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-[0.18em] text-black/45 border-b border-black/10">
                <th className="py-3 pr-3 font-normal">Order</th>
                <th className="py-3 pr-3 font-normal">Placed</th>
                <th className="py-3 pr-3 font-normal">Items</th>
                <th className="py-3 pr-3 font-normal text-right">Total</th>
                <th className="py-3 pr-3 font-normal">Status</th>
                <th className="py-3 pr-3 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const status = (o.status ?? "new") as OrderStatus;
                const badge = STATUS_STYLES[status];
                return (
                  <tr
                    key={o.id}
                    onClick={() => setSelected(o)}
                    className="border-b border-black/5 hover:bg-black/[0.02] cursor-pointer transition"
                  >
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg overflow-hidden shrink-0 ${o.primaryBg ?? "bg-black/5"} grid place-items-center`}
                        >
                          {o.primaryImg ? (
                            <SafeImage
                              src={o.primaryImg}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ShoppingBag className="w-4 h-4 text-black/40" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="truncate max-w-[220px]">{o.primaryName}</span>
                            {o.extraCount ? (
                              <span className="text-[10px] uppercase tracking-[0.15em] text-black/45">
                                +{o.extraCount}
                              </span>
                            ) : null}
                          </div>
                          <div className="text-[10px] text-black/40 tabular-nums">
                            #{o.id.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-3 text-black/70 text-xs whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 pr-3 text-black/70 tabular-nums">{o.itemCount}</td>
                    <td className="py-3 pr-3 text-right tabular-nums">{formatPKR(o.total)}</td>
                    <td className="py-3 pr-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] uppercase tracking-[0.15em] ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                        <select
                          value={status}
                          onChange={(e) =>
                            void handleStatusChange(o, e.target.value as OrderStatus)
                          }
                          className="px-2 py-1 text-xs rounded-md border border-black/15 focus:border-black focus:outline-none bg-white"
                          aria-label="Update status"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_STYLES[s].label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td
                      className="py-3 pr-3 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a
                        href={o.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-black/15 hover:border-black transition text-[10px] uppercase tracking-[0.18em]"
                      >
                        Open WhatsApp
                      </a>
                      <button
                        onClick={() => setConfirmDelete(o)}
                        aria-label="Delete order"
                        className="ml-1.5 inline-flex items-center justify-center w-7 h-7 rounded-full text-black/40 hover:text-black hover:bg-black/5 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(open) => {
          if (!open) setConfirmDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this order?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the order draft for {confirmDelete?.primaryName ?? "this order"}. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDelete) {
                  void onRemove(confirmDelete.id);
                  toast.success("Order removed");
                }
                setConfirmDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
          {selected &&
            (() => {
              const s = (selected.status ?? "new") as OrderStatus;
              const b = STATUS_STYLES[s];
              // Reverse-derive subtotal & shipping from the saved total.
              // total = subtotal + shipping, where shipping = computeShipping(subtotal).
              let subtotal = selected.total;
              let shipping = 0;
              if (selected.kind === "cart" && selected.total > 0) {
                const guess = selected.total - 500; // SHIPPING_FEE
                if (guess > 0 && computeShipping(guess) === 500) {
                  subtotal = guess;
                  shipping = 500;
                }
              }
              return (
                <div className="flex flex-col h-full">
                  <SheetHeader className="px-6 pt-6 pb-4 border-b border-black/10 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] uppercase tracking-[0.15em] ${b.className}`}
                      >
                        {b.label}
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.18em] text-black/45">
                        {selected.kind === "cart" ? "Cart order" : "Quick order"}
                      </span>
                    </div>
                    <SheetTitle className="text-lg" style={dmSans}>
                      Order #{selected.id.slice(0, 8)}
                    </SheetTitle>
                    <SheetDescription className="text-xs text-black/55">
                      Placed {new Date(selected.createdAt).toLocaleString()}
                    </SheetDescription>
                  </SheetHeader>

                  <div className="flex-1 px-6 py-5 space-y-5">
                    {/* Primary line item */}
                    <div className="flex items-center gap-3 rounded-xl border border-black/10 p-3">
                      <div
                        className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 ${selected.primaryBg ?? "bg-black/5"} grid place-items-center`}
                      >
                        {selected.primaryImg ? (
                          <img
                            src={selected.primaryImg}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingBag className="w-5 h-5 text-black/40" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm truncate">{selected.primaryName}</div>
                        <div className="text-[11px] text-black/55">
                          {selected.itemCount} item{selected.itemCount === 1 ? "" : "s"}
                          {selected.extraCount
                            ? ` · +${selected.extraCount} more product${selected.extraCount === 1 ? "" : "s"}`
                            : ""}
                        </div>
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="rounded-xl border border-black/10 p-4 text-sm">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-black/45 mb-2">
                        Totals
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-black/60">Subtotal</span>
                        <span className="tabular-nums">{formatPKR(subtotal)}</span>
                      </div>
                      {selected.kind === "cart" && (
                        <div className="flex justify-between py-1">
                          <span className="text-black/60">Shipping</span>
                          <span className="tabular-nums">
                            {shipping === 0 ? "Free" : formatPKR(shipping)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 mt-2 border-t border-black/10 font-medium">
                        <span>Total</span>
                        <span className="tabular-nums">{formatPKR(selected.total)}</span>
                      </div>
                    </div>

                    {/* Status control */}
                    <div className="rounded-xl border border-black/10 p-4">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-black/45 mb-2">
                        Status
                      </div>
                      <select
                        value={s}
                        onChange={(e) =>
                          void handleStatusChange(selected, e.target.value as OrderStatus)
                        }
                        className="w-full px-3 py-2 text-sm rounded-md border border-black/15 focus:border-black focus:outline-none bg-white"
                      >
                        {ORDER_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {STATUS_STYLES[st].label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Full message with line items + shipping/payment notes */}
                    <div className="rounded-xl border border-black/10 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-black/45">
                          Order message
                        </div>
                        <button
                          onClick={() => {
                            void navigator.clipboard?.writeText(selected.message);
                            toast.success("Message copied");
                          }}
                          className="text-[10px] uppercase tracking-[0.18em] underline underline-offset-4 text-black/60 hover:text-black"
                        >
                          Copy
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap break-words text-xs text-black/75 font-mono leading-relaxed max-h-72 overflow-y-auto">
                        {selected.message}
                      </pre>
                      <div className="mt-3 text-[11px] text-black/50">
                        Customer sends payment &amp; shipping details in the WhatsApp thread after
                        opening the order.
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-black/10 px-6 py-4 flex items-center gap-2">
                    <a
                      href={selected.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-black text-white hover:bg-black/85 transition text-[11px] uppercase tracking-[0.18em]"
                    >
                      Open in WhatsApp
                    </a>
                    <button
                      onClick={() => setConfirmDelete(selected)}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full border border-black/15 hover:border-black transition text-[11px] uppercase tracking-[0.18em]"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              );
            })()}
        </SheetContent>
      </Sheet>
    </section>
  );
}
