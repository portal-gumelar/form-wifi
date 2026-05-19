import React, { useState } from "react";
import { RegistrationData } from "../../types";
import { RegistrationTable } from "./RegistrationTable";

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

  const subFilteredData = React.useMemo(() => {
    return data.filter(item => {
      if (filterStatus === "All") return true;
      const statusUpper = (item.status || "").toUpperCase();
      if (filterStatus === "Active") return statusUpper === "AKTIF";
      if (filterStatus === "Pending") return ["PENDING", "PENGAJUAN", "SURVEY", "PROSES", "BARU"].includes(statusUpper);
      if (filterStatus === "Suspended") return ["NON AKTIF", "BELUM_AKTIF", "BATAL"].includes(statusUpper);
      return true;
    });
  }, [data, filterStatus]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h3 className="text-2xl font-black italic tracking-tight text-[#0d1655]">Database Pelanggan</h3>
          <p className="text-sm font-bold text-slate-400">Kelola basis data pelanggan aktif, survei, dan penangguhan</p>
        </div>
        <div className="flex gap-3">
          {["All", "Active", "Pending", "Suspended"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filterStatus === status
                ? 'bg-[#1a2d8f] text-white shadow-lg shadow-blue-500/20 scale-105'
                : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-400 border border-slate-200/60 hover:border-blue-900/20'
              }`}
            >
              {status === "All" ? "Semua" : status === "Active" ? "Aktif" : status === "Pending" ? "Tertunda" : "Ditangguhkan"}
            </button>
          ))}
        </div>
      </div>

      <RegistrationTable 
        data={subFilteredData} 
        isDarkMode={isDarkMode} 
        onViewDetails={onViewDetails} 
        onDelete={onDelete} 
        onUpdateStatus={onUpdateStatus}
      />
    </div>
  );
};
