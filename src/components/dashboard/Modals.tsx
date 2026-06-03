// Last update: 2026-05-21 - Mobile Bottom Sheet, Radio Cards, Pill Status
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";
import { RegistrationData } from "../../types";
import { getCustomerNo, calculateProRata } from "../../utils/dashboardUtils";
import { api } from "../../utils/apiClient";
import { DESA_RW_RT, VILLAGES } from "../../constants/villages";

interface PDFPreviewModalProps {
  url: string | null;
  onClose: () => void;
  onDownload: () => void;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({ url, onClose, onDownload }) => (
  <AnimatePresence>
    {url && (
      <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-[3rem] w-full max-w-5xl h-[90vh] overflow-hidden shadow-2xl border flex flex-col"
        >
          <div className="bg-[#0d1655] p-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Lucide.FileText size={24} className="text-[#FDB913]" />
              <h2 className="text-xl font-black italic uppercase">PDF Report Preview</h2>
            </div>
            <div className="flex gap-4">
              <button
                onClick={onDownload}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#F47920] hover:bg-orange-600 rounded-xl transition-all text-xs font-black uppercase tracking-widest text-white shadow-md"
              >
                <Lucide.Download size={18} /> Download
              </button>
              <button onClick={onClose} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                <Lucide.X size={20} />
              </button>
            </div>
          </div>
          <div className="flex-1 bg-slate-100 p-4 flex flex-col items-center justify-center overflow-auto">
            <iframe 
              src={url} 
              className="hidden md:block w-full h-full rounded-2xl border-none shadow-inner bg-white" 
              title="PDF Preview"
            ></iframe>
            <div className="block md:hidden w-full h-full flex flex-col">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                    <Lucide.FileText size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-700">Pratinjau Laporan</p>
                    <p className="text-[10px] text-slate-400 font-medium">ARMEDIA.ID</p>
                  </div>
                </div>
                <button
                  onClick={onDownload}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#F47920] hover:bg-orange-600 rounded-xl transition-all text-xs font-black uppercase tracking-wide text-white shadow-md active:scale-95"
                >
                  <Lucide.Download size={16} /> Unduh
                </button>
              </div>
              <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <object 
                  data={url} 
                  type="application/pdf"
                  className="w-full h-full min-h-[60vh]"
                  title="PDF Preview Mobile"
                >
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
                      <Lucide.FileText size={32} />
                    </div>
                    <h3 className="text-base font-black text-slate-800 mb-2">Pratinjau Tidak Tersedia</h3>
                    <p className="text-xs text-slate-500 mb-4">Browser Anda tidak mendukung pratinjau PDF langsung.</p>
                    <button
                      onClick={onDownload}
                      className="flex items-center gap-2 px-6 py-3 bg-[#F47920] hover:bg-orange-600 rounded-xl transition-all text-sm font-black text-white shadow-lg active:scale-95"
                    >
                      <Lucide.Download size={18} /> Download PDF
                    </button>
                  </div>
                </object>
              </div>
              <div className="mt-4 text-center px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-[10px] text-blue-700 font-medium">
                  📱 Tip: Putar HP ke mode landscape untuk tampilan PDF lebih luas
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

interface DetailsModalProps {
  item: RegistrationData | null;
  isDarkMode: boolean;
  onClose: () => void;
}

export const DetailsModal: React.FC<DetailsModalProps> = ({ item, isDarkMode, onClose }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const proRata = item ? calculateProRata(item.tanggal_aktif || "", item.paket || "") : null;

  const handleCopyWa = () => {
    if (!item || !proRata) return;
    
    const rp = (num: number) => `Rp ${num.toLocaleString('id-ID')}`;
    const text = `*INFORMASI TAGIHAN BULAN PERTAMA (PRO-RATA)*\n\n` +
      `Halo Bapak/Ibu *${item.nama_lengkap}*,\n` +
      `Layanan internet ARMEDIA.ID Anda telah aktif.\n\n` +
      `*Rincian Aktivasi:*\n` +
      `- ID Pelanggan: ${getCustomerNo(item.timestamp)}\n` +
      `- Tanggal Aktif: ${new Date(item.tanggal_aktif!).toLocaleDateString('id-ID')}\n` +
      `- Paket Internet: ${item.paket?.replace(/\.(\d+\s*Mbps)/i, ' $1')}\n\n` +
      `*Tagihan Bulan Pertama (Pro-Rata):*\n` +
      `Karena internet Anda aktif pada tanggal ${proRata.day} ${proRata.monthName}, maka tagihan bulan pertama disesuaikan (Pro-Rata) untuk ${proRata.remainingDays} hari.\n` +
      `Total Tagihan: *${rp(proRata.proRataPrice)}*\n\n` +
      `*catatan:*\n` +
      `Untuk bulan berikutnya, tagihan akan kembali normal yaitu sebesar *${rp(proRata.normalPrice)}*/bulan.\n\n` +
      `Terima kasih telah mempercayakan layanan internet Anda kepada ARMEDIA.ID.`;
      
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
  <AnimatePresence>
    {item && (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
          className={`${isDarkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-white'} rounded-[3rem] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl border flex flex-col`}
        >
          {/* Header */}
          <div className="bg-[#0d1655] p-6 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20"><Lucide.User size={24} className="text-[#FDB913]" /></div>
              <div>
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">{getCustomerNo(item.timestamp)}</p>
                <h2 className="text-xl font-black italic">Detail Lengkap Pelanggan</h2>
              </div>
            </div>
            <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><Lucide.X size={20} /></button>
          </div>
          
          {/* Content - Scrollable */}
          <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
            {/* Info Pelanggan */}
            <div className="bg-gradient-to-br from-[#0d1655] to-[#1a2a7a] rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center font-black text-2xl text-white">
                  {item.nama_lengkap?.charAt(0) || "U"}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">{item.nama_lengkap}</h3>
                  <p className="text-slate-300 text-sm font-medium">{item.no_hp_wa}</p>
                </div>
              </div>
              {/* Status Badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${
                item.status === 'AKTIF' ? 'bg-emerald-500 text-white' :
                item.status === 'PROSES' ? 'bg-amber-500 text-white' :
                item.status === 'SURVEY' ? 'bg-blue-500 text-white' :
                item.status === 'PENGAJUAN' ? 'bg-slate-500 text-white' :
                'bg-red-500 text-white'
              }`}>
                {item.status}
              </div>
            </div>

            {/* Detail Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Paket */}
              <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-1.5">
                  <Lucide.Zap size={14} className="text-[#F47920]" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paket Internet</p>
                </div>
                <p className="font-black text-[#F47920] text-sm">{item.paket?.replace(/\.(\d+\s*Mbps)/i, ' $1') || "-"}</p>
              </div>

              {/* Provider Saat Ini */}
              <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-1.5">
                  <Lucide.Wifi size={14} className="text-blue-500" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Provider Saat Ini</p>
                </div>
                <p className="font-bold text-slate-700 text-sm">{item.provider_saat_ini || "Belum Pernah Pasang"}</p>
              </div>

              {/* Kecamatan & Desa */}
              <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-1.5">
                  <Lucide.MapPin size={14} className="text-emerald-500" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kecamatan & Desa</p>
                </div>
                <p className="font-bold text-slate-700 text-sm">{item.kecamatan || "GUMELAR"} / {item.desa || "-"}</p>
              </div>

              {/* Sumber Info */}
              <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-1.5">
                  <Lucide.Info size={14} className="text-purple-500" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sumber Info</p>
                </div>
                <p className="font-bold text-slate-700 text-sm">{item.sumber_info || "-"}</p>
              </div>

              {/* Tanggal Rencana Pasang */}
              <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-1.5">
                  <Lucide.Calendar size={14} className="text-amber-500" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rencana Pasang</p>
                </div>
                <p className="font-bold text-slate-700 text-sm">{item.tanggal_rencana_pasang || "Belum Dijadwalkan"}</p>
              </div>

              {/* NIK */}
              <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-1.5">
                  <Lucide.Fingerprint size={14} className="text-cyan-500" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NIK</p>
                </div>
                <p className="font-bold text-slate-700 text-sm">{item.nik || "-"}</p>
              </div>
            </div>

            {/* Alamat Pemasangan */}
            <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2 mb-2">
                <Lucide.Home size={14} className="text-[#0d1655]" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alamat Pemasangan</p>
              </div>
              <p className="font-bold text-slate-700 text-sm leading-relaxed">{item.alamat_pemasangan}</p>
            </div>

            {/* Timestamp */}
            <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2 mb-1.5">
                <Lucide.History size={14} className="text-slate-400" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu Pendaftaran</p>
              </div>
              <p className="font-bold text-slate-500 text-sm">{item.timestamp}</p>
            </div>

            {/* Persetujuan */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-1.5">
                <Lucide.CheckCircle size={14} className="text-emerald-500" />
                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Persetujuan S&K</p>
              </div>
              <p className="font-bold text-emerald-800 text-sm">{item.persetujuan_sk || "SETUJU"}</p>
            </div>

            {/* Pro-Rata Table (Bulan Pertama) */}
            {item.status === "AKTIF" && item.tanggal_aktif && proRata && (
              <div className="p-5 rounded-3xl bg-blue-50/50 border border-blue-100 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-500 rounded-xl text-white">
                      <Lucide.Calculator size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#0d1655]">Tagihan Pro-Rata (Bulan ke-1)</h4>
                      <p className="text-[10px] font-bold text-slate-500">Kalkulasi biaya sejak internet aktif</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleCopyWa}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                      copySuccess ? "bg-emerald-500 text-white shadow-emerald-500/30" : "bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50"
                    }`}
                  >
                    {copySuccess ? <Lucide.Check size={12} /> : <Lucide.Copy size={12} />}
                    {copySuccess ? "Tersalin!" : "Copy Pesan WA"}
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden text-xs">
                  <div className="grid grid-cols-2 p-3 border-b border-slate-100 items-center">
                    <span className="font-bold text-slate-500">Tanggal Aktif</span>
                    <span className="font-black text-slate-800 text-right">{new Date(item.tanggal_aktif).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3 border-b border-slate-100 items-center">
                    <span className="font-bold text-slate-500">Harga Normal / Bulan</span>
                    <span className="font-black text-slate-800 text-right">Rp {proRata.normalPrice.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3 border-b border-slate-100 items-center">
                    <span className="font-bold text-slate-500">Hari Terpakai (Bulan Pertama)</span>
                    <span className="font-black text-slate-800 text-right">{proRata.remainingDays} dari {proRata.totalDaysInMonth} hari</span>
                  </div>
                  <div className="grid grid-cols-2 p-4 bg-orange-50 items-center">
                    <span className="font-black text-orange-700">Total Tagihan Awal</span>
                    <span className="font-black text-orange-600 text-right text-lg">Rp {proRata.proRataPrice.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Catatan */}
            {item.catatan && (
              <div className="p-4 rounded-2xl border border-amber-100 bg-amber-50/30">
                <div className="flex items-center gap-2 mb-1.5">
                  <Lucide.MessageSquare size={14} className="text-amber-500" />
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Catatan</p>
                </div>
                <p className="font-bold text-slate-700 text-sm whitespace-pre-wrap">{item.catatan}</p>
              </div>
            )}

            {/* Foto KTP */}
            {item.foto_ktp && (
              <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30">
                <div className="flex items-center gap-2 mb-2">
                  <Lucide.CreditCard size={14} className="text-slate-500" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Foto KTP / ID Card</p>
                </div>
                <div className="w-full h-48 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200">
                  <img src={item.foto_ktp} alt="KTP Pelanggan" className="w-full h-full object-contain cursor-zoom-in hover:scale-105 transition-transform duration-300" onClick={() => window.open(item.foto_ktp, '_blank')} />
                </div>
              </div>
            )}

            {/* Link Google Maps */}
            {item.link_google_maps && (
              <a href={item.link_google_maps} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-3 py-4 bg-[#0d1655] text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-500/20 hover:bg-[#1a2a7a] transition-all"
              >
                <Lucide.MapPin size={18} className="text-[#FDB913]" /> Lihat Lokasi di Google Maps
              </a>
            )}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
  );
};

interface ConfirmDeleteModalProps {
  timestamp: string | null;
  isDarkMode: boolean;
  onClose: () => void;
  onConfirm: (ts: string) => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ timestamp, isDarkMode, onClose, onConfirm }) => (
  <AnimatePresence>
    {timestamp && (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className={`${isDarkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-white'} rounded-[3rem] w-full max-w-md p-10 text-center shadow-2xl border`}
        >
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Lucide.Trash2 size={40} />
          </div>
          <h2 className="text-2xl font-black italic uppercase mb-4">Confirm Deletion</h2>
          <p className="text-slate-400 font-bold text-sm mb-8">This action will permanently remove record <span className="text-orange-500">{getCustomerNo(timestamp)}</span> from the database.</p>
          <div className="flex gap-4">
            <button onClick={onClose} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black rounded-2xl text-xs uppercase tracking-widest">Cancel</button>
            <button onClick={() => onConfirm(timestamp)} className="flex-1 py-4 bg-red-500 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-red-500/20">Delete</button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

interface EditModalProps {
  item: RegistrationData | null;
  isDarkMode: boolean;
  onClose: () => void;
  onSave: (data: RegistrationData) => void;
}

// Paket options - Simple Mbps only matching PACKAGES constants
const PAKET_OPTIONS = [
  { key: "20", paket: "PAKET_1", label: "20 Mbps", price: "Rp 115.000", color: "from-orange-400 to-orange-500", icon: Lucide.Zap },
  { key: "30", paket: "PAKET_2", label: "30 Mbps", price: "Rp 148.000", color: "from-blue-400 to-blue-500", icon: Lucide.Zap },
  { key: "50", paket: "PAKET_3", label: "50 Mbps", price: "Rp 182.000", color: "from-indigo-400 to-indigo-500", icon: Lucide.Zap },
  { key: "75", paket: "PAKET_4", label: "75 Mbps", price: "Rp 260.000", color: "from-purple-400 to-purple-500", icon: Lucide.Zap },
  { key: "100", paket: "PAKET_5", label: "100 Mbps", price: "Rp 330.000", color: "from-amber-400 to-amber-500", icon: Lucide.Crown },
];

// Radio Card untuk Paket (Mobile Friendly)
const PaketRadioCards = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
  const getMbpsFromValue = (val: string) => {
    const match = val.match(/(\d+)\s*Mbps/i);
    return match ? match[1] : '';
  };
  const selectedMbps = getMbpsFromValue(value);
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      {PAKET_OPTIONS.map((paket) => {
        const isSelected = selectedMbps === paket.key;
        const fullValue = `${paket.paket} (${paket.label}) - ${paket.price}/Bln`;
        return (
          <button
            key={paket.key}
            type="button"
            onClick={() => onChange(fullValue)}
            className={`relative p-3 rounded-xl border-2 transition-all text-left overflow-hidden ${
              isSelected 
                ? `border-transparent bg-gradient-to-br ${paket.color} text-white shadow-lg` 
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            {isSelected && (
              <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                <Lucide.Check size={10} className={paket.color.includes('orange') ? 'text-orange-500' : paket.color.includes('blue') ? 'text-blue-500' : paket.color.includes('indigo') ? 'text-indigo-500' : 'text-purple-500'} />
              </div>
            )}
            <paket.icon size={14} className={`mb-1 ${isSelected ? 'text-white/80' : 'text-slate-400'}`} />
            <p className={`text-xs font-black ${isSelected ? 'text-white' : 'text-slate-700'}`}>{paket.label}</p>
            <p className={`text-[9px] font-bold ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>{paket.price}</p>
          </button>
        );
      })}
    </div>
  );
};

// Status Pill Buttons (Mobile Friendly)
const StatusPillButtons = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
  const STATUSES = [
    { key: "PENGAJUAN", label: "Pengajuan", color: "bg-blue-500", icon: Lucide.PlusCircle },
    { key: "SURVEY", label: "Survei", color: "bg-indigo-500", icon: Lucide.Search },
    { key: "PROSES", label: "Proses", color: "bg-amber-500", icon: Lucide.Loader2 },
    { key: "AKTIF", label: "Aktif", color: "bg-emerald-500", icon: Lucide.CheckCircle2 },
    { key: "NON AKTIF", label: "Non-Aktif", color: "bg-slate-400", icon: Lucide.PauseCircle },
  ];
  
  return (
    <div className="flex flex-wrap gap-2">
      {STATUSES.map((s) => {
        const isSelected = value === s.key;
        return (
          <button
            key={s.key}
            type="button"
            onClick={() => onChange(s.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black transition-all border-2 ${
              isSelected 
                ? `${s.color} text-white border-transparent shadow-lg` 
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'
            }`}
          >
            <s.icon size={12} className={isSelected ? 'text-white' : s.color.replace('bg-', 'text-')} />
            {s.label}
          </button>
        );
      })}
    </div>
  );
};

export const EditRegistrationModal: React.FC<EditModalProps> = ({ item, isDarkMode, onClose, onSave }) => {
  const [formData, setFormData] = useState<RegistrationData | null>(null);
  const [isUploadingKtp, setIsUploadingKtp] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (item) setFormData({ ...item });
  }, [item]);

  if (!item || !formData) return null;

  const handleKtpUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingKtp(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new globalThis.Image();
      img.onload = async () => {
        const TARGET_W = 600;
        const TARGET_H = 380;
        const TARGET_RATIO = TARGET_W / TARGET_H;

        const srcRatio = img.width / img.height;
        let srcX = 0, srcY = 0, srcW = img.width, srcH = img.height;
        if (srcRatio > TARGET_RATIO) {
          srcW = img.height * TARGET_RATIO;
          srcX = (img.width - srcW) / 2;
        } else {
          srcH = img.width / TARGET_RATIO;
          srcY = (img.height - srcH) / 2;
        }

        const canvas = document.createElement('canvas');
        canvas.width = TARGET_W;
        canvas.height = TARGET_H;
        const ctx = canvas.getContext('2d')!;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, TARGET_W, TARGET_H);
        ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, TARGET_W, TARGET_H);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);

        try {
          const response = await fetch(compressedBase64);
          const blob = await response.blob();
          const fileName = `KTP_Update_${Date.now()}.jpg`;
          const publicUrl = await api.uploadKtp(blob, fileName);
          
          setFormData(prev => prev ? ({ ...prev, foto_ktp: publicUrl }) : null);
          showToast("success", "Foto KTP berhasil diunggah!");
        } catch (err) {
          console.error(err);
          showToast("error", "Gagal mengunggah foto KTP. Coba gunakan foto yang lebih kecil atau pastikan koneksi stabil.");
        } finally {
          setIsUploadingKtp(false);
        }
      };
      img.src = evt.target?.result as string;
    };
    reader.onerror = () => {
      showToast("error", "Gagal membaca file foto.");
      setIsUploadingKtp(false);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (field: keyof RegistrationData, value: string) => {
    setFormData(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center bg-[#0d1655]/85 backdrop-blur-md">
        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`absolute top-6 left-1/2 -translate-x-1/2 z-[510] flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl border backdrop-blur-lg ${
                toast.type === 'success' 
                  ? 'bg-emerald-500/90 border-emerald-400 text-white' 
                  : 'bg-red-500/90 border-red-400 text-white'
              }`}
            >
              {toast.type === 'success' ? (
                <Lucide.CheckCircle className="w-5 h-5 text-emerald-100" />
              ) : (
                <Lucide.AlertCircle className="w-5 h-5 text-red-100" />
              )}
              <span className="font-semibold text-sm tracking-wide">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={`${isDarkMode ? 'bg-[#1e293b] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800'} 
            w-full sm:max-w-3xl max-h-[95vh] sm:max-h-[90vh] rounded-t-3xl sm:rounded-[2rem] 
            overflow-hidden shadow-2xl border flex flex-col`}
        >
          {/* Header Modal - Mobile Handle + Desktop Normal */}
          <div className="bg-[#0d1655] p-4 sm:p-5 text-white flex justify-between items-center shrink-0 z-30 border-b border-white/10">
            {/* Mobile Drag Handle */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/30 rounded-full sm:hidden" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                <Lucide.UserPlus size={20} className="text-[#FDB913]" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black tracking-tight">Manajemen Formulir Pelanggan</h2>
                <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest">ARMEDIA.ID Arsitektur</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all"><Lucide.X size={18} /></button>
          </div>

          {/* FORM BODY - Scrollable Container */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar bg-white pb-24 sm:pb-6">

            {/* SEKTOR I: DATA PRIBADI */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-[#F47920] uppercase tracking-[0.15em] border-b border-slate-100 pb-1 flex items-center gap-1">
                <Lucide.User size={12} /> Sektor I: Identitas & Kontak Pendaftar
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Nama Lengkap</label>
                  <input type="text" value={formData.nama_lengkap || ""} onChange={e => handleChange("nama_lengkap", e.target.value)} className="w-full px-3 py-3 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#F47920] placeholder:text-slate-400" placeholder="nama_lengkap" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">No. HP / WhatsApp</label>
                  <input type="text" value={formData.no_hp_wa || ""} onChange={e => handleChange("no_hp_wa", e.target.value)} className="w-full px-3 py-3 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#F47920] placeholder:text-slate-400" placeholder="Contoh: 0812..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">NIK KTP</label>
                  <input type="text" value={formData.nik || ""} onChange={e => handleChange("nik", e.target.value)} className="w-full px-3 py-3 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#F47920] placeholder:text-slate-400" placeholder="16 Digit NIK" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Provider Saat Ini</label>
                  <input type="text" value={formData.provider_saat_ini || ""} onChange={e => handleChange("provider_saat_ini", e.target.value)} className="w-full px-3 py-3 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#F47920] placeholder:text-slate-400" placeholder="Contoh: Indihome / Belum" />
                </div>
                <div className="sm:col-span-3 space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">Foto KTP / ID Card Pelanggan</label>
                  {formData.foto_ktp ? (
                    <div className="relative w-full h-36 border border-slate-200 bg-white rounded-xl overflow-hidden flex items-center justify-center group shadow-sm">
                      <img src={formData.foto_ktp} alt="KTP" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleChange("foto_ktp", "")}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-widest rounded-lg transition-all active:scale-95"
                        >
                          Hapus Foto
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className={`flex items-center justify-center w-full h-24 border-2 border-dashed rounded-xl transition-all relative overflow-hidden ${isUploadingKtp ? 'border-[#F47920] bg-orange-50' : 'border-slate-200 hover:border-[#F47920] bg-slate-50/50 cursor-pointer'}`}>
                      {isUploadingKtp ? (
                        <div className="flex flex-col items-center gap-2">
                          <Lucide.Loader2 size={20} className="animate-spin text-[#F47920]" />
                          <span className="text-[10px] font-bold text-[#F47920]">Mengunggah...</span>
                        </div>
                      ) : (
                        <div className="text-center px-4">
                          <p className="text-[10px] font-bold text-[#1a2d8f]">Unggah Foto KTP Baru</p>
                          <p className="text-[9px] text-slate-400 font-medium mt-0.5">Pilih Gambar dari Perangkat</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
                        disabled={isUploadingKtp}
                        onChange={handleKtpUpload}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* SEKTOR II: LOKASI GEOGRAFIS */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-[#F47920] uppercase tracking-[0.15em] border-b border-slate-100 pb-1 flex items-center gap-1">
                <Lucide.MapPin size={12} /> Sektor II: Distribusi Lokasi Rumah
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Alamat Lengkap Rumah</label>
                  <input type="text" value={formData.alamat_pemasangan || ""} onChange={e => handleChange("alamat_pemasangan", e.target.value)} className="w-full px-3 py-3 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#F47920] placeholder:text-slate-400" placeholder="Nama jalan, nomor rumah, gang..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Kecamatan</label>
                  <input type="text" value={formData.kecamatan || ""} onChange={e => handleChange("kecamatan", e.target.value)} className="w-full px-3 py-3 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#F47920] placeholder:text-slate-400" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Desa</label>
                  <select 
                    value={formData.desa || ""} 
                    onChange={e => {
                      handleChange("desa", e.target.value);
                      handleChange("rw", "");
                      handleChange("rt", "");
                    }} 
                    className="w-full px-3 py-3 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#F47920] appearance-none"
                  >
                    <option value="" disabled>-- Pilih Desa --</option>
                    {VILLAGES.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                    {!VILLAGES.includes(formData.desa || "") && formData.desa && (
                      <option value={formData.desa}>{formData.desa}</option>
                    )}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">RW</label>
                  {formData.desa && DESA_RW_RT[formData.desa] ? (
                    <select 
                      value={formData.rw || ""} 
                      onChange={e => {
                        handleChange("rw", e.target.value);
                        handleChange("rt", "");
                      }} 
                      className="w-full px-3 py-3 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#0d1655] appearance-none"
                    >
                      <option value="" disabled>-- Pilih RW --</option>
                      {Object.keys(DESA_RW_RT[formData.desa]).map(rw => (
                        <option key={rw} value={rw}>{rw}</option>
                      ))}
                      {!Object.keys(DESA_RW_RT[formData.desa]).includes(formData.rw || "") && formData.rw && (
                        <option value={formData.rw}>{formData.rw}</option>
                      )}
                    </select>
                  ) : (
                    <input type="text" value={formData.rw || ""} onChange={e => handleChange("rw", e.target.value)} className="w-full px-3 py-3 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#0d1655] placeholder:text-slate-400" placeholder="Contoh: RW 01" />
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">RT</label>
                  {formData.desa && formData.rw && DESA_RW_RT[formData.desa] && DESA_RW_RT[formData.desa][formData.rw] ? (
                    <select 
                      value={formData.rt || ""} 
                      onChange={e => handleChange("rt", e.target.value)} 
                      className="w-full px-3 py-3 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#F47920] appearance-none"
                    >
                      <option value="" disabled>-- Pilih RT --</option>
                      {DESA_RW_RT[formData.desa][formData.rw].map(rt => (
                        <option key={rt} value={rt}>{rt}</option>
                      ))}
                      {!DESA_RW_RT[formData.desa][formData.rw].includes(formData.rt || "") && formData.rt && (
                        <option value={formData.rt}>{formData.rt}</option>
                      )}
                    </select>
                  ) : (
                    <input type="text" value={formData.rt || ""} onChange={e => handleChange("rt", e.target.value)} className="w-full px-3 py-3 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#F47920] placeholder:text-slate-400" placeholder="Contoh: RT 01" />
                  )}
                </div>
                <div className="sm:col-span-4 space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Link Koordinat GPS (Google Maps)</label>
                  <input type="text" value={formData.link_google_maps || ""} onChange={e => handleChange("link_google_maps", e.target.value)} className="w-full px-3 py-3 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#F47920] placeholder:text-slate-400" placeholder="https://maps.google.com/..." />
                </div>
              </div>
            </div>

            {/* SEKTOR III: LAYANAN & TEKNIS JADWAL */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-[#F47920] uppercase tracking-[0.15em] border-b border-slate-100 pb-1 flex items-center gap-1">
                <Lucide.Calendar size={12} /> Sektor III: Opsi Paket & Penjadwalan Kerja
              </h4>
              
              {/* Paket Radio Cards - Mobile Friendly */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">Pilihan Paket Internet</label>
                <PaketRadioCards value={formData.paket} onChange={(val) => handleChange("paket", val)} />
              </div>
              
              {/* Status Pill Buttons - Mobile Friendly */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">Status Tahapan Progres</label>
                <StatusPillButtons 
                  value={formData.status || "PENGAJUAN"} 
                  onChange={(val) => {
                    handleChange("status", val);
                    if (val === "AKTIF" && !formData.tanggal_aktif) {
                      const today = new Date();
                      handleChange("tanggal_aktif", today.toISOString().split('T')[0]);
                    }
                  }} 
                />
              </div>

              {/* Input Tanggal Aktif (muncul hanya jika AKTIF atau NON AKTIF) */}
              {(formData.status === "AKTIF" || formData.status === "NON AKTIF") && (
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-1.5">
                    <Lucide.Power size={14} className="text-blue-500" />
                    Tanggal Internet Aktif (Untuk Pro-Rata Tagihan)
                  </label>
                  <input 
                    type="date" 
                    value={formData.tanggal_aktif || ""} 
                    onChange={e => handleChange("tanggal_aktif", e.target.value)} 
                    className="w-full px-3 py-3 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#F47920] placeholder:text-slate-400" 
                  />
                  <p className="text-[10px] text-slate-500 mt-2 leading-tight">
                    *Tentukan tanggal untuk menghitung tagihan awal. Jika dikosongkan, tagihan Pro-Rata tidak akan muncul.
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Rencana Tanggal Pasang</label>
                  <input type="text" value={formData.tanggal_rencana_pasang || ""} onChange={e => handleChange("tanggal_rencana_pasang", e.target.value)} className="w-full px-3 py-3 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#F47920] placeholder:text-slate-400" placeholder="Contoh: 25 Mei 2026" />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Catatan Evaluasi / Pesan</label>
                  <textarea
                    value={formData.catatan || ""}
                    onChange={e => handleChange("catatan", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#F47920] resize-none placeholder:text-slate-400"
                    placeholder="Catatan dari pelanggan atau catatan internal survei..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER - Fixed Sticky di Mobile, Normal di Desktop */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0 z-50 
            fixed bottom-0 left-0 right-0 sm:relative
            shadow-[0_-4px_20px_rgba(0,0,0,0.1)] sm:shadow-none
            rounded-t-3xl sm:rounded-none
          ">
            <button type="button" onClick={onClose} className="flex-1 py-3.5 sm:py-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-600 font-black rounded-xl text-xs uppercase tracking-widest shadow-sm transition-all">
              Batal
            </button>
            <button type="button" onClick={() => onSave(formData)} className="flex-[2] py-3.5 sm:py-3 bg-gradient-to-r from-[#F47920] to-orange-500 hover:from-orange-600 hover:to-orange-500 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-orange-500/30 flex justify-center items-center gap-2 transition-all">
              <Lucide.Save size={16} /> Simpan Data
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
