import { useState } from "react";

// ========================================================
// GOOGLE APPS SCRIPT WEB APP URL
// Ganti URL ini setelah Anda deploy Google Apps Script
// Tutorial: Lihat bagian bawah file ini
// ========================================================
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec";

const PACKAGES = [
  { label: "Hemat", speed: "Up to 20 Mbps", price: "115.000", color: "from-slate-100 to-slate-200", badge: "bg-slate-500" },
  { label: "Standar", speed: "Up to 30 Mbps", price: "142.000", color: "from-blue-50 to-blue-100", badge: "bg-blue-500" },
  { label: "Keluarga", speed: "Up to 50 Mbps", price: "182.000", color: "from-amber-50 to-amber-100", badge: "bg-amber-500", popular: true },
  { label: "Ekstra Cepat", speed: "Up to 75 Mbps", price: "260.000", color: "from-orange-50 to-orange-100", badge: "bg-orange-500" },
  { label: "Premium", speed: "Up to 100 Mbps", price: "330.000", color: "from-indigo-50 to-indigo-100", badge: "bg-indigo-700" },
];

type FormData = {
  currentProvider: string;
  namaLengkap: string;
  alamat: string;
  noHp: string;
  paket: string;
  tanggalPasang: string;
  bisaGoogleMaps: string;
  linkGoogleMaps: string;
  waktuSurvei: string;
  prioritas: string;
  prioritasLain: string;
  sumberInfo: string;
};

