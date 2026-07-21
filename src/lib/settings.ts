import { useEffect, useState } from "react";

export type SocialKey = "instagram" | "facebook" | "twitter" | "tiktok" | "pinterest" | "youtube";

export type Settings = {
  brandName: string;
  tagline: string;
  logoUrl: string;
  whatsappNumber: string; // international, digits only
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
  whatsappNumber: "15551234567",
  contactEmail: "hello@maisonterra.co",
  contactPhone: "+1 (555) 123-4567",
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
