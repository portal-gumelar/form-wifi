import React, { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell, BarChart as ReBarChart, Bar, 
  FunnelChart, Funnel, LabelList, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import * as Lucide from "lucide-react";
import { DashboardStats, RegistrationData } from "../../types";

interface AnalyticsChartsProps {
  stats: DashboardStats | null;
  isDarkMode: boolean;
  totalCount: number;
  data?: RegistrationData[];
}

// Palet Warna Resmi ARMEDIA.ID Luxury
const BRAND_COLORS = ['#0d1655', '#F47920', '#FDB913', '#3b82f6', '#ef4444', '#10b981'];

// Funnel stages colors
const FUNNEL_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ stats, totalCount, data = [] }) => {
  const [selectedMonth, setSelectedMonth] = useState<'this' | 'last'>('this');

  const activeCount = stats?.statusCounts?.["AKTIF"] || 0;
  const conversionRate = Math.round((activeCount / (totalCount || 1)) * 100);

  // Funnel Data
  const funnelData = [
    { name: "PENGAJUAN", value: stats?.statusCounts?.["PENGAJUAN"] || 0, fill: FUNNEL_COLORS[0] },
    { name: "SURVEI", value: stats?.statusCounts?.["SURVEY"] || 0, fill: FUNNEL_COLORS[1] },
    { name: "PROSES", value: stats?.statusCounts?.["PROSES"] || 0, fill: FUNNEL_COLORS[2] },
    { name: "AKTIF", value: activeCount, fill: FUNNEL_COLORS[3] }
  ];

  // Provider Distribution Data
  const providerData = stats?.providerData || [];

  // Month-over-Month comparison
  const getThisMonthData = () => {
    const now = new Date();
    return data.filter(item => {
      if (!item.timestamp) return false;
      const itemDate = new Date(item.timestamp.split(',')[0]);
      return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    }).length;
  };

  const getLastMonthData = () => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
    return data.filter(item => {
      if (!item.timestamp) return false;
      const itemDate = new Date(item.timestamp.split(',')[0]);
      return itemDate.getMonth() === lastMonth.getMonth() && itemDate.getFullYear() === lastMonth.getFullYear();
    }).length;
  };

  const thisMonthCount = getThisMonthData();
  const lastMonthCount = getLastMonthData();
  const momChange = lastMonthCount > 0 ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100) : 0;

  // KTP per village data
  const ktpByVillage = [...new Set(data.map(item => item.desa || "Lainnya"))].map(desa => {
    const villageData = data.filter(item => item.desa === desa);
    const withKTP = villageData.filter(item => item.foto_ktp && (String(item.foto_ktp).startsWith("data:image/") || String(item.foto_ktp).startsWith("http"))).length;
    return { name: desa, total: villageData.length, withKTP, percentage: Math.round((withKTP / (villageData.length || 1)) * 100) };
  }).sort((a, b) => b.total - a.total).slice(0, 5);

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
                      <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
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

