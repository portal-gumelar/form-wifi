// AUDIT FIX: Header.tsx - NotificationBell dengan polling real API
// - Polling GET /api/notifications/unread-count tiap 30 detik
// - Badge merah jika count > 0
// - Dropdown 10 notif terbaru
// - Klik item → mark as read

import React, { useState, useEffect, useRef, useCallback } from "react";
import * as Lucide from "lucide-react";
import { api } from "../../utils/apiClient";

interface HeaderProps {
  activeTab:        string;
  isDarkMode:       boolean;
  isSidebarOpen:    boolean;
  setIsSidebarOpen: (val: boolean) => void;
  searchTerm:       string;
  setSearchTerm:    (val: string) => void;
  userRole?:        string;
}

interface NotificationItem {
  id:              number;
  type:            string;
  title:           string;
  message:         string;
  subscriber_id:   number | null;
  is_read:         boolean;
  subscriber_name: string | null;
  created_at:      string;
}

// AUDIT FIX: NotificationBell sebagai sub-komponen dengan polling
const NotificationBell: React.FC<{ onNavigateToCustomer?: (id: number) => void }> = ({ onNavigateToCustomer }) => {
  const [unreadCount,    setUnreadCount]    = useState(0);
  const [notifications,  setNotifications]  = useState<NotificationItem[]>([]);
  const [showDropdown,   setShowDropdown]   = useState(false);
  const [isLoadingNotif, setIsLoadingNotif] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // AUDIT FIX: Polling unread count tiap 30 detik
  const fetchUnreadCount = useCallback(async () => {
    try {
      const { count } = await api.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Diam jika gagal (token expired akan di-handle oleh apiClient)
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    intervalRef.current = setInterval(fetchUnreadCount, 30 * 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchUnreadCount]);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleBellClick = async () => {
    const nextState = !showDropdown;
    setShowDropdown(nextState);

    if (nextState && notifications.length === 0) {
      setIsLoadingNotif(true);
      try {
        const items = await api.getNotifications();
        setNotifications(items.slice(0, 10));
      } catch {
        /* ignore */
      } finally {
        setIsLoadingNotif(false);
      }
    }
  };

  const handleMarkRead = async (notif: NotificationItem) => {
    if (!notif.is_read) {
      try {
        await api.markNotificationRead(notif.id);
        setNotifications(prev =>
          prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch { /* ignore */ }
    }

    if (notif.subscriber_id && onNavigateToCustomer) {
      setShowDropdown(false);
      onNavigateToCustomer(notif.subscriber_id);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1)  return "Baru saja";
    if (diffMin < 60) return `${diffMin} menit lalu`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24)  return `${diffHr} jam lalu`;
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="notification-bell"
        onClick={handleBellClick}
        className="relative w-9 h-9 rounded-xl bg-slate-50 text-slate-400 border border-slate-100 flex items-center justify-center hover:border-orange-300 hover:text-[#F47920] transition-all shadow-sm"
        aria-label={`Notifikasi - ${unreadCount} belum dibaca`}
      >
        <Lucide.Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-xs font-black text-[#0d1655] uppercase tracking-wider">Notifikasi</p>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                  {unreadCount} baru
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Tandai semua
                </button>
              )}
              <button onClick={() => setShowDropdown(false)} className="text-slate-400 hover:text-slate-600">
                <Lucide.X size={14} />
              </button>
            </div>
          </div>

          {/* Content */}
          {isLoadingNotif ? (
            <div className="px-4 py-8 flex items-center justify-center">
              <Lucide.RefreshCw size={20} className="animate-spin text-slate-300" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Lucide.BellOff size={28} className="text-slate-200 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-bold">Tidak ada notifikasi</p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              {notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => handleMarkRead(n)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 flex items-start gap-3 transition-colors ${
                    !n.is_read ? "bg-orange-50/40" : ""
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 mt-0.5 ${
                    !n.is_read ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    {n.type === "new_registration" ? (
                      <Lucide.UserPlus size={14} />
                    ) : (
                      <Lucide.Bell size={14} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-black truncate ${!n.is_read ? "text-slate-800" : "text-slate-600"}`}>
                      {n.title}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed line-clamp-2 mt-0.5">
                      {n.message}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide">
                      {formatTime(n.created_at)}
                    </p>
                  </div>
                  {!n.is_read && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full shrink-0 mt-2" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

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

        <span className="sm:hidden font-black text-[#0d1655] text-sm uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
          ⚙️ {activeTab.slice(0, 12)}
        </span>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-2">
          {/* Role Badge */}
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
            userRole === "superadmin"
              ? "bg-amber-50 border-amber-200 text-amber-700"
              : "bg-blue-50 border-blue-200 text-blue-700"
          }`}>
            {userRole === "superadmin" ? <Lucide.ShieldAlert size={14} /> : <Lucide.ShieldCheck size={14} />}
            <span className="text-[10px] font-black uppercase tracking-widest">{userRole}</span>
          </div>

          {/* AUDIT FIX: NotificationBell dengan real polling */}
          <NotificationBell />

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