import React from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell, BarChart as ReBarChart, Bar
} from 'recharts';
import { DashboardStats } from "../../types";

interface AnalyticsChartsProps {
  stats: DashboardStats | null;
  isDarkMode: boolean;
  totalCount: number;
}

const COLORS = ['#1a2d8f', '#F47920', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ stats, isDarkMode, totalCount }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className={`lg:col-span-2 p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black italic tracking-tight">Registration Trends</h3>
            <p className="text-xs font-bold text-slate-400">Activity monitor for the last 7 sessions</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-[#1a2d8f] text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-blue-500/20">Weekly</button>
            <button className="px-4 py-2 text-slate-400 text-[10px] font-black uppercase rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Monthly</button>
          </div>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats?.trendData || []}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a2d8f" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#1a2d8f" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: isDarkMode ? '#64748b' : '#94a3b8'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: isDarkMode ? '#64748b' : '#94a3b8'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', background: isDarkMode ? '#1e293b' : '#fff' }}
                itemStyle={{ fontWeight: 'black', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="count" stroke="#1a2d8f" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
        <h3 className="text-xl font-black italic tracking-tight mb-8">Package Segment</h3>
        <div className="h-[300px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <Pie
                data={stats?.packageData || []}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {(stats?.packageData || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RePieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-black">{totalCount}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
          </div>
        </div>
        <div className="mt-8 space-y-3">
          {(stats?.packageData || []).slice(0, 4).map((entry, index) => (
            <div key={entry.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-xs font-bold text-slate-500">{entry.name}</span>
              </div>
              <span className="text-xs font-black">{Math.round((entry.value / (totalCount || 1)) * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const FullAnalytics: React.FC<AnalyticsChartsProps> = ({ stats, isDarkMode }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
        <h3 className="text-xl font-black italic tracking-tight mb-8">Provider Migration</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ReBarChart data={stats?.providerData || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
              <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 'bold'}} />
              <YAxis tick={{fontSize: 10, fontWeight: 'bold'}} />
              <Tooltip contentStyle={{ borderRadius: '16px', background: isDarkMode ? '#1e293b' : '#fff' }} />
              <Bar dataKey="value" fill="#F47920" radius={[8, 8, 0, 0]} />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
        <h3 className="text-xl font-black italic tracking-tight mb-8">Discovery Sources</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ReBarChart data={stats?.sourceData || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" tick={{fontSize: 10, fontWeight: 'bold'}} width={100} />
              <Tooltip contentStyle={{ borderRadius: '16px', background: isDarkMode ? '#1e293b' : '#fff' }} />
              <Bar dataKey="value" fill="#1a2d8f" radius={[0, 8, 8, 0]} />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
