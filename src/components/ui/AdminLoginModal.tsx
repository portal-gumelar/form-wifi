import React, { useState } from "react";
import { X, Lock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AdminLoginModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onClose, onSuccess }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      onSuccess();
    } else {
      setError("Akses Ditolak: Kunci keamanan salah!");
      setPassword("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError(""); // Pembersihan Error Otomatis saat mengetik ulang
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-[#0d1655]/80 backdrop-blur-md animate-in fade-in duration-200">

      {/* Kontainer Modal Pop-up - Dioptimalkan untuk Responsivitas HP */}
      <div className="bg-white rounded-[2rem] p-6 sm:p-8 w-full max-w-sm shadow-[0_24px_50px_-12px_rgba(0,0,0,0.4)] border border-slate-100 relative overflow-hidden">

        {/* Header Modal */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-[#0d1655] uppercase tracking-wider">Akses Admin</h3>
            <div className="h-1 w-6 bg-[#F47920] rounded-full mt-1"></div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors outline-none"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Akses */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kunci Keamanan</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#F47920] transition-colors" />
              <input
                type="password"
                autoFocus
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 rounded-xl border-2 border-slate-200 text-base font-bold text-slate-800 placeholder:text-slate-300 outline-none focus:border-[#F47920] focus:bg-white transition-all"
                placeholder="Masukkan kata sandi..."
                value={password}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Notifikasi Error Kategori Premium */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[11px] font-black flex items-center gap-2"
              >
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tombol Eksekusi */}
          <button
            type="submit"
            className="w-full relative group mt-2"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-[#0d1655] to-blue-700 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative w-full bg-gradient-to-r from-[#0d1655] to-blue-900 text-white py-4 rounded-xl font-black shadow-md hover:shadow-lg transition-all active:scale-[0.98] uppercase tracking-widest text-xs flex items-center justify-center gap-2">
              Masuk Dasbor
            </div>
          </button>
        </form>

      </div>
    </div>
  );
};