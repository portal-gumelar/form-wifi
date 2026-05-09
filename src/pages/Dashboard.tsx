import React, { useState, useEffect } from "react";
import { 
  Users, Package, MapPin, Search, LogOut, RefreshCw, ExternalLink, X 
} from "lucide-react";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.672 1.433 5.661 1.434h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export default function Dashboard({ googleScriptUrl, onLogout, onNavigateToForm }: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReg, setSelectedReg] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(googleScriptUrl);
      const json = await response.json();
      if (Array.isArray(json)) {
        setData(json);
        setError("");
      } else {
        throw new Error("Format data tidak valid");
      }
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data. Periksa URL Apps Script Anda.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredData = (data || []).filter(item => {
    if (!item) return false;
    const s = searchTerm.toLowerCase();
    const nama = (item["Nama Lengkap"] || "").toLowerCase();
    const hp = (item["No HP / WA"] || "");
    const alamat = (item["Alamat Pemasangan"] || "").toLowerCase();
    return nama.includes(s) || hp.includes(s) || alamat.includes(s);
  }).reverse();

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <RefreshCw className="w-12 h-12 text-[#1a2d8f] animate-spin mb-4" />
      <h2 className="text-xl font-black text-[#1a2d8f]">MEMUAT DATABASE...</h2>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="bg-white border-b px-6 py-4 sticky top-0 z-40 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1a2d8f] rounded-xl flex items-center justify-center text-white font-black">AM</div>
          <h1 className="font-black text-[#1a2d8f] hidden sm:block">DASHBOARD ADMIN</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className={`p-2 hover:bg-slate-100 rounded-lg transition-colors ${refreshing && "animate-spin text-[#1a2d8f]"}`}>
            <RefreshCw size={20} />
          </button>
          <button onClick={onLogout} className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-black hover:bg-red-100 transition-colors">
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pendaftar</p>
            <h3 className="text-4xl font-black text-[#1a2d8f]">{data.length}</h3>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 sm:col-span-2">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Cari nama, No HP, atau alamat..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl outline-none focus:ring-2 ring-[#1a2d8f]/10 font-bold text-sm" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl font-bold text-sm border border-red-100">
            ⚠️ {error}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pelanggan</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paket</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Jadwal Pasang</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredData.length > 0 ? filteredData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/30 transition-all group">
                    <td className="px-6 py-5">
                      <div className="font-black text-slate-900 group-hover:text-[#1a2d8f] transition-colors">{item["Nama Lengkap"] || "-"}</div>
                      <div className="text-xs text-slate-400 font-bold">{item["No HP / WA"] || "-"}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-black text-[#1a2d8f]">{item.Paket?.split("(")[0] || "-"}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{item["Provider Saat Ini"] || "-"}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-slate-700">{item["Tanggal Rencana Pasang"] || "-"}</div>
                      <div className="text-[10px] text-slate-400 font-bold">{item["Waktu Survei"] || "-"}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-2">
                        <a 
                          href={`https://wa.me/${(item["No HP / WA"] || "").replace(/\D/g, "")}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-[#25D366] hover:text-white transition-all shadow-sm"
                        >
                          <WhatsAppIcon className="w-5 h-5" />
                        </a>
                        <button 
                          onClick={() => setSelectedReg(item)} 
                          className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-[#1a2d8f] hover:text-white transition-all shadow-sm"
                        >
                          <ExternalLink size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-slate-400 font-bold">
                      {loading ? "Sedang memuat data..." : "Tidak ada data pendaftar yang ditemukan."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d1655]/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-[#1a2d8f] p-8 text-white relative">
              <button onClick={() => setSelectedReg(null)} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
              <h2 className="text-2xl font-black mb-1">Detail Pendaftar</h2>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest">{selectedReg.Timestamp || "Tanpa Tanggal"}</p>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Alamat Pemasangan</p>
                  <p className="font-bold text-slate-800 leading-relaxed">{selectedReg["Alamat Pemasangan"] || "-"}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sumber Info</p>
                  <p className="font-bold text-slate-800">{selectedReg["Sumber Info"] || "-"}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Prioritas / Alasan</p>
                  <p className="font-bold text-slate-800">{selectedReg["Prioritas"] || "-"}</p>
                </div>
                {selectedReg["Link Google Maps"] && (
                  <a 
                    href={selectedReg["Link Google Maps"]} 
                    target="_blank" 
                    rel="noreferrer"
                    className="col-span-2 flex items-center justify-center gap-3 bg-blue-600 hover:bg-[#1a2d8f] text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-200 transition-all active:scale-95"
                  >
                    <MapPin size={20} /> LIHAT LOKASI DI GOOGLE MAPS
                  </a>
                )}
              </div>
              <button 
                onClick={() => setSelectedReg(null)} 
                className="w-full py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all"
              >
                TUTUP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
