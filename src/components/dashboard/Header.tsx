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
    <header className="px-8 py-6 flex items-center justify-between sticky top-0 z-40 bg-[#f4f7fe]/80 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2.5 rounded-xl text-[#2b3674] hover:bg-white hover:shadow-sm transition-all"
        >
          <Lucide.Menu size={20} />
        </button>
        <h2 className="text-sm font-bold text-[#707eae] uppercase tracking-widest">{activeTab}</h2>
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-full shadow-sm border border-[#e0e5f2]">
        <div className="relative group flex-1 min-w-[200px]">
          <Lucide.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a3aed0]" size={16} />
          <input 
            type="text" 
            placeholder="Search..."
            className="w-full pl-11 pr-4 py-2 rounded-full text-xs font-medium outline-none bg-[#f4f7fe] text-[#2b3674] placeholder-[#a3aed0]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 px-2 border-l border-[#e0e5f2]">
          <button className="p-2 text-[#a3aed0] hover:text-[#2b3674] transition-colors relative">
            <Lucide.Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="flex items-center gap-3 pl-2 border-l border-[#e0e5f2]">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-[#2b3674]">Admin Hub</p>
              <p className="text-[10px] text-[#a3aed0] font-medium">Administrator</p>
            </div>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#4318ff] flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-blue-500/20">
               AD
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
