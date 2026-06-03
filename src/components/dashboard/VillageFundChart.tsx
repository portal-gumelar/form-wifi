import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";
import { RegistrationData, VillageFundSummary } from "../../types";

interface VillageFundChartProps {
  data: RegistrationData[];
  isDarkMode: boolean;
}

// Format currency
const formatRupiah = (num: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

// Dana per customer constant
const DANA_PER_CUSTOMER = 2000;

export const VillageFundChart: React.FC<VillageFundChartProps> = ({ data, isDarkMode }) => {
  const [selectedVillageId, setSelectedVillageId] = useState<string | null>(null);
  const [filterRw, setFilterRw] = useState<string>("");

  // Calculate village fund from actual customer data - AUTO GENERATE VILLAGES
  const villageFunds = useMemo(() => {
    const fundMap = new Map<string, { count: number; rws: Map<string, { rt: Set<string>; customers: string[] }> }>();
    
    // Filter data dengan status AKTIF saja untuk Dana Desa
    const activeData = data.filter(item => String(item.status || "").toUpperCase() === "AKTIF");
    
    activeData.forEach(item => {
      // Safeguard: pastikan item ada
      if (!item) return;
      
      const desa = String(item.desa || "GUMELAR").toUpperCase();
      const rw = String(item.rw || "RW 00");
      const rt = String(item.rt || "RT 00");
      
      if (!fundMap.has(desa)) {
        fundMap.set(desa, { count: 0, rws: new Map() });
      }
      const villageData = fundMap.get(desa)!;
      villageData.count++;
      
      if (!villageData.rws.has(rw)) {
        villageData.rws.set(rw, { rt: new Set(), customers: [] });
      }
      villageData.rws.get(rw)!.rt.add(rt);
      villageData.rws.get(rw)!.customers.push(String(item.nama_lengkap || ""));
    });
    
    return fundMap;
  }, [data]);

  // Auto-generate villages list from customer data
  const villages = useMemo(() => {
    const villageList: { id: string; name: string; customerCount: number; fundAmount: number; createdAt: string }[] = [];
    
    villageFunds.forEach((fundData, name) => {
      if (fundData.count > 0) { // Only show villages with customers
        villageList.push({
          id: name,
          name: name,
          customerCount: fundData.count,
          fundAmount: fundData.count * DANA_PER_CUSTOMER,
          createdAt: new Date().toISOString()
        });
      }
    });
    
    // Sort by name
    return villageList.sort((a, b) => a.name.localeCompare(b.name));
  }, [villageFunds]);

  // Get detailed breakdown per RT
  const villageRTDetails = useMemo(() => {
    const rtMap = new Map<string, Map<string, Map<string, { count: number; names: string[] }>>>();
    
    const activeData = data.filter(item => String(item.status || "").toUpperCase() === "AKTIF");
    
    activeData.forEach(item => {
      if (!item) return;
      const desa = String(item.desa || "GUMELAR").toUpperCase();
      const rw = String(item.rw || "RW 00");
      const rt = String(item.rt || "RT 00");
      
      if (!rtMap.has(desa)) {
        rtMap.set(desa, new Map());
      }
      const desaMap = rtMap.get(desa)!;
      
      if (!desaMap.has(rw)) {
        desaMap.set(rw, new Map());
      }
      const rwMap = desaMap.get(rw)!;
      
      if (!rwMap.has(rt)) {
        rwMap.set(rt, { count: 0, names: [] });
      }
      const rtData = rwMap.get(rt)!;
      rtData.count++;
      rtData.names.push(String(item.nama_lengkap || ""));
    });
    
    return rtMap;
  }, [data]);

  // Summary calculation
  const summary: VillageFundSummary = useMemo(() => {
    let totalCustomers = 0;
    let totalVillageFund = 0;
    let totalRwRtFund = 0;
    
    villageFunds.forEach((villageData, villageName) => {
      totalCustomers += villageData.count;
      // Each customer contributes to village fund (Dana Desa)
      // = Total semua pelanggan × Rp 2.000
      totalVillageFund += villageData.count * DANA_PER_CUSTOMER;
      
      // Dana RT/RW = Setiap pelanggan × Rp 2.000 (per RT)
      // Jadi total Dana RT/RW = Total semua pelanggan × Rp 2.000
      totalRwRtFund += villageData.count * DANA_PER_CUSTOMER;
    });
    
    return {
      totalCustomers,
      totalVillageFund,
      totalRwRtFund,
      grandTotal: totalVillageFund + totalRwRtFund
    };
  }, [villageFunds]);

  // Count RW and RT per village
  const villageRwRtCount = useMemo(() => {
    const counts = new Map<string, { rwCount: number; rtCount: number; rwList: string[]; rtByRw: Map<string, string[]> }>();
    
    villageFunds.forEach((villageData, desa) => {
      const rwList = Array.from(villageData.rws.keys()).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      const rtByRw = new Map<string, string[]>();
      
      villageData.rws.forEach((rwData, rw) => {
        rtByRw.set(rw, Array.from(rwData.rt).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })));
      });
      
      counts.set(desa, {
        rwCount: rwList.length,
        rtCount: Array.from(villageData.rws.values()).reduce((sum, rw) => sum + rw.rt.size, 0),
        rwList,
        rtByRw
      });
    });
    
    return counts;
  }, [villageFunds]);

  // Filtered RW list for selected village
  const filteredRwList = useMemo(() => {
    if (!selectedVillageId) return [];
    const fundData = villageFunds.get(selectedVillageId);
    if (!fundData) return [];
    
    const rwList = Array.from(fundData.rws.keys()).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    if (filterRw) {
      return rwList.filter(rw => rw.toLowerCase().includes(filterRw.toLowerCase()));
    }
    return rwList;
  }, [villageFunds, selectedVillageId, filterRw]);

  // Export to Excel
  const exportToExcel = (villageName?: string) => {
    let exportData: { desa: string; rw: string; rt: string; pelanggan: string; dana: number }[] = [];
    
    villageRTDetails.forEach((rwMap, desa) => {
      if (villageName && desa !== villageName) return;
      
      rwMap.forEach((rtMap, rw) => {
        if (filterRw && !rw.toLowerCase().includes(filterRw.toLowerCase())) return;
        
        rtMap.forEach((rtData, rt) => {
          exportData.push({
            desa,
            rw,
            rt,
            pelanggan: rtData.names.join(", "),
            dana: rtData.count * DANA_PER_CUSTOMER
          });
        });
      });
    });
    
    // Sort exportData alphanumerically
    exportData.sort((a, b) => {
      if (a.desa !== b.desa) return a.desa.localeCompare(b.desa);
      if (a.rw !== b.rw) return a.rw.localeCompare(b.rw, undefined, { numeric: true });
      return a.rt.localeCompare(b.rt, undefined, { numeric: true });
    });
    
    // Create CSV content
    const headers = ["desa", "rw", "rt", "Nama Pelanggan", "Jumlah Pelanggan", "Dana (Rp)"];
    
    // Download
    const csvContent = [
      headers.join(","),
      ...exportData.map(item => {
        const rtData = villageRTDetails.get(item.desa)?.get(item.rw)?.get(item.rt);
        const count = rtData?.count || 0;
        return `"${item.desa}","${item.rw}","${item.rt}","${item.pelanggan}",${count},${item.dana}`;
      })
    ].join("\n");
    
    // Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Dana_Desa_${villageName || "Semua"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#0d1655] to-[#1a2a7a] rounded-2xl p-5 text-white shadow-lg"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Lucide.Users size={20} className="text-[#FDB913]" />
            </div>
            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Total Pelanggan</p>
          </div>
          <p className="text-2xl font-black">{summary.totalCustomers}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Lucide.Home size={20} className="text-white" />
            </div>
            <p className="text-[10px] font-black text-white/80 uppercase tracking-widest">Dana Desa</p>
          </div>
          <p className="text-xl font-black">{formatRupiah(summary.totalVillageFund)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Lucide.Map size={20} className="text-white" />
            </div>
            <p className="text-[10px] font-black text-white/80 uppercase tracking-widest">Dana RT/RW</p>
          </div>
          <p className="text-xl font-black">{formatRupiah(summary.totalRwRtFund)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-br from-[#F47920] to-orange-600 rounded-2xl p-5 text-white shadow-lg"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Lucide.Wallet size={20} className="text-white" />
            </div>
            <p className="text-[10px] font-black text-white/80 uppercase tracking-widest">Total Dana</p>
          </div>
          <p className="text-xl font-black">{formatRupiah(summary.grandTotal)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Lucide.FileSpreadsheet size={20} className="text-white" />
            </div>
            <p className="text-[10px] font-black text-white/80 uppercase tracking-widest">Export Data</p>
          </div>
          <button
            onClick={() => exportToExcel()}
            className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-black transition-all"
          >
            Download CSV
          </button>
        </motion.div>
      </div>

      {/* Dana Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Lucide.Info size={24} className="text-amber-600" />
        </div>
        <div>
          <p className="font-black text-amber-800 text-sm">📌 Informasi Sistem Dana Desa CSR</p>
          <p className="text-xs text-amber-700 mt-1">
            Setiap <span className="font-bold">1 pelanggan aktif</span> menyumbang <span className="font-bold">Rp 2.000</span> ke kas desa.
          </p>
          <p className="text-[10px] text-amber-600 mt-1">
            💡 Dana RT = (Pelanggan per RT × 2.000) • Dana Desa = (Total Pelanggan × 2.000) • Desa otomatis muncul saat ada pelanggan
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Village List - AUTO GENERATED */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-[#0d1655] p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Lucide.MapPin size={20} className="text-[#FDB913]" />
              </div>
              <div>
                <h3 className="font-black">Daftar Desa</h3>
                <p className="text-[10px] text-white/60">{villages.length} Desa dengan pelanggan aktif</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
            <AnimatePresence mode="popLayout">
            {villages.map((village) => {
              const fundData = villageFunds.get(village.name);
              const customerCount = fundData?.count || 0;
              const fundAmount = customerCount * DANA_PER_CUSTOMER;
              const rwRtInfo = villageRwRtCount.get(village.name);
              
              return (
                <motion.div
                  layout
                  key={village.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedVillageId === village.id 
                      ? 'border-[#0d1655] bg-[#0d1655]/5' 
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                  onClick={() => setSelectedVillageId(village.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <Lucide.Home size={24} className="text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800">{village.name}</h4>
                        <p className="text-xs text-slate-500">
                          {rwRtInfo?.rwCount || 0} RW • {rwRtInfo?.rtCount || 0} RT • {customerCount} Pelanggan
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-emerald-600">{formatRupiah(fundAmount)}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            </AnimatePresence>
            
            {villages.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <Lucide.MapPin size={48} className="mx-auto mb-3 opacity-30" />
                <p className="font-bold">Belum ada pelanggan aktif</p>
                <p className="text-xs">Desa akan muncul otomatis saat ada pelanggan</p>
              </div>
            )}
          </div>
        </div>

        {/* RW Detail */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-[#0d1655] p-4 text-white flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Lucide.Map size={20} className="text-[#FDB913]" />
                </div>
                <div>
                  <h3 className="font-black">
                    {selectedVillageId ? `RW di ${selectedVillageId}` : "Detail RW"}
                  </h3>
                  <p className="text-[10px] text-white/60">
                    {selectedVillageId ? `${villageRwRtCount.get(selectedVillageId)?.rwCount || 0} RW • ${villageRwRtCount.get(selectedVillageId)?.rtCount || 0} RT` : "Pilih desa"}
                  </p>
                </div>
              </div>
              {selectedVillageId && (
                <button
                  onClick={() => exportToExcel(selectedVillageId)}
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-xs font-black transition-all"
                >
                  <Lucide.FileSpreadsheet size={16} /> Export
                </button>
              )}
            </div>
            
            {/* Filter RW */}
            {selectedVillageId && (
              <div className="flex items-center gap-2">
                <Lucide.Search size={14} className="text-white/60" />
                <input
                  type="text"
                  value={filterRw}
                  onChange={(e) => setFilterRw(e.target.value)}
                  placeholder="Filter RW..."
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs font-bold text-white placeholder-white/50 outline-none focus:border-white/40"
                />
                {filterRw && (
                  <button
                    onClick={() => setFilterRw("")}
                    className="px-2 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs text-white/60 transition-all"
                  >
                    <Lucide.X size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
          
          <div className="p-4 max-h-[500px] overflow-y-auto">
            {selectedVillageId ? (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                {filteredRwList.map((rw, rwIndex) => {
                  const rwData = villageFunds.get(selectedVillageId)?.rws.get(rw);
                  const rtList = Array.from(rwData?.rt || []).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
                  const customerCount = rwData?.customers?.length || 0;
                  
                  return (
                    <motion.div
                      layout
                      key={rw}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: rwIndex * 0.05 }}
                      className="p-4 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <span className="font-black text-blue-600">{rw.split(' ')[1] || rw}</span>
                          </div>
                          <div>
                            <p className="font-black text-slate-800">{rw}</p>
                            <p className="text-xs text-slate-500">{rtList.length} RT • {customerCount} Pelanggan</p>
                          </div>
                        </div>
                        <p className="font-black text-emerald-600">{formatRupiah(customerCount * DANA_PER_CUSTOMER)}</p>
                      </div>
                      
                      {/* RT Breakdown */}
                      <div className="pl-13 space-y-2">
                        {rtList.map((rt) => {
                          const rtData = villageRTDetails.get(selectedVillageId)?.get(rw)?.get(rt);
                          const rtCustomerCount = rtData?.count || 0;
                          
                          return (
                            <div key={rt} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center">
                                  <span className="text-[10px] font-black text-slate-600">{rt.split(' ')[1] || rt}</span>
                                </div>
                                <div>
                                  <p className="font-bold text-sm text-slate-700">{rt}</p>
                                  <p className="text-[10px] text-slate-400">{rtCustomerCount} pelanggan</p>
                                </div>
                              </div>
                              <p className="font-black text-blue-600 text-sm">{formatRupiah(rtCustomerCount * DANA_PER_CUSTOMER)}</p>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
                </AnimatePresence>
                
                {filteredRwList.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <Lucide.Map size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="font-bold">Tidak ada RW</p>
                    <p className="text-xs">Pelanggan di desa ini belum memiliki data RW</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Lucide.MapPin size={64} className="mx-auto mb-4 opacity-20" />
                <p className="font-bold text-slate-500">Pilih desa di sebelah kiri</p>
                <p className="text-xs text-slate-400 mt-1">untuk melihat detail RW/RT</p>
              </div>
            )}
          </div>
        </div>

        {/* Customer List per RT/RW */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-[#0d1655] p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Lucide.List size={20} className="text-[#FDB913]" />
              </div>
              <div>
                <h3 className="font-black">Daftar Pelanggan per RT</h3>
                <p className="text-[10px] text-white/60">Nama pelanggan per RT/RW</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 max-h-[500px] overflow-y-auto">
            {selectedVillageId ? (
              <div className="space-y-4">
                {filteredRwList.map((rw) => {
                  const rwData = villageFunds.get(selectedVillageId)?.rws.get(rw);
                  const rtList = Array.from(rwData?.rt || []).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
                  
                  return (
                    <div key={rw}>
                      <div className="flex items-center gap-2 mb-2">
                        <Lucide.Map size={14} className="text-blue-500" />
                        <p className="font-black text-sm text-blue-600">{rw}</p>
                      </div>
                      
                      {rtList.map((rt) => {
                        const rtData = villageRTDetails.get(selectedVillageId)?.get(rw)?.get(rt);
                        const names = rtData?.names || [];
                        
                        return (
                          <div key={rt} className="ml-6 mb-3 p-3 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                              <Lucide.Hash size={12} className="text-slate-400" />
                              <p className="font-bold text-xs text-slate-600">{rt}</p>
                              <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                                {names.length}
                              </span>
                            </div>
                            <div className="space-y-1">
                              {names.length > 0 ? (
                                names.map((name, i) => (
                                  <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                                    <p className="font-medium">{name}</p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-[10px] text-slate-400 italic">Belum ada pelanggan</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Lucide.Users size={48} className="mx-auto mb-3 opacity-20" />
                <p className="font-bold text-slate-500">Pilih desa untuk melihat</p>
                <p className="text-xs text-slate-400 mt-1">daftar pelanggan per RT</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="bg-[#0d1655] p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Lucide.PieChart size={20} className="text-[#FDB913]" />
            </div>
            <div>
              <h3 className="font-black">Ringkasan Dana per Desa</h3>
              <p className="text-[10px] text-white/60">Total dana dari pelanggan aktif</p>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {villages.map((village, index) => {
              const fundData = villageFunds.get(village.name);
              const rwCount = fundData?.rws.size || 0;
              const rtCount = Array.from(fundData?.rws.values() || []).reduce((sum, rw) => sum + rw.rt.size, 0);
              const customerCount = fundData?.count || 0;
              const colors = ["bg-emerald-500", "bg-blue-500", "bg-purple-500", "bg-amber-500", "bg-pink-500", "bg-cyan-500", "bg-red-500", "bg-indigo-500"];
              const color = colors[index % colors.length];
              
              return (
                <motion.div
                  key={village.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`${color} rounded-2xl p-4 text-white`}
                >
                  <p className="text-xs font-bold opacity-80 mb-2">{village.name}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] opacity-70">Pelanggan</p>
                      <p className="text-lg font-black">{customerCount}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] opacity-70">Dana</p>
                      <p className="text-sm font-black">{formatRupiah(customerCount * DANA_PER_CUSTOMER)}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            
            {villages.length === 0 && (
              <div className="col-span-full text-center py-8 text-slate-400">
                <Lucide.PieChart size={48} className="mx-auto mb-3 opacity-30" />
                <p className="font-bold">Belum ada data</p>
                <p className="text-xs">Dana akan muncul otomatis setelah ada pelanggan aktif</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
