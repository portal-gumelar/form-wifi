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
    { label: "Total Orders", value: totalRegistrants, icon: Lucide.ClipboardList, color: "text-[#10b981]", bg: "bg-[#d1fae5]" },
    { label: "Active Subs", value: statusCounts["AKTIF"] || 0, icon: Lucide.UserCheck, color: "text-[#0ea5e9]", bg: "bg-[#e0f2fe]" },
    { label: "Pending", value: statusCounts["PENDING"] || 0, icon: Lucide.Clock, color: "text-[#f59e0b]", bg: "bg-[#fef3c7]" },
    { label: "Cancelled", value: statusCounts["BATAL"] || 0, icon: Lucide.XCircle, color: "text-[#ef4444]", bg: "bg-[#fee2e2]" }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-[#10b981]"></div>
        <h2 className="text-lg font-bold text-[#1b2559]">Quick Access</h2>
        <span className="text-xs text-slate-400 font-normal ml-2">Frequent activities</span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpiData.map((kpi, i) => (
          <motion.div 
            key={kpi.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="kolabo-card p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-[0_10px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 group"
          >
            <div className={`w-14 h-14 rounded-2xl ${kpi.bg} ${kpi.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
              <kpi.icon size={28} />
            </div>
            <h3 className="text-[22px] font-black text-[#1b2559] leading-none mb-1">{kpi.value}</h3>
            <p className="text-[12px] font-semibold text-slate-400">{kpi.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
