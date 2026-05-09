import React, { useState } from "react";
import { CheckCircle2, MessageSquare, X, Lock } from "lucide-react";

export const SuccessPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
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
          <p className="text-white/70 mb-10 text-sm sm:text-base font-medium">Data Anda sudah kami terima. Tim <span className="text-[#F47920] font-black tracking-tight">ARMEDIA_NET</span> akan segera menghubungi Anda via WhatsApp.</p>
          
          <div className="space-y-4">
            <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#20bd5b] text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95">
              <MessageSquare size={20} /> CHAT WHATSAPP SEKARANG
            </a>
            <button onClick={onBack} className="w-full bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-2xl border border-white/10 transition-all">
              KEMBALI KE BERANDA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdminLoginModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      onSuccess();
    } else {
      setError("Password tidak valid!");
      setPassword("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d1655]/60 backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl font-black text-[#1a2d8f] uppercase tracking-tight">Admin Access</h3>
            <div className="h-1 w-8 bg-[#F47920] rounded-full mt-1"></div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"><X size={18} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="password" 
              autoFocus 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-[#F47920] outline-none font-bold transition-all" 
              placeholder="Masukkan Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          {error && <p className="text-red-500 text-xs font-bold text-center animate-pulse">{error}</p>}
          <button type="submit" className="w-full bg-[#1a2d8f] hover:bg-[#152373] text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-100 transition-all active:scale-95 uppercase tracking-widest text-sm">
            Masuk Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};
