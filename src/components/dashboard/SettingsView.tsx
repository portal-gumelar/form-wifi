import React, { useState } from "react";
import * as Lucide from "lucide-react";
import { motion } from "framer-motion";

interface SettingsViewProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  googleScriptUrl: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ isDarkMode, setIsDarkMode, googleScriptUrl }) => {
  const [oldPwd, setOldPwd]         = useState("");
  const [newPwd, setNewPwd]         = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdMsg, setPwdMsg]         = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [showForm, setShowForm]     = useState(false);

  const DEFAULT_HASH = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9"; // admin123

  const hashPwd = async (pwd: string) => {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pwd));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: "err", text: "Password baru tidak cocok!" });
      return;
    }
    if (newPwd.length < 6) {
      setPwdMsg({ type: "err", text: "Password minimal 6 karakter." });
      return;
    }
    const oldHash = await hashPwd(oldPwd);
    const storedHash = localStorage.getItem("armedia_admin_hash") || DEFAULT_HASH;
    if (oldHash !== storedHash) {
      setPwdMsg({ type: "err", text: "Password lama salah!" });
      return;
    }
    const newHash = await hashPwd(newPwd);
    localStorage.setItem("armedia_admin_hash", newHash);
    setPwdMsg({ type: "ok", text: "✅ Password berhasil diubah!" });
    setOldPwd(""); setNewPwd(""); setConfirmPwd("");
    setTimeout(() => { setPwdMsg(null); setShowForm(false); }, 3000);
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h3 className="text-2xl font-black text-[#0d1655] tracking-tight">Pengaturan Sistem</h3>
        <p className="text-sm font-bold text-slate-400 mt-1">Kelola akun, keamanan, dan konfigurasi sistem</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* G: Ganti Password */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <h4 className="text-xs font-black uppercase tracking-widest text-[#0d1655] flex items-center gap-2">
            <Lucide.ShieldCheck size={16} className="text-[#F47920]" /> Keamanan Akun
          </h4>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0d1655] to-blue-600 flex items-center justify-center text-white text-xl font-black shadow-lg">AD</div>
            <div>
              <p className="font-black text-sm text-[#0d1655]">Administrator</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master Admin · Armedia Net</p>
            </div>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-orange-50 hover:border-orange-200 border-2 border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:text-[#F47920] transition-all"
          >
            <Lucide.Lock size={14} /> {showForm ? "Tutup" : "Ganti Password"}
          </button>

          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              onSubmit={handleChangePassword}
              className="space-y-3 overflow-hidden"
            >
              {[
                { label: "Password Lama", val: oldPwd, set: setOldPwd },
                { label: "Password Baru", val: newPwd, set: setNewPwd },
                { label: "Konfirmasi Password Baru", val: confirmPwd, set: setConfirmPwd },
              ].map(({ label, val, set }) => (
                <div key={label}>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 block">{label}</label>
                  <input
                    type="password"
                    value={val}
                    onChange={e => set(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-[#F47920] transition-all bg-slate-50"
                    placeholder="••••••••"
                  />
                </div>
              ))}
              {pwdMsg && (
                <div className={`text-xs font-black p-3 rounded-xl flex items-center gap-2 ${pwdMsg.type === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                  {pwdMsg.type === "ok" ? <Lucide.CheckCircle2 size={14} /> : <Lucide.AlertCircle size={14} />}
                  {pwdMsg.text}
                </div>
              )}
              <button
                type="submit"
                className="w-full py-3 bg-[#0d1655] hover:bg-[#1a2d8f] text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all"
              >
                Simpan Password Baru
              </button>
            </motion.form>
          )}
        </div>

        {/* Info Sistem */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <h4 className="text-xs font-black uppercase tracking-widest text-[#0d1655] flex items-center gap-2">
            <Lucide.Info size={16} className="text-blue-500" /> Info Sistem
          </h4>
          <div className="space-y-3">
            {[
              { label: "Google Apps Script", value: googleScriptUrl ? "✅ Terhubung" : "❌ Tidak ada URL", color: googleScriptUrl ? "text-green-600" : "text-red-500" },
              { label: "Auto-Refresh", value: "✅ Setiap 5 Menit", color: "text-green-600" },
              { label: "Versi Aplikasi", value: "v2.1.0 (Mei 2026)", color: "text-slate-600" },
              { label: "Database", value: "Google Sheets + localStorage", color: "text-slate-600" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <span className="text-xs font-bold text-slate-500">{item.label}</span>
                <span className={`text-xs font-black ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm md:col-span-2">
          <h4 className="text-xs font-black uppercase tracking-widest text-[#0d1655] flex items-center gap-2 mb-4">
            <Lucide.Palette size={16} className="text-purple-500" /> Tampilan
          </h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-slate-800">Dark Mode</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Ubah tema tampilan dashboard</p>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-14 h-7 rounded-full relative transition-all duration-300 ${isDarkMode ? "bg-[#0d1655]" : "bg-slate-200"}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${isDarkMode ? "left-8" : "left-1"}`} />
            </button>
          </div>
        </div>

        {/* GAS URL Info */}
        {googleScriptUrl && (
          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 md:col-span-2">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-3">
              <Lucide.Link2 size={14} /> Database API URL
            </h4>
            <p className="text-[11px] font-mono text-slate-400 break-all leading-relaxed bg-white border border-slate-100 p-3 rounded-xl">
              {googleScriptUrl}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
