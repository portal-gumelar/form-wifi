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
  isSidebarOpen, setIsSidebarOpen, searchTerm, setSearchTerm
}) => {
  return (
    <header className="h-[80px] px-6 flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all duration-300">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden md:flex w-10 h-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-[#10b981] transition-colors"
        >
          <Lucide.Menu size={20} />
        </button>

        <div className="hidden sm:flex items-center bg-slate-50 rounded-xl px-4 py-2 w-64 border border-slate-100 focus-within:border-[#10b981] focus-within:ring-2 focus-within:ring-[#10b981]/20 transition-all">
          <Lucide.Search size={16} className="text-slate-400 mr-2" />
          <input 
            type="text"
            placeholder="Search menu (ctrl+q)"
            className="bg-transparent border-none outline-none text-sm w-full text-slate-600 placeholder-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5 text-sm">
        <button className="hidden sm:flex items-center gap-1 text-slate-500 hover:text-slate-700 font-medium">
          <Lucide.Globe size={16} />
          <span className="text-xs">English</span>
        </button>

        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-[#10b981] flex items-center justify-center transition-colors relative">
            <Lucide.Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-md cursor-pointer hover:shadow-lg transition-all p-1.5">
            <img 
              src="https://ik.imagekit.io/Gumelar/LogO/logo%20pt.png?updatedAt=1778213993513" 
              alt="Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
