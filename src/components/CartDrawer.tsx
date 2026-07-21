import { ShoppingBag, X, Plus, Minus, Trash2, MessageCircle } from "lucide-react";
import { useCart } from "@/lib/shop";
import { whatsappCartUrl } from "@/lib/whatsapp";

const dmSans = { fontFamily: "'DM Sans', sans-serif" };

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, changeQty, removeItem, cartCount, subtotal } = useCart();

  return (
    <div
      className={`fixed inset-0 z-40 transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <aside
        className={`absolute top-0 right-0 h-full w-full sm:w-[420px] bg-white flex flex-col shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/10">
          <div className="flex items-center gap-2 text-black" style={{ ...dmSans, fontWeight: 500, fontSize: 22, letterSpacing: "-0.03em" }}>
            <ShoppingBag size={20} strokeWidth={1.75} /> Your basket
            <span className="text-black/40 text-sm">({cartCount})</span>
          </div>
          <button onClick={onClose} aria-label="Close cart" className="text-black/60 hover:text-black">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-black/50 gap-3">
              <ShoppingBag size={36} strokeWidth={1.25} />
              <p>Your basket is empty.</p>
              <button onClick={onClose} className="text-black underline text-sm">Keep shopping</button>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {cart.map((i) => (
                <li key={i.id} className="flex gap-3">
                  <div className={`${i.bg} w-20 h-20 rounded-xl shrink-0 overflow-hidden`}>
                    <img src={i.img} alt={i.name} width={1024} height={1024} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-black truncate" style={{ ...dmSans, fontWeight: 500, fontSize: 16, letterSpacing: "-0.02em" }}>
                          {i.name}
                        </div>
                        <div className="text-black/50 text-xs">{i.category}</div>
                      </div>
                      <div className="text-black text-sm whitespace-nowrap" style={{ fontWeight: 500 }}>
                        ${(i.price * i.qty).toFixed(2)}
                      </div>
                    </div>
                    <div className="mt-auto pt-2 flex items-center justify-between">
                      <div className="inline-flex items-center border border-black/10 rounded-full h-8">
                        <button onClick={() => changeQty(i.id, -1)} className="w-8 h-8 flex items-center justify-center text-black/70 hover:text-black" aria-label="Decrease">
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center text-sm text-black">{i.qty}</span>
                        <button onClick={() => changeQty(i.id, 1)} className="w-8 h-8 flex items-center justify-center text-black/70 hover:text-black" aria-label="Increase">
                          <Plus size={14} />
                        </button>
                      </div>
                      <button onClick={() => removeItem(i.id)} className="text-black/50 hover:text-black inline-flex items-center gap-1 text-xs" aria-label={`Remove ${i.name}`}>
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-black/10 px-5 py-4 flex flex-col gap-3">
            <div className="flex justify-between text-sm text-black/60">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-black/60">
              <span>Shipping</span>
              <span>{subtotal >= 50 ? "Free" : "$5.00"}</span>
            </div>
            <div className="flex justify-between text-black pt-2 border-t border-black/10" style={{ ...dmSans, fontWeight: 500, fontSize: 18 }}>
              <span>Total</span>
              <span>${(subtotal + (subtotal >= 50 || subtotal === 0 ? 0 : 5)).toFixed(2)}</span>
            </div>
            <a
              href={whatsappCartUrl(cart, subtotal)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-md h-12 text-base hover:bg-[#1ebe57] transition-colors"
              style={{ fontWeight: 500 }}
            >
              <MessageCircle size={18} /> Order on WhatsApp
            </a>
            <p className="text-[11px] text-black/50 text-center">You'll be redirected to WhatsApp with your order details pre-filled.</p>
          </div>
        )}
      </aside>
    </div>
  );
}
