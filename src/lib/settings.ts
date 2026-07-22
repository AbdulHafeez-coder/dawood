import { useEffect, useState } from "react";

export type SocialKey = "instagram" | "facebook" | "twitter" | "tiktok" | "pinterest" | "youtube";

export type Settings = {
  brandName: string;
  tagline: string;
  logoUrl: string;
  whatsappNumber: string; // Pakistani local digits, 11 digits starting with 03
  contactEmail: string;
  contactPhone: string;
  address: string;
  socials: Record<SocialKey, string>;
};

const KEY = "maison-terra-settings-v1";

const DEFAULTS: Settings = {
  brandName: "Maison Terra",
  tagline: "Essentials for a tactile home",
  logoUrl: "",
  whatsappNumber: "03011234567",
  contactEmail: "hello@maisonterra.co",
  contactPhone: "0301-1234567",
  address: "12 Linden Row, Copenhagen",
  socials: {
    instagram: "https://instagram.com/maisonterra",
    facebook: "",
    twitter: "",
    tiktok: "",
    pinterest: "",
    youtube: "",
  },
};

let current: Settings = load();
const listeners = new Set<(s: Settings) => void>();

function load(): Settings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed, socials: { ...DEFAULTS.socials, ...(parsed?.socials ?? {}) } };
  } catch {
    return DEFAULTS;
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    /* ignore */
  }
}

function emit() {
  for (const l of listeners) l(current);
}

export function getSettings(): Settings {
  return current;
}

export function updateSettings(patch: Partial<Settings> & { socials?: Partial<Settings["socials"]> }) {
  current = {
    ...current,
    ...patch,
    socials: { ...current.socials, ...(patch.socials ?? {}) },
  };
  persist();
  emit();
}

export function resetSettings() {
  current = { ...DEFAULTS, socials: { ...DEFAULTS.socials } };
  persist();
  emit();
}

// Async save that simulates network latency and may fail. Callers pair this with
// an optimistic `updateSettings` and roll back on rejection.
export async function saveSettingsAsync(
  patch: Partial<Settings> & { socials?: Partial<Settings["socials"]> },
  opts: { latencyMs?: number; failureRate?: number } = {},
): Promise<Settings> {
  const latency = opts.latencyMs ?? 450;
  const failureRate = opts.failureRate ?? 0;
  await new Promise((r) => setTimeout(r, latency));
  if (Math.random() < failureRate) {
    throw new Error("Network error while saving settings. Please try again.");
  }
  updateSettings(patch);
  return current;
}

export function useSettings() {
  const [s, setS] = useState<Settings>(current);
  useEffect(() => {
    setS(current);
    const l = (next: Settings) => setS(next);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return s;
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
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

