const dmSans = { fontFamily: "'DM Sans', sans-serif" };
const inter = { fontFamily: "'Inter', sans-serif" };

export function SiteFooter() {
  return (
    <footer className="bg-[#FEFDF9] px-4 sm:px-6 md:px-8 lg:px-12 py-6 lg:py-8" style={inter}>
      <div className="mx-auto max-w-7xl bg-[#ECEDEC] rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden text-black shadow-sm">
        {/* Newsletter row */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-b border-black/10">
          <div className="p-6 sm:p-8 md:p-10 border-b md:border-b-0 md:border-r border-black/10">
            <h2
              className="text-black"
              style={{
                ...dmSans,
                fontWeight: 300,
                letterSpacing: "-0.03em",
                fontSize: "clamp(22px, 2.4vw, 32px)",
                lineHeight: 1.1,
              }}
            >
              Invite nature into your inbox.
            </h2>
            <p className="mt-3 text-black/55 max-w-sm text-sm leading-relaxed">
              Seasonal rituals and early access to limited runs.
            </p>
          </div>
          <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center bg-[#FEF3C7]">
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Email address"
                aria-label="Email address"
                className="flex-1 bg-transparent border-b border-black/20 pb-2 focus:outline-none focus:border-black placeholder:text-black/40 text-sm sm:text-base transition-colors"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-black text-white rounded-full hover:bg-black/85 transition-colors uppercase tracking-[0.18em] text-[10px]"
                style={{ ...inter, fontWeight: 500 }}
              >
                Join Terra
              </button>
            </form>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 p-6 sm:p-8 md:p-10">
          {[
            { title: "Shop", links: ["Towels", "Wallpaper", "Cloths", "Sponges"] },
            { title: "Collections", links: ["Spring Edit", "Core Series", "Limited"] },
            { title: "Company", links: ["Journal", "Sustainability", "Studio"] },
            { title: "Contact", links: ["Help Center", "Shipping", "Instagram"] },
          ].map((col) => (
            <div key={col.title} className="space-y-3">
              <h4
                className="text-[10px] uppercase tracking-[0.2em] text-black/40"
                style={{ ...dmSans, fontWeight: 700 }}
              >
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-black hover:text-black/55 transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Legal row */}
        <div className="px-6 sm:px-8 md:px-10 pb-6 md:pb-8">
          <div className="w-full pt-5 border-t border-black/10 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-6 text-[10px] uppercase tracking-[0.18em] text-black/50">
            <div>Essentials for a tactile home</div>
            <div className="flex gap-5 sm:gap-6">
              <a href="#" className="hover:text-black transition-colors">Privacy</a>
              <a href="#" className="hover:text-black transition-colors">Terms</a>
              <a href="#" className="hover:text-black transition-colors">Cookies</a>
            </div>
            <div>© {new Date().getFullYear()} Maison Terra</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
