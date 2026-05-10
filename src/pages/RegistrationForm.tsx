import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Section, RadioCard, InputField, LogoMark } from "../components/FormElements";
import { EthicNotice } from "../components/Modals";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbysJJibkHgTnACVYXaYCwG1R4JnnQHuxe8tmvEuHWqLjJ0s0bN1DtQuc5_9uv9gOw6EEw/exec";

const PACKAGES = [
  { label: "GUYUB_1", speed: "20 Mbps", price: "115.000", badge: "bg-orange-600", popular: true, bestSeller: true, features: ["Upto 20 MBPS", "Download/Upload", "Unlimited", "DUAL BAND 2,4G & 5G"] },
  { label: "GUYUB_2", speed: "30 Mbps", price: "142.000", badge: "bg-blue-600", popular: true, features: ["Upto 30 MBPS", "Download/Upload", "Unlimited", "DUAL BAND 2,4G & 5G"] },
  { label: "GUYUB_3", speed: "50 Mbps", price: "182.000", badge: "bg-indigo-600", features: ["Upto 50 MBPS", "Download/Upload", "Unlimited", "DUAL BAND 2,4G & 5G"] },
  { label: "GUYUB_4", speed: "75 Mbps", price: "260.000", badge: "bg-purple-600", features: ["Upto 75 MBPS", "Download/Upload", "Unlimited", "DUAL BAND 2,4G & 5G"] },
  { label: "GUYUB_5", speed: "100 Mbps", price: "330.000", badge: "bg-amber-600", features: ["Upto 100 MBPS", "Download/Upload", "Unlimited", "DUAL BAND 2,4G & 5G"] },
];

const initialForm = {
  currentProvider: "",
  namaLengkap: "",
  alamat: "",
  noHp: "",
  paket: "GUYUB_1 (20 Mbps) - Rp 115.000/Bln",
  tanggalPasang: "",
  bisaGoogleMaps: "",
  linkGoogleMaps: "",
  waktuSurvei: "",
  prioritas: "",
  prioritasLain: "",
  sumberInfo: "",
};

