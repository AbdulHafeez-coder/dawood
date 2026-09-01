import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, MessageCircle, MapPin, User, Phone } from "lucide-react";
import { useCart, computeShipping } from "@/lib/shop";
import { formatPKR } from "@/lib/format";
import { buildCheckoutWhatsappOrder } from "@/lib/whatsapp";
import { saveOrder } from "@/lib/orders";
import { toast } from "sonner";
import { SafeImage } from "@/components/ui/SafeImage";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, subtotal } = useCart();
  const shipping = computeShipping(subtotal);
  const total = subtotal + shipping;

  const [step, setStep] = useState<"info" | "review">("info");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dm-customer-info");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.name) setName(parsed.name);
          if (parsed.phone) setPhone(parsed.phone);
          if (parsed.city) setCity(parsed.city);
          if (parsed.address) setAddress(parsed.address);
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !city || !address) {
      toast.error("Please fill in all required fields.");
      return;
    }
    // Save to local storage for next time
    localStorage.setItem(
      "dm-customer-info",
      JSON.stringify({ name, phone, city, address })
    );
    setStep("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirmOrder = () => {
    // Generate Order ID
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderId = `DM-${randomNum}`;
    const customerInfo = { name, phone, city, address, notes };

    const { text, url, total: finalTotal, itemCount } = buildCheckoutWhatsappOrder(
      orderId,
      cart,
      subtotal,
      customerInfo
    );

    const primary = cart[0];
    saveOrder({
      id: orderId,
      kind: "cart",
      url,
      message: text,
      total: finalTotal,
      itemCount,
      primaryName: primary?.baseName ?? primary?.name ?? "Order",
      primaryImg: primary?.img,
      primaryBg: primary?.bg,
      extraCount: Math.max(0, cart.length - 1),
      status: "pending",
      customerInfo,
    });

    toast.success("Order confirmed!", {
      description: "Redirecting to WhatsApp to complete your purchase...",
    });

    setTimeout(() => {
      window.open(url, "_blank", "noopener,noreferrer");
      navigate({ to: "/" });
    }, 1000);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#FEFDF9] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-semibold mb-4 text-black">Your cart is empty</h1>
        <p className="text-black/60 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <button
          onClick={() => navigate({ to: "/" })}
          className="bg-black text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-black/90 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEFDF9] pb-24 lg:pb-12">
      {/* Header */}
      <header className="bg-white border-b border-black/10 py-4 px-6 lg:px-12 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button
            onClick={() => {
              if (step === "review") setStep("info");
              else navigate({ to: "/" });
            }}
            className="text-black/60 hover:text-black transition-colors p-2 -ml-2"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="font-semibold text-lg text-black tracking-tight">Checkout</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 lg:px-12 pt-8 lg:pt-12 grid lg:grid-cols-[1fr_400px] gap-12 lg:gap-16">
        
        {/* Left Column - Forms */}
        <div className="order-2 lg:order-1">
          {step === "info" ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-semibold text-black mb-6 flex items-center gap-2">
                <User size={20} className="text-black/50" /> Delivery Information
              </h2>
              <form onSubmit={handleReview} className="space-y-6 bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-sm font-medium text-black">Full Name *</label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ali Khan"
                      className="w-full h-11 px-3 rounded-md border border-black/15 bg-transparent text-sm text-black placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="text-sm font-medium text-black">WhatsApp Number *</label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="03XXXXXXXXX"
                      className="w-full h-11 px-3 rounded-md border border-black/15 bg-transparent text-sm text-black placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="city" className="text-sm font-medium text-black">City *</label>
                  <input
                    id="city"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Lahore"
                    className="w-full h-11 px-3 rounded-md border border-black/15 bg-transparent text-sm text-black placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="address" className="text-sm font-medium text-black">Complete Delivery Address *</label>
                  <textarea
                    id="address"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House/Apartment No, Street, Area/Society"
                    rows={3}
                    className="w-full py-3 px-3 rounded-md border border-black/15 bg-transparent text-sm text-black placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="notes" className="text-sm font-medium text-black">Order Notes (Optional)</label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special instructions for delivery"
                    rows={2}
                    className="w-full py-3 px-3 rounded-md border border-black/15 bg-transparent text-sm text-black placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-black text-white h-12 rounded-md font-medium text-sm hover:bg-black/90 transition-colors"
                >
                  Continue to Review
                </button>
              </form>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-semibold text-black mb-6 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-[#25D366]" /> Review Your Order
              </h2>
              
              <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-medium text-black">Delivery Details</h3>
                  <button onClick={() => setStep("info")} className="text-sm text-black/50 underline hover:text-black">Edit</button>
                </div>
                <div className="text-sm text-black/70 space-y-1.5 bg-[#FEFDF9] p-4 rounded-lg border border-black/5">
                  <p><span className="text-black font-medium">{name}</span></p>
                  <p>{phone}</p>
                  <p>{address}</p>
                  <p>{city}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 mb-6 lg:hidden">
                <h3 className="font-medium text-black mb-4">Order Summary</h3>
                <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-3 text-sm">
                      <div className="w-12 h-12 rounded bg-black/5 overflow-hidden shrink-0">
                         <SafeImage src={item.img} alt="" className="w-full h-full object-cover" width={48} height={48} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-black">{item.baseName ?? item.name}</p>
                        <p className="text-black/50 text-xs">Qty: {item.qty}</p>
                      </div>
                      <div className="text-black font-medium">{formatPKR(item.price * item.qty)}</div>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-black/10 space-y-2 text-sm">
                  <div className="flex justify-between text-black/60">
                    <span>Subtotal</span><span>{formatPKR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-black/60">
                    <span>Shipping</span><span>{shipping === 0 ? "Free" : formatPKR(shipping)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-black text-lg pt-2 border-t border-black/10">
                    <span>Total</span><span>{formatPKR(total)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleConfirmOrder}
                className="w-full bg-[#25D366] text-white h-14 rounded-md font-medium hover:bg-[#1ebe57] transition-colors flex items-center justify-center gap-2 shadow-sm shadow-[#25D366]/20"
              >
                <MessageCircle size={20} />
                Confirm & Send via WhatsApp
              </button>
              <p className="text-xs text-center text-black/50 mt-4">
                You will be redirected to WhatsApp to send your pre-filled order receipt. Payment is Cash on Delivery.
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Desktop Order Summary */}
        <div className="hidden lg:block order-1 lg:order-2">
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-black mb-6">Order Summary</h2>
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 ${item.bg}`}>
                    <SafeImage src={item.img} alt="" className="w-full h-full object-cover" width={64} height={64} />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="text-sm font-medium text-black leading-tight line-clamp-2">
                      {item.baseName ?? item.name}
                    </p>
                    <p className="text-xs text-black/50 mt-1">Qty: {item.qty}</p>
                  </div>
                  <div className="text-sm font-medium text-black whitespace-nowrap">
                    {formatPKR(item.price * item.qty)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-black/10 space-y-3">
              <div className="flex justify-between text-sm text-black/60">
                <span>Subtotal</span>
                <span>{formatPKR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-black/60">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : formatPKR(shipping)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-black pt-3 border-t border-black/10">
                <span>Total</span>
                <span>{formatPKR(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
