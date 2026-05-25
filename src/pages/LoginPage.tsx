import React, { useState } from "react";
import * as Lucide from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../utils/supabaseClient";

interface LoginPageProps {
  onBack: () => void;
  onFallbackLogin?: (email: string, role: string) => void;
}

// Fallback credentials saat Supabase Auth provider belum dikonfigurasi
const FALLBACK_CREDENTIALS = [
  { email: "admin@armedia.id",      password: "admin123",   role: "admin" },
  { email: "superadmin@armedia.id", password: "superadmin", role: "superadmin" },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onBack, onFallbackLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      // Coba Supabase Auth terlebih dahulu
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (!error) {
        // Supabase Auth berhasil — App.tsx akan handle via onAuthStateChange
        return;
      }

      // Fallback: cek credentials manual jika Supabase Auth gagal
      // (misalnya Email provider belum dikonfigurasi di self-hosted)
      const trimmedEmail = email.trim().toLowerCase();
      const match = FALLBACK_CREDENTIALS.find(
        (c) => c.email === trimmedEmail && c.password === password
      );

      if (match) {
        console.log("[Fallback Auth] Login berhasil untuk:", match.email, "role:", match.role);
        if (onFallbackLogin) {
          onFallbackLogin(match.email, match.role);
        }
        return;
      }

      // Keduanya gagal
      throw new Error("Email atau password tidak valid.");
    } catch (err: any) {
      console.error("Login failed:", err);
      setErrorMessage(err.message || "Akses Ditolak: Email atau password tidak valid.");
      setTimeout(() => setErrorMessage(""), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1655] flex items-center justify-center p-4 font-sans text-white relative overflow-hidden">
      {/* Background Decorative Elements (Konsisten dengan Registrasi) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-[#F47920]/20 to-transparent blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-[#1a2d8f]/30 to-transparent blur-[120px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[92%] sm:max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-black/20 mx-auto mb-5 p-3">
            <img
              src="https://ik.imagekit.io/Gumelar/LogO/logo%20pt.png?updatedAt=1778213993513"
              alt="Logo"
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">ARMEDIA.ID</h1>
          <p className="text-[#FDB913] font-bold mt-2 text-xs uppercase tracking-widest">Administrator Access</p>
        </div>

        {/* Card Form - Mobile Optimized & Glassmorphism */}
        <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 p-6 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Input Email */}
            <div className="space-y-2">
              <label className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Administrator</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#F47920] transition-colors">
                  <Lucide.Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@armedia.id"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-[#F47920] focus:ring-4 focus:ring-[#F47920]/10 transition-all text-sm font-bold text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-2">
              <label className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#F47920] transition-colors">
                  <Lucide.Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-[#F47920] focus:ring-4 focus:ring-[#F47920]/10 transition-all text-sm font-bold text-slate-800 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors z-10"
                >
                  {showPassword ? <Lucide.EyeOff size={18} /> : <Lucide.Eye size={18} />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-red-600 text-xs font-black flex items-start gap-2 bg-red-50 p-4 rounded-xl border-2 border-red-100"
              >
                <Lucide.AlertCircle size={16} className="shrink-0 mt-0.5" /> 
                <span className="leading-tight">{errorMessage}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-[#F47920] to-orange-600 rounded-[1.5rem] blur opacity-40 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative w-full bg-gradient-to-r from-[#F47920] to-orange-500 text-white font-black py-4 sm:py-5 rounded-[1.5rem] shadow-xl hover:shadow-orange-200/50 flex items-center justify-center gap-2 uppercase tracking-widest active:scale-[0.98] transition-all disabled:opacity-75 disabled:cursor-not-allowed">
                {loading ? (
                  <Lucide.RefreshCw className="animate-spin w-5 h-5 text-white" />
                ) : (
                  <>
                    Sign In to Dashboard <Lucide.ArrowRight size={18} />
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Footer Area */}
          <div className="mt-8 pt-8 border-t-2 border-slate-100 flex flex-col items-center gap-4">
            <button
              onClick={onBack}
              className="text-[11px] sm:text-xs text-slate-400 hover:text-[#1a2d8f] font-black uppercase tracking-widest flex items-center gap-2 transition-colors"
            >
              <Lucide.ArrowLeft size={14} /> Kembali ke Form
            </button>
            <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">
              &copy; {new Date().getFullYear()} PT. AKSES ARTHA MEDIA
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};