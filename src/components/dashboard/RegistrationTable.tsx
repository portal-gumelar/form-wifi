import React, { useState, useRef, useEffect } from "react";
import { RegistrationData } from "../../types";
import { getCustomerNo } from "../../utils/dashboardUtils";
import * as Lucide from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RegistrationTableProps {
  data: RegistrationData[];
  isDarkMode: boolean;
  onViewDetails: (item: RegistrationData) => void;
  onEdit: (item: RegistrationData) => void;
  onDelete: (timestamp: string) => void;
  onUpdateStatus: (timestamp: string, status: string) => void;
  mini?: boolean;
  hideHeader?: boolean;
  allowedStatuses?: string[];
  userRole?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  PENGAJUAN: { label: "Pengajuan", color: "text-blue-600", bg: "bg-blue-50", icon: Lucide.PlusCircle },
  SURVEY: { label: "Survei Lokasi", color: "text-amber-600", bg: "bg-amber-50", icon: Lucide.Search },
  PROSES: { label: "Proses Pasang", color: "text-orange-600", bg: "bg-orange-50", icon: Lucide.Loader2 },
  AKTIF: { label: "Aktif", color: "text-emerald-600", bg: "bg-emerald-50", icon: Lucide.CheckCircle2 },
  "NON AKTIF": { label: "Non-Aktif", color: "text-rose-500", bg: "bg-rose-50", icon: Lucide.PauseCircle },
  PENDING: { label: "Pending", color: "text-orange-500", bg: "bg-orange-50", icon: Lucide.Clock },
  BATAL: { label: "Batal", color: "text-red-600", bg: "bg-red-50", icon: Lucide.XCircle },
};

