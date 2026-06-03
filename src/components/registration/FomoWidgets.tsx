import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";
import { api } from "../../utils/apiClient";

interface FomoEvent {
  id: string;
  name: string;
  desa: string;
  type: "daftar" | "konsultasi" | "lihat";
  paket?: string;
  time: string;
}

const FALLBACK_EVENTS: FomoEvent[] = [
  { id: "f1", name: "Andi S.", desa: "GUMELAR", type: "daftar", paket: "GUYUB_1 (20 Mbps)", time: "3 menit yang lalu" },
  { id: "f2", name: "Siti R.", desa: "CIHONJE", type: "konsultasi", time: "Baru saja" },
  { id: "f3", name: "Roni H.", desa: "CIHONJE", type: "lihat", paket: "GUYUB_2 (30 Mbps)", time: "1 menit yang lalu" },
  { id: "f4", name: "Dewi A.", desa: "GUMELAR", type: "konsultasi", time: "10 menit yang lalu" },
  { id: "f5", name: "Joko W.", desa: "GUMELAR", type: "daftar", paket: "GUYUB_3 (50 Mbps)", time: "2 jam yang lalu" },
  { id: "f6", name: "Budi P.", desa: "CIHONJE", type: "daftar", paket: "GUYUB_1 (20 Mbps)", time: "5 menit yang lalu" },
  { id: "f7", name: "Lina M.", desa: "GUMELAR", type: "lihat", paket: "GUYUB_5 (100 Mbps)", time: "Baru saja" },
  { id: "f8", name: "Ahmad F.", desa: "CIHONJE", type: "konsultasi", time: "12 menit yang lalu" },
  { id: "f9", name: "Rina K.", desa: "GUMELAR", type: "daftar", paket: "GUYUB_2 (30 Mbps)", time: "8 menit yang lalu" },
  { id: "f10", name: "Dani T.", desa: "CIHONJE", type: "lihat", paket: "GUYUB_1 (20 Mbps)", time: "2 menit yang lalu" },
  { id: "f11", name: "Eko S.", desa: "GUMELAR", type: "konsultasi", time: "Baru saja" },
  { id: "f12", name: "Maya D.", desa: "CIHONJE", type: "daftar", paket: "GUYUB_4 (70 Mbps)", time: "15 menit yang lalu" },
  { id: "f13", name: "Putri N.", desa: "GUMELAR", type: "lihat", paket: "GUYUB_3 (50 Mbps)", time: "Baru saja" },
  { id: "f14", name: "Agus R.", desa: "CIHONJE", type: "konsultasi", time: "20 menit yang lalu" },
  { id: "f15", name: "Bambang M.", desa: "GUMELAR", type: "daftar", paket: "GUYUB_1 (20 Mbps)", time: "1 jam yang lalu" },
  { id: "f16", name: "Siska P.", desa: "CIHONJE", type: "lihat", paket: "GUYUB_2 (30 Mbps)", time: "5 menit yang lalu" }
];

