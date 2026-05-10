import React from "react";
import { motion } from "framer-motion";
import * as Lucide from "lucide-react";

interface KPICardsProps {
  totalRegistrants: number;
  isDarkMode: boolean;
}

export const KPICards: React.FC<KPICardsProps> = ({ totalRegistrants, isDarkMode }) => {
  const kpiData = [
    { label: "Total Registrants", value: totalRegistrants, icon: Lucide.Users, trend: "+12.5%", color: "blue" },
    { label: "Active Services", value: Math.floor(totalRegistrants * 0.8), icon: Lucide.Activity, trend: "+5.2%", color: "emerald" },
    { label: "Conversion Rate", value: "68%", icon: Lucide.TrendingUp, trend: "+2.1%", color: "orange" },
    { label: "Completion Time", value: "24.8h", icon: Lucide.Calendar, trend: "-1.4%", color: "slate" }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiData.map((kpi, i) => (
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
  );
};
