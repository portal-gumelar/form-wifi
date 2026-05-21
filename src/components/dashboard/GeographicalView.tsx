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
  const [selectedDesa, setSelectedDesa] = useState<string>("");
  const [selectedKTP, setSelectedKTP] = useState<RegistrationData | null>(null);

  // Get unique villages
  const villages = [...new Set(data.map(item => item.Desa || "Tidak Diketahui"))].sort();

  // Filter data by selected village
  const filteredData = selectedDesa 
    ? data.filter(item => item.Desa === selectedDesa)
    : data;

  // Stats
  const withKTP = filteredData.filter(item => item["Foto KTP"] && String(item["Foto KTP"]).startsWith("data:image/")).length;
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
    coords: extractCoords(item["Link Google Maps"] || "")
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
        const hasKTP = point["Foto KTP"] && String(point["Foto KTP"]).startsWith("data:image/");
        const markerColor = hasKTP ? 'green' : 'red';
        
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${hasKTP ? '#16a34a' : '#ef4444'}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });

        const marker = L.marker(point.coords, { icon }).addTo(leafletMap.current);
        marker.bindPopup(`
          <div style="font-family: 'Inter', sans-serif; padding: 4px; min-width: 180px;">
            <p style="font-weight: 950; color: #0d1655; margin: 0 0 2px 0; font-size: 13px; text-transform: uppercase; letter-spacing: -0.5px;">${point["Nama Lengkap"]}</p>
            <p style="font-size: 9px; color: #94a3b8; font-weight: 700; margin: 0 0 6px 0;">ID: AMN-${point.Timestamp.replace(/\D/g, "").slice(-5)}</p>
            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 8px;">
              <span style="background-color: ${hasKTP ? '#f0fdf4' : '#fef2f2'}; color: ${hasKTP ? '#16a34a' : '#ef4444'}; font-size: 8px; font-weight: 900; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
                ${hasKTP ? '📷 KTP Ada' : '❌ KTP Kosong'}
              </span>
            </div>
            <a href="${point["Link Google Maps"]}" target="_blank" style="display: block; text-align: center; background-color: #F47920; color: white; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 12px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 10px rgba(244, 121, 32, 0.15);">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Village Filter */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Filter Desa</label>
          <select 
            value={selectedDesa} 
            onChange={(e) => setSelectedDesa(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-[#0d1655] transition-all cursor-pointer"
          >
            <option value="">Semua Desa ({data.length} pelanggan)</option>
            {villages.map(desa => {
              const count = data.filter(item => item.Desa === desa).length;
              return <option key={desa} value={desa}>{desa} ({count})</option>;
            })}
          </select>
        </div>

        {/* KTP Stats */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <Lucide.Image size={24} />
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-700">{withKTP}</p>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Pelanggan Dengan KTP</p>
          </div>
        </div>

        {/* Missing KTP Stats */}
        <div className={`border rounded-2xl p-4 shadow-sm flex items-center gap-3 ${withoutKTP > 0 ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md ${withoutKTP > 0 ? 'bg-red-500 text-white' : 'bg-slate-300 text-slate-500'}`}>
            <Lucide.ImageOff size={24} />
          </div>
          <div>
            <p className={`text-2xl font-black ${withoutKTP > 0 ? 'text-red-700' : 'text-slate-500'}`}>{withoutKTP}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-600">Belum Ada Foto KTP</p>
          </div>
        </div>
      </div>

      {/* Main Content: Map + KTP List */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Map */}
        <div className="lg:col-span-3 h-[380px] sm:h-[500px] bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm relative z-10" style={{ touchAction: 'pan-y' }}>
          <div ref={mapRef} className="w-full h-full z-10" />
        </div>

        {/* KTP Customer List */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-[#0d1655] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lucide.IdCard size={20} className="text-[#F47920]" />
              <h4 className="text-sm font-black text-white">Daftar Pelanggan {selectedDesa || "Semua"}</h4>
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
                const hasKTP = item["Foto KTP"] && String(item["Foto KTP"]).startsWith("data:image/");
                return (
                  <div 
                    key={item.Timestamp}
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
                        <p className="text-xs font-black text-slate-800 truncate">{item["Nama Lengkap"] || "Tanpa Nama"}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{item.Desa || "-"} • {item["No HP / WA"] || "-"}</p>
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
                    <h4 className="text-sm font-black text-white">{selectedKTP["Nama Lengkap"]}</h4>
                    <p className="text-[10px] text-blue-200 font-bold">ID: AMN-{selectedKTP.Timestamp?.replace(/\D/g, "").slice(-5)}</p>
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
                    <span className="font-bold text-slate-600">{selectedKTP["Alamat Pemasangan"]}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Lucide.Phone size={14} className="text-slate-400" />
                    <span className="font-bold text-slate-600">{selectedKTP["No HP / WA"]}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Lucide.Package size={14} className="text-slate-400" />
                    <span className="font-bold text-[#F47920]">{selectedKTP.Paket}</span>
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                  <img 
                    src={selectedKTP["Foto KTP"]} 
                    alt="KTP Pelanggan" 
                    className="w-full h-auto max-h-[400px] object-contain cursor-zoom-in"
                    onClick={() => window.open(selectedKTP["Foto KTP"], '_blank')}
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
