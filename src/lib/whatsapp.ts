import type { Product, CartItem } from "@/lib/shop";
import { computeShipping } from "@/lib/shop";
import { getSettings } from "@/lib/settings";
import { formatPKR } from "@/lib/format";

function buildUrl(text: string) {
  const raw = (getSettings().whatsappNumber || "").replace(/\D/g, "");
  // Pakistani local (11 digits, starts with 03) → 92XXXXXXXXXX
  const number =
    raw.length === 11 && raw.startsWith("03") ? `92${raw.slice(1)}` : raw || "923011234567";
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

const money = (n: number) => formatPKR(n);
const DIVIDER = "━━━━━━━━━━━━━━";

export function buildWhatsappProductOrder(product: Product, qty: number = 1) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  const subtotal = product.price * qty;

  const brand = getSettings().brandName || "Store";
  const lines = [
    `*${brand} — New Order*`,

    "Hi! I'd like to order the following item:",
    "",
    DIVIDER,
    `*${product.display_name || product.name}*`,
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

  const text = lines.join("\n");
  return { text, url: buildUrl(text), total: subtotal };
}

export function buildWhatsappCartOrder(cart: CartItem[], subtotal: number) {
  const shipping = computeShipping(subtotal);
  const total = subtotal + shipping;
  const itemCount = cart.reduce((n, i) => n + i.qty, 0);

  const itemBlocks = cart.flatMap((i, idx) => {
    const displayName = i.baseName ?? i.name;
    const sizeLine = i.variantSizeLabel
      ? `   Size:      ${i.variantSizeLabel}${i.variantSizeNote ? ` (${i.variantSizeNote})` : ""}`
      : null;
    const colorLine = i.variantColorLabel ? `   Colour:    ${i.variantColorLabel}` : null;
    return [
      `*${idx + 1}. ${displayName}*`,
      `   Category:  ${i.category}`,
      sizeLine,
      colorLine,
      `   Quantity:  ${i.qty}`,
      `   Price:     ${money(i.price)} each`,
      `   Subtotal:  ${money(i.price * i.qty)}`,
      "",
    ].filter((x): x is string => x !== null);
  });

  const brand = getSettings().brandName || "Store";
  const lines = [
    `*${brand} — New Order*`,

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

  const text = lines.join("\n");
  return { text, url: buildUrl(text), total, itemCount };
}

// Legacy convenience wrappers (URL only)
export function whatsappProductUrl(product: Product, qty: number = 1) {
  return buildWhatsappProductOrder(product, qty).url;
}
export function whatsappCartUrl(cart: CartItem[], subtotal: number) {
  return buildWhatsappCartOrder(cart, subtotal).url;
}
