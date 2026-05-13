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
import { SettingsView } from "../components/dashboard/SettingsView";

// Utils & Types
import { RegistrationData } from "../types";
import { 
  calculateStats, exportToExcel, generatePDFBlobUrl, downloadPDF 
} from "../utils/dashboardUtils";

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
      return matchesSearch && matchesPaket;
    }).reverse();
  }, [data, searchTerm, filterPaket]);

  if (loading) return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-blue-100 rounded-full animate-spin"></div>
      </div>
      <h2 className="text-xl font-bold text-[#1a2d8f] mt-8 tracking-tight">Initializing Dashboard...</h2>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f7fe] flex transition-all duration-300">
      
      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onLogout={onLogout}
      />

      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-[280px]' : 'ml-[80px]'}`}>
        
        <Header 
          activeTab={activeTab}
          isDarkMode={isDarkMode}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
          
          <AnimatePresence mode="wait">
            {activeTab === "Dashboard" && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                <KPICards totalRegistrants={data.length} statusCounts={stats.statusCounts} isDarkMode={isDarkMode} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
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
                  <AnalyticsCharts stats={stats} isDarkMode={isDarkMode} totalCount={data.length} />
                </div>
              </motion.div>
            )}

            {activeTab === "Registrations" && (
              <motion.div key="registrations" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between px-2">
                  <div className="flex gap-4 w-full md:w-auto">
                    <select 
                      className="flex-1 md:w-64 p-3 rounded-xl bg-white border border-[#e0e5f2] font-bold text-xs outline-none text-[#2b3674]"
                      value={filterPaket}
                      onChange={(e) => setFilterPaket(e.target.value)}
                    >
                      <option value="">All Packages</option>
                      {stats?.packageData.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                    </select>
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

            {activeTab === "Settings" && (
              <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <SettingsView isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} googleScriptUrl={googleScriptUrl} />
              </motion.div>
            )}
          </AnimatePresence>

        </div>
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
