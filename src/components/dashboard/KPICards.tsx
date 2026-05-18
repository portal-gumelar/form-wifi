import React from "react";
import { motion } from "framer-motion";
import * as Lucide from "lucide-react";

interface KPICardsProps {
  totalRegistrants: number;
  statusCounts: Record<string, number>;
  isDarkMode: boolean;
}

export const KPICards: React.FC<KPICardsProps> = ({ totalRegistrants, statusCounts }) => {
  const kpiData = [
    { label: "Total Pesanan", value: totalRegistrants, icon: Lucide.ClipboardList, color: "text-[#0d1655]", bg: "bg-blue-50 border-blue-100" },
    { label: "Pelanggan Aktif", value: statusCounts["AKTIF"] || 0, icon: Lucide.UserCheck, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
    { label: "Tertunda (Pending)", value: statusCounts["PENDING"] || 0, icon: Lucide.Clock, color: "text-[#F47920]", bg: "bg-orange-50 border-orange-100" },
    { label: "Dibatalkan", value: statusCounts["BATAL"] || 0, icon: Lucide.XCircle, color: "text-red-600", bg: "bg-red-50 border-red-100" }
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
      </div>
    </div>
  );
};