import { useState, useEffect } from "react";
import Dashboard from "./Dashboard";
import { Lock, X, CheckCircle2, Eye, EyeOff, RefreshCw, MessageSquare } from "lucide-react";

// ========================================================
// CONFIGURATION
// ========================================================
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzoakyfPcNDtceHrLRluX-4t5IrZX7AvpVTx7-r49ftIARFnxh_-qxDCWXt5itsYMCyHA/exec";

const PACKAGES = [
  { label: "GUYUB_1", speed: "20 Mbps", price: "115.000", badge: "bg-orange-600", popular: true, bestSeller: true },
  { label: "GUYUB_2", speed: "30 Mbps", price: "142.000", badge: "bg-blue-600", popular: true },
  { label: "GUYUB_3", speed: "50 Mbps", price: "182.000", badge: "bg-indigo-600" },
  { label: "GUYUB_4", speed: "75 Mbps", price: "260.000", badge: "bg-purple-600" },
  { label: "GUYUB_5", speed: "100 Mbps", price: "330.000", badge: "bg-amber-600" },
];

const initialForm = {
  currentProvider: "",
  namaLengkap: "",
  alamat: "",
  noHp: "",
  paket: "",
  tanggalPasang: "",
  bisaGoogleMaps: "",
  linkGoogleMaps: "",
  waktuSurvei: "",
  prioritas: "",
  prioritasLain: "",
  sumberInfo: "",
};

// =============================================
// Helper Components (Defined outside to prevent re-creation)
// =============================================

function LogoMark() {
  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg viewBox="0 0 56 56" className="absolute inset-0 w-full h-full">
        <ellipse cx="28" cy="28" rx="24" ry="13" fill="none" stroke="#7b8fd4" strokeWidth="3.5" opacity="0.7" transform="rotate(-40 28 28)" />
        <polygon points="28,8 42,44 14,44" fill="#F47920" />
        <polygon points="28,8 34,24 22,24" fill="#e06010" opacity="0.7" />
        <polygon points="28,30 35,44 21,44" fill="#1a2d8f" />
      </svg>
    </div>
  );
}

function Section({ id, title, icon, children, required }: any) {
  return (
    <div id={id} className="scroll-mt-24 group">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#1a2d8f]/5 rounded-xl flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <div>
          <h3 className="font-black text-[#1a2d8f] text-sm sm:text-lg leading-none">
            {title}
            {required && <span className="text-red-500 ml-1">*</span>}
          </h3>
          <div className="h-1 w-8 bg-[#F47920] rounded-full mt-1.5 transition-all group-hover:w-12"></div>
        </div>
      </div>
      <div className="pl-0 sm:pl-1">{children}</div>
    </div>
  );
}

function RadioCard({ name, value, label, checked, highlight, onChange }: any) {
  return (
    <label className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
      checked ? "border-[#F47920] bg-orange-50/50 shadow-md translate-x-1" : highlight ? "border-orange-200 bg-orange-50/30 shadow-sm" : "border-slate-100 bg-white hover:border-orange-200 hover:bg-orange-50/20"
    }`}>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${checked ? "border-[#F47920] bg-[#F47920]" : "border-slate-300"}`}>
        {checked && <div className="w-2 h-2 bg-white rounded-full"></div>}
      </div>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="hidden" />
      <div className="w-full">{label}</div>
    </label>
  );
}

function InputField({ label, name, value, onChange, onBlur, placeholder, required, type = "text", textarea }: any) {
  const baseClass = "w-full border-2 border-gray-200 rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 text-[13px] sm:text-sm text-gray-800 focus:outline-none focus:border-[#F47920] focus:ring-2 focus:ring-orange-100 transition-all placeholder-gray-400";
  return (
    <div>
      {label && <label className="block text-[13px] sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
      {textarea ? (
        <textarea name={name} value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder} rows={3} required={required} className={baseClass} />
      ) : (
        <input type={type} name={name} value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder} required={required} className={baseClass} />
      )}
    </div>
  );
}

