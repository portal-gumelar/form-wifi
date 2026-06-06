import React, { useState, useEffect } from "react";
import { PACKAGES } from "../../constants/packages";
import * as Lucide from "lucide-react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface PackageSelectionProps {
  selectedPackage: string;
  onSelect: (pkgLabel: string, pkgSpeed: string, pkgPrice: string, autoScroll?: boolean) => void;
}

export const PackageSelection: React.FC<PackageSelectionProps> = ({ selectedPackage, onSelect }) => {
  const [gadgetCount, setGadgetCount] = useState<number>(0);
  const [hasTv, setHasTv] = useState<boolean>(false);
  const [tvSize, setTvSize] = useState<string>("32");
  const [hasLive, setHasLive] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  const [totalMbps, setTotalMbps] = useState<number>(8);
  const [recommendedSpeed, setRecommendedSpeed] = useState<number>(20);

  useEffect(() => {
    let total = 0;
    
    // A. Input Perangkat Aktif (4 Mbps per HP)
    total += (Number(gadgetCount) || 0) * 4;
    
    // B. Input Smart TV
    if (hasTv) {
      if (tvSize === "32") total += 8;
      else if (tvSize === "43") total += 12;
      else if (tvSize === "50") total += 20;
    }

    // C. Input Live Streaming
    if (hasLive) {
      total += 15;
    }

    setTotalMbps(total);

    // D. Logika Rekomendasi
    let rec = 10;
    if (total <= 10) rec = 10;
    else if (total <= 20) rec = 20;
    else if (total <= 35) rec = 30;
    else if (total <= 55) rec = 50;
    else rec = 100;

    setRecommendedSpeed(rec);

    if (hasInteracted) {
      const targetSpeed = rec === 10 ? 20 : rec;
      const pkg = PACKAGES.find(p => p.speed.includes(`${targetSpeed} Mbps`));
      if (pkg) {
        onSelect(pkg.label, pkg.speed, pkg.price, false);
      }
    }

  }, [gadgetCount, hasTv, tvSize, hasLive, hasInteracted]);

  // Debounce auto-scroll to recommendation box after user interaction
  useEffect(() => {
    if (hasInteracted) {
      const timer = setTimeout(() => {
        const el = document.getElementById("rekomendasi-hasil");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("ring-4", "ring-[#FDB913]/50", "rounded-2xl", "transition-all", "duration-500");
          setTimeout(() => el.classList.remove("ring-4", "ring-[#FDB913]/50"), 1500);
        }
      }, 1200); // Tunggu 1.2 detik setelah interaksi terakhir (agar saat user klik + berkali-kali tidak langsung lompat)
      return () => clearTimeout(timer);
    }
  }, [gadgetCount, hasTv, tvSize, hasLive, hasInteracted]);

  // Handle Auto-Select saat rekomendasi berubah, HANYA JIKA user belum memilih manual?
  // Atau kita biarkan tombol pilih di paket sebagai manual override.
  // Untuk action pre-select, kita sorot paket yang direkomendasikan.

  const count = useMotionValue(8);
  const roundedCount = useTransform(count, Math.round);

  useEffect(() => {
    const animation = animate(count, totalMbps, { duration: 0.6, ease: "easeOut" });
    return animation.stop;
  }, [totalMbps, count]);

  const getRecommendedPackage = () => {

    // Karena paket 10 Mbps mungkin belum ada di list, kita fallback ke 20 Mbps
    const targetSpeed = recommendedSpeed === 10 ? 20 : recommendedSpeed;
    const pkg = PACKAGES.find(p => p.speed.includes(`${targetSpeed} Mbps`));
    return pkg || PACKAGES[0]; // fallback ke paket pertama
  };

  const recPkg = getRecommendedPackage();

  return (
    <section id="sec-paket" className="mb-12 scroll-mt-24 mt-6 w-full">
      {/* ATTENTION: Header */}
      <div className="mb-6 px-1 text-left">
        <h3 className="text-xs font-black text-[#FDB913] uppercase tracking-[0.2em] flex items-center gap-2">
          <Lucide.Cpu size={14} className="animate-pulse" /> Asisten Cerdas Pilihan Paket
        </h3>
        <p className="text-white text-lg sm:text-xl font-black tracking-tight mt-1">Hitung kebutuhan internet ideal Anda</p>
      </div>

      {/* INTEREST & DESIRE: Kalkulator & Rekomendasi (Luxury Glassmorphic) */}
      <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-5 sm:p-7 mb-8 border border-white/40 relative overflow-hidden">
        {/* Dekorasi Aksent Minimalist */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-orange-50 rounded-bl-[100px] opacity-60 pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
          
          {/* Bagian Input Interaktif */}
          <div className="space-y-5">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b pb-2">Kalkulator Perangkat</h4>
            
            {/* Input HP */}
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                  <Lucide.Smartphone size={16} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">Jumlah HP / Gadget</div>
                  <div className="text-[10px] text-slate-500 font-medium">Aktif bersamaan</div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                <button 
                  onClick={() => { setGadgetCount(Math.max(0, gadgetCount - 1)); setHasInteracted(true); }}
                  className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
                >
                  <Lucide.Minus size={14} strokeWidth={3} />
                </button>
                <div className="w-6 text-center font-black text-slate-800 text-sm">
                  {gadgetCount}
                </div>
                <button 
                  onClick={() => { setGadgetCount(gadgetCount + 1); setHasInteracted(true); }}
                  className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-600 transition-colors"
                >
                  <Lucide.Plus size={14} strokeWidth={3} />
                </button>
              </div>
            </div>

            {/* Toggle Smart TV */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 transition-all">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${hasTv ? 'bg-orange-100 text-orange-600' : 'bg-slate-200 text-slate-500'}`}>
                    <Lucide.Tv size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">Smart TV / Android Box</div>
                    <div className="text-[10px] text-slate-500 font-medium">Netflix, YouTube di TV</div>
                  </div>
                </div>
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={hasTv} onChange={(e) => { setHasTv(e.target.checked); setHasInteracted(true); }} />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${hasTv ? 'bg-orange-500' : 'bg-slate-300'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${hasTv ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </label>

              {hasTv && (
                <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="text-xs font-bold text-slate-600 whitespace-nowrap">Resolusi / Ukuran:</div>
                  <div className="relative w-full">
                    <select 
                      value={tvSize} 
                      onChange={(e) => { setTvSize(e.target.value); setHasInteracted(true); }}
                      className="w-full p-2.5 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 appearance-none shadow-sm transition-all pr-8"
                    >
                      <option value="32">Standar / Sekitar 32 Inch</option>
                      <option value="43">Medium / 40-43 Inch</option>
                      <option value="50">Besar (4K) / 50 Inch ke Atas</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Lucide.ChevronDown size={14} strokeWidth={3} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Toggle Live Streaming */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 transition-all">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${hasLive ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-500'}`}>
                    <Lucide.Video size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">Live Jualan / Streaming</div>
                    <div className="text-[10px] text-slate-500 font-medium">TikTok Live, Shopee Live</div>
                  </div>
                </div>
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={hasLive} onChange={(e) => { setHasLive(e.target.checked); setHasInteracted(true); }} />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${hasLive ? 'bg-rose-500' : 'bg-slate-300'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${hasLive ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </label>
            </div>
          </div>

          {/* Bagian Hasil & Rekomendasi */}
          <div className="flex flex-col justify-center">
            <div className="bg-gradient-to-br from-[#0d1655] to-[#1a2d8f] rounded-2xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden h-full flex flex-col justify-center">
              {/* Pattern Overlay */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
              
              <div className="relative z-10 text-center">
                <p className="text-xs text-blue-200 font-bold uppercase tracking-widest mb-2">Estimasi Beban Bandwidth</p>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <motion.span className="text-6xl sm:text-7xl font-black tracking-tighter drop-shadow-lg text-white">
                    {roundedCount}
                  </motion.span>
                  <span className="text-lg text-blue-200 font-bold mt-4">Mbps</span>
                </div>

                <div className="w-full h-px bg-white/20 mb-6"></div>

                <div id="rekomendasi-hasil" className="relative group mt-2 scroll-mt-24">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#F47920] to-[#FDB913] rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition duration-500 animate-pulse"></div>
                  <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transform transition hover:-translate-y-1">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Lucide.Zap size={16} className="text-[#FDB913] fill-[#FDB913]" />
                      <p className="text-[10px] sm:text-xs text-blue-100 font-black uppercase tracking-[0.2em]">Rekomendasi Ideal</p>
                      <Lucide.Zap size={16} className="text-[#FDB913] fill-[#FDB913]" />
                    </div>
                    <p className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#FDB913] to-[#F47920] tracking-tight drop-shadow-md">
                      {recommendedSpeed} Mbps
                    </p>
                  </div>
                </div>
                
                <p className="text-[10px] sm:text-xs text-blue-100/80 mt-5 leading-relaxed font-medium px-2">
                  Paket <strong className="text-white">{recommendedSpeed} Mbps</strong> menjamin streaming TV dan aktivitas digital Anda berjalan mulus tanpa gangguan buffering.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION: Pilihan Paket Berdasarkan Hasil */}
      <div id="paket-grid" className="mb-4 text-center sm:text-left scroll-mt-24">
        <h4 className="text-white font-black uppercase tracking-widest text-sm mb-1">Pilih Paket Anda</h4>
        <p className="text-white/60 text-xs font-medium">Berdasarkan kalkulasi, kami merekomendasikan opsi yang ditandai bintang.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {PACKAGES.map((pkg) => {
          // Manual override checked here
          const isSelected = selectedPackage.startsWith(pkg.label);
          const isRecommended = pkg.label === recPkg.label;

          return (
            <div
              key={pkg.label}
              onClick={() => onSelect(pkg.label, pkg.speed, pkg.price, true)}
              className={`relative cursor-pointer rounded-[2rem] p-5 sm:p-6 transition-all duration-300 border-2 flex flex-col justify-between ${isSelected
                  ? "bg-white border-[#F47920] shadow-[0_20px_40px_rgba(244,121,32,0.25)] translate-y-[-4px] z-10"
                  : isRecommended 
                    ? "bg-[#1a2d8f]/80 backdrop-blur-sm border-[#FDB913] hover:bg-[#1a2d8f]" 
                    : "bg-[#1a2d8f]/40 backdrop-blur-sm border-white/10 hover:border-white/30 hover:bg-[#1a2d8f]/60"
                }`}
            >
              {/* Badge Rekomendasi Khusus */}
              {isRecommended && !isSelected && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FDB913] text-[#0d1655] text-[9px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-md">
                  ⭐ Disarankan
                </div>
              )}
              {/* Badge Populer */}
              {pkg.popular && !isRecommended && !isSelected && (
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

                <div className={`h-0.5 w-full my-3 sm:my-4 ${isSelected ? "bg-orange-100" : isRecommended ? "bg-[#FDB913]/30" : "bg-white/10"}`}></div>

                {/* Daftar Fitur Layanan */}
                <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  {pkg.features.map((feat: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm ${isSelected ? "bg-emerald-500 shadow-emerald-500/20" : "bg-emerald-400"}`}>
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
                  <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-0.5 sm:mb-1 opacity-70">Investasi Bulanan</div>
                  <div className="flex items-baseline gap-1">
                    <div className={`${isSelected ? "text-[#F47920]" : isRecommended ? "text-[#FDB913]" : "text-[#F47920]"} font-black text-xl sm:text-2xl tracking-tight`}>
                      Rp {pkg.price}
                    </div>
                    <div className={`text-[10px] uppercase font-black ${isSelected ? "text-slate-400" : "text-white/40"}`}>/ bln</div>
                  </div>
                </div>

                <div className={`w-full py-2.5 sm:py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest text-center transition-all ${isSelected
                    ? "bg-[#0d1655] text-white shadow-lg shadow-blue-950/30"
                    : isRecommended
                      ? "bg-[#FDB913] text-[#0d1655] hover:bg-yellow-400"
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