export const FullAnalytics: React.FC<AnalyticsChartsProps> = ({ stats, totalCount, data = [] }) => {
  // Funnel Data
  const funnelData = [
    { name: "PENGAJUAN", value: stats?.statusCounts?.["PENGAJUAN"] || 0, fill: FUNNEL_COLORS[0] },
    { name: "SURVEI", value: stats?.statusCounts?.["SURVEY"] || 0, fill: FUNNEL_COLORS[1] },
    { name: "PROSES", value: stats?.statusCounts?.["PROSES"] || 0, fill: FUNNEL_COLORS[2] },
    { name: "AKTIF", value: stats?.statusCounts?.["AKTIF"] || 0, fill: FUNNEL_COLORS[3] }
  ];

  // Provider Distribution Data
  const providerData = stats?.providerData || [];

  // Month-over-Month comparison
  const getThisMonthData = () => {
    const now = new Date();
    return data.filter(item => {
      if (!item.timestamp) return false;
      const itemDate = new Date(item.timestamp.split(',')[0]);
      return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    }).length;
  };

  const getLastMonthData = () => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
    return data.filter(item => {
      if (!item.timestamp) return false;
      const itemDate = new Date(item.timestamp.split(',')[0]);
      return itemDate.getMonth() === lastMonth.getMonth() && itemDate.getFullYear() === lastMonth.getFullYear();
    }).length;
  };

  const thisMonthCount = getThisMonthData();
  const lastMonthCount = getLastMonthData();
  const momChange = lastMonthCount > 0 ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100) : 0;

  // KTP per village data
  const ktpByVillage = [...new Set(data.map(item => item.desa || "Lainnya"))].map(desa => {
    const villageData = data.filter(item => item.desa === desa);
    const withKTP = villageData.filter(item => item.foto_ktp && (String(item.foto_ktp).startsWith("data:image/") || String(item.foto_ktp).startsWith("http"))).length;
    return { name: desa, total: villageData.length, withKTP, percentage: Math.round((withKTP / (villageData.length || 1)) * 100) };
  }).sort((a, b) => b.total - a.total).slice(0, 5);

  // Custom Tooltip component for premium feel
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md p-3 border border-white/50 shadow-xl rounded-2xl">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label || payload[0].name}</p>
          <p className="text-lg font-black text-[#0d1655]">{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 w-full pb-8">
      {/* Pipeline Funnel + Provider + MoM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Funnel - Changed to actual Recharts FunnelChart */}
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-sm sm:text-base font-black text-[#0d1655] flex items-center gap-2">
              <Lucide.Filter size={18} className="text-[#F47920]" /> Pipeline Funnel
            </h3>
            <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase rounded-lg">Status</span>
          </div>
          <div className="p-4 sm:p-6 flex flex-col items-center justify-center">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Funnel
                    dataKey="value"
                    data={funnelData}
                    isAnimationActive
                  >
                    <LabelList position="right" fill="#0d1655" stroke="none" dataKey="name" fontSize={10} fontWeight={900} />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Provider Distribution - Changed to Interactive Donut Chart */}
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-sm sm:text-base font-black text-[#0d1655] flex items-center gap-2">
              <Lucide.Signal size={18} className="text-[#F47920]" /> Provider Saat Ini
            </h3>
            <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase rounded-lg">ISP</span>
          </div>
          <div className="p-4 sm:p-6">
            {providerData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[220px] text-slate-400">
                <Lucide.Wifi size={40} className="mb-3 opacity-30" />
                <p className="text-sm font-bold">Belum ada data provider</p>
              </div>
            ) : (
              <div className="h-[220px] w-full relative group">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={providerData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                      isAnimationActive
                    >
                      {providerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} className="hover:opacity-80 transition-opacity cursor-pointer" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </RePieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <Lucide.Wifi size={24} className="text-slate-300 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-2xl font-black text-[#0d1655]">{providerData.reduce((acc, curr) => acc + curr.value, 0)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Month-over-Month Comparison - Adding gradient area chart in background */}
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 relative">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 relative z-10">
            <h3 className="text-sm sm:text-base font-black text-[#0d1655] flex items-center gap-2">
              <Lucide.Calendar size={18} className="text-[#F47920]" /> Perbandingan Bulan
            </h3>
            <span className="px-2 py-1 bg-purple-50 text-purple-600 text-[9px] font-black uppercase rounded-lg">MoM</span>
          </div>
          
          {/* Background area chart */}
          <div className="absolute bottom-0 left-0 w-full h-[150px] opacity-20 pointer-events-none">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.trendData || []}>
                  <defs>
                    <linearGradient id="colorMom" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={momChange >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={momChange >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="count" stroke="none" fill="url(#colorMom)" />
                </AreaChart>
              </ResponsiveContainer>
          </div>

          <div className="p-4 sm:p-6 relative z-10">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 p-4 bg-white/60 backdrop-blur-md rounded-2xl text-center border border-slate-100 shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Bulan Ini</p>
                  <p className="text-3xl font-black text-[#0d1655]">{thisMonthCount}</p>
                  <p className="text-[9px] text-slate-400 font-bold">Registrasi</p>
                </div>
                <div className="flex-1 p-4 bg-white/60 backdrop-blur-md rounded-2xl text-center border border-slate-100 shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Bulan Lalu</p>
                  <p className="text-3xl font-black text-slate-500">{lastMonthCount}</p>
                  <p className="text-[9px] text-slate-400 font-bold">Registrasi</p>
                </div>
              </div>
              <div className={`p-5 rounded-2xl text-center border shadow-sm backdrop-blur-md bg-white/80 ${momChange >= 0 ? 'border-emerald-100' : 'border-red-100'}`}>
                <div className="flex items-center justify-center gap-2">
                  <div className={`p-2 rounded-full ${momChange >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {momChange >= 0 ? <Lucide.TrendingUp size={20} /> : <Lucide.TrendingDown size={20} />}
                  </div>
                  <span className={`text-3xl font-black ${momChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {momChange >= 0 ? '+' : ''}{momChange}%
                  </span>
                </div>
                <p className={`text-[10px] font-black uppercase tracking-widest mt-2 ${momChange >= 0 ? 'text-emerald-600/70' : 'text-red-600/70'}`}>
                  {momChange >= 0 ? 'Peningkatan' : 'Penurunan'} Pertumbuhan
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KTP Coverage per Village + Region + Source */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KTP Coverage per Village */}
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-sm sm:text-base font-black text-[#0d1655] flex items-center gap-2">
              <Lucide.IdCard size={18} className="text-[#F47920]" /> Cakupan KTP per Desa
            </h3>
            <span className="px-2 py-1 bg-orange-50 text-orange-600 text-[9px] font-black uppercase rounded-lg">KTP</span>
          </div>
          <div className="p-4 sm:p-6">
            {ktpByVillage.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[240px] text-slate-400">
                <Lucide.ImageOff size={40} className="mb-3 opacity-30" />
                <p className="text-sm font-bold">Belum ada data KTP</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ktpByVillage.map((village, idx) => (
                  <div key={village.name} className="flex items-center gap-4 group">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-sm ${village.percentage >= 50 ? 'bg-emerald-50 border-emerald-100' : village.percentage >= 25 ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'} border`}>
                      <Lucide.MapPin size={20} className={village.percentage >= 50 ? 'text-emerald-600' : village.percentage >= 25 ? 'text-amber-600' : 'text-red-600'} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-black text-slate-800 truncate">{village.name}</span>
                        <span className="text-xs font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">{village.withKTP}/{village.total}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${village.percentage >= 50 ? 'bg-emerald-500' : village.percentage >= 25 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${village.percentage}%` }} 
                        />
                      </div>
                      <p className={`text-[9px] font-black uppercase tracking-widest mt-1.5 ${village.percentage >= 50 ? 'text-emerald-600' : village.percentage >= 25 ? 'text-amber-600' : 'text-red-600'}`}>
                        {village.percentage}% data lengkap
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Region Coverage - Changed to Radar Chart */}
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-sm sm:text-base font-black text-[#0d1655] flex items-center gap-2">
              <Lucide.Globe size={18} className="text-[#F47920]" /> Jaringan Wilayah
            </h3>
            <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase rounded-lg">Radar</span>
          </div>
          <div className="p-4 sm:p-6">
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={stats?.regionalData || []}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#0d1655', fontSize: 9, fontWeight: 900 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                  <Radar name="Pelanggan" dataKey="value" stroke="#F47920" strokeWidth={2} fill="#F47920" fillOpacity={0.5} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Source of Information */}
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-sm sm:text-base font-black text-[#0d1655] flex items-center gap-2">
              <Lucide.Search size={18} className="text-[#F47920]" /> Sumber Informasi
            </h3>
            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[9px] font-black uppercase rounded-lg">Media</span>
          </div>
          <div className="p-4 sm:p-6">
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={stats?.sourceData || []} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 900 }} width={85} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                    {(stats?.sourceData || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
                    ))}
                  </Bar>
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