const initialForm: FormData = {
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

export default function App() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi wajib
    if (!form.currentProvider || !form.namaLengkap || !form.alamat || !form.noHp || !form.paket || !form.tanggalPasang || !form.sumberInfo) {
      setError("Mohon lengkapi semua field yang wajib diisi (*).");
      window.scrollTo({ top: 400, behavior: "smooth" });
      return;
    }

    setLoading(true);
    setError("");

    const payload = new FormData();
    payload.append("Timestamp", new Date().toLocaleString("id-ID"));
    payload.append("Provider Saat Ini", form.currentProvider);
    payload.append("Nama Lengkap", form.namaLengkap);
    payload.append("Alamat Pemasangan", form.alamat);
    payload.append("No HP / WA", form.noHp);
    payload.append("Paket", form.paket);
    payload.append("Tanggal Rencana Pasang", form.tanggalPasang);
    payload.append("Bisa Google Maps", form.bisaGoogleMaps);
    payload.append("Link Google Maps", form.linkGoogleMaps);
    payload.append("Waktu Survei", form.waktuSurvei);
    payload.append("Prioritas", form.prioritas === "lain" ? form.prioritasLain : form.prioritas);
    payload.append("Sumber Info", form.sumberInfo);

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: payload,
        mode: "no-cors",
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Terjadi kesalahan koneksi. Silakan coba lagi atau hubungi kami langsung.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return <SuccessPage onBack={() => { setSubmitted(false); setForm(initialForm); }} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1e6e] via-[#1a2d8f] to-[#0d1655] font-sans">
      {/* Hero Header */}
      <header className="relative overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[#F47920] opacity-10"></div>
          <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-[#FDB913] opacity-10"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 pt-8 pb-6">
          {/* Logo Area */}
          <div className="flex flex-col items-center gap-4 mb-6">
            {/* Logo SVG - inspired by the brand mark */}
            <div className="flex items-center gap-3">
              <LogoMark />
              <div>
                <div className="text-[#FDB913] font-black text-3xl sm:text-4xl tracking-wider leading-none">
                  ARMEDIA<span className="text-white">_NET</span>
                </div>
                <div className="text-white/70 text-xs tracking-[0.3em] uppercase mt-0.5">PT. Akses Artha Media</div>
              </div>
            </div>

            {/* Tagline */}
            <div className="text-center">
              <h1 className="text-white text-xl sm:text-2xl font-bold mt-2">
                SOLUSI INTERNET MURAH BERKUALITAS
              </h1>
              <p className="text-white/60 text-sm mt-1">
                Jl. Perserikatan no. 4D Rawamangun - Pulo Gadung - Jakarta Timur 13220
              </p>
              <p className="text-white/50 text-xs mt-0.5">
                Telp: 021-22472319 &nbsp;|&nbsp; Fax: 021-4897612 &nbsp;|&nbsp; www.aksesarmedia.id
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto mb-2">
            {[
              { icon: "⚡", label: "Kecepatan Tinggi", value: "Up to 100 Mbps" },
              { icon: "💰", label: "Mulai Dari", value: "115 Ribu/Bln" },
              { icon: "🛡️", label: "Jaringan", value: "Stabil & Handal" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="text-[#FDB913] font-bold text-xs sm:text-sm">{s.value}</div>
                <div className="text-white/60 text-[10px] sm:text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 pb-12">

        {/* Package Cards */}
        <section className="mb-8">
          <div className="text-center mb-4">
            <span className="inline-block bg-[#F47920] text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">Pilihan Paket</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.label}
                onClick={() => setForm((p) => ({ ...p, paket: `${pkg.label} (${pkg.speed}) - Rp ${pkg.price}/Bln` }))}
                className={`relative cursor-pointer rounded-2xl p-4 bg-gradient-to-b ${pkg.color} border-2 transition-all duration-200 ${
                  form.paket.startsWith(pkg.label)
                    ? "border-[#F47920] shadow-lg shadow-orange-200 scale-105"
                    : "border-transparent hover:border-orange-300 hover:scale-102"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#F47920] text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                    TERPOPULER
                  </div>
                )}
                <div className={`${pkg.badge} text-white text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-2`}>
                  {pkg.label}
                </div>
                <div className="text-[#1a2d8f] font-black text-lg leading-none">{pkg.speed.replace("Up to ", "")}</div>
                <div className="text-gray-500 text-[10px]">Up to</div>
                <div className="mt-2 border-t border-gray-200 pt-2">
                  <span className="text-[#F47920] font-black text-base">Rp {pkg.price}</span>
                  <span className="text-gray-500 text-[10px]">/Bln</span>
                </div>
                {form.paket.startsWith(pkg.label) && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-[#F47920] rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Registration Form */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-[#1a2d8f] to-[#0f1e6e] px-6 py-5">
            <h2 className="text-white font-bold text-xl">📋 Form Pendaftaran Internet Murah</h2>
            <p className="text-white/70 text-sm mt-1">Daftar sekarang dan dapatkan penawaran terbaik!</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-7">

            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-start gap-2">
                <span className="text-lg leading-none">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Section 1: Provider */}
            <Section title="Status Langganan Internet Saat Ini" icon="📡" required>
              <div className="grid gap-2">
                {[
                  "Internet Lokal, RT/RW NET / Internet Teman",
                  "ISP Corporate (Telkom, Bisnet, Tsel, CBN, Perusahaan lain, dll...)",
                  "Belum Berlangganan Internet",
                ].map((opt) => (
                  <RadioCard
                    key={opt}
                    name="currentProvider"
                    value={opt}
                    label={opt}
                    checked={form.currentProvider === opt}
                    onChange={handleChange}
                  />
                ))}
              </div>
            </Section>

            {/* Section 2: Personal Info */}
            <Section title="Data Diri Pendaftar" icon="👤">
              <div className="space-y-4">
                <InputField
                  label="Nama Lengkap Sesuai KTP"
                  name="namaLengkap"
                  value={form.namaLengkap}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap sesuai KTP"
                  required
                />
                <InputField
                  label="Alamat Pemasangan Sesuai KTP"
                  name="alamat"
                  value={form.alamat}
                  onChange={handleChange}
                  placeholder="Contoh: Jln Raya Gumelar, Desa Gumelar RT 04 / 05"
                  required
                  textarea
                />
                <InputField
                  label="No HP / WA yang Bisa Dihubungi"
                  name="noHp"
                  value={form.noHp}
                  onChange={handleChange}
                  placeholder="Contoh: 08123456789"
                  required
                  type="tel"
                />
              </div>
            </Section>

            {/* Section 3: Package */}
            <Section title="Pilihan Paket Internet" icon="📦" required>
              <div className="grid gap-2">
                {PACKAGES.map((pkg) => (
                  <RadioCard
                    key={pkg.label}
                    name="paket"
                    value={`${pkg.label} (${pkg.speed}) - Rp ${pkg.price}/Bln`}
                    label={
                      <span className="flex items-center justify-between w-full">
                        <span>
                          <span className="font-bold text-[#1a2d8f]">{pkg.label}</span>
                          <span className="text-gray-500 text-sm ml-2">({pkg.speed})</span>
                          {pkg.popular && <span className="ml-2 bg-[#F47920] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">POPULER</span>}
                        </span>
                        <span className="text-[#F47920] font-bold">Rp {pkg.price}<span className="text-gray-400 font-normal text-xs">/Bln</span></span>
                      </span>
                    }
                    checked={form.paket === `${pkg.label} (${pkg.speed}) - Rp ${pkg.price}/Bln`}
                    onChange={handleChange}
                  />
                ))}
              </div>
            </Section>

            {/* Section 4: Schedule */}
            <Section title="Jadwal Pemasangan" icon="📅">
              <div className="space-y-4">
                <InputField
                  label="Tanggal Rencana Pemasangan"
                  name="tanggalPasang"
                  value={form.tanggalPasang}
                  onChange={handleChange}
                  required
                  type="date"
                />
              </div>
            </Section>

            {/* Section 5: Google Maps */}
            <Section title="Lokasi & Google Maps" icon="📍">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Apakah Anda bisa mengakses Google Maps saat ini?
                  </label>
                  <div className="grid gap-2">
                    {["Ya Bisa", "Tidak! Kendala Sinyal Internet"].map((opt) => (
                      <RadioCard
                        key={opt}
                        name="bisaGoogleMaps"
                        value={opt}
                        label={opt}
                        checked={form.bisaGoogleMaps === opt}
                        onChange={handleChange}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Link Google Maps Lokasi Anda
                  </label>
                  <p className="text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded-lg p-2 mb-2">
                    💡 <strong>Cara:</strong> Buka Google Maps → Cari titik lokasi Anda → Klik tombol <strong>Bagikan (Share)</strong> → Pilih <strong>Salin Tautan (Copy Link)</strong> → Tempel di bawah ini.
                    <br /><em>(Boleh dikosongkan jika sedang terkendala sinyal)</em>
                  </p>
                  <InputField
                    label=""
                    name="linkGoogleMaps"
                    value={form.linkGoogleMaps}
                    onChange={handleChange}
                    placeholder="https://maps.google.com/..."
                    type="url"
                  />
                </div>
                <InputField
                  label="Waktu Terbaik untuk Survei Lokasi (Jika Diperlukan)"
                  name="waktuSurvei"
                  value={form.waktuSurvei}
                  onChange={handleChange}
                  placeholder="Contoh: Senin Sore Pkl 15.00 WIB"
                />
              </div>
            </Section>

            {/* Section 6: Priority */}
            <Section title="Seberapa Penting Faktor Harga vs Kualitas?" icon="⚖️">
              <div className="grid gap-2">
                {[
                  { value: "Harga Murah Paling Penting", label: "💰 Harga Murah Paling Penting" },
                  { value: "Kualitas Paling Penting", label: "🚀 Kualitas Paling Penting (Kecepatan & Stabilitas)" },
                  { value: "lain", label: "📝 Yang lain (tuliskan di bawah)" },
                ].map((opt) => (
                  <RadioCard
                    key={opt.value}
                    name="prioritas"
                    value={opt.value}
                    label={opt.label}
                    checked={form.prioritas === opt.value}
                    onChange={handleChange}
                  />
                ))}
                {form.prioritas === "lain" && (
                  <InputField
                    label=""
                    name="prioritasLain"
                    value={form.prioritasLain}
                    onChange={handleChange}
                    placeholder="Tuliskan pendapat Anda..."
                    textarea
                  />
                )}
              </div>
            </Section>

            {/* Section 7: Source */}
            <Section title="Darimana Anda Mengetahui Layanan Kami?" icon="🔍" required>
              <div className="grid gap-2">
                {[
                  "Iklan Media Sosial (Facebook/Instagram)",
                  "Rekomendasi Komunitas",
                  "Rekomendasi Ketua RT",
                  "Spanduk/Brosur",
                  "Media Lainnya",
                ].map((opt) => (
                  <RadioCard
                    key={opt}
                    name="sumberInfo"
                    value={opt}
                    label={opt}
                    checked={form.sumberInfo === opt}
                    onChange={handleChange}
                  />
                ))}
              </div>
            </Section>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#F47920] to-[#e06010] hover:from-[#e06010] hover:to-[#c94e00] text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-orange-200 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Mengirim Data...
                  </>
                ) : (
                  <>
                    🚀 DAFTAR SEKARANG — GRATIS!
                  </>
                )}
              </button>
              <p className="text-center text-gray-400 text-xs mt-3">
                Data Anda aman dan hanya digunakan untuk keperluan pemasangan layanan
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <footer className="text-center mt-8 text-white/50 text-xs space-y-1">
          <p className="font-semibold text-white/70">PT. AKSES ARTHA MEDIA</p>
          <p>Jl. Perserikatan no. 4D Rawamangun - Pulo Gadung - Jakarta Timur 13220</p>
          <p>Telp: 021-22472319 | Fax: 021-4897612 | www.aksesarmedia.id</p>
          <p className="pt-2">© {new Date().getFullYear()} ARMEDIA_NET. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}

// =============================================
// Sub Components
// =============================================

function LogoMark() {
  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      {/* Orbit ring */}
      <svg viewBox="0 0 56 56" className="absolute inset-0 w-full h-full">
        <ellipse cx="28" cy="28" rx="24" ry="13" fill="none" stroke="#7b8fd4" strokeWidth="3.5" opacity="0.7"
          transform="rotate(-40 28 28)" />
        {/* A shape */}
        <polygon points="28,8 42,44 14,44" fill="#F47920" />
        <polygon points="28,8 34,24 22,24" fill="#e06010" opacity="0.7" />
        {/* Inner triangle cutout */}
        <polygon points="28,30 35,44 21,44" fill="#1a2d8f" />
      </svg>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
  required,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <h3 className="font-bold text-[#1a2d8f] text-base">
          {title}
          {required && <span className="text-red-500 ml-1">*</span>}
        </h3>
      </div>
      <div className="pl-1">{children}</div>
    </div>
  );
}

function RadioCard({
  name,
  value,
  label,
  checked,
  onChange,
}: {
  name: string;
  value: string;
  label: React.ReactNode;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label
      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
        checked
          ? "border-[#F47920] bg-orange-50"
          : "border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50/50"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="accent-[#F47920] w-4 h-4 flex-shrink-0"
      />
      <span className={`text-sm w-full ${checked ? "text-[#1a2d8f] font-semibold" : "text-gray-700"}`}>
        {label}
      </span>
    </label>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  required,
  type = "text",
  textarea,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  textarea?: boolean;
}) {
  const baseClass =
    "w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#F47920] focus:ring-2 focus:ring-orange-100 transition-all placeholder-gray-400";

  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {textarea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={3}
          required={required}
          className={baseClass}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={baseClass}
        />
      )}
    </div>
  );
}

function SuccessPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1e6e] via-[#1a2d8f] to-[#0d1655] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-2xl font-black text-[#1a2d8f] mb-2">Pendaftaran Berhasil! 🎉</h2>
        <p className="text-gray-600 text-sm mb-6">
          Terima kasih telah mendaftar layanan <strong className="text-[#F47920]">ARMEDIA_NET</strong>!
          <br /><br />
          Tim teknis kami akan segera menghubungi Anda melalui nomor WhatsApp yang telah didaftarkan untuk konfirmasi dan jadwal pemasangan.
        </p>

        {/* Info boxes */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: "📞", text: "021-22472319", label: "Telpon Kami" },
            { icon: "🌐", text: "aksesarmedia.id", label: "Website" },
          ].map((item) => (
            <div key={item.label} className="bg-[#f0f4ff] rounded-xl p-3">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-[#1a2d8f] font-bold text-xs">{item.text}</div>
              <div className="text-gray-400 text-[10px]">{item.label}</div>
            </div>
          ))}
        </div>

        <button
          onClick={onBack}
          className="w-full bg-gradient-to-r from-[#1a2d8f] to-[#0f1e6e] text-white font-bold py-3 rounded-2xl hover:opacity-90 transition-opacity"
        >
          ← Kembali ke Formulir
        </button>
      </div>
    </div>
  );
}
