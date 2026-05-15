import React, { useState } from "react";
import * as Lucide from "lucide-react";
import { motion } from "framer-motion";

interface LoginPageProps {
  onLogin: (password: string) => void;
  onBack: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onBack }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      onLogin(password);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fe] flex items-center justify-center p-4 font-sans text-[#2b3674]">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-teal-500/5 blur-[120px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200/50 mx-auto mb-4 p-2">
            <img 
              src="https://ik.imagekit.io/Gumelar/LogO/logo%20pt.png?updatedAt=1778213993513" 
              alt="Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-black text-[#1b2559] tracking-tight">Armedia Net</h1>
          <p className="text-slate-400 font-medium mt-2 text-sm uppercase tracking-widest">Administrator Access</p>
        </div>

        <div className="kolabo-card p-8 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Access Key</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-[#10b981] transition-colors">
                  <Lucide.Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter security key"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#10b981] focus:ring-4 focus:ring-[#10b981]/10 transition-all text-sm font-medium text-[#2b3674] placeholder:text-slate-300"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="text-red-500 text-xs font-bold flex items-center gap-2 bg-red-50 p-3 rounded-xl border border-red-100"
              >
                <Lucide.AlertCircle size={14} /> Password salah!
              </motion.div>
            )}

            <button
              type="submit"
              className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1 active:translate-y-0 transition-all duration-300"
            >
              Sign In to Dashboard
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center space-y-4">
            <button 
              onClick={onBack}
              className="text-xs text-[#10b981] font-bold hover:underline transition-all"
            >
              Kembali ke Form Pendaftaran
            </button>
            <p className="text-[10px] text-slate-300 font-medium uppercase tracking-tight">
              &copy; 2026 PT. AKSES ARTHA MEDIA
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
