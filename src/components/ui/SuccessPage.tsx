import React from "react";
import { CheckCircle2, MessageSquare } from "lucide-react";

interface SuccessPageProps {
  onBack: () => void;
  userName?: string;
  userDesa?: string;
}

export const SuccessPage: React.FC<SuccessPageProps> = ({ onBack, userName = "", userDesa = "" }) => {
  const phoneNumber = "0821-1234-011";
  const waNumber = "628211234011";
  const message = encodeURIComponent(`Halo CS Armedia Net, saya ${userName} dari Desa ${userDesa} ingin konfirmasi bahwa saya sudah mendaftar internet.`);
  const waUrl = `https://wa.me/${waNumber}?text=${message}`;

  return (
    <div className="min-h-screen bg-[#0d1655] flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-[3rem] p-8 sm:p-12 max-w-lg w-full text-center animate-slide-up border border-white/20 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#F47920]/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#1a2d8f]/30 rounded-full blur-3xl"></div>
        
        <div className="relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-4 tracking-tight">PENDAFTARAN BERHASIL! 🎉</h2>
          <p className="text-white/70 mb-10 text-sm sm:text-base font-medium">Data Anda sudah kami terima. Silakan konfirmasi pendaftaran Anda ke Customer Service kami.</p>
          
          <div className="space-y-6">
            <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
              <div className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mb-2">Nomor CS (Wilayah Gumelar):</div>
              <div className="text-2xl sm:text-3xl font-black text-[#F47920] tracking-tighter">{phoneNumber}</div>
            </div>

            <a href={waUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center gap-1 w-full bg-[#25D366] hover:bg-[#20bd5b] text-white font-black py-5 rounded-3xl shadow-xl transition-all active:scale-95 group relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center gap-3 relative z-10">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                KONFIRMASI VIA WHATSAPP
              </div>
              <span className="text-[10px] opacity-70 relative z-10 uppercase tracking-widest font-bold">Klik untuk chat otomatis</span>
            </a>

            <button onClick={onBack} className="w-full bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-2xl border border-white/10 transition-all text-xs uppercase tracking-widest">
              KEMBALI KE BERANDA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
