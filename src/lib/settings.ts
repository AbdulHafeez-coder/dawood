import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type SocialKey = "instagram" | "facebook" | "twitter" | "tiktok" | "pinterest" | "youtube";

export type Settings = {
  brandName: string;
  tagline: string;
  logoUrl: string;
  whatsappNumber: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socials: Record<SocialKey, string>;
};

const CACHE_KEY = "dawood-mart-settings-v3";
const SETTINGS_ID = "global";

const DEFAULTS: Settings = {
  brandName: "Dawood Mart",
  tagline: "Smart Shopping, Better Living!",
  logoUrl: "",
  whatsappNumber: "03024201342",
  contactEmail: "abdulhafeez828@gmail.com",
  contactPhone: "0302-4201342",
  address: "Shakeel Crockery Store, Opposite Al Shams Jewellers, Al Noor Town Bazar, Walton Road, Lahore Cantt, Lahore, Pakistan",
  socials: {
    instagram: "",
    facebook: "",
    twitter: "",
    tiktok: "",
    pinterest: "",
    youtube: "",
  },
};

// Shape returned from Supabase.
type SettingsRow = {
  brand_name: string;
  tagline: string;
  logo_url: string;
  whatsapp_number: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  socials: Partial<Record<SocialKey, string>> | null;
};

function fromRow(row: SettingsRow): Settings {
  if (/maison\s*terra/i.test(row.brand_name) || /maisonterra\.co/i.test(row.contact_email)) return { ...DEFAULTS, socials: { ...DEFAULTS.socials } };
  return {
    brandName: row.brand_name ?? DEFAULTS.brandName,
    tagline: row.tagline ?? DEFAULTS.tagline,
    logoUrl: row.logo_url ?? "",
    whatsappNumber: row.whatsapp_number ?? "",
    contactEmail: row.contact_email ?? "",
    contactPhone: row.contact_phone ?? "",
    address: row.address ?? "",
    socials: { ...DEFAULTS.socials, ...(row.socials ?? {}) },
  };
}

function toRow(s: Settings) {
  return {
    id: SETTINGS_ID,
    brand_name: s.brandName,
    tagline: s.tagline,
    logo_url: s.logoUrl,
    whatsapp_number: s.whatsappNumber,
    contact_email: s.contactEmail,
    contact_phone: s.contactPhone,
    address: s.address,
    socials: s.socials,
    updated_at: new Date().toISOString(),
  };
}

function loadCache(): Settings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULTS,
      ...parsed,
      socials: { ...DEFAULTS.socials, ...(parsed?.socials ?? {}) },
    };
  } catch {
    return DEFAULTS;
  }
}

function persistCache() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(current));
  } catch {
    /* ignore */
  }
}

let current: Settings = loadCache();
let hydrated = false;
const listeners = new Set<(s: Settings) => void>();

function emit() {
  for (const l of listeners) l(current);
}

async function hydrateFromSupabase() {
  if (hydrated) return;
  hydrated = true;
  const { data, error } = await supabase
    .from("settings")
    .select(
      "brand_name, tagline, logo_url, whatsapp_number, contact_email, contact_phone, address, socials",
    )
    .eq("id", SETTINGS_ID)
    .maybeSingle();
  if (error || !data) return;
  current = fromRow(data as SettingsRow);
  persistCache();
  emit();
}

if (typeof window !== "undefined") {
  void hydrateFromSupabase();
}

export function getSettings(): Settings {
  return current;
}

// Optimistic local update. Does NOT write to the database — pair with
// saveSettingsAsync for persistence and roll back with another updateSettings()
// on failure.
export function updateSettings(
  patch: Partial<Settings> & { socials?: Partial<Settings["socials"]> },
) {
  current = {
    ...current,
    ...patch,
    socials: { ...current.socials, ...(patch.socials ?? {}) },
  };
  persistCache();
  emit();
}

export function resetSettings() {
  current = { ...DEFAULTS, socials: { ...DEFAULTS.socials } };
  persistCache();
  emit();
  // Best-effort DB reset — RLS restricts this to admins.
  void supabase.from("settings").update(toRow(current)).eq("id", SETTINGS_ID);
}

// Persists the given patch to Supabase. RLS restricts writes to admins.
// `latencyMs` / `failureRate` are dev-only knobs kept for the admin
// "simulate failure" toggle; leave them at defaults in real callers.
export async function saveSettingsAsync(
  patch: Partial<Settings> & { socials?: Partial<Settings["socials"]> },
  opts: { latencyMs?: number; failureRate?: number } = {},
): Promise<Settings> {
  const latency = opts.latencyMs ?? 0;
  const failureRate = opts.failureRate ?? 0;
  if (latency > 0) await new Promise((r) => setTimeout(r, latency));
  if (failureRate > 0 && Math.random() < failureRate) {
    throw new Error("Simulated network failure while saving settings.");
  }

  const next: Settings = {
    ...current,
    ...patch,
    socials: { ...current.socials, ...(patch.socials ?? {}) },
  };

  const { data, error } = await supabase
    .from("settings")
    .upsert(toRow(next), { onConflict: "id" })
    .select(
      "brand_name, tagline, logo_url, whatsapp_number, contact_email, contact_phone, address, socials",
    )
    .maybeSingle();

  if (error) {
    // Common causes: not signed in, or signed in without the admin role → RLS blocks the write.
    const msg = /row-level security|permission denied/i.test(error.message)
      ? "You don't have permission to save settings. Sign in as an admin."
      : error.message || "Failed to save settings.";
    throw new Error(msg);
  }

  if (!data) throw new Error("Database did not confirm the settings save.");
  current = fromRow(data as SettingsRow);
  persistCache();
  emit();
  return current;
}

export function useSettings() {
  const [s, setS] = useState<Settings>(current);
  useEffect(() => {
    setS(current);
    const l = (next: Settings) => setS(next);
    listeners.add(l);
    // Re-attempt hydration in case the module loaded server-side first.
    void hydrateFromSupabase();
    return () => {
      listeners.delete(l);
    };
  }, []);
  return s;
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== CACHE_KEY) return;
    try {
      const parsed = e.newValue ? JSON.parse(e.newValue) : null;
      current = parsed
        ? { ...DEFAULTS, ...parsed, socials: { ...DEFAULTS.socials, ...(parsed?.socials ?? {}) } }
        : { ...DEFAULTS, socials: { ...DEFAULTS.socials } };
      emit();
    } catch {
      /* ignore */
    }
  });
}
