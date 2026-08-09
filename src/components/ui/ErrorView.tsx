import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { SiteFooter } from "@/components/SiteFooter";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export function ErrorView({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    console.error("Storefront Error caught by ErrorView:", error);
  }, [error]);

  const isDev = import.meta.env.DEV;
  const isChunkError = /chunk|Loading chunk|dynamically imported module/i.test(
    error?.message ?? "",
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#FEFDF9] text-black">
      <div className="flex flex-1 items-center justify-center px-4 py-16 sm:py-24">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100 mb-6">
            <AlertCircle size={28} strokeWidth={1.75} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-black">
            Something went wrong
          </h1>

          <p className="mt-3 text-sm sm:text-base text-black/60 leading-relaxed">
            {isChunkError
              ? "A newer version of Dawood Mart is available. Please refresh to update."
              : "An unexpected error occurred while loading this page."}
          </p>

          {/* Simple & User-friendly Action Buttons */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                router.invalidate();
                reset();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-black/85 active:scale-95 shadow-xs cursor-pointer"
            >
              <RefreshCw size={15} />
              Try again
            </button>

            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-black/15 bg-white px-6 py-2.5 text-sm font-medium text-black transition-all hover:bg-black/5 active:scale-95 cursor-pointer"
            >
              <Home size={15} />
              Home
            </a>
          </div>

          {/* Technical Details - ONLY IN DEV MODE */}
          {isDev && error?.message && (
            <details className="mt-10 text-left border border-amber-200/80 bg-amber-50/50 rounded-xl p-4 transition-all">
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-amber-900/80 hover:text-amber-900 select-none">
                🛠️ Technical Details (Dev Mode Only)
              </summary>
              <div className="mt-3 space-y-2">
                <div className="font-mono text-xs font-semibold text-red-700 break-words">
                  {error.name || "Error"}: {error.message}
                </div>
                {error.stack && (
                  <pre className="max-h-48 overflow-auto rounded-lg bg-black/90 p-3 font-mono text-[11px] leading-relaxed text-emerald-400 select-text">
                    {error.stack}
                  </pre>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
