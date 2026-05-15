import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";

interface SidebarProps {
  isSidebarOpen: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onLogout: () => void;
  onAddNew?: () => void;
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
  isSidebarOpen, activeTab, setActiveTab, onLogout, onAddNew 
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { section: "Main", items: [
      { id: "Dashboard", icon: Lucide.Home, label: "Dashboard" },
      { id: "Registrations", icon: Lucide.CheckSquare, label: "Task Management" },
      { id: "Customers", icon: Lucide.Users, label: "Employee Management" },
    ]},
    { section: "Tools", items: [
      { id: "Analytics", icon: Lucide.BarChart2, label: "Analytics" },
      { id: "Map View", icon: Lucide.MapPin, label: "Visit Attendance" },
    ]}
  ];

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 shadow-[0_-15px_40px_rgba(0,0,0,0.08)] z-50 px-4 py-4 flex justify-around items-center rounded-t-[2.5rem]">
        <button onClick={() => setActiveTab('Dashboard')} className={`p-4 rounded-2xl transition-all ${activeTab === 'Dashboard' ? 'text-[#10b981] bg-emerald-50 scale-110 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
          <Lucide.Home size={22} />
        </button>
        <button onClick={() => setActiveTab('Registrations')} className={`p-4 rounded-2xl transition-all ${activeTab === 'Registrations' ? 'text-[#10b981] bg-emerald-50 scale-110 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
          <Lucide.CheckSquare size={22} />
        </button>
        
        <button 
          onClick={() => onAddNew?.()}
          className="w-14 h-14 bg-[#10b981] text-white rounded-[1.25rem] shadow-xl shadow-emerald-500/40 flex items-center justify-center transform -translate-y-8 hover:-translate-y-10 transition-all duration-300 active:scale-90"
        >
          <Lucide.Plus size={28} strokeWidth={3} />
        </button>

        <button onClick={() => setActiveTab('Customers')} className={`p-4 rounded-2xl transition-all ${activeTab === 'Customers' ? 'text-[#10b981] bg-emerald-50 scale-110 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
          <Lucide.Users size={22} />
        </button>
        <button onClick={() => setActiveTab('Analytics')} className={`p-4 rounded-2xl transition-all ${activeTab === 'Analytics' ? 'text-[#10b981] bg-emerald-50 scale-110 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
          <Lucide.BarChart2 size={22} />
        </button>
      </div>
    );
  }

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isSidebarOpen ? 250 : 80 }}
      className={`fixed left-0 top-0 h-full bg-white border-r border-slate-100 z-50 flex flex-col transition-all duration-300 text-[#64748b]`}
    >
      <div className="h-[80px] flex items-center justify-center border-b border-slate-100 shrink-0 px-4">
        <LogoMark className={isSidebarOpen ? "w-8 h-8 mr-3" : "w-10 h-10"} />
        {isSidebarOpen && (
          <span className="text-xl font-bold text-[#1b2559]">Armedia <span className="text-[#10b981]">Net</span></span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar py-6 px-4 space-y-8">
        {menuItems.map((group) => (
          <div key={group.section} className="space-y-2">
            {isSidebarOpen && (
              <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {group.section}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 transition-all relative group ${
                      isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'
                    } ${!isSidebarOpen && 'justify-center'}`}
                  >
                    <item.icon size={20} className={isActive ? 'text-[#10b981]' : 'text-slate-400 group-hover:text-[#2b3674]'} />
                    {isSidebarOpen && <span className="flex-1 text-left text-sm">{item.label}</span>}
                    
                    {!isSidebarOpen && (
                      <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-3 text-slate-400 hover:bg-red-50 hover:text-red-500 font-medium rounded-xl transition-colors ${!isSidebarOpen && 'justify-center'}`}
        >
          <Lucide.LogOut size={20} />
          {isSidebarOpen && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
};
