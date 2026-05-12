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

const STATUS_OPTIONS = [
  { label: "Baru", value: "BARU", color: "bg-blue-50 text-blue-600 border-blue-100" },
  { label: "Survey", value: "SURVEY", color: "bg-orange-50 text-orange-600 border-orange-100" },
  { label: "Proses", value: "PROSES", color: "bg-purple-50 text-purple-600 border-purple-100" },
  { label: "Aktif", value: "AKTIF", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  { label: "Pending", value: "PENDING", color: "bg-amber-50 text-amber-600 border-amber-100" },
  { label: "Batal", value: "BATAL", color: "bg-red-50 text-red-600 border-red-100" },
];

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.672 1.433 5.661 1.434h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export const RegistrationTable: React.FC<RegistrationTableProps> = ({ 
  data, isDarkMode, onViewDetails, onDelete, onUpdateStatus, mini = false 
}) => {
  return (
    <div className={`rounded-[2.5rem] border overflow-hidden ${isDarkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
      {!mini && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className={isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}>
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">No.</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID / Timestamp</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Name</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deployment Address</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action Hub</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                  <td className="px-8 py-6 text-xs font-black text-slate-400">{idx + 1}</td>
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
                    <div className="flex gap-2 mt-2 items-center">
                      <span className="text-[9px] font-black px-2 py-0.5 bg-blue-50 text-blue-500 rounded-md uppercase">{String(item.Paket || "").split("(")[0]}</span>
                      <div className="relative group/status">
                        <select 
                          value={item.status || "BARU"} 
                          onChange={(e) => onUpdateStatus(item.Timestamp, e.target.value)}
                          className={`text-[9px] font-black px-2 py-0.5 rounded-md border appearance-none cursor-pointer outline-none transition-all ${
                            STATUS_OPTIONS.find(o => o.value === (item.status || "BARU"))?.color
                          }`}
                        >
                          {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3 justify-center">
                      <button onClick={() => window.open(`https://wa.me/${String(item["No HP / WA"] || "").replace(/\D/g, "")}`)} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"><WhatsAppIcon className="w-5 h-5" /></button>
                      <button onClick={() => onViewDetails(item)} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Lucide.ExternalLink size={20} /></button>
                      <button onClick={() => onDelete(item.Timestamp)} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Lucide.Trash2 size={20} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mini && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">No.</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Package</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-transparent">
              {data.map((item, idx) => (
                <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                  <td className="px-8 py-4 text-xs font-black text-slate-400">{idx + 1}</td>
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
                    <select 
                      value={item.status || "BARU"} 
                      onChange={(e) => onUpdateStatus(item.Timestamp, e.target.value)}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border appearance-none cursor-pointer outline-none ${
                        STATUS_OPTIONS.find(o => o.value === (item.status || "BARU"))?.color
                      }`}
                    >
                      {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <button onClick={() => onViewDetails(item)} className="p-2 hover:text-[#1a2d8f] transition-all"><Lucide.ExternalLink size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
