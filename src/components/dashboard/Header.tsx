import React from "react";
import * as Lucide from "lucide-react";

interface HeaderProps {
  activeTab: string;
  isDarkMode: boolean;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  userRole?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  isSidebarOpen, setIsSidebarOpen, searchTerm, setSearchTerm, activeTab, userRole = "admin"
}) => {
  return (
    <header className="h-[75px] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 w-full shrink-0">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden md:flex w-10 h-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-[#F47920] border border-slate-100 transition-colors"
        >
          <Lucide.Menu size={18} />
        </button>

        {/* Input pencarian global - Dinonaktifkan di HP agar tidak mempersempit space header */}
        <div className="hidden sm:flex items-center bg-slate-50 rounded-xl px-3.5 py-2 w-60 border border-slate-100 focus-within:border-[#F47920] focus-within:ring-4 focus-within:ring-orange-500/10 transition-all">
          <Lucide.Search size={14} className="text-slate-400 mr-2 shrink-0" />
          <input 
            type="text"
            placeholder="Cari data pelanggan..."
            className="bg-transparent border-none outline-none text-xs w-full text-slate-700 font-bold placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Teks penunjuk tab khusus mobile */}
        <span className="sm:hidden font-black text-[#0d1655] text-sm uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
          ⚙️ {activeTab.slice(0, 12)}
        </span>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-2">
          {/* Role Indicator Badge */}
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
            userRole === 'superadmin' 
              ? 'bg-amber-50 border-amber-200 text-amber-700' 
              : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            {userRole === 'superadmin' ? <Lucide.ShieldAlert size={14} /> : <Lucide.ShieldCheck size={14} />}
            <span className="text-[10px] font-black uppercase tracking-widest">{userRole}</span>
          </div>

          <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 border border-slate-100 flex items-center justify-center relative shadow-sm">
            <Lucide.Bell size={16} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          </div>
          
          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm p-1">
            <img 
              src="https://ik.imagekit.io/Gumelar/LogO/logo%20pt.png?updatedAt=1778213993513" 
              alt="Logo PT" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </header>
  );
};