import type { CartItem, Product } from "./types";
export function reconcileCartCatalog(
  items: CartItem[],
  requestedIds: string[],
  fresh: Map<string, Product>,
): CartItem[] {
  const requested = new Set(requestedIds);
  return items.map((item) => {
    const id = item.baseId || item.id;
    if (!requested.has(id)) return item;
    const current = fresh.get(id);
    return current
      ? {
          ...item,
          price: current.price,
          status: current.status,
          img: current.img,
          original_price: undefined,
        }
      : { ...item, status: "discontinued" };
  });
}
