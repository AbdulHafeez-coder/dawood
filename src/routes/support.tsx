import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Mail, MapPin, Clock } from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/support")({
  component: SupportPage,
  head: () => ({
    meta: [{ title: "Customer Support & Contact — Dawood Mart" }],
  }),
});

function SupportPage() {
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
          <div className="text-sm font-medium text-black/60">Contact Us</div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 lg:py-20">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-black mb-4 font-dmSans">
          Customer Support
        </h1>
        <p className="text-black/70 mb-10 text-lg">
          We're here to help. Reach out to us for order inquiries, sourcing requests, or general
          questions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* WhatsApp Contact */}
          <a
            href="https://wa.me/923024201342"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white border border-black/10 rounded-2xl p-6 md:p-8 shadow-sm hover:border-[#25D366] hover:shadow-md transition-all block"
          >
            <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6 text-[#25D366]" />
            </div>
            <h2 className="text-xl font-semibold text-black mb-2">WhatsApp Support</h2>
            <p className="text-black/60 text-sm mb-4 min-h-[40px]">
              Fastest response for order updates, queries, and direct sourcing.
            </p>
            <div className="font-semibold text-black text-lg group-hover:text-[#25D366] transition-colors">
              03024201342
            </div>
          </a>

          {/* Email Contact */}
          <a
            href="mailto:abdulhafeez828@gmail.com"
            className="group bg-white border border-black/10 rounded-2xl p-6 md:p-8 shadow-sm hover:border-black/30 hover:shadow-md transition-all block"
          >
            <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Mail className="w-6 h-6 text-black/80" />
            </div>
            <h2 className="text-xl font-semibold text-black mb-2">Email Us</h2>
            <p className="text-black/60 text-sm mb-4 min-h-[40px]">
              For formal inquiries, complaints, and bulk order quotations.
            </p>
            <div className="font-semibold text-black text-lg group-hover:text-black/70 transition-colors truncate">
              abdulhafeez828@gmail.com
            </div>
          </a>
        </div>

        {/* Location & Hours */}
        <div className="bg-white border border-black/10 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-black/80" />
              </div>
              <div>
                <h3 className="font-semibold text-black mb-2">Our Store</h3>
                <address className="not-italic text-sm text-black/70 leading-relaxed">
                  <strong>Shakeel Crockery Store</strong>
                  <br />
                  Opposite Al Shams Jewellers
                  <br />
                  Al Noor Town Bazar
                  <br />
                  Walton Road
                  <br />
                  Lahore Cantt, Lahore, Pakistan
                </address>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-black/80" />
              </div>
              <div>
                <h3 className="font-semibold text-black mb-2">Business Hours</h3>
                <ul className="text-sm text-black/70 space-y-1">
                  <li className="flex justify-between w-full max-w-[200px]">
                    <span>Mon - Sat:</span>
                    <span className="font-medium text-black">10:00 AM - 10:00 PM</span>
                  </li>
                  <li className="flex justify-between w-full max-w-[200px]">
                    <span>Sunday:</span>
                    <span className="font-medium text-black">Closed</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
