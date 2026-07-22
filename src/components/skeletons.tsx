import { useEffect, useState } from "react";

/**
 * Small helper: returns `false` on first client render, then `true` after mount.
 * Lets synchronous localStorage-backed stores show skeleton placeholders on the
 * first paint for improved perceived performance and consistent loading UI.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-black/[0.06] ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden flex flex-col h-full">
      <Shimmer className="aspect-square w-full" />
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <Shimmer className="h-5 w-3/4 rounded" />
            <Shimmer className="h-3 w-1/4 rounded" />
          </div>
          <Shimmer className="h-5 w-16 rounded" />
        </div>
        <Shimmer className="mt-auto h-11 w-full rounded-md" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
      aria-busy="true"
      aria-live="polite"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function FiltersSkeleton() {
  return (
    <div aria-busy="true" className="space-y-4 mb-8 lg:mb-10">
      <div className="bg-white rounded-2xl p-4 lg:p-5 flex items-center gap-3">
        <Shimmer className="h-5 w-5 rounded-full" />
        <Shimmer className="h-5 flex-1 rounded" />
      </div>
      <div className="bg-white rounded-2xl p-4 lg:p-5 flex flex-col md:flex-row md:items-center md:flex-wrap gap-4 md:gap-5 lg:gap-8">
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Shimmer key={i} className="h-9 w-20 rounded-full" />
          ))}
        </div>
        <Shimmer className="h-9 flex-1 min-w-[160px] max-w-xs rounded-full" />
        <Shimmer className="h-9 w-40 rounded-full" />
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <li className="border border-black/10 rounded-2xl bg-white overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-5">
        <Shimmer className="w-full sm:w-24 h-24 rounded-xl shrink-0" />
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Shimmer className="h-4 w-24 rounded-full" />
            <Shimmer className="h-3 w-32 rounded" />
          </div>
          <Shimmer className="h-5 w-2/3 rounded" />
          <Shimmer className="h-4 w-1/3 rounded" />
          <div className="mt-auto flex flex-wrap gap-2 pt-2">
            <Shimmer className="h-9 w-44 rounded-full" />
            <Shimmer className="h-9 w-32 rounded-full" />
            <Shimmer className="h-9 w-24 rounded-full" />
          </div>
        </div>
      </div>
    </li>
  );
}

export function OrdersListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <ul className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
      {Array.from({ length: count }).map((_, i) => (
        <OrderCardSkeleton key={i} />
      ))}
    </ul>
  );
}

export function CartDrawerSkeleton() {
  return (
    <div className="fixed inset-0 z-50 pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-[#FEFDF9] shadow-xl flex flex-col">
        <div className="p-5 border-b border-black/5 flex items-center justify-between">
          <Shimmer className="h-6 w-24 rounded" />
          <Shimmer className="h-6 w-6 rounded-full" />
        </div>
        <div className="flex-1 p-5 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Shimmer className="h-20 w-20 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Shimmer className="h-4 w-3/4 rounded" />
                <Shimmer className="h-3 w-1/3 rounded" />
                <Shimmer className="h-8 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
        <div className="p-5 border-t border-black/5 space-y-3">
          <Shimmer className="h-4 w-full rounded" />
          <Shimmer className="h-11 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function ProductGallerySkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true">
      <Shimmer className="aspect-square w-full rounded-2xl" />
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Shimmer key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function VariantOptionsSkeleton() {
  return (
    <div className="space-y-6 max-w-md" aria-busy="true">
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <Shimmer className="h-4 w-12 rounded" />
          <Shimmer className="h-3 w-20 rounded" />
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Shimmer key={i} className="h-10 w-16 rounded-full" />
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <Shimmer className="h-4 w-16 rounded" />
          <Shimmer className="h-3 w-20 rounded" />
        </div>
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Shimmer key={i} className="h-9 w-9 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AddToCartSkeleton() {
  return (
    <div className="space-y-3 max-w-md" aria-busy="true">
      <div className="flex items-center gap-3">
        <Shimmer className="h-12 w-28 rounded-full" />
        <Shimmer className="h-12 flex-1 rounded-md" />
        <Shimmer className="h-12 w-12 rounded-full shrink-0" />
      </div>
      <Shimmer className="h-12 w-full rounded-md" />
      <Shimmer className="h-3 w-2/3 rounded" />
    </div>
  );
}

/* ============================================================================
 * Admin skeletons
 * ========================================================================== */

