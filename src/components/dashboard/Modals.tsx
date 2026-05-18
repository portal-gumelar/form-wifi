// Last update: 2026-05-18 22:35 - Fix Mobile Dropdown Clipping & Full File Sync
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";
import { RegistrationData } from "../../types";
import { getCustomerNo } from "../../utils/dashboardUtils";

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
          <div className="flex-1 bg-slate-100 p-4">
            <iframe src={url} className="w-full h-full rounded-2xl border-none shadow-inner" title="PDF Preview"></iframe>
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

export const DetailsModal: React.FC<DetailsModalProps> = ({ item, isDarkMode, onClose }) => (
  <AnimatePresence>
    {item && (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
          className={`${isDarkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-white'} rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl border`}
        >
          <div className="bg-[#0d1655] p-10 text-white flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20"><Lucide.User size={24} className="text-[#FDB913]" /></div>
              <div>
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">{getCustomerNo(item.Timestamp)}</p>
                <h2 className="text-2xl font-black italic">Registry Details</h2>
              </div>
            </div>
            <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><Lucide.X size={20} /></button>
          </div>
          <div className="p-10 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Installation Path</p>
                <p className="font-bold text-sm leading-relaxed">{item["Alamat Pemasangan"]}</p>
              </div>
              <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Service Plan</p>
                <p className="font-black text-[#F47920] dark:text-blue-400">
                  {(() => {
                    const paket = String(item.Paket || "");
                    const match = paket.match(/(\d+)\s*Mbps/i);
                    return match ? `${match[1]}.Mbps` : paket.split("(")[0].trim();
                  })()}
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Timestamp</p>
                <p className="font-black text-slate-500">{item.Timestamp}</p>
              </div>
            </div>
            {item["Link Google Maps"] && (
              <a href={item["Link Google Maps"]} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-3 w-full py-5 bg-[#0d1655] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20"
              >
                <Lucide.MapPin size={18} className="text-[#FDB913]" /> Visualize on Map
              </a>
            )}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

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

const PAKET_CONFIG: Record<string, { color: string; bg: string; icon: any }> = {
  "GUYUB_1": { color: "text-orange-600", bg: "bg-orange-50", icon: Lucide.Zap },
  "GUYUB_2": { color: "text-blue-600", bg: "bg-blue-50", icon: Lucide.Zap },
  "GUYUB_3": { color: "text-indigo-600", bg: "bg-indigo-50", icon: Lucide.Zap },
  "REGULER_1": { color: "text-amber-600", bg: "bg-amber-50", icon: Lucide.Crown },
  "REGULER_2": { color: "text-orange-600", bg: "bg-orange-50", icon: Lucide.Crown },
  "REGULER_3": { color: "text-rose-600", bg: "bg-rose-50", icon: Lucide.Crown },
  "REGULER_4": { color: "text-purple-600", bg: "bg-purple-50", icon: Lucide.Crown },
};

const CustomPaketDropdown = ({ value, onChange, isDarkMode }: { value: string; onChange: (val: string) => void; isDarkMode: boolean; }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options = [
    "GUYUB_1 (20 Mbps) - Rp 115.000/Bln",
    "GUYUB_2 (30 Mbps) - Rp 140.000/Bln",
    "GUYUB_3 (50 Mbps) - Rp 175.000/Bln",
    "REGULER_1 (20 Mbps) - Rp 165.000/Bln",
    "REGULER_2 (30 Mbps) - Rp 215.000/Bln",
    "REGULER_3 (50 Mbps) - Rp 315.000/Bln",
    "REGULER_4 (100 Mbps) - Rp 515.000/Bln"
  ];

  const getPackageKey = (val: string) => val.split(" ")[0];
  const activeKey = getPackageKey(value);
  const activeConfig = PAKET_CONFIG[activeKey] || { color: "text-slate-600", bg: "bg-slate-50", icon: Lucide.Wifi };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between pl-11 pr-4 py-3.5 rounded-xl border text-sm font-bold transition-all ${isOpen ? 'ring-4 ring-orange-500/10 border-[#F47920]' : 'border-slate-200'} ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50 text-slate-700'}`}
      >
        <div className="flex items-center gap-2 truncate">
          <activeConfig.icon size={16} className={`${activeConfig.color} shrink-0`} />
          <span className={`${activeConfig.color} text-xs sm:text-sm truncate`}>{value || "Pilih Paket Kecepatan"}</span>
        </div>
        <Lucide.ChevronDown size={16} className={`text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.99 }}
            className="absolute left-0 right-0 mt-1 bg-white rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-slate-100 z-[999] p-1.5 max-h-[180px] overflow-y-auto custom-scrollbar"
          >
            {options.map((opt) => {
              const key = getPackageKey(opt);
              const config = PAKET_CONFIG[key] || { color: "text-slate-600", bg: "bg-slate-50", icon: Lucide.Wifi };
              const isActive = value === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={(e) => { e.preventDefault(); onChange(opt); setIsOpen(false); }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all mb-0.5 text-left ${isActive ? config.bg : 'hover:bg-slate-50'}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-black truncate ${isActive ? config.color : 'text-slate-800'}`}>{opt.split(" - ")[0]}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{opt.split(" - ")[1]}</p>
                  </div>
                  {isActive && <Lucide.Check size={14} className={config.color} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const STATUS_MODAL_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  BARU: { label: "TERDAFTAR", color: "text-blue-600", bg: "bg-blue-50", icon: Lucide.PlusCircle },
  SURVEY: { label: "SURVEY LOC", color: "text-indigo-600", bg: "bg-indigo-50", icon: Lucide.Search },
  PROSES: { label: "PROSES PASANG", color: "text-amber-600", bg: "bg-amber-50", icon: Lucide.Loader2 },
  AKTIF: { label: "AKTIF NYALA", color: "text-emerald-600", bg: "bg-emerald-50", icon: Lucide.CheckCircle2 },
  BELUM_AKTIF: { label: "NON-AKTIF", color: "text-slate-400", bg: "bg-slate-50", icon: Lucide.PauseCircle },
  PENDING: { label: "PENDING JALUR", color: "text-orange-600", bg: "bg-orange-50", icon: Lucide.Clock },
  BATAL: { label: "BATAL ORDER", color: "text-red-600", bg: "bg-red-50", icon: Lucide.XCircle },
};

const CustomStatusDropdown = ({ value, onChange, isDarkMode }: { value: string; onChange: (val: string) => void; isDarkMode: boolean; }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeKey = value || "BARU";
  const activeConfig = STATUS_MODAL_CONFIG[activeKey] || STATUS_MODAL_CONFIG.BARU;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between pl-11 pr-4 py-3.5 rounded-xl border text-sm font-black transition-all ${isOpen ? 'ring-4 ring-blue-500/10 border-blue-600' : 'border-slate-200'} ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}
      >
        <div className="flex items-center gap-2 truncate">
          <activeConfig.icon size={16} className={`${activeConfig.color} ${activeKey === 'PROSES' ? 'animate-spin' : ''} shrink-0`} />
          <span className={`${activeConfig.color} text-xs sm:text-sm truncate`}>{activeConfig.label}</span>
        </div>
        <Lucide.ChevronDown size={16} className={`text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.99 }}
            className="absolute left-0 right-0 mt-1 bg-white rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-slate-100 z-[999] p-1.5 max-h-[180px] overflow-y-auto custom-scrollbar"
          >
            {Object.entries(STATUS_MODAL_CONFIG).map(([key, config]) => {
              const isActive = activeKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={(e) => { e.preventDefault(); onChange(key); setIsOpen(false); }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all mb-0.5 text-left ${isActive ? config.bg : 'hover:bg-slate-50'}`}
                >
                  <config.icon size={14} className={`${config.color} ${key === 'PROSES' && isActive ? 'animate-spin' : ''}`} />
                  <span className={`text-xs font-black ${isActive ? config.color : 'text-slate-700'}`}>{config.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const EditRegistrationModal: React.FC<EditModalProps> = ({ item, isDarkMode, onClose, onSave }) => {
  const [formData, setFormData] = useState<RegistrationData | null>(null);

  useEffect(() => {
    if (item) setFormData({ ...item });
  }, [item]);

  if (!item || !formData) return null;

  const handleChange = (field: keyof RegistrationData, value: string) => {
    setFormData(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[500] flex items-center justify-center p-3 sm:p-4 bg-[#0d1655]/85 backdrop-blur-md">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
          className={`${isDarkMode ? 'bg-[#1e293b] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800'} rounded-[2rem] w-full max-w-3xl overflow-hidden shadow-2xl border flex flex-col max-h-[85vh] sm:max-h-[90vh]`}
        >
          {/* Header Modal */}
          <div className="bg-[#0d1655] p-4 sm:p-5 text-white flex justify-between items-center shrink-0 z-30 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                <Lucide.UserPlus size={20} className="text-[#FDB913]" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black tracking-tight">Manajemen Formulir Pelanggan</h2>
                <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest">Armedia Net Arsitektur</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all"><Lucide.X size={18} /></button>
          </div>

          {/* FORM BODY - Scrollable Container */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar bg-white">

            {/* SEKTOR I: DATA PRIBADI */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-[#F47920] uppercase tracking-[0.15em] border-b border-slate-100 pb-1 flex items-center gap-1">
                <Lucide.User size={12} /> Sektor I: Identitas & Kontak Pendaftar
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Nama Lengkap</label>
                  <input type="text" value={formData["Nama Lengkap"] || ""} onChange={e => handleChange("Nama Lengkap", e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#F47920]" placeholder="Nama Lengkap" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">No HP / WhatsApp</label>
                  <input type="text" value={formData["No HP / WA"] || ""} onChange={e => handleChange("No HP / WA", e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#F47920]" placeholder="Contoh: 0812..." />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Provider Saat Ini</label>
                  <input type="text" value={formData["Provider Saat Ini"] || ""} onChange={e => handleChange("Provider Saat Ini", e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#F47920]" placeholder="Contoh: Indihome / Belum" />
                </div>
              </div>
            </div>

            {/* SEKTOR II: LOKASI GEOGRAFIS */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-[#F47920] uppercase tracking-[0.15em] border-b border-slate-100 pb-1 flex items-center gap-1">
                <Lucide.MapPin size={12} /> Sektor II: Distribusi Lokasi Rumah
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Alamat Lengkap Rumah (RT/RW)</label>
                  <input type="text" value={formData["Alamat Pemasangan"] || ""} onChange={e => handleChange("Alamat Pemasangan", e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#F47920]" placeholder="Nama jalan, RT/RW, Dusun" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Kecamatan</label>
                  <input type="text" value={formData.Kecamatan || ""} onChange={e => handleChange("Kecamatan", e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#F47920]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Desa</label>
                  <input type="text" value={formData.Desa || ""} onChange={e => handleChange("Desa", e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#F47920]" />
                </div>
                <div className="sm:col-span-4 space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Link Koordinat GPS (Google Maps URL)</label>
                  <input type="text" value={formData["Link Google Maps"] || ""} onChange={e => handleChange("Link Google Maps", e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#F47920]" placeholder="https://maps.google.com/..." />
                </div>
              </div>
            </div>

            {/* SEKTOR III: LAYANAN & TEKNIS JADWAL */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-[#F47920] uppercase tracking-[0.15em] border-b border-slate-100 pb-1 flex items-center gap-1">
                <Lucide.Calendar size={12} /> Sektor III: Opsi Paket & Penjadwalan Kerja
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pilihan Paket Internet</label>
                  <CustomPaketDropdown value={formData.Paket} onChange={(val) => handleChange("Paket", val)} isDarkMode={isDarkMode} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Status Tahapan Progres</label>
                  <CustomStatusDropdown value={formData.status || "BARU"} onChange={(val) => handleChange("status", val)} isDarkMode={isDarkMode} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Rencana Tanggal Pasang</label>
                  <input type="text" value={formData["Tanggal Rencana Pasang"] || ""} onChange={e => handleChange("Tanggal Rencana Pasang", e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#F47920]" placeholder="Contoh: 25 Mei 2026" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Alokasi Waktu Survei Lokasi</label>
                  <input type="text" value={formData["Waktu Survei"] || ""} onChange={e => handleChange("Waktu Survei", e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#F47920]" placeholder="Contoh: Jam 10:00 Pagi" />
                </div>
              </div>
            </div>

            {/* Invisible Spatial Buffer (Spacer Penjamin Kebebasan Dropdown di HP) */}
            <div className="h-44 sm:h-12 w-full pointer-events-none" />

          </div>

          {/* FOOTER - Menempel Kokoh di Bawah */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0 z-50">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-600 font-black rounded-xl text-xs uppercase tracking-widest shadow-sm transition-all">
              Batal
            </button>
            <button type="button" onClick={() => onSave(formData)} className="flex-[2] py-3 bg-gradient-to-r from-[#F47920] to-orange-500 hover:from-orange-600 hover:to-orange-500 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-orange-500/30 flex justify-center items-center gap-2 transition-all">
              <Lucide.Save size={16} /> Simpan Data
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};