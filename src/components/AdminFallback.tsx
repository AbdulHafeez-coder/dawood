import { Link, useRouter } from "@tanstack/react-router";
import { AlertTriangle, RefreshCw, Home, LayoutDashboard, LogIn } from "lucide-react";
import { useEffect } from "react";
import { reportLovableError } from "@/lib/lovable-error-reporting";

const dmSans = { fontFamily: "'DM Sans', sans-serif" };
const inter = { fontFamily: "'Inter', sans-serif" };

function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f5f2]" style={inter}>
      {/* Header skeleton bar for continuity with dashboard chrome */}
      <div className="border-b border-black/10 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-white">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight" style={dmSans}>
              Dawood Mart · Admin
            </span>
          </div>
          <div className="hidden gap-2 sm:flex">
            <div className="h-8 w-20 rounded-md bg-black/5" />
            <div className="h-8 w-20 rounded-md bg-black/5" />
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-16 sm:px-6">
        {children}
      </div>
    </div>
  );
}

export function AdminNotFound() {
  return (
    <AdminShell>
      <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-black/10 bg-[#f7f5f2] text-2xl">
          🔍
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground" style={dmSans}>
          404
        </h1>
        <h2 className="mt-1 text-base font-medium text-foreground">Admin page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The admin screen you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-foreground/90"
          >
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <LogIn className="h-4 w-4" /> Sign in
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <Home className="h-4 w-4" /> Storefront
          </Link>
        </div>
      </div>
    </AdminShell>
  );
}

export function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    console.error(error);
    reportLovableError(error, { boundary: "admin_route_error_component" });
  }, [error]);

  const isChunkError = /chunk|Loading chunk|dynamically imported module/i.test(error?.message ?? "");

  return (
    <AdminShell>
      <div className="w-full max-w-lg rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="mt-6 text-xl font-semibold tracking-tight text-foreground" style={dmSans}>
          Admin dashboard hit a snag
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {isChunkError
            ? "A newer version of the admin panel is available. Refresh to load the latest build."
            : "Something went wrong while loading this screen. Your saved data is untouched."}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-foreground/90"
          >
            <RefreshCw className="h-4 w-4" /> Try again
          </button>
          <button
            onClick={() => {
              if (typeof window !== "undefined") window.location.reload();
            }}
            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Refresh page
          </button>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <Home className="h-4 w-4" /> Storefront
          </Link>
        </div>

        {error?.message ? (
          <details className="mx-auto mt-8 max-w-md text-left">
            <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
              Technical details
            </summary>
            <pre className="mt-2 max-h-40 overflow-auto rounded-md border border-black/10 bg-black/5 p-3 text-[11px] leading-relaxed text-foreground/80">
              {error.message}
            </pre>
          </details>
        ) : null}
      </div>
    </AdminShell>
  );
}
