import React from "react";
import { motion } from "framer-motion";
import * as Lucide from "lucide-react";

interface KPICardsProps {
  totalRegistrants: number;
  statusCounts: Record<string, number>;
  isDarkMode: boolean;
}

export const KPICards: React.FC<KPICardsProps> = ({ totalRegistrants, statusCounts, isDarkMode }) => {
  const kpiData = [
    { label: "Total Pelanggan", value: totalRegistrants, icon: Lucide.Users, color: "text-[#4318ff] bg-[#f4f7fe]" },
    { label: "Pelanggan Aktif", value: statusCounts["AKTIF"] || 0, icon: Lucide.UserCheck, color: "text-[#01b574] bg-[#e6fff5]" },
    { label: "Proses Pasang", value: statusCounts["PROSES PASANG"] || 0, icon: Lucide.Zap, color: "text-[#ffb547] bg-[#fff9e6]" },
    { label: "Perlu Survey", value: statusCounts["SURVEY"] || 0, icon: Lucide.Search, color: "text-[#4318ff] bg-[#f4f7fe]" },
    { label: "Pending", value: statusCounts["PENDING"] || 0, icon: Lucide.Clock, color: "text-[#707eae] bg-[#f4f7fe]" },
    { label: "Batal", value: statusCounts["BATAL"] || 0, icon: Lucide.XCircle, color: "text-[#ee5d50] bg-[#fff5f5]" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
      {kpiData.map((kpi, i) => (
        <motion.div 
          key={kpi.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bright-card p-5 flex items-center gap-4 group cursor-default"
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${kpi.color}`}>
            <kpi.icon size={20} />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-xs font-medium text-[#a3aed0] truncate">{kpi.label}</p>
            <h3 className="text-xl font-bold text-[#2b3674] leading-tight">{kpi.value}</h3>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
