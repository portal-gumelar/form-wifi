import React from "react";
import * as Lucide from "lucide-react";

interface HeaderProps {
  activeTab: string;
  isDarkMode: boolean;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab, isDarkMode, isSidebarOpen, setIsSidebarOpen, searchTerm, setSearchTerm
}) => {
  return (
    <header className={`h-24 px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md ${isDarkMode ? 'bg-[#0f172a]/80' : 'bg-[#f8fafc]/80'}`}>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`p-2.5 rounded-xl border ${isDarkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'} transition-all`}
        >
          <Lucide.Menu size={20} />
        </button>
        <h2 className="text-xl font-black italic tracking-tight uppercase">{activeTab}</h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Lucide.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Universal Search..."
            className={`w-72 pl-12 pr-4 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all ${
              isDarkMode ? 'bg-[#1e293b] border-slate-800 focus:border-blue-500' : 'bg-white border-slate-200 focus:border-blue-500'
            }`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button className={`p-2.5 rounded-xl border relative ${isDarkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'}`}>
            <Lucide.Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white dark:border-[#0f172a]"></span>
          </button>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 mx-2"></div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black">Administrator</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Master Control</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a2d8f] to-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
              AD
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
