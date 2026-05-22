import React from "react";
import { PACKAGES } from "../../constants/packages";
import * as Lucide from "lucide-react";

interface PackageSelectionProps {
  selectedPackage: string;
  onSelect: (pkgLabel: string, pkgSpeed: string, pkgPrice: string) => void;
}

export const PackageSelection: React.FC<PackageSelectionProps> = ({ selectedPackage, onSelect }) => {
  return (
    <section id="sec-paket" className="mb-12 scroll-mt-24 mt-6 w-full">

      {/* HEADER SECTION LAYOUT */}
      <div className="mb-6 px-1 text-left">
        <h3 className="text-xs font-black text-[#FDB913] uppercase tracking-[0.2em] flex items-center gap-2">
          <Lucide.Wifi size={14} className="animate-pulse" /> Pilihan Paket Internet
        </h3>
        <p className="text-white text-lg sm:text-xl font-black tracking-tight mt-1">Pilih kecepatan sesuai kebutuhan digital Anda</p>
      </div>

      {/* GRID ARCHITECTURE REVISI: 
        - Layar HP (Default): grid-cols-1 (Menumpuk vertikal, aman dari pemotongan teks)
        - Layar Tablet (sm): grid-cols-2
        - Layar Laptop (lg): grid-cols-5
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {PACKAGES.map((pkg) => {
          const isSelected = selectedPackage.startsWith(pkg.label);

          return (
            <div
              key={pkg.label}
              onClick={() => onSelect(pkg.label, pkg.speed, pkg.price)}
              className={`relative cursor-pointer rounded-[2rem] p-5 sm:p-6 transition-all duration-300 border-2 flex flex-col justify-between ${isSelected
                  ? "bg-white border-[#F47920] shadow-[0_20px_40px_rgba(244,121,32,0.25)] translate-y-[-4px] z-10"
                  : "bg-[#1a2d8f]/40 backdrop-blur-sm border-white/10 hover:border-white/30 hover:bg-[#1a2d8f]/60"
                }`}
            >
              {/* Badge Populer */}
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-600 to-orange-600 text-white text-[9px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-md border border-yellow-300/30">
                  🔥 Populer
                </div>
              )}

              {/* Bagian Atas Kartu */}
              <div className="w-full">
                <div className={`${pkg.badge} text-white text-[9px] font-black px-3 py-1 rounded-xl mb-4 inline-block uppercase tracking-widest shadow-sm`}>
                  {pkg.label}
                </div>

                <div className="flex items-baseline gap-1 mb-1">
                  <div className={`font-black text-3xl sm:text-4xl tracking-tighter leading-none ${isSelected ? "text-[#0d1655]" : "text-white"}`}>
                    {(() => {
                      const match = pkg.speed.match(/(\d+)\s*Mbps/i);
                      return match ? `${match[1]} Mbps` : pkg.speed;
                    })()}
                  </div>
                </div>

                <div className={`h-0.5 w-full my-3 sm:my-4 ${isSelected ? "bg-orange-100" : "bg-white/10"}`}></div>

                {/* Daftar Fitur Layanan */}
                <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  {pkg.features.map((feat: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm shadow-emerald-500/20">
                        <Lucide.Check size={10} className="text-white" strokeWidth={4} />
                      </div>
                      <span className={`text-xs font-bold leading-tight ${isSelected ? "text-slate-600" : "text-white/90 drop-shadow-sm"}`}>
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bagian Bawah Kartu (Harga & Tombol Aksi) */}
              <div className="w-full mt-auto">
                <div className={`border-t pt-3 sm:pt-4 mb-3 sm:mb-4 ${isSelected ? "border-slate-100" : "border-white/10"}`}>
                  <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">Investasi Bulanan</div>
                  <div className="flex items-baseline gap-1">
                    <div className="text-[#F47920] font-black text-xl sm:text-2xl tracking-tight">Rp {pkg.price}</div>
                    <div className={`text-[10px] uppercase font-black ${isSelected ? "text-slate-400" : "text-white/40"}`}>/ bln</div>
                  </div>
                </div>

                <div className={`w-full py-2.5 sm:py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest text-center transition-all ${isSelected
                    ? "bg-[#0d1655] text-white shadow-lg shadow-blue-950/30"
                    : "bg-white/10 text-white/70 border border-white/10 hover:bg-white/20"
                  }`}>
                  {isSelected ? "✓ Dipilih" : "Pilih Paket"}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
};