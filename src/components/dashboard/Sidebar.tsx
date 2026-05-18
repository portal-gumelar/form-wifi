// Last update: 2026-05-18 22:20
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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

export const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen, activeTab, setActiveTab, onLogout
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    {
      section: "MENU INTI", items: [
        { id: "Dashboard", icon: Lucide.Home, label: "Ringkasan" },
        { id: "Registrations", icon: Lucide.CheckSquare, label: "Kelola Pesanan" },
        { id: "Customers", icon: Lucide.Users, label: "Data Pelanggan" },
      ]
    },
    {
      section: "ANALISIS UTARA", items: [
        { id: "Analytics", icon: Lucide.BarChart2, label: "Grafik Analitik" },
        { id: "Map View", icon: Lucide.MapPin, label: "Peta Distribusi" },
      ]
    }
  ];

  if (isMobile) return null;

  return (
    <motion.aside
      initial={false}
      animate={{ width: isSidebarOpen ? 250 : 80 }}
      className="fixed left-0 top-0 h-full bg-[#0d1655] text-white z-50 flex flex-col overflow-hidden shadow-xl"
    >
      {/* Brand Header */}
      <div className="h-[75px] flex items-center border-b border-white/10 shrink-0 px-5">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center p-1 shrink-0">
          <img src="https://ik.imagekit.io/Gumelar/LogO/logo%20pt.png?updatedAt=1778213993513" alt="Logo" className="w-full h-full object-contain" />
        </div>
        {isSidebarOpen && (
          <span className="text-base font-black uppercase tracking-wider ml-3 text-white">
            Armedia <span className="text-[#FDB913]">Net</span>
          </span>
        )}
      </div>

      {/* Nav Link List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-6 px-3 space-y-7">
        {menuItems.map((group) => (
          <div key={group.section} className="space-y-1.5">
            {isSidebarOpen && (
              <p className="px-3 text-[9px] font-black text-blue-300/50 uppercase tracking-[0.2em]">
                {group.section}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all group relative ${isActive
                        ? 'bg-[#F47920] text-white shadow-md shadow-orange-600/20'
                        : 'text-blue-100/70 hover:bg-white/5 hover:text-white'
                      } ${!isSidebarOpen && 'justify-center'}`}
                  >
                    <item.icon size={16} className={isActive ? 'text-white' : 'text-blue-200/50 group-hover:text-white'} />
                    {isSidebarOpen && <span className="flex-1 text-left truncate">{item.label}</span>}

                    {!isSidebarOpen && (
                      <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md">
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

      {/* Log Out Action */}
      <div className="p-4 border-t border-white/10 shrink-0">
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-3 text-blue-200/50 hover:bg-red-500/10 hover:text-red-400 font-bold rounded-xl text-xs uppercase tracking-wider transition-all ${!isSidebarOpen && 'justify-center'}`}
        >
          <Lucide.LogOut size={16} />
          {isSidebarOpen && <span>Keluar Sistem</span>}
        </button>
      </div>
    </motion.aside>
  );
};