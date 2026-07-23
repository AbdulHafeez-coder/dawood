import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Kept for backwards-compat with the login page. Empty by default now that
// auth is real — see db/schema.sql for how to create your admin account.
export const ADMIN_EMAIL = "";
export const ADMIN_PASSWORD = "";

let authed = false;
let ready = false;
const listeners = new Set<(v: boolean) => void>();

function emit() {
  for (const l of listeners) l(authed);
}

async function checkIsAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) return false;
  return !!data;
}

async function refreshAuthed() {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  authed = user ? await checkIsAdmin(user.id) : false;
  ready = true;
  emit();
}

if (typeof window !== "undefined") {
  void refreshAuthed();
  supabase.auth.onAuthStateChange(() => {
    void refreshAuthed();
  });
}

export function useAdminAuth() {
  const [isAuthed, setIsAuthed] = useState<boolean>(authed);
  const [readyState, setReadyState] = useState<boolean>(ready);

  useEffect(() => {
    setIsAuthed(authed);
    setReadyState(ready);
    const l = (v: boolean) => {
      setIsAuthed(v);
      setReadyState(ready);
    };
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error || !data.user) {
        return { ok: false, error: error?.message ?? "Invalid credentials" };
      }
      const isAdmin = await checkIsAdmin(data.user.id);
      if (!isAdmin) {
        await supabase.auth.signOut();
        return { ok: false, error: "This account is not an admin. Grant it the 'admin' role in user_roles." };
      }
      authed = true;
      emit();
      return { ok: true };
    },
    [],
  );

  const logout = useCallback(async () => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem("mt_admin_tab");
      } catch {
        /* ignore */
      }
    }
    await supabase.auth.signOut();
    authed = false;
    emit();
  }, []);

  return { isAuthed, ready: readyState, login, logout };
}
