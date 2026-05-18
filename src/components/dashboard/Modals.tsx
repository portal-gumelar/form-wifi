import React, { useState, useEffect } from "react";
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
      <div className="fixed inset-0 z-[400] flex items-center justify-center p-3 sm:p-4 bg-[#0d1655]/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-[2rem] w-full max-w-5xl h-[85vh] sm:h-[90vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col"
        >
          <div className="bg-[#0d1655] p-4 sm:p-6 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <Lucide.FileText size={20} className="text-[#FDB913]" />
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider">PDF Report Preview</h2>
            </div>
            <div className="flex gap-2 sm:gap-4">
              <button
                onClick={onDownload}
                className="flex items-center gap-2 px-4 py-2 bg-[#F47920] hover:bg-orange-600 rounded-xl transition-all text-[11px] font-black uppercase tracking-widest text-white shadow-md shadow-orange-500/20"
              >
                <Lucide.Download size={14} /> <span className="hidden sm:inline">Download</span>
              </button>
              <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                <Lucide.X size={18} />
              </button>
            </div>
          </div>
          <div className="flex-1 bg-slate-100 p-2 sm:p-4">
            <iframe src={url} className="w-full h-full rounded-xl border-none shadow-inner" title="PDF Preview"></iframe>
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
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-4 bg-[#0d1655]/80 backdrop-blur-md">
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
          className={`${isDarkMode ? 'bg-[#1e293b] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800'} rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl border flex flex-col max-h-[85vh] sm:max-h-[90vh]`}
        >
          <div className="bg-[#0d1655] p-5 sm:p-6 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20"><Lucide.User size={20} className="text-[#FDB913]" /></div>
              <div>
                <p className="text-[9px] font-black text-blue-200 uppercase tracking-widest">{getCustomerNo(item.Timestamp)}</p>
                <h2 className="text-base sm:text-lg font-black tracking-tight">Detail Registrasi Pelanggan</h2>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><Lucide.X size={18} /></button>
          </div>

          <div className="p-5 sm:p-8 overflow-y-auto custom-scrollbar space-y-5 flex-1 text-slate-700 dark:text-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Alamat Pemasangan</p>
                <p className="font-bold text-sm leading-relaxed text-slate-800 dark:text-white">{item["Alamat Pemasangan"]}</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/10">
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Paket Layanan</p>
                <p className="font-black text-[#F47920]">
                  {(() => {
                    const paket = String(item.Paket || "");
                    const match = paket.match(/(\d+)\s*Mbps/i);
                    return match ? `${match[1]} Mbps` : paket.split("(")[0].trim();
                  })()}
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/10">
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Waktu Masuk (Timestamp)</p>
                <p className="font-black text-slate-600 dark:text-slate-400 text-sm">{item.Timestamp}</p>
              </div>
            </div>
            {item["Link Google Maps"] && (
              <a href={item["Link Google Maps"]} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 bg-[#0d1655] hover:bg-blue-900 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-950/20 transition-all active:scale-[0.99]"
              >
                <Lucide.MapPin size={16} className="text-[#FDB913]" /> Lihat Koordinat Peta
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
      <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-[#0d1655]/80 backdrop-blur-md">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className={`${isDarkMode ? 'bg-[#1e293b] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800'} rounded-[2rem] w-full max-w-sm p-6 text-center shadow-2xl border`}
        >
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-red-100 dark:border-red-900/50">
            <Lucide.Trash2 size={28} />
          </div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white mb-2 tracking-tight">Hapus Data Registrasi?</h2>
          <p className="text-slate-400 dark:text-slate-500 font-medium text-xs sm:text-sm mb-6 leading-relaxed">Tindakan ini bersifat permanen. Rekor <span className="text-[#F47920] font-black">{getCustomerNo(timestamp)}</span> akan lenyap dari database.</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs uppercase tracking-widest border border-slate-200 dark:border-transparent transition-all">Batal</button>
            <button onClick={() => onConfirm(timestamp)} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-md shadow-red-500/20 transition-all">Hapus</button>
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
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

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

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between pl-11 pr-4 py-3.5 sm:py-4 rounded-xl border text-sm font-bold transition-all ${isOpen ? 'ring-4 ring-orange-500/10 border-[#F47920]' : 'border-slate-200'} ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50 text-slate-700'}`}
      >
        <div className="flex items-center gap-2">
          <activeConfig.icon size={16} className={activeConfig.color} />
          <span className={`${activeConfig.color} text-xs sm:text-sm`}>{value || "Pilih Paket"}</span>
        </div>
        <Lucide.ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 z-[400] p-2 max-h-[220px] overflow-y-auto custom-scrollbar"
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
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all mb-1 text-left ${isActive ? config.bg : 'hover:bg-slate-50'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-white shadow-sm' : config.bg}`}>
                    <config.icon size={16} className={config.color} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-black ${isActive ? config.color : 'text-slate-800'}`}>
                      {(() => {
                        const match = opt.match(/(\d+)\s*Mbps/i);
                        return match ? `${match[1]} Mbps` : opt.split(" - ")[0];
                      })()}
                    </p>
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
  SURVEY: { label: "SURVEY", color: "text-indigo-600", bg: "bg-indigo-50", icon: Lucide.Search },
  PROSES: { label: "PROSES PASANG", color: "text-amber-600", bg: "bg-amber-50", icon: Lucide.Loader2 },
  AKTIF: { label: "AKTIF", color: "text-emerald-600", bg: "bg-emerald-50", icon: Lucide.CheckCircle2 },
  BELUM_AKTIF: { label: "BELUM AKTIF", color: "text-slate-400", bg: "bg-slate-50", icon: Lucide.PauseCircle },
  PENDING: { label: "PENDING", color: "text-orange-600", bg: "bg-orange-50", icon: Lucide.Clock },
  BATAL: { label: "BATAL", color: "text-red-600", bg: "bg-red-50", icon: Lucide.XCircle },
};

const CustomStatusDropdown = ({ value, onChange, isDarkMode }: { value: string; onChange: (val: string) => void; isDarkMode: boolean; }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const activeKey = value || "BARU";
  const activeConfig = STATUS_MODAL_CONFIG[activeKey] || STATUS_MODAL_CONFIG.BARU;

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between pl-11 pr-4 py-3.5 sm:py-4 rounded-xl border text-sm font-black transition-all ${isOpen ? 'ring-4 ring-blue-500/10 border-blue-600' : 'border-slate-200'} ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}
      >
        <div className="flex items-center gap-2">
          <activeConfig.icon size={18} className={`${activeConfig.color} ${activeKey === 'PROSES' ? 'animate-spin' : ''}`} />
          <span className={`${activeConfig.color} text-xs sm:text-sm`}>{activeConfig.label}</span>
        </div>
        <Lucide.ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 z-[400] p-2 max-h-[220px] overflow-y-auto custom-scrollbar"
          >
            {Object.entries(STATUS_MODAL_CONFIG).map(([key, config]) => {
              const isActive = activeKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={(e) => { e.preventDefault(); onChange(key); setIsOpen(false); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all mb-1 text-left ${isActive ? config.bg : 'hover:bg-slate-50'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-white shadow-sm' : config.bg}`}>
                    <config.icon size={16} className={`${config.color} ${key === 'PROSES' && isActive ? 'animate-spin' : ''}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-black ${isActive ? config.color : 'text-slate-800'}`}>{config.label}</p>
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

// --- MODAL EDIT: SUDAH DIREAKTOR UNTUK PERBAIKAN RESPONSIVE HP ---
export const EditRegistrationModal: React.FC<EditModalProps> = ({ item, isDarkMode, onClose, onSave }) => {
  const [formData, setFormData] = React.useState<RegistrationData | null>(null);

  React.useEffect(() => {
    if (item) setFormData({ ...item });
  }, [item]);

  if (!item || !formData) return null;

  const handleChange = (field: keyof RegistrationData, value: string) => {
    setFormData(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-4 bg-[#0d1655]/80 backdrop-blur-sm">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
          className={`${isDarkMode ? 'bg-[#1e293b] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800'} rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl border flex flex-col max-h-[85vh] sm:max-h-[90vh]`}
        >
          {/* Header Modal - Diubah Menjadi Luxury Dark Blue */}
          <div className="bg-[#0d1655] p-4 sm:p-5 text-white flex justify-between items-center shrink-0 z-10 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shadow-inner border border-white/10">
                <Lucide.UserPlus size={20} className="text-[#FDB913]" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black tracking-tight">Data Pelanggan</h2>
                <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest">Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!formData.Timestamp.includes("baru") && (
                <button
                  onClick={() => {
                    const phone = String(formData["No HP / WA"] || "").replace(/\D/g, "");
                    const waPhone = phone.startsWith("0") ? "62" + phone.slice(1) : phone;
                    window.open(`https://wa.me/${waPhone}`, "_blank");
                  }}
                  className="p-2 sm:px-3 sm:py-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest border border-white/10"
                >
                  <Lucide.MessageCircle size={14} /> <span className="hidden sm:inline">Chat WA</span>
                </button>
              )}
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all"><Lucide.X size={18} /></button>
            </div>
          </div>

          {/* Form Area - Scrollable Otomatis Di HP */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-5 custom-scrollbar bg-white dark:bg-[#1e293b]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nama Lengkap</label>
                <div className="relative group">
                  <Lucide.User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData["Nama Lengkap"]}
                    onChange={e => handleChange("Nama Lengkap", e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm font-bold outline-none focus:ring-4 focus:ring-orange-500/10 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-600 focus:border-[#F47920]' : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-[#F47920] placeholder-slate-400'}`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">No HP / WhatsApp</label>
                <div className="relative group">
                  <Lucide.Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData["No HP / WA"]}
                    onChange={e => handleChange("No HP / WA", e.target.value)}
                    placeholder="Contoh: 0812..."
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm font-bold outline-none focus:ring-4 focus:ring-orange-500/10 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-600 focus:border-[#F47920]' : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-[#F47920] placeholder-slate-400'}`}
                  />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Alamat Pemasangan</label>
                <textarea
                  rows={2}
                  value={formData["Alamat Pemasangan"]}
                  onChange={e => handleChange("Alamat Pemasangan", e.target.value)}
                  placeholder="Contoh: Alamat RT 01 RW 02..."
                  className={`w-full p-4 rounded-xl border text-sm font-bold outline-none focus:ring-4 focus:ring-orange-500/10 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-600 focus:border-[#F47920]' : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-[#F47920] placeholder-slate-400'}`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Pilihan Paket</label>
                <CustomPaketDropdown value={formData.Paket} onChange={(val) => handleChange("Paket", val)} isDarkMode={isDarkMode} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Status Progres</label>
                <CustomStatusDropdown value={formData.status || "BARU"} onChange={(val) => handleChange("status", val)} isDarkMode={isDarkMode} />
              </div>

            </div>
          </div>

          {/* Footer Modal - REVISI TOTAL TOMBOL BATAL */}
          <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex gap-3 shrink-0 bg-slate-50 dark:bg-slate-900/50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-white hover:bg-slate-100 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-transparent text-slate-600 dark:text-slate-300 font-black rounded-xl text-xs uppercase tracking-widest shadow-sm transition-all"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => onSave(formData)}
              className="flex-[2] py-3 bg-gradient-to-r from-[#F47920] to-orange-500 hover:from-orange-600 hover:to-orange-500 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-orange-500/30 flex justify-center items-center gap-2 transition-all active:scale-[0.99]"
            >
              <Lucide.Save size={16} /> Simpan Data
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};