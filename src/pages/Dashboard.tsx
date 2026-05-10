import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";

// Components
import { Sidebar } from "../components/dashboard/Sidebar";
import { Header } from "../components/dashboard/Header";
import { KPICards } from "../components/dashboard/KPICards";
import { AnalyticsCharts, FullAnalytics } from "../components/dashboard/AnalyticsCharts";
import { RegistrationTable } from "../components/dashboard/RegistrationTable";
import { PDFPreviewModal, DetailsModal, ConfirmDeleteModal } from "../components/dashboard/Modals";

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(googleScriptUrl);
      const json = await response.json();
      if (Array.isArray(json)) {
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (timestamp: string) => {
    setConfirmDelete(null);
    try {
      await fetch(googleScriptUrl, {
        method: "POST",
        mode: "no-cors",
        body: new URLSearchParams({ action: "delete", timestamp })
      });
      setTimeout(fetchData, 1000);
    } catch (err) {
      console.error("Delete failed:", err);
    }
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
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-[#f8fafc] text-[#0f172a]'} font-sans flex transition-colors duration-300`}>
      
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
                <KPICards totalRegistrants={data.length} isDarkMode={isDarkMode} />
                <AnalyticsCharts stats={stats} isDarkMode={isDarkMode} totalCount={data.length} />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black italic tracking-tight">Recent Activity</h3>
                    <button onClick={() => setActiveTab("Registrations")} className="text-sm font-black text-[#1a2d8f] dark:text-blue-400 flex items-center gap-1 hover:underline">
                      View All Records <Lucide.ChevronRight size={16} />
                    </button>
                  </div>
                  <RegistrationTable 
                    data={filteredData.slice(0, 5)} 
                    isDarkMode={isDarkMode} 
                    onViewDetails={setSelectedReg} 
                    onDelete={setConfirmDelete}
                    mini
                  />
                </div>
              </motion.div>
            )}

            {activeTab === "Registrations" && (
              <motion.div key="registrations" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex gap-4 w-full md:w-auto">
                    <select 
                      className={`flex-1 md:w-64 p-4 rounded-2xl border font-bold text-xs outline-none ${isDarkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-200'}`}
                      value={filterPaket}
                      onChange={(e) => setFilterPaket(e.target.value)}
                    >
                      <option value="">All Packages</option>
                      {stats?.packageData.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                    </select>
                    <div className="flex gap-2">
                      <button onClick={() => exportToExcel(filteredData)} className="flex items-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/20 text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all">
                        <Lucide.FileSpreadsheet size={18} /> Excel
                      </button>
                      <button onClick={() => setPdfPreviewUrl(generatePDFBlobUrl(filteredData))} className="flex items-center gap-2 px-6 py-4 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-500/20 text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all">
                        <Lucide.FileText size={18} /> PDF Preview
                      </button>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-slate-400">Showing {filteredData.length} records</div>
                </div>
                <RegistrationTable 
                  data={filteredData} 
                  isDarkMode={isDarkMode} 
                  onViewDetails={setSelectedReg} 
                  onDelete={setConfirmDelete} 
                />
              </motion.div>
            )}

            {activeTab === "Analytics" && (
              <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <FullAnalytics stats={stats} isDarkMode={isDarkMode} totalCount={data.length} />
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

    </div>
  );
}
