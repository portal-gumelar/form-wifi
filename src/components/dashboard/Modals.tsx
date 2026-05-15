import React from "react";
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
          <div className="bg-[#1a2d8f] p-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Lucide.FileText size={24} />
              <h2 className="text-xl font-black italic uppercase">PDF Report Preview</h2>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={onDownload}
                className="flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-xs font-black uppercase tracking-widest"
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
          <div className="bg-[#1a2d8f] p-10 text-white flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20"><Lucide.User size={24} /></div>
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
                <p className="font-black text-[#1a2d8f] dark:text-blue-400">
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
                className="flex items-center justify-center gap-3 w-full py-5 bg-[#1a2d8f] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20"
              >
                <Lucide.MapPin size={18} /> Visualize on Map
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
  "GUYUB_1": { color: "text-emerald-600", bg: "bg-emerald-50", icon: Lucide.Zap },
  "GUYUB_2": { color: "text-blue-600", bg: "bg-blue-50", icon: Lucide.Zap },
  "GUYUB_3": { color: "text-indigo-600", bg: "bg-indigo-50", icon: Lucide.Zap },
  "REGULER_1": { color: "text-amber-600", bg: "bg-amber-50", icon: Lucide.Crown },
  "REGULER_2": { color: "text-orange-600", bg: "bg-orange-50", icon: Lucide.Crown },
  "REGULER_3": { color: "text-rose-600", bg: "bg-rose-50", icon: Lucide.Crown },
  "REGULER_4": { color: "text-purple-600", bg: "bg-purple-50", icon: Lucide.Crown },
};

