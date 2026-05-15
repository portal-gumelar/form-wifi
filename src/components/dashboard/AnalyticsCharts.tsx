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

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ stats, totalCount }) => {
  const activeCount = stats?.statusCounts["AKTIF"] || 0;
  const conversionRate = Math.round((activeCount / (totalCount || 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Insight Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="kolabo-card p-6 bg-gradient-to-br from-[#10b981] to-[#059669] text-white">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/20 rounded-2xl"><Lucide.Banknote size={24} /></div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-1 rounded-lg">Estimated MRR</span>
          </div>
          <p className="text-sm font-bold opacity-80">Revenue Projection</p>
          <h2 className="text-3xl font-black mt-1">Rp {(stats?.revenueProjection || 0).toLocaleString('id-ID')}</h2>
          <p className="text-[10px] mt-4 font-bold uppercase tracking-tighter opacity-60">*Based on active customer plans</p>
        </div>

        <div className="kolabo-card p-6 border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl"><Lucide.TrendingUp size={24} /></div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-500 px-2 py-1 rounded-lg">Conversion</span>
          </div>
          <p className="text-sm font-bold text-slate-400">Sales Velocity</p>
          <h2 className="text-3xl font-black text-[#1b2559] mt-1">{conversionRate}%</h2>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-blue-500 h-full" style={{ width: `${conversionRate}%` }}></div>
          </div>
        </div>

        <div className="kolabo-card p-6 border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl"><Lucide.MapPin size={24} /></div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-500 px-2 py-1 rounded-lg">Hot Zone</span>
          </div>
          <p className="text-sm font-bold text-slate-400">Top Performing Region</p>
          <h2 className="text-3xl font-black text-[#1b2559] mt-1">{stats?.regionalData[0]?.name || "N/A"}</h2>
          <p className="text-[10px] mt-4 font-bold text-slate-400 uppercase tracking-tighter">{stats?.regionalData[0]?.value || 0} active registrations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 kolabo-card overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#1b2559] flex items-center gap-2">
              <Lucide.Activity size={20} className="text-[#10b981]" /> Growth Trend
            </h3>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-[#10b981] text-white text-[11px] font-bold rounded-lg shadow-md shadow-emerald-500/20">7 Days</button>
            </div>
          </div>
          <div className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.trendData || []}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', background: '#fff' }}
                    itemStyle={{ fontWeight: 700, fontSize: '12px', color: '#1b2559' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="kolabo-card overflow-hidden">
          <div className="p-6 border-b border-slate-50">
            <h3 className="text-lg font-bold text-[#1b2559] flex items-center gap-2">
              <Lucide.PieChart size={20} className="text-[#10b981]" /> Market Share
            </h3>
          </div>
          <div className="p-6">
            <div className="h-[200px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={stats?.packageData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {(stats?.packageData || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-[#1b2559]">{totalCount}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {(stats?.packageData || []).slice(0, 3).map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-xs font-bold text-[#1b2559]">{entry.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400">{Math.round((entry.value / (totalCount || 1)) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Suggestion Section */}
      <div className="kolabo-card p-8 bg-slate-50 border-none">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#10b981] shadow-sm"><Lucide.Zap size={24} /></div>
          <div>
            <h3 className="text-lg font-black text-[#1b2559]">Saran Strategi Bisnis</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Business Insights & Optimization</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 group hover:border-[#10b981] transition-all">
            <h4 className="font-black text-sm text-[#1b2559] flex items-center gap-2 mb-2">
              <Lucide.Users size={16} className="text-blue-500" /> Optimasi Konversi
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Tingkatkan follow-up pada status <b>Survey</b> ({stats?.statusCounts["SURVEY"] || 0} orang). Konversi saat ini ({conversionRate}%) bisa ditingkatkan dengan promo aktivasi gratis di minggu pertama.
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 group hover:border-[#10b981] transition-all">
            <h4 className="font-black text-sm text-[#1b2559] flex items-center gap-2 mb-2">
              <Lucide.Target size={16} className="text-[#10b981]" /> Ekspansi Wilayah
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Wilayah <b>{stats?.regionalData[0]?.name || "N/A"}</b> menunjukkan minat tertinggi. Disarankan menambah tim teknisi di area ini untuk mempercepat proses pemasangan yang sedang mengantre.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FullAnalytics: React.FC<AnalyticsChartsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-2 md:px-0">
      <div className="kolabo-card overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-xl font-black text-[#1b2559] flex items-center gap-2">
            <Lucide.Globe size={22} className="text-[#10b981]" /> Top Regional Coverage
          </h3>
          <button className="px-3 py-1.5 bg-slate-50 text-slate-400 text-[11px] font-bold rounded-lg border border-slate-100">Regional</button>
        </div>
        <div className="p-8">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={stats?.regionalData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.08)'}} />
                <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} barSize={40} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="kolabo-card overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-xl font-black text-[#1b2559] flex items-center gap-2">
            <Lucide.Search size={22} className="text-[#10b981]" /> Discovery Sources
          </h3>
          <button className="px-3 py-1.5 bg-slate-50 text-slate-400 text-[11px] font-bold rounded-lg border border-slate-100">Sources</button>
        </div>
        <div className="p-8">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={stats?.sourceData || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} width={80} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.08)'}} />
                <Bar dataKey="value" fill="#0ea5e9" radius={[0, 8, 8, 0]} barSize={30} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
