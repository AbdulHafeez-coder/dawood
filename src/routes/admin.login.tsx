import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Lock, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth, ADMIN_EMAIL, ADMIN_PASSWORD } from "@/lib/admin-auth";


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
});

function AdminLogin() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const { isAuthed, ready, login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState<"email" | "password" | null>(null);

  const safeRedirect =
    redirect && redirect.startsWith("/admin") && redirect !== "/admin/login"
      ? redirect
      : "/admin";

  useEffect(() => {
    if (ready && isAuthed) {
      navigate({ to: safeRedirect });
    }
  }, [ready, isAuthed, navigate, safeRedirect]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = login(email, password);
    if (ok) {
      toast.success("Welcome back, admin", { description: "Redirecting to dashboard…" });
      navigate({ to: safeRedirect });
    } else {
      toast.error("Invalid credentials", {
        description: "Use the demo account shown below.",
      });
    }
  }

  function copy(value: string, kind: "email" | "password") {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(kind);
      setTimeout(() => setCopied((c) => (c === kind ? null : c)), 1200);
    });
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
                <span className="text-[10px] uppercase tracking-[0.2em] text-black/50">
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="admin@mail.com"
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
                className="mt-2 w-full px-5 py-3 bg-black text-white rounded-full uppercase tracking-[0.18em] text-[11px] hover:bg-black/85 active:scale-[0.985] transition"
                style={{ ...inter, fontWeight: 500 }}
              >
                Sign in
              </button>
            </form>
          </div>

          {/* Demo creds card */}
          <div className="mt-4 rounded-2xl border border-dashed border-black/20 bg-[#FEF3C7] p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div
                className="text-[10px] uppercase tracking-[0.22em] text-black/60"
                style={{ ...dmSans, fontWeight: 700 }}
              >
                Demo account
              </div>
              <span className="text-[10px] uppercase tracking-[0.18em] text-black/40">
                For preview only
              </span>
            </div>
            <div className="mt-3 space-y-2">
              <CredRow
                label="Email"
                value={ADMIN_EMAIL}
                copied={copied === "email"}
                onCopy={() => copy(ADMIN_EMAIL, "email")}
                onFill={() => setEmail(ADMIN_EMAIL)}
              />
              <CredRow
                label="Password"
                value={ADMIN_PASSWORD}
                copied={copied === "password"}
                onCopy={() => copy(ADMIN_PASSWORD, "password")}
                onFill={() => setPassword(ADMIN_PASSWORD)}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail(ADMIN_EMAIL);
                setPassword(ADMIN_PASSWORD);
              }}
              className="mt-3 text-[11px] uppercase tracking-[0.18em] text-black/70 hover:text-black underline underline-offset-4"
            >
              Fill both fields
            </button>
          </div>
        </div>
      </main>

    </div>
  );
}

function CredRow({
  label,
  value,
  copied,
  onCopy,
  onFill,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
  onFill: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 bg-white/60 rounded-xl px-3 py-2 border border-black/10">
      <div className="min-w-0">
        <div className="text-[9px] uppercase tracking-[0.22em] text-black/45">{label}</div>
        <button
          type="button"
          onClick={onFill}
          className="block truncate text-sm text-black hover:text-black/70 text-left font-mono"
        >
          {value}
        </button>
      </div>
      <button
        type="button"
        onClick={onCopy}
        className="shrink-0 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] px-2.5 py-1.5 rounded-full bg-black text-white hover:bg-black/85 transition"
        aria-label={`Copy ${label}`}
      >
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
