// Last update: 2026-05-18 23:05 - Integrated Official WhatsApp SVG Logo
import React from "react";
import * as Lucide from "lucide-react";

interface SuccessPageProps {
  userName: string;
  userDesa: string;
  onBack: () => void;
}

export const SuccessPage: React.FC<SuccessPageProps> = ({ userName, userDesa, onBack }) => {
  const WHATSAPP_NUMBER = "6289646415444"; // Kode Internasional Indonesia (62) murni tanpa angka 0

  // Template Otomatisasi Pesan Konfirmasi CS Armedia
  const messageTemplate = encodeURIComponent(
    `Halo CS ARMEDIA,\n\nSaya telah melakukan pengisian formulir pendaftaran pemasangan internet baru secara online.\n\n*Detail Registrasi:*\n• Nama: ${userName}\n• Domisili Desa: ${userDesa}\n\nMohon dibantu konfirmasi untuk jadwal survei lokasi dan instalasi perangkat teknisi lapangan. Terima kasih!`
  );

  const handleWhatsAppRedirect = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${messageTemplate}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#f4f7fe] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 w-full max-w-md shadow-xl text-center border border-slate-100 space-y-6 animate-in fade-in zoom-in-95 duration-200">

        {/* ANIMATED SUCCESS INDIKATOR */}
        <div className="w-20 h-20 bg-emerald-50 border-2 border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Lucide.CheckCircle2 size={44} strokeWidth={2.5} className="animate-bounce" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-[#0d1655] uppercase tracking-tight">Registrasi Berhasil!</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Data Terkirim Aman ke Server Pusat</p>
        </div>

        {/* RINGKASAN PROFIL PELANGGAN */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold uppercase">Nama Pendaftar:</span>
            <span className="text-[#0d1655] font-black">{userName}</span>
          </div>
          <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-2.5">
            <span className="text-slate-400 font-bold uppercase">Zona Wilayah:</span>
            <span className="text-[#F47920] font-black uppercase">Desa {userDesa}</span>
          </div>
        </div>

        {/* REVISI UTAMA: TOMBOL DIREKSI CS DENGAN LOGO RESMI WHATSAPP */}
        <button
          type="button"
          onClick={handleWhatsAppRedirect}
          className="w-full py-4.5 bg-[#25D366] hover:bg-[#128C7E] text-white font-black rounded-2xl shadow-lg shadow-[#25D366]/30 transition-all active:scale-[0.98] uppercase tracking-widest text-xs flex items-center justify-center gap-3 group"
        >
          {/* VEKTOR LOGO ASLI OFFICIAL WHATSAPP */}
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 fill-white transition-transform group-hover:scale-110 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.454 5.709 1.455h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span>Konfirmasi Via WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full py-3.5 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-500 font-black rounded-xl text-[10px] uppercase tracking-widest transition-all"
        >
          Kembali ke Beranda Form
        </button>

      </div>
    </div>
  );
};