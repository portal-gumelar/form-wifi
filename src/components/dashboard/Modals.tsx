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
                <p className="font-black text-[#1a2d8f] dark:text-blue-400">{String(item.Paket || "").split("(")[0]}</p>
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
          <div className="bg-[#1a2d8f] p-8 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
              <Lucide.Edit3 size={24} />
              <h2 className="text-xl font-black italic uppercase">Edit Pelanggan</h2>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  const phone = String(formData["No HP / WA"] || "").replace(/\D/g, "");
                  const waPhone = phone.startsWith("0") ? "62" + phone.slice(1) : phone;
                  window.open(`https://wa.me/${waPhone}`, "_blank");
                }}
                className="p-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
              >
                <Lucide.MessageCircle size={18} /> Chat WA
              </button>
              <button onClick={onClose} className="p-2.5 hover:bg-white/10 rounded-xl transition-all"><Lucide.X size={20} /></button>
            </div>
          </div>

          <div className="p-8 overflow-y-auto space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={formData["Nama Lengkap"]} 
                  onChange={e => handleChange("Nama Lengkap", e.target.value)}
                  className={`w-full p-3 rounded-xl border text-sm font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">No HP / WA</label>
                <input 
                  type="text" 
                  value={formData["No HP / WA"]} 
                  onChange={e => handleChange("No HP / WA", e.target.value)}
                  className={`w-full p-3 rounded-xl border text-sm font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Pemasangan</label>
                <textarea 
                  rows={2}
                  value={formData["Alamat Pemasangan"]} 
                  onChange={e => handleChange("Alamat Pemasangan", e.target.value)}
                  className={`w-full p-3 rounded-xl border text-sm font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Paket Internet</label>
                <input 
                  type="text" 
                  value={formData.Paket} 
                  onChange={e => handleChange("Paket", e.target.value)}
                  className={`w-full p-3 rounded-xl border text-sm font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                <select 
                  value={formData.status || "BARU"} 
                  onChange={e => handleChange("status", e.target.value)}
                  className={`w-full p-3 rounded-xl border text-sm font-bold appearance-none ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                >
                  <option value="BARU">TERDAFTAR</option>
                  <option value="SURVEY">SURVEY</option>
                  <option value="PROSES">PROSES PASANG</option>
                  <option value="AKTIF">AKTIF</option>
                  <option value="BELUM_AKTIF">BELUM AKTIF</option>
                  <option value="PENDING">PENDING</option>
                  <option value="BATAL">BATAL</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex gap-4 shrink-0">
            <button onClick={onClose} className="flex-1 py-4 text-slate-500 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Batal</button>
            <button onClick={() => onSave(formData)} className="flex-1 py-4 bg-[#1a2d8f] text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20">Simpan Perubahan</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
