/**
 * Manajemen Pelanggan - Tab Aktif & Non-Aktif
 * Optimized: Grouped filters, Dynamic Progress Bars
 * Created: 2026-05-21
 */
import React, { useState, useMemo, useEffect } from "react";
import * as Lucide from "lucide-react";
import { RegistrationData } from "../../types";

interface ManajemenPelangganProps {
  data: RegistrationData[];
  isDarkMode: boolean;
  onViewDetails: (item: RegistrationData) => void;
  onDelete: (timestamp: string) => void;
  onUpdateStatus: (timestamp: string, newStatus: string) => void;
  // Sync props from Dashboard
  filterMbps?: string;
  setFilterMbps?: (v: string) => void;
  filterDesa?: string;
  setFilterDesa?: (v: string) => void;
  filterStatus?: string;
  setFilterStatus?: (v: string) => void;
}

// Status configuration with progress
const STATUS_CONFIG: Record<string, { label: string; color: string; badge: string; icon: any; progress: number; progressColor: string }> = {
  "PENGAJUAN": { label: "Pengajuan", color: "bg-blue-50 text-blue-600 border-blue-100", badge: "bg-blue-100 text-blue-700 border-blue-200", icon: Lucide.PlusCircle, progress: 15, progressColor: "bg-blue-500" },
  "SURVEY": { label: "Survei", color: "bg-orange-50 text-orange-600 border-orange-100", badge: "bg-orange-100 text-orange-700 border-orange-200", icon: Lucide.Search, progress: 40, progressColor: "bg-orange-500" },
  "PROSES": { label: "Proses", color: "bg-yellow-50 text-yellow-600 border-yellow-100", badge: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Lucide.Loader2, progress: 70, progressColor: "bg-yellow-500" },
  "AKTIF": { label: "Aktif", color: "bg-emerald-50 text-emerald-600 border-emerald-100", badge: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: Lucide.CheckCircle2, progress: 100, progressColor: "bg-emerald-500" },
  "NON AKTIF": { label: "Non-Aktif", color: "bg-slate-50 text-slate-500 border-slate-200", badge: "bg-slate-100 text-slate-600 border-slate-200", icon: Lucide.PauseCircle, progress: 0, progressColor: "bg-slate-400" },
  "BERHENTI BERLANGGANAN": { label: "Berhenti", color: "bg-red-50 text-red-500 border-red-100", badge: "bg-red-100 text-red-600 border-red-200", icon: Lucide.XCircle, progress: 0, progressColor: "bg-red-400" },
};

// Unique values for filters
const DESA_OPTIONS = ["", "GUMELAR", "CIHONJE", "TLAGA", "SAMUDRA", "SAMUDRA KULON", "CILANGKAP", "PANINGKABAN"];
const MBPS_OPTIONS = ["", "20", "30", "50", "100"];

