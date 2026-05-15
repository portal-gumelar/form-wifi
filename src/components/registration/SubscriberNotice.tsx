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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0d1655]/90 backdrop-blur-2xl">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-[3rem] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-white/20"
          >
            <div className="bg-gradient-to-br from-[#1a2d8f] to-[#0d1655] p-8 text-white relative shrink-0">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-sm border border-white/20 shadow-xl">
                  <Lucide.ShieldAlert size={32} className="text-orange-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-black italic uppercase leading-none">WAJIB BACA!</h2>
                  <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Ketentuan Berlangganan ARMEDIA</p>
                </div>
              </div>
            </div>

            <div className="p-8 sm:p-12 overflow-y-auto custom-scrollbar space-y-10">
              {/* Etika Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[#1a2d8f]">
                  <Lucide.Heart size={20} />
                  <h3 className="font-black uppercase tracking-widest text-sm">Etika & Moralitas</h3>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border-l-4 border-orange-500 space-y-4 text-slate-600 text-sm leading-relaxed font-medium">
                  <p>Di <span className="font-black text-slate-900">ARMEDIA</span>, kami sangat menjunjung tinggi Etika, Sopan Santun, dan Moralitas.</p>
                  <p>Kami ingin memastikan kehadiran internet di rumah Anda tidak mengganggu kenyamanan tetangga.</p>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 italic text-slate-800">
                    "Jika penarikan kabel tim teknis kami harus melintas di atas rumah atau lahan tetangga, mohon bantuannya untuk <span className="font-black text-orange-600">meminta izin kepada tetangga/kerabat tersebut</span> sebelum proses pengerjaan dimulai."
                  </div>
                  <p>Bantu tim teknis kami bekerja dengan tenang dan lancar, sehingga internet Anda pun terpasang dengan nyaman!</p>
                  <p className="text-xs font-black text-[#1a2d8f] uppercase tracking-widest mt-4">Terimakasih atas Kerjasamanya - ARMEDIA</p>
                </div>
              </div>

              {/* Pembayaran Section */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3 text-[#1a2d8f]">
                  <Lucide.Calculator size={20} />
                  <h3 className="font-black uppercase tracking-widest text-sm">Pembayaran Proporsional</h3>
                </div>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">
                  Agar adil, pembayaran bulan pertama Anda akan dihitung sesuai tanggal aktivasi (Prabayar Pro-rata):
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { tgl: "01 - 05", bayar: "100%", desc: "Full" },
                    { tgl: "06 - 10", bayar: "80%", desc: "Diskon 20%" },
                    { tgl: "11 - 15", bayar: "60%", desc: "Diskon 40%" },
                    { tgl: "16 - 20", bayar: "40%", desc: "Diskon 60%" },
                    { tgl: "21 - 25", bayar: "20%", desc: "Diskon 80%" },
                    { tgl: "26 - 31", bayar: "10%", desc: "Hanya 10%" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Tgl {item.tgl}</p>
                        <p className="text-xs font-black text-slate-800 uppercase">{item.desc}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-[#1a2d8f]">{item.bayar}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[9px] font-bold text-slate-400 italic">
                  * Pembayaran bulan berikutnya akan kembali normal sesuai tarif paket yang dipilih.
                </p>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 shrink-0">
              <button 
                onClick={onClose}
                className="w-full py-5 bg-[#1a2d8f] hover:bg-[#0d1655] text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3"
              >
                <Lucide.CheckCircle size={20} /> Saya Mengerti & Setuju
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
