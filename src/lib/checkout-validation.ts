type CheckoutItem = { id: string; baseId?: string; name: string; price: number; qty: number };
type CatalogItem = {
  id: string;
  price: number | string;
  status?: string | null;
  visible?: boolean;
};

export function validateCheckoutItems(cart: CheckoutItem[], rows: CatalogItem[]): void {
  if (!cart.length) throw new Error("Your cart is empty.");
  for (const item of cart) {
    const row = rows.find((product) => product.id === (item.baseId ?? item.id.split("::")[0]));
    if (!row)
      throw new Error(`${item.name} is no longer in the catalog. Remove it from your cart.`);
    if (row.status !== "available" || row.visible === false)
      throw new Error(`${item.name} is not available for checkout. Please request availability.`);
    if (!Number.isInteger(item.qty) || item.qty <= 0)
      throw new Error(`Invalid quantity for ${item.name}.`);
    const price = Number(row.price);
    if (!Number.isFinite(price) || price <= 0 || price !== item.price) {
      throw new Error(
        `${item.name}: the price has changed. Refresh the catalog and update your cart before ordering.`,
      );
    }
  }
}

export async function persistConfirmedOrder(
  insert: () => Promise<void>,
  publish: () => void,
): Promise<void> {
  await insert();
  publish();
}
