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
  const menuItems = [
    { section: "MAIN", items: [
      { id: "Dashboard", icon: Lucide.LayoutDashboard, label: "Dashboard" },
      { id: "Registrations", icon: Lucide.ClipboardList, label: "Order Lists" },
      { id: "Customers", icon: Lucide.Users, label: "Product Stock" },
    ]},
    { section: "PAGES", items: [
      { id: "Analytics", icon: Lucide.BarChart3, label: "Analytics" },
      { id: "Map View", icon: Lucide.Map, label: "Map View" },
      { id: "Settings", icon: Lucide.Settings, label: "Settings" },
    ]}
  ];

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isSidebarOpen ? 280 : 80 }}
      className={`fixed left-0 top-0 h-full bg-white border-r border-[#e0e5f2] z-50 flex flex-col transition-all duration-300 shadow-sm`}
    >
      <div className="h-24 flex items-center px-8 gap-4 overflow-hidden border-b border-transparent">
        <div className="min-w-[40px]">
          <LogoMark className="w-10 h-10 object-contain" />
        </div>
        {isSidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-[#2b3674] uppercase">ARMEDIA<span className="text-[#4318ff]">.NET</span></span>
          </motion.div>
        )}
      </div>

      <nav className="flex-1 py-6 px-4 space-y-8 overflow-y-auto custom-scrollbar">
        {menuItems.map((group) => (
          <div key={group.section} className="space-y-3">
            {isSidebarOpen && (
              <p className="px-4 text-[10px] font-bold text-[#a3aed0] uppercase tracking-widest">{group.section}</p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all relative group font-bold text-sm ${
                      isActive 
                      ? 'sidebar-item-active' 
                      : 'sidebar-item-inactive'
                    }`}
                  >
                    <item.icon size={20} className={isActive ? 'text-white' : ''} />
                    {isSidebarOpen && <span>{item.label}</span>}
                    {!isSidebarOpen && (
                      <div className="absolute left-full ml-4 px-3 py-2 bg-[#2b3674] text-white text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
                        {item.label}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 space-y-1 border-t border-[#e0e5f2]">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="w-full flex items-center gap-4 p-4 rounded-2xl sidebar-item-inactive font-bold text-sm transition-all"
        >
          {isDarkMode ? <Lucide.Sun size={20} /> : <Lucide.Moon size={20} />}
          {isSidebarOpen && <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-50 font-bold text-sm transition-all"
        >
          <Lucide.LogOut size={20} />
          {isSidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
};
