import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";

// Components
import { Sidebar } from "../components/dashboard/Sidebar";
import { PACKAGES } from "../constants/packages";
import { Header } from "../components/dashboard/Header";
import { KPICards } from "../components/dashboard/KPICards";
import { AnalyticsCharts, FullAnalytics } from "../components/dashboard/AnalyticsCharts";
import { RegistrationTable } from "../components/dashboard/RegistrationTable";
import { PDFPreviewModal, DetailsModal, ConfirmDeleteModal, EditRegistrationModal } from "../components/dashboard/Modals";
import { CustomersView } from "../components/dashboard/CustomersView";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { GeographicalView } from "../components/dashboard/GeographicalView";
import { VillageFundChart } from "../components/dashboard/VillageFundChart";

// Utils & Types
import { RegistrationData, DashboardStats } from "../types";
import { calculateStats, exportToExcel, generatePDFBlobUrl, downloadPDF } from "../utils/dashboardUtils";
import { api } from "../utils/apiClient";

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
  Timestamp: String(row.Timestamp || ""),
  NIK: String(row.NIK || ""),
  "Nama Lengkap": String(row["Nama Lengkap"] || ""),
  "No HP / WA": String(row["No HP / WA"] || ""),
  Paket: String(row.Paket || ""),
  "Alamat Pemasangan": String(row["Alamat Pemasangan"] || row["alamat pemasangan"] || ""),
  "Provider Saat Ini": String(row["Provider Saat Ini"] || ""),
  "Sumber Info": String(row["Sumber Info"] || ""),
  Kecamatan: String(row.Kecamatan || row.kecamatan || "GUMELAR"),
  Desa: String(row.Desa || row.desa || ""),
  RW: String(row.RW || row.rw || ""),
  RT: String(row.RT || row.rt || ""),
  "Tanggal Rencana Pasang": String(row["Tanggal Rencana Pasang"] || ""),
  "Link Google Maps": String(row["Link Google Maps"] || ""),
  status: String(row.status || row.Status || "PENGAJUAN"),
  "Foto KTP": String(row["Foto KTP"] || row.fotoKtp || ""),
  "Persetujuan S&K": String(row["Persetujuan S&K"] || row.persetujuanSnk || ""),
  "Catatan": String(row.Catatan || row.catatan || ""),
});

// --- Helper: Extract price from Paket string ---
const extractPrice = (paket: string, packages: typeof PACKAGES): number => {
  // Try to find matching package
  for (const pkg of packages) {
    const pkgLabel = pkg.label.toLowerCase();
    const pkgSpeed = pkg.speed.toLowerCase();
    if (paket.toLowerCase().includes(pkgLabel) || paket.toLowerCase().includes(pkgSpeed)) {
      return parseInt(pkg.price.replace(/\./g, ''));
    }
  }
  // Default fallback to 115000 if no match
  return 115000;
};

