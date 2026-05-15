import React, { useEffect, useRef } from "react";
import { RegistrationData } from "../../types";
import * as Lucide from "lucide-react";

interface GeographicalViewProps {
  data: RegistrationData[];
  isDarkMode: boolean;
}

declare const L: any; // Leaflet global from CDN

export const GeographicalView: React.FC<GeographicalViewProps> = ({ data, isDarkMode }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);

  // Helper to extract coordinates from Google Maps URL
  const extractCoords = (url: string) => {
    if (!url) return null;
    // Patterns: ?q=lat,lng or /@lat,lng or q=lat%2Clng
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

    // Clear existing markers
    leafletMap.current.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        leafletMap.current.removeLayer(layer);
      }
    });

    // Add markers
    const bounds = L.latLngBounds([]);
    geoData.forEach(point => {
      if (point.coords) {
        const marker = L.marker(point.coords).addTo(leafletMap.current);
        marker.bindPopup(`
          <div style="font-family: Inter, sans-serif;">
            <p style="font-weight: 800; color: #2b3674; margin-bottom: 4px;">${point["Nama Lengkap"]}</p>
            <p style="font-size: 10px; color: #707eae; margin-bottom: 8px;">${point.Paket}</p>
            <a href="${point["Link Google Maps"]}" target="_blank" style="font-size: 10px; font-weight: 700; color: #4318ff; text-decoration: none;">Buka di Google Maps</a>
          </div>
        `);
        bounds.extend(point.coords);
      }
    });

    if (geoData.length > 0) {
      leafletMap.current.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      // Cleanup not strictly necessary here but good practice
    };
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div>
          <h3 className="text-xl font-bold text-[#2b3674]">Sebaran Pelanggan</h3>
          <p className="text-xs font-medium text-[#a3aed0]">Peta distribusi registrasi Armedia Net</p>
        </div>
        <div className="bright-card px-6 py-3 flex items-center gap-3">
          <Lucide.MapPin size={20} className="text-[#4318ff]" />
          <span className="text-sm font-bold text-[#2b3674]">{geoData.length} Lokasi Terdeteksi</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 h-[600px] bright-card overflow-hidden relative z-10">
          <div ref={mapRef} className="w-full h-full" />
        </div>

        <div className="space-y-6">
          <div className="bright-card p-6">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#a3aed0] mb-6">Informasi Wilayah</h4>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#e6fff5] text-[#01b574] flex items-center justify-center">
                   <Lucide.ShieldCheck size={24} />
                </div>
                <div>
                   <p className="text-xl font-bold text-[#2b3674]">{Math.round((geoData.length / (data.length || 1)) * 100)}%</p>
                   <p className="text-[10px] font-medium text-[#a3aed0] uppercase tracking-tighter">Data Lokasi Valid</p>
                </div>
              </div>
              
              <div className="p-4 rounded-2xl bg-[#f4f7fe] border border-[#e0e5f2]">
                <p className="text-[10px] font-bold text-[#707eae] leading-relaxed">
                  Pin biru menunjukkan lokasi pelanggan yang sudah menyertakan koordinat GPS. Klik pin untuk melihat detail.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
