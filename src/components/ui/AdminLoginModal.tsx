import React, { useState } from "react";
import { X, Lock } from "lucide-react";

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
