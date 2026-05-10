import React from "react";

export const EthicNotice: React.FC<{ onAccept: () => void; onCancel: () => void }> = ({ onAccept, onCancel }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0d1655]/85 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] sm:rounded-[3.5rem] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 border border-white/20">
        <div className="bg-gradient-to-br from-[#F47920] to-[#e06010] p-6 sm:p-10 text-white relative flex-shrink-0">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
              <span className="text-2xl sm:text-4xl">🤝</span>
            </div>
            <div className="text-left">
              <h2 className="text-lg sm:text-2xl font-black tracking-tight leading-none uppercase">Etika & Silaturahmi</h2>
              <p className="text-white/60 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] mt-1 sm:mt-2">Prinsip Harmoni ARMEDIA_NET</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 sm:p-14 overflow-y-auto flex-grow space-y-6 sm:space-y-8 custom-scrollbar">
          <div className="space-y-4 sm:space-y-6 text-slate-600 leading-relaxed text-xs sm:text-base font-medium">
            <p className="text-justify">
              Terima kasih atas ketertarikan Anda pada layanan kami. Kami melihat saat ini Anda telah didukung oleh 
              <span className="text-[#1a2d8f] font-black"> layanan RT/RW Net setempat atau Layanan Internet Pertemanan.</span>
            </p>
            
            <div className="relative p-6 sm:p-8 bg-slate-50 rounded-[2rem] sm:rounded-[2.5rem] border-l-4 border-[#F47920] shadow-inner">
              <div className="absolute top-2 left-2 text-2xl sm:text-4xl text-[#F47920]/10 font-serif">"</div>
              <p className="text-justify italic text-slate-700 leading-relaxed sm:leading-loose relative z-10 text-[11px] sm:text-sm">
                Sebagai penyedia layanan yang sangat menjunjung tinggi etika bisnis dan kearifan lokal, kami sangat menghormati kontribusi para pengelola RT/RW Net dalam membangun akses internet di lingkungan Anda. Oleh karena itu, demi menjaga silaturahmi dan kenyamanan bersama, kami menyarankan Anda untuk berkonsultasi terlebih dahulu dengan pengelola RT/RW Net Anda.
              </p>
            </div>
            
            <p className="text-justify">
              Kehadiran kami bertujuan untuk <span className="font-bold text-slate-800 underline decoration-[#F47920]/30 decoration-4">berkolaborasi dan melengkapi kebutuhan</span>, 
              bukan untuk merusak harmoni yang sudah terbangun dengan baik di lingkungan Anda.
            </p>
            
            <p className="text-[9px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed pt-4 border-t border-slate-100">
              Jika di kemudian hari ada kebutuhan khusus yang memerlukan sinergi dengan sistem kami, 
              pintu kami selalu terbuka untuk diskusi yang saling menguntungkan semua pihak.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-10 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row gap-3 sm:gap-4 flex-shrink-0">
          <button 
            onClick={onCancel} 
            className="w-full sm:flex-1 py-4 bg-white text-slate-500 font-black rounded-xl border border-slate-200 hover:bg-slate-100 transition-all uppercase tracking-[0.2em] text-[10px]"
          >
            Kembali
          </button>
          <button 
            onClick={onAccept} 
            className="w-full sm:flex-[2.5] py-4 bg-[#1a2d8f] hover:bg-[#0d1655] text-white font-black rounded-xl shadow-xl shadow-blue-100 transition-all active:scale-95 uppercase tracking-[0.2em] text-[10px]"
          >
            Saya Mengerti & Setuju
          </button>
        </div>
      </div>
    </div>
  );
};