export const RegistrationForm: React.FC<{ setSubmitted: (v: boolean) => void; setShowAdminModal: (v: boolean) => void }> = ({ setSubmitted, setShowAdminModal }) => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showEthicNotice, setShowEthicNotice] = useState(false);

  const progress = Math.round((["currentProvider", "namaLengkap", "alamat", "noHp", "paket", "tanggalPasang", "sumberInfo"].filter(f => form[f as keyof typeof form]).length / 7) * 100);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError("");

    if (name === "currentProvider" && value.includes("RT/RW NET")) {
      setShowEthicNotice(true);
    }

    const scrollTo = (id: string) => {
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    };

    if (name === "currentProvider") scrollTo("sec-datadiri");
    else if (name === "paket") scrollTo("sec-jadwal");
    else if (name === "tanggalPasang") scrollTo("sec-lokasi");
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

  return (
    <div className="min-h-screen bg-[#0d1655] font-sans selection:bg-[#F47920]/30 relative overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-[#F47920]/20 to-transparent blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-[#1a2d8f]/30 to-transparent blur-[120px]"></div>
      </div>

      <header className="relative z-10 p-4 pt-8">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          <div className="flex items-center gap-3">
            <LogoMark />
            <div className="text-left">
              <div className="text-[#FDB913] font-black text-2xl sm:text-4xl tracking-tight leading-none">ARMEDIA<span className="text-white">_NET</span></div>
              <div className="text-white/70 text-[10px] sm:text-xs tracking-widest uppercase mt-1">PT. Akses Artha Media</div>
            </div>
          </div>
          
          <div className="mt-8 w-full max-w-md">
            <button onClick={() => document.getElementById('sec-paket')?.scrollIntoView({ behavior: 'smooth' })} className="w-full relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-[#FDB913] to-red-600 rounded-[2rem] blur opacity-75 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-red-600 to-orange-600 p-6 rounded-[2rem] border-2 border-yellow-300 shadow-2xl">
                <h2 className="font-black text-3xl sm:text-4xl text-yellow-300 leading-none flex items-center justify-center gap-3">
                  <span className="animate-bounce">🔥</span> PROMO <span className="animate-bounce">🔥</span>
                </h2>
                <div className="bg-white text-red-700 px-4 py-1.5 rounded-full mt-3 font-black text-sm sm:text-lg inline-block">CUKUP MBAYAR WULANANE</div>
              </div>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pb-12 relative z-10">
        <section id="sec-paket" className="mb-12 scroll-mt-24 mt-8">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {PACKAGES.map((pkg) => (
              <div key={pkg.label} onClick={() => { setForm(p => ({ ...p, paket: `${pkg.label} (${pkg.speed}) - Rp ${pkg.price}/Bln` })); setTimeout(() => document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' }), 150); }} className={`relative cursor-pointer rounded-[2rem] p-5 transition-all duration-300 border-2 flex flex-col ${form.paket.startsWith(pkg.label) ? "bg-white border-[#F47920] shadow-2xl scale-105 z-10" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
                {pkg.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Populer</div>}
                <div className={`${pkg.badge} text-white text-[9px] font-black px-2.5 py-1 rounded-lg mb-3 self-start uppercase tracking-wider`}>{pkg.label}</div>
                <div className={`font-black text-3xl leading-none mb-1 ${form.paket.startsWith(pkg.label) ? "text-[#1a2d8f]" : "text-white"}`}>{pkg.speed}</div>
                <div className="h-0.5 w-full bg-[#F47920]/20 my-3"></div>
                
                <ul className="space-y-2 mb-6">
                  {pkg.features.map((feat: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><CheckCircle size={10} className="text-white" fill="currentColor" /></div>
                      <span className={`text-[10px] font-bold leading-tight ${form.paket.startsWith(pkg.label) ? "text-slate-600" : "text-white/80"}`}>{feat}</span>
                    </li>
                  ))}
                </ul>

                <div className={`mt-auto border-t pt-4 mb-4 ${form.paket.startsWith(pkg.label) ? "border-slate-100" : "border-white/10"}`}>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Hanya</div>
                  <div className="flex items-baseline gap-1">
                    <div className="text-[#F47920] font-black text-2xl tracking-tighter">Rp {pkg.price}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-black">/ bln</div>
                  </div>
                </div>
                <div className={`mt-auto py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-center transition-all ${form.paket.startsWith(pkg.label) ? "bg-[#1a2d8f] text-white shadow-lg" : "bg-white/10 text-white/50 border border-white/10"}`}>{form.paket.startsWith(pkg.label) ? "Dipilih" : "Pilih"}</div>
              </div>
            ))}
          </div>
        </section>

        <div id="registration-form" className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden scroll-mt-24 border border-white/20 relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-slate-100"><div className="h-full bg-gradient-to-r from-[#F47920] to-orange-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(244,121,32,0.5)]" style={{ width: `${progress}%` }}></div></div>
          <div className="bg-[#1a2d8f] p-8 sm:p-12 text-white relative">
             <div className="absolute top-0 right-0 p-8 opacity-10"><LogoMark /></div>
            <h2 className="font-black text-2xl sm:text-4xl tracking-tight">FORMULIR REGISTRASI</h2>
            <p className="text-white/50 text-xs sm:text-sm font-bold uppercase tracking-widest mt-2">Lengkapi data untuk pemasangan internet unlimited</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-12">
            {error && <div className="bg-red-50 text-red-600 p-5 rounded-2xl text-sm font-black flex items-center gap-3 border-2 border-red-100 animate-pulse"><span>⚠️</span> {error}</div>}
            
            <Section title="APAKAH SAAT INI ANDA SUDAH LANGGANAN INTERNET?" icon="📡" required>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {["Internet Lokal (RT/RW NET)", "ISP Besar (Indihome, Biznet, dll)", "Belum Pernah Pasang"].map(opt => (
                  <RadioCard key={opt} name="currentProvider" value={opt} checked={form.currentProvider === opt} onChange={handleChange} label={<span className="text-sm font-black text-slate-700 tracking-tight">{opt}</span>} />
                ))}
              </div>
            </Section>

            <Section id="sec-datadiri" title="Informasi Pemasangan" icon="👤">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-1"><InputField label="Nama Lengkap Sesuai KTP" name="namaLengkap" value={form.namaLengkap} onChange={handleChange} placeholder="Contoh: Budi Santoso" required /></div>
                <div className="sm:col-span-1"><InputField label="Nomor WhatsApp Aktif" name="noHp" value={form.noHp} onChange={handleChange} placeholder="08123456789" required type="tel" /></div>
                <div className="sm:col-span-2"><InputField label="Alamat Lengkap Lokasi Pasang" name="alamat" value={form.alamat} onChange={handleChange} placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan..." required textarea /></div>
              </div>
            </Section>

            <Section id="sec-jadwal" title="Pilih Tanggal Pemasangan" icon="📅" required>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Secepatnya", date: new Date().toISOString().split('T')[0], day: "Hari Ini" },
                  { label: "Besok", date: new Date(Date.now() + 86400000).toISOString().split('T')[0], day: "Besok" },
                  { label: "Pilih Tanggal", date: "custom", day: "Kalender" }
                ].map(opt => (
                  <RadioCard key={opt.label} name="dateOpt" value={opt.date} checked={opt.date === "custom" ? !["", new Date().toISOString().split('T')[0], new Date(Date.now() + 86400000).toISOString().split('T')[0]].includes(form.tanggalPasang) : form.tanggalPasang === opt.date} onChange={(e:any) => setForm(p => ({ ...p, tanggalPasang: e.target.value === "custom" ? "" : e.target.value }))} label={
                    <div className="text-center w-full">
                      <div className="font-black text-slate-800 text-sm leading-none">{opt.label}</div>
                      <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{opt.day}</div>
                    </div>
                  } />
                ))}
              </div>
              {(![new Date().toISOString().split('T')[0], new Date(Date.now() + 86400000).toISOString().split('T')[0]].includes(form.tanggalPasang) || !form.tanggalPasang) && (
                <div className="mt-4 grid grid-cols-4 sm:grid-cols-7 gap-2 p-3 bg-slate-50 rounded-[2rem] border-2 border-slate-100">
                  {Array.from({ length: 14 }).map((_, i) => {
                    const d = new Date(Date.now() + (i + 2) * 86400000);
                    const ds = d.toISOString().split('T')[0];
                    return <button key={ds} type="button" onClick={() => setForm(p => ({ ...p, tanggalPasang: ds }))} className={`p-2.5 rounded-xl text-[10px] font-black border-2 transition-all ${form.tanggalPasang === ds ? "border-[#F47920] bg-white text-[#1a2d8f] shadow-md" : "border-transparent bg-white/40 text-slate-400 hover:bg-white"}`}>{d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</button>
                  })}
                </div>
              )}
            </Section>

            <Section id="sec-lokasi" title="Detail Tambahan" icon="📍">
              <div className="grid grid-cols-1 gap-8">
                <InputField label="Link Google Maps (Opsional)" name="linkGoogleMaps" value={form.linkGoogleMaps} onChange={handleChange} placeholder="https://maps.app.goo.gl/..." type="url" />
                
                <div>
                  <label className="block text-[11px] sm:text-xs font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Waktu Survei Yang Pas <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Pagi", time: "08:00 - 11:00" },
                      { label: "Siang", time: "11:00 - 14:00" },
                      { label: "Sore", time: "14:00 - 17:00" },
                      { label: "Malam", time: "18:00 - 20:00" }
                    ].map(opt => (
                      <RadioCard 
                        key={opt.label} 
                        name="waktuSurvei" 
                        value={`${opt.label} (${opt.time})`} 
                        checked={form.waktuSurvei.startsWith(opt.label)} 
                        onChange={handleChange} 
                        label={
                          <div className="text-center w-full">
                            <div className="font-black text-slate-800 text-sm leading-none">{opt.label}</div>
                            <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{opt.time}</div>
                          </div>
                        } 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            <Section id="sec-sumber" title="Tahu Kami Dari Mana?" icon="🔍" required>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["Media Sosial", "Teman/Tetangga", "Spanduk/Banner", "Sales/Petugas"].map(opt => (
                  <RadioCard key={opt} name="sumberInfo" value={opt} checked={form.sumberInfo === opt} onChange={handleChange} label={<span className="text-[11px] font-black text-slate-700 tracking-tight">{opt}</span>} />
                ))}
              </div>
            </Section>

            <div id="sec-submit" className="pt-10">
              <button type="submit" disabled={loading} className="w-full relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#F47920] to-orange-600 rounded-3xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative w-full bg-gradient-to-r from-[#F47920] to-orange-500 text-white font-black text-xl py-6 rounded-3xl shadow-xl hover:shadow-orange-200 transition-all flex items-center justify-center gap-4 uppercase tracking-widest">
                  {loading ? <RefreshCw className="animate-spin" /> : "🚀 Kirim Pendaftaran"}
                </div>
              </button>
              <p className="text-center text-slate-400 text-[10px] font-bold mt-6 uppercase tracking-widest">Data Anda aman dan hanya digunakan untuk pemasangan layanan</p>
            </div>
          </form>
        </div>

        <footer className="mt-16 text-center text-white/30 text-[10px] font-black uppercase tracking-[0.3em] space-y-4">
          <p>PT. Akses Artha Media &bull; Jakarta &bull; Indonesia</p>
          <button onClick={() => setShowAdminModal(true)} className="hover:text-[#F47920] transition-colors cursor-default">© {new Date().getFullYear()} ARMEDIA_NET</button>
        </footer>
      </main>
      {showEthicNotice && (
        <EthicNotice 
          onAccept={() => {
            setShowEthicNotice(false);
            setTimeout(() => {
              document.getElementById("sec-datadiri")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 300);
          }} 
          onCancel={() => {
            setForm(prev => ({ ...prev, currentProvider: "" }));
            setShowEthicNotice(false);
          }} 
        />
      )}
    </div>
  );
};

const CheckCircle = ({ size, className, fill }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
