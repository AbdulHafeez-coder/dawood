import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type OrderStatus = "new" | "processing" | "completed" | "cancelled";

export const ORDER_STATUSES: OrderStatus[] = ["new", "processing", "completed", "cancelled"];

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
  status?: OrderStatus;
};


const STORAGE_KEY = "maison-terra-orders";
const DEVICE_KEY = "maison-terra-device-id";
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

function deviceId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `dev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

type OrderRow = {
  id: string;
  user_id: string | null;
  device_id: string;
  kind: "cart" | "product";
  url: string;
  message: string;
  total: number;
  item_count: number;
  primary_name: string;
  primary_img: string | null;
  primary_bg: string | null;
  extra_count: number;
  status: OrderStatus | null;
  created_at: string;
};

function rowToOrder(r: OrderRow): SavedOrder {
  return {
    id: r.id,
    createdAt: new Date(r.created_at).getTime(),
    kind: r.kind,
    url: r.url,
    message: r.message,
    total: Number(r.total) || 0,
    itemCount: r.item_count,
    primaryName: r.primary_name,
    primaryImg: r.primary_img ?? undefined,
    primaryBg: r.primary_bg ?? undefined,
    extraCount: r.extra_count || 0,
    status: (r.status ?? "new") as OrderStatus,
  };
}


async function pushOrderToSupabase(entry: SavedOrder) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const row: Omit<OrderRow, "created_at"> = {
      id: entry.id,
      user_id: user?.id ?? null,
      device_id: deviceId(),
      kind: entry.kind,
      url: entry.url,
      message: entry.message,
      total: entry.total,
      item_count: entry.itemCount,
      primary_name: entry.primaryName,
      primary_img: entry.primaryImg ?? null,
      primary_bg: entry.primaryBg ?? null,
      extra_count: entry.extraCount ?? 0,
      status: entry.status ?? "new",
    };

    await supabase.from("orders").insert(row);
  } catch {
    // best effort — local cache remains source of truth for the shopper.
  }
}

async function deleteOrderInSupabase(id: string) {
  try {
    await supabase.from("orders").delete().eq("id", id);
  } catch {
    // ignore — RLS may deny for anon; local cache already updated.
  }
}

export function saveOrder(order: Omit<SavedOrder, "id" | "createdAt">) {
  ensureHydrated();
  const entry: SavedOrder = {
    ...order,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  const next = [entry, ...state].slice(0, MAX_ORDERS);
  persist(next);
  void pushOrderToSupabase(entry);
  return entry;
}

export function removeOrder(id: string) {
  ensureHydrated();
  persist(state.filter((o) => o.id !== id));
  void deleteOrderInSupabase(id);
}

export function clearOrders() {
  const ids = state.map((o) => o.id);
  persist([]);
  ids.forEach((id) => void deleteOrderInSupabase(id));
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

/**
 * Admin-facing hook. Reads all orders from Supabase (RLS allows admins to see
 * every row; other authenticated users only see their own). Refetches on
 * demand and subscribes to inserts/deletes.
 */
export function useAllOrders() {
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setOrders(((data ?? []) as OrderRow[]).map(rowToOrder));
    setLoading(false);
  };

  useEffect(() => {
    void refetch();
    const channel = supabase
      .channel("orders-admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          void refetch();
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const remove = async (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) {
      setError(error.message);
      void refetch();
    }
  };

  const updateStatus = async (id: string, status: OrderStatus): Promise<{ ok: boolean; error?: string }> => {
    const prev = orders;
    setOrders((cur) => cur.map((o) => (o.id === id ? { ...o, status } : o)));
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) {
      setOrders(prev);
      setError(error.message);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  };

  return { orders, loading, error, refetch, removeOrder: remove, updateStatus, orderCount: orders.length };
}


if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY) return;
    try {
      const parsed = e.newValue ? JSON.parse(e.newValue) : [];
      state = Array.isArray(parsed) ? parsed : [];
      listeners.forEach((l) => l(state));
    } catch {
      /* ignore */
    }
  });
}