// --- Komponen Utama Dashboard ---
export default function Dashboard({ googleScriptUrl, onLogout, userRole = "admin" }: any) {
  const [data, setData] = useState<RegistrationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReg, setSelectedReg] = useState<RegistrationData | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [filterPaket, setFilterPaket] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [editingReg, setEditingReg] = useState<RegistrationData | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  // Filter Mbps dan Desa (permintaan Pak Yusuf)
  const [filterMbps, setFilterMbps] = useState("");
  const [filterDesa, setFilterDesa] = useState("");
  // B: Filter tanggal
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  // D: Notifikasi
  const [notifications, setNotifications] = useState<{ id: string; name: string; time: string }[]>([]);
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

  const silentRefresh = async () => {
    setIsRefreshing(true);
    try {
      let dbData: RegistrationData[] = [];
      let sheetsData: RegistrationData[] = [];
      
      try {
        const res = await api.getRegistrations();
        if (res.data && res.data.length > 0) {
          dbData = res.data;
        }
      } catch (err) {
        console.warn("Backend refresh failed", err);
      }

      if (googleScriptUrl) {
        try {
          const response = await fetch(googleScriptUrl);
          if (response.ok) {
            const result = await response.json();
            if (Array.isArray(result) && result.length > 0) {
              sheetsData = result.map(normalizeRow);
            } else if (result && Array.isArray(result.data) && result.data.length > 0) {
              sheetsData = result.data.map(normalizeRow);
            }
          }
        } catch (err) {
          console.warn("Apps Script refresh failed", err);
        }
      }

      const mergedDataMap = new Map();
      sheetsData.forEach(item => {
        if (item.Timestamp) mergedDataMap.set(item.Timestamp, item);
      });
      dbData.forEach(item => {
        if (item.Timestamp) mergedDataMap.set(item.Timestamp, item);
      });

      let fetchedData = Array.from(mergedDataMap.values());
      fetchedData.sort((a, b) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime());


      if (fetchedData.length > 0) {
        // D: Deteksi pendaftar baru
        setData(prev => {
          if (fetchedData.length > prev.length) {
            const newEntries = fetchedData.slice(0, fetchedData.length - prev.length);
            const notifs = newEntries.map((e: RegistrationData) => ({
              id: e.Timestamp,
              name: e["Nama Lengkap"],
              time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
            }));
            setNotifications(prevNotif => [...notifs, ...prevNotif].slice(0, 10));
            setLastCount(fetchedData.length);
          }
          return fetchedData;
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
      
      let dbData: RegistrationData[] = [];
      let sheetsData: RegistrationData[] = [];
      
      // 1. Fetch live data dari Backend
      try {
        const res = await api.getRegistrations();
        if (res.data && res.data.length > 0) {
          dbData = res.data;
        }
      } catch (err) {
        console.warn("Backend fetch failed", err);
      }
      
      // 2. Fetch dari Google Apps Script
      if (googleScriptUrl) {
        try {
          const response = await fetch(googleScriptUrl);
          if (response.ok) {
            const result = await response.json();
            if (Array.isArray(result) && result.length > 0) {
              sheetsData = result.map(normalizeRow);
            } else if (result && Array.isArray(result.data) && result.data.length > 0) {
              sheetsData = result.data.map(normalizeRow);
            }
          }
        } catch (err) {
          console.warn("Apps Script fetch failed", err);
        }
      }

      // Gabungkan (Merge) data dari Google Sheets dan PostgreSQL Database
      const mergedDataMap = new Map();
      sheetsData.forEach(item => {
        if (item.Timestamp) mergedDataMap.set(item.Timestamp, item);
      });
      // Data Database menimpa Google Sheets (lebih prioritas)
      dbData.forEach(item => {
        if (item.Timestamp) mergedDataMap.set(item.Timestamp, item);
      });

      let fetchedData = Array.from(mergedDataMap.values());
      fetchedData.sort((a, b) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime());


      if (fetchedData.length > 0) {
        setData(fetchedData);
      } else {
        // 3. Fallback data lokal dummy jika tabel kosong
        try {
          const localResponse = await fetch("/data/dummy_data.json");
          if (localResponse.ok) {
            const localJson = await localResponse.json();
            if (Array.isArray(localJson)) {
              setData(localJson.map(normalizeRow));
            }
          }
        } catch (e) {
          console.warn("No dummy data found.");
        }
      }
    } catch (err) {
      console.error("Dashboard init failed", err);
    } finally {
      setLoading(false);
    }
  };


  const handleUpdateStatus = async (timestamp: string, newStatus: string) => {
    if (userRole !== "superadmin") {
      showToast("error", "Akses ditolak: Hanya Superadmin yang bisa mengubah status.");
      return;
    }
    // 1. Update UI Lokal secara Instan
    // Find the item to check its "Tanggal Aktif"
    const item = data.find(r => r.Timestamp === timestamp);
    const finalTanggalAktif = newStatus === "AKTIF" ? new Date().toLocaleDateString("id-ID") : (item ? item["Tanggal Aktif"] : "");
    
    try {
      setData(prev => prev.map(r => r.Timestamp === timestamp ? { ...r, status: newStatus, "Tanggal Aktif": finalTanggalAktif } : r));
      await api.updateStatus(timestamp, newStatus);
      showToast("success", "Status berhasil diubah!");
      
      // Backup asinkron
      const params = new URLSearchParams();
      params.append("action", "update");
      params.append("Timestamp", timestamp);
      params.append("status", newStatus);
      fetch(googleScriptUrl, { method: "POST", mode: "no-cors", body: params }).catch(() => {});
    } catch (err) {
      console.error(err);
      showToast("error", "Gagal mengubah status di database.");
    }
  };

  const handleDelete = async (timestamp: string) => {
    if (userRole !== "superadmin") {
      showToast("error", "Akses ditolak: Hanya Superadmin yang bisa menghapus data.");
      setConfirmDelete(null);
      return;
    }
    try {
      setData(prev => prev.filter(r => r.Timestamp !== timestamp));
      await api.deleteRegistration(timestamp);
      setConfirmDelete(null);
      showToast("success", "Data berhasil dihapus!");
      
      // Backup asinkron
      fetch(googleScriptUrl, { method: "POST", mode: "no-cors", body: new URLSearchParams({ action: "delete", timestamp }) }).catch(() => {});
    } catch (err) {
      console.error(err);
      showToast("error", "Terjadi kesalahan saat menghapus data.");
    }
  };

  // --- IMPLEMENTASI SEKUENSAL INPUT FULL CRUD KE POSTGRESQL ---
  const handleSaveEdit = async (updatedItem: RegistrationData) => {
    if (userRole !== "superadmin") {
      showToast("error", "Akses ditolak: Hanya Superadmin yang bisa menyimpan perubahan.");
      return;
    }
    
    // Penanda unik (Primary Key) riil untuk record baru
    const isNewRecord = !updatedItem.Timestamp || updatedItem.Timestamp.includes("baru") || !data.some(d => d.Timestamp === updatedItem.Timestamp);
    const finalTimestamp = isNewRecord ? new Date().toLocaleString("id-ID") : updatedItem.Timestamp;

    let finalKtpUrl = updatedItem["Foto KTP"] || "";

    // Upload to Storage if the image is a base64 string
    if (finalKtpUrl && finalKtpUrl.startsWith("data:image/")) {
      try {
        const response = await fetch(finalKtpUrl);
        const blob = await response.blob();
        const cleanName = (updatedItem["Nama Lengkap"] || "admin-upload").trim().toUpperCase().replace(/[^A-Z0-9]/g, "_");
        const timestamp = Math.floor(Date.now() / 1000); // Shorter timestamp
        const fileName = `KTP_${cleanName}_${timestamp}.jpg`;
        
        finalKtpUrl = await api.uploadKtp(blob, fileName);
        console.log("📸 KTP successfully uploaded from admin panel:", finalKtpUrl);
      } catch (uploadErr) {
        console.error("Gagal mengunggah KTP baru ke storage:", uploadErr);
      }
    }

    const finalItem: RegistrationData = {
      ...updatedItem,
      Timestamp: finalTimestamp,
      status: updatedItem.status || "PENGAJUAN",
      "Foto KTP": finalKtpUrl
    };

    // 1. Optimistic Update (Manipulasi State lokal agar UI langsung sinkron)
    setData(prev => isNewRecord ? [finalItem, ...prev] : prev.map(item => item.Timestamp === updatedItem.Timestamp ? finalItem : item));

    try {
      // 2. Simpan atau Update ke Database PostgreSQL
      const dbRecord = {
        "Timestamp": finalTimestamp,
        "NIK": updatedItem.NIK || "",
        "Nama Lengkap": updatedItem["Nama Lengkap"] || "",
        "No HP / WA": updatedItem["No HP / WA"] || "",
        "Alamat Pemasangan": updatedItem["Alamat Pemasangan"] || "",
        "Kecamatan": updatedItem.Kecamatan || "GUMELAR",
        "Desa": updatedItem.Desa || "GUMELAR",
        "RW": updatedItem.RW || "",
        "RT": updatedItem.RT || "",
        "Paket": updatedItem.Paket || "",
        "status": updatedItem.status || "PENGAJUAN",
        "Provider Saat Ini": updatedItem["Provider Saat Ini"] || "Belum Pernah Pasang",
        "Sumber Info": updatedItem["Sumber Info"] || "",
        "Link Google Maps": updatedItem["Link Google Maps"] || "",
        "Foto KTP": finalKtpUrl,
        "Persetujuan S&K": updatedItem["Persetujuan S&K"] || "SETUJU (Manual Admin)",
        "Catatan": updatedItem.Catatan || "",
        "Tanggal Aktif": updatedItem["Tanggal Aktif"] || "",
        "Tanggal Rencana Pasang": updatedItem["Tanggal Rencana Pasang"] || ""
      };

      await api.insertRegistration(dbRecord);
      
      setEditingReg(null);
      setIsAddingNew(false);
      showToast("success", "Data pendaftaran berhasil disimpan!");
    } catch (err) {
      console.error(err);
      showToast("error", "Gagal menyimpan ke database.");
    }

    try {
      // 3. Backup asinkron ke Google Sheets
      const params = new URLSearchParams();
      params.append("action", isNewRecord ? "add" : "update");
      params.append("Timestamp", finalTimestamp);
      params.append("Provider Saat Ini", updatedItem["Provider Saat Ini"] || "Belum Pernah Pasang");
      params.append("Nama Lengkap", updatedItem["Nama Lengkap"] || "");
      params.append("Kecamatan", updatedItem.Kecamatan || "GUMELAR");
      params.append("Desa", updatedItem.Desa || "GUMELAR");
      if (updatedItem.RW) params.append("RW", updatedItem.RW);
      if (updatedItem.RT) params.append("RT", updatedItem.RT);
      params.append("Alamat Pemasangan", updatedItem["Alamat Pemasangan"] || "");
      params.append("No HP / WA", updatedItem["No HP / WA"] || "");
      params.append("Paket", updatedItem.Paket || "");
      params.append("Tanggal Rencana Pasang", updatedItem["Tanggal Rencana Pasang"] || "");
      params.append("Waktu Survei", updatedItem["Waktu Survei"] || "");
      params.append("status", updatedItem.status || "PENGAJUAN");
      if (updatedItem["Link Google Maps"]) params.append("Link Google Maps", updatedItem["Link Google Maps"]);
      
      // PERBAIKAN PENTING: Gunakan finalKtpUrl (URL publik dari Backend), bukan base64!
      if (finalKtpUrl) params.append("Foto KTP", finalKtpUrl);

      fetch(googleScriptUrl, { method: "POST", mode: "no-cors", body: params }).catch(() => {});
    } catch (err) {}

    // 4. Background refresh senyap untuk memverifikasi struktur baris
    setTimeout(fetchData, 2000);
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
  const pendingCount = useMemo(() => {
    return (data || []).filter(item => (item.status || "").toUpperCase() === "PENGAJUAN").length;
  }, [data]);
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
          const itemDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          if (filterDateFrom) {
            const [y, m, d] = filterDateFrom.split("-").map(Number);
            matchesDate = matchesDate && itemDate >= new Date(y, m - 1, d);
          }
          if (filterDateTo) {
            const [y, m, d] = filterDateTo.split("-").map(Number);
            matchesDate = matchesDate && itemDate <= new Date(y, m - 1, d);
          }
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

  return <div className={`flex h-screen ${isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-slate-50 text-slate-800'}`}>
        
        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`fixed top-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl border backdrop-blur-lg ${
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

        {/* --- Sidebar Desktop --- */}
      <div className="hidden md:block">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDarkMode={isDarkMode}
          onLogout={onLogout}
          pendingCount={pendingCount}
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
          userRole={userRole}
        />

        {/* Content Header */}
        <section className="px-4 md:px-8 py-6 flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[#0d1655] tracking-tight">
                {activeTab === "Map View" ? "Peta Distribusi" : 
                 activeTab === "Dashboard" ? "Beranda" :
                 activeTab === "Registrations" ? "Data Pendaftaran" :
                 activeTab === "Analytics" ? "Grafik Analitik" :
                 activeTab === "Customers" ? "Data Pelanggan" : activeTab}
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-1 font-bold">Pemantauan & Ringkasan Aktivitas</p>
            </div>
            <div className="flex items-center gap-2">
              {/* H: Auto-refresh indicator */}
              <button
                onClick={silentRefresh}
                title={`Terakhir diperbarui: ${lastRefresh.toLocaleTimeString("id-ID")}`}
                className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${isRefreshing
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
          {/* Filter Status Bar - disembunyikan di tab Data Pelanggan, Dana Desa CSR, dan Analytics */}
          {activeTab !== "Customers" && activeTab !== "Dana Desa CSR" && activeTab !== "Analytics" && <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-3 snap-x">
            {[
              { id: "", label: "Semua", icon: Lucide.LayoutGrid, color: "" },
              { id: "PENGAJUAN", label: "Pengajuan", icon: Lucide.PlusCircle, color: "text-blue-600" },
              { id: "SURVEY", label: "Survei", icon: Lucide.Search, color: "text-orange-500" },
              { id: "PROSES", label: "Proses Pasang", icon: Lucide.Loader2, color: "text-yellow-600" },
              { id: "BATAL", label: "Batal", icon: Lucide.XCircle, color: "text-red-500" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 snap-start border-2 whitespace-nowrap ${filterStatus === f.id
                  ? "bg-[#0d1655] text-white border-[#0d1655] shadow-lg shadow-blue-900/20"
                  : "bg-white text-slate-500 hover:bg-slate-50 border-slate-200"
                  }`}
              >
                <f.icon size={14} className={filterStatus === f.id ? "" : f.color} />
                {f.label}
                {filterStatus === f.id && (
                  <span className="bg-white/20 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                    {f.id === ""
                      ? filteredData.filter(d => !["AKTIF", "NON AKTIF"].includes((d.status || "").toUpperCase())).length
                      : filteredData.length}
                  </span>
                )}
              </button>
            ))}
          </div>}


          {/* Filter Mbps & Desa - disembunyikan di tab Data Pelanggan, Dana Desa CSR, dan Analytics */}
          {activeTab !== "Customers" && activeTab !== "Dana Desa CSR" && activeTab !== "Analytics" && (
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Mbps */}
              <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl px-4 py-2.5 shadow-sm">
                <Lucide.Zap size={14} className="text-[#F47920] shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">Mbps:</span>
                <div className="relative">
                  <select
                    value={filterMbps}
                    onChange={(e) => setFilterMbps(e.target.value)}
                    className="appearance-none bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-black rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:border-[#F47920] hover:border-[#F47920] transition-all cursor-pointer"
                  >
                    <option value="">Semua Mbps</option>
                    <option value="20">20 Mbps</option>
                    <option value="30">30 Mbps</option>
                    <option value="50">50 Mbps</option>
                    <option value="75">75 Mbps</option>
                    <option value="100">100 Mbps</option>
                  </select>
                  <Lucide.ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Filter Desa */}
              <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl px-4 py-2.5 shadow-sm">
                <Lucide.MapPin size={14} className="text-[#0d1655] shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">Desa:</span>
                <div className="relative">
                  <select
                    value={filterDesa}
                    onChange={(e) => setFilterDesa(e.target.value)}
                    className="appearance-none bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-black rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:border-[#0d1655] hover:border-[#0d1655] transition-all cursor-pointer"
                  >
                    <option value="">Semua Desa</option>
                    <option value="GUMELAR">GUMELAR</option>
                    <option value="CIHONJE">CIHONJE</option>
                    <option value="TLAGA">TLAGA</option>
                    <option value="SAMUDRA">SAMUDRA</option>
                    <option value="SAMUDRA KULON">SAMUDRA KULON</option>
                    <option value="CILANGKAP">CILANGKAP</option>
                    <option value="PANINGKABAN">PANINGKABAN</option>
                    <option value="KARANG KEMOJING">KARANG KEMOJING</option>
                    <option value="GANCANG">GANCANG</option>
                    <option value="KEDUNG URANG">KEDUNG URANG</option>
                  </select>
                  <Lucide.ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          )}

          {/* Filter Tanggal - disembunyikan di tab Data Pelanggan */}
          {activeTab !== "Customers" && activeTab === "Registrations" && (
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
                <KPICards totalRegistrants={data.length} statusCounts={stats.statusCounts} isDarkMode={isDarkMode} data={data} />

                {/* 📊 Revenue Summary Cards + Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {/* Revenue Card - Dynamic calculation based on Paket */}
                  <div className="bg-gradient-to-br from-[#0d1655] to-[#1a2a7a] rounded-2xl p-4 text-white shadow-xl shadow-blue-900/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <Lucide.CreditCard size={20} />
                      </div>
                      <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-lg">AKTIF</span>
                    </div>
                    <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">Pendapatan/Bulan</p>
                    <p className="text-xl md:text-2xl font-black">Rp {(() => {
                      const activeData = data.filter(d => (d.status || "").toUpperCase() === "AKTIF");
                      const totalRevenue = activeData.reduce((sum, item) => sum + extractPrice(item.Paket, PACKAGES), 0);
                      return totalRevenue.toLocaleString("id-ID");
                    })()}</p>
                    <p className="text-[10px] text-blue-300 mt-1">{data.filter(d => (d.status || "").toUpperCase() === "AKTIF").length} Pelanggan Aktif</p>
                  </div>

                  {/* Growth Card */}
                  <div className="bg-gradient-to-br from-[#F47920] to-[#d86617] rounded-2xl p-4 text-white shadow-xl shadow-orange-500/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <Lucide.TrendingUp size={20} />
                      </div>
                      <span className="text-[10px] font-black bg-white/20 text-white px-2 py-1 rounded-lg">BULAN INI</span>
                    </div>
                    <p className="text-[10px] font-bold text-orange-100 uppercase tracking-wider mb-1">Total Pendaftar</p>
                    <p className="text-xl md:text-2xl font-black">{data.length}</p>
                    <p className="text-[10px] text-orange-100 mt-1">🎯 Target: 50/bulan</p>
                  </div>

                  {/* Survey Card */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                        <Lucide.MapPin size={20} className="text-indigo-600" />
                      </div>
                      <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg">PIPELINE</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Butuh Survei</p>
                    <p className="text-xl md:text-2xl font-black text-[#0d1655]">{stats.statusCounts?.SURVEY || 0}</p>
                    <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.min(((stats.statusCounts?.SURVEY || 0) / 20) * 100, 100)}%` }}></div>
                    </div>
                  </div>

                  {/* Proses Card */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                        <Lucide.Loader2 size={20} className="text-amber-600" />
                      </div>
                      <span className="text-[10px] font-black bg-amber-50 text-amber-600 px-2 py-1 rounded-lg">PROGRES</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sedang Dipasang</p>
                    <p className="text-xl md:text-2xl font-black text-[#0d1655]">{stats.statusCounts?.PROSES || 0}</p>
                    <div className="mt-2 flex items-center gap-1">
                      <Lucide.CheckCircle size={12} className="text-emerald-500" />
                      <span className="text-[10px] font-bold text-slate-400">{stats.statusCounts?.AKTIF || 0} Aktif</span>
                    </div>
                  </div>
                </div>

                {/* ⚡ Quick Actions */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                  <h4 className="text-xs font-black text-[#0d1655] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Lucide.Zap size={14} className="text-[#F47920]" /> Aksi Cepat
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {userRole === "superadmin" ? (
                      <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-3 bg-[#0d1655] hover:bg-[#1a2a7a] text-white rounded-xl transition-all">
                        <Lucide.PlusCircle size={16} />
                        <span className="text-xs font-black">Tambah Data</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 text-slate-400 rounded-xl border border-slate-200 cursor-not-allowed">
                        <Lucide.Lock size={16} />
                        <span className="text-xs font-bold">Admin Read-Only</span>
                      </div>
                    )}
                    <button onClick={() => exportToExcel(filteredData)} className="flex items-center gap-2 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl transition-all border border-emerald-100">
                      <Lucide.FileSpreadsheet size={16} />
                      <span className="text-xs font-black">Export Excel</span>
                    </button>
                    <button onClick={() => setActiveTab("Analytics")} className="flex items-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-[#0d1655] rounded-xl transition-all border border-blue-100">
                      <Lucide.PieChart size={16} />
                      <span className="text-xs font-black">Lihat Analytics</span>
                    </button>
                    <button onClick={() => setActiveTab("Map View")} className="flex items-center gap-2 px-4 py-3 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl transition-all border border-amber-100">
                      <Lucide.Map size={16} />
                      <span className="text-xs font-black">Peta Wilayah</span>
                    </button>
                  </div>
                </div>

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
                      onEdit={setEditingReg}
                      onDelete={setConfirmDelete}
                      onUpdateStatus={handleUpdateStatus}
                      mini={true}
                      userRole={userRole}
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
                      <button onClick={() => exportToExcel(filteredData)} className="flex flex-col items-center gap-1 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-2xl border-2 border-emerald-100 font-bold hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                        <Lucide.FileSpreadsheet size={20} />
                        <span className="text-[9px] font-black uppercase tracking-wide">Excel</span>
                      </button>
                      <button onClick={async () => setPdfPreviewUrl(await generatePDFBlobUrl(filteredData))} className="flex flex-col items-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-2xl border-2 border-red-100 font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm">
                        <Lucide.FileText size={20} />
                        <span className="text-[9px] font-black uppercase tracking-wide">PDF</span>
                      </button>
                    </div>
                  </div>
                  {userRole === "superadmin" && (
                    <button onClick={handleAddNew} className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-[#F47920] hover:bg-[#d86617] text-white rounded-2xl shadow-xl shadow-orange-500/20 text-sm font-black uppercase tracking-widest transition-all">
                      <Lucide.PlusCircle size={20} /> Tambah Data
                    </button>
                  )}
                </div>

                {/* Table Wrapper */}
                <div className="w-full overflow-x-auto pb-4 custom-scrollbar bg-white rounded-3xl shadow-sm border border-slate-100">
                  <RegistrationTable
                    data={filteredData.filter(d => !["AKTIF", "NON AKTIF"].includes((d.status || "").toUpperCase()))}
                    isDarkMode={isDarkMode}
                    onViewDetails={setSelectedReg}
                    onEdit={setEditingReg}
                    onDelete={setConfirmDelete}
                    onUpdateStatus={handleUpdateStatus}
                    userRole={userRole}
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
                <CustomersView data={data} isDarkMode={isDarkMode} onViewDetails={setSelectedReg} onDelete={setConfirmDelete} onUpdateStatus={handleUpdateStatus} onEdit={setEditingReg} userRole={userRole} />
              </motion.div>
            )}

            {activeTab === "Map View" && (
              <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GeographicalView data={filteredData} isDarkMode={isDarkMode} />
              </motion.div>
            )}

            {activeTab === "Dana Desa CSR" && (
              <motion.div key="dana-desa" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <VillageFundChart data={data} isDarkMode={isDarkMode} />
              </motion.div>
            )}



          </AnimatePresence>
        </section>
      </main>

      {/* Mobile Bottom Navigation Bar - Visible only on Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-200 px-2 py-3 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-safe">
        <div className="grid grid-cols-5 justify-around items-center">
          {[
            { id: "Dashboard", icon: Lucide.Home, label: "Home" },
            { id: "Registrations", icon: Lucide.CheckSquare, label: "Pesanan" },
            { id: "Dana Desa CSR", icon: Lucide.Wallet, label: "Dana Desa" },
            { id: "Map View", icon: Lucide.MapPin, label: "Peta" },
            { id: "Customers", icon: Lucide.Users, label: "Pelanggan" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl transition-all duration-300 ease-out ${isActive ? 'scale-105' : 'hover:scale-95'}`}
              >
                <div className={`relative p-2.5 rounded-full transition-all duration-300 ${isActive ? 'bg-gradient-to-br from-[#f97316] to-[#f47920] shadow-lg shadow-orange-500/30' : 'hover:bg-gray-100'}`}>
                  <tab.icon size={20} className={`transition-all duration-300 ${isActive ? 'text-white scale-110' : 'text-[#0d1655]/60'}`} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isActive ? 'bg-[#f97316] scale-100' : 'bg-transparent'}`} />
                <span className={`text-[9px] font-medium transition-all duration-300 ${isActive ? 'text-[#0d1655] font-semibold' : 'text-[#0d1655]/50'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <PDFPreviewModal url={pdfPreviewUrl} onClose={() => setPdfPreviewUrl(null)} onDownload={async () => await downloadPDF(filteredData)} />
      <DetailsModal item={selectedReg} isDarkMode={isDarkMode} onClose={() => setSelectedReg(null)} />
      <ConfirmDeleteModal timestamp={confirmDelete} isDarkMode={isDarkMode} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete} />
      <EditRegistrationModal item={editingReg} isDarkMode={isDarkMode} onClose={() => setEditingReg(null)} onSave={handleSaveEdit} />
    </div>
  );
}