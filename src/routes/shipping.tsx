import { createFileRoute } from "@tanstack/react-router";
import { Truck, MapPin, Banknote, PackageOpen, Store, Tag } from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/shipping")({
  component: ShippingPage,
  head: () => ({
    meta: [{ title: "Shipping & Delivery — Dawood Mart" }],
  }),
});

function ShippingPage() {
  return (
    <div className="min-h-screen bg-[#FEFDF9] flex flex-col font-inter">
      {/* Simple Header */}
      <header className="bg-white border-b border-black/10 py-4 px-6 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="font-bold text-xl tracking-tight text-black hover:opacity-70 transition-opacity font-dmSans"
          >
            DAWOOD MART
          </Link>
          <div className="text-sm font-medium text-black/60">Shipping & Delivery</div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 lg:py-20">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-black mb-4 font-dmSans">
          Shipping & Delivery
        </h1>
        <p className="text-black/70 mb-10 text-lg">
          Everything you need to know about how Dawood Mart gets your home essentials to your
          doorstep.
        </p>

        <div className="space-y-8">
          {/* Delivery Time */}
          <section className="bg-white border border-black/10 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6 text-black/80" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-black mb-2">Delivery Time</h2>
                <p className="text-black/70 leading-relaxed">
                  <strong className="text-black font-semibold">3–5 Working Days</strong>
                  <br />
                  This applies to standard parcel delivery across Pakistan, subject to location and
                  courier availability. We partner with reliable couriers to ensure your order
                  reaches you safely.
                </p>
              </div>
            </div>
          </section>

          {/* Delivery Charges */}
          <section className="bg-white border border-black/10 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-black/80" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-black mb-2">Delivery Charges</h2>
                <ul className="space-y-3 text-black/70 mt-4">
                  <li className="flex items-center justify-between border-b border-black/5 pb-2">
                    <span>Lahore Delivery</span>
                    <strong className="text-black">Rs. 199</strong>
                  </li>
                  <li className="flex items-center justify-between border-b border-black/5 pb-2">
                    <span>All Pakistan Delivery</span>
                    <strong className="text-black">Rs. 299</strong>
                  </li>
                  <li className="flex items-center justify-between pt-1">
                    <span>Orders over Rs. 5000</span>
                    <strong className="text-black">Free Shipping</strong>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Payment & COD */}
          <section className="bg-white border border-black/10 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center shrink-0">
                <Banknote className="w-6 h-6 text-black/80" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-black mb-2">Cash on Delivery (COD)</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  <strong className="text-black font-semibold">Available Nationwide</strong>
                  <br />
                  Customers can place eligible orders and conveniently pay cash when the parcel is
                  delivered right to their doorstep.
                </p>

                <div className="bg-[#f4f5f4] p-4 rounded-xl border border-black/5">
                  <div className="flex items-center gap-3 mb-2">
                    <PackageOpen className="w-5 h-5 text-black/80 shrink-0" />
                    <strong className="text-black font-semibold">Parcel Open & Check</strong>
                  </div>
                  <p className="text-sm text-black/70">
                    Open & Check Available on Eligible COD Parcels — Please inspect your parcel
                    before accepting it. If you are not satisfied with the parcel at the time of
                    delivery, follow the applicable return/refusal procedure.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Local Options */}
          <section className="bg-white border border-black/10 rounded-2xl p-6 md:p-8 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <Store className="w-5 h-5 text-black/60" />
                <h3 className="font-semibold text-black">Lahore Self Pickup</h3>
              </div>
              <p className="text-sm text-black/70">
                Available from our warehouse. Order online and pick up at your convenience to save
                on shipping.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-black/60" />
                <h3 className="font-semibold text-black">Local Parcel Delivery</h3>
              </div>
              <p className="text-sm text-black/70">
                inDrive / Yango parcel ride available where applicable for urgent same-day Lahore
                deliveries.
              </p>
            </div>
          </section>

          {/* Promotions */}
          <section className="bg-white border border-black/10 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center shrink-0">
                <Tag className="w-6 h-6 text-black/80" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-black mb-2">Storewide Promotion</h2>
                <p className="text-black/70 leading-relaxed">
                  We are currently running a{" "}
                  <strong className="text-black">FLAT 20% OFF ON ALL PRODUCTS</strong>. This
                  discount is automatically applied to all eligible items and is reflected in the
                  final order total at checkout. This promotion is a general product discount and
                  applies to all orders, including Cash on Delivery!
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