const CustomPaketDropdown = ({ 
  value, 
  onChange, 
  isDarkMode 
}: { 
  value: string; 
  onChange: (val: string) => void;
  isDarkMode: boolean;
}) => {
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
        className={`w-full flex items-center justify-between pl-11 pr-4 py-4 rounded-2xl border text-sm font-black transition-all ${isOpen ? 'ring-4 ring-emerald-500/10 border-[#10b981]' : 'border-slate-100'} ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}
      >
        <div className="flex items-center gap-2">
          <activeConfig.icon size={16} className={activeConfig.color} />
          <span className={activeConfig.color}>{value || "Pilih Paket"}</span>
        </div>
        <Lucide.ChevronDown size={18} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute left-0 right-0 mt-2 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 z-[400] p-3 max-h-[300px] overflow-y-auto custom-scrollbar"
          >
            {options.map((opt) => {
              const key = getPackageKey(opt);
              const config = PAKET_CONFIG[key];
              const isActive = value === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all mb-1 text-left group z-[500] ${isActive ? config.bg : 'hover:bg-slate-50'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-white shadow-sm' : config.bg}`}>
                    <config.icon size={20} className={config.color} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-black ${isActive ? config.color : 'text-[#1b2559]'}`}>
                      {(() => {
                        const match = opt.match(/(\d+)\s*Mbps/i);
                        return match ? `${match[1]}.Mbps` : opt.split(" - ")[0];
                      })()}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{opt.split(" - ")[1]}</p>
                  </div>
                  {isActive && <Lucide.Check size={18} className={config.color} />}
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

const CustomStatusDropdown = ({ 
  value, 
  onChange, 
  isDarkMode 
}: { 
  value: string; 
  onChange: (val: string) => void;
  isDarkMode: boolean;
}) => {
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
        className={`w-full flex items-center justify-between pl-11 pr-4 py-5 rounded-2xl border text-lg font-black transition-all ${isOpen ? 'ring-4 ring-[#10b981]/10 border-[#10b981]' : 'border-slate-100'} ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}
      >
        <div className="flex items-center gap-3">
          <activeConfig.icon size={20} className={`${activeConfig.color} ${activeKey === 'PROSES' ? 'animate-spin' : ''}`} />
          <span className={activeConfig.color}>{activeConfig.label}</span>
        </div>
        <Lucide.ChevronDown size={20} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute left-0 right-0 mt-2 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 z-[400] p-3 max-h-[400px] overflow-y-auto custom-scrollbar"
          >
            {Object.entries(STATUS_MODAL_CONFIG).map(([key, config]) => {
              const isActive = activeKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(key);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all mb-1 text-left group ${isActive ? config.bg : 'hover:bg-slate-50'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-white shadow-sm' : config.bg}`}>
                    <config.icon size={20} className={`${config.color} ${key === 'PROSES' && isActive ? 'animate-spin' : ''}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-black ${isActive ? config.color : 'text-[#1b2559]'}`}>{config.label}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update Status To {config.label}</p>
                  </div>
                  {isActive && <Lucide.Check size={18} className={config.color} />}
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
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
          className={`${isDarkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-white'} rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl border flex flex-col max-h-[90vh]`}
        >
          <div className="bg-[#10b981] p-8 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner">
                <Lucide.UserPlus size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">Data Pelanggan</h2>
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Management System</p>
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
                  className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-white/10"
                >
                  <Lucide.MessageCircle size={18} /> Chat WA
                </button>
              )}
              <button onClick={onClose} className="p-2.5 hover:bg-white/10 rounded-xl transition-all"><Lucide.X size={20} /></button>
            </div>
          </div>

          <div className="p-8 overflow-y-auto space-y-6 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-[#1b2559] dark:text-slate-200 uppercase tracking-widest ml-1">Nama Lengkap</label>
                <div className="relative group">
                   <Lucide.User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#10b981] transition-colors" />
                   <input 
                    type="text" 
                    value={formData["Nama Lengkap"]} 
                    onChange={e => handleChange("Nama Lengkap", e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className={`w-full pl-12 pr-4 py-5 rounded-2xl border text-lg font-black outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-100 text-[#1b2559] focus:border-[#10b981] placeholder-slate-300'}`}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-[#1b2559] dark:text-slate-200 uppercase tracking-widest ml-1">No HP / WhatsApp</label>
                <div className="relative group">
                   <Lucide.Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#10b981] transition-colors" />
                   <input 
                    type="text" 
                    value={formData["No HP / WA"]} 
                    onChange={e => handleChange("No HP / WA", e.target.value)}
                    placeholder="Contoh: 0812..."
                    className={`w-full pl-12 pr-4 py-5 rounded-2xl border text-lg font-black outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-100 text-[#1b2559] focus:border-[#10b981] placeholder-slate-300'}`}
                  />
                </div>
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="text-sm font-black text-[#1b2559] dark:text-slate-200 uppercase tracking-widest ml-1">Alamat Pemasangan</label>
                <textarea 
                  rows={2}
                  value={formData["Alamat Pemasangan"]} 
                  onChange={e => handleChange("Alamat Pemasangan", e.target.value)}
                  placeholder="Contoh: Alamat RT 01 RW 02..."
                  className={`w-full p-5 rounded-2xl border text-lg font-black outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-100 text-[#1b2559] focus:border-[#10b981] placeholder-slate-300'}`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-[#1b2559] dark:text-slate-200 uppercase tracking-widest ml-1">Pilihan Paket</label>
                <CustomPaketDropdown 
                  value={formData.Paket} 
                  onChange={(val) => handleChange("Paket", val)} 
                  isDarkMode={isDarkMode} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-[#1b2559] dark:text-slate-200 uppercase tracking-widest ml-1">Status Progres</label>
                <CustomStatusDropdown 
                  value={formData.status || "BARU"} 
                  onChange={(val) => handleChange("status", val)} 
                  isDarkMode={isDarkMode} 
                />
              </div>
            </div>
          </div>

          <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex gap-4 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
            <button onClick={onClose} className="flex-1 py-4 text-slate-400 font-black rounded-2xl text-xs uppercase tracking-widest hover:text-red-500 transition-all">Batal</button>
            <button 
              onClick={() => onSave(formData)} 
              className="flex-1 py-4 bg-[#10b981] text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all"
            >
              Simpan Data
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
