import React, { useState, useRef, useEffect } from "react";
import { RegistrationData } from "../../types";
import { getCustomerNo } from "../../utils/dashboardUtils";
import * as Lucide from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RegistrationTableProps {
  data: RegistrationData[];
  isDarkMode: boolean;
  onViewDetails: (item: RegistrationData) => void;
  onDelete: (timestamp: string) => void;
  onUpdateStatus: (timestamp: string, status: string) => void;
  mini?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  BARU: { label: "New", color: "text-blue-600", bg: "bg-blue-50", icon: Lucide.PlusCircle },
  SURVEY: { label: "Survey", color: "text-indigo-600", bg: "bg-indigo-50", icon: Lucide.Search },
  PROSES: { label: "Process", color: "text-amber-600", bg: "bg-amber-50", icon: Lucide.Loader2 },
  AKTIF: { label: "Active", color: "text-emerald-600", bg: "bg-emerald-50", icon: Lucide.CheckCircle2 },
  BELUM_AKTIF: { label: "Inactive", color: "text-slate-400", bg: "bg-slate-50", icon: Lucide.PauseCircle },
  PENDING: { label: "Pending", color: "text-orange-600", bg: "bg-orange-50", icon: Lucide.Clock },
  BATAL: { label: "Cancelled", color: "text-red-600", bg: "bg-red-50", icon: Lucide.XCircle },
};

