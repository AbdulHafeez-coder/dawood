import type { Product, CartItem } from "@/lib/shop";

// Update this number to your WhatsApp business line (international format, digits only).
export const WHATSAPP_NUMBER = "15551234567";

function buildUrl(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

const money = (n: number) => `$${n.toFixed(2)}`;
const DIVIDER = "━━━━━━━━━━━━━━";

export function whatsappProductUrl(product: Product, qty: number = 1) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  const subtotal = product.price * qty;

  const lines = [
    "*Maison Terra — New Order*",
    "Hi! I'd like to order the following item:",
    "",
    DIVIDER,
    `*${product.name}*`,
    `Category:  ${product.category}`,
    `Quantity:  ${qty}`,
    `Price:     ${money(product.price)} each`,
    `Subtotal:  *${money(subtotal)}*`,
    url ? `Link:      ${url}` : "",
    DIVIDER,
    "",
    `*Order total: ${money(subtotal)}*`,
    "",
    "Please share payment & delivery details. Thanks!",
  ].filter(Boolean);

  return buildUrl(lines.join("\n"));
}

export function whatsappCartUrl(cart: CartItem[], subtotal: number) {
  const shipping = subtotal >= 50 || subtotal === 0 ? 0 : 5;
  const total = subtotal + shipping;
  const itemCount = cart.reduce((n, i) => n + i.qty, 0);

  const itemBlocks = cart.flatMap((i, idx) => [
    `*${idx + 1}. ${i.name}*`,
    `   Category:  ${i.category}`,
    `   Quantity:  ${i.qty}`,
    `   Price:     ${money(i.price)} each`,
    `   Subtotal:  ${money(i.price * i.qty)}`,
    "",
  ]);

  const lines = [
    "*Maison Terra — New Order*",
    `Hi! I'd like to place an order for ${itemCount} item${itemCount === 1 ? "" : "s"}:`,
    "",
    DIVIDER,
    ...itemBlocks,
    DIVIDER,
    "",
    "*Order summary*",
    `Subtotal:  ${money(subtotal)}`,
    `Shipping:  ${shipping === 0 ? "Free" : money(shipping)}`,
    `*Total:     ${money(total)}*`,
    "",
    "Please share payment & delivery details. Thanks!",
  ];

  return buildUrl(lines.join("\n"));
}