export const ManajemenPelanggan: React.FC<ManajemenPelangganProps> = ({
  data, isDarkMode, onViewDetails, onDelete, onUpdateStatus,
  filterMbps: externalMbps, setFilterMbps: setExternalMbps,
  filterDesa: externalDesa, setFilterDesa: setExternalDesa,
  filterStatus: externalStatus, setFilterStatus: setExternalStatus,
}) => {
  // Local filter states (sync with Dashboard)
  const [filterSubTab, setFilterSubTab] = useState<"semua" | "AKTIF" | "NON AKTIF">("semua");
  const [filterMbpsLocal, setFilterMbpsLocal] = useState(externalMbps || "");
  const [filterDesaLocal, setFilterDesaLocal] = useState(externalDesa || "");
  const [filterStatusLocal, setFilterStatusLocal] = useState(externalStatus || "");
  const [searchPelanggan, setSearchPelanggan] = useState("");

  // Sync with external props
  useEffect(() => { if (externalMbps !== undefined) setFilterMbpsLocal(externalMbps); }, [externalMbps]);
  useEffect(() => { if (externalDesa !== undefined) setFilterDesaLocal(externalDesa); }, [externalDesa]);
  useEffect(() => { if (externalStatus !== undefined) setFilterStatusLocal(externalStatus); }, [externalStatus]);

  // Handler for filter changes (sync both local and external)
  const handleMbpsChange = (v: string) => {
    setFilterMbpsLocal(v);
    setExternalMbps?.(v);
  };
  const handleDesaChange = (v: string) => {
    setFilterDesaLocal(v);
    setExternalDesa?.(v);
  };
  const handleStatusChange = (v: string) => {
    setFilterStatusLocal(v);
    setExternalStatus?.(v);
  };

  // Filter data based on all filters
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const status = (item.status || "").toUpperCase();
      const matchesSubTab = filterSubTab === "semua" || status === filterSubTab;
      const matchesStatus = !filterStatusLocal || status === filterStatusLocal;
      const matchesMbps = !filterMbpsLocal || String(item.Paket || "").toLowerCase().includes(filterMbpsLocal.toLowerCase());
      const matchesDesa = !filterDesaLocal || (item.Desa || "").toUpperCase() === filterDesaLocal.toUpperCase();
      const search = searchPelanggan.toLowerCase();
      const matchesSearch = !search || 
        String(item["Nama Lengkap"] || "").toLowerCase().includes(search) ||
        String(item["No HP / WA"] || "").includes(search) ||
        String(item["Alamat Pemasangan"] || "").toLowerCase().includes(search);
      return matchesSubTab && matchesStatus && matchesMbps && matchesDesa && matchesSearch;
    });
  }, [data, filterSubTab, filterStatusLocal, filterMbpsLocal, filterDesaLocal, searchPelanggan]);

  // Statistics
  const stats = useMemo(() => {
    const pengajuan = data.filter(d => (d.status || "").toUpperCase() === "PENGAJUAN").length;
    const survei = data.filter(d => (d.status || "").toUpperCase() === "SURVEY").length;
    const proses = data.filter(d => (d.status || "").toUpperCase() === "PROSES").length;
    const aktif = data.filter(d => (d.status || "").toUpperCase() === "AKTIF").length;
    const nonAktif = data.filter(d => (d.status || "").toUpperCase() === "NON AKTIF").length;
    const berhenti = data.filter(d => (d.status || "").toUpperCase() === "BERHENTI BERLANGGANAN").length;
    return { pengajuan, survei, proses, aktif, nonAktif, berhenti, total: data.length };
  }, [data]);

  const getStatusConfig = (status: string) => {
    const s = (status || "").toUpperCase();
    return STATUS_CONFIG[s] || { label: status, color: "bg-slate-50 text-slate-500 border-slate-200", badge: "bg-slate-100 text-slate-600 border-slate-200", icon: Lucide.HelpCircle, progress: 0, progressColor: "bg-slate-400" };
  };

  return (
    <div className="space-y-5">
      {/* Header Stats - 5 Status Cards */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
        {/* Pengajuan */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-3 md:p-4 text-white shadow-lg shadow-blue-500/20">
          <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2">
            <Lucide.PlusCircle size={16} />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-wider opacity-80">Pengajuan</span>
          </div>
          <p className="text-xl md:text-2xl font-black">{stats.pengajuan}</p>
        </div>
        
        {/* Survei */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-3 md:p-4 text-white shadow-lg shadow-orange-500/20">
          <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2">
            <Lucide.Search size={16} />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-wider opacity-80">Survei</span>
          </div>
          <p className="text-xl md:text-2xl font-black">{stats.survei}</p>
        </div>
        
        {/* Proses */}
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-3 md:p-4 text-white shadow-lg shadow-yellow-500/20">
          <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2">
            <Lucide.Loader2 size={16} />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-wider opacity-80">Proses</span>
          </div>
          <p className="text-xl md:text-2xl font-black">{stats.proses}</p>
        </div>
        
        {/* Aktif */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-3 md:p-4 text-white shadow-lg shadow-emerald-500/20">
          <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2">
            <Lucide.CheckCircle2 size={16} />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-wider opacity-80">Aktif</span>
          </div>
          <p className="text-xl md:text-2xl font-black">{stats.aktif}</p>
        </div>
        
        {/* Non-Aktif */}
        <div className="bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl p-3 md:p-4 text-white shadow-lg col-span-3 md:col-span-1">
          <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2">
            <Lucide.PauseCircle size={16} />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-wider opacity-80">Non-Aktif</span>
          </div>
          <p className="text-xl md:text-2xl font-black">{stats.nonAktif}</p>
        </div>
      </div>

      {/* 🎯 GROUPED FILTERS - Single Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-4">
        {/* Filter Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lucide.Filter size={16} className="text-[#0d1655]" />
            <span className="text-xs font-black text-[#0d1655] uppercase tracking-wider">Filter & Pencarian</span>
          </div>
          {(filterStatusLocal || filterMbpsLocal || filterDesaLocal || searchPelanggan) && (
            <button
              onClick={() => { handleStatusChange(""); handleMbpsChange(""); handleDesaChange(""); setSearchPelanggan(""); }}
              className="text-[10px] font-black text-red-500 hover:text-red-600 flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 border border-red-100 transition-all"
            >
              <Lucide.X size={12} /> Reset
            </button>
          )}
        </div>

        {/* Filter Row 1: Status Sub-Tabs + Mbps */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Sub-Tabs */}
          <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1">
            {[
              { id: "semua", label: "Semua", icon: Lucide.LayoutGrid, count: stats.total },
              { id: "AKTIF", label: "Aktif", icon: Lucide.CheckCircle2, count: stats.aktif },
              { id: "NON AKTIF", label: "Non-Aktif", icon: Lucide.PauseCircle, count: stats.nonAktif },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterSubTab(tab.id as "semua" | "AKTIF" | "NON AKTIF")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-black transition-all ${
                  filterSubTab === tab.id 
                    ? tab.id === "AKTIF" ? "bg-emerald-500 text-white shadow-md" 
                      : tab.id === "NON AKTIF" ? "bg-slate-500 text-white shadow-md"
                        : "bg-[#0d1655] text-white shadow-md"
                    : "text-slate-500 hover:bg-white"
                }`}
              >
                <tab.icon size={12} />
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Mbps Filter */}
          <div className="flex items-center gap-2">
            <Lucide.Zap size={14} className="text-[#F47920] shrink-0" />
            <div className="flex items-center gap-1">
              {MBPS_OPTIONS.map(mbps => (
                <button
                  key={mbps}
                  onClick={() => handleMbpsChange(mbps)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all border ${
                    filterMbpsLocal === mbps
                      ? "bg-[#F47920] text-white border-[#F47920] shadow-md"
                      : "bg-white text-slate-500 border-slate-200 hover:border-[#F47920]"
                  }`}
                >
                  {mbps === "" ? "Semua" : `${mbps}M`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Row 2: Status Horizontal + Desa */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Horizontal Scroll */}
          <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1 snap-x">
            {[
              { id: "", label: "Semua", icon: Lucide.Grid3X3 },
              { id: "PENGAJUAN", label: "Pengajuan", icon: Lucide.PlusCircle },
              { id: "SURVEY", label: "Survei", icon: Lucide.Search },
              { id: "PROSES", label: "Proses", icon: Lucide.Loader2 },
              { id: "AKTIF", label: "Aktif", icon: Lucide.CheckCircle2 },
              { id: "NON AKTIF", label: "Non-Aktif", icon: Lucide.PauseCircle },
              { id: "BERHENTI BERLANGGANAN", label: "Berhenti", icon: Lucide.XCircle },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => handleStatusChange(f.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black transition-all shrink-0 snap-start border-2 whitespace-nowrap ${
                  filterStatusLocal === f.id
                    ? "bg-[#0d1655] text-white border-[#0d1655] shadow-lg"
                    : "bg-white text-slate-500 border-slate-200 hover:border-[#0d1655]"
                }`}
              >
                <f.icon size={12} className={filterStatusLocal === f.id ? "" : "text-[#F47920]"} />
                {f.label}
              </button>
            ))}
          </div>

          {/* Desa Filter Dropdown */}
          <div className="relative">
            <select
              value={filterDesaLocal}
              onChange={(e) => handleDesaChange(e.target.value)}
              className="appearance-none bg-white border-2 border-slate-200 rounded-xl px-4 py-2 pr-8 text-[10px] font-black text-slate-600 cursor-pointer hover:border-[#0d1655] transition-all outline-none"
            >
              <option value="">Semua Desa</option>
              {DESA_OPTIONS.filter(d => d).map(desa => (
                <option key={desa} value={desa}>{desa}</option>
              ))}
            </select>
            <Lucide.ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Lucide.Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, nomor HP, atau alamat..."
            value={searchPelanggan}
            onChange={e => setSearchPelanggan(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-100 bg-slate-50 text-xs font-bold outline-none focus:border-[#0d1655] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 px-1">
        <span>Ditemukan {filteredData.length} dari {data.length} pelanggan</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> {stats.aktif} Aktif
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-400" /> {stats.nonAktif} Non-Aktif
          </span>
        </div>
      </div>

      {/* Table with Progress Bars */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Pelanggan</th>
                <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider hidden md:table-cell">Kontak</th>
                <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider hidden lg:table-cell">Alamat</th>
                <th className="text-center px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Progress</th>
                <th className="text-center px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Lucide.Inbox size={48} className="text-slate-200" />
                      <p className="text-sm font-bold text-slate-400">Tidak ada data yang cocok</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => {
                  const statusConfig = getStatusConfig(item.status);
                  const StatusIcon = statusConfig.icon;
                  return (
                    <tr key={item.Timestamp || index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-black text-[#0d1655]">{item["Nama Lengkap"] || "-"}</p>
                        <p className="text-[10px] text-slate-400">{item.Paket || "-"}</p>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <p className="text-xs font-bold text-slate-600">{item["No HP / WA"] || "-"}</p>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <p className="text-xs font-bold text-slate-600 max-w-[180px] truncate">{item["Alamat Pemasangan"] || "-"}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col items-center gap-1.5 min-w-[100px]">
                          {/* Status Badge */}
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black border ${statusConfig.badge}`}>
                            <StatusIcon size={10} />
                            {statusConfig.label}
                          </span>
                          {/* Dynamic Progress Bar */}
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${statusConfig.progressColor}`}
                              style={{ width: `${statusConfig.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onViewDetails(item)}
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-all"
                            title="Detail"
                          >
                            <Lucide.Eye size={15} />
                          </button>
                          {filterSubTab === "AKTIF" ? (
                            <button
                              onClick={() => item.Timestamp && onUpdateStatus(item.Timestamp, "NON AKTIF")}
                              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-all"
                              title="Jadikan Non-Aktif"
                            >
                              <Lucide.ArrowDownCircle size={15} />
                            </button>
                          ) : filterSubTab === "NON AKTIF" ? (
                            <button
                              onClick={() => item.Timestamp && onUpdateStatus(item.Timestamp, "AKTIF")}
                              className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-all"
                              title="Jadikan Aktif"
                            >
                              <Lucide.ArrowUpCircle size={15} />
                            </button>
                          ) : (
                            <button
                              onClick={() => item.Timestamp && onDelete(item.Timestamp)}
                              className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-all"
                              title="Hapus"
                            >
                              <Lucide.Trash2 size={15} />
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
      </div>
    </div>
  );
};
