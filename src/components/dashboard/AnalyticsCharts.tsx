import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell, BarChart as ReBarChart, Bar
} from 'recharts';
import * as Lucide from "lucide-react";
import { DashboardStats } from "../../types";

interface AnalyticsChartsProps {
  stats: DashboardStats | null;
  isDarkMode: boolean;
  totalCount: number;
}

// Palet Warna Resmi Armedia Net Luxury
const BRAND_COLORS = ['#0d1655', '#F47920', '#FDB913', '#3b82f6', '#ef4444', '#10b981'];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ stats, totalCount }) => {
  const activeCount = stats?.statusCounts?.["AKTIF"] || 0;
  const conversionRate = Math.round((activeCount / (totalCount || 1)) * 100);

  return (
    <div className="space-y-6 w-full overflow-hidden">

      {/* Insight Metrics Row - Stacked on Mobile, 3 Columns on Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-[#0d1655] to-blue-900 text-white rounded-3xl p-5 sm:p-6 shadow-sm border border-white/10 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-white/10 rounded-xl border border-white/10"><Lucide.Banknote size={20} className="text-[#FDB913]" /></div>
            <span className="text-[9px] font-black uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-lg">Estimasi MRR</span>
          </div>
          <p className="text-xs font-bold text-blue-200">Projeksi Pendapatan</p>
          <h2 className="text-2xl sm:text-3xl font-black mt-1 tracking-tight">Rp {(stats?.revenueProjection || 0).toLocaleString('id-ID')}</h2>
          <p className="text-[9px] mt-4 font-bold uppercase tracking-widest text-blue-300/60">*Berdasarkan paket pelanggan aktif</p>
        </div>

        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-50 border border-orange-100 text-[#F47920] rounded-xl"><Lucide.TrendingUp size={20} /></div>
            <span className="text-[9px] font-black uppercase tracking-widest bg-orange-50 text-[#F47920] border border-orange-100 px-2.5 py-1 rounded-lg">Konversi</span>
          </div>
          <p className="text-xs font-bold text-slate-400">Rasio Pemasangan</p>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0d1655] mt-1">{conversionRate}%</h2>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#F47920] h-full transition-all duration-1000" style={{ width: `${conversionRate}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 border border-blue-100 text-[#0d1655] rounded-xl"><Lucide.MapPin size={20} /></div>
            <span className="text-[9px] font-black uppercase tracking-widest bg-blue-50 text-[#0d1655] border border-blue-100 px-2.5 py-1 rounded-lg">Zona Hotspot</span>
          </div>
          <p className="text-xs font-bold text-slate-400">Minat Tertinggi Wilayah</p>
          <h2 className="text-xl sm:text-2xl font-black text-[#0d1655] mt-1 truncate">{stats?.regionalData?.[0]?.name || "N/A"}</h2>
          <p className="text-[9px] mt-4 font-bold text-slate-400 uppercase tracking-widest">{stats?.regionalData?.[0]?.value || 0} Registrasi Aktif</p>
        </div>
      </div>

      {/* Charts Section - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-black text-[#0d1655] flex items-center gap-2">
              <Lucide.Activity size={18} className="text-[#F47920]" /> Tren Pertumbuhan
            </h3>
            <span className="px-3 py-1 bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-wider rounded-lg">7 Hari Terakhir</span>
          </div>
          <div className="p-4 sm:p-6">
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.trendData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorArmedia" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F47920" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#F47920" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', background: '#fff', fontSize: '11px' }} />
                  <Area type="monotone" dataKey="count" stroke="#F47920" strokeWidth={3} fillOpacity={1} fill="url(#colorArmedia)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-sm sm:text-base font-black text-[#0d1655] flex items-center gap-2">
              <Lucide.PieChart size={18} className="text-[#F47920]" /> Distribusi Paket
            </h3>
          </div>
          <div className="p-4 sm:p-6 flex flex-col justify-center">
            <div className="h-[180px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={stats?.packageData || []} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value" stroke="none">
                    {(stats?.packageData || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} cornerRadius={4} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-[#0d1655]">{totalCount}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Total</span>
              </div>
            </div>
            <div className="mt-4 space-y-2 max-h-[100px] overflow-y-auto custom-scrollbar pr-1">
              {(stats?.packageData || []).map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between text-[11px] font-bold">
                  <div className="flex items-center gap-2 truncate max-w-[140px]">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: BRAND_COLORS[index % BRAND_COLORS.length] }}></div>
                    <span className="text-slate-600 truncate">{entry.name}</span>
                  </div>
                  <span className="text-slate-400 shrink-0">{Math.round((entry.value / (totalCount || 1)) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Suggestion Section */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-50 text-[#F47920] rounded-xl flex items-center justify-center border border-orange-100 shadow-sm"><Lucide.Zap size={20} /></div>
          <div>
            <h3 className="text-base font-black text-[#0d1655] leading-tight">Saran Strategi Bisnis</h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Business Insights & Optimization</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100 group hover:border-[#F47920] transition-all">
            <h4 className="font-black text-xs text-[#0d1655] flex items-center gap-1.5 mb-1.5">
              <Lucide.Users size={14} className="text-blue-600" /> Optimasi Konversi Pemasangan
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed font-bold">
              Tingkatkan follow-up pada status <b>Survei</b> ({stats?.statusCounts?.["SURVEY"] || 0} Antrean). Naikkan konversi dengan skema penawaran gratis biaya pasang jika aktivasi di minggu ini.
            </p>
          </div>
          <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100 group hover:border-[#F47920] transition-all">
            <h4 className="font-black text-xs text-[#0d1655] flex items-center gap-1.5 mb-1.5">
              <Lucide.Target size={14} className="text-[#F47920]" /> Fokus Penetrasi Wilayah
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed font-bold">
              Wilayah <b>{stats?.regionalData?.[0]?.name || "N/A"}</b> memiliki tingkat minat tertinggi. Alokasikan teknisi ekstra ke zona ini untuk mempercepat waktu penarikan kabel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FullAnalytics: React.FC<AnalyticsChartsProps> = ({ stats, totalCount }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-black text-[#0d1655] flex items-center gap-2">
            <Lucide.Globe size={18} className="text-[#F47920]" /> Cakupan Teratas Wilayah
          </h3>
        </div>
        <div className="p-4 sm:p-6">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={stats?.regionalData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" fill="#0d1655" radius={[6, 6, 0, 0]} barSize={30} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-black text-[#0d1655] flex items-center gap-2">
            <Lucide.Search size={18} className="text-[#F47920]" /> Sumber Informasi Pendaftar
          </h3>
        </div>
        <div className="p-4 sm:p-6">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={stats?.sourceData || []} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} width={80} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" fill="#F47920" radius={[0, 6, 6, 0]} barSize={20} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};