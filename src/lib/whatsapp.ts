import type { Product, CartItem } from "@/lib/shop";

// Update this number to your WhatsApp business line (international format, digits only).
export const WHATSAPP_NUMBER = "15551234567";

function buildUrl(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function whatsappProductUrl(product: Product, qty: number = 1) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  const lines = [
    "Hi Maison Terra, I'd like to order this item:",
    "",
    `• ${product.name} (${product.category})`,
    `  Qty: ${qty}`,
    `  Price: $${product.price.toFixed(2)} each`,
    `  Subtotal: $${(product.price * qty).toFixed(2)}`,
    url ? `  Link: ${url}` : "",
    "",
    "Please share payment & delivery details. Thanks!",
  ].filter(Boolean);
  return buildUrl(lines.join("\n"));
}

export function whatsappCartUrl(cart: CartItem[], subtotal: number) {
  const shipping = subtotal >= 50 || subtotal === 0 ? 0 : 5;
  const total = subtotal + shipping;
  const lines = [
    "Hi Maison Terra, I'd like to place this order:",
    "",
    ...cart.map(
      (i, idx) =>
        `${idx + 1}. ${i.name} — Qty ${i.qty} × $${i.price.toFixed(2)} = $${(i.price * i.qty).toFixed(2)}`
    ),
    "",
    `Subtotal: $${subtotal.toFixed(2)}`,
    `Shipping: ${shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}`,
    `Total: $${total.toFixed(2)}`,
    "",
    "Please share payment & delivery details. Thanks!",
  ];
  return buildUrl(lines.join("\n"));
}