const StatusDropdown = ({
  currentStatus,
  onSelect,
  allowedStatuses,
  disabled = false
}: {
  currentStatus: string;
  onSelect: (status: string) => void;
  allowedStatuses?: string[];
  disabled?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const activeConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.PENGAJUAN;

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
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all border-2 ${activeConfig.bg} ${activeConfig.color} border-transparent ${disabled ? 'cursor-default' : 'hover:border-current/10 shadow-sm'}`}
      >
        <activeConfig.icon size={12} className={currentStatus === 'PROSES' ? 'animate-spin' : ''} />
        <span className="truncate max-w-[70px] sm:max-w-none">{activeConfig.label}</span>
        {!disabled && <Lucide.ChevronDown size={10} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 z-[110] p-1.5"
          >
            <div className="text-[10px] font-bold text-slate-400 tracking-wider px-2.5 py-1.5 mb-1 border-b border-slate-100">Pilih Status</div>
            <div className="space-y-0.5 max-h-[180px] overflow-y-auto custom-scrollbar">
              {Object.entries(STATUS_CONFIG)
                .filter(([key]) => !allowedStatuses || allowedStatuses.includes(key))
                .map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => {
                      onSelect(key);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all text-left group ${currentStatus === key
                      ? `${config.bg} ${config.color} font-black`
                      : 'hover:bg-slate-50 text-slate-600 font-medium'
                      }`}
                  >
                    <config.icon size={13} className={currentStatus === key ? config.color : 'text-slate-300 group-hover:text-slate-500'} />
                    <span className="text-xs">{config.label}</span>
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
  data, isDarkMode, onViewDetails, onEdit, onDelete, onUpdateStatus, mini = false, hideHeader = false, allowedStatuses, userRole = "admin"
}) => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof RegistrationData | 'status'; direction: 'asc' | 'desc' } | null>(null);
  const [selectedWaCustomer, setSelectedWaCustomer] = useState<RegistrationData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const itemsPerPage = 10;

  const filteredData = React.useMemo(() => {
    let result = [...data];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item =>
        String(item.nama_lengkap || "").toLowerCase().includes(query) ||
        String(item.alamat_pemasangan || "").toLowerCase().includes(query) ||
        String(item.no_hp_wa || "").toLowerCase().includes(query) ||
        String(item.desa || "").toLowerCase().includes(query) ||
        String(item.paket || "").toLowerCase().includes(query)
      );
    }
    if (statusFilter !== "ALL") {
      result = result.filter(item => item.status === statusFilter);
    }
    return result;
  }, [data, searchQuery, statusFilter]);

  const sortedData = React.useMemo(() => {
    let sortableItems = [...filteredData];
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
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const quickStats = React.useMemo(() => ({
    total: data.length,
    aktif: data.filter(d => d.status === 'AKTIF').length,
    proses: data.filter(d => d.status === 'PROSES').length,
    survey: data.filter(d => d.status === 'SURVEY').length,
    belumAktif: data.filter(d => d.status === 'NON AKTIF' || d.status === 'BERHENTI BERLANGGANAN').length,
    ktp: data.filter(d => d.foto_ktp).length
  }), [data]);

  const getDaysAgo = (timestamp: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Baru saja";
    if (diffDays === 1) return "Kemarin";
    return `${diffDays} hari lalu`;
  };

  const exportToCSV = () => {
    const headers = ["nik", "nama_lengkap", "Alamat", "desa", "No HP", "paket", "Status", "timestamp"];
    const rows = sortedData.map(item => [
      item.nik || "",
      item.nama_lengkap || "",
      item.alamat_pemasangan || "",
      item.desa || "",
      item.no_hp_wa || "",
      item.paket || "",
      item.status || "",
      item.timestamp || ""
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `armedia.id-registrasi-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const bulkDelete = () => {
    if (selectedRows.size === 0) return;
    if (confirm(`Hapus ${selectedRows.size} data yang dipilih?`)) {
      selectedRows.forEach(timestamp => onDelete(timestamp));
      setSelectedRows(new Set());
    }
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map(item => item.timestamp)));
    }
  };

  const toggleSelectRow = (timestamp: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(timestamp)) {
      newSelected.delete(timestamp);
    } else {
      newSelected.add(timestamp);
    }
    setSelectedRows(newSelected);
  };

  const requestSort = (key: any) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return <Lucide.ChevronsUpDown size={12} className="text-slate-300" />;
    return sortConfig.direction === 'asc' ? <Lucide.ArrowUp size={12} className="text-[#F47920]" /> : <Lucide.ArrowDown size={12} className="text-[#F47920]" />;
  };

  if (mini) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden w-full">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
              <Lucide.LayoutList size={16} className="text-[#0d1655]" />
            </div>
            <h3 className="text-sm sm:text-base font-black text-[#0d1655] tracking-tight">Aktivitas Terbaru</h3>
          </div>
        </div>
        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse table-auto text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-4 sm:px-6 py-3.5 font-black text-[#0d1655] uppercase text-[10px] sm:text-xs tracking-widest">Pelanggan</th>
                <th className="px-4 sm:px-6 py-3.5 font-black text-[#0d1655] uppercase text-[10px] sm:text-xs tracking-widest text-center">Status</th>
                <th className="px-4 sm:px-6 py-3.5 font-black text-[#0d1655] uppercase text-[10px] sm:text-xs tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.slice(0, 5).map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-4 sm:px-6 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-black text-[#0d1655] text-xs shrink-0 border border-slate-200">
                        {String(item.nama_lengkap || "U").charAt(0).toUpperCase()}
                      </div>
                      <p className="font-bold text-slate-800 text-xs truncate max-w-[120px]">{item.nama_lengkap}</p>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3.5 text-center">
                    <StatusDropdown currentStatus={item.status || "PENGAJUAN"} onSelect={(newStatus) => onUpdateStatus(item.timestamp, newStatus)} disabled={userRole !== "superadmin"} />
                  </td>
                  <td className="px-4 sm:px-6 py-3.5 text-right">
                    <button onClick={() => onViewDetails(item)} className="p-2 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all border border-blue-100">
                      <Lucide.Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden w-full">
      {/* Header with Search, Filter, Stats & Actions */}
      {!hideHeader && (
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-white">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 min-w-0">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full xl:w-auto min-w-0">
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                  <Lucide.LayoutList size={16} className="text-[#0d1655]" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-[#0d1655] tracking-tight">Manajemen Pesanan</h3>
              </div>

              {/* Quick Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar w-full max-w-full">
                {[
                  { id: "ALL", label: "Semua", count: quickStats.total, icon: Lucide.LayoutGrid },
                  { id: "PENGAJUAN", label: "Pengajuan", count: data.filter(d => d.status === 'PENGAJUAN' || !d.status).length, icon: Lucide.PlusCircle },
                  { id: "SURVEY", label: "Survei", count: quickStats.survey, icon: Lucide.Search },
                  { id: "PROSES", label: "Proses Pasang", count: quickStats.proses, icon: Lucide.RefreshCw },
                  { id: "PENDING", label: "Pending", count: data.filter(d => d.status === 'PENDING').length, icon: Lucide.Clock },
                  { id: "BATAL", label: "Batal", count: data.filter(d => d.status === 'BATAL').length, icon: Lucide.XCircle }
                ].map(tab => {
                  if (tab.id !== "ALL" && allowedStatuses && !allowedStatuses.includes(tab.id)) return null;
                  const isActive = statusFilter === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setStatusFilter(tab.id); setCurrentPage(1); }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black transition-all border ${isActive
                        ? 'bg-[#0d1655] text-white border-[#0d1655] shadow-md shadow-blue-900/20'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                      <Icon size={14} className={isActive ? "text-white" : "text-slate-400"} />
                      {tab.label}
                      {isActive && (
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] bg-white/20 ml-1">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Lucide.Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama, alamat, WA..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full sm:w-64 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#0d1655] transition-all"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button onClick={exportToCSV} className="flex-1 sm:flex-initial justify-center px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-black text-emerald-600 hover:bg-emerald-100 transition-all flex items-center gap-1.5">
                  <Lucide.FileDown size={14} /> Export
                </button>
                {userRole === "superadmin" && selectedRows.size > 0 && (
                  <button onClick={bulkDelete} className="flex-1 sm:flex-initial justify-center px-3 py-2 bg-rose-50 border border-rose-100 rounded-xl text-xs font-black text-rose-600 hover:bg-rose-100 transition-all flex items-center gap-1.5">
                    <Lucide.Trash2 size={14} /> Hapus ({selectedRows.size})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse table-auto text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {userRole === "superadmin" && (
                <th className="px-3 sm:px-4 py-3.5 w-10">
                  <input type="checkbox" checked={selectedRows.size === paginatedData.length && paginatedData.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded border-slate-300 text-[#0d1655] focus:ring-[#0d1655]" />
                </th>
              )}
              <th className="px-4 sm:px-6 py-3.5 font-black text-[#0d1655] uppercase text-[10px] sm:text-xs tracking-widest cursor-pointer hover:text-[#F47920]" onClick={() => requestSort('nama_lengkap')}>
                <div className="flex items-center gap-1.5 whitespace-nowrap">Pelanggan {getSortIcon('nama_lengkap')}</div>
              </th>
              <th className="px-4 sm:px-6 py-3.5 font-black text-[#0d1655] uppercase text-[10px] sm:text-xs tracking-widest cursor-pointer hover:text-[#F47920] hidden md:table-cell" onClick={() => requestSort('alamat_pemasangan')}>
                <div className="flex items-center gap-1.5 whitespace-nowrap">Alamat {getSortIcon('alamat_pemasangan')}</div>
              </th>
              <th className="px-4 sm:px-6 py-3.5 font-black text-[#0d1655] uppercase text-[10px] sm:text-xs tracking-widest text-center">Status</th>
              <th className="px-4 sm:px-6 py-3.5 font-black text-[#0d1655] uppercase text-[10px] sm:text-xs tracking-widest text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 sm:px-6 py-12 text-center">
                  <div className="flex flex-col items-center text-slate-400">
                    <Lucide.Inbox size={48} className="mb-3 opacity-30" />
                    <p className="text-sm font-bold">Tidak ada data yang cocok</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, idx) => {
                const getRowBg = (status: string) => {
                  if (status === 'SURVEY') return 'bg-amber-50/40 hover:bg-amber-50/80';
                  if (status === 'PROSES') return 'bg-orange-50/40 hover:bg-orange-50/80';
                  if (status === 'PENDING') return 'bg-slate-50/60 hover:bg-slate-100/80';
                  if (status === 'BATAL') return 'bg-red-50/40 hover:bg-red-50/80';
                  return 'hover:bg-slate-50/40';
                };

                return (
                  <tr key={idx} className={`transition-colors ${selectedRows.has(item.timestamp) ? 'bg-emerald-50/60' : getRowBg(item.status || '')}`}>
                    {userRole === "superadmin" && (
                      <td className="px-3 sm:px-4 py-3.5">
                        <input type="checkbox" checked={selectedRows.has(item.timestamp)} onChange={() => toggleSelectRow(item.timestamp)} className="w-4 h-4 rounded border-slate-300 text-[#0d1655]" />
                      </td>
                    )}
                    <td className="px-4 sm:px-6 py-3.5">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-[#0d1655] text-xs sm:text-sm shrink-0 border border-slate-200 shadow-sm">
                          {String(item.nama_lengkap || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <button onClick={() => onViewDetails(item)} className="font-black text-slate-800 text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[160px] hover:text-[#F47920] transition-colors text-left">{item.nama_lengkap}</button>
                            {item.foto_ktp ? (
                              <span className="bg-emerald-50 text-emerald-700 text-[8px] font-black border border-emerald-200/60 px-1.5 py-0.5 rounded-md uppercase tracking-widest shrink-0 scale-95 shadow-sm">KTP</span>
                            ) : (
                              <span className="bg-slate-50 text-slate-400 text-[8px] font-black border border-slate-200/60 px-1.5 py-0.5 rounded-md uppercase tracking-widest shrink-0 scale-95">No KTP</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <p className="text-[10px] text-slate-400 font-bold">ID: #{getCustomerNo(item.timestamp).split('-')[1] || "00"}</p>
                            <span className="text-slate-300">•</span>
                            <p className="text-[10px] text-orange-500 font-black tracking-wide bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100 flex items-center gap-1">
                              <Lucide.Clock size={10} /> {getDaysAgo(item.timestamp)}
                            </p>
                          </div>
                          {/* Mobile Address - Hidden on Desktop */}
                          <div className="md:hidden mt-1">
                            <p className="text-[10px] text-slate-500 truncate max-w-[140px] leading-tight">
                              {String(item.alamat_pemasangan || "")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 hidden md:table-cell">
                      {(() => {
                        const address = String(item.alamat_pemasangan || "");
                        const lowerAddr = address.toLowerCase();
                        let colorConfig = { color: "text-blue-600", bg: "bg-blue-50 border-blue-100" };
                        const keywords: Record<string, { color: string; bg: string }> = {
                          "gumelar": { color: "text-amber-700", bg: "bg-amber-50 border-amber-100" },
                          "cihonje": { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
                          "tlaga": { color: "text-blue-700", bg: "bg-blue-50 border-blue-100" },
                          "samudra": { color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-100" },
                          "cilangkap": { color: "text-sky-700", bg: "bg-sky-50 border-sky-100" },
                          "paningkaban": { color: "text-rose-700", bg: "bg-rose-50 border-rose-100" },
                        };
                        for (const key in keywords) {
                          if (lowerAddr.includes(key)) { colorConfig = keywords[key]; break; }
                        }
                        return (
                          <div className={`inline-block px-2.5 py-1 rounded-lg border ${colorConfig.bg} max-w-[160px] sm:max-w-[240px]`}>
                            <p className={`text-[11px] font-black truncate ${colorConfig.color}`}>{address}</p>
                            {(item.rw || item.rt) && (
                              <div className="flex gap-1 mt-0.5">
                                {item.rw && <span className="text-[9px] font-black bg-[#0d1655] text-white px-1.5 py-0.5 rounded">{item.rw}</span>}
                                {item.rt && <span className="text-[9px] font-black bg-[#F47920] text-white px-1.5 py-0.5 rounded">{item.rt}</span>}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 text-center">
                      <StatusDropdown
                        currentStatus={item.status || "PENGAJUAN"}
                        onSelect={(newStatus) => onUpdateStatus(item.timestamp, newStatus)}
                        allowedStatuses={allowedStatuses}
                        disabled={userRole !== "superadmin"}
                      />
                      {item.status === "AKTIF" && item.tanggal_aktif && !isNaN(new Date(item.tanggal_aktif).getTime()) && (
                        <div className="mt-2 flex flex-col gap-1 items-start">
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-emerald-100 bg-emerald-50 text-[9px] font-bold text-emerald-600">
                            <Lucide.Power size={10} /> Aktif: {new Date(item.tanggal_aktif).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-rose-100 bg-rose-50 text-[9px] font-bold text-rose-600">
                            <Lucide.CalendarDays size={10} /> Jatuh Tempo: Tgl {new Date(item.tanggal_aktif).getDate()} tiap bln
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 text-right">
                      <div className="flex items-center gap-1.5 sm:gap-2 justify-end">
                        {/* Tombol Lihat Detail */}
                        <button onClick={() => onViewDetails(item)} className="p-2 rounded-xl text-[#0d1655] bg-slate-100 hover:bg-slate-200 transition-all border border-slate-200" title="Lihat Detail">
                          <Lucide.Eye size={14} strokeWidth={2.5} />
                        </button>
                        {/* Tombol Edit */}
                        {userRole === "superadmin" && (
                          <button onClick={() => onEdit(item)} className="p-2 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all border border-blue-100" title="Edit Data">
                            <Lucide.Edit3 size={14} strokeWidth={2.5} />
                          </button>
                        )}
                        {/* Tombol WhatsApp */}
                        <button onClick={() => setSelectedWaCustomer(item)} className="p-2 rounded-xl text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all border border-emerald-100" title="Kirim WhatsApp">
                          <Lucide.MessageCircle size={14} strokeWidth={2.5} />
                        </button>
                        {/* Tombol Hapus */}
                        {userRole === "superadmin" && (
                          <button onClick={() => onDelete(item.timestamp)} className="p-2 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all border border-rose-100" title="Hapus">
                            <Lucide.Trash2 size={14} strokeWidth={2.5} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 sm:px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] font-bold text-slate-400">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, sortedData.length)} dari {sortedData.length} data
            {selectedRows.size > 0 && <span className="text-emerald-600 ml-2">({selectedRows.size} dipilih)</span>}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all">
              <Lucide.ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;
              return (
                <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${currentPage === pageNum ? 'bg-[#0d1655] text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  {pageNum}
                </button>
              );
            })}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all">
              <Lucide.ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      <AnimatePresence>
        {selectedWaCustomer && (
          <div className="fixed inset-0 bg-[#0d1655]/45 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-3xl w-full max-w-lg overflow-hidden border border-slate-100 shadow-2xl">
              <div className="px-6 py-5 bg-[#0d1655] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400"><Lucide.MessageCircle size={20} strokeWidth={2.5} /></div>
                  <div>
                    <h3 className="font-black text-xs uppercase tracking-widest">WhatsApp Template</h3>
                    <p className="text-[10px] text-slate-300 font-bold mt-0.5">Kirim ke {selectedWaCustomer.nama_lengkap}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedWaCustomer(null)} className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"><Lucide.X size={16} /></button>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-3">
                  {[
                    { title: "1. Jadwal Survei", message: `*ARMEDIA.ID - SURVEI* 📍\n\nHalo Kak *${selectedWaCustomer.nama_lengkap}*,\n\nTerima kasih telah mendaftar ARMEDIA.ID. Tim kami akan survei di *${selectedWaCustomer.alamat_pemasangan || "-"}*.\n\nMohon informasi jadwal terbaik untuk survei.` },
                    { title: "2. Jadwal Instalasi", message: `*ARMEDIA.ID - INSTALASI* 🔌\n\nHalo Kak *${selectedWaCustomer.nama_lengkap}*,\n\nPendaftaran disetujui! Tim teknisi akan melakukan instalasi di alamat Anda. Mohon kesiapan saat jadwal yang ditentukan.` },
                    { title: "3. Aktivasi & Billing", message: `*ARMEDIA.ID - AKTIF* 💳\n\nHalo Kak *${selectedWaCustomer.nama_lengkap}*,\n\nInternet Anda sudah AKTIF di *${selectedWaCustomer.alamat_pemasangan || "-"}*!\n📦 paket: ${selectedWaCustomer.paket || "-"}\n\nSelamat menikmati internet unlimited!` }
                  ].map((tpl, i) => (
                    <div key={i} className="p-4 bg-white border border-slate-100 hover:border-emerald-500 rounded-2xl transition-all shadow-sm">
                      <h4 className="text-xs font-black text-[#0d1655] uppercase tracking-wider mb-2">{tpl.title}</h4>
                      <p className="text-[10px] text-slate-500 font-bold mb-3 line-clamp-2">{tpl.message}</p>
                      <button
                        onClick={() => {
                          const phone = String(selectedWaCustomer.no_hp_wa || "");
                          const clean = String(phone).replace(/\D/g, "");
                          const waPhone = clean.startsWith("0") ? "62" + clean.slice(1) : clean;
                          window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(tpl.message)}`, "_blank");
                          setSelectedWaCustomer(null);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all"
                      >
                        <Lucide.Send size={12} /> Kirim WhatsApp
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
