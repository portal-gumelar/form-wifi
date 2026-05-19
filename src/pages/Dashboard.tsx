import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";

// Components
import { Sidebar } from "../components/dashboard/Sidebar";
import { Header } from "../components/dashboard/Header";
import { KPICards } from "../components/dashboard/KPICards";
import { AnalyticsCharts, FullAnalytics } from "../components/dashboard/AnalyticsCharts";
import { RegistrationTable } from "../components/dashboard/RegistrationTable";
import { PDFPreviewModal, DetailsModal, ConfirmDeleteModal, EditRegistrationModal } from "../components/dashboard/Modals";
import { CustomersView } from "../components/dashboard/CustomersView";
import { GeographicalView } from "../components/dashboard/GeographicalView";

// Utils & Types
import { RegistrationData, DashboardStats } from "../types";
import { calculateStats, exportToExcel, generatePDFBlobUrl, downloadPDF } from "../utils/dashboardUtils";

// --- Komponen Custom Dropdown ---
const CustomPaketDropdown = ({ value, onChange, options }: { value: string, onChange: (v: string) => void, options: { name: string }[] }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const getPaketStyle = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('30.mbps')) return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: Lucide.Zap };
    if (lower.includes('guyub')) return { color: 'text-[#F47920]', bg: 'bg-orange-50', border: 'border-orange-100', icon: Lucide.Users };
    if (lower.includes('20.mbps')) return { color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', icon: Lucide.Activity };
    if (lower.includes('50.mbps')) return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: Lucide.Rocket };
    return { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', icon: Lucide.Box };
  };

  const selectedStyle = value ? getPaketStyle(value) : { color: 'text-slate-700', bg: 'bg-white', border: 'border-slate-200', icon: Lucide.Filter };

  return (
    <div className="relative w-full md:w-64" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3 rounded-2xl border-2 ${selectedStyle.border} ${selectedStyle.bg} transition-all duration-200 shadow-sm outline-none focus:border-[#0d1655]`}
      >
        <div className="flex items-center gap-2">
          <selectedStyle.icon size={18} className={selectedStyle.color} />
          <span className={`text-sm font-bold ${selectedStyle.color}`}>
            {value || "Semua Paket"}
          </span>
        </div>
        <Lucide.ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${selectedStyle.color}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 p-2 z-[100]"
          >
            <button
              onClick={() => { onChange(""); setIsOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${!value ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
            >
              <Lucide.LayoutGrid size={18} className="text-slate-400" />
              <span className="text-sm font-bold text-slate-600">Semua Paket</span>
            </button>
            <div className="h-px bg-slate-100 my-1 mx-2" />
            <div className="space-y-1 max-h-[250px] overflow-y-auto custom-scrollbar">
              {options.map((opt) => {
                const style = getPaketStyle(opt.name);
                const isSelected = value === opt.name;
                return (
                  <button
                    key={opt.name}
                    onClick={() => { onChange(opt.name); setIsOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isSelected ? style.bg : 'hover:bg-slate-50'}`}
                  >
                    <style.icon size={18} className={style.color} />
                    <span className={`text-sm font-bold ${style.color}`}>
                      {(() => {
                        const match = opt.name.match(/(\d+)\s*Mbps/i);
                        return match ? `${match[1]} Mbps` : opt.name;
                      })()}
                    </span>
                    {isSelected && <Lucide.Check size={16} className={`ml-auto ${style.color}`} />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Normalisasi Field dari Google Sheets (di luar komponen agar selalu tersedia) ---
const normalizeRow = (row: any): RegistrationData => ({
  Timestamp:                String(row.Timestamp || ""),
  "Nama Lengkap":           String(row["Nama Lengkap"] || ""),
  "No HP / WA":             String(row["No HP / WA"] || ""),
  Paket:                    String(row.Paket || ""),
  "Alamat Pemasangan":      String(row["Alamat Pemasangan"] || row["alamat pemasangan"] || ""),
  "Provider Saat Ini":      String(row["Provider Saat Ini"] || ""),
  "Sumber Info":            String(row["Sumber Info"] || ""),
  Kecamatan:                String(row.Kecamatan || row.kecamatan || "GUMELAR"),
  Desa:                     String(row.Desa || row.desa || ""),
  "Tanggal Rencana Pasang": String(row["Tanggal Rencana Pasang"] || ""),
  "Waktu Survei":           String(row["Waktu Survei"] || ""),
  "Link Google Maps":       String(row["Link Google Maps"] || ""),
  status:                   String(row.status || row.Status || "PENGAJUAN"),
  "Foto KTP":               String(row["Foto KTP"] || row.fotoKtp || ""),
  "Persetujuan S&K":        String(row["Persetujuan S&K"] || row.persetujuanSnk || ""),
  "Catatan":                String(row.Catatan || row.catatan || ""),
});

// --- Komponen Utama Dashboard ---
export default function Dashboard({ googleScriptUrl, onLogout }: any) {
  const [data, setData] = useState<RegistrationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReg, setSelectedReg] = useState<RegistrationData | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [filterPaket, setFilterPaket] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [editingReg, setEditingReg] = useState<RegistrationData | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  // Filter Mbps dan Desa (permintaan Pak Yusuf)
  const [filterMbps, setFilterMbps]   = useState("");
  const [filterDesa, setFilterDesa]   = useState("");
  // B: Filter tanggal
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  // D: Notifikasi
  const [notifications, setNotifications] = useState<{id: string; name: string; time: string}[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [lastCount, setLastCount] = useState(0);
  // H: Auto-refresh status
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // H: Auto-refresh setiap 5 menit
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      silentRefresh();
    }, 5 * 60 * 1000); // 5 menit
    return () => clearInterval(interval);
  }, []);

  // H: Silent refresh tanpa loading screen
  const silentRefresh = async () => {
    if (!googleScriptUrl) return;
    setIsRefreshing(true);
    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 15000)
      );
      const response = await Promise.race([fetch(googleScriptUrl), timeout]) as Response;
      const json = await response.json();
      const rawData = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : null);
      if (rawData && rawData.length > 0) {
        const localStatuses = JSON.parse(localStorage.getItem("registration_statuses") || "{}");
        const normalized = rawData.map((item: any) => ({
          ...normalizeRow(item),
          status: localStatuses[item.Timestamp] || item.status || item.Status || "PENGAJUAN"
        }));
        // D: Deteksi pendaftar baru
        setData(prev => {
          if (normalized.length > prev.length) {
            const newEntries = normalized.slice(0, normalized.length - prev.length);
            const notifs = newEntries.map((e: RegistrationData) => ({
              id: e.Timestamp,
              name: e["Nama Lengkap"],
              time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
            }));
            setNotifications(prev => [...notifs, ...prev].slice(0, 10));
            setLastCount(normalized.length);
          }
          return normalized;
        });
        setLastRefresh(new Date());
      }
    } catch (err) {
      console.warn("Silent refresh failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      let combinedData: RegistrationData[] = [];
      try {
        const localResponse = await fetch("/data/dummy_data.json");
        if (localResponse.ok) {
          const localJson = await localResponse.json();
          if (Array.isArray(localJson)) combinedData = localJson;
        }
      } catch (e) {
        console.warn("Link Local: No cached data found.");
      }

      // Guard: jika googleScriptUrl tidak tersedia, skip fetch live
      if (googleScriptUrl) {
        try {
          const timeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 15000)
          );
          const response = await Promise.race([fetch(googleScriptUrl), timeout]) as Response;
          const json = await response.json();
          const rawData = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : null);
          if (rawData) {
            const localStatuses = JSON.parse(localStorage.getItem("registration_statuses") || "{}");
            const applyStatuses = (list: any[]) => list.map(item => ({
              ...normalizeRow(item),
              status: localStatuses[item.Timestamp] || item.status || item.Status || "PENGAJUAN"
            }));

            if (rawData.length > 0) {
              setData(applyStatuses(rawData));
              return;
            }
            if (combinedData.length > 0) setData(applyStatuses(combinedData));
          }
        } catch (err) {
          console.error("Failed to fetch live data:", err);
          if (combinedData.length > 0) {
            const localStatuses = JSON.parse(localStorage.getItem("registration_statuses") || "{}");
            setData(combinedData.map(item => ({
              ...item,
              status: localStatuses[item.Timestamp] || item.status || "PENGAJUAN"
            })));
          }
        }
      } else {
        // Tidak ada URL — langsung pakai data lokal jika ada
        if (combinedData.length > 0) setData(combinedData);
      }
    } catch (err) {
      console.error("Dashboard init failed", err);
    } finally {
      setLoading(false);
    }
  };


  const handleUpdateStatus = async (timestamp: string, newStatus: string) => {
    // 1. Update UI Lokal secara Instan
    setData(prev => prev.map(item => item.Timestamp === timestamp ? { ...item, status: newStatus } : item));

    // 2. Simpan di cache lokal browser
    const localStatuses = JSON.parse(localStorage.getItem("registration_statuses") || "{}");
    localStatuses[timestamp] = newStatus;
    localStorage.setItem("registration_statuses", JSON.stringify(localStatuses));

    // 3. Sinkronisasikan perubahan status langsung ke basis data Google Sheets
    try {
      const targetItem = data.find(item => item.Timestamp === timestamp);
      if (targetItem) {
        const params = new URLSearchParams();
        params.append("action", "update");
        params.append("Timestamp", timestamp);
        params.append("status", newStatus);

        await fetch(googleScriptUrl, { method: "POST", mode: "no-cors", body: params });
      }
    } catch (err) {
      console.error("Gagal memperbarui status ke server:", err);
    }
  };

  const handleDelete = async (timestamp: string) => {
    setConfirmDelete(null);
    try {
      await fetch(googleScriptUrl, { method: "POST", mode: "no-cors", body: new URLSearchParams({ action: "delete", timestamp }) });
      setData(prev => prev.filter(item => item.Timestamp !== timestamp));
      setTimeout(fetchData, 2000);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // --- REVISI TOTAL: IMPLEMENTASI SEKUENSAL INPUT FULL CRUD KE GOOGLE SHEETS ---
  const handleSaveEdit = async (updatedItem: RegistrationData) => {
    setEditingReg(null);
    setIsAddingNew(false);

    // Penanda unik (Primary Key) riil untuk record baru
    const isNewRecord = !updatedItem.Timestamp || updatedItem.Timestamp.includes("baru") || !data.some(d => d.Timestamp === updatedItem.Timestamp);
    const finalTimestamp = isNewRecord ? new Date().toLocaleString("id-ID") : updatedItem.Timestamp;

    const finalItem: RegistrationData = {
      ...updatedItem,
      Timestamp: finalTimestamp,
      status: updatedItem.status || "PENGAJUAN"
    };

    // 1. Optimistic Update (Manipulasi State lokal agar UI langsung sinkron tanpa loading delay)
    setData(prev => isNewRecord ? [finalItem, ...prev] : prev.map(item => item.Timestamp === updatedItem.Timestamp ? finalItem : item));

    try {
      // 2. Racik Paket Data Pencocokan Header Google Sheets
      const params = new URLSearchParams();
      params.append("action", isNewRecord ? "add" : "update");
      params.append("Timestamp", finalTimestamp);
      params.append("Provider Saat Ini", updatedItem["Provider Saat Ini"] || "Belum Pernah Pasang");
      params.append("Nama Lengkap", updatedItem["Nama Lengkap"] || "");
      params.append("Kecamatan", updatedItem.Kecamatan || "GUMELAR");
      params.append("Desa", updatedItem.Desa || "GUMELAR");
      params.append("Alamat Pemasangan", updatedItem["Alamat Pemasangan"] || "");
      params.append("No HP / WA", updatedItem["No HP / WA"] || "");
      params.append("Paket", updatedItem.Paket || "");
      params.append("Tanggal Rencana Pasang", updatedItem["Tanggal Rencana Pasang"] || "");
      params.append("Waktu Survei", updatedItem["Waktu Survei"] || "");
      params.append("status", updatedItem.status || "PENGAJUAN");
      if (updatedItem["Link Google Maps"]) {
        params.append("Link Google Maps", updatedItem["Link Google Maps"]);
      }
      if (updatedItem["Foto KTP"]) {
        params.append("Foto KTP", updatedItem["Foto KTP"]);
      }

      // 3. Tembak Payload via POST Method ke Jembatan API GAS Anda
      await fetch(googleScriptUrl, {
        method: "POST",
        mode: "no-cors",
        body: params
      });

      // 4. Background refresh senyap untuk memverifikasi struktur baris
      setTimeout(fetchData, 2000);
    } catch (err) {
      console.error("Koneksi CRUD Server Gagal:", err);
    }
  };

  const handleAddNew = () => {
    const newEntry: RegistrationData = {
      Timestamp: "baru-" + Date.now(),
      "Nama Lengkap": "", "No HP / WA": "", "Alamat Pemasangan": "",
      "Provider Saat Ini": "Belum Pernah Pasang", "Sumber Info": "Rekomendasi Teman",
      Paket: "GUYUB_1 (20 Mbps) - Rp 115.000/Bln", status: "PENGAJUAN", "Kecamatan": "GUMELAR", "Desa": "GUMELAR",
      "Persetujuan S&K": "SETUJU (Manual Admin)",
      "Catatan": ""
    };
    setEditingReg(newEntry);
    setIsAddingNew(true);
  };

  const stats = useMemo(() => calculateStats(data), [data]);
  const filteredData = useMemo(() => {
    return (data || []).filter(item => {
      const s = searchTerm.toLowerCase();
      const matchesSearch = String(item["Nama Lengkap"] || "").toLowerCase().includes(s)
        || String(item["No HP / WA"] || "").includes(s)
        || String(item["Alamat Pemasangan"] || "").toLowerCase().includes(s);
      const matchesPaket = filterPaket === "" || String(item.Paket || "").includes(filterPaket);
      const matchesStatus = filterStatus === "" || (item.status || "").toUpperCase() === filterStatus;
      // Filter Mbps: cocokkan angka Mbps dalam nama paket
      const matchesMbps = filterMbps === "" || String(item.Paket || "").toLowerCase().includes(filterMbps.toLowerCase());
      // Filter Desa
      const matchesDesa = filterDesa === "" || (item.Desa || "").toUpperCase() === filterDesa.toUpperCase();
      // B: Filter tanggal
      let matchesDate = true;
      if (filterDateFrom || filterDateTo) {
        const tsDate = item.Timestamp ? item.Timestamp.split(",")[0] : "";
        const parts = tsDate.split("/");
        if (parts.length === 3) {
          const itemDate = new Date(parseInt(parts[2]), parseInt(parts[1])-1, parseInt(parts[0]));
          if (filterDateFrom) matchesDate = matchesDate && itemDate >= new Date(filterDateFrom);
          if (filterDateTo)   matchesDate = matchesDate && itemDate <= new Date(filterDateTo);
        }
      }
      return matchesSearch && matchesPaket && matchesStatus && matchesMbps && matchesDesa && matchesDate;
    }).reverse();
  }, [data, searchTerm, filterPaket, filterStatus, filterMbps, filterDesa, filterDateFrom, filterDateTo]);

  const unreadNotifCount = notifications.length;

  if (loading) return (
    <div className="min-h-screen bg-[#0d1655] flex flex-col items-center justify-center p-4">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-[#F47920]/30 border-t-[#F47920] rounded-full animate-spin"></div>
      </div>
      <h2 className="text-xl font-bold text-white mt-8 tracking-widest uppercase">Memuat Sistem...</h2>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans text-slate-800">

      {/* Sidebar - Tersembunyi di HP, Aktif di Laptop */}
      <div className="hidden md:block">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          onLogout={onLogout}
          onAddNew={handleAddNew}
        />
      </div>

      <main className={`flex-1 h-screen w-full transition-all duration-300 md:ml-[80px] lg:ml-[250px] pb-24 md:pb-0 overflow-y-auto overflow-x-hidden custom-scrollbar relative`}>

        <Header
          activeTab={activeTab}
          isDarkMode={isDarkMode}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Content Header */}
        <section className="px-4 md:px-8 py-6 flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[#0d1655] tracking-tight">{activeTab}</h1>
              <p className="text-xs md:text-sm text-slate-500 mt-1 font-bold">Pemantauan & Ringkasan Aktivitas</p>
            </div>
            <div className="flex items-center gap-2">
              {/* H: Auto-refresh indicator */}
              <button
                onClick={silentRefresh}
                title={`Terakhir diperbarui: ${lastRefresh.toLocaleTimeString("id-ID")}`}
                className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                  isRefreshing
                    ? "bg-blue-50 border-blue-200 text-blue-600 animate-pulse"
                    : "bg-white border-slate-200 text-slate-500 hover:border-[#0d1655] hover:text-[#0d1655]"
                }`}
              >
                <Lucide.RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
                {isRefreshing ? "Memperbarui..." : `${lastRefresh.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`}
              </button>

              {/* D: Notifikasi bell */}
              <div className="relative">
                <button
                  onClick={() => { setShowNotif(!showNotif); setNotifications([]); }}
                  className="relative w-10 h-10 flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white hover:border-orange-300 transition-all"
                >
                  <Lucide.Bell size={18} className="text-slate-500" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                      {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                    </span>
                  )}
                </button>
                {showNotif && (
                  <div className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                      <p className="text-xs font-black text-[#0d1655] uppercase tracking-wider">Pendaftar Baru</p>
                      <button onClick={() => setShowNotif(false)} className="text-slate-400 hover:text-slate-600"><Lucide.X size={14} /></button>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-slate-400 font-bold">Tidak ada notifikasi baru</div>
                    ) : (
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((n, i) => (
                          <div key={i} className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black text-sm shrink-0">
                              {n.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-slate-800 truncate">{n.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold">{n.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tombol Keluar HP */}
              <button
                onClick={onLogout}
                className="md:hidden flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-black uppercase tracking-wider border border-red-100 transition-all"
              >
                <Lucide.LogOut size={14} /> Keluar
              </button>
            </div>
          </div>
        </section>

        <section className="px-4 md:px-8 pb-8 space-y-6">
          {/* Filter Status Bar - Status SOP Armedia (Pak Yusuf) */}
          <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-3 snap-x">
            {[
              { id: "",                       label: "Semua",                  icon: Lucide.LayoutGrid,   color: "" },
              { id: "PENGAJUAN",              label: "Pengajuan",              icon: Lucide.PlusCircle,   color: "text-blue-600" },
              { id: "SURVEY",                 label: "Survei",                 icon: Lucide.Search,       color: "text-orange-500" },
              { id: "PROSES",                 label: "Proses Pasang",          icon: Lucide.Loader2,      color: "text-yellow-600" },
              { id: "AKTIF",                  label: "Aktif",                  icon: Lucide.CheckCircle2, color: "text-emerald-600" },
              { id: "NON AKTIF",              label: "Non Aktif",              icon: Lucide.PauseCircle,  color: "text-slate-500" },
              { id: "BERHENTI BERLANGGANAN",  label: "Berhenti Berlangganan",  icon: Lucide.XCircle,      color: "text-red-500" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 snap-start border-2 whitespace-nowrap ${
                  filterStatus === f.id
                    ? "bg-[#0d1655] text-white border-[#0d1655] shadow-lg shadow-blue-900/20"
                    : "bg-white text-slate-500 hover:bg-slate-50 border-slate-200"
                }`}
              >
                <f.icon size={14} className={filterStatus === f.id ? "" : f.color} />
                {f.label}
                {filterStatus === f.id && (
                  <span className="bg-white/20 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                    {filteredData.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Filter Mbps & Desa - permintaan Pak Yusuf */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Mbps */}
            <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl px-4 py-2.5 shadow-sm">
              <Lucide.Zap size={14} className="text-[#F47920] shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">Mbps:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {["", "20", "30", "50", "100"].map(mbps => (
                  <button
                    key={mbps}
                    onClick={() => setFilterMbps(mbps)}
                    className={`px-3 py-1 rounded-xl text-[10px] font-black transition-all border ${
                      filterMbps === mbps
                        ? "bg-[#F47920] text-white border-[#F47920]"
                        : "bg-slate-50 text-slate-500 border-slate-200 hover:border-[#F47920]"
                    }`}
                  >
                    {mbps === "" ? "Semua" : `${mbps} Mbps`}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Desa */}
            <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl px-4 py-2.5 shadow-sm">
              <Lucide.MapPin size={14} className="text-[#0d1655] shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">Desa:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  "",
                  "GUMELAR", "CIHONJE", "TLAGA", "SAMUDRA",
                  "SAMUDRA KULON", "CILANGKAP", "PANINGKABAN"
                ].map(desa => (
                  <button
                    key={desa}
                    onClick={() => setFilterDesa(desa)}
                    className={`px-3 py-1 rounded-xl text-[10px] font-black transition-all border ${
                      filterDesa === desa
                        ? "bg-[#0d1655] text-white border-[#0d1655]"
                        : desa === "" ? "bg-slate-50 text-slate-500 border-slate-200 hover:border-[#0d1655]" : "bg-slate-50 text-slate-500 border-slate-200 hover:border-[#0d1655]"
                    }`}
                  >
                    {desa === "" ? "Semua Desa" : desa}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* B: Filter Tanggal */}
          {(activeTab === "Kelola Pesanan" || activeTab === "Data Pelanggan") && (
            <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider shrink-0">
                <Lucide.Calendar size={14} className="text-[#F47920]" />
                Filter Tanggal:
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)}
                  className="text-xs font-bold border-2 border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#F47920] transition-all bg-slate-50" />
                <span className="text-slate-400 font-bold text-xs">s/d</span>
                <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)}
                  className="text-xs font-bold border-2 border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#F47920] transition-all bg-slate-50" />
                {(filterDateFrom || filterDateTo) && (
                  <>
                    <button onClick={() => { setFilterDateFrom(""); setFilterDateTo(""); }}
                      className="text-[10px] font-black text-red-500 flex items-center gap-1 px-2 py-1 rounded-lg border border-red-100 bg-red-50 transition-all">
                      <Lucide.X size={10} /> Reset
                    </button>
                    <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                      {filteredData.length} data
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* Dashboard Tab */}
            {activeTab === "Dashboard" && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                <KPICards totalRegistrants={data.length} statusCounts={stats.statusCounts} isDarkMode={isDarkMode} />

                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-lg font-black text-[#0d1655]">Aktivitas Terbaru</h3>
                    <button onClick={() => setActiveTab("Registrations")} className="text-xs font-bold text-[#F47920] hover:underline flex items-center gap-1">
                      Lihat Semua <Lucide.ArrowRight size={14} />
                    </button>
                  </div>
                  {/* Table Wrapper for Mobile Scrolling */}
                  <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
                    <RegistrationTable
                      data={filteredData.slice(0, 5)}
                      isDarkMode={isDarkMode}
                      onViewDetails={setSelectedReg}
                      onDelete={setConfirmDelete}
                      onUpdateStatus={handleUpdateStatus}
                      mini
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Registrations Tab */}
            {activeTab === "Registrations" && (
              <motion.div key="registrations" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="space-y-6">

                {/* Action Bar */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-row gap-3 w-full md:w-auto">
                    <CustomPaketDropdown
                      value={filterPaket}
                      onChange={setFilterPaket}
                      options={stats?.packageData || []}
                    />
                    <div className="flex gap-2">
                      <button onClick={() => exportToExcel(filteredData)} className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border-2 border-emerald-100 font-bold hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                        <Lucide.FileSpreadsheet size={20} />
                      </button>
                      <button onClick={() => setPdfPreviewUrl(generatePDFBlobUrl(filteredData))} className="p-3 bg-red-50 text-red-600 rounded-2xl border-2 border-red-100 font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm">
                        <Lucide.FileText size={20} />
                      </button>
                    </div>
                  </div>
                  <button onClick={handleAddNew} className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-[#F47920] hover:bg-[#d86617] text-white rounded-2xl shadow-xl shadow-orange-500/20 text-sm font-black uppercase tracking-widest transition-all">
                    <Lucide.PlusCircle size={20} /> Tambah Data
                  </button>
                </div>

                {/* Table Wrapper */}
                <div className="w-full overflow-x-auto pb-4 custom-scrollbar bg-white rounded-3xl shadow-sm border border-slate-100">
                  <RegistrationTable
                    data={filteredData}
                    isDarkMode={isDarkMode}
                    onViewDetails={setEditingReg}
                    onDelete={setConfirmDelete}
                    onUpdateStatus={handleUpdateStatus}
                  />
                </div>
              </motion.div>
            )}

            {/* Other Tabs */}
            {activeTab === "Analytics" && (
              <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <FullAnalytics stats={stats} isDarkMode={isDarkMode} totalCount={data.length} />
              </motion.div>
            )}

            {activeTab === "Customers" && (
              <motion.div key="customers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <CustomersView data={data} isDarkMode={isDarkMode} onViewDetails={setSelectedReg} onDelete={setConfirmDelete} onUpdateStatus={handleUpdateStatus} />
              </motion.div>
            )}

            {activeTab === "Map View" && (
              <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GeographicalView data={data} isDarkMode={isDarkMode} />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Mobile Bottom Navigation Bar - Visible only on Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-200 px-6 py-4 flex justify-between items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-safe">
        {[
          { id: "Dashboard", icon: Lucide.Home },
          { id: "Registrations", icon: Lucide.Users },
          { id: "Analytics", icon: Lucide.PieChart },
          { id: "Map View", icon: Lucide.Map },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 p-2 transition-all ${isActive ? "text-[#0d1655] scale-110" : "text-slate-400 hover:text-slate-600"}`}
            >
              <tab.icon size={22} className={isActive ? "fill-blue-900/10" : ""} />
              <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? "opacity-100" : "opacity-0 h-0"}`}>
                {tab.id.slice(0, 4)}
              </span>
            </button>
          )
        })}
      </div>

      {/* Modals */}
      <PDFPreviewModal url={pdfPreviewUrl} onClose={() => setPdfPreviewUrl(null)} onDownload={() => downloadPDF(filteredData)} />
      <DetailsModal item={selectedReg} isDarkMode={isDarkMode} onClose={() => setSelectedReg(null)} />
      <ConfirmDeleteModal timestamp={confirmDelete} isDarkMode={isDarkMode} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete} />
      <EditRegistrationModal item={editingReg} isDarkMode={isDarkMode} onClose={() => setEditingReg(null)} onSave={handleSaveEdit} />
    </div>
  );
}