const StatusDropdown = ({ 
  currentStatus, 
  onSelect 
}: { 
  currentStatus: string; 
  onSelect: (status: string) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const activeConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.BARU;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 ${activeConfig.bg} ${activeConfig.color} border border-transparent hover:border-current/20 shadow-sm`}
      >
        <activeConfig.icon size={12} className={currentStatus === 'PROSES' ? 'animate-spin' : ''} />
        {activeConfig.label}
        <Lucide.ChevronDown size={10} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-slate-100 z-[100] p-2 overflow-hidden"
          >
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2 mb-1 border-b border-slate-50">Change Status</div>
            <div className="grid grid-cols-1 gap-1">
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => {
                    onSelect(key);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group ${
                    currentStatus === key 
                    ? `${config.bg} ${config.color}` 
                    : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <config.icon size={14} className={currentStatus === key ? config.color : 'text-slate-300 group-hover:text-slate-400'} />
                  <span className="text-xs font-bold">{config.label}</span>
                  {currentStatus === key && <Lucide.Check size={12} className="ml-auto" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const RegistrationTable: React.FC<RegistrationTableProps> = ({ 
  data, onViewDetails, onDelete, onUpdateStatus, mini = false 
}) => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof RegistrationData | 'status'; direction: 'asc' | 'desc' } | null>(null);

  const sortedData = React.useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const valA = String(a[sortConfig.key] || "").toLowerCase();
        const valB = String(b[sortConfig.key] || "").toLowerCase();
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const requestSort = (key: any) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return <Lucide.ChevronsUpDown size={12} className="text-slate-300" />;
    return sortConfig.direction === 'asc' ? <Lucide.ArrowUp size={12} className="text-[#10b981]" /> : <Lucide.ArrowDown size={12} className="text-[#10b981]" />;
  };

  return (
    <div className="kolabo-card overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#1b2559] flex items-center gap-2">
          <Lucide.LayoutList size={20} className="text-[#10b981]" /> 
          {mini ? "Recent Activity" : "Order Management"}
        </h3>
        {!mini && (
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-100 hover:bg-slate-100 transition-colors">Columns</button>
            <button className="px-4 py-2 bg-[#10b981] text-white rounded-xl text-xs font-bold hover:bg-[#059669] transition-colors">Export CSV</button>
          </div>
        )}
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse table-auto text-sm">
          <thead>
            <tr className="border-b border-slate-50">
              <th 
                className="px-6 py-4 font-black text-[#1b2559] uppercase text-xs tracking-widest cursor-pointer hover:text-[#10b981] transition-colors"
                onClick={() => requestSort('Nama Lengkap')}
              >
                <div className="flex items-center gap-2 whitespace-nowrap">Customer {getSortIcon('Nama Lengkap')}</div>
              </th>
              {!mini && (
                <th 
                  className="px-6 py-4 font-black text-[#1b2559] uppercase text-xs tracking-widest cursor-pointer hover:text-[#10b981] transition-colors"
                  onClick={() => requestSort('Alamat Pemasangan')}
                >
                  <div className="flex items-center gap-2 whitespace-nowrap">Address {getSortIcon('Alamat Pemasangan')}</div>
                </th>
              )}
              <th 
                className="px-6 py-4 font-black text-[#1b2559] uppercase text-xs tracking-widest text-center cursor-pointer hover:text-[#10b981] transition-colors"
                onClick={() => requestSort('status')}
              >
                <div className="flex items-center justify-center gap-2 whitespace-nowrap">Status {getSortIcon('status')}</div>
              </th>
              {!mini && <th className="px-6 py-4 font-black text-[#1b2559] uppercase text-xs tracking-widest whitespace-nowrap">Progress</th>}
              <th className="px-6 py-4 font-black text-[#1b2559] uppercase text-xs tracking-widest text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedData.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-[#10b981]">
                      {item["Nama Lengkap"]?.charAt(0) || "U"}
                    </div>
                    <div className="flex flex-col">
                      <p className="font-bold text-[#1b2559]">{item["Nama Lengkap"]}</p>
                      <p className="text-[11px] text-slate-400 font-medium">ID: #{getCustomerNo(item.Timestamp).split('-')[1]}</p>
                    </div>
                  </div>
                </td>
                {!mini && (
                  <td className="px-6 py-4">
                    {(() => {
                      const address = item["Alamat Pemasangan"] || "";
                      const lowerAddr = address.toLowerCase();
                      let colorConfig = { color: "text-blue-400", bg: "bg-blue-50/30" };
                      
                      const keywords: Record<string, { color: string, bg: string }> = {
                        "gumelar": { color: "text-amber-600", bg: "bg-amber-50" },
                        "cihonje": { color: "text-emerald-600", bg: "bg-emerald-50" },
                        "tlaga": { color: "text-blue-600", bg: "bg-blue-50" },
                        "samudra kulon": { color: "text-purple-600", bg: "bg-purple-50" },
                        "samudra": { color: "text-indigo-600", bg: "bg-indigo-50" },
                        "cilangkap": { color: "text-sky-600", bg: "bg-sky-50" },
                        "paningkaban": { color: "text-rose-600", bg: "bg-rose-50" },
                      };

                      for (const key in keywords) {
                        if (lowerAddr.includes(key)) {
                          colorConfig = keywords[key];
                          break;
                        }
                      }

                      return (
                        <div className={`inline-block px-3 py-1 rounded-lg ${colorConfig.bg}`}>
                          <p className={`text-xs truncate max-w-[200px] font-black ${colorConfig.color}`}>
                            {address}
                          </p>
                        </div>
                      );
                    })()}
                  </td>
                )}
                <td className="px-6 py-4 text-center">
                  <StatusDropdown 
                    currentStatus={item.status || "BARU"} 
                    onSelect={(newStatus) => onUpdateStatus(item.Timestamp, newStatus)} 
                  />
                </td>
                {!mini && (
                  <td className="px-6 py-4">
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                       <div className="bg-[#10b981] h-full transition-all duration-1000 ease-out" style={{ width: item.status === 'AKTIF' ? '100%' : item.status === 'SURVEY' ? '60%' : '30%' }}></div>
                    </div>
                  </td>
                )}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <button 
                      onClick={() => onViewDetails(item)} 
                      title="Edit Data"
                      className="p-2.5 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all shadow-sm border border-blue-100"
                    >
                      <Lucide.Edit3 size={16} strokeWidth={2.5} />
                    </button>
                    <button 
                      onClick={() => {
                        const phone = String(item["No HP / WA"] || "").replace(/\D/g, "");
                        const waPhone = phone.startsWith("0") ? "62" + phone.slice(1) : phone;
                        window.open(`https://wa.me/${waPhone}`, "_blank");
                      }} 
                      title="Chat WhatsApp"
                      className="p-2.5 rounded-xl text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all shadow-sm border border-emerald-100"
                    >
                      <Lucide.MessageCircle size={16} strokeWidth={2.5} />
                    </button>
                    <button 
                      onClick={() => onDelete(item.Timestamp)} 
                      title="Hapus Data"
                      className="p-2.5 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all shadow-sm border border-rose-100"
                    >
                      <Lucide.Trash2 size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
