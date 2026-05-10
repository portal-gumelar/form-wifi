import React from "react";
import * as Lucide from "lucide-react";

interface SettingsViewProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  googleScriptUrl: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  isDarkMode, setIsDarkMode, googleScriptUrl 
}) => {
  return (
    <div className="max-w-4xl space-y-12">
      <div>
        <h3 className="text-2xl font-black italic tracking-tight">System Settings</h3>
        <p className="text-sm font-bold text-slate-400">Configure your hub's operational parameters</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
          <h4 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-3">
            <Lucide.User size={18} className="text-[#1a2d8f]" /> Profile Control
          </h4>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1a2d8f] to-blue-500 flex items-center justify-center text-white text-xl font-black">AD</div>
              <div>
                <p className="font-black">Administrator</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Master Admin Role</p>
              </div>
            </div>
            <button className="w-full py-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Change Password</button>
          </div>
        </div>


        {/* Package Management */}
        <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-100 shadow-sm'} md:col-span-2`}>
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
              <Lucide.Package size={18} className="text-blue-500" /> Service Packages
            </h4>
            <button className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Lucide.Plus size={18} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {["GUYUB_1", "GUYUB_2", "GUYUB_3"].map(pkg => (
              <div key={pkg} className={`p-5 rounded-2xl border ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#F47920]"></div>
                  <span className="text-xs font-black">{pkg}</span>
                </div>
                <button className="text-slate-400 hover:text-red-500"><Lucide.Edit3 size={16} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Settings */}
        <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-100 shadow-sm'} md:col-span-2`}>
          <h4 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-3">
            <Lucide.BellRing size={18} className="text-emerald-500" /> Notification Engine
          </h4>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black">WhatsApp Auto-Reply</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Send confirmation message after registration</p>
              </div>
              <button className="w-12 h-6 bg-emerald-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black">Admin Email Alert</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Notify master admin for every new entry</p>
              </div>
              <button className={`w-12 h-6 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded-full relative`}>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
