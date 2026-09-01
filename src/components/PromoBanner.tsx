import { Link } from "@tanstack/react-router";

export function PromoBanner() {
  return (
    <div className="w-full bg-[#0F172A] text-white py-6 px-4 md:px-8 border-y-4 border-[#EAB308]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#FDE047] uppercase drop-shadow-sm mb-1">
            FLAT 20% OFF
          </div>
          <div className="text-sm md:text-base font-medium text-white/90 uppercase tracking-wide">
            ON ALL PRODUCTS STOREWIDE
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
          <Link 
            to="/" 
            className="shrink-0 bg-[#EAB308] hover:bg-[#FACC15] text-[#422006] font-bold px-8 py-3 rounded-full transition-transform hover:scale-105 shadow-lg shadow-black/20"
          >
            SHOP NOW
          </Link>
        </div>
      </div>
    </div>
  );
}
