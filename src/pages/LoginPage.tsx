import React, { useState } from "react";
import { motion } from "framer-motion";
import * as Lucide from "lucide-react";

interface LoginPageProps {
  onLogin: (password: string) => void;
  onBack: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onBack }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") { // Default password for now
      onLogin(password);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fe] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#4318ff]/10 rounded-full blur-[120px]"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bright-card p-10 space-y-8">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 bg-[#4318ff] rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-blue-500/20 mb-6">
               <Lucide.ShieldCheck size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-[#2b3674] tracking-tight">Admin Login</h1>
            <p className="text-sm font-medium text-[#a3aed0]">Silakan masukkan kata sandi untuk mengakses dashboard admin Armedia Net.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2b3674] uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lucide.Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a3aed0] group-focus-within:text-[#4318ff] transition-colors" size={18} />
                <input 
                  type="password" 
                  autoFocus
                  placeholder="Masukkan password admin..."
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-[#f4f7fe] border-2 outline-none transition-all font-bold text-[#2b3674] placeholder-[#a3aed0] ${
                    error ? 'border-red-400 animate-shake' : 'border-transparent focus:border-[#4318ff] focus:bg-white'
                  }`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-bold text-red-500 ml-1">Password salah, silakan coba lagi.</motion.p>
              )}
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-[#4318ff] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-[#3311cc] hover:-translate-y-1 transition-all active:scale-95"
            >
              Masuk ke Dashboard
            </button>
          </form>

          <button 
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 text-xs font-bold text-[#a3aed0] hover:text-[#2b3674] transition-colors"
          >
            <Lucide.ArrowLeft size={16} /> Kembali ke Form Pendaftaran
          </button>
        </div>

        <p className="text-center mt-8 text-[10px] font-bold text-[#a3aed0] uppercase tracking-[0.2em]">
          &copy; 2026 PT. Akses Artha Media. All Rights Reserved.
        </p>
      </motion.div>
    </div>
  );
};
