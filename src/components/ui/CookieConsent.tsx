import React, { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already consented
    const hasConsented = localStorage.getItem("cookie-consent");
    if (!hasConsented) {
      // Small delay before showing the banner for a better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "true");
    setIsVisible(false);
  };

  const handleDecline = () => {
    // Save state to avoid asking again
    localStorage.setItem("cookie-consent", "false");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 pointer-events-none">
      <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-md border border-[#0D1655]/10 shadow-2xl rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pointer-events-auto animate-in slide-in-from-bottom-8 fade-in duration-500">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#F47920]/10 rounded-full shrink-0">
            <Cookie className="w-6 h-6 text-[#F47920]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0D1655] mb-1">
              Pengaturan Privasi & Cookies
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-2xl">
              Kami menggunakan cookie untuk meningkatkan pengalaman navigasi Anda, menyajikan konten yang disesuaikan, dan menganalisis trafik situs web armedia.id. Dengan mengklik "Terima Semua", Anda menyetujui penggunaan cookie kami.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end mt-2 sm:mt-0">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#0D1655] hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
          >
            Tolak
          </button>
          <button
            onClick={handleAccept}
            className="px-5 py-2 text-sm font-medium text-white bg-[#0D1655] hover:bg-[#0D1655]/90 rounded-lg shadow-md transition-all active:scale-95 whitespace-nowrap"
          >
            Terima Semua
          </button>
          <button
            onClick={handleDecline}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors hidden sm:block"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
