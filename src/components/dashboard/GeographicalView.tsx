import React, { useEffect, useRef } from "react";
import { RegistrationData } from "../../types";
import * as Lucide from "lucide-react";

interface GeographicalViewProps {
  data: RegistrationData[];
  isDarkMode: boolean;
}

declare const L: any;

export const GeographicalView: React.FC<GeographicalViewProps> = ({ data, isDarkMode }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);

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
        const marker = L.marker(point.coords).addTo(leafletMap.current);
        marker.bindPopup(`
          <div style="font-family: Inter, sans-serif; padding: 2px;">
            <p style="font-weight: 900; color: #0d1655; margin: 0 0 4px 0; font-size: 13px;">${point["Nama Lengkap"]}</p>
            <p style="font-size: 10px; color: #F47920; font-weight: 800; margin: 0 0 8px 0;">${point.Paket}</p>
            <a href="${point["Link Google Maps"]}" target="_blank" style="font-size: 10px; font-weight: 900; color: #3b82f6; text-decoration: underline;">Buka Google Maps</a>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div>
          <h3 className="text-xl font-black text-[#0d1655] tracking-tight">Sebaran Lokasi Pelanggan</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Pemetaan Geografis Registrasi</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl px-5 py-3 flex items-center gap-3 self-start shadow-sm">
          <Lucide.MapPin size={18} className="text-[#F47920]" />
          <span className="text-xs sm:text-sm font-black text-[#0d1655]">{geoData.length} Titik Valid Koordinat</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Kontainer Peta: touch-action menjamin scroll HP aman tidak tersangkut di dalam peta */}
        <div className="lg:col-span-3 h-[380px] sm:h-[500px] bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm relative z-10" style={{ touchAction: 'pan-y' }}>
          <div ref={mapRef} className="w-full h-full z-10" />
        </div>

        <div className="w-full">
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-2">Informasi Wilayah</h4>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Lucide.ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-lg font-black text-[#0d1655]">{Math.round((geoData.length / (data.length || 1)) * 100)}%</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Akurasi GPS Pelanggan</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-100 text-[11px] font-bold text-slate-500 leading-relaxed">
              Marker biru mewakili rumah pendaftar yang melampirkan tautan navigasi. Gunakan untuk rute survei tim teknisi lapangan.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};