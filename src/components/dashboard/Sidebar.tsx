import React from "react";
import { motion } from "framer-motion";
import * as Lucide from "lucide-react";

interface SidebarProps {
  isSidebarOpen: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onLogout: () => void;
}

function LogoMark({ className }: { className?: string }) {
  return (
    <img 
      src="https://ik.imagekit.io/Gumelar/LogO/logo%20pt.png?updatedAt=1778213993513" 
      alt="Logo" 
      className={className || "w-10 h-10 object-contain"} 
    />
  );
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isSidebarOpen, activeTab, setActiveTab, isDarkMode, setIsDarkMode, onLogout 
}) => {
  const sidebarItems = [
    { id: "Dashboard", icon: Lucide.LayoutDashboard, label: "Overview" },
    { id: "Analytics", icon: Lucide.BarChart3, label: "Analytics" },
    { id: "Registrations", icon: Lucide.ClipboardList, label: "Registrations" },
    { id: "Customers", icon: Lucide.Users, label: "Customers" },
    { id: "Map View", icon: Lucide.Map, label: "Geographical" },
    { id: "Settings", icon: Lucide.Settings, label: "Settings" },
  ];

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isSidebarOpen ? 280 : 80 }}
      className={`fixed left-0 top-0 h-full ${isDarkMode ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-slate-200'} border-r z-50 flex flex-col transition-colors duration-300 shadow-xl`}
    >
      <div className="h-24 flex items-center px-6 gap-4 overflow-hidden border-b border-transparent">
        <div className="min-w-[40px]">
          <LogoMark className="w-10 h-10 shadow-lg shadow-blue-500/20 rounded-xl" />
        </div>
        {isSidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
            <span className="text-xl font-black tracking-tighter text-[#1a2d8f] dark:text-blue-400">ARMEDIA<span className="text-[#F47920]">.HUB</span></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enterprise Portal</span>
          </motion.div>
        )}
      </div>

      <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all relative group ${
              activeTab === item.id 
              ? 'bg-blue-50 text-[#1a2d8f] dark:bg-blue-500/10 dark:text-blue-400' 
              : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {activeTab === item.id && (
              <motion.div layoutId="sidebar-active" className="absolute inset-0 bg-blue-50 dark:bg-blue-500/10 rounded-2xl -z-10" />
            )}
            <item.icon size={22} className={activeTab === item.id ? 'stroke-[2.5px]' : ''} />
            {isSidebarOpen && <span className="font-bold text-sm">{item.label}</span>}
            {!isSidebarOpen && (
              <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {item.label}
              </div>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          {isDarkMode ? <Lucide.Sun size={22} /> : <Lucide.Moon size={22} />}
          {isSidebarOpen && <span className="font-bold text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
        >
          <Lucide.LogOut size={22} />
          {isSidebarOpen && <span className="font-bold text-sm">Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
};
