import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";

interface EthicNoticeProps {
  onAccept: () => void;
  onCancel: () => void;
}

export const EthicNotice: React.FC<EthicNoticeProps> = ({ onAccept, onCancel }) => {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[500] flex items-center justify-center p-3 sm:p-4 bg-[#0d1655]/85 backdrop-blur-md">

        {/* Kontainer Utama - Dikunci max-h-[85vh] agar mutlak tidak memotong layar HP */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-[2rem] w-full max-w-xl max-h-[85vh] sm:max-h-[90vh] overflow-hidden shadow-[0_24px_50px_-12px_rgba(0,0,0,0.4)] border border-white/20 flex flex-col"
        >

          {/* HEADER SECTION - Konsisten Menggunakan Oranye Armedia */}
          <div className="bg-gradient-to-r from-[#F47920] to-orange-500 p-5 sm:p-6 text-white relative flex-shrink-0 shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10">
                <Lucide.Handshake size={22} className="text-[#FDB913]" />
              </div>
              <div className="text-left">
                <h2 className="text-base sm:text-xl font-black tracking-tight uppercase leading-tight">Etika & Silaturahmi</h2>
                <p className="text-orange-100 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] mt-0.5">Prinsip Harmoni ARMEDIA_NET</p>
              </div>
            </div>
          </div>

          {/* CONTENT SECTION - Menggunakan Auto-Padding Elastis & Aman Scroll Jempol */}
          <div className="p-5 sm:p-8 overflow-y-auto flex-grow space-y-5 custom-scrollbar bg-white text-slate-600">
            <div className="space-y-4 text-xs sm:text-sm font-bold leading-relaxed text-slate-600">
              <p className="text-justify">
                Terima kasih atas ketertarikan Anda pada layanan kami. Kami melihat saat ini Anda telah didukung oleh
                <span className="text-[#0d1655] font-black underline decoration-[#F47920] decoration-2 underline-offset-2"> layanan RT/RW Net setempat atau Layanan Internet Pertemanan.</span>
              </p>

              {/* Blockquote Quote Area */}
              <div className="relative p-4 sm:p-6 bg-slate-50 rounded-2xl border-l-4 border-[#F47920] shadow-inner">
                <span className="absolute top-1 left-2 text-3xl sm:text-4xl text-[#F47920]/20 font-serif leading-none">“</span>
                <p className="text-justify italic text-slate-500 leading-relaxed relative z-10 pl-2 text-[11px] sm:text-xs font-bold">
                  Sebagai penyedia layanan yang sangat menjunjung tinggi etika bisnis dan kearifan lokal, kami sangat menghormati kontribusi para pengelola RT/RW Net dalam membangun akses internet di lingkungan Anda. Oleh karena itu, demi menjaga silaturahmi dan kenyamanan bersama, kami menyarankan Anda untuk berkonsultasi terlebih dahulu dengan pengelola RT/RW Net Anda.
                </p>
              </div>

              <p className="text-justify">
                Kehadiran kami bertujuan untuk <span className="font-black text-[#0d1655] bg-orange-50 px-1.5 py-0.5 rounded">berkolaborasi dan melengkapi kebutuhan</span>,
                bukan untuk merusak harmoni yang sudah terbangun dengan baik di lingkungan Anda.
              </p>

              <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed pt-4 border-t border-slate-100">
                Jika di kemudian hari ada kebutuhan khusus yang memerlukan sinergi dengan sistem kami,
                pintu kami selalu terbuka untuk diskusi yang saling menguntungkan semua pihak.
              </p>
            </div>
          </div>

          {/* FOOTER SECTION - Perbaikan Kontras Tombol Batal & Penyelarasan Tombol Utama */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:flex-1 py-3.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 font-black rounded-xl text-[10px] uppercase tracking-widest transition-all text-center shadow-sm"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={onAccept}
              className="w-full sm:flex-[2] py-3.5 bg-gradient-to-r from-[#0d1655] to-[#1a2d8f] hover:from-blue-900 hover:to-blue-800 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-blue-950/20 flex justify-center items-center gap-2 transition-all active:scale-[0.99]"
            >
              <Lucide.CheckCircle size={14} className="text-[#FDB913]" /> Saya Mengerti & Setuju
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};