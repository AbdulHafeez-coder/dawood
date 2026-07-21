import { useEffect, useState } from "react";

export type SavedOrder = {
  id: string;
  createdAt: number;
  kind: "cart" | "product";
  url: string;
  message: string;
  total: number;
  itemCount: number;
  primaryName: string;
  primaryImg?: string;
  primaryBg?: string;
  extraCount?: number;
};

const STORAGE_KEY = "maison-terra-orders";
const MAX_ORDERS = 30;

let state: SavedOrder[] = [];
const listeners = new Set<(o: SavedOrder[]) => void>();

function load(): SavedOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(next: SavedOrder[]) {
  state = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore quota errors
    }
  }
  listeners.forEach((l) => l(state));
}

let hydrated = false;
function ensureHydrated() {
  if (hydrated) return;
  hydrated = true;
  state = load();
}

export function saveOrder(order: Omit<SavedOrder, "id" | "createdAt">) {
  ensureHydrated();
  const entry: SavedOrder = {
    ...order,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  const next = [entry, ...state].slice(0, MAX_ORDERS);
  persist(next);
  return entry;
}

export function removeOrder(id: string) {
  ensureHydrated();
  persist(state.filter((o) => o.id !== id));
}

export function clearOrders() {
  persist([]);
}

export function useOrders() {
  ensureHydrated();
  const [orders, setOrders] = useState<SavedOrder[]>(state);
  useEffect(() => {
    const l = (o: SavedOrder[]) => setOrders(o);
    listeners.add(l);
    setOrders(state);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return {
    orders,
    saveOrder,
    removeOrder,
    clearOrders,
    orderCount: orders.length,
  };
}
