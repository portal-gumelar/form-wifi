// Last update: 2026-05-19 00:00 - Redesain Ramah Orang Awam
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";

interface SubscriberNoticeProps {
  isAccepted: boolean;
  onAcceptChange: (checked: boolean) => void;
  selectedPackage?: string;
  isDarkMode?: boolean;
}

export const SubscriberNotice: React.FC<SubscriberNoticeProps> = ({ isAccepted, onAcceptChange, selectedPackage }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeSpeedTab, setActiveSpeedTab] = useState<"p1" | "p2" | "p3" | "p4" | "p5">("p1");

  useEffect(() => {
    if (selectedPackage) {
      if (selectedPackage.includes("20 Mbps")) setActiveSpeedTab("p1");
      else if (selectedPackage.includes("30 Mbps")) setActiveSpeedTab("p2");
      else if (selectedPackage.includes("50 Mbps")) setActiveSpeedTab("p3");
      else if (selectedPackage.includes("75 Mbps")) setActiveSpeedTab("p4");
      else if (selectedPackage.includes("100 Mbps")) setActiveSpeedTab("p5");
    }
  }, [selectedPackage]);

  const REKENING_MANDIRI = "0060014607117";

  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText(REKENING_MANDIRI);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Gagal menyalin: ", err);
    }
  };

  // Data lengkap dari dokumen resmi ARMEDIA 2026 — Pembayaran Pro-rata
  const matriksTarif = [
    { tgl: 1,  p1:"115.000", p2:"148.000", p3:"182.000", p4:"260.000", p5:"330.000", combined:false },
    { tgl: 2,  p1:"111.167", p2:"143.067", p3:"175.933", p4:"251.333", p5:"319.000", combined:false },
    { tgl: 3,  p1:"107.333", p2:"138.133", p3:"169.867", p4:"242.667", p5:"308.000", combined:false },
    { tgl: 4,  p1:"103.500", p2:"133.200", p3:"163.800", p4:"234.000", p5:"297.000", combined:false },
    { tgl: 5,  p1:"99.667",  p2:"128.267", p3:"157.733", p4:"225.333", p5:"286.000", combined:false },
    { tgl: 6,  p1:"95.833",  p2:"123.333", p3:"151.667", p4:"216.667", p5:"275.000", combined:false },
    { tgl: 7,  p1:"92.000",  p2:"118.400", p3:"145.600", p4:"208.000", p5:"264.000", combined:false },
    { tgl: 8,  p1:"88.167",  p2:"113.467", p3:"139.533", p4:"199.333", p5:"253.000", combined:false },
    { tgl: 9,  p1:"84.333",  p2:"108.533", p3:"133.467", p4:"190.667", p5:"242.000", combined:false },
    { tgl: 10, p1:"80.500",  p2:"103.600", p3:"127.400", p4:"182.000", p5:"231.000", combined:false },
    { tgl: 11, p1:"76.667",  p2:"98.667",  p3:"121.333", p4:"173.333", p5:"220.000", combined:false },
    { tgl: 12, p1:"72.833",  p2:"93.733",  p3:"115.267", p4:"164.667", p5:"209.000", combined:false },
    { tgl: 13, p1:"69.000",  p2:"88.800",  p3:"109.200", p4:"156.000", p5:"198.000", combined:false },
    { tgl: 14, p1:"65.167",  p2:"83.867",  p3:"103.133", p4:"147.333", p5:"187.000", combined:false },
    { tgl: 15, p1:"61.333",  p2:"78.933",  p3:"97.067",  p4:"138.667", p5:"176.000", combined:false },
    { tgl: 16, p1:"57.500",  p2:"74.000",  p3:"91.000",  p4:"130.000", p5:"165.000", combined:false },
    { tgl: 17, p1:"53.667",  p2:"69.067",  p3:"84.933",  p4:"121.333", p5:"154.000", combined:false },
    { tgl: 18, p1:"49.833",  p2:"64.133",  p3:"78.867",  p4:"112.667", p5:"143.000", combined:false },
    { tgl: 19, p1:"46.000",  p2:"59.200",  p3:"72.800",  p4:"104.000", p5:"132.000", combined:false },
    { tgl: 20, p1:"42.167",  p2:"54.267",  p3:"66.733",  p4:"95.333",  p5:"121.000", combined:false },
    { tgl: 21, p1:"38.333",  p2:"49.333",  p3:"60.667",  p4:"86.667",  p5:"110.000", combined:false },
    { tgl: 22, p1:"34.500",  p2:"44.400",  p3:"54.600",  p4:"78.000",  p5:"99.000",  combined:false },
    { tgl: 23, p1:"30.667",  p2:"39.467",  p3:"48.533",  p4:"69.333",  p5:"88.000",  combined:false },
    { tgl: 24, p1:"26.833",  p2:"34.533",  p3:"42.467",  p4:"60.667",  p5:"77.000",  combined:false },
    { tgl: 25, p1:"23.000",  p2:"29.600",  p3:"36.400",  p4:"52.000",  p5:"66.000",  combined:false },
    { tgl: 26, p1:"19.167",  p2:"24.667",  p3:"30.333",  p4:"43.333",  p5:"55.000",  combined:false },
    { tgl: 27, p1:"15.333",  p2:"19.733",  p3:"24.267",  p4:"34.667",  p5:"44.000",  combined:false },
    { tgl: 28, p1:"11.500",  p2:"14.800",  p3:"18.200",  p4:"26.000",  p5:"33.000",  combined:false },
    { tgl: 29, p1:"7.667",   p2:"9.867",   p3:"12.133",  p4:"17.333",  p5:"22.000",  combined:false },
    { tgl: 30, p1:"3.833",   p2:"4.933",   p3:"6.067",   p4:"8.667",   p5:"11.000",  combined:false },
    // Baris khusus: Tgl 28-30 boleh digabung ke bulan berikutnya
    { tgl: 28, p1:"126.500", p2:"162.800", p3:"200.200", p4:"286.000", p5:"363.000", combined:true },
    { tgl: 29, p1:"122.667", p2:"157.867", p3:"194.133", p4:"277.333", p5:"352.000", combined:true },
    { tgl: 30, p1:"118.833", p2:"152.933", p3:"188.067", p4:"268.667", p5:"341.000", combined:true },
  ];

  // Pisahkan data normal dan gabungan
  const tarifNormal = matriksTarif.filter(r => !r.combined);
  const tarifGabungan = matriksTarif.filter(r => r.combined);

  return (
    <div className="w-full space-y-3">

      {/* ── BLOK HEADER MENCOLOK (DI-DESAIN ULANG AGAR SUPER DOMINAN) ── */}
      <div className={`w-full rounded-[2.5rem] p-6 text-white flex flex-col sm:flex-row sm:items-center gap-5 transition-all duration-500 border-2 relative overflow-hidden ${
        isExpanded
          ? "bg-gradient-to-br from-[#0d1655] via-[#111d73] to-[#1a2d8f] border-[#7b8fd4]/30 shadow-xl"
          : "bg-gradient-to-r from-[#0d1655] via-[#101c6f] to-orange-950/95 border-orange-500 shadow-[0_15px_40px_rgba(244,121,32,0.25)] animate-pulse hover:animate-none"
      }`}>
        {/* Glowing visual accent for mandatory reminder */}
        {!isExpanded && (
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />
        )}
        
        <div className="flex items-start gap-4 flex-1">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
            isExpanded ? "bg-white/10 border-white/20" : "bg-orange-500/20 border-orange-400 animate-bounce"
          }`}>
            {isExpanded ? (
              <Lucide.BookOpen size={26} className="text-[#FDB913]" />
            ) : (
              <Lucide.AlertTriangle size={26} className="text-orange-400" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full shadow-sm border ${
                isExpanded 
                  ? "bg-blue-900/60 text-[#FDB913] border-blue-800" 
                  : "bg-red-600 text-white border-red-500 animate-pulse"
              }`}>
                {isExpanded ? "Syarat & Ketentuan" : "⚠️ WAJIB DI BACA"}
              </span>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-black leading-tight tracking-tight italic bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent uppercase drop-shadow-sm">
              Langkah Terakhir Sebelum anda mengajukan pendaftaran
            </h3>
            
            <p className="text-sm font-bold mt-2.5 text-slate-300">
              Hanya <span className="text-orange-400 font-black underline decoration-orange-400 decoration-2">2 poin penting</span> — cukup 1 menit!
            </p>
          </div>
        </div>

        {/* Tombol Buka / Tutup — eksplisit, putih agar tidak menyaingi tombol utama */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest transition-all shrink-0 active:scale-95 shadow-lg border-2 ${
            isExpanded
              ? "bg-white border-white text-[#0d1655] hover:bg-slate-50"
              : "bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 hover:border-white/50 ring-4 ring-white/5"
          }`}
        >
          {isExpanded ? (
            <><Lucide.ChevronUp size={16} /> Tutup Ketentuan</>
          ) : (
            <><Lucide.BookOpen size={16} className="animate-pulse" /> Wajib Buka & Baca</>
          )}
        </button>
      </div>

      {/* ── KONTEN EXPANDABLE ────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="bg-white border-2 border-slate-100 rounded-2xl overflow-hidden shadow-sm">

              {/* POIN 1 — Izin Kabel */}
              <div className="p-5 border-b-2 border-dashed border-orange-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-sm shrink-0">1</div>
                  <h4 className="font-black text-sm text-slate-800 uppercase tracking-wide">IJIN TARIK KABEL KE TETANGGA 🏠</h4>
                </div>
                <div className="ml-10 space-y-3 text-sm text-slate-600 font-bold leading-relaxed">
                  <p className="text-[#0d1655] font-black text-sm border-l-4 border-[#F47920] pl-3 py-1.5 bg-orange-50/40 rounded-r-xl">
                    Di ARMEDIA, kami sangat menjunjung tinggi <span className="text-[#F47920]">Etika</span>, <span className="text-[#F47920]">Sopan Santun</span>, dan <span className="text-[#F47920]">Moralitas</span>.
                  </p>
                  <p className="font-medium text-slate-600">
                    Kami ingin memastikan kehadiran internet di rumah Anda tidak mengganggu kenyamanan tetangga. Oleh karena itu, jika penarikan kabel tim teknis kami harus melintas di atas rumah atau lahan tetangga, mohon bantuannya untuk meminta izin kepada tetangga/kerabat tersebut sebelum proses pengerjaan dimulai.
                  </p>
                  <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-2xl text-orange-950 font-black space-y-1">
                    <p>Bantu tim teknis kami bekerja dengan tenang, dan lancar, sehingga internet Anda pun terpasang dengan nyaman!</p>
                    <p className="text-xs text-orange-700 mt-2 uppercase tracking-wide">Terimakasih atas Kerjasamanya</p>
                    <p className="text-xs text-[#0d1655] font-black uppercase tracking-widest mt-1">ARMEDIA.</p>
                  </div>
                </div>
              </div>

              {/* POIN 2 — Biaya Bulan Pertama */}
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0">2</div>
                  <h4 className="font-black text-sm text-slate-800">Biaya Bulan Pertama 💰</h4>
                </div>
                <div className="ml-10 space-y-3">
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    Tagihan bulan pertama dihitung dari tanggal internet Anda mulai aktif (bukan dari awal bulan). Jadi makin awal dipasang, makin banyak yang dibayar di bulan pertama — tapi bulan berikutnya sudah normal.
                  </p>

                   {/* Tab Selector untuk HP agar pas dan tidak perlu scroll ke samping */}
                  <div className="block md:hidden w-full bg-slate-100 p-1 rounded-2xl flex gap-1 overflow-x-auto custom-scrollbar">
                    {[
                      { key: "p1" as const, label: "20 Mbps" },
                      { key: "p2" as const, label: "30 Mbps" },
                      { key: "p3" as const, label: "50 Mbps" },
                      { key: "p4" as const, label: "75 Mbps" },
                      { key: "p5" as const, label: "100 Mbps" },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveSpeedTab(tab.key)}
                        className={`flex-1 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-center transition-all whitespace-nowrap ${
                          activeSpeedTab === tab.key
                            ? "bg-[#F47920] text-white shadow-md shadow-orange-500/10"
                            : "text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tabel HP (2 Kolom - Tanpa Scroll Samping) */}
                  <div className="block md:hidden w-full rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <p className="text-[10px] font-black text-[#0d1655] uppercase tracking-widest px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                      📋 Tabel Pro-rata Tagihan Bulan Pertama
                    </p>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#0d1655] text-white text-[10px] font-black uppercase">
                          <th className="px-4 py-2.5 text-center w-1/3 border-r border-white/10">Tanggal On</th>
                          <th className="px-4 py-2.5 text-[#FDB913] w-2/3">Biaya Pro-rata ({activeSpeedTab === "p1" ? "20 Mbps" : activeSpeedTab === "p2" ? "30 Mbps" : activeSpeedTab === "p3" ? "50 Mbps" : activeSpeedTab === "p4" ? "75 Mbps" : "100 Mbps"})</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold">
                        {tarifNormal.map((row, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? "bg-white hover:bg-orange-50/20" : "bg-slate-50/60 hover:bg-orange-50/20"}>
                            <td className="px-4 py-2 text-center font-black bg-slate-50 border-r border-slate-200 text-[#0d1655]">{row.tgl}</td>
                            <td className="px-4 py-2 text-orange-600 font-black">Rp {row[activeSpeedTab]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Tabel Utama Desktop (5 Kolom - Tampang Lebar Asli) */}
                  <div className="hidden md:block w-full overflow-x-auto rounded-xl border border-slate-200 custom-scrollbar">
                    <p className="text-[10px] font-black text-[#0d1655] uppercase tracking-widest px-3 pt-2.5 pb-1.5 bg-slate-50 border-b border-slate-200">
                      📋 Tabel Pro-rata Tagihan Bulan Pertama (Rp)
                    </p>
                    <table className="w-full text-left text-xs border-collapse min-w-[480px]">
                      <thead>
                        <tr className="bg-[#0d1655] text-white text-[10px] font-black uppercase">
                          <th className="px-3 py-2.5 sticky left-0 bg-[#0d1655] border-r border-white/10 text-center">Tgl On</th>
                          <th className="px-3 py-2.5 text-[#FDB913]">20 Mbps</th>
                          <th className="px-3 py-2.5">30 Mbps</th>
                          <th className="px-3 py-2.5">50 Mbps</th>
                          <th className="px-3 py-2.5">75 Mbps</th>
                          <th className="px-3 py-2.5">100 Mbps</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold">
                        {tarifNormal.map((row, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? "bg-white hover:bg-orange-50/30" : "bg-slate-50/60 hover:bg-orange-50/30"}>
                            <td className="px-3 py-2 text-center font-black bg-[#0d1655]/5 border-r border-slate-200 sticky left-0 text-[#0d1655]">{row.tgl}</td>
                            <td className="px-3 py-2 text-orange-600 font-black">{row.p1}</td>
                            <td className="px-3 py-2 text-slate-700">{row.p2}</td>
                            <td className="px-3 py-2 text-slate-700">{row.p3}</td>
                            <td className="px-3 py-2 text-slate-500">{row.p4}</td>
                            <td className="px-3 py-2 text-slate-500">{row.p5}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Rekening Bank */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5 mt-1">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rekening Pembayaran</p>
                      <div className="flex items-center gap-2">
                        <img
                          src="https://ik.imagekit.io/Gumelar/LogO/Bank_Mandiri_logo_2016.svg.png"
                          alt="Bank Mandiri"
                          className="h-4 object-contain"
                        />
                        <p className="text-sm font-black text-slate-800 tracking-wider">
                          {REKENING_MANDIRI.replace(/(\d{3})(\d{3})(\d{6})(\d{1})/, "$1-$2-$3-$4")}
                        </p>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">a.n PT AKSES ARTHA MEDIA</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all border flex items-center gap-2 shrink-0 ${
                        copied
                          ? "bg-emerald-500 border-emerald-400 text-white"
                          : "bg-[#0d1655] border-[#0d1655] text-white hover:bg-blue-900 active:scale-95"
                      }`}
                    >
                      {copied ? <><Lucide.CheckCircle size={13} /> Disalin!</> : <><Lucide.Copy size={13} /> Salin No. Rek</>}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── AREA CENTANG — Besar & Jelas ─────────────────────── */}
      <div
        onClick={() => onAcceptChange(!isAccepted)}
        className={`w-full cursor-pointer select-none rounded-[2rem] border-2 p-4 sm:p-5 flex items-center gap-4 transition-all duration-300 mt-2 ${
          isAccepted
            ? "bg-emerald-50 border-emerald-500 shadow-md"
            : "bg-white border-slate-300 hover:border-orange-400"
        }`}
      >
        {/* Kotak centang custom — ukuran besar & jelas */}
        <div
          className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
            isAccepted
              ? "bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-200"
              : "bg-slate-100 border-slate-300"
          }`}
        >
          {isAccepted && <Lucide.Check size={18} strokeWidth={3.5} className="text-white" />}
        </div>

        {/* Label — bahasa sehari-hari, teks besar */}
        <div className="flex-1">
          <p className={`text-sm sm:text-base font-black leading-tight ${
            isAccepted ? "text-emerald-700" : "text-slate-800"
          }`}>
            {isAccepted
              ? "✅ Saya sudah baca & setuju!"
              : "Saya sudah baca dan setuju"}
          </p>
          <p className={`text-xs font-bold mt-1 ${
            isAccepted ? "text-emerald-500" : "text-orange-500"
          }`}>
            {isAccepted
              ? "Terima kasih! Data siap dikirim."
              : "👆 Klik di sini untuk centang — wajib sebelum kirim"}
          </p>
        </div>
      </div>

    </div>
  );
};