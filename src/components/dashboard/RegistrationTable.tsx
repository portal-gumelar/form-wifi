import React from "react";
import { RegistrationData } from "../../types";
import { getCustomerNo } from "../../utils/dashboardUtils";
import * as Lucide from "lucide-react";

interface RegistrationTableProps {
  data: RegistrationData[];
  isDarkMode: boolean;
  onViewDetails: (item: RegistrationData) => void;
  onDelete: (timestamp: string) => void;
  onUpdateStatus: (timestamp: string, status: string) => void;
  mini?: boolean;
}

const STATUS_CONFIG = {
  BARU: { label: "New", color: "text-[#4318ff] bg-[#f4f7fe]" },
  SURVEY: { label: "Survey", color: "text-[#707eae] bg-[#f4f7fe]" },
  PROSES: { label: "Process", color: "text-[#ffb547] bg-[#fff9e6]" },
  AKTIF: { label: "Active", color: "text-[#01b574] bg-[#e6fff5]" },
  BELUM_AKTIF: { label: "Inactive", color: "text-[#a3aed0] bg-[#f4f7fe]" },
  PENDING: { label: "Pending", color: "text-[#707eae] bg-[#f4f7fe]" },
  BATAL: { label: "Cancelled", color: "text-[#ee5d50] bg-[#fff5f5]" },
};

export const RegistrationTable: React.FC<RegistrationTableProps> = ({ 
  data, isDarkMode, onViewDetails, onDelete, onUpdateStatus, mini = false 
}) => {
  return (
    <div className="bright-card overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#e0e5f2]">
              <th className="px-6 py-5 text-[10px] font-bold text-[#a3aed0] uppercase tracking-widest">Name</th>
              {!mini && <th className="px-6 py-5 text-[10px] font-bold text-[#a3aed0] uppercase tracking-widest">Address</th>}
              <th className="px-6 py-5 text-[10px] font-bold text-[#a3aed0] uppercase tracking-widest">Package</th>
              {!mini && <th className="px-6 py-5 text-[10px] font-bold text-[#a3aed0] uppercase tracking-widest">Date</th>}
              <th className="px-6 py-5 text-[10px] font-bold text-[#a3aed0] uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-5 text-[10px] font-bold text-[#a3aed0] uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f4f7fe]">
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-[#f4f7fe]/50 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <p className="text-sm font-bold text-[#2b3674]">{item["Nama Lengkap"]}</p>
                    <p className="text-[10px] text-[#a3aed0] font-medium">{getCustomerNo(item.Timestamp)}</p>
                  </div>
                </td>
                {!mini && (
                  <td className="px-6 py-5">
                    <p className="text-xs font-medium text-[#707eae] truncate max-w-[200px]">
                      {item["Alamat Pemasangan"]}
                    </p>
                  </td>
                )}
                <td className="px-6 py-5">
                  <span className="text-xs font-bold text-[#2b3674]">
                    {String(item.Paket || "").split("(")[0]}
                  </span>
                </td>
                {!mini && (
                  <td className="px-6 py-5 text-xs font-medium text-[#707eae]">
                    {item.Timestamp.split(",")[0]}
                  </td>
                )}
                <td className="px-6 py-5 text-center">
                  <div className="relative inline-block group/status">
                    <select 
                      value={item.status || "BARU"} 
                      onChange={(e) => onUpdateStatus(item.Timestamp, e.target.value)}
                      className={`status-badge border-none appearance-none cursor-pointer outline-none transition-all ${
                        STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG]?.color || 'bg-slate-50 text-slate-600'
                      }`}
                    >
                      {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                        <option key={val} value={val} className="bg-white text-[#2b3674]">{cfg.label}</option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => item["Link Google Maps"] && window.open(item["Link Google Maps"])} 
                      className={`p-2 rounded-lg text-[#a3aed0] hover:text-[#4318ff] hover:bg-[#f4f7fe] transition-all ${!item["Link Google Maps"] && 'hidden'}`}
                    >
                      <Lucide.MapPin size={16} />
                    </button>
                    <button onClick={() => onViewDetails(item)} className="p-2 rounded-lg text-[#a3aed0] hover:text-[#2b3674] hover:bg-[#f4f7fe] transition-all">
                      <Lucide.Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        const phone = String(item["No HP / WA"] || "").replace(/\D/g, "");
                        const waPhone = phone.startsWith("0") ? "62" + phone.slice(1) : phone;
                        window.open(`https://wa.me/${waPhone}`, "_blank");
                      }} 
                      className="p-2 rounded-lg text-[#a3aed0] hover:text-[#01b574] hover:bg-[#e6fff5] transition-all"
                    >
                      <Lucide.MessageCircle size={16} />
                    </button>
                    <button onClick={() => onDelete(item.Timestamp)} className="p-2 rounded-lg text-[#a3aed0] hover:text-[#ee5d50] hover:bg-[#fff5f5] transition-all">
                      <Lucide.Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