export function AdminHeaderSkeleton() {
  return (
    <header className="border-b border-black/10 bg-[#FEFDF9]/95 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Shimmer className="h-3 w-14 rounded" />
          <div className="h-4 w-px bg-black/15" />
          <div className="space-y-2">
            <Shimmer className="h-2.5 w-24 rounded" />
            <Shimmer className="h-5 w-40 rounded" />
          </div>
        </div>
        <Shimmer className="h-8 w-24 rounded-full" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <nav className="flex gap-1 -mb-px">
          {Array.from({ length: 4 }).map((_, i) => (
            <Shimmer key={i} className="h-9 w-28 rounded-t-md" />
          ))}
        </nav>
      </div>
    </header>
  );
}

export function KpiCardSkeleton() {
  return (
    <div className="bg-white border border-black/10 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Shimmer className="h-6 w-6 rounded-full" />
        <Shimmer className="h-3 w-16 rounded" />
      </div>
      <Shimmer className="mt-4 h-7 w-24 rounded" />
      <Shimmer className="mt-2 h-3 w-20 rounded" />
    </div>
  );
}

export function AdminOverviewSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8" aria-busy="true" aria-live="polite">
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </section>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <section className="bg-white border border-black/10 rounded-2xl p-5 sm:p-6 space-y-4">
          <Shimmer className="h-4 w-32 rounded" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <Shimmer className="h-3 w-24 rounded" />
                <Shimmer className="h-3 w-6 rounded" />
              </div>
              <Shimmer className="h-1.5 w-full rounded-full" />
            </div>
          ))}
        </section>
        <section className="lg:col-span-2 bg-white border border-black/10 rounded-2xl p-5 sm:p-6 space-y-4">
          <Shimmer className="h-4 w-40 rounded" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-center">
              <Shimmer className="h-12 w-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Shimmer className="h-3 w-2/3 rounded" />
                <Shimmer className="h-3 w-1/3 rounded" />
              </div>
              <Shimmer className="h-5 w-16 rounded" />
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export function AdminProductsSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <div className="bg-white border border-black/10 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center gap-3">
        <Shimmer className="h-9 flex-1 min-w-[200px] rounded-full" />
        <Shimmer className="h-9 w-32 rounded-full" />
        <Shimmer className="h-9 w-28 rounded-full" />
        <Shimmer className="h-9 w-28 rounded-full" />
      </div>
      <div className="bg-white border border-black/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-black/10 flex items-center gap-3">
          <Shimmer className="h-4 w-4 rounded" />
          <Shimmer className="h-4 w-24 rounded" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 border-b border-black/5 flex items-center gap-3">
            <Shimmer className="h-4 w-4 rounded" />
            <Shimmer className="h-12 w-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Shimmer className="h-4 w-2/3 rounded" />
              <Shimmer className="h-3 w-1/3 rounded" />
            </div>
            <Shimmer className="h-5 w-16 rounded" />
            <Shimmer className="h-8 w-8 rounded-full" />
            <Shimmer className="h-8 w-8 rounded-full" />
          </div>
        ))}
        <div className="p-4 flex items-center justify-between">
          <Shimmer className="h-4 w-32 rounded" />
          <div className="flex gap-2">
            <Shimmer className="h-8 w-8 rounded" />
            <Shimmer className="h-8 w-8 rounded" />
            <Shimmer className="h-8 w-8 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminCategoriesSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <div className="bg-white border border-black/10 rounded-2xl p-4 sm:p-5 flex items-center gap-3">
        <Shimmer className="h-9 flex-1 rounded-full" />
        <Shimmer className="h-9 w-32 rounded-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white border border-black/10 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Shimmer className="h-5 w-32 rounded" />
              <Shimmer className="h-6 w-6 rounded-full" />
            </div>
            <Shimmer className="h-3 w-20 rounded" />
            <div className="flex gap-2 pt-2">
              <Shimmer className="h-8 w-20 rounded-full" />
              <Shimmer className="h-8 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminSettingsSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6" aria-busy="true" aria-live="polite">
      {Array.from({ length: 3 }).map((_, s) => (
        <section key={s} className="bg-white border border-black/10 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Shimmer className="h-4 w-4 rounded-full" />
            <Shimmer className="h-4 w-32 rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Shimmer className="h-3 w-24 rounded" />
                <Shimmer className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>
        </section>
      ))}
      <div className="flex justify-end gap-2">
        <Shimmer className="h-10 w-28 rounded-full" />
        <Shimmer className="h-10 w-32 rounded-full" />
      </div>
    </div>
  );
}

