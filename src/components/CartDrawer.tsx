import { useState } from "react";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Truck,
  Sparkles,
  Tag,
  Check,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useCart, computeShipping, useCoupon, FREE_SHIPPING_THRESHOLD } from "@/lib/shop";
import { formatPKR } from "@/lib/format";
import { SafeImage } from "@/components/ui/SafeImage";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { cart, changeQty, removeItem, restoreItem, cartCount, subtotal } = useCart();
  const { couponCode, activeCoupon, applyCoupon, removeCoupon, calculateDiscount } = useCoupon();
  const [couponInput, setCouponInput] = useState("");

  const discount = calculateDiscount(subtotal);
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const shipping = computeShipping(discountedSubtotal);
  const finalTotal = discountedSubtotal + shipping;

  const freeShippingProgress = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100),
  );
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput, subtotal);
    if (res.ok) {
      toast.success(res.message);
      setCouponInput("");
    } else {
      toast.error(res.message);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    toast.info("Coupon removed.");
  };

  const handleQty = (item: (typeof cart)[number], delta: number) => {
    const nextQty = item.qty + delta;
    const prevSnapshot = { ...item };
    changeQty(item.id, delta);
    const newSubtotal = cart.reduce(
      (s, i) => s + (i.id === item.id ? Math.max(0, nextQty) * i.price : i.qty * i.price),
      0,
    );
    const newCount = cart.reduce(
      (n, i) => n + (i.id === item.id ? Math.max(0, nextQty) : i.qty),
      0,
    );
    const prevQty = item.qty;
    const newQty = Math.max(0, nextQty);
    const prevLine = item.price * prevQty;
    const newLine = item.price * newQty;
    if (nextQty <= 0) {
      toast.success(`Removed ${item.name} from cart`, {
        description: (
          <div className="text-xs leading-relaxed">
            <div>
              Qty <b>{prevQty}</b> → <b>0</b> · Line <b>{formatPKR(prevLine)}</b> →{" "}
              <b>{formatPKR(0)}</b>
            </div>
            <div className="opacity-70">
              Cart total {formatPKR(newSubtotal)} · {newCount} item{newCount === 1 ? "" : "s"}
            </div>
          </div>
        ),
        action: {
          label: "Undo",
          onClick: () => restoreItem(prevSnapshot),
        },
      });
    } else {
      toast.success(`${item.name} — qty ${nextQty}`, {
        description: (
          <div className="text-xs leading-relaxed">
            <div>
              Qty <b>{prevQty}</b> → <b>{newQty}</b> · Line <b>{formatPKR(prevLine)}</b> →{" "}
              <b>{formatPKR(newLine)}</b>
            </div>
            <div className="opacity-70">Cart total {formatPKR(newSubtotal)}</div>
          </div>
        ),
        action: {
          label: "Undo",
          onClick: () => changeQty(item.id, -delta),
        },
      });
    }
  };

  const handleRemove = (item: (typeof cart)[number]) => {
    const snapshot = { ...item };
    const newSubtotal = cart.reduce((s, i) => s + (i.id === item.id ? 0 : i.qty * i.price), 0);
    const newCount = cart.reduce((n, i) => n + (i.id === item.id ? 0 : i.qty), 0);
    removeItem(item.id);
    toast.success(`Removed ${item.name} from cart`, {
      description: `Cart total: ${formatPKR(newSubtotal)} · ${newCount} item${newCount === 1 ? "" : "s"}`,
      action: {
        label: "Undo",
        onClick: () => restoreItem(snapshot),
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="w-full sm:w-[420px] p-0 flex flex-col border-l-0 gap-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Your basket</SheetTitle>
          <SheetDescription>View and manage items in your cart.</SheetDescription>
        </SheetHeader>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/10">
          <div className="flex items-center gap-2 text-black font-medium text-lg tracking-tight">
            <ShoppingBag size={20} strokeWidth={1.75} /> Your basket
            <span className="text-black/40 text-sm">({cartCount})</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="text-black/60 hover:text-black transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="bg-stone-50 border-b border-black/5 px-5 py-3">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="flex items-center gap-1.5 text-stone-800">
              <Truck size={14} className="text-emerald-700" />
              {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Sparkles size={13} /> You unlocked FREE Delivery!
                </span>
              ) : (
                <span>
                  Add <strong className="text-black">{formatPKR(amountToFreeShipping)}</strong> more
                  for <strong>FREE Delivery</strong>
                </span>
              )}
            </span>
            <span className="text-stone-500 font-semibold">{freeShippingProgress}%</span>
          </div>
          <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                subtotal >= FREE_SHIPPING_THRESHOLD ? "bg-emerald-600" : "bg-black"
              }`}
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-black/50 gap-3">
              <ShoppingBag size={36} strokeWidth={1.25} />
              <p>Your basket is empty.</p>
              <button
                onClick={onClose}
                className="text-black underline text-sm hover:text-black/80 transition-colors"
              >
                Keep shopping
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {cart.map((i) => (
                <li key={i.id} className="flex gap-3">
                  <div className={`${i.bg} w-20 h-20 rounded-xl shrink-0 overflow-hidden`}>
                    <SafeImage
                      src={i.img}
                      alt={i.name}
                      width={1024}
                      height={1024}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-black truncate font-medium text-sm tracking-tight">
                          {i.baseName ?? i.name}
                        </div>
                        <div className="text-black/50 text-xs">
                          {i.brand ? `${i.brand} · ` : ""}
                          {i.category}
                        </div>
                        {(i.variantSizeLabel || i.variantColorLabel) && (
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            {i.variantSizeLabel && (
                              <span className="inline-flex items-center rounded-full border border-black/10 bg-black/[0.03] px-2 py-0.5 text-[11px] text-black/70">
                                {i.variantSizeLabel}
                                {i.variantSizeNote ? ` · ${i.variantSizeNote}` : ""}
                              </span>
                            )}
                            {i.variantColorLabel && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-black/[0.03] px-2 py-0.5 text-[11px] text-black/70">
                                <span
                                  aria-hidden
                                  className="inline-block h-2.5 w-2.5 rounded-full border border-black/10"
                                  style={{ background: i.variantColorSwatch ?? "#000" }}
                                />
                                {i.variantColorLabel}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end text-black text-sm whitespace-nowrap font-medium gap-0.5">
                        {i.original_price && i.original_price > i.price ? (
                          <>
                            <span className="text-black/50 line-through text-xs font-normal">
                              {formatPKR(i.original_price * i.qty)}
                            </span>
                            <span className="text-red-600 text-[10px] font-bold bg-red-50 px-1 py-0.5 rounded">
                              20% OFF
                            </span>
                            <span>{formatPKR(i.price * i.qty)}</span>
                          </>
                        ) : (
                          <span>{formatPKR(i.price * i.qty)}</span>
                        )}
                      </div>
                    </div>
                    <div className="mt-auto pt-2 flex items-center justify-between">
                      <div className="inline-flex items-center border border-black/10 rounded-full h-8">
                        <button
                          onClick={() => handleQty(i, -1)}
                          className="w-8 h-8 flex items-center justify-center text-black/70 hover:text-black transition-colors"
                          aria-label="Decrease"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center text-sm text-black">{i.qty}</span>
                        <button
                          onClick={() => handleQty(i, 1)}
                          className="w-8 h-8 flex items-center justify-center text-black/70 hover:text-black transition-colors"
                          aria-label="Increase"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemove(i)}
                        className="text-black/50 hover:text-black inline-flex items-center gap-1 text-xs transition-colors cursor-pointer"
                        aria-label={`Remove ${i.name}`}
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Promo Code & Footer Checkout */}
        {cart.length > 0 && (
          <div className="border-t border-black/10 px-5 py-4 flex flex-col gap-3 bg-white">
            {/* Promo Code Input */}
            <div>
              {activeCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                    <Tag size={14} />
                    <span>{activeCoupon.code}</span>
                    <span className="font-normal text-emerald-600">
                      ({activeCoupon.description})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-emerald-700 hover:text-red-600 font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                    title="Remove coupon"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40"
                    />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Promo code (e.g. WELCOME10)"
                      className="w-full pl-8 pr-3 py-2 bg-stone-100 hover:bg-stone-150 focus:bg-white border border-black/10 rounded-xl text-xs outline-none uppercase font-semibold text-black placeholder:normal-case placeholder:font-normal placeholder:text-black/40 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-black/80 transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              )}
            </div>

            {/* Price Calculations */}
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex justify-between text-sm text-black/60">
                <span>Subtotal</span>
                <span>{formatPKR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-700 font-medium">
                  <span className="flex items-center gap-1">
                    <Tag size={13} /> Discount ({activeCoupon?.code})
                  </span>
                  <span>-{formatPKR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-black/60">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : formatPKR(shipping)}</span>
              </div>
              <div className="flex justify-between text-black pt-2 border-t border-black/10 font-bold text-base">
                <span>Total</span>
                <span>{formatPKR(finalTotal)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                navigate({ to: "/checkout" });
              }}
              className="mt-1 inline-flex items-center justify-center gap-2 bg-black text-white rounded-xl h-11 text-sm font-semibold hover:bg-black/85 transition-colors cursor-pointer shadow-md"
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>
            <p className="text-[11px] text-black/50 text-center">
              Cash on Delivery (COD) · Fast WhatsApp Confirmation
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
