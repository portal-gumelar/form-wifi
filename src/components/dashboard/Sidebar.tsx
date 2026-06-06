/**
 * Sidebar Component with Auto-Hide Collapsible Feature
 * Last update: 2026-05-21 13:16
 */
import React, { useState, useEffect } from "react";
import * as Lucide from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  onLogout: () => void;
  pendingCount?: number;
}

// Mobile Bottom Navigation Component
const MobileBottomNav: React.FC<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingCount?: number;
}> = ({ activeTab, setActiveTab, pendingCount = 0 }) => {
  const navItems = [
    { id: "Dashboard", icon: Lucide.Home, label: "Home" },
    { id: "Registrations", icon: Lucide.CheckSquare, label: "Pesanan", badge: pendingCount },
    { id: "Dana Desa CSR", icon: Lucide.Wallet, label: "Dana Desa" },
    { id: "Map View", icon: Lucide.MapPin, label: "Peta" },
    { id: "Customers", icon: Lucide.Users, label: "Pelanggan" },
  ];

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-[70] md:hidden">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 px-2 py-3">
        <div className="grid grid-cols-5 justify-around items-center">
          {navItems.map((item, index) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            
            // Special styling for MAP button (centered floating)
            const isMapButton = item.id === "Map View";
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl
                  transition-all duration-300 ease-out
                  ${isActive 
                    ? 'scale-105' 
                    : 'hover:scale-95'
                  }
                  ${isMapButton ? 'relative' : ''}
                `}
              >
                {/* Icon Container */}
                <div className={`
                  relative p-2.5 rounded-full transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-br from-[#f97316] to-[#f47920] shadow-lg shadow-orange-500/30' 
                    : 'hover:bg-gray-100'
                  }
                  ${isMapButton ? 'ring-2 ring-[#0d1655]/20' : ''}
                `}>
                  <Icon 
                    size={20} 
                    className={`
                      transition-all duration-300
                      ${isActive 
                        ? 'text-white scale-110' 
                        : 'text-[#0d1655]/60'
                      }
                    `}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  
                  {/* Badge for pending orders */}
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#f97316] text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                
                {/* Active Indicator Dot */}
                <span className={`
                  w-1.5 h-1.5 rounded-full transition-all duration-300
                  ${isActive 
                    ? 'bg-[#f97316] scale-100' 
                    : 'bg-transparent'
                  }
                `} />
                
                {/* Label */}
                <span className={`
                  text-[10px] font-medium transition-all duration-300
                  ${isActive 
                    ? 'text-[#0d1655] font-semibold' 
                    : 'text-[#0d1655]/50'
                  }
                `}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab, setActiveTab, onLogout, pendingCount = 0
}) => {
  // Auto-hide state for mobile
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // Collapsed state for desktop
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };
    handleResize();
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
      section: "DANA DESA", items: [
        { id: "Dana Desa CSR", icon: Lucide.Wallet, label: "Dana Desa CSR" },
      ]
    },
    {
      section: "ANALISIS DATA", items: [
        { id: "Analytics", icon: Lucide.BarChart2, label: "Grafik Analitik" },
        { id: "Map View", icon: Lucide.MapPin, label: "Peta Distribusi" },
      ]
    },
    {
      section: "SISTEM", items: [
        { id: "Settings", icon: Lucide.Settings, label: "Pengaturan" },
      ]
    }
  ];

  // Mobile: Show bottom navigation
  if (isMobile) {
    return <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} pendingCount={pendingCount} />;
  }

  return (
    <>
      {/* Desktop Sidebar - Auto-hide collapsible on desktop */}
      <aside
        className={`
          fixed left-0 top-0 h-full bg-[#0d1655] text-white z-[60] flex flex-col overflow-hidden shadow-xl
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        {/* Header with Toggle */}
        <div className="h-[75px] flex items-center border-b border-white/10 shrink-0 px-4">
          {/* Collapse Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
          >
            <Lucide.PanelLeftClose 
              size={18} 
              className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
            />
          </button>
          
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center p-0.5 shrink-0 ml-2">
            <img 
              src="https://ik.imagekit.io/Gumelar/LogO/logo%20pt.png?updatedAt=1778213993513" 
              alt="Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          
          <span className={`text-base font-black uppercase tracking-wider ml-3 text-white transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
            Armedia <span className="text-[#FDB913]">ID</span>
          </span>
        </div>

        {/* Nav Link List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-6 px-3 space-y-7">
          {menuItems.map((group) => (
            <div key={group.section} className="space-y-1.5">
              {/* Section Label - Hide when collapsed */}
              <p className={`px-3 text-[9px] font-black text-blue-300/50 uppercase tracking-[0.2em] transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0 py-0 overflow-hidden' : 'opacity-100'}`}>
                {group.section}
              </p>
              
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-xs uppercase tracking-wider 
                        transition-all duration-300 group relative 
                        ${isActive
                          ? 'bg-[#F47920] text-white shadow-md shadow-orange-600/20'
                          : 'text-blue-100/70 hover:bg-white/5 hover:text-white'
                        } 
                        ${isCollapsed ? 'justify-center' : 'justify-start'}
                      `}
                    >
                      <item.icon 
                        size={16} 
                        className={`shrink-0 transition-all duration-300 ${isActive ? 'text-white' : 'text-blue-200/50 group-hover:text-white'}`} 
                      />
                      
                      {/* Label - Hide when collapsed */}
                      <span className={`flex-1 text-left truncate transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}`}>
                        {item.label}
                      </span>
                      
                      {/* Badge - Only show when expanded */}
                      {item.id === "Registrations" && pendingCount > 0 && !isCollapsed && (
                        <span className="bg-[#f47920] text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md shrink-0 select-none animate-pulse">
                          {pendingCount}
                        </span>
                      )}
                      
                      {/* Badge Dot - Show when collapsed */}
                      {!isCollapsed && item.id === "Registrations" && pendingCount > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-[#f47920] rounded-full ring-2 ring-[#0d1655] select-none animate-pulse" />
                      )}

                      {/* Tooltip - Show when collapsed on desktop */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 shadow-md">
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
            className={`
              w-full flex items-center gap-3 px-3 py-3 
              text-blue-200/50 hover:bg-red-500/10 hover:text-red-400 
              font-bold rounded-xl text-xs uppercase tracking-wider 
              transition-all duration-300 
              ${isCollapsed ? 'justify-center' : 'justify-start'}
            `}
          >
            <Lucide.LogOut size={16} className="shrink-0" />
            <span className={`transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}`}>
              Keluar Sistem
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};
