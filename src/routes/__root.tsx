import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { ErrorView } from "@/components/ui/ErrorView";
import { NotFoundView } from "@/components/ui/NotFoundView";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PREVIEW_MESSAGE } from "@/lib/preview-readonly";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Dawood Mart — Considered home essentials for calm, clean spaces" },
      {
        name: "description",
        content:
          "Shop crockery, kitchenware, towels and everyday home essentials at Dawood Mart in Pakistan.",
      },
      { property: "og:title", content: "Dawood Mart — Considered home essentials" },
      {
        property: "og:description",
        content: "Crockery, kitchenware, towels and everyday home essentials in Pakistan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico?v=dm", type: "image/x-icon" },
      { rel: "icon", href: "/dawood-icon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Inter:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundView,
  errorComponent: ErrorView,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const canBrowse =
    pathname === "/" ||
    pathname.startsWith("/product/") ||
    ["/favorites", "/support", "/returns"].includes(pathname);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <div
          style={{
            background: "#3e4938",
            color: "white",
            padding: "10px 16px",
            textAlign: "center",
            fontSize: 12,
          }}
          role="note"
        >
          {PREVIEW_MESSAGE}
        </div>
        <div
          onClickCapture={(event) => {
            const anchor = (event.target as Element).closest("a");
            if (anchor && /wa\.me|whatsapp\.com/.test(anchor.href)) {
              event.preventDefault();
              event.stopPropagation();
            }
          }}
        >
          {canBrowse ? (
            <Outlet />
          ) : (
            <main className="storefront dm-section" style={{ paddingBlock: 80 }}>
              <h1>Browsing preview only</h1>
              <p>{PREVIEW_MESSAGE}</p>
              <a className="dm-button" href="/">
                Back to collections
              </a>
            </main>
          )}
        </div>
        <Toaster position="bottom-right" richColors closeButton />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
