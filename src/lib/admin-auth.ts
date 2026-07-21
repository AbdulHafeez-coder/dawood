import { useCallback, useEffect, useState } from "react";

export const ADMIN_EMAIL = "admin@mail.com";
export const ADMIN_PASSWORD = "admin12345";

const KEY = "maison-terra-admin-auth";

let authed: boolean = false;
let hydrated = false;
const listeners = new Set<(v: boolean) => void>();

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    authed = window.localStorage.getItem(KEY) === "1";
  } catch {
    authed = false;
  }
}

function emit() {
  if (typeof window !== "undefined") {
    try {
      if (authed) window.localStorage.setItem(KEY, "1");
      else window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }
  for (const l of listeners) l(authed);
}

export function useAdminAuth() {
  ensureHydrated();
  const [isAuthed, setIsAuthed] = useState<boolean>(authed);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureHydrated();
    setIsAuthed(authed);
    setReady(true);
    const l = (v: boolean) => setIsAuthed(v);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const login = useCallback((email: string, password: string) => {
    const ok =
      email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;
    if (ok) {
      authed = true;
      emit();
    }
    return ok;
  }, []);

  const logout = useCallback(() => {
    authed = false;
    if (typeof window !== "undefined") {
      try {
        // Clear cached admin UI state (active tab, etc.)
        window.localStorage.removeItem("mt_admin_tab");
      } catch {
        /* ignore */
      }
    }
    emit();
  }, []);

  return { isAuthed, ready, login, logout };
}
