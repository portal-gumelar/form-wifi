// Last update: 2026-05-18 23:55 - Clean Split RegistrationForm Flow
import React, { useState, useRef, useEffect } from "react";
import { RefreshCw, AlertCircle, ChevronDown, Camera, Image as ImageIcon } from "lucide-react";
import { parseKTPText } from "../utils/ktpParser";
import { api } from "../utils/apiClient";

// UI Components
import { Section, RadioCard, InputField } from "../components/ui/FormElements";
import { LogoMark } from "../components/ui/LogoMark";
import { PackageSelection } from "../components/registration/PackageSelection";
import { SubscriberNotice } from "../components/registration/SubscriberNotice";
import { FomoNotifications, FloatingWhatsAppButton } from "../components/registration/FomoWidgets";
import { DESA_RW_RT, VILLAGES, COVERED_VILLAGES } from "../constants/villages";


const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbztG8z0ob1ULpzkYXIIbaV1PokdR_dO4qj7TSD0rnwz8qb77QlJNrUQM0DHwNwXFC_reQ/exec";

const initialForm = {
  currentProvider: "",
  nik: "",
  namaLengkap: "",
  kecamatan: "GUMELAR",
  desa: "",
  rw: "",
  rt: "",
  alamat: "",
  noHp: "",
  paket: "GUYUB_1 (20 Mbps) - Rp 115.000/Bln",
  tanggalPasang: "",
  bisaGoogleMaps: "",
  linkGoogleMaps: "",
  prioritas: "",
  prioritasLain: "",
  sumberInfo: "",
  fotoKtp: "",
  catatan: "",
};

// constants are now imported