export const FomoNotifications: React.FC = () => {
  const [events, setEvents] = useState<FomoEvent[]>(FALLBACK_EVENTS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Fetch real registration data from Backend and blend it
  useEffect(() => {
    const fetchLatestRegistrations = async () => {
      try {
        const res = await api.getRegistrations();
        const data = res.data ? res.data.slice(0, 5) : [];

        if (data && data.length > 0) {
          const realEvents: FomoEvent[] = data.map((reg: any, idx: number) => {
            // Mask name for privacy (e.g. Budi Santoso -> Budi S.)
            const nameParts = reg.nama_lengkap?.trim().split(" ") || ["Pelanggan"];
            const maskedName = nameParts[0] + (nameParts.length > 1 ? ` ${nameParts[1][0]}.` : "");
            
            // Clean package name
            const paketClean = reg.paket ? reg.paket.split("-")[0].trim() : "Paket Internet";

            return {
              id: `real-${idx}-${Date.now()}`,
              name: maskedName,
              desa: reg.desa || "GUMELAR",
              type: "daftar" as const,
              paket: paketClean,
              time: "Baru-baru ini"
            };
          });

          // Mix real events and simulated events
          const blended = [...realEvents];
          
          // Add consultations and views to keep it dynamic
          const blendedTypes: FomoEvent[] = [
            { id: "mix-1", name: "Hendra K.", desa: "GUMELAR", type: "konsultasi", time: "Baru saja" },
            { id: "mix-2", name: "Siti M.", desa: "CIHONJE", type: "lihat", paket: "GUYUB_2 (30 Mbps)", time: "1 menit yang lalu" },
            { id: "mix-3", name: "Novi A.", desa: "CIHONJE", type: "konsultasi", time: "4 menit yang lalu" },
            { id: "mix-4", name: "Taufik H.", desa: "GUMELAR", type: "lihat", paket: "GUYUB_1 (20 Mbps)", time: "Baru saja" },
            { id: "mix-5", name: "Ratna D.", desa: "CIHONJE", type: "konsultasi", time: "2 menit yang lalu" },
            { id: "mix-6", name: "Rizky F.", desa: "GUMELAR", type: "daftar", paket: "GUYUB_3 (50 Mbps)", time: "10 menit yang lalu" },
            { id: "mix-7", name: "Dina L.", desa: "CIHONJE", type: "lihat", paket: "GUYUB_1 (20 Mbps)", time: "Baru saja" },
            { id: "mix-8", name: "Aris S.", desa: "GUMELAR", type: "konsultasi", time: "7 menit yang lalu" }
          ];

          // Blend them alternatively
          for (let i = 0; i < blendedTypes.length; i++) {
            blended.splice((i * 2) + 1, 0, blendedTypes[i]);
          }

          setEvents(blended);
        }
      } catch (err) {
        console.warn("Using fallback FOMO data due to fetch error:", err);
      }
    };

    fetchLatestRegistrations();
  }, []);

  // Cycle through events
  useEffect(() => {
    // Initial delay before showing the very first time (wait 30 seconds)
    const initialTimeout = setTimeout(() => {
      setIsVisible(true);
      // Hide it after 5 seconds
      setTimeout(() => setIsVisible(false), 5000);
    }, 30000);

    // After that, show a new one every 60 seconds (1 menit)
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
      setIsVisible(true);
      // Hide it after 5 seconds
      setTimeout(() => setIsVisible(false), 5000);
    }, 60000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [events]);

  const currentEvent = events[currentIndex];

  if (!currentEvent) return null;

  return (
    <div className="fixed top-4 left-0 right-0 flex justify-center px-4 z-[100] pointer-events-none">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: -50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="pointer-events-auto bg-[#0d1655]/95 backdrop-blur-xl border border-white/10 p-1.5 pr-4 rounded-full shadow-2xl flex items-center gap-2 sm:gap-3 select-none w-max max-w-full"
          >
            {/* Visual Indicator Icon */}
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 shadow-inner ${
              currentEvent.type === "daftar"
                ? "bg-orange-500/10 text-[#F47920] border border-orange-500/20"
                : currentEvent.type === "konsultasi"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
            }`}>
              {currentEvent.type === "daftar" && (
                <Lucide.Zap className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
              )}
              {currentEvent.type === "konsultasi" && (
                <Lucide.MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
              )}
              {currentEvent.type === "lihat" && (
                <Lucide.Eye className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
              )}
            </div>

            {/* Notification Text */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-[9px] sm:text-[11px] leading-tight truncate">
                <span className="text-[#FDB913] font-bold">Seseorang dari {currentEvent.desa}</span>{" "}
                {currentEvent.type === "daftar" && (
                  <>daftar <span className="text-[#F47920] font-bold">{currentEvent.paket}</span></>
                )}
                {currentEvent.type === "konsultasi" && (
                  <>tanya via <span className="text-emerald-400 font-bold">WA</span></>
                )}
                {currentEvent.type === "lihat" && (
                  <>lihat <span className="text-[#F47920] font-bold">{currentEvent.paket}</span></>
                )}
                <span className="text-white/40 ml-1.5 whitespace-nowrap">• {currentEvent.time}</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FloatingWhatsAppButton: React.FC = () => {
  const WHATSAPP_NUMBER = "6289646415444";
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Show tooltip after 5 seconds to draw attention
    const timer = setTimeout(() => {
      setShowTooltip(true);
      // Hide it after 6 seconds
      setTimeout(() => setShowTooltip(false), 6000);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    const text = encodeURIComponent(
      "Halo CS ARMEDIA.ID,\n\nSaya ingin bertanya dan berkonsultasi mengenai pemasangan internet rumah unlimited."
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
  };

  return (
    <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-2.5">
      {/* Glow Ripple Effect Background */}
      <div className="absolute -inset-1 bg-[#25D366] rounded-full blur opacity-20 group-hover:opacity-40 animate-pulse pointer-events-none"></div>

      {/* Tooltip speech bubble */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="bg-white text-slate-800 px-4 py-3 rounded-2xl shadow-xl border border-slate-100 relative pointer-events-auto select-none max-w-[220px]"
          >
            {/* Small triangle arrow at bottom-right */}
            <div className="absolute bottom-[-5px] right-6 w-3.5 h-3.5 bg-white border-r border-b border-slate-100 rotate-45"></div>
            <p className="text-[11px] font-black leading-tight mb-1">
              💬 Kesulitan mendaftar via web?
            </p>
            <p className="text-[10px] font-semibold text-slate-500 leading-tight">
              Anda bisa mendaftar atau konsultasi langsung via WhatsApp.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(37,211,102,0.4)] cursor-pointer relative group transition-colors duration-300"
      >
        {/* Pulsing ring */}
        <span className="absolute inset-0 rounded-full border-4 border-[#25D366] animate-ping opacity-25"></span>

        {/* SVG WhatsApp Official Logo */}
        <svg
          viewBox="0 0 24 24"
          className="w-7.5 h-7.5 fill-white shrink-0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.454 5.709 1.455h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </motion.button>
    </div>
  );
};
