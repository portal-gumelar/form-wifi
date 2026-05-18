import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";

interface SubscriberNoticeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriberNotice: React.FC<SubscriberNoticeProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-3 sm:p-4 bg-[#0d1655]/85 backdrop-blur-md">
          {/* REVISI LAYOUT: 
            - max-h-[85vh] mengunci kontainer agar tidak pernah menembus batas layar HP.
            - rounded-[2rem] memberikan kelengkungan sudut yang proporsional dan ramah ruang layar mobile.
          */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden shadow-[0_24px_50px_-12px_rgba(0,0,0,0.4)] border border-white/20"
          >
            {/* HEADER SECTION - Diselaraskan dengan identitas Modern Luxury Armedia */}
            <div className="bg-[#0d1655] p-5 sm:p-6 text-white relative shrink-0 border-b border-white/10 shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
                  <Lucide.ShieldAlert size={24} className="text-[#FDB913]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-wider uppercase leading-none text-white">WAJIB BACA!</h2>
                  <p className="text-blue-200 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] mt-1.5">Ketentuan Berlangganan ARMEDIA</p>
                </div>
              </div>
            </div>

            {/* CONTENT AREA - Auto-Padding Elastis & Independently Scrollable */}
            <div className="p-5 sm:p-8 overflow-y-auto custom-scrollbar space-y-6 sm:space-y-8 flex-1 bg-white">

              {/* Etika Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#0d1655]">
                  <Lucide.Heart size={16} className="text-[#F47920]" />
                  <h3 className="font-black uppercase tracking-wider text-xs sm:text-sm">Etika & Moralitas</h3>
                </div>
                <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border-l-4 border-[#F47920] space-y-3 text-slate-600 text-xs sm:text-sm leading-relaxed font-bold">
                  <p>Di <span className="font-black text-slate-900">ARMEDIA</span>, kami sangat menjunjung tinggi Etika, Sopan Santun, dan Moralitas.</p>
                  <p>Kami ingin memastikan kehadiran internet di rumah Anda tidak mengganggu kenyamanan tetangga.</p>
                  <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-100 italic text-slate-800 font-bold leading-relaxed shadow-sm">
                    "Jika penarikan kabel tim teknis kami harus melintas di atas rumah atau lahan tetangga, mohon bantuannya untuk <span className="font-black text-[#F47920]">meminta izin kepada tetangga/kerabat tersebut</span> sebelum proses pengerjaan dimulai."
                  </div>
                  <p>Bantu tim teknis kami bekerja dengan tenang dan lancar, sehingga internet Anda pun terpasang dengan nyaman!</p>
                  <p className="text-[10px] font-black text-[#0d1655] uppercase tracking-widest mt-2">Terimakasih atas Kerjasamanya - ARMEDIA</p>
                </div>
              </div>

              {/* Pembayaran Section */}
              <div className="space-y-3 pt-5 border-t-2 border-slate-100">
                <div className="flex items-center gap-2 text-[#0d1655]">
                  <Lucide.Calculator size={16} className="text-[#F47920]" />
                  <h3 className="font-black uppercase tracking-wider text-xs sm:text-sm">Pembayaran Proporsional</h3>
                </div>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">
                  Agar adil, pembayaran bulan pertama Anda akan dihitung sesuai tanggal aktivasi (Prabayar Pro-rata):
                </p>

                {/* REVISI GRID:
                  - Layar HP: grid-cols-1 (Menghindari teks persen terpotong/bertabrakan di area sempit)
                  - Layar Tablet ke atas (sm): grid-cols-2
                */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { tgl: "01 - 05", bayar: "100%", desc: "Full" },
                    { tgl: "06 - 10", bayar: "80%", desc: "Diskon 20%" },
                    { tgl: "11 - 15", bayar: "60%", desc: "Diskon 40%" },
                    { tgl: "16 - 20", bayar: "40%", desc: "Diskon 60%" },
                    { tgl: "21 - 25", bayar: "20%", desc: "Diskon 80%" },
                    { tgl: "26 - 31", bayar: "10%", desc: "Hanya 10%" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 shadow-sm transition-all hover:bg-slate-100/50">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Tgl {item.tgl}</p>
                        <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{item.desc}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base sm:text-lg font-black text-[#0d1655]">{item.bayar}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[9px] font-bold text-slate-400 italic block pt-1">
                  * Pembayaran bulan berikutnya akan kembali normal sesuai tarif paket yang dipilih.
                </p>
              </div>
            </div>

            {/* FOOTER SECTION - Mengunci Visibilitas Tombol Konfirmasi Akhir */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-4 bg-gradient-to-r from-[#0d1655] to-[#1a2d8f] hover:from-blue-900 hover:to-blue-800 text-white font-black rounded-xl shadow-lg shadow-blue-950/20 transition-all active:scale-[0.99] uppercase tracking-widest text-xs flex items-center justify-center gap-2"
              >
                <Lucide.CheckCircle size={16} className="text-[#FDB913]" /> Saya Mengerti & Setuju
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};