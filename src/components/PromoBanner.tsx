import { Link } from "@tanstack/react-router";

export function PromoBanner() {
  return (
    <div className="w-full bg-[#0F172A] text-white py-6 px-4 md:px-8 border-y-4 border-[#EAB308]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#FDE047] uppercase drop-shadow-sm mb-1">
            FLAT 20% OFF
          </div>
          <div className="text-sm md:text-base font-medium text-white/90">
            Get Flat 20% Discount on Online Payment
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Eligible Methods</span>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-white/10 text-white rounded-md text-xs font-medium backdrop-blur-sm border border-white/20">Meezan Bank</span>
              <span className="px-3 py-1 bg-[#EE2D36]/20 text-[#EE2D36] rounded-md text-xs font-bold backdrop-blur-sm border border-[#EE2D36]/30">JazzCash</span>
              <span className="px-3 py-1 bg-[#4CAF50]/20 text-[#4CAF50] rounded-md text-xs font-bold backdrop-blur-sm border border-[#4CAF50]/30">Easypaisa</span>
            </div>
          </div>
          
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