export function AdminDashboardSkeleton({
  tab = "overview",
}: {
  tab?: "overview" | "products" | "categories" | "settings";
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FEFDF9] text-black">
      <AdminHeaderSkeleton />
      <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 sm:py-10">
        <div className="mx-auto max-w-7xl">
          {tab === "overview" && <AdminOverviewSkeleton />}
          {tab === "products" && <AdminProductsSkeleton />}
          {tab === "categories" && <AdminCategoriesSkeleton />}
          {tab === "settings" && <AdminSettingsSkeleton />}
        </div>
      </main>
    </div>
  );
}

export function AdminLoginSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FEFDF9]" aria-busy="true">
      <main className="flex-1 px-4 sm:px-6 md:px-8 py-8 sm:py-12">
        <div className="mx-auto max-w-md">
          <Shimmer className="h-3 w-24 rounded" />
          <div className="mt-6 sm:mt-10 bg-white border border-black/10 rounded-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-3">
              <Shimmer className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Shimmer className="h-2.5 w-20 rounded" />
                <Shimmer className="h-5 w-32 rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <Shimmer className="h-2.5 w-12 rounded" />
              <Shimmer className="h-9 w-full rounded" />
            </div>
            <div className="space-y-2">
              <Shimmer className="h-2.5 w-16 rounded" />
              <Shimmer className="h-9 w-full rounded" />
            </div>
            <Shimmer className="h-11 w-full rounded-full" />
          </div>
          <Shimmer className="mt-4 h-24 w-full rounded-2xl" />
        </div>
      </main>
    </div>
  );
}

export function ProductFormSkeleton({ mode = "create" }: { mode?: "create" | "edit" }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Shimmer className="h-5 w-40 rounded" />
        <Shimmer className="h-3 w-64 rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Shimmer className="h-2.5 w-20 rounded" />
            <Shimmer className="h-9 w-full rounded-md" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Shimmer className="h-2.5 w-24 rounded" />
        <Shimmer className="h-20 w-full rounded-md" />
      </div>
      <div className="space-y-2">
        <Shimmer className="h-2.5 w-28 rounded" />
        <Shimmer className="h-40 w-full rounded-xl" />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Shimmer key={i} className="aspect-square rounded-md" />
        ))}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Shimmer className="h-9 w-24 rounded-full" />
        <Shimmer className="h-9 w-28 rounded-full" />
      </div>
      <div className="sr-only">{mode === "edit" ? "Loading product" : "Preparing form"}</div>
    </div>
  );
}

export function CategoryFormSkeleton({ mode = "create" }: { mode?: "create" | "edit" }) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Shimmer className="h-5 w-40 rounded" />
        <Shimmer className="h-3 w-56 rounded" />
      </div>
      <div className="space-y-2">
        <Shimmer className="h-2.5 w-16 rounded" />
        <Shimmer className="h-9 w-full rounded-md" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Shimmer className="h-9 w-24 rounded-full" />
        <Shimmer className="h-9 w-28 rounded-full" />
      </div>
      <div className="sr-only">{mode === "edit" ? "Loading category" : "Preparing form"}</div>
    </div>
  );
}

export function SettingsSectionSkeleton({
  title = true,
  rows = 2,
  cols = 2,
  actions = false,
}: {
  title?: boolean;
  rows?: number;
  cols?: 1 | 2 | 3;
  actions?: boolean;
}) {
  const colClass = cols === 3 ? "md:grid-cols-3" : cols === 2 ? "md:grid-cols-2" : "";
  return (
    <section className="bg-white border border-black/10 rounded-2xl p-5 sm:p-6 space-y-4">
      {title && (
        <div className="flex items-center justify-between">
          <Shimmer className="h-4 w-32 rounded" />
          {actions && (
            <div className="flex gap-2">
              <Shimmer className="h-8 w-20 rounded-full" />
              <Shimmer className="h-8 w-28 rounded-full" />
            </div>
          )}
        </div>
      )}
      <div className={`grid grid-cols-1 ${colClass} gap-4`}>
        {Array.from({ length: rows * cols }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Shimmer className="h-2.5 w-24 rounded" />
            <Shimmer className="h-9 w-full rounded-md" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function SettingsPanelSkeleton() {
  return (
    <>
      <SettingsSectionSkeleton rows={2} cols={2} actions />
      <SettingsSectionSkeleton rows={1} cols={3} />
      <SettingsSectionSkeleton rows={3} cols={2} />
    </>
  );
}
