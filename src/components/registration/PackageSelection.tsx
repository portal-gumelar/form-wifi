import React from "react";
import { PACKAGES } from "../../constants/packages";

interface PackageSelectionProps {
  selectedPackage: string;
  onSelect: (pkgLabel: string, pkgSpeed: string, pkgPrice: string) => void;
}

const CheckCircle = ({ size, className, fill }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export const PackageSelection: React.FC<PackageSelectionProps> = ({ selectedPackage, onSelect }) => {
  return (
    <section id="sec-paket" className="mb-12 scroll-mt-24 mt-8">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {PACKAGES.map((pkg) => (
          <div 
            key={pkg.label} 
            onClick={() => onSelect(pkg.label, pkg.speed, pkg.price)} 
            className={`relative cursor-pointer rounded-[2rem] p-5 transition-all duration-300 border-2 flex flex-col ${selectedPackage.startsWith(pkg.label) ? "bg-white border-[#F47920] shadow-2xl scale-105 z-10" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
          >
            {pkg.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Populer</div>}
            <div className={`${pkg.badge} text-white text-[9px] font-black px-2.5 py-1 rounded-lg mb-3 self-start uppercase tracking-wider`}>{pkg.label}</div>
            <div className={`font-black text-3xl leading-none mb-1 ${selectedPackage.startsWith(pkg.label) ? "text-[#1a2d8f]" : "text-white"}`}>{pkg.speed}</div>
            <div className="h-0.5 w-full bg-[#F47920]/20 my-3"></div>
            
            <ul className="space-y-2 mb-6">
              {pkg.features.map((feat: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><CheckCircle size={10} className="text-white" fill="currentColor" /></div>
                  <span className={`text-[10px] font-bold leading-tight ${selectedPackage.startsWith(pkg.label) ? "text-slate-600" : "text-white/80"}`}>{feat}</span>
                </li>
              ))}
            </ul>

            <div className={`mt-auto border-t pt-4 mb-4 ${selectedPackage.startsWith(pkg.label) ? "border-slate-100" : "border-white/10"}`}>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Hanya</div>
              <div className="flex items-baseline gap-1">
                <div className="text-[#F47920] font-black text-2xl tracking-tighter">Rp {pkg.price}</div>
                <div className="text-[10px] text-slate-400 uppercase font-black">/ bln</div>
              </div>
            </div>
            <div className={`mt-auto py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-center transition-all ${selectedPackage.startsWith(pkg.label) ? "bg-[#1a2d8f] text-white shadow-lg" : "bg-white/10 text-white/50 border border-white/10"}`}>{selectedPackage.startsWith(pkg.label) ? "Dipilih" : "Pilih"}</div>
          </div>
        ))}
      </div>
    </section>
  );
};
