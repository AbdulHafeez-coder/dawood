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
      { title: "Admin Login — Maison Terra" },
      { name: "description", content: "Sign in to the Maison Terra admin dashboard." },
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
    redirect && redirect.startsWith("/admin") && redirect !== "/admin/login"
      ? redirect
      : "/admin";

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
                  Maison Terra
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
                <span className="text-[10px] uppercase tracking-[0.2em] text-black/50">Password</span>
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

          {/* Setup instructions */}
          <div className="mt-4 rounded-2xl border border-dashed border-black/20 bg-[#FEF3C7] p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div
                className="text-[10px] uppercase tracking-[0.22em] text-black/60"
                style={{ ...dmSans, fontWeight: 700 }}
              >
                First-time setup
              </div>
              <span className="text-[10px] uppercase tracking-[0.18em] text-black/40">
                One-time
              </span>
            </div>
            <ol className="mt-3 space-y-2 text-[12px] leading-relaxed text-black/75 list-decimal pl-4">
              <li>
                Run <code className="font-mono bg-white/60 px-1.5 py-0.5 rounded">db/schema.sql</code> in your
                Supabase SQL editor.
              </li>
              <li>
                Create a user in <strong>Supabase → Authentication → Users → Add user</strong>{" "}
                (enable “Auto Confirm User”).
              </li>
              <li>
                Grant that user the <code className="font-mono">admin</code> role by running this SQL
                (replace the email):
              </li>
            </ol>
            <div className="mt-3 relative">
              <pre className="text-[11px] font-mono bg-white/70 border border-black/10 rounded-xl p-3 overflow-x-auto whitespace-pre">
{SETUP_SQL}
              </pre>
              <button
                type="button"
                onClick={copySql}
                className="absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] px-2.5 py-1.5 rounded-full bg-black text-white hover:bg-black/85 transition"
                aria-label="Copy SQL"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
