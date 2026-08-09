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
} from "lucide-react";
import { useSettings, type SocialKey } from "@/lib/settings";

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
    <footer
      className="bg-[#FEFDF9] px-3 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-6 lg:py-8"
      style={inter}
    >
      <div className="mx-auto max-w-7xl bg-[#ECEDEC] rounded-xl lg:rounded-2xl overflow-hidden text-black shadow-sm">


        {/* Brand + contact + socials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-8 md:p-10 border-b border-black/10">
          <div className="min-w-0 flex items-center gap-3">
            {s.logoUrl ? (
              <img
                src={s.logoUrl}
                alt={s.brandName}
                className="w-10 h-10 rounded-lg object-cover bg-white"
              />
            ) : null}
            <div className="min-w-0">
              <div
                className="text-base truncate"
                style={{ ...dmSans, fontWeight: 500, letterSpacing: "-0.03em" }}
              >
                {s.brandName}
              </div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-black/45 truncate">
                {s.tagline}
              </div>
            </div>
          </div>

          <ul className="space-y-1.5 text-xs sm:text-sm text-black/70">
            {s.contactEmail && (
              <li className="flex items-center gap-2 min-w-0">
                <Mail className="w-3.5 h-3.5 shrink-0 text-black/50" />
                <a
                  href={`mailto:${s.contactEmail}`}
                  className="truncate hover:text-black transition-colors"
                >
                  {s.contactEmail}
                </a>
              </li>
            )}
            {s.contactPhone && (
              <li className="flex items-center gap-2 min-w-0">
                <Phone className="w-3.5 h-3.5 shrink-0 text-black/50" />
                <a
                  href={`tel:${s.contactPhone.replace(/\s/g, "")}`}
                  className="truncate hover:text-black transition-colors"
                >
                  {s.contactPhone}
                </a>
              </li>
            )}
            {s.address && (
              <li className="flex items-start gap-2 min-w-0">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-black/50 mt-0.5" />
                <span className="truncate">{s.address}</span>
              </li>
            )}
          </ul>

          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            {activeSocials.length === 0 ? (
              <span className="text-[10px] uppercase tracking-[0.18em] text-black/35">
                No social links yet
              </span>
            ) : (
              activeSocials.map((k) => {
                const { label, Icon } = SOCIAL_META[k];
                return (
                  <a
                    key={k}
                    href={s.socials[k]}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={label}
                    className="w-9 h-9 rounded-full grid place-items-center border border-black/15 text-black/70 hover:bg-black hover:text-white hover:border-black transition"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })
            )}
          </div>
        </div>

        {/* Legal row */}
        <div className="px-4 sm:px-8 md:px-10 pb-4 sm:pb-6 md:pb-8">
          <div className="w-full pt-4 sm:pt-5 flex flex-col md:flex-row justify-between items-center gap-2 md:gap-6 text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.18em] text-black/50 text-center md:text-left">
            <div className="hidden sm:block">{s.tagline}</div>
            <div className="flex gap-4 sm:gap-6">
              <a href="#" className="hover:text-black transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-black transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-black transition-colors">
                Cookies
              </a>
              <a href="/admin" className="hover:text-black transition-colors">
                Admin
              </a>
            </div>
            <div>
              © {new Date().getFullYear()} {s.brandName}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
