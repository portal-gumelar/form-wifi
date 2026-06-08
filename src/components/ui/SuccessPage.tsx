// Last update: 2026-05-18 23:05 - Integrated Official WhatsApp SVG Logo
import React, { useEffect, useState } from "react";
import * as Lucide from "lucide-react";

interface SuccessPageProps {
  data: any;
  onBack: () => void;
}

export const SuccessPage: React.FC<SuccessPageProps> = ({ data, onBack }) => {
  const WHATSAPP_NUMBER = "6289646415444"; // Kode Internasional Indonesia (62) murni tanpa angka 0
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Template Otomatisasi Pesan Konfirmasi CS Armedia
  const messageTemplate = encodeURIComponent(
    `Halo CS ARMEDIA,\n\nSaya telah melakukan pengisian formulir pendaftaran pemasangan internet baru secara online.\n\n*Detail Registrasi:*\n• NIK: ${data.nik || '-'}\n• Nama Lengkap: ${data.namaLengkap || '-'}\n• No WhatsApp: ${data.noHp || '-'}\n• Alamat Pemasangan: ${data.alamat || '-'}\n• RT/RW: ${data.rt || '-'} / ${data.rw || '-'}\n• Desa/Kecamatan: ${data.desa || '-'} / ${data.kecamatan || '-'}\n• Pilihan Paket: ${data.paket || '-'}\n• Provider Sebelumnya: ${data.currentProvider || 'Belum Ada'}\n• Rencana Tanggal Pasang: ${data.tanggalPasang || '-'}\n• Link Maps: ${data.linkGoogleMaps || '-'}\n• Catatan: ${data.catatan || '-'}\n\nMohon dibantu konfirmasi untuk jadwal survei lokasi dan instalasi perangkat teknisi lapangan. Terima kasih!`
  );

  const handleWhatsAppRedirect = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${messageTemplate}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1655]/5 via-[#f4f7fe] to-[#F47920]/5 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-orange-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-10 w-full max-w-md shadow-[0_20px_50px_rgba(13,22,85,0.1)] border border-white space-y-8 animate-in fade-in zoom-in-95 duration-500 text-center">

        {/* Glowing Success Icon */}
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 bg-emerald-400/30 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-2 bg-emerald-100 rounded-full animate-pulse" />
          <div className="relative w-full h-full bg-gradient-to-tr from-emerald-500 to-emerald-400 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Lucide.Check size={48} strokeWidth={3} className={`transition-transform duration-700 delay-200 ${mounted ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'}`} />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0d1655] uppercase tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#0d1655] to-blue-600">
            Registrasi Berhasil!
          </h2>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider flex items-center justify-center gap-2">
            <Lucide.ShieldCheck size={16} className="text-emerald-500" />
            Data Terkirim Aman
          </p>
        </div>

        {/* Ringkasan Profil Pelanggan */}
        <div className="bg-gradient-to-br from-slate-50 to-white p-5 rounded-2xl border border-slate-200 shadow-sm text-left space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400 font-bold uppercase tracking-wide">Nama Pendaftar</span>
            <span className="text-[#0d1655] font-black">{data?.namaLengkap || 'Pelanggan'}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-4">
            <span className="text-slate-400 font-bold uppercase tracking-wide">Zona Wilayah</span>
            <span className="text-[#F47920] font-black uppercase bg-orange-50 px-3 py-1 rounded-lg">Desa {data?.desa || '-'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 pt-2">
          <button
            type="button"
            onClick={handleWhatsAppRedirect}
            className="relative w-full py-4 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#1da851] hover:to-[#0f7669] text-white font-black rounded-2xl shadow-xl shadow-[#25D366]/30 transition-all active:scale-[0.98] uppercase tracking-widest text-xs flex items-center justify-center gap-3 group overflow-hidden"
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
            
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 fill-white transition-transform group-hover:scale-110 group-hover:rotate-12 shrink-0 relative z-10"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.454 5.709 1.455h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span className="relative z-10">Konfirmasi Via WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full py-4 bg-transparent hover:bg-slate-50 border-2 border-slate-200 text-slate-500 hover:text-slate-700 font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all hover:border-slate-300 active:scale-[0.98]"
          >
            Kembali ke Beranda Form
          </button>
        </div>
      </div>
      
      {/* Custom styles for shimmer effect */}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};