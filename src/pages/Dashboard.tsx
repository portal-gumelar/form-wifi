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
import { 
  calculateStats, exportToExcel, generatePDFBlobUrl, downloadPDF 
} from "../utils/dashboardUtils";

const CustomPaketDropdown = ({ value, onChange, options }: { value: string, onChange: (v: string) => void, options: { name: string }[] }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const getPaketStyle = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('30.mbps')) return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: Lucide.Zap };
    if (lower.includes('guyub')) return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: Lucide.Users };
    if (lower.includes('20.mbps')) return { color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', icon: Lucide.Activity };
    if (lower.includes('50.mbps')) return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: Lucide.Rocket };
    return { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', icon: Lucide.Box };
  };

  const selectedStyle = value ? getPaketStyle(value) : { color: 'text-[#2b3674]', bg: 'bg-white', border: 'border-[#e0e5f2]', icon: Lucide.Filter };

  return (
    <div className="relative w-full md:w-64" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3 rounded-xl border ${selectedStyle.border} ${selectedStyle.bg} transition-all duration-200 shadow-sm`}
      >
        <div className="flex items-center gap-2">
          <selectedStyle.icon size={16} className={selectedStyle.color} />
          <span className={`text-xs font-black ${selectedStyle.color}`}>
            {value || "All Packages"}
          </span>
        </div>
        <Lucide.ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${selectedStyle.color}`} />
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
              <Lucide.LayoutGrid size={16} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-600">All Packages</span>
            </button>
            <div className="h-px bg-slate-50 my-1 mx-2" />
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
                      <style.icon size={16} className={style.color} />
                      <span className={`text-xs font-black ${style.color}`}>
                        {(() => {
                          const match = opt.name.match(/(\d+)\s*Mbps/i);
                          return match ? `${match[1]}.Mbps` : opt.name;
                        })()}
                      </span>
                      {isSelected && <Lucide.Check size={14} className={`ml-auto ${style.color}`} />}
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Try to load Link Local (cached) data
      let combinedData: RegistrationData[] = [];
      try {
        const localResponse = await fetch("/data/dummy_data.json");
        if (localResponse.ok) {
          const localJson = await localResponse.json();
          if (Array.isArray(localJson)) {
            console.log("Link Local: Loaded cached data", localJson.length);
            combinedData = localJson;
          }
        }
      } catch (e) {
        console.warn("Link Local: No cached data found.");
      }

      // 2. Fetch Live Data
      try {
        const response = await fetch(googleScriptUrl);
        const json = await response.json();
        if (Array.isArray(json)) {
          // 3. Load locally stored status overrides
          const localStatuses = JSON.parse(localStorage.getItem("registration_statuses") || "{}");
          
          const applyStatuses = (list: RegistrationData[]) => list.map(item => ({
            ...item,
            status: localStatuses[item.Timestamp] || item.status || "BARU"
          }));

          if (json.length > 0) {
            setData(applyStatuses(json));
            return;
          }

          if (combinedData.length > 0) {
            setData(applyStatuses(combinedData));
          }
        }
      } catch (err) {
        console.error("Failed to fetch live data, using local cache if available:", err);
        // Fallback to local if fetch failed
        if (combinedData.length > 0) {
          const localStatuses = JSON.parse(localStorage.getItem("registration_statuses") || "{}");
          setData(combinedData.map(item => ({
            ...item,
            status: localStatuses[item.Timestamp] || item.status || "BARU"
          })));
        }
      }
    } catch (err) {
      console.error("Dashboard initialization failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = (timestamp: string, newStatus: string) => {
    // 1. Update state immediately
    setData(prev => prev.map(item => 
      item.Timestamp === timestamp ? { ...item, status: newStatus } : item
    ));

    // 2. Persist to localStorage
    const localStatuses = JSON.parse(localStorage.getItem("registration_statuses") || "{}");
    localStatuses[timestamp] = newStatus;
    localStorage.setItem("registration_statuses", JSON.stringify(localStatuses));
  };

  const handleDelete = async (timestamp: string) => {
    setConfirmDelete(null);
    try {
      await fetch(googleScriptUrl, {
        method: "POST",
        mode: "no-cors",
        body: new URLSearchParams({ action: "delete", timestamp })
      });
      // Update local state immediately for better UX
      setData(prev => prev.filter(item => item.Timestamp !== timestamp));
      setTimeout(fetchData, 2000); // Background refresh
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleSaveEdit = async (updatedItem: RegistrationData) => {
    setEditingReg(null);
    setIsAddingNew(false);
    
    // Update local state immediately
    setData(prev => {
      const exists = prev.find(item => item.Timestamp === updatedItem.Timestamp);
      if (exists) {
        return prev.map(item => item.Timestamp === updatedItem.Timestamp ? updatedItem : item);
      } else {
        return [updatedItem, ...prev];
      }
    });

    try {
      const params = new URLSearchParams();
      params.append("action", updatedItem.Timestamp && data.find(d => d.Timestamp === updatedItem.Timestamp) ? "update" : "add");
      Object.entries(updatedItem).forEach(([key, val]) => {
        params.append(key, String(val));
      });

      await fetch(googleScriptUrl, {
        method: "POST",
        mode: "no-cors",
        body: params
      });
      
      setTimeout(fetchData, 2000);
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const handleAddNew = () => {
    const newEntry: RegistrationData = {
      Timestamp: new Date().toLocaleString("id-ID"),
      "Nama Lengkap": "",
      "No HP / WA": "",
      "Alamat Pemasangan": "",
      Paket: "GUYUB_1 (20 Mbps) - Rp 115.000/Bln",
      status: "BARU",
      "Kecamatan": "GUMELAR",
      "Desa": "GUMELAR"
    };
    setEditingReg(newEntry);
    setIsAddingNew(true);
  };

  const stats = useMemo(() => calculateStats(data), [data]);

  const filteredData = useMemo(() => {
    return (data || []).filter(item => {
      const s = searchTerm.toLowerCase();
      const matchesSearch = 
        String(item["Nama Lengkap"] || "").toLowerCase().includes(s) || 
        String(item["No HP / WA"] || "").includes(s) || 
        String(item["Alamat Pemasangan"] || "").toLowerCase().includes(s);
      
      const matchesPaket = filterPaket === "" || String(item.Paket || "").includes(filterPaket);
      const matchesStatus = filterStatus === "" || item.status === filterStatus;
      return matchesSearch && matchesPaket && matchesStatus;
    }).reverse();
  }, [data, searchTerm, filterPaket, filterStatus]);

  if (loading) return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-blue-100 rounded-full animate-spin"></div>
      </div>
      <h2 className="text-xl font-bold text-[#1a2d8f] mt-8 tracking-tight">Initializing Dashboard...</h2>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f7fe] flex overflow-x-hidden transition-all duration-300 font-sans text-[#2b3674]">
      
      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onLogout={onLogout}
        onAddNew={handleAddNew}
      />

      <main className={`flex-1 w-full transition-all duration-300 md:ml-[80px] lg:ml-[250px] pb-24 md:pb-8 overflow-x-hidden`}>
        
        <Header 
          activeTab={activeTab}
          isDarkMode={isDarkMode}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Content Header */}
        <section className="px-6 py-6 flex flex-col justify-center">
          <h1 className="text-2xl font-bold text-[#1b2559]">
            {activeTab}
          </h1>
          <p className="text-sm text-slate-400 mt-1">Overview & recent activity</p>
        </section>

        <section className="px-4 pb-4">
          {/* Filter Bar */}
          <div className="px-2 mb-6 flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2">
            {[
              { id: "", label: "All Status", icon: Lucide.LayoutGrid },
              { id: "BARU", label: "New", icon: Lucide.PlusCircle },
              { id: "SURVEY", label: "Survey", icon: Lucide.Search },
              { id: "PROSES", label: "Process", icon: Lucide.Loader2 },
              { id: "AKTIF", label: "Active", icon: Lucide.CheckCircle2 },
              { id: "BATAL", label: "Cancelled", icon: Lucide.XCircle },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 shadow-sm ${
                  filterStatus === f.id 
                  ? "bg-[#10b981] text-white shadow-emerald-500/20 translate-y-[-2px]" 
                  : "bg-white text-slate-400 hover:bg-slate-50 border border-slate-100"
                }`}
              >
                <f.icon size={14} className={f.id === 'PROSES' && filterStatus === f.id ? 'animate-spin' : ''} />
                {f.label}
              </button>
            ))}
          </div>
          
          <AnimatePresence mode="wait">
            {activeTab === "Dashboard" && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                <KPICards totalRegistrants={data.length} statusCounts={stats.statusCounts} isDarkMode={isDarkMode} />
                
                <div className="max-w-4xl mx-auto space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-lg font-bold text-[#2b3674]">Recent Activity</h3>
                    <button onClick={() => setActiveTab("Registrations")} className="text-xs font-bold text-[#4318ff] hover:underline">
                      View All
                    </button>
                  </div>
                  <RegistrationTable 
                    data={filteredData.slice(0, 5)} 
                    isDarkMode={isDarkMode} 
                    onViewDetails={setSelectedReg} 
                    onDelete={setConfirmDelete}
                    onUpdateStatus={handleUpdateStatus}
                    mini
                  />
                </div>
              </motion.div>
            )}

            {activeTab === "Registrations" && (
              <motion.div key="registrations" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between px-2">
                  <div className="flex gap-4 w-full md:w-auto">
                    <CustomPaketDropdown 
                      value={filterPaket} 
                      onChange={setFilterPaket} 
                      options={stats?.packageData || []} 
                    />
                    <div className="flex gap-2">
                      <button onClick={() => exportToExcel(filteredData)} className="p-3 bg-[#e6fff5] text-[#01b574] rounded-xl font-bold text-xs hover:bg-[#01b574] hover:text-white transition-all">
                        <Lucide.FileSpreadsheet size={18} />
                      </button>
                      <button onClick={() => setPdfPreviewUrl(generatePDFBlobUrl(filteredData))} className="p-3 bg-[#fff5f5] text-[#ee5d50] rounded-xl font-bold text-xs hover:bg-[#ee5d50] hover:text-white transition-all">
                        <Lucide.FileText size={18} />
                      </button>
                    </div>
                  </div>
                  <button onClick={handleAddNew} className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#4318ff] text-white rounded-xl shadow-lg shadow-blue-500/20 text-xs font-bold uppercase tracking-widest hover:bg-[#3311cc] transition-all">
                    <Lucide.PlusCircle size={20} /> Add New Order
                  </button>
                </div>
                <RegistrationTable 
                  data={filteredData} 
                  isDarkMode={isDarkMode} 
                  onViewDetails={setEditingReg} 
                  onDelete={setConfirmDelete} 
                  onUpdateStatus={handleUpdateStatus}
                />
              </motion.div>
            )}

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

      <PDFPreviewModal 
        url={pdfPreviewUrl} 
        onClose={() => setPdfPreviewUrl(null)} 
        onDownload={() => downloadPDF(filteredData)} 
      />

      <DetailsModal 
        item={selectedReg} 
        isDarkMode={isDarkMode} 
        onClose={() => setSelectedReg(null)} 
      />

      <ConfirmDeleteModal 
        timestamp={confirmDelete} 
        isDarkMode={isDarkMode} 
        onClose={() => setConfirmDelete(null)} 
        onConfirm={handleDelete} 
      />

      <EditRegistrationModal 
        item={editingReg}
        isDarkMode={isDarkMode}
        onClose={() => setEditingReg(null)}
        onSave={handleSaveEdit}
      />

    </div>
  );
}
