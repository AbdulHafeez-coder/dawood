import { useSettings } from "@/lib/settings";
import { Link } from "@tanstack/react-router";
export function SiteFooter() {
  const s = useSettings();
  const number = s.whatsappNumber.replace(/\D/g, "").replace(/^0/, "92");
  return (
    <footer className="dm-footer">
      <div className="dm-footer-grid">
        <div>
          <a href="/" className="dm-wordmark">
            {s.brandName}.
          </a>
          <p>Thoughtful essentials for your everyday home.</p>
          <div className="dm-socials">
            {Object.entries(s.socials)
              .filter(([, url]) => /^https?:\/\//.test(url))
              .map(([name, url]) => (
                <a key={name} href={url} target="_blank" rel="noopener noreferrer">
                  {name}
                </a>
              ))}
          </div>
        </div>
        <div>
          <h2>Explore</h2>
          <a href="/#shop">Shop all</a>
          <Link to="/favorites">Favourites</Link>
          <Link to="/orders">Your orders</Link>
        </div>
        <div>
          <h2>We're here to help</h2>
          <Link to="/shipping">Shipping & delivery</Link>
          <Link to="/returns">Returns</Link>
          <Link to="/support">Contact & support</Link>
          {number && (
            <a href={`https://wa.me/${number}`} target="_blank" rel="noopener noreferrer">
              Chat on WhatsApp
            </a>
          )}
        </div>
        <div>
          <h2>Find us</h2>
          {s.address && <address>{s.address}</address>}
          {s.contactPhone && (
            <a href={`tel:${s.contactPhone.replace(/[^+\d]/g, "")}`}>{s.contactPhone}</a>
          )}
          {s.contactEmail && <a href={`mailto:${s.contactEmail}`}>{s.contactEmail}</a>}
        </div>
      </div>
      <div className="dm-footer-bottom">
        <span>
          © {new Date().getFullYear()} {s.brandName}
        </span>
        <span>Made for everyday living · Pakistan</span>
        <Link to="/admin/login">Admin Login</Link>
      </div>
    </footer>
  );
}
