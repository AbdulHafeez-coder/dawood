import { Link } from "@tanstack/react-router";
import { useSettings } from "@/lib/settings";
export function SiteFooter() {
  const s = useSettings();
  const number = s.whatsappNumber.replace(/\D/g, "").replace(/^0/, "92");
  return (
    <footer className="mt-12 border-t bg-white px-4 py-10 text-stone-700">
      <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-3">
        <div>
          <Link to="/" className="text-xl font-bold text-emerald-950">
            {s.brandName || "Dawood Mart"}
          </Link>
          <p className="mt-3 text-sm leading-6">
            Sheets, crockery, towels and everyday home essentials.
          </p>
        </div>
        <div>
          <h2 className="mb-3 font-semibold">Customer care</h2>
          <div className="flex flex-col gap-3 text-sm">
            <Link to="/shipping">Shipping information</Link>
            <Link to="/returns">Returns policy</Link>
            <Link to="/support">Help & support</Link>
            <Link to="/orders">Your orders</Link>
          </div>
        </div>
        <div>
          <h2 className="mb-3 font-semibold">Get in touch</h2>
          <div className="space-y-3 text-sm">
            {number && (
              <a
                href={`https://wa.me/${number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                WhatsApp: {s.whatsappNumber}
              </a>
            )}
            {s.contactEmail && (
              <a href={`mailto:${s.contactEmail}`} className="block break-all">
                {s.contactEmail}
              </a>
            )}
            {s.address && <p className="leading-6">{s.address}</p>}
            <div className="flex flex-wrap gap-3">
              {Object.entries(s.socials)
                .filter(([, url]) => /^https:\/\//.test(url))
                .map(([name, url]) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="capitalize underline"
                  >
                    {name}
                  </a>
                ))}
            </div>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-7xl border-t pt-5 text-xs text-stone-500">
        © {new Date().getFullYear()} Dawood Mart
      </p>
    </footer>
  );
}
