import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/lib/admin-auth";
import { AdminLoginSkeleton, useMounted } from "@/components/skeletons";
import { AdminError, AdminNotFound } from "@/components/AdminFallback";

const dmSans = { fontFamily: "'DM Sans', sans-serif" };
const inter = { fontFamily: "'Inter', sans-serif" };

export const Route = createFileRoute("/admin/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Admin Login — Dawood Mart" },
      { name: "description", content: "Sign in to the Dawood Mart admin dashboard." },
      { property: "og:title", content: "Admin Login — Dawood Mart" },
      { property: "og:description", content: "Sign in to the Dawood Mart admin dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLogin,
  pendingComponent: AdminLoginSkeleton,
  errorComponent: AdminError,
  notFoundComponent: AdminNotFound,
});

function AdminLogin() {
  const navigate = useNavigate();
  const mounted = useMounted();
  const { redirect } = Route.useSearch();
  const { isAuthed, ready, login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const safeRedirect =
    redirect && redirect.startsWith("/admin") && redirect !== "/admin/login" ? redirect : "/admin";

  useEffect(() => {
    if (ready && isAuthed) {
      navigate({ to: safeRedirect });
    }
  }, [ready, isAuthed, navigate, safeRedirect]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.ok) {
        toast.success("Welcome back, admin", { description: "Redirecting to dashboard…" });
        navigate({ to: safeRedirect });
      } else {
        toast.error("Sign-in failed", {
          description: result.error ?? "Invalid credentials.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted || !ready || isAuthed) {
    return <AdminLoginSkeleton />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FEFDF9] text-black" style={inter}>
      <main className="flex-1 px-4 sm:px-6 md:px-8 py-8 sm:py-12">
        <div className="mx-auto max-w-md">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-black/55 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to shop
          </Link>

          <div className="mt-6 sm:mt-10 bg-white border border-black/10 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black text-white grid place-items-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-black/45">
                  Dawood Mart
                </div>
                <h1
                  className="text-black"
                  style={{ ...dmSans, fontWeight: 400, letterSpacing: "-0.02em", fontSize: 24 }}
                >
                  Admin sign in
                </h1>
              </div>
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.2em] text-black/50">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="mt-2 w-full bg-transparent border-b border-black/20 focus:border-black py-2 outline-none text-sm placeholder:text-black/30 transition-colors"
                  required
                />
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.2em] text-black/50">
                  Password
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="mt-2 w-full bg-transparent border-b border-black/20 focus:border-black py-2 outline-none text-sm placeholder:text-black/30 transition-colors"
                  required
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full px-5 py-3 bg-black text-white rounded-full uppercase tracking-[0.18em] text-[11px] hover:bg-black/85 active:scale-[0.985] transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                style={{ ...inter, fontWeight: 500 }}
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {submitting ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
