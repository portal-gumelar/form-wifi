import React, { useState } from "react";
import { RefreshCw, Globe, ArrowRight } from "lucide-react";

// UI Components
import { Section, RadioCard, InputField, SelectField } from "../components/ui/FormElements";
import { LogoMark } from "../components/ui/LogoMark";
import { PackageSelection } from "../components/registration/PackageSelection";
import { EthicNotice } from "../components/registration/EthicNotice";
import { SubscriberNotice } from "../components/registration/SubscriberNotice";
import { AlertCircle } from "lucide-react";

// Constants
import { PACKAGES } from "../constants/packages";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbZ8Jm1XKxXgVLcxPtsgG0kdnXDXPT2p7oYU4jmV05rybs8sfVWzvARxCZHt7LXlNRCpg/exec";

const initialForm = {
  currentProvider: "",
  namaLengkap: "",
  kecamatan: "GUMELAR",
  desa: "",
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

const VILLAGES = ["GUMELAR", "CIHONJE", "TLAGA", "SAMUDRA", "SAMUDRA KULON", "CILANGKAP", "PANINGKABAN"];
const COVERED_VILLAGES = ["GUMELAR", "CIHONJE"];

export const RegistrationForm: React.FC<{ setSubmitted: (data: { name: string; desa: string }) => void; setShowAdminModal: (v: boolean) => void }> = ({ setSubmitted, setShowAdminModal }) => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showEthicNotice, setShowEthicNotice] = useState(false);
  const [coverageWarning, setCoverageWarning] = useState("");

  const progress = Math.round((["currentProvider", "namaLengkap", "desa", "alamat", "noHp", "paket", "tanggalPasang", "sumberInfo"].filter(f => form[f as keyof typeof form]).length / 8) * 100);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError("");

    if (name === "desa") {
      if (value && !COVERED_VILLAGES.includes(value)) {
        setCoverageWarning("mohon maaf desa anda belum terkafer oleh jaringan kami. mohon menunggu");
      } else {
        setCoverageWarning("");
      }
    }

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

  const handlePackageSelect = (pkgLabel: string, pkgSpeed: string, pkgPrice: string) => {
    setForm(p => ({ ...p, paket: `${pkgLabel} (${pkgSpeed}) - Rp ${pkgPrice}/Bln` }));
    setTimeout(() => {
      document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const [showAgreement, setShowAgreement] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.currentProvider || !form.namaLengkap || !form.kecamatan || !form.desa || !form.alamat || !form.noHp || !form.paket || !form.tanggalPasang || !form.sumberInfo) {
      setError("Mohon lengkapi semua field yang wajib diisi (*).");
      return;
    }
    setShowAgreement(true);
  };

  const processSubmission = async () => {
    setLoading(true);
    setShowAgreement(false);
    const payload = new URLSearchParams();
    Object.entries(form).forEach(([key, val]) => {
      if (key === "prioritas" && val === "lain") payload.append("Prioritas", form.prioritasLain);
      else if (key !== "prioritasLain") {
        const apiKey = key === "currentProvider" ? "Provider Saat Ini" : 
                       key === "namaLengkap" ? "Nama Lengkap" :
                       key === "kecamatan" ? "Kecamatan" :
                       key === "desa" ? "Desa" :
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
      // 1. Submit to Google Sheets (Original Logic)
      await fetch(GOOGLE_SCRIPT_URL, { method: "POST", body: payload, mode: "no-cors" });
      
      // 2. Link Local: Save to localStorage for immediate dashboard sync
      const localData = JSON.parse(localStorage.getItem('adminData') || '[]');
      const newEntry = {
        id: localData.length + 1,
        timestamp: new Date().toLocaleString("id-ID"),
        provider: form.currentProvider,
        nama: form.namaLengkap,
        kecamatan: form.kecamatan,
        desa: form.desa,
        alamat: form.alamat,
        hp: form.noHp,
        paket: form.paket,
        tanggal: form.tanggalPasang,
        maps: form.bisaGoogleMaps || "Tidak",
        link: form.linkGoogleMaps,
        survei: form.waktuSurvei,
        prioritas: form.prioritas === "lain" ? form.prioritasLain : form.prioritas,
        sumber: form.sumberInfo
      };
      
      localStorage.setItem('adminData', JSON.stringify([newEntry, ...localData]));
      
      setSubmitted({ name: form.namaLengkap, desa: form.desa });
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
          <div className="flex items-center gap-3 group transition-transform hover:scale-105 active:scale-95 cursor-default">
            <LogoMark />
            <div className="text-left">
              <div className="text-[#FDB913] font-black text-2xl sm:text-4xl tracking-tight leading-none group-hover:text-white transition-colors">ARMEDIA<span className="text-white">_NET</span></div>
              <div className="text-white/70 text-[10px] sm:text-xs tracking-widest uppercase mt-1">PT. Akses Artha Media</div>
            </div>
          </div>
          
          <div className="mt-8 w-full max-w-md space-y-4">
            <button onClick={() => document.getElementById('sec-paket')?.scrollIntoView({ behavior: 'smooth' })} className="w-full relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-[#FDB913] to-red-600 rounded-[2rem] blur opacity-75 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-red-600 to-orange-600 p-6 rounded-[2rem] border-2 border-yellow-300 shadow-2xl">
                <h2 className="font-black text-3xl sm:text-4xl text-yellow-300 leading-none flex items-center justify-center gap-3">
                  <span className="animate-bounce">🔥</span> PROMO <span className="animate-bounce">🔥</span>
                </h2>
                <div className="bg-white text-red-700 px-4 py-1.5 rounded-full mt-3 font-black text-sm sm:text-lg inline-block uppercase tracking-tight">CUKUP MBAYAR WULANANE</div>
                <div className="mt-2 text-white font-black text-xl sm:text-2xl drop-shadow-lg">
                   MBAYAR <span className="text-yellow-300">115,000</span> <br/> 
                   <span className="text-sm sm:text-lg uppercase tracking-widest">Langsung ON / 20Mbps</span>
                </div>
                <div className="mt-4 flex items-center justify-center gap-2 text-white font-bold text-[10px] sm:text-xs uppercase tracking-tighter italic">
                  <span>✅ GRATIS ALAT</span>
                  <span className="opacity-50">|</span>
                  <span>✅ GRATIS BIAYA PASANG</span>
                </div>
              </div>
            </button>

          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pb-12 relative z-10">
        <PackageSelection selectedPackage={form.paket} onSelect={handlePackageSelect} />

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
                <div className="sm:col-span-2">
                  <label className="block text-[11px] sm:text-xs font-black text-slate-500 uppercase tracking-widest mb-4 ml-1">Pilih Desa Domisili <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {VILLAGES.map((v) => {
                      const isCovered = COVERED_VILLAGES.includes(v);
                      const isSelected = form.desa === v;
                      
                      const villageColors: Record<string, string> = {
                        "GUMELAR": "bg-amber-500",
                        "CIHONJE": "bg-emerald-500",
                        "TLAGA": "bg-blue-500",
                        "SAMUDRA": "bg-indigo-500",
                        "SAMUDRA KULON": "bg-purple-500",
                        "CILANGKAP": "bg-sky-500",
                        "PANINGKABAN": "bg-rose-500",
                      };

                      const bgColor = villageColors[v] || "bg-slate-500";

                      return (
                        <button
                          key={v}
                          type="button"
                          onClick={() => {
                            if (!form.namaLengkap || !form.noHp) {
                              setError("Wajib isi Nama dan Nomor WhatsApp terlebih dahulu!");
                              document.getElementById("sec-datadiri")?.scrollIntoView({ behavior: "smooth", block: "start" });
                              return;
                            }
                            handleChange({ target: { name: 'desa', value: v } });
                          }}
                          className={`relative group overflow-hidden rounded-[2.5rem] transition-all duration-500 ${
                            isSelected 
                            ? `${bgColor} scale-[1.05] z-10 shadow-[0_25px_60px_rgba(0,0,0,0.25)] animate-pulse-subtle` 
                            : 'bg-white hover:bg-slate-50 border-2 border-slate-100 hover:scale-[1.02] active:scale-95'
                          }`}
                        >
                          <div className={`relative p-8 flex flex-col items-center justify-center text-center gap-2 transition-all`}>
                            <div className={`font-black text-xl uppercase tracking-tighter transition-colors ${isSelected ? 'text-white' : 'text-slate-400'}`}>{v}</div>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                              isSelected 
                              ? 'bg-black/20 text-white' 
                              : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                            }`}>
                              {isCovered ? "✓ Tersedia" : "⏳ Segera Hadir"}
                            </div>
                            {isSelected && (
                              <div className="absolute top-4 right-4 w-10 h-10 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-2xl border-4 border-black/10">
                                <Lucide.Check size={24} strokeWidth={4} />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  {coverageWarning && (
                    <div className="mt-6 p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-100 rounded-[2.5rem] flex items-start gap-5 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-200">
                        <AlertCircle className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-orange-800 uppercase tracking-tight">Wilayah Prioritas Ekspansi</p>
                        <p className="text-[11px] font-bold text-orange-700/80 leading-relaxed mt-1">
                          Jaringan Armedia Net belum aktif di <span className="font-black text-orange-900 underline decoration-orange-300 decoration-2 underline-offset-2">{form.desa}</span>. 
                          Tapi jangan khawatir! Silakan <span className="font-black text-orange-900">LANJUTKAN</span> pendaftaran Anda agar kami tahu banyak peminat di wilayah ini dan segera kami bangun jaringannya!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div id="inp-alamat" className="sm:col-span-2"><InputField label="Alamat Lengkap (RT/RW)" name="alamat" value={form.alamat} onChange={handleChange} placeholder="Nama jalan, nomor rumah, RT/RW..." required textarea /></div>
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
      <SubscriberNotice 
        isOpen={showAgreement} 
        onClose={processSubmission} 
      />
    </div>
  );
};
