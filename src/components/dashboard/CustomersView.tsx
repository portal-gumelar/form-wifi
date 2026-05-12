import React, { useState } from "react";
import { RegistrationData } from "../../types";
import { RegistrationTable } from "./RegistrationTable";
import * as Lucide from "lucide-react";

interface CustomersViewProps {
  data: RegistrationData[];
  isDarkMode: boolean;
  onViewDetails: (item: RegistrationData) => void;
  onDelete: (timestamp: string) => void;
  onUpdateStatus: (timestamp: string, status: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({ 
  data, isDarkMode, onViewDetails, onDelete, onUpdateStatus 
}) => {
  const [filterStatus, setFilterStatus] = useState("All");

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h3 className="text-2xl font-black italic tracking-tight">Customer Database</h3>
          <p className="text-sm font-bold text-slate-400">Manage your active and pending subscriber base</p>
        </div>
        <div className="flex gap-3">
          {["All", "Active", "Pending", "Suspended"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filterStatus === status
                ? 'bg-[#1a2d8f] text-white shadow-lg shadow-blue-500/20'
                : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-400 border border-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Churn Rate", value: "1.2%", icon: Lucide.UserX, color: "red" },
          { label: "ARPU (Monthly)", value: "Rp 145k", icon: Lucide.Wallet, color: "emerald" },
          { label: "Loyalty Score", value: "9.8/10", icon: Lucide.Star, color: "orange" },
        ].map((stat, i) => (
          <div key={i} className={`p-6 rounded-[2rem] border ${isDarkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${
                stat.color === 'red' ? 'bg-red-50 text-red-500 dark:bg-red-500/10' :
                stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10' :
                'bg-orange-50 text-orange-500 dark:bg-orange-500/10'
              }`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-black">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <RegistrationTable 
        data={data} 
        isDarkMode={isDarkMode} 
        onViewDetails={onViewDetails} 
        onDelete={onDelete} 
        onUpdateStatus={onUpdateStatus}
      />
    </div>
  );
};
