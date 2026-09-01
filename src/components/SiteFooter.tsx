import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Music2,
  Bookmark,
  Mail,
  Phone,
  MapPin,
  Truck,
  Store,
  Clock,
  RotateCcw,
  MessageCircle,
} from "lucide-react";
import { useSettings, type SocialKey } from "@/lib/settings";
import { Logo } from "@/components/ui/Logo";
import { Link } from "@tanstack/react-router";
import { PromoBanner } from "@/components/PromoBanner";

const dmSans = { fontFamily: "'DM Sans', sans-serif" };
const inter = { fontFamily: "'Inter', sans-serif" };

const SOCIAL_META: Record<SocialKey, { label: string; Icon: typeof Instagram }> = {
  instagram: { label: "Instagram", Icon: Instagram },
  facebook: { label: "Facebook", Icon: Facebook },
  twitter: { label: "Twitter", Icon: Twitter },
  tiktok: { label: "TikTok", Icon: Music2 },
  pinterest: { label: "Pinterest", Icon: Bookmark },
  youtube: { label: "YouTube", Icon: Youtube },
};

export function SiteFooter() {
  const s = useSettings();
  const activeSocials = (Object.keys(SOCIAL_META) as SocialKey[]).filter((k) =>
    s.socials[k]?.trim(),
  );

  return (
    <>
      <PromoBanner />
      <footer className="bg-[#FEFDF9] text-black" style={inter}>
        {/* Service Features Strip */}
        <div className="border-b border-black/10 bg-[#f4f5f4]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-sm">
              <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
                <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black/70">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-black/90">Shipping Available</div>
                  <div className="text-xs text-black/60">Lahore Rs. 199 <br/>Pakistan Rs. 299</div>
                </div>
              </div>
              <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
                <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black/70">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-black/90">Lahore Self Pickup</div>
                  <div className="text-xs text-black/60">Available from our warehouse</div>
                </div>
              </div>
              <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
                <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black/70">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-black/90">Same-Day Delivery</div>
                  <div className="text-xs text-black/60">inDrive / Yango Parcel (Lahore)</div>
                </div>
              </div>
              <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
                <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black/70">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-black/90">14 Days Return</div>
                  <div className="text-xs text-black/60">Delivery charges paid by customer</div>
                </div>
              </div>
              <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2 col-span-2 md:col-span-1">
                <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black/70">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-black/90">Customer Support</div>
                  <div className="text-xs text-black/60">WhatsApp assistance available</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-10 md:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
            
            {/* Column 1: Dawood Mart Brand */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-4">
              <Logo className="w-48 h-auto text-black" />
              <div className="text-sm font-medium tracking-wide text-black/80">
                Smart Shopping, Better Living!
              </div>
              <p className="text-sm text-black/60 leading-relaxed max-w-xs">
                Your trusted online store for quality products at affordable prices.
              </p>
              
              <div className="flex items-center gap-3 pt-2">
                {activeSocials.length > 0 &&
                  activeSocials.map((k) => {
                    const { label, Icon } = SOCIAL_META[k];
                    return (
                      <a
                        key={k}
                        href={s.socials[k]}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={label}
                        className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black/70 hover:bg-black hover:text-white transition-colors"
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    );
                  })}
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <h3 className="font-bold text-black/90 mb-4" style={dmSans}>Quick Links</h3>
              <ul className="space-y-3 text-sm text-black/70">
                <li><Link to="/" className="hover:text-black transition-colors">Home</Link></li>
                <li><Link to="/" className="hover:text-black transition-colors">Shop / Categories</Link></li>
                {/* Fallback items if dedicated pages don't exist yet */}
                <li><a href="#" className="hover:text-black transition-colors">New Arrivals</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Deals / Offers</a></li>
              </ul>
            </div>

            {/* Column 3: Customer Care */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <h3 className="font-bold text-black/90 mb-4" style={dmSans}>Customer Care</h3>
              <ul className="space-y-3 text-sm text-black/70">
                <li><a href="#" className="hover:text-black transition-colors">Shipping Policy</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Return & Refund Policy</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Terms & Conditions</a></li>
                <li><a href="#" className="hover:text-black transition-colors">FAQs</a></li>
              </ul>
            </div>

            {/* Column 4: Contact & Location */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <h3 className="font-bold text-black/90 mb-4" style={dmSans}>Contact & Location</h3>
              <ul className="space-y-4 text-sm text-black/70">
                <li className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                  <Mail className="w-4 h-4 shrink-0 text-black/50 mt-0.5 hidden sm:block" />
                  <a href="mailto:abdulhafeez828@gmail.com" className="hover:text-black transition-colors">
                    abdulhafeez828@gmail.com
                  </a>
                </li>
                <li className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                  <Phone className="w-4 h-4 shrink-0 text-black/50 mt-0.5 hidden sm:block" />
                  <a href="https://wa.me/923024201342" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
                    WhatsApp: 03024201342
                  </a>
                </li>
                <li className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                  <MapPin className="w-4 h-4 shrink-0 text-black/50 mt-1 hidden sm:block" />
                  <address className="not-italic leading-relaxed text-black/70">
                    <strong>Shakeel Crockery Store</strong><br/>
                    Opposite Al Shams Jewellers<br/>
                    Al Noor Town Bazar<br/>
                    Walton Road<br/>
                    Lahore Cantt, Pakistan
                  </address>
                </li>
              </ul>
            </div>
            
          </div>
        </div>

        {/* Payment & Legal Row */}
        <div className="border-t border-black/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              
              {/* Payment Methods */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-black/50 uppercase tracking-widest mr-2">We Accept</span>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-white border border-black/10 rounded text-[10px] font-bold text-[#4B207F]">Meezan Bank</span>
                  <span className="px-2 py-1 bg-white border border-black/10 rounded text-[10px] font-bold text-[#EE2D36]">JazzCash</span>
                  <span className="px-2 py-1 bg-white border border-black/10 rounded text-[10px] font-bold text-[#4CAF50]">Easypaisa</span>
                </div>
              </div>

              {/* Legal */}
              <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-black/50">
                <div className="flex gap-4">
                  <a href="#" className="hover:text-black transition-colors">Privacy</a>
                  <a href="#" className="hover:text-black transition-colors">Terms</a>
                  <Link to="/admin" className="hover:text-black transition-colors">Admin</Link>
                </div>
                <div className="hidden sm:block text-black/20">•</div>
                <div>© {new Date().getFullYear()} Dawood Mart. All rights reserved.</div>
              </div>
              
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
