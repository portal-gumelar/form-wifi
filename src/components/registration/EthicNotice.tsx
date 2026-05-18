// Last update: 2026-05-18 22:45 - Fix Motion JSX Closing Tag Mismatch
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";

interface EthicNoticeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EthicNotice: React.FC<EthicNoticeProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-3 sm:p-4 bg-[#0d1655]/90 backdrop-blur-2xl">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden shadow-[0_24px_50px_-12px_rgba(0,0,0,0.4)] border border-white/20"
          >
            {/* HEADER SECTION - Gradien Warna-Warni Pro */}
            <div className="bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-500 p-6 sm:p-8 text-white relative shrink-0 border-b border-white/10 shadow-md">
              <div className="flex items-center gap-5 sm:gap-6">
                <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center shrink-0 backdrop-blur-sm border border-white/20 shadow-inner">
                  <Lucide.ShieldAlert size={28} className="text-[#0d1655]" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black italic uppercase leading-none tracking-tight">WAJIB BACA!</h2>
                  <p className="text-orange-950 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] mt-2">Ketentuan Etika Berlangganan ARMEDIA</p>
                </div>
              </div>
            </div>

            {/* CONTENT AREA - Scrollable Internal Box */}
            <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar space-y-8 sm:space-y-10 flex-1 bg-white">

              {/* Section 1: Etika - Oranye */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 text-orange-600">
                  <Lucide.Heart size={18} className="text-red-500" />
                  <h3 className="font-black uppercase tracking-wider text-xs sm:text-sm">Etika & Moralitas</h3>
                </div>
                <div className="bg-orange-50 p-6 sm:p-8 rounded-3xl border-l-8 border-l-orange-500 space-y-4 text-slate-600 text-xs sm:text-sm leading-relaxed font-bold shadow-inner">
                  <p>Di <span className="font-black text-slate-900">ARMEDIA</span>, kami sangat menjunjung tinggi Etika, Sopan Santun, dan Moralitas.</p>
                  <p>Kami ingin memastikan kehadiran internet di rumah Anda tidak mengganggu kenyamanan tetangga.</p>
                  <div className="bg-white p-4.5 sm:p-5 rounded-2xl border border-slate-100 italic text-slate-800 font-bold leading-relaxed shadow-sm">
                    "Jika penarikan kabel tim teknis kami harus melintas di atas rumah atau lahan tetangga, mohon bantuannya untuk <span className="font-black text-orange-600">meminta izin kepada tetangga/kerabat tersebut</span> sebelum proses pengerjaan dimulai."
                  </div>
                  <p>Bantu tim teknis kami bekerja dengan tenang dan lancar, sehingga internet Anda pun terpasang dengan nyaman!</p>
                  <p className="text-[10px] sm:text-xs font-black text-orange-600 uppercase tracking-widest mt-3">Terimakasih atas Kerjasamanya - ARMEDIA</p>
                </div>
              </div>

              {/* Section 2: Sopan Santun - Biru */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 text-blue-600">
                  <Lucide.Zap size={18} className="text-yellow-400" />
                  <h3 className="font-black uppercase tracking-wider text-xs sm:text-sm">Sopan Santun</h3>
                </div>
                <div className="bg-blue-50 p-6 sm:p-8 rounded-3xl border-l-8 border-l-blue-500 space-y-4 text-slate-600 text-xs sm:text-sm leading-relaxed font-bold shadow-inner">
                  <p>Hormati tim teknis ARMEDIA saat melakukan instalasi dan pemeliharaan.</p>
                  <p>Kami bekerja untuk memberikan layanan internet terbaik bagi Anda.</p>
                  <div className="bg-white p-4.5 sm:p-5 rounded-2xl border border-slate-100 italic text-slate-800 font-bold leading-relaxed shadow-sm">
                    "Jika ada keluhan atau masalah, sampaikan dengan <span className="font-black text-blue-600">bahasa yang baik dan santun</span> agar tim kami dapat bekerja dengan maksimal."
                  </div>
                  <p>Kerjasama yang baik antara pelanggan dan tim ARMEDIA akan menciptakan hubungan yang harmonis!</p>
                  <p className="text-[10px] sm:text-xs font-black text-blue-600 uppercase tracking-widest mt-3">Terimakasih atas Kerjasamanya - ARMEDIA</p>
                </div>
              </div>

              {/* Section 3: Morallitas - Hijau */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 text-emerald-600">
                  <Lucide.Book size={18} className="text-emerald-400" />
                  <h3 className="font-black uppercase tracking-wider text-xs sm:text-sm">Morallitas</h3>
                </div>
                <div className="bg-emerald-50 p-6 sm:p-8 rounded-3xl border-l-8 border-l-emerald-500 space-y-4 text-slate-600 text-xs sm:text-sm leading-relaxed font-bold shadow-inner">
                  <p>Junjung tinggi nilai-nilai <span className="font-black text-slate-900">Morallitas</span> dalam penggunaan internet Anda.</p>
                  <p>Kami ingin internet ARMEDIA menjadi internet yang bermanfaat dan mendidik bagi Anda dan keluarga.</p>
                  <div className="bg-white p-4.5 sm:p-5 rounded-2xl border border-slate-100 italic text-slate-800 font-bold leading-relaxed shadow-sm">
                    "Pastikan konten yang Anda akses dan bagikan adalah <span className="font-black text-emerald-600">konten yang baik dan tidak melanggar norma-norma</span> yang berlaku."
                  </div>
                  <p>Dengan begitu, kita bersama-sama menciptakan lingkungan digital yang baik!</p>
                  <p className="text-[10px] sm:text-xs font-black text-emerald-600 uppercase tracking-widest mt-3">Terimakasih atas Kerjasamanya - ARMEDIA</p>
                </div>
              </div>
            </div>

            {/* FOOTER SECTION - Locked Position */}
            <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-100 shrink-0 z-10 shadow-sm pb-safe">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-4.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black rounded-2xl shadow-lg shadow-orange-500/30 transition-all active:scale-[0.99] uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2.5"
              >
                <Lucide.CheckCircle size={18} className="text-white" /> Saya Mengerti & Setuju
              </button>
            </div>

          </motion.div> {/* FIXED: Menggunakan penutup </motion.div> yang benar */}
        </div>
      )}
    </AnimatePresence>
  );
};