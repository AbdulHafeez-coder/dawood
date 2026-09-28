import { createFileRoute } from "@tanstack/react-router";
import { RefreshCcw, ShieldCheck, AlertTriangle, PackageX, MessageCircle } from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/returns")({
  component: ReturnsPage,
  head: () => ({
    meta: [{ title: "Returns & Refunds — Dawood Mart" }],
  }),
});

function ReturnsPage() {
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
          <div className="text-sm font-medium text-black/60">Returns & Refunds</div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 lg:py-20">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-black mb-4 font-dmSans">
          Returns & Refunds Policy
        </h1>
        <p className="text-black/70 mb-10 text-lg">
          Your satisfaction is our priority. Please review our standard return and refund
          procedures.
        </p>

        <div className="space-y-8">
          {/* General Return Conditions */}
          <section className="bg-white border border-black/10 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center shrink-0">
                <RefreshCcw className="w-6 h-6 text-black/80" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-black mb-2">General Return Conditions</h2>
                <ul className="list-disc pl-4 space-y-2 text-black/70 mt-4 marker:text-black/40">
                  <li>Products must be returned in their original condition and packaging.</li>
                  <li>
                    Items that have been used, washed, or damaged by the customer are not eligible
                    for return.
                  </li>
                  <li>
                    Returns must be initiated within the applicable return window stated at the time
                    of purchase (typically 14 days unless specified otherwise).
                  </li>
                  <li>
                    Customers are responsible for the return delivery charges unless the product was
                    damaged upon arrival.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Open & Check Policy */}
          <section className="bg-white border border-black/10 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-black/80" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-black mb-2">Parcel Open & Check</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  We highly recommend utilizing our{" "}
                  <strong className="text-black font-semibold">Open & Check</strong> policy
                  available on eligible COD parcels. Inspect your item(s) before making payment to
                  the courier. If the product does not match your expectations or appears damaged,
                  you can refuse the parcel on the spot.
                </p>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-900 leading-relaxed">
                    If you accept the parcel and later discover an issue, the standard return
                    process will apply.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Damaged or Wrong Product */}
          <section className="bg-white border border-black/10 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center shrink-0">
                <PackageX className="w-6 h-6 text-black/80" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-black mb-2">Damaged or Wrong Product</h2>
                <p className="text-black/70 leading-relaxed">
                  If you receive a defective or incorrect item and were unable to refuse it at the
                  time of delivery, please contact our support team immediately. Provide clear
                  photos of the damaged item or incorrect product along with your order details. We
                  will arrange a replacement or refund at no additional shipping cost to you.
                </p>
              </div>
            </div>
          </section>

          {/* Customer Contact Process */}
          <section className="bg-white border border-black/10 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center shrink-0">
                <MessageCircle className="w-6 h-6 text-black/80" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-black mb-2">How to Initiate a Return</h2>
                <p className="text-black/70 leading-relaxed mb-4">
                  To start a return or refund request, please contact us on WhatsApp with your Order
                  ID and reason for return.
                </p>
                <a
                  href="https://wa.me/923024201342"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#20bd5a] transition-colors shadow-sm shadow-[#25D366]/20"
                >
                  <MessageCircle size={20} />
                  Contact Support on WhatsApp
                </a>

                <h3 className="font-semibold text-black mt-8 mb-2">Refund Processing</h3>
                <p className="text-black/70 leading-relaxed text-sm">
                  Once we receive and inspect your returned item, we will notify you of the approval
                  or rejection of your refund. Approved refunds for COD orders will be transferred
                  to your provided bank account or mobile wallet (JazzCash/Easypaisa) within 3-5
                  working days.
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
