import React from "react";
import { RegistrationData } from "../../types";
import * as Lucide from "lucide-react";
import { motion } from "framer-motion";

interface GeographicalViewProps {
  data: RegistrationData[];
  isDarkMode: boolean;
}

export const GeographicalView: React.FC<GeographicalViewProps> = ({ data, isDarkMode }) => {
  const locations = data.filter(item => item["Link Google Maps"]).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black italic tracking-tight">Geographical Analysis</h3>
          <p className="text-sm font-bold text-slate-400">Network coverage and registrant distribution mapping</p>
        </div>
        <div className={`px-6 py-3 rounded-2xl border ${isDarkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-100'} flex items-center gap-3`}>
          <Lucide.MapPin size={20} className="text-[#F47920]" />
          <span className="text-sm font-black">{locations} Geo-tagged Points</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 h-[600px] rounded-[3rem] border border-transparent overflow-hidden relative shadow-2xl">
          <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
            {/* High-end Map Placeholder with Grid */}
            <div className="absolute inset-0 opacity-20" style={{ 
              backgroundImage: 'radial-gradient(#1a2d8f 1px, transparent 1px)', 
              backgroundSize: '30px 30px' 
            }}></div>
            <div className="text-center relative z-10 p-12">
              <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                <Lucide.Globe size={48} className="text-blue-400" />
              </div>
              <h4 className="text-3xl font-black text-white mb-4 italic uppercase tracking-tighter">Live Network Map</h4>
              <p className="text-blue-200/60 max-w-md mx-auto font-bold mb-8 uppercase tracking-widest text-[10px]">Visualizing {data.length} endpoints across the Jakarta Greater Area</p>
              <button className="px-10 py-4 bg-white text-[#1a2d8f] rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all">
                Initialize Interactive GIS
              </button>
            </div>
            
            {/* Sample Decorative Pins */}
            {[
              { t: '20%', l: '30%' }, { t: '40%', l: '60%' }, { t: '70%', l: '20%' }, { t: '50%', l: '80%' }
            ].map((p, i) => (
              <motion.div key={i} className="absolute w-4 h-4" style={{ top: p.t, left: p.l }}>
                <div className="absolute inset-0 bg-[#F47920] rounded-full animate-ping opacity-50"></div>
                <div className="w-2 h-2 bg-[#F47920] rounded-full relative z-10 shadow-[0_0_10px_#F47920]"></div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <h4 className="text-sm font-black uppercase tracking-widest mb-6">Hotspot Areas</h4>
            <div className="space-y-4">
              {[
                { name: "Jakarta Timur", count: 45, color: "blue" },
                { name: "Bekasi Barat", count: 32, color: "orange" },
                { name: "Jakarta Selatan", count: 28, color: "emerald" },
                { name: "Depok City", count: 15, color: "purple" }
              ].map((area) => (
                <div key={area.name} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase">
                    <span className="text-slate-400">{area.name}</span>
                    <span>{area.count}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${
                      area.color === 'blue' ? 'bg-[#1a2d8f]' :
                      area.color === 'orange' ? 'bg-[#F47920]' :
                      area.color === 'emerald' ? 'bg-emerald-500' :
                      'bg-purple-500'
                    }`} style={{ width: `${area.count}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <h4 className="text-sm font-black uppercase tracking-widest mb-4">Geo-Tagging Health</h4>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-black text-emerald-500">{Math.round((locations / (data.length || 1)) * 100)}%</div>
              <div className="text-[9px] font-bold text-slate-400 leading-tight uppercase tracking-widest">
                Of registrants provided valid GPS coordinates
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