export const RegistrationForm: React.FC<{ setSubmitted: (data: { name: string; desa: string }) => void; setShowAdminModal: (v: boolean) => void }> = ({ setSubmitted, setShowAdminModal }) => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [coverageWarning, setCoverageWarning] = useState("");

  const [isVillageDropdownOpen, setIsVillageDropdownOpen] = useState(false);
  const [isNoticeAccepted, setIsNoticeAccepted] = useState(false);
  const [showEthicModal, setShowEthicModal]     = useState(false); // ETIKA & SILATURAHMI
  const [isScanningKtp, setIsScanningKtp] = useState(false);
  const [ocrSuccessMessage, setOcrSuccessMessage] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isSelectedCovered = form.desa ? COVERED_VILLAGES.includes(form.desa) : false;

  const progress = Math.round((["currentProvider", "namaLengkap", "desa", "alamat", "noHp", "paket", "sumberInfo"].filter(f => form[f as keyof typeof form]).length / 7) * 100);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsVillageDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-advance helper - scroll to next section smoothly
  const scrollTo = (id: string) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        // Add highlight effect for visual feedback
        el.classList.add("ring-4", "ring-[#F47920]/20");
        setTimeout(() => el.classList.remove("ring-4", "ring-[#F47920]/20"), 1500);
      }
    }, 300);
  };
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleKtpFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Target output: 600x380px = rasio 1.578:1 (sama persis dengan grid PDF 60mm x 38mm)
    const TARGET_W = 600;
    const TARGET_H = 380;
    const TARGET_RATIO = TARGET_W / TARGET_H; // 1.578...

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new globalThis.Image();
      img.onload = () => {
        const srcRatio = img.width / img.height;

        // Hitung area sumber (crop center) agar rasionya cocok
        let srcX = 0, srcY = 0, srcW = img.width, srcH = img.height;
        if (srcRatio > TARGET_RATIO) {
          // Foto terlalu lebar → crop kiri & kanan
          srcW = img.height * TARGET_RATIO;
          srcX = (img.width - srcW) / 2;
        } else {
          // Foto terlalu tinggi → crop atas & bawah
          srcH = img.width / TARGET_RATIO;
          srcY = (img.height - srcH) / 2;
        }

        const canvas = document.createElement('canvas');
        canvas.width = TARGET_W;
        canvas.height = TARGET_H;
        const ctx = canvas.getContext('2d')!;

        // Latar putih sebelum draw (antisipasi foto PNG transparan)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, TARGET_W, TARGET_H);

        // Gambar dengan center-crop ke TARGET_W x TARGET_H
        ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, TARGET_W, TARGET_H);

        // JPEG quality 0.75 — cukup tajam untuk teks KTP, ukuran tetap kecil
        const compressed = canvas.toDataURL('image/jpeg', 0.75);
        console.log(`📷 KTP auto-crop: ${img.width}x${img.height} → ${TARGET_W}x${TARGET_H} (${(compressed.length/1024).toFixed(0)}KB)`);

        setForm(prev => ({ ...prev, fotoKtp: compressed }));
        setError("");
        handleKtpOcr(compressed);
      };
      img.src = evt.target?.result as string;
    };
    reader.readAsDataURL(file);
  };
  const handleKtpOcr = async (imageSrc: string) => {
    setIsScanningKtp(true);
    setOcrSuccessMessage("");
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("ind");
      
      const ret = await worker.recognize(imageSrc);
      const text = ret.data.text;
      await worker.terminate();

      console.log("📝 OCR Text Result:\n", text);

      const parsedData = parseKTPText(text);
      console.log("🧩 Parsed KTP Data:\n", parsedData);

      setForm(prev => {
        const updated = { ...prev };
        if (parsedData.nik) updated.nik = parsedData.nik;
        if (parsedData.nama) updated.namaLengkap = parsedData.nama;
        if (parsedData.alamat) updated.alamat = parsedData.alamat;
        if (parsedData.desa) {
          updated.desa = parsedData.desa;
          updated.rw = "";
          updated.rt = "";
        }
        if (parsedData.rw) updated.rw = parsedData.rw;
        if (parsedData.rt) updated.rt = parsedData.rt;
        return updated;
      });

      if (parsedData.nik || parsedData.nama || parsedData.alamat || parsedData.desa || parsedData.rt || parsedData.rw) {
        setOcrSuccessMessage("✓ KTP berhasil dipindai! Beberapa kolom formulir telah diisi otomatis. Mohon periksa kembali data Anda.");
      } else {
        setOcrSuccessMessage("⚠️ KTP terunggah, namun sistem kesulitan membaca tulisan secara otomatis. Silakan isi data secara manual.");
      }
    } catch (err) {
      console.error("❌ OCR Error:", err);
    } finally {
      setIsScanningKtp(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    // Reset RW/RT when desa changes
    if (name === "desa") {
      setForm(prev => ({ ...prev, desa: value, rw: "", rt: "" }));
    } else if (name === "rw") {
      setForm(prev => ({ ...prev, rw: value, rt: "" }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    setError("");

    if (name === "desa") {
      if (value && !COVERED_VILLAGES.includes(value)) {
        setCoverageWarning("mohon maaf desa anda belum terkafer oleh jaringan kami. mohon menunggu");
      } else {
        setCoverageWarning("");
      }
    }

    // Auto-advance flow based on filled fields (Hanya untuk Radio Buttons/Pilihan, bukan input teks)
    if (name === "currentProvider") {
      if (value === "Internet Lokal (RT/RW NET)") {
        setShowEthicModal(true); // tampilkan modal etika
      } else {
        scrollTo("sec-datadiri");
        // Auto-focus first field in data diri section
        setTimeout(() => {
          const namaInput = document.querySelector('input[name="namaLengkap"]') as HTMLInputElement;
          namaInput?.focus();
        }, 500);
      }
    }
    else if (name === "paket") {
      scrollTo("sec-lokasi");
    }
    else if (name === "desa") {
      scrollTo("sec-rwrt");
    }
    else if (name === "rt") {
      scrollTo("inp-alamat");
      setTimeout(() => {
        const alamatInput = document.querySelector('textarea[name="alamat"]') as HTMLTextAreaElement;
        alamatInput?.focus();
      }, 500);
    }
    else if (name === "tanggalPasang") {
      scrollTo("sec-lokasi");
      // Auto-advance to lokasi section
      setTimeout(() => {
        const mapsInput = document.querySelector('input[name="linkGoogleMaps"]') as HTMLInputElement;
        mapsInput?.focus();
      }, 500);
    }
    else if (name === "linkGoogleMaps") {
      setTimeout(() => {
        document.getElementById("sec-sumber")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
    else if (name === "sumberInfo") {
      scrollTo("sec-notice-block");
      // Auto-scroll to notice section
    }
  };

  const handlePackageSelect = (pkgLabel: string, pkgSpeed: string, pkgPrice: string) => {
    setForm(p => ({ ...p, paket: `${pkgLabel} (${pkgSpeed}) - Rp ${pkgPrice}/Bln` }));
    setTimeout(() => {
      document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.currentProvider || !form.nik || !form.namaLengkap || !form.kecamatan || !form.desa || !form.alamat || !form.noHp || !form.paket || !form.fotoKtp) {
      setError("Mohon lengkapi semua field yang wajib diisi (*), termasuk mengunggah foto KTP.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    // Validasi RW/RT jika desa memiliki data RW
    const desaHasRwRt = DESA_RW_RT[form.desa] && Object.keys(DESA_RW_RT[form.desa]).length > 0;
    if (desaHasRwRt && (!form.rw || !form.rt)) {
      setError("Mohon pilih RW dan RT tempat tinggal Anda.");
      document.getElementById("sec-rwrt")?.scrollIntoView({ behavior: "smooth", block: "center" });
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
    const timestampStr = new Date().toLocaleString("id-ID");
    
    let finalKtpUrl = "";
    if (form.fotoKtp) {
      try {
        // Convert base64 data URL to Blob
        const response = await fetch(form.fotoKtp);
        const blob = await response.blob();
        
        // Generate a unique filename using timestamp and name (sluggified)
        const cleanName = form.namaLengkap.trim().toUpperCase().replace(/[^A-Z0-9]/g, "_");
        const timestamp = Math.floor(Date.now() / 1000); // Shorter timestamp
        const fileName = `KTP_${cleanName}_${timestamp}.jpg`;
        
        finalKtpUrl = await api.uploadKtp(blob, fileName);
        console.log("📸 KTP successfully uploaded to Storage:", finalKtpUrl);
      } catch (uploadErr: any) {
        console.warn("⚠️ Gagal mengunggah foto KTP ke Storage, beralih ke mode Base64 fallback:", uploadErr);
        finalKtpUrl = form.fotoKtp;
      }
    }
    
    const newRecord = {
      timestamp: timestampStr,
      nik: form.nik,
      nama_lengkap: form.namaLengkap,
      no_hp_wa: form.noHp,
      alamat_pemasangan: form.alamat,
      kecamatan: form.kecamatan,
      desa: form.desa,
      rw: form.rw,
      rt: form.rt,
      paket: form.paket,
      "status": "PENGAJUAN",
      provider_saat_ini: form.currentProvider || "Belum Pernah Pasang",
      sumber_info: form.sumberInfo || "Rekomendasi Teman",
      link_google_maps: form.linkGoogleMaps || "",
      foto_ktp: finalKtpUrl || "",
      persetujuan_sk: "SETUJU (Sudah Dibaca & Disetujui)",
      catatan: form.catatan || "",
      tanggal_rencana_pasang: form.tanggalPasang || "",
      tanggal_aktif: ""
    };

    try {
      // 1. Simpan ke database Backend
      await api.insertRegistration(newRecord);

      // 2. Backup ke localData untuk indikator lokal
      const localData = JSON.parse(localStorage.getItem('adminData') || '[]');
      const newEntry = {
        id: localData.length + 1,
        timestamp: timestampStr,
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
        prioritas: form.prioritas === "lain" ? form.prioritasLain : form.prioritas,
        sumber: form.sumberInfo,
        fotoKtp: finalKtpUrl,
        catatan: form.catatan
      };
      localStorage.setItem('adminData', JSON.stringify([newEntry, ...localData]));

      // 3. Backup sekunder ke Google Sheets secara asinkron (fire-and-forget)
      const payload = new URLSearchParams();
      Object.entries(newRecord).forEach(([key, val]) => {
        payload.append(key, val);
      });
      fetch(GOOGLE_SCRIPT_URL, { method: "POST", body: payload, mode: "no-cors" }).catch(() => {});

      setSubmitted({ name: form.namaLengkap, desa: form.desa });
      window.scrollTo(0, 0);
    } catch (err: any) {
      console.error("Gagal mengirim ke Supabase:", err);
      setError(`Gagal menyimpan data: ${err.message || "Koneksi gagal. Silakan coba lagi."}`);
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
                <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">Prinsip Harmoni ARMEDIA.ID</p>
                <h2 className="text-white font-black text-xl leading-tight">ETIKA & SILATURAHMI</h2>
              </div>
            </div>

            {/* Body card */}
            <div className="bg-white rounded-3xl p-6 space-y-5 shadow-2xl">
              <p className="text-slate-700 text-sm font-medium leading-relaxed">
                Terima kasih atas ketertarikan Anda terhadap layanan kami. Kami melihat bahwa saat ini Anda telah didukung oleh{" "}
                <strong className="text-[#0d1655] underline">layanan RT/RW Net setempat atau Layanan Internet Komunitas.</strong>
              </p>

              <div className="border-l-4 border-[#F47920] pl-4 bg-orange-50/60 py-3 rounded-r-2xl">
                <p className="text-slate-600 text-sm italic leading-relaxed">
                  Sebagai penyedia layanan yang menjunjung tinggi etika bisnis dan kearifan lokal, kami sangat menghargai kontribusi para pengelola RT/RW Net dalam membangun akses internet di lingkungan Anda. Oleh karena itu, demi menjaga silaturahmi dan kenyamanan bersama, kami menyarankan Anda untuk berkonsultasi terlebih dahulu dengan pengelola RT/RW Net setempat.
                </p>
              </div>

              <p className="text-slate-700 text-sm leading-relaxed">
                Kehadiran kami bertujuan untuk <strong className="underline">berkolaborasi dan melengkapi kebutuhan</strong>, bukan untuk mengganggu harmoni yang telah terbangun dengan baik di lingkungan Anda.
              </p>

              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black leading-relaxed">
                Apabila di kemudian hari terdapat kebutuhan khusus yang memerlukan sinergi dengan layanan kami, kami selalu terbuka untuk berdiskusi demi kepentingan semua pihak.
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
            <div className="text-[#FDB913] font-black text-2xl sm:text-4xl tracking-tight leading-none group-hover:text-white transition-colors">ARMEDIA<span className="text-white">.ID</span></div>
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

          <div className="bg-[#1a2d8f] p-8 md:p-12 text-white relative flex flex-col justify-center items-start overflow-hidden">
            {/* Soft modern ambient lighting */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-orange-500/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/30 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="absolute top-0 right-0 p-8 opacity-10"><LogoMark /></div>
            
            <span className="bg-[#F47920] text-white text-[9px] font-black uppercase tracking-[0.25em] px-3.5 py-1 rounded-full mb-3 shadow-md shadow-orange-500/10 border border-orange-400/20">
              Registrasi Online
            </span>
            <h2 className="font-black text-3xl sm:text-5xl tracking-tight italic bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent uppercase drop-shadow-sm leading-none">
              FORMULIR REGISTRASI
            </h2>
            <p className="text-[#FDB913] text-[11px] sm:text-xs font-black uppercase tracking-[0.15em] mt-3.5 leading-relaxed border-l-4 border-[#F47920] pl-3">
              Lengkapi data untuk pemasangan internet unlimited
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="p-6 md:p-12 flex flex-col gap-8 md:gap-10">
            {error && (
              <div className="bg-red-50 text-red-600 p-5 rounded-2xl text-sm font-black flex items-center gap-3 border-2 border-red-100 animate-pulse">
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Indikator Paket Terpilih */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] sm:text-xs font-black text-blue-800 uppercase tracking-widest mb-1">Paket Terpilih (Kapasitas MB)</p>
                <p className="text-sm sm:text-base font-black text-slate-800">{form.paket || "Belum ada paket yang dipilih"}</p>
              </div>
              <button 
                type="button" 
                onClick={() => document.getElementById('sec-paket')?.scrollIntoView({ behavior: 'smooth' })} 
                className="text-xs font-black bg-white border-2 border-blue-200 text-blue-700 px-3 py-2 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors shadow-sm whitespace-nowrap"
              >
                Ubah
              </button>
            </div>

            <Section title="APAKAH SAAT INI ANDA SUDAH LANGGANAN INTERNET?" icon="📡" required>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["Internet Lokal (RT/RW NET)", "ISP Besar (Indihome, Biznet, dll)", "Belum Pernah Pasang"].map(opt => (
                  <RadioCard key={opt} name="currentProvider" value={opt} checked={form.currentProvider === opt} onChange={handleChange} label={<span className="text-sm font-black text-slate-700 tracking-tight">{opt}</span>} />
                ))}
              </div>
            </Section>

            <Section id="sec-datadiri" title="Informasi Pemasangan" icon="👤">
              <div className="grid grid-cols-1 gap-6 md:gap-8">
                <InputField label="Nomor Induk Kependudukan (NIK)" name="nik" value={form.nik} onChange={handleChange} placeholder="16 Digit NIK" required />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <InputField label="Nama Lengkap Sesuai KTP" name="namaLengkap" value={form.namaLengkap} onChange={handleChange} placeholder="Contoh: Budi Santoso" required />
                  <InputField label="Nomor WhatsApp Aktif" name="noHp" value={form.noHp} onChange={handleChange} placeholder="08123456789" required type="tel" />
                </div>

                <div className="w-full relative" ref={dropdownRef}>
                  <label className="block text-[11px] sm:text-xs font-black text-black uppercase tracking-widest mb-3 ml-1">
                    Pilih Desa Domisili <span className="text-red-500">*</span>
                  </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsVillageDropdownOpen(!isVillageDropdownOpen);
                        }}
                        className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 text-sm font-black uppercase tracking-wide transition-all text-left ${
                          isVillageDropdownOpen
                            ? form.desa
                              ? isSelectedCovered
                                ? 'border-emerald-500 bg-white ring-4 ring-emerald-500/10'
                                : 'border-amber-500 bg-white ring-4 ring-amber-500/10'
                              : 'border-[#F47920] bg-white ring-4 ring-orange-500/10'
                            : form.desa
                              ? isSelectedCovered
                                ? 'border-emerald-400 bg-emerald-50/60 text-emerald-950 shadow-sm shadow-emerald-100/50'
                                : 'border-amber-400 bg-amber-50/60 text-amber-950 shadow-sm shadow-amber-100/50'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className={
                          form.desa
                            ? isSelectedCovered
                              ? "text-emerald-800 font-black"
                              : "text-amber-800 font-black"
                            : "text-slate-400 font-bold"
                        }>
                          {form.desa ? `DESA ${form.desa}` : "— SILAKAN PILIH DESA —"}
                        </span>
                        <ChevronDown size={18} className={`transition-transform duration-300 ${
                          isVillageDropdownOpen ? 'rotate-180' : ''
                        } ${
                          form.desa
                            ? isSelectedCovered
                              ? 'text-emerald-500'
                              : 'text-amber-500'
                            : 'text-slate-400'
                        }`} />
                      </button>

                      {isVillageDropdownOpen && (
                        <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] border border-slate-100 z-50 p-1.5 max-h-[250px] overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-250">
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
                                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all mb-0.5 text-left border ${
                                  isSelected
                                    ? isCovered
                                      ? 'bg-emerald-50 border-emerald-500/20 text-emerald-950 font-black'
                                      : 'bg-amber-50 border-amber-500/20 text-amber-950 font-black'
                                    : 'border-transparent text-slate-700'
                                } ${
                                  isCovered
                                    ? 'hover:bg-emerald-50/50 hover:text-emerald-800'
                                    : 'hover:bg-amber-50/50 hover:text-amber-800'
                                }`}
                              >
                                <span className={`text-xs font-black tracking-tight ${
                                  isSelected
                                    ? isCovered ? 'text-emerald-700' : 'text-amber-700'
                                    : 'text-slate-700 font-bold'
                                }`}>
                                  {v}
                                </span>
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border transition-all ${
                                  isCovered
                                    ? isSelected
                                      ? 'bg-emerald-500 text-white border-emerald-600'
                                      : 'bg-emerald-50 text-emerald-700 border-emerald-100/50'
                                    : isSelected
                                      ? 'bg-amber-500 text-white border-amber-600'
                                      : 'bg-amber-50 text-amber-700 border-amber-100/50'
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
                          Jaringan ARMEDIA.ID belum aktif di <span className="font-black text-orange-900 underline decoration-orange-300 decoration-2">{form.desa}</span>.
                          Silakan <span className="font-black text-orange-900">LANJUTKAN</span> pendaftaran Anda agar kami mencatat permintaan di wilayah ini.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── CASCADING: RW & RT (muncul setelah pilih desa) ── */}
                {form.desa && DESA_RW_RT[form.desa] && Object.keys(DESA_RW_RT[form.desa]).length > 0 && (
                  <div id="sec-rwrt" className="grid grid-cols-1 md:grid-cols-2 gap-5 scroll-mt-24">
                    {/* RW */}
                    <div className="w-full">
                      <label className="block text-[11px] sm:text-xs font-black text-black uppercase tracking-widest mb-3 ml-1">
                        Pilih RW <span className="text-red-500">*</span>
                        <span className="ml-2 text-[#F47920] font-black">{form.desa}</span>
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                        {Object.keys(DESA_RW_RT[form.desa]).map((rw) => (
                          <button
                            key={rw}
                            type="button"
                            onClick={() => handleChange({ target: { name: "rw", value: rw } })}
                            className={`py-3 px-1 sm:px-2 rounded-2xl text-[11px] sm:text-xs font-black uppercase tracking-tight transition-all border-2 text-center ${
                              form.rw === rw
                                ? "bg-[#0d1655] text-white border-[#0d1655] shadow-lg shadow-blue-900/20 scale-105"
                                : "bg-blue-50/50 text-[#0d1655] border-blue-200/60 hover:border-[#0d1655] hover:bg-blue-50"
                            }`}
                          >
                            {rw}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* RT — muncul setelah RW dipilih */}
                    {form.rw && DESA_RW_RT[form.desa][form.rw] && (
                      <div className="w-full">
                        <label className="block text-[11px] sm:text-xs font-black text-black uppercase tracking-widest mb-3 ml-1">
                          Pilih RT <span className="text-red-500">*</span>
                          <span className="ml-2 text-[#F47920] font-black">{form.rw}</span>
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                          {DESA_RW_RT[form.desa][form.rw].map((rt) => (
                            <button
                              key={rt}
                              type="button"
                              onClick={() => handleChange({ target: { name: "rt", value: rt } })}
                              className={`py-3 px-1 sm:px-2 rounded-2xl text-[11px] sm:text-xs font-black uppercase tracking-tight transition-all border-2 text-center ${
                                form.rt === rt
                                  ? "bg-[#F47920] text-white border-[#F47920] shadow-lg shadow-orange-500/20 scale-105"
                                  : "bg-orange-50/50 text-[#F47920] border-orange-200/60 hover:border-[#F47920] hover:bg-orange-50"
                              }`}
                            >
                              {rt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div id="inp-alamat" className="w-full">
                  <InputField label="Alamat Lengkap" name="alamat" value={form.alamat} onChange={handleChange} placeholder="Nama jalan, nomor rumah, gang..." required textarea />
                </div>

                <div className="w-full">
                  <label className="block text-[11px] sm:text-xs font-black text-black uppercase tracking-widest mb-3 ml-1">
                    Upload Foto KTP <span className="text-red-500">*</span>
                  </label>
                  
                  {!form.fotoKtp ? (
                    <div className="grid grid-cols-2 gap-4 w-full h-44">
                      <input type="file" accept="image/*" capture="environment" onChange={handleKtpFileChange} ref={cameraInputRef} className="hidden" />
                      <input type="file" accept="image/*" onChange={handleKtpFileChange} ref={galleryInputRef} className="hidden" />
                      
                      <button type="button" onClick={() => cameraInputRef.current?.click()} className="flex flex-col items-center justify-center h-full border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50 hover:bg-orange-50/10 hover:border-[#F47920] transition-all duration-300">
                        <Camera className="w-8 h-8 text-slate-400 mb-2" />
                        <span className="text-xs font-black uppercase text-[#1a2d8f]">Kamera</span>
                        <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">Ambil Langsung</span>
                      </button>
                      
                      <button type="button" onClick={() => galleryInputRef.current?.click()} className="flex flex-col items-center justify-center h-full border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50 hover:bg-orange-50/10 hover:border-[#F47920] transition-all duration-300">
                        <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                        <span className="text-xs font-black uppercase text-[#1a2d8f]">Galeri</span>
                        <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">Pilih File</span>
                      </button>
                    </div>
                  ) : (
                    <div className="relative w-full h-44 rounded-[2rem] border-2 border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center group shadow-inner">
                      <img 
                        src={form.fotoKtp} 
                        alt="Preview KTP" 
                        className="w-full h-full object-contain"
                      />
                      {isScanningKtp && (
                        <div className="absolute inset-0 bg-[#0d1655]/60 flex flex-col items-center justify-center text-white z-10 backdrop-blur-[2px]">
                          <style>{`
                            @keyframes scan {
                              0% { top: 0%; }
                              50% { top: 100%; }
                              100% { top: 0%; }
                            }
                          `}</style>
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_10px_#F47920]"></div>
                          <RefreshCw className="animate-spin w-8 h-8 text-orange-400 mb-2" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-center px-4">Memindai KTP...</p>
                          <p className="text-[8px] font-bold text-slate-300 mt-1 uppercase tracking-tighter">Membaca data secara otomatis</p>
                        </div>
                      )}
                      {!isScanningKtp && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              setForm(prev => ({ ...prev, fotoKtp: "" }));
                              setOcrSuccessMessage("");
                            }}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                            Hapus Foto
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {ocrSuccessMessage && (
                    <div className={`mt-4 p-4 rounded-2xl text-[11px] font-black border flex items-start gap-2.5 ${
                      ocrSuccessMessage.startsWith("✓")
                        ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                        : "bg-amber-50 border-amber-100 text-amber-800"
                    }`}>
                      <span className="text-sm shrink-0">{ocrSuccessMessage.startsWith("✓") ? "❇️" : "⚠️"}</span>
                      <p className="leading-normal">{ocrSuccessMessage}</p>
                    </div>
                  )}
                </div>
              </div>
            </Section>

            {/* Hiden dulu sesuai request: Pilih Tanggal Pemasangan */}
            {/* 
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
            */}

            <Section id="sec-lokasi" title="Detail Tambahan" icon="📍">
              <div className="grid grid-cols-1 gap-8 md:gap-10">
                <InputField label="Link Google Maps (Opsional)" name="linkGoogleMaps" value={form.linkGoogleMaps} onChange={handleChange} placeholder="https://maps.app.goo.gl/..." type="url" />
              </div>
            </Section>

            <Section id="sec-sumber" title="Tahu Kami Dari Mana? (Opsional)" icon="🔍">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Media Sosial", "Teman/Tetangga", "Spanduk/Banner", "Sales/Petugas"].map(opt => (
                  <RadioCard key={opt} name="sumberInfo" value={opt} checked={form.sumberInfo === opt} onChange={handleChange} label={<span className="text-[11px] md:text-xs font-black text-slate-700 tracking-tight">{opt}</span>} />
                ))}
              </div>
            </Section>

            <Section id="sec-catatan" title="Catatan Tambahan / Pesan Khusus (Opsional)" icon="📝">
              <div className="w-full">
                <label className="block text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                  Ada pesan khusus untuk tim teknis kami? (Misal: rute kabel, jam pemasangan, atau kerabat)
                </label>
                <textarea
                  name="catatan"
                  value={form.catatan}
                  onChange={handleChange}
                  placeholder="Tulis pesan atau catatan evaluasi Anda di sini... (Contoh: Mohon penarikan kabel lewat pagar belakang rumah, atau hubungi no WA jika belum aktif)"
                  rows={4}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-[1.5rem] font-bold text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#F47920] focus:ring-4 focus:ring-orange-500/10 transition-all outline-none resize-none shadow-inner"
                />
              </div>
            </Section>

            <div id="sec-notice-block" className="scroll-mt-24">
              <SubscriberNotice
                isAccepted={isNoticeAccepted}
                onAcceptChange={setIsNoticeAccepted}
                selectedPackage={form.paket}
              />
            </div>

            <div id="sec-submit" className="pt-2">
              <button type="submit" disabled={loading || !isNoticeAccepted} className="w-full relative group">
                {isNoticeAccepted && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#F47920] to-orange-600 rounded-[2rem] blur opacity-40 group-hover:opacity-100 transition duration-500"></div>
                )}
                <div className={`relative w-full text-white font-black text-xl py-6 md:py-8 rounded-[2rem] transition-all flex items-center justify-center gap-4 uppercase tracking-widest ${
                  isNoticeAccepted
                    ? "bg-gradient-to-r from-[#F47920] to-orange-500 shadow-2xl hover:shadow-orange-200/50 active:scale-[0.98]"
                    : "bg-slate-300 shadow-inner cursor-not-allowed text-slate-500"
                }`}>
                  {loading ? <RefreshCw className="animate-spin w-6 h-6 md:w-8 md:h-8" /> : (
                    <>
                      {isNoticeAccepted ? "🚀 Kirim Pendaftaran" : "🔒 Kunci Dibuka Jika Setuju"}
                    </>
                  )}
                </div>
              </button>
              <p className="text-center text-slate-400 text-[10px] md:text-xs font-bold mt-6 uppercase tracking-widest">Data Anda aman dan hanya digunakan untuk proses instalasi</p>
            </div>
          </form>
        </div>

        <footer className="mt-12 text-center text-white/30 text-[10px] font-black uppercase tracking-[0.3em] space-y-4">
          <p>PT. Akses Artha Media • Jakarta • Indonesia</p>
          <button onClick={() => setShowAdminModal(true)} className="hover:text-[#F47920] transition-colors cursor-default">© {new Date().getFullYear()} ARMEDIA.ID</button>
        </footer>
      </main>
      
      {/* FOMO Widgets & Floating WhatsApp CS */}
      <FomoNotifications />
      <FloatingWhatsAppButton />
    </div>
  );
};