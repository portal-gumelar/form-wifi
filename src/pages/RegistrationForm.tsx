// Last update: 2026-05-18 23:55 - Clean Split RegistrationForm Flow
import React, { useState, useRef, useEffect } from "react";
import { RefreshCw, AlertCircle, ChevronDown } from "lucide-react";

// UI Components
import { Section, RadioCard, InputField } from "../components/ui/FormElements";
import { LogoMark } from "../components/ui/LogoMark";
import { PackageSelection } from "../components/registration/PackageSelection";
import { SubscriberNotice } from "../components/registration/SubscriberNotice";



const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbztG8z0ob1ULpzkYXIIbaV1PokdR_dO4qj7TSD0rnwz8qb77QlJNrUQM0DHwNwXFC_reQ/exec";

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
  const [coverageWarning, setCoverageWarning] = useState("");

  const [isVillageDropdownOpen, setIsVillageDropdownOpen] = useState(false);
  const [isNoticeAccepted, setIsNoticeAccepted] = useState(false);
  const [showEthicModal, setShowEthicModal]     = useState(false); // ETIKA & SILATURAHMI
  const dropdownRef = useRef<HTMLDivElement>(null);

  const progress = Math.round((["currentProvider", "namaLengkap", "desa", "alamat", "noHp", "paket", "tanggalPasang", "sumberInfo"].filter(f => form[f as keyof typeof form]).length / 8) * 100);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsVillageDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

    const scrollTo = (id: string) => {
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    };

    if (name === "currentProvider") {
      if (value === "Internet Lokal (RT/RW NET)") {
        setShowEthicModal(true); // tampilkan modal etika
      } else {
        scrollTo("sec-datadiri");
      }
    }
    else if (name === "paket") scrollTo("sec-jadwal");
    else if (name === "tanggalPasang") scrollTo("sec-lokasi");
    else if (name === "sumberInfo") scrollTo("sec-notice-block");
  };

  const handlePackageSelect = (pkgLabel: string, pkgSpeed: string, pkgPrice: string) => {
    setForm(p => ({ ...p, paket: `${pkgLabel} (${pkgSpeed}) - Rp ${pkgPrice}/Bln` }));
    setTimeout(() => {
      document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.currentProvider || !form.namaLengkap || !form.kecamatan || !form.desa || !form.alamat || !form.noHp || !form.paket || !form.tanggalPasang || !form.sumberInfo) {
      setError("Mohon lengkapi semua field yang wajib diisi (*).");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!isNoticeAccepted) {
      setError("Anda wajib membuka, membaca, dan menyetujui Ketentuan Biaya Pro-rata di bawah sebelum mengirim data.");
      document.getElementById("sec-notice-block")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    await processSubmission();
  };

  const processSubmission = async () => {
    setLoading(true);
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
    payload.append("status", "PENGAJUAN"); // SOP: setiap form masuk = PENGAJUAN

    try {
      await fetch(GOOGLE_SCRIPT_URL, { method: "POST", body: payload, mode: "no-cors" });

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
    <div className="min-h-screen bg-[#0d1655] font-sans selection:bg-[#F47920]/30 relative overflow-x-hidden flex flex-col items-center">

      {/* ── MODAL ETIKA & SILATURAHMI ────────────────────────── */}
      {showEthicModal && (
        <div className="fixed inset-0 z-[999] flex items-start justify-center bg-[#0d1655]/95 backdrop-blur-sm overflow-y-auto py-6 px-4">
          <div className="w-full max-w-[92%] sm:max-w-md space-y-5 my-auto">
            {/* Header orange */}
            <div className="bg-[#F47920] rounded-3xl p-5 flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                <span className="text-3xl">🤝</span>
              </div>
              <div>
                <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">Prinsip Harmoni Armedia_Net</p>
                <h2 className="text-white font-black text-xl leading-tight">ETIKA & SILATURAHMI</h2>
              </div>
            </div>

            {/* Body card */}
            <div className="bg-white rounded-3xl p-6 space-y-5 shadow-2xl">
              <p className="text-slate-700 text-sm font-medium leading-relaxed">
                Terima kasih atas ketertarikan Anda pada layanan kami. Kami melihat saat ini Anda telah didukung oleh{" "}
                <strong className="text-[#0d1655] underline">layanan RT/RW Net setempat atau Layanan Internet Pertemanan.</strong>
              </p>

              <div className="border-l-4 border-[#F47920] pl-4 bg-orange-50/60 py-3 rounded-r-2xl">
                <p className="text-slate-600 text-sm italic leading-relaxed">
                  Sebagai penyedia layanan yang sangat menjunjung tinggi etika bisnis dan kearifan lokal, kami sangat menghormati kontribusi para pengelola RT/RW Net dalam membangun akses internet di lingkungan Anda. Oleh karena itu, demi menjaga silaturahmi dan kenyamanan bersama, kami menyarankan Anda untuk berkonsultasi terlebih dahulu dengan pengelola RT/RW Net Anda.
                </p>
              </div>

              <p className="text-slate-700 text-sm leading-relaxed">
                Kehadiran kami bertujuan untuk <strong className="underline">berkolaborasi dan melengkapi kebutuhan</strong>, bukan untuk merusak harmoni yang sudah terbangun dengan baik di lingkungan Anda.
              </p>

              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black leading-relaxed">
                Jika di kemudian hari ada kebutuhan khusus yang memerlukan sinergi dengan sistem kami, pintu kami selalu terbuka untuk diskusi yang saling menguntungkan semua pihak.
              </p>
            </div>

            {/* Tombol aksi */}
            <button
              type="button"
              onClick={() => {
                setShowEthicModal(false);
                setForm(prev => ({ ...prev, currentProvider: "" })); // reset pilihan
              }}
              className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-black text-sm uppercase tracking-widest rounded-2xl border border-white/20 transition-all active:scale-95"
            >
              KEMBALI
            </button>
            <button
              type="button"
              onClick={() => {
                setShowEthicModal(false);
                setTimeout(() => document.getElementById("sec-datadiri")?.scrollIntoView({ behavior: "smooth" }), 200);
              }}
              className="w-full py-4 bg-[#0d1655] hover:bg-[#1a2d8f] text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95"
            >
              SAYA MENGERTI & SETUJU
            </button>
          </div>
        </div>
      )}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-[#F47920]/20 to-transparent blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-[#1a2d8f]/30 to-transparent blur-[120px]"></div>
      </div>

      <header className="relative z-10 p-4 pt-12 w-full max-w-[92%] md:max-w-4xl mx-auto flex flex-col items-center text-center">
        <div className="flex items-center justify-center gap-3 group transition-transform hover:scale-105 active:scale-95 cursor-default">
          <LogoMark />
          <div className="text-left">
            <div className="text-[#FDB913] font-black text-2xl sm:text-4xl tracking-tight leading-none group-hover:text-white transition-colors">ARMEDIA<span className="text-white">_NET</span></div>
            <div className="text-white/70 text-[10px] sm:text-xs tracking-widest uppercase mt-1">PT. Akses Artha Media</div>
          </div>
        </div>

        <div className="mt-8 w-full max-w-md space-y-4">
          <button type="button" onClick={() => document.getElementById('sec-paket')?.scrollIntoView({ behavior: 'smooth' })} className="w-full relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-[#FDB913] to-red-600 rounded-[2rem] blur opacity-75 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-red-600 to-orange-600 p-6 rounded-[2rem] border-2 border-yellow-300 shadow-2xl">
              <h2 className="font-black text-3xl sm:text-4xl text-yellow-300 leading-none flex items-center justify-center gap-3">
                <span className="animate-bounce">🔥</span> PROMO <span className="animate-bounce">🔥</span>
              </h2>
              <div className="bg-white text-red-700 px-4 py-1.5 rounded-full mt-3 font-black text-sm sm:text-lg inline-block uppercase tracking-tight">CUKUP MBAYAR WULANANE</div>
              <div className="mt-2 text-white font-black text-xl sm:text-2xl drop-shadow-lg">
                MBAYAR <span className="text-yellow-300">115,000</span> <br />
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
      </header>

      <main className="w-full max-w-[92%] md:max-w-4xl mx-auto pb-16 relative z-10 flex flex-col gap-10 mt-6">
        <PackageSelection selectedPackage={form.paket} onSelect={handlePackageSelect} />

        <div id="registration-form" className="w-full bg-white/95 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden scroll-mt-24 border border-white/30 relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
            <div className="h-full bg-gradient-to-r from-[#F47920] to-orange-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(244,121,32,0.5)]" style={{ width: `${progress}%` }}></div>
          </div>

          <div className="bg-[#1a2d8f] p-8 md:p-12 text-white relative flex flex-col justify-center items-start">
            <div className="absolute top-0 right-0 p-8 opacity-10"><LogoMark /></div>
            <h2 className="font-black text-2xl sm:text-4xl tracking-tight">FORMULIR REGISTRASI</h2>
            <p className="text-white/70 text-xs sm:text-sm font-bold uppercase tracking-widest mt-2">Lengkapi data untuk pemasangan internet unlimited</p>
          </div>

          <form onSubmit={handleFormSubmit} className="p-6 md:p-12 flex flex-col gap-8 md:gap-10">
            {error && (
              <div className="bg-red-50 text-red-600 p-5 rounded-2xl text-sm font-black flex items-center gap-3 border-2 border-red-100 animate-pulse">
                <span>⚠️</span> {error}
              </div>
            )}

            <Section title="APAKAH SAAT INI ANDA SUDAH LANGGANAN INTERNET?" icon="📡" required>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["Internet Lokal (RT/RW NET)", "ISP Besar (Indihome, Biznet, dll)", "Belum Pernah Pasang"].map(opt => (
                  <RadioCard key={opt} name="currentProvider" value={opt} checked={form.currentProvider === opt} onChange={handleChange} label={<span className="text-sm font-black text-slate-700 tracking-tight">{opt}</span>} />
                ))}
              </div>
            </Section>

            <Section id="sec-datadiri" title="Informasi Pemasangan" icon="👤">
              <div className="grid grid-cols-1 gap-6 md:gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <InputField label="Nama Lengkap Sesuai KTP" name="namaLengkap" value={form.namaLengkap} onChange={handleChange} placeholder="Contoh: Budi Santoso" required />
                  <InputField label="Nomor WhatsApp Aktif" name="noHp" value={form.noHp} onChange={handleChange} placeholder="08123456789" required type="tel" />
                </div>

                <div className="w-full relative" ref={dropdownRef}>
                  <label className="block text-[11px] sm:text-xs font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">
                    Pilih Desa Domisili <span className="text-red-500">*</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      if (!form.namaLengkap || !form.noHp) {
                        setError("Wajib isi Nama dan Nomor WhatsApp terlebih dahulu!");
                        document.getElementById("sec-datadiri")?.scrollIntoView({ behavior: "smooth", block: "start" });
                        return;
                      }
                      setIsVillageDropdownOpen(!isVillageDropdownOpen);
                    }}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 text-sm font-black uppercase tracking-wide transition-all text-left ${isVillageDropdownOpen ? 'border-[#F47920] bg-white ring-4 ring-orange-500/10' : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                  >
                    <span className={form.desa ? "text-[#1a2d8f] font-black" : "text-slate-400 font-bold"}>
                      {form.desa ? `DESA ${form.desa}` : "— SILAKAN PILIH DESA —"}
                    </span>
                    <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${isVillageDropdownOpen ? 'rotate-180 text-[#F47920]' : ''}`} />
                  </button>

                  {isVillageDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] border border-slate-100 z-50 p-1.5 max-h-[250px] overflow-y-auto custom-scrollbar">
                      {VILLAGES.map((v) => {
                        const isCovered = COVERED_VILLAGES.includes(v);
                        const isSelected = form.desa === v;
                        return (
                          <button
                            key={v}
                            type="button"
                            onClick={() => {
                              handleChange({ target: { name: 'desa', value: v } });
                              setIsVillageDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all mb-0.5 text-left ${isSelected ? 'bg-orange-50/80 text-[#1a2d8f]' : 'hover:bg-slate-50'
                              }`}
                          >
                            <span className={`text-xs font-black tracking-tight ${isSelected ? 'text-[#F47920]' : 'text-slate-700'}`}>
                              {v}
                            </span>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${isCovered ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' : 'bg-amber-50 text-amber-600 border-amber-100/50'
                              }`}>
                              {isCovered ? "✓ Tersedia" : "⏳ Segera Hadir"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {coverageWarning && (
                    <div className="mt-5 p-5 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-100 rounded-[2rem] flex items-start gap-4 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-orange-800 uppercase tracking-tight">Wilayah Prioritas Ekspansi</p>
                        <p className="text-[11px] font-bold text-orange-700/80 leading-relaxed mt-0.5">
                          Jaringan Armedia Net belum aktif di <span className="font-black text-orange-900 underline decoration-orange-300 decoration-2">{form.desa}</span>.
                          Silakan <span className="font-black text-orange-900">LANJUTKAN</span> pendaftaran Anda agar kami mencatat permintaan di wilayah ini.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div id="inp-alamat" className="w-full">
                  <InputField label="Alamat Lengkap (RT/RW)" name="alamat" value={form.alamat} onChange={handleChange} placeholder="Nama jalan, nomor rumah, RT/RW..." required textarea />
                </div>
              </div>
            </Section>

            <Section id="sec-jadwal" title="Pilih Tanggal Pemasangan" icon="📅" required>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Secepatnya", date: new Date().toISOString().split('T')[0], day: "Hari Ini" },
                  { label: "Besok", date: new Date(Date.now() + 86400000).toISOString().split('T')[0], day: "Besok" },
                  { label: "Pilih Tanggal", date: "custom", day: "Kalender" }
                ].map(opt => (
                  <RadioCard key={opt.label} name="dateOpt" value={opt.date} checked={opt.date === "custom" ? !["", new Date().toISOString().split('T')[0], new Date(Date.now() + 86400000).toISOString().split('T')[0]].includes(form.tanggalPasang) : form.tanggalPasang === opt.date} onChange={(e: any) => setForm(p => ({ ...p, tanggalPasang: e.target.value === "custom" ? "" : e.target.value }))} label={
                    <div className="text-center w-full">
                      <div className="font-black text-slate-800 text-sm md:text-base leading-none">{opt.label}</div>
                      <div className="text-[10px] md:text-xs font-bold text-slate-400 mt-1.5 uppercase tracking-tighter">{opt.day}</div>
                    </div>
                  } />
                ))}
              </div>
              {(![new Date().toISOString().split('T')[0], new Date(Date.now() + 86400000).toISOString().split('T')[0]].includes(form.tanggalPasang) || !form.tanggalPasang) && (
                <div className="mt-5 grid grid-cols-4 md:grid-cols-7 gap-3 p-4 bg-slate-50 rounded-[2rem] border-2 border-slate-100">
                  {Array.from({ length: 14 }).map((_, i) => {
                    const d = new Date(Date.now() + (i + 2) * 86400000);
                    const ds = d.toISOString().split('T')[0];
                    return <button key={ds} type="button" onClick={() => setForm(p => ({ ...p, tanggalPasang: ds }))} className={`p-3 rounded-xl text-[11px] font-black border-2 transition-all ${form.tanggalPasang === ds ? "border-[#F47920] bg-white text-[#1a2d8f] shadow-md" : "border-transparent bg-white/40 text-slate-400 hover:bg-white hover:border-slate-200"}`}>{d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</button>
                  })}
                </div>
              )}
            </Section>

            <Section id="sec-lokasi" title="Detail Tambahan" icon="📍">
              <div className="grid grid-cols-1 gap-8 md:gap-10">
                <InputField label="Link Google Maps (Opsional)" name="linkGoogleMaps" value={form.linkGoogleMaps} onChange={handleChange} placeholder="https://maps.app.goo.gl/..." type="url" />

                <div className="w-full">
                  <label className="block text-[11px] sm:text-xs font-black text-slate-500 uppercase tracking-widest mb-4 ml-1">Waktu Survei Yang Pas <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                            <div className="font-black text-slate-800 text-sm md:text-base leading-none">{opt.label}</div>
                            <div className="text-[10px] md:text-xs font-bold text-slate-400 mt-1.5 uppercase tracking-tighter">{opt.time}</div>
                          </div>
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            <Section id="sec-sumber" title="Tahu Kami Dari Mana?" icon="🔍" required>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Media Sosial", "Teman/Tetangga", "Spanduk/Banner", "Sales/Petugas"].map(opt => (
                  <RadioCard key={opt} name="sumberInfo" value={opt} checked={form.sumberInfo === opt} onChange={handleChange} label={<span className="text-[11px] md:text-xs font-black text-slate-700 tracking-tight">{opt}</span>} />
                ))}
              </div>
            </Section>

            <div id="sec-notice-block" className="scroll-mt-24">
              <SubscriberNotice
                isAccepted={isNoticeAccepted}
                onAcceptChange={setIsNoticeAccepted}
              />
            </div>

            <div id="sec-submit" className="pt-2">
              <button type="submit" disabled={loading} className="w-full relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#F47920] to-orange-600 rounded-[2rem] blur opacity-40 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative w-full bg-gradient-to-r from-[#F47920] to-orange-500 text-white font-black text-xl py-6 md:py-8 rounded-[2rem] shadow-2xl hover:shadow-orange-200/50 transition-all flex items-center justify-center gap-4 uppercase tracking-widest active:scale-[0.98]">
                  {loading ? <RefreshCw className="animate-spin w-6 h-6 md:w-8 md:h-8" /> : "🚀 Kirim Pendaftaran"}
                </div>
              </button>
              <p className="text-center text-slate-400 text-[10px] md:text-xs font-bold mt-6 uppercase tracking-widest">Data Anda aman dan hanya digunakan untuk proses instalasi</p>
            </div>
          </form>
        </div>

        <footer className="mt-12 text-center text-white/30 text-[10px] font-black uppercase tracking-[0.3em] space-y-4">
          <p>PT. Akses Artha Media • Jakarta • Indonesia</p>
          <button onClick={() => setShowAdminModal(true)} className="hover:text-[#F47920] transition-colors cursor-default">© {new Date().getFullYear()} ARMEDIA_NET</button>
        </footer>
      </main>
    </div>
  );
};