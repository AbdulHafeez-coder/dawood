// Verified against the existing production footer (main 3ff84b1), not demo defaults.
// The legacy singleton was seeded with Maison Terra; never send orders to that number.
export const VERIFIED_DAWOOD_CONTACT = {
  brandName: "Dawood Mart",
  tagline: "Smart Shopping, Better Living!",
  logoUrl: "",
  whatsappNumber: "03024201342",
  contactPhone: "03024201342",
  contactEmail: "abdulhafeez828@gmail.com",
  address:
    "Shakeel Crockery Store, Opposite Al Shams Jewellers, Al Noor Town Bazar, Walton Road, Lahore Cantt, Lahore, Pakistan",
  socials: { instagram: "", facebook: "", twitter: "", tiktok: "", pinterest: "", youtube: "" },
};
export function cleanBusinessSettings<T extends typeof VERIFIED_DAWOOD_CONTACT>(settings: T): T {
  const knownDemo =
    /maison\s*terra/i.test(settings.brandName) ||
    /maisonterra\.co/i.test(settings.contactEmail) ||
    /12 Linden Row|Copenhagen/i.test(settings.address) ||
    /^(?:92|0)?3011234567$/.test(settings.whatsappNumber.replace(/\D/g, ""));
  return knownDemo
    ? { ...settings, ...VERIFIED_DAWOOD_CONTACT, socials: { ...VERIFIED_DAWOOD_CONTACT.socials } }
    : settings;
}
