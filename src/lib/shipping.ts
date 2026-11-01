export type PaymentMethod = "cod" | "advance";
export const FREE_SHIPPING_THRESHOLD = 3000;
export const SHIPPING_FEE = 200;
export function computeShipping(subtotal: number, payment: PaymentMethod = "cod") {
  if (!Number.isFinite(subtotal) || subtotal <= 0) return 0;
  return payment === "advance" && subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}