// =============================================
// MAIN APP COMPONENT
// =============================================

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<"form" | "dashboard">("form");
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const progress = Math.round((["currentProvider", "namaLengkap", "alamat", "noHp", "paket", "tanggalPasang", "sumberInfo"].filter(f => form[f as keyof typeof form]).length / 7) * 100);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError("");

    const scrollTo = (id: string) => {
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    };

    if (name === "currentProvider") scrollTo("sec-datadiri");
    else if (name === "paket") scrollTo("sec-jadwal");
    else if (name === "tanggalPasang") scrollTo("sec-lokasi");
    else if (name === "bisaGoogleMaps" && value.includes("Tidak")) scrollTo("sec-prioritas");
    else if (name === "prioritas" && value !== "lain") scrollTo("sec-sumber");
    else if (name === "sumberInfo") scrollTo("sec-submit");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.currentProvider || !form.namaLengkap || !form.alamat || !form.noHp || !form.paket || !form.tanggalPasang || !form.sumberInfo) {
      setError("Mohon lengkapi semua field yang wajib diisi (*).");
      return;
    }

    setLoading(true);
    const payload = new URLSearchParams();
    Object.entries(form).forEach(([key, val]) => {
      if (key === "prioritas" && val === "lain") payload.append("Prioritas", form.prioritasLain);
      else if (key !== "prioritasLain") {
        const apiKey = key === "currentProvider" ? "Provider Saat Ini" : 
                       key === "namaLengkap" ? "Nama Lengkap" :
                       key === "alamat" ? "Alamat Pemasangan" :
                       key === "noHp" ? "No HP / WA" :
                       key === "paket" ? "Paket" :
                       key === "tanggalPasang" ? "Tanggal Rencana Pasang" :
                       key === "bisaGoogleMaps" ? "Bisa Google Maps" :
                       key === "linkGoogleMaps" ? "Link Google Maps" :
                       key === "waktuSurvei" ? "Waktu Survei" :
                       key === "prioritas" ? "Prioritas" :
                       key === "sumberInfo" ? "Sumber Info" : key;
        payload.append(apiKey, val);
      }
    });
    payload.append("Timestamp", new Date().toLocaleString("id-ID"));

    try {
      await fetch(GOOGLE_SCRIPT_URL, { method: "POST", body: payload, mode: "no-cors" });
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err) {
      setError("Koneksi gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return <SuccessPage onBack={() => { setSubmitted(false); setForm(initialForm); }} />;
  if (view === "dashboard" && isAdmin) return <Dashboard googleScriptUrl={GOOGLE_SCRIPT_URL} onLogout={() => { setIsAdmin(false); setView("form"); }} onNavigateToForm={() => setView("form")} />;

  return (
    <div className="min-h-screen bg-[#0d1655] font-sans selection:bg-[#F47920]/30 relative overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-[#F47920]/20 to-transparent blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-[#1a2d8f]/30 to-transparent blur-[120px]"></div>
      </div>

      <header className="relative z-10 p-4 pt-8">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-3">
            <LogoMark />
            <div>
              <div className="text-[#FDB913] font-black text-2xl sm:text-4xl tracking-wider">ARMEDIA<span className="text-white">_NET</span></div>
              <div className="text-white/70 text-[10px] sm:text-xs tracking-widest uppercase">PT. Akses Artha Media</div>
            </div>
          </div>
          
          <div className="mt-8 w-full max-w-md">
            <button onClick={() => document.getElementById('sec-paket')?.scrollIntoView({ behavior: 'smooth' })} className="w-full relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-[#FDB913] to-red-600 rounded-2xl blur opacity-75 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-red-600 to-orange-600 p-4 sm:p-6 rounded-2xl border-2 border-yellow-300 flex items-center justify-center gap-4">
                <span className="text-3xl animate-bounce">🔥</span>
                <div className="text-center">
                  <h2 className="font-black text-2xl sm:text-4xl text-yellow-300 leading-none">PROMO</h2>
                  <div className="bg-white text-red-700 px-3 py-1 rounded-full mt-2 font-black text-xs sm:text-lg">CUKUP MBAYAR WULANANE</div>
                </div>
                <span className="text-3xl animate-bounce">🔥</span>
              </div>
            </button>
          </div>
          
          <div className="text-center mt-6">
            <h1 className="bg-red-600 text-white px-4 py-1 rounded-full border-2 border-white font-black text-sm sm:text-2xl inline-block">GRATIS MASANG & ALATE</h1>
            <p className="text-yellow-300 text-sm sm:text-xl font-bold mt-2">100% UNLIMITED - TANPA FUP</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pb-12 relative z-10">
        <section id="sec-paket" className="mb-12 scroll-mt-24">
          <div className="text-center mb-6">
            <span className="bg-[#F47920] text-white text-[10px] font-black px-4 py-1 rounded-full uppercase">🔥 PILIH PAKET TERBAIK ANDA 🔥</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {PACKAGES.map((pkg) => (
              <div key={pkg.label} onClick={() => { setForm(p => ({ ...p, paket: `${pkg.label} (${pkg.speed}) - Rp ${pkg.price}/Bln` })); setTimeout(() => document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' }), 150); }} className={`relative cursor-pointer rounded-2xl p-4 transition-all duration-300 border-2 flex flex-col ${form.paket.startsWith(pkg.label) ? "bg-white border-[#F47920] shadow-xl scale-105 z-10" : "glass border-white/20 hover:bg-white/10"}`}>
                {pkg.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded-full">REKOMENDASI</div>}
                <div className={`${pkg.badge} text-white text-[9px] font-black px-2 py-0.5 rounded-lg mb-2 self-start`}>{pkg.label}</div>
                <div className={`font-black text-2xl leading-none ${form.paket.startsWith(pkg.label) ? "text-[#1a2d8f]" : "text-white"}`}>{pkg.speed}</div>
                <div className="mt-3 border-t border-slate-100 pt-2 mb-4">
                  <div className="text-[#F47920] font-black text-lg">Rp {pkg.price}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">/ Bulan</div>
                </div>
                <div className={`mt-auto py-2 rounded-xl text-[10px] font-black uppercase text-center ${form.paket.startsWith(pkg.label) ? "bg-[#1a2d8f] text-white" : "bg-white/10 text-white border border-white/20"}`}>{form.paket.startsWith(pkg.label) ? "Terpilih" : "Pilih"}</div>
              </div>
            ))}
          </div>
        </section>

        <div id="registration-form" className="bg-white/95 rounded-[3rem] shadow-2xl overflow-hidden scroll-mt-24 border border-white/20 relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100"><div className="h-full bg-orange-500 transition-all duration-700" style={{ width: `${progress}%` }}></div></div>
          <div className="bg-[#1a2d8f] p-8 text-white">
            <h2 className="font-black text-xl sm:text-2xl">📋 Registrasi Digital</h2>
            <div className="mt-2 inline-block bg-white/10 px-3 py-1 rounded-full text-xs font-bold">Progress: {progress}% Selesai</div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-10">
            {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold flex gap-2">⚠️ {error}</div>}
            
            <Section title="Status Langganan Saat Ini" icon="📡" required>
              <div className="grid gap-2">
                {["Internet Lokal, RT/RW NET / Internet Teman", "ISP Corporate (Telkom, Bisnet, Tsel, CBN, dll...)", "Belum Berlangganan"].map(opt => (
                  <RadioCard key={opt} name="currentProvider" value={opt} checked={form.currentProvider === opt} onChange={handleChange} label={<span className="text-sm font-bold text-slate-700">{opt}</span>} />
                ))}
              </div>
            </Section>

            <Section id="sec-datadiri" title="Data Diri Pendaftar" icon="👤">
              <div className="space-y-4">
                <InputField label="Nama Lengkap" name="namaLengkap" value={form.namaLengkap} onChange={handleChange} placeholder="Sesuai KTP" required />
                <InputField label="Alamat Pemasangan" name="alamat" value={form.alamat} onChange={handleChange} placeholder="Alamat lengkap..." required textarea />
                <InputField label="No HP / WA" name="noHp" value={form.noHp} onChange={handleChange} placeholder="0812..." required type="tel" />
              </div>
            </Section>

            <Section id="sec-paket" title="Konfirmasi Paket" icon="📦" required>
              <div className="grid gap-3">
                {PACKAGES.map(pkg => (
                  <RadioCard key={pkg.label} name="paket" value={`${pkg.label} (${pkg.speed}) - Rp ${pkg.price}/Bln`} checked={form.paket.startsWith(pkg.label)} highlight={pkg.popular} onChange={handleChange} label={
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[#1a2d8f]">{pkg.label}</span>
                        <span className="bg-[#1a2d8f] text-white px-2 py-0.5 rounded-lg font-black text-xs">{pkg.speed}</span>
                        {pkg.bestSeller && <span className="bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded-lg animate-pulse">BEST SELLER</span>}
                      </div>
                      <div className="text-[#F47920] font-black">Rp {pkg.price} <span className="text-slate-400 text-[10px]">/Bln</span></div>
                    </div>
                  } />
                ))}
              </div>
            </Section>

            <Section id="sec-jadwal" title="Jadwal Pemasangan" icon="📅" required>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { label: "Secepatnya", date: new Date().toISOString().split('T')[0], day: "Hari Ini" },
                  { label: "Besok", date: new Date(Date.now() + 86400000).toISOString().split('T')[0], day: "Besok" },
                  { label: "Pilih Tanggal", date: "custom", day: "Kalender" }
                ].map(opt => (
                  <RadioCard key={opt.label} name="dateOpt" value={opt.date} checked={opt.date === "custom" ? !["", new Date().toISOString().split('T')[0], new Date(Date.now() + 86400000).toISOString().split('T')[0]].includes(form.tanggalPasang) : form.tanggalPasang === opt.date} onChange={(e:any) => setForm(p => ({ ...p, tanggalPasang: e.target.value === "custom" ? "" : e.target.value }))} label={
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold text-slate-700">{opt.label}</span>
                      <span className="text-[10px] font-bold text-slate-400">{opt.day}</span>
                    </div>
                  } />
                ))}
              </div>
              {(![new Date().toISOString().split('T')[0], new Date(Date.now() + 86400000).toISOString().split('T')[0]].includes(form.tanggalPasang) || !form.tanggalPasang) && (
                <div className="mt-4 grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-2xl">
                  {Array.from({ length: 14 }).map((_, i) => {
                    const d = new Date(Date.now() + (i + 2) * 86400000);
                    const ds = d.toISOString().split('T')[0];
                    return <button key={ds} type="button" onClick={() => setForm(p => ({ ...p, tanggalPasang: ds }))} className={`p-2 rounded-xl text-[10px] font-black border-2 transition-all ${form.tanggalPasang === ds ? "border-[#F47920] bg-white text-[#1a2d8f]" : "border-transparent bg-white/50 text-slate-400"}`}>{d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</button>
                  })}
                </div>
              )}
            </Section>

            <Section id="sec-lokasi" title="Lokasi Pemasangan" icon="📍">
              <div className="space-y-4">
                <InputField label="Link Google Maps" name="linkGoogleMaps" value={form.linkGoogleMaps} onChange={handleChange} placeholder="https://maps..." type="url" />
                <InputField label="Waktu Survei" name="waktuSurvei" value={form.waktuSurvei} onChange={handleChange} placeholder="Contoh: Sore jam 4" />
              </div>
            </Section>

            <Section id="sec-sumber" title="Informasi" icon="🔍" required>
              <div className="grid gap-2">
                {["Media Sosial", "Rekomendasi Teman", "Spanduk", "Lainnya"].map(opt => (
                  <RadioCard key={opt} name="sumberInfo" value={opt} checked={form.sumberInfo === opt} onChange={handleChange} label={<span className="text-sm font-bold text-slate-700">{opt}</span>} />
                ))}
              </div>
            </Section>

            <div id="sec-submit" className="pt-8">
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#F47920] to-orange-500 text-white font-black text-xl py-5 rounded-3xl shadow-xl hover:shadow-orange-200 transition-all flex items-center justify-center gap-3">
                {loading ? <RefreshCw className="animate-spin" /> : "🚀 KONFIRMASI PENDAFTARAN"}
              </button>
            </div>
          </form>
        </div>

        <footer className="mt-12 text-center text-white/50 text-[10px] font-bold uppercase tracking-widest space-y-2">
          <p>PT. Akses Artha Media &bull; Jakarta Timur</p>
          <button onClick={() => setShowAdminModal(true)} className="hover:text-white transition-colors cursor-default">© {new Date().getFullYear()} ARMEDIA_NET</button>
        </footer>
      </main>

      {showAdminModal && <AdminLoginModal onClose={() => setShowAdminModal(false)} onSuccess={() => { setIsAdmin(true); setView("dashboard"); setShowAdminModal(false); }} />}
    </div>
  );
}

function AdminLoginModal({ onClose, onSuccess }: any) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f1e6e]/40 backdrop-blur-md">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-[#1a2d8f]">Admin Access</h3>
          <button onClick={onClose} className="p-2 bg-slate-50 rounded-full"><X size={18} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (password === "admin123") onSuccess(); else setError("Salah!"); }} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="password" autoFocus className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-orange-500 outline-none font-bold" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
          <button type="submit" className="w-full bg-[#1a2d8f] text-white py-3 rounded-xl font-black">Masuk Dashboard</button>
        </form>
      </div>
    </div>
  );
}

function SuccessPage({ onBack }: any) {
  return (
    <div className="min-h-screen bg-[#0d1655] flex items-center justify-center p-4">
      <div className="glass-dark rounded-[3rem] p-12 max-w-lg w-full text-center animate-slide-up border-white/20">
        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl"><CheckCircle2 className="w-12 h-12 text-white" /></div>
        <h2 className="text-3xl font-black text-white mb-4">Pendaftaran Berhasil! 🎉</h2>
        <p className="text-white/70 mb-10">Tim ARMEDIA_NET akan segera menghubungi Anda via WhatsApp.</p>
        <div className="space-y-4">
          <a href="https://wa.me/6281234567890" target="_blank" className="block w-full bg-[#25D366] text-white font-black py-4 rounded-2xl shadow-lg">CHAT WHATSAPP SEKARANG</a>
          <button onClick={onBack} className="w-full bg-white/10 text-white font-black py-4 rounded-2xl border border-white/10">KEMBALI KE BERANDA</button>
        </div>
      </div>
    </div>
  );
}
