import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell, BarChart as ReBarChart, Bar, Legend 
} from 'recharts';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

function LogoMark({ className }: { className?: string }) {
  return (
    <img 
      src="https://ik.imagekit.io/Gumelar/LogO/logo%20pt.png?updatedAt=1778213993513" 
      alt="Logo" 
      className={className || "w-10 h-10 object-contain"} 
    />
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.672 1.433 5.661 1.434h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export default function Dashboard({ googleScriptUrl, onLogout, onNavigateToForm }: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReg, setSelectedReg] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [filterPaket, setFilterPaket] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  const sidebarItems = [
    { id: "Dashboard", icon: Lucide.LayoutDashboard, label: "Overview" },
    { id: "Analytics", icon: Lucide.BarChart3 || Lucide.BarChart, label: "Analytics" },
    { id: "Registrations", icon: Lucide.ClipboardList, label: "Registrations" },
    { id: "Customers", icon: Lucide.Users, label: "Customers" },
    { id: "Map View", icon: Lucide.Map, label: "Geographical" },
    { id: "Settings", icon: Lucide.Settings, label: "Settings" },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(googleScriptUrl);
      const json = await response.json();
      if (Array.isArray(json)) {
        setData(json);
        setError("");
      } else {
        throw new Error("Format data tidak valid");
      }
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      console.error(err);
    }
  };

  // --- Export Functions ---
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");
    XLSX.writeFile(workbook, `Armedia_Registrations_${new Date().toLocaleDateString()}.xlsx`);
  };

  const generatePDF = (preview = false) => {
    const doc = new jsPDF("l", "mm", "a4");
    const title = "Armedia Net - Registration Report";
    doc.setFontSize(20);
    doc.text(title, 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    const headers = [["ID", "Name", "WhatsApp", "Package", "Location", "Timestamp"]];
    const rows = filteredData.map(item => [
      getCustomerNo(item.Timestamp),
      item["Nama Lengkap"],
      item["No HP / WA"],
      String(item.Paket || "").split("(")[0],
      item["Alamat Pemasangan"],
      item.Timestamp
    ]);

    autoTable(doc, {
      startY: 40,
      head: headers,
      body: rows,
      theme: "striped",
      headStyles: { fillColor: [26, 45, 143] },
      styles: { fontSize: 8, font: "helvetica" }
    });

    if (preview) {
      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      setPdfPreviewUrl(url);
    } else {
      doc.save(`Armedia_Report_${new Date().toLocaleDateString()}.pdf`);
    }
  };

  // --- Data Calculations for Analytics ---
  const stats = useMemo(() => {
    if (!data.length) return null;

    const packages: any = {};
    const trends: any = {};
    const providers: any = {};
    const sources: any = {};

    data.forEach(item => {
      const pkg = String(item.Paket || "Unknown").split("(")[0].trim();
      packages[pkg] = (packages[pkg] || 0) + 1;

      const dateStr = item.Timestamp ? item.Timestamp.split(",")[0] : "N/A";
      trends[dateStr] = (trends[dateStr] || 0) + 1;

      const prov = item["Provider Saat Ini"] || "None";
      providers[prov] = (providers[prov] || 0) + 1;

      const src = item["Sumber Info"] || "Direct";
      sources[src] = (sources[src] || 0) + 1;
    });

    const packageData = Object.keys(packages).map(name => ({ name, value: packages[name] }));
    const trendData = Object.keys(trends).map(date => ({ date, count: trends[date] })).slice(-7);
    const providerData = Object.keys(providers).map(name => ({ name, value: providers[name] }));
    const sourceData = Object.keys(sources).map(name => ({ name, value: sources[name] }));

    return { packageData, trendData, providerData, sourceData };
  }, [data]);

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

  const getCustomerNo = (timestamp: string) => {
    if (!timestamp) return "AMN-000";
    const clean = timestamp.replace(/\D/g, "");
    return `AMN-${clean.slice(-5)}`;
  };

  const COLORS = ['#1a2d8f', '#F47920', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-blue-100 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <LogoMark className="w-8 h-8" />
        </div>
      </div>
      <h2 className="text-xl font-bold text-[#1a2d8f] mt-8 tracking-tight">Initializing Dashboard...</h2>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-[#f8fafc] text-[#0f172a]'} font-sans flex transition-colors duration-300`}>
      
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className={`fixed left-0 top-0 h-full ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-slate-200'} border-r z-50 flex flex-col transition-colors duration-300 shadow-xl`}
      >
        <div className="h-24 flex items-center px-6 gap-4 overflow-hidden border-b border-transparent">
          <div className="min-w-[40px]">
            <LogoMark className="w-10 h-10 shadow-lg shadow-blue-500/20 rounded-xl" />
          </div>
          {isSidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-[#1a2d8f] dark:text-blue-400">ARMEDIA<span className="text-[#F47920]">.HUB</span></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enterprise Portal</span>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all relative group ${
                activeTab === item.id 
                ? 'bg-blue-50 text-[#1a2d8f] dark:bg-blue-500/10 dark:text-blue-400' 
                : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {activeTab === item.id && (
                <motion.div layoutId="sidebar-active" className="absolute inset-0 bg-blue-50 dark:bg-blue-500/10 rounded-2xl -z-10" />
              )}
              <item.icon size={22} className={activeTab === item.id ? 'stroke-[2.5px]' : ''} />
              {isSidebarOpen && <span className="font-bold text-sm">{item.label}</span>}
              {!isSidebarOpen && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            {isDarkMode ? <Lucide.Sun size={22} /> : <Lucide.Moon size={22} />}
            {isSidebarOpen && <span className="font-bold text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
          >
            <Lucide.LogOut size={22} />
            {isSidebarOpen && <span className="font-bold text-sm">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-[280px]' : 'ml-[80px]'}`}>
        
        {/* Top Header */}
        <header className={`h-24 px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md ${isDarkMode ? 'bg-[#0f172a]/80' : 'bg-[#f8fafc]/80'}`}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2.5 rounded-xl border ${isDarkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'} transition-all`}
            >
              <Lucide.Menu size={20} />
            </button>
            <h2 className="text-xl font-black italic tracking-tight">{activeTab}</h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Lucide.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Universal Search..."
                className={`w-72 pl-12 pr-4 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all ${
                  isDarkMode ? 'bg-[#1e293b] border-slate-800 focus:border-blue-500' : 'bg-white border-slate-200 focus:border-blue-500'
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button className={`p-2.5 rounded-xl border relative ${isDarkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'}`}>
                <Lucide.Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white dark:border-[#0f172a]"></span>
              </button>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 mx-2"></div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black">Administrator</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Master Control</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a2d8f] to-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                  AD
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
          
          <AnimatePresence mode="wait">
            {activeTab === "Dashboard" && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "Total Registrants", value: data.length, icon: Lucide.Users, trend: "+12.5%", color: "blue" },
                    { label: "Active Services", value: Math.floor(data.length * 0.8), icon: Lucide.Activity, trend: "+5.2%", color: "emerald" },
                    { label: "Conversion Rate", value: "68%", icon: Lucide.TrendingUp, trend: "+2.1%", color: "orange" },
                    { label: "Completion Time", value: "24.8h", icon: Lucide.Calendar, trend: "-1.4%", color: "slate" }
                  ].map((kpi, i) => (
                    <motion.div 
                      key={kpi.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`p-6 rounded-[2rem] border transition-all hover:shadow-2xl ${
                        isDarkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-100 shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-2xl ${
                          kpi.color === 'blue' ? 'bg-blue-50 text-blue-500 dark:bg-blue-500/10' :
                          kpi.color === 'emerald' ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10' :
                          kpi.color === 'orange' ? 'bg-orange-50 text-orange-500 dark:bg-orange-500/10' :
                          'bg-slate-50 text-slate-500 dark:bg-slate-500/10'
                        }`}>
                          <kpi.icon size={24} />
                        </div>
                        <span className={`text-xs font-black px-2 py-1 rounded-lg ${
                          kpi.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-red-50 text-red-600 dark:bg-red-500/10'
                        }`}>
                          {kpi.trend}
                        </span>
                      </div>
                      <h3 className="text-3xl font-black tracking-tight mb-1">{kpi.value}</h3>
                      <p className="text-sm font-bold text-slate-400">{kpi.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Analytics Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className={`lg:col-span-2 p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-xl font-black italic tracking-tight">Registration Trends</h3>
                        <p className="text-xs font-bold text-slate-400">Activity monitor for the last 7 sessions</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-[#1a2d8f] text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-blue-500/20">Weekly</button>
                        <button className="px-4 py-2 text-slate-400 text-[10px] font-black uppercase rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Monthly</button>
                      </div>
                    </div>
                    <div className="h-[350px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats?.trendData || []}>
                          <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#1a2d8f" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#1a2d8f" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: isDarkMode ? '#64748b' : '#94a3b8'}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: isDarkMode ? '#64748b' : '#94a3b8'}} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', background: isDarkMode ? '#1e293b' : '#fff' }}
                            itemStyle={{ fontWeight: 'black', fontSize: '12px' }}
                          />
                          <Area type="monotone" dataKey="count" stroke="#1a2d8f" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <h3 className="text-xl font-black italic tracking-tight mb-8">Package Segment</h3>
                    <div className="h-[300px] w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={stats?.packageData || []}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {(stats?.packageData || []).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RePieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-black">{data.length}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
                      </div>
                    </div>
                    <div className="mt-8 space-y-3">
                      {(stats?.packageData || []).slice(0, 4).map((entry, index) => (
                        <div key={entry.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <span className="text-xs font-bold text-slate-500">{entry.name}</span>
                          </div>
                          <span className="text-xs font-black">{Math.round((entry.value / (data.length || 1)) * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Registrations Table Mini */}
                <div className={`rounded-[2.5rem] border overflow-hidden ${isDarkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                  <div className="p-8 border-b border-transparent flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black italic tracking-tight">Recent Activity</h3>
                      <p className="text-xs font-bold text-slate-400">The latest registration entries</p>
                    </div>
                    <button onClick={() => setActiveTab("Registrations")} className="text-sm font-black text-[#1a2d8f] dark:text-blue-400 flex items-center gap-1 hover:underline">
                      View All Records <Lucide.ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className={`${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Package</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-transparent">
                        {filteredData.slice(0, 5).map((item, idx) => (
                          <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                            <td className="px-8 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-[#1a2d8f] font-black">
                                  {String(item["Nama Lengkap"] || "U").charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-black">{item["Nama Lengkap"]}</p>
                                  <p className="text-[10px] text-slate-400 font-bold">{item.Timestamp}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-4 text-xs font-bold">{String(item.Paket || "").split("(")[0]}</td>
                            <td className="px-8 py-4">
                              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 rounded-full text-[10px] font-black uppercase tracking-wider">Verified</span>
                            </td>
                            <td className="px-8 py-4 text-center">
                              <button onClick={() => setSelectedReg(item)} className="p-2 hover:text-[#1a2d8f] transition-all"><Lucide.ExternalLink size={18} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "Registrations" && (
              <motion.div 
                key="registrations"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="space-y-6"
              >
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
                      <button 
                        onClick={exportToExcel}
                        className="flex items-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/20 text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all"
                      >
                        <Lucide.FileSpreadsheet size={18} /> Excel
                      </button>
                      <button 
                        onClick={() => generatePDF(true)}
                        className="flex items-center gap-2 px-6 py-4 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-500/20 text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all"
                      >
                        <Lucide.FileText size={18} /> PDF Preview
                      </button>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-slate-400">Showing {filteredData.length} records</div>
                </div>

                <div className={`rounded-[2.5rem] border overflow-hidden ${isDarkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className={isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}>
                        <tr>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID / Timestamp</th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Name</th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deployment Address</th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Hub</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredData.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                            <td className="px-8 py-6">
                              <p className="text-[10px] font-black text-[#F47920] mb-1">{getCustomerNo(item.Timestamp)}</p>
                              <p className="text-[10px] text-slate-400 font-bold">{item.Timestamp}</p>
                            </td>
                            <td className="px-8 py-6">
                              <p className="text-sm font-black italic">{item["Nama Lengkap"]}</p>
                              <p className="text-xs font-bold text-slate-400">{item["No HP / WA"]}</p>
                            </td>
                            <td className="px-8 py-6">
                              <p className="text-xs font-bold truncate max-w-xs">{item["Alamat Pemasangan"]}</p>
                              <div className="flex gap-2 mt-2">
                                <span className="text-[9px] font-black px-2 py-0.5 bg-blue-50 text-blue-500 rounded-md uppercase">{String(item.Paket || "").split("(")[0]}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <button onClick={() => window.open(`https://wa.me/${String(item["No HP / WA"] || "").replace(/\D/g, "")}`)} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"><WhatsAppIcon className="w-5 h-5" /></button>
                                <button onClick={() => setSelectedReg(item)} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Lucide.ExternalLink size={20} /></button>
                                <button onClick={() => setConfirmDelete(item.Timestamp)} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Lucide.Trash2 size={20} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "Analytics" && (
              <motion.div 
                key="full-analytics"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                  <h3 className="text-xl font-black italic tracking-tight mb-8">Provider Migration</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReBarChart data={stats?.providerData || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
                        <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 'bold'}} />
                        <YAxis tick={{fontSize: 10, fontWeight: 'bold'}} />
                        <Tooltip contentStyle={{ borderRadius: '16px', background: isDarkMode ? '#1e293b' : '#fff' }} />
                        <Bar dataKey="value" fill="#F47920" radius={[8, 8, 0, 0]} />
                      </ReBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                  <h3 className="text-xl font-black italic tracking-tight mb-8">Discovery Sources</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReBarChart data={stats?.sourceData || []} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" tick={{fontSize: 10, fontWeight: 'bold'}} width={100} />
                        <Tooltip contentStyle={{ borderRadius: '16px', background: isDarkMode ? '#1e293b' : '#fff' }} />
                        <Bar dataKey="value" fill="#1a2d8f" radius={[0, 8, 8, 0]} />
                      </ReBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* Popups & Modals */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className={`${isDarkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-white'} rounded-[3rem] w-full max-w-md p-10 text-center shadow-2xl border`}
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Lucide.Trash2 size={40} />
              </div>
              <h2 className="text-2xl font-black italic uppercase mb-4">Confirm Deletion</h2>
              <p className="text-slate-400 font-bold text-sm mb-8">This action will permanently remove record <span className="text-orange-500">{getCustomerNo(confirmDelete)}</span> from the database.</p>
              <div className="flex gap-4">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black rounded-2xl text-xs uppercase tracking-widest">Cancel</button>
                <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-4 bg-red-500 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-red-500/20">Delete</button>
              </div>
            </motion.div>
          </div>
        )}

        {selectedReg && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
              className={`${isDarkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-white'} rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl border`}
            >
              <div className="bg-[#1a2d8f] p-10 text-white flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20"><Lucide.User size={24} /></div>
                  <div>
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">{getCustomerNo(selectedReg.Timestamp)}</p>
                    <h2 className="text-2xl font-black italic">Registry Details</h2>
                  </div>
                </div>
                <button onClick={() => setSelectedReg(null)} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><Lucide.X size={20} /></button>
              </div>
              <div className="p-10 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Installation Path</p>
                    <p className="font-bold text-sm leading-relaxed">{selectedReg["Alamat Pemasangan"]}</p>
                  </div>
                  <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Service Plan</p>
                    <p className="font-black text-[#1a2d8f] dark:text-blue-400">{String(selectedReg.Paket || "").split("(")[0]}</p>
                  </div>
                  <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Timestamp</p>
                    <p className="font-black text-slate-500">{selectedReg.Timestamp}</p>
                  </div>
                </div>
                {selectedReg["Link Google Maps"] && (
                  <a href={selectedReg["Link Google Maps"]} target="_blank" rel="noreferrer" 
                    className="flex items-center justify-center gap-3 w-full py-5 bg-[#1a2d8f] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20"
                  >
                    <Lucide.MapPin size={18} /> Visualize on Map
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* PDF Preview Modal */}
        {pdfPreviewUrl && (
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
                    onClick={() => generatePDF(false)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-xs font-black uppercase tracking-widest"
                  >
                    <Lucide.Download size={18} /> Download
                  </button>
                  <button 
                    onClick={() => {
                      URL.revokeObjectURL(pdfPreviewUrl);
                      setPdfPreviewUrl(null);
                    }} 
                    className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                  >
                    <Lucide.X size={20} />
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-slate-100 p-4">
                <iframe src={pdfPreviewUrl} className="w-full h-full rounded-2xl border-none shadow-inner" title="PDF Preview"></iframe>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
