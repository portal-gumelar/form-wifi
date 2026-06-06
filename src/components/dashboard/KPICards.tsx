import React, { useMemo } from "react";
import { motion } from "framer-motion";
import * as Lucide from "lucide-react";
import { RegistrationData } from "../../types";

interface KPICardsProps {
  totalRegistrants: number;
  statusCounts: Record<string, number>;
  isDarkMode: boolean;
  data?: RegistrationData[]; // Add data prop for package breakdown
  kpiStats?: any;
}

// Extract Mbps speed from paket string
const extractMbps = (paket: string): string => {
  if (!paket) return "Unknown";
  const lower = paket.toLowerCase();
  
  // Match patterns like "20 Mbps", "30mbps", "50 MBPS", etc.
  const match = paket.match(/(\d+)\s*(?:mbps|mbps)/i);
  if (match) return match[1];
  
  // Fallback: check package names
  if (lower.includes("paket_5") || lower.includes("100")) return "100";
  if (lower.includes("paket_4") || lower.includes("75")) return "75";
  if (lower.includes("paket_3") || lower.includes("50")) return "50";
  if (lower.includes("paket_2") || lower.includes("30")) return "30";
  if (lower.includes("paket_1") || lower.includes("20")) return "20";
  
  return "Unknown";
};

// Get color for Mbps
const getMbpsColor = (mbps: string): { text: string; bg: string; border: string } => {
  switch (mbps) {
    case "20": return { text: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" };
    case "30": return { text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" };
    case "50": return { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" };
    case "75": return { text: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" };
    case "100": return { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" };
    default: return { text: "text-slate-600", bg: "bg-slate-50", border: "border-slate-100" };
  }
};

export const KPICards: React.FC<KPICardsProps> = ({ totalRegistrants, statusCounts, data = [], kpiStats }) => {
  // Calculate package breakdown from data
  const packageBreakdown = useMemo(() => {
    const packageMap = new Map<string, number>();
    
    // Only count AKTIF customers for revenue
    const activeData = data.filter(item => (item.status || "").toUpperCase() === "AKTIF" || (item.status || "") === "active");
    
    activeData.forEach(item => {
      const mbps = extractMbps(item.paket);
      if (mbps !== "Unknown") {
        packageMap.set(mbps, (packageMap.get(mbps) || 0) + 1);
      }
    });
    
    // Sort by Mbps value (ascending)
    return Array.from(packageMap.entries())
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map(([mbps, count]) => ({ mbps, count }));
  }, [data]);

  const kpiData = kpiStats ? [
    { label: "Total Pesanan",    value: kpiStats.total,                                                                                          icon: Lucide.ClipboardList, color: "text-[#0d1655]",   bg: "bg-blue-50 border-blue-100" },
    { label: "Pelanggan Aktif",  value: kpiStats.active,                                                                              icon: Lucide.UserCheck,     color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
    { label: "Survei / Proses",  value: kpiStats.pending,                                            icon: Lucide.Search,        color: "text-[#F47920]",   bg: "bg-orange-50 border-orange-100" },
    { label: "Belum Aktif",      value: kpiStats.suspended,                         icon: Lucide.PauseCircle,   color: "text-slate-500",   bg: "bg-slate-50 border-slate-100" },
  ] : [
    { label: "Total Pesanan",    value: totalRegistrants,                                                                                          icon: Lucide.ClipboardList, color: "text-[#0d1655]",   bg: "bg-blue-50 border-blue-100" },
    { label: "Pelanggan Aktif",  value: statusCounts["AKTIF"]  || 0,                                                                              icon: Lucide.UserCheck,     color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
    { label: "Survei / Proses",  value: (statusCounts["SURVEY"] || 0) + (statusCounts["PROSES"] || 0),                                            icon: Lucide.Search,        color: "text-[#F47920]",   bg: "bg-orange-50 border-orange-100" },
    { label: "Belum Aktif",      value: (statusCounts["NON AKTIF"] || 0) + (statusCounts["BERHENTI BERLANGGANAN"] || 0),                         icon: Lucide.PauseCircle,   color: "text-slate-500",   bg: "bg-slate-50 border-slate-100" },
  ];

  return (
    <div className="mb-6 w-full">
      <div className="flex items-center gap-2 mb-4 px-1">
        <div className="w-2 h-2 rounded-full bg-[#F47920] animate-pulse"></div>
        <h2 className="text-sm font-black text-[#0d1655] uppercase tracking-widest">Akses Cepat</h2>
        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter hidden sm:inline">• Ringkasan Aktivitas Utama</span>
      </div>

      {/* Grid responsif: 2 kolom di HP kecil, 4 kolom di Tablet/Laptop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {kpiData.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl border-2 ${kpi.bg} ${kpi.color} flex items-center justify-center mb-3 transition-transform group-hover:scale-105`}>
              <kpi.icon className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#0d1655] leading-none mb-1">{kpi.value}</h3>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-tight line-clamp-1">{kpi.label}</p>
          </motion.div>
        ))}

        {/* Dynamic Package Breakdown Cards - Auto show if customers use those packages */}
        {packageBreakdown.map((pkg, i) => {
          const colors = getMbpsColor(pkg.mbps);
          return (
            <motion.div
              key={`pkg-${pkg.mbps}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (kpiData.length + i) * 0.05 }}
              className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl border-2 ${colors.bg} ${colors.text} flex items-center justify-center mb-3 transition-transform group-hover:scale-105`}>
                <Lucide.Activity className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#0d1655] leading-none mb-1">{pkg.count}</h3>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-tight">{pkg.mbps} Mbps</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
