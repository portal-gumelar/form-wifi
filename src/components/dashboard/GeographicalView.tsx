import React, { useEffect, useRef, useState } from "react";
import { RegistrationData } from "../../types";
import * as Lucide from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GeographicalViewProps {
  data: RegistrationData[];
  isDarkMode: boolean;
}

declare const L: any;

export const GeographicalView: React.FC<GeographicalViewProps> = ({ data, isDarkMode }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const [selectedKTP, setSelectedKTP] = useState<RegistrationData | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Use data directly (which is already filtered globally from Dashboard)
  const filteredData = data;

  // Stats
  const withKTP = filteredData.filter(item => item.foto_ktp && (String(item.foto_ktp).startsWith("data:image/") || String(item.foto_ktp).startsWith("http"))).length;
  const withoutKTP = filteredData.length - withKTP;

  const extractCoords = (url: string) => {
    if (!url) return null;
    const regex = /q=([-+]?\d*\.?\d+)%2C([-+]?\d*\.?\d+)|q=([-+]?\d*\.?\d+),([-+]?\d*\.?\d+)|@([-+]?\d*\.?\d+),([-+]?\d*\.?\d+)/;
    const match = url.match(regex);
    if (match) {
      const lat = parseFloat(match[1] || match[3] || match[5]);
      const lng = parseFloat(match[2] || match[4] || match[6]);
      return [lat, lng];
    }
    return null;
  };

  const geoData = data.map(item => ({
    ...item,
    coords: extractCoords(item.link_google_maps || "")
  })).filter(item => item.coords);

  useEffect(() => {
    if (!mapRef.current || !window.hasOwnProperty('L')) return;

    if (!leafletMap.current) {
      leafletMap.current = L.map(mapRef.current).setView([-7.40, 109.00], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(leafletMap.current);
    }

    leafletMap.current.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        leafletMap.current.removeLayer(layer);
      }
    });

    const bounds = L.latLngBounds([]);
    geoData.forEach(point => {
      if (point.coords) {
        const hasKTP = point.foto_ktp && (String(point.foto_ktp).startsWith("data:image/") || String(point.foto_ktp).startsWith("http"));
        
        // Enhance marker based on status
        const status = (point.status || "").toUpperCase();
        let markerColor = '#94a3b8'; // default
        let iconHtml = '📍';
        let glowColor = 'rgba(148, 163, 184, 0.4)';
        
        if (status === 'AKTIF') { markerColor = '#10b981'; iconHtml = '✓'; glowColor = 'rgba(16, 185, 129, 0.5)'; }
        else if (status === 'PROSES') { markerColor = '#f59e0b'; iconHtml = '⚙'; glowColor = 'rgba(245, 158, 11, 0.5)'; }
        else if (status === 'SURVEY') { markerColor = '#3b82f6'; iconHtml = '👁'; glowColor = 'rgba(59, 130, 246, 0.5)'; }
        else if (status === 'PENGAJUAN') { markerColor = '#8b5cf6'; iconHtml = '+'; glowColor = 'rgba(139, 92, 246, 0.5)'; }
        else if (status === 'BATAL' || status === 'NON AKTIF') { markerColor = '#ef4444'; iconHtml = '✕'; glowColor = 'rgba(239, 68, 68, 0.5)'; }
        else if (hasKTP) { markerColor = '#16a34a'; iconHtml = '📷'; glowColor = 'rgba(22, 163, 74, 0.5)'; }

        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${markerColor}; width: 26px; height: 26px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px ${glowColor}, 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 900; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">${iconHtml}</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        const marker = L.marker(point.coords, { icon }).addTo(leafletMap.current);
        marker.bindPopup(`
          <div style="font-family: 'Inter', sans-serif; padding: 4px; min-width: 180px;">
            <p style="font-weight: 950; color: #0d1655; margin: 0 0 2px 0; font-size: 13px; text-transform: uppercase; letter-spacing: -0.5px;">${point.nama_lengkap}</p>
            <p style="font-size: 9px; color: #94a3b8; font-weight: 700; margin: 0 0 6px 0;">ID: AMN-${point.timestamp.replace(/\D/g, "").slice(-5)}</p>
            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 8px;">
              <span style="background-color: ${hasKTP ? '#f0fdf4' : '#fef2f2'}; color: ${hasKTP ? '#16a34a' : '#ef4444'}; font-size: 8px; font-weight: 900; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
                ${hasKTP ? '📷 KTP Ada' : '❌ KTP Kosong'}
              </span>
            </div>
            <a href="${point.link_google_maps}" target="_blank" style="display: block; text-align: center; background-color: #F47920; color: white; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 12px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 10px rgba(244, 121, 32, 0.15);">
              📍 Buka Rute GPS
            </a>
          </div>
        `);
        bounds.extend(point.coords);
      }
    });

    if (geoData.length > 0) {
      leafletMap.current.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [data, geoData]);

  return (
    <div className="space-y-6 w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div>
          <h3 className="text-xl font-black text-[#0d1655] tracking-tight">Sebaran Lokasi & Data KTP</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Monitoring Foto KTP Pelanggan per Desa</p>
        </div>
      </div>

      {/* Filter & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* KTP Stats */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
              <Lucide.Image size={24} />
            </div>
            <div>
              <p className="text-3xl font-black text-emerald-700 leading-none">{withKTP}</p>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Data KTP Tersedia</p>
            </div>
          </div>
          <div className="hidden sm:block text-right">
             <div className="w-12 h-12 rounded-full border-4 border-emerald-200 flex items-center justify-center text-emerald-600 font-black text-[10px]">
               {Math.round((withKTP / (filteredData.length || 1)) * 100)}%
             </div>
          </div>
        </div>

        {/* Missing KTP Stats */}
        <div className={`border rounded-2xl p-5 shadow-sm flex items-center justify-between ${withoutKTP > 0 ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${withoutKTP > 0 ? 'bg-red-500 text-white shadow-red-500/30' : 'bg-slate-300 text-slate-500'}`}>
              <Lucide.ImageOff size={24} />
            </div>
            <div>
              <p className={`text-3xl font-black leading-none ${withoutKTP > 0 ? 'text-red-700' : 'text-slate-500'}`}>{withoutKTP}</p>
              <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${withoutKTP > 0 ? 'text-red-600' : 'text-slate-500'}`}>KTP Belum Ada</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Map + KTP List */}
      <div className={`grid grid-cols-1 lg:grid-cols-5 gap-6 ${isFullscreen ? 'fixed inset-0 z-[100] bg-slate-50 p-4 md:p-6 overflow-hidden' : ''}`}>
        {/* Map */}
        <div className={`${isFullscreen ? 'lg:col-span-5 h-full' : 'lg:col-span-3 h-[380px] sm:h-[500px]'} bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative z-10 transition-all`} style={{ touchAction: 'pan-y' }}>
          <div ref={mapRef} className="w-full h-full z-10" />
          
          {/* Legend overlay */}
          <div className="absolute bottom-6 left-4 z-[400] bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/50 text-[10px] font-black uppercase tracking-wider space-y-2 pointer-events-none">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-[0_0_8px_rgba(16,185,129,0.5)] flex items-center justify-center text-white text-[8px]">✓</span> AKTIF</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-[0_0_8px_rgba(245,158,11,0.5)] flex items-center justify-center text-white text-[8px]">⚙</span> PROSES</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block shadow-[0_0_8px_rgba(59,130,246,0.5)] flex items-center justify-center text-white text-[8px]">👁</span> SURVEI</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple-500 inline-block shadow-[0_0_8px_rgba(139,92,246,0.5)] flex items-center justify-center text-white text-[8px]">+</span> PENGAJUAN</div>
          </div>

          <button 
            onClick={() => {
              setIsFullscreen(!isFullscreen);
              setTimeout(() => leafletMap.current?.invalidateSize(), 300);
            }}
            className="absolute top-4 right-4 z-[400] bg-white p-3 rounded-2xl shadow-xl border border-slate-200 text-[#0d1655] hover:bg-slate-50 transition-all hover:scale-105"
            title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
          >
            {isFullscreen ? <Lucide.Minimize size={20} /> : <Lucide.Maximize size={20} />}
          </button>
        </div>

        {/* KTP Customer List */}
        {!isFullscreen && (
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-[#0d1655] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lucide.IdCard size={20} className="text-[#F47920]" />
              <h4 className="text-sm font-black text-white">Daftar Pelanggan Area Map</h4>
            </div>
            <span className="bg-white/10 px-3 py-1 rounded-lg text-[10px] font-black text-white">
              {filteredData.length} data
            </span>
          </div>
          
          <div className="h-[420px] overflow-y-auto custom-scrollbar p-3 space-y-2">
            {filteredData.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Lucide.FileX size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-bold">Tidak ada data pelanggan</p>
              </div>
            ) : (
              filteredData.map((item) => {
                const hasKTP = item.foto_ktp && (String(item.foto_ktp).startsWith("data:image/") || String(item.foto_ktp).startsWith("http"));
                return (
                  <div 
                    key={item.timestamp}
                    onClick={() => hasKTP && setSelectedKTP(item)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      hasKTP 
                        ? 'bg-emerald-50/50 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50' 
                        : 'bg-red-50/50 border-red-100 hover:border-red-300 hover:bg-red-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* KTP Status Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        hasKTP ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'
                      }`}>
                        {hasKTP ? <Lucide.Image size={18} /> : <Lucide.ImageOff size={18} />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-800 truncate">{item.nama_lengkap || "Tanpa Nama"}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{item.desa || "-"} • {item.no_hp_wa || "-"}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                            hasKTP ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {hasKTP ? '📷 KTP Tersedia' : '❌ KTP Belum Ada'}
                          </span>
                          {hasKTP && (
                            <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-1">
                              <Lucide.ZoomIn size={10} /> Lihat
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        )}
      </div>

      {/* KTP Preview Modal */}
      <AnimatePresence>
        {selectedKTP && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedKTP(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#0d1655] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lucide.IdCard size={20} className="text-[#F47920]" />
                  <div>
                    <h4 className="text-sm font-black text-white">{selectedKTP.nama_lengkap}</h4>
                    <p className="text-[10px] text-blue-200 font-bold">ID: AMN-{selectedKTP.timestamp?.replace(/\D/g, "").slice(-5)}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedKTP(null)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                >
                  <Lucide.X size={18} className="text-white" />
                </button>
              </div>
              <div className="p-4">
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-xs">
                    <Lucide.MapPin size={14} className="text-slate-400" />
                    <span className="font-bold text-slate-600">{selectedKTP.alamat_pemasangan}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Lucide.Phone size={14} className="text-slate-400" />
                    <span className="font-bold text-slate-600">{selectedKTP.no_hp_wa}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Lucide.Package size={14} className="text-slate-400" />
                    <span className="font-bold text-[#F47920]">{selectedKTP.paket}</span>
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                  <img 
                    src={selectedKTP.foto_ktp} 
                    alt="KTP Pelanggan" 
                    className="w-full h-auto max-h-[400px] object-contain cursor-zoom-in"
                    onClick={() => window.open(selectedKTP.foto_ktp, '_blank')}
                  />
                </div>
                <p className="text-[10px] text-center text-slate-400 mt-3 font-bold">
                  💡 Klik foto untuk memperbesar
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
