import { useState, useEffect } from "react";
import { 
  Users, 
  Package, 
  Calendar, 
  MapPin, 
  Search, 
  LogOut, 
  TrendingUp,
  FileDown,
  Filter,
  CheckCircle2,
  RefreshCw,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  MoreVertical,
  Trash2,
  Plus,
  X
} from "lucide-react";
import { cn } from "./utils/cn";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={className}
      fill="currentColor"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.672 1.433 5.661 1.434h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

interface Registration {
  Timestamp: string;
  "Provider Saat Ini": string;
  "Nama Lengkap": string;
  "Alamat Pemasangan": string;
  "No HP / WA": string;
  Paket: string;
  "Tanggal Rencana Pasang": string;
  "Bisa Google Maps": string;
  "Link Google Maps": string;
  "Waktu Survei": string;
  Prioritas: string;
  "Sumber Info": string;
}

interface DashboardProps {
  googleScriptUrl: string;
  onLogout: () => void;
  onNavigateToForm: () => void;
}

export default function Dashboard({ googleScriptUrl, onLogout, onNavigateToForm }: DashboardProps) {
  const [data, setData] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("All");
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [regToDelete, setRegToDelete] = useState<Registration | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (data.length > 0) setRefreshing(true);
    else setLoading(true);
    
    try {
      const response = await fetch(googleScriptUrl);
      if (!response.ok) throw new Error("Failed to fetch data");
      const jsonData = await response.json();
      setData(jsonData);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data pendaftar.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const confirmDelete = async () => {
    if (!regToDelete) return;
    
    setRefreshing(true);
    const timestamp = regToDelete.Timestamp;
    setRegToDelete(null); // Close modal immediately for better UX
    
    const formData = new FormData();
    formData.append("action", "delete");
    formData.append("timestamp", timestamp);

    try {
      await fetch(googleScriptUrl, {
        method: "POST",
        body: formData,
        mode: "no-cors",
      });
      
      // Karena no-cors, kita tidak bisa baca response, jadi kita assume success dan fetch ulang
      // Hapus data secara lokal dulu agar UI terasa cepat
      setData(prev => prev.filter(item => item.Timestamp !== timestamp));
      if (selectedReg?.Timestamp === timestamp) setSelectedReg(null);
      
      // Tunggu sebentar lalu fetch ulang dari server untuk sinkronisasi
      setTimeout(() => {
        fetchData();
      }, 2000);
      
    } catch (err) {
      console.error("Delete error:", err);
      alert("Gagal menghapus data. Periksa koneksi Anda.");
      setRefreshing(false);
    }
  };

  const formatWhatsApp = (phone: string) => {
    if (!phone) return "#";
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.slice(1);
    } else if (cleaned.startsWith("8")) {
      cleaned = "62" + cleaned;
    }
    return `https://wa.me/${cleaned}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const exportToPDF = async () => {
    try {
      setRefreshing(true);
      // Menggunakan format Landscape agar muat banyak kolom
      const doc = new jsPDF("landscape") as any;
      
      // Load logo image
      const logoUrl = "https://ik.imagekit.io/Gumelar/LogO/logo%20pt.png";
      let base64Logo = null;
      try {
        const response = await fetch(logoUrl);
        const blob = await response.blob();
        base64Logo = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      } catch (imgErr) {
        console.error("Gagal meload gambar logo untuk PDF:", imgErr);
      }

      // Add branding and logo
      if (base64Logo) {
        doc.addImage(base64Logo, "PNG", 14, 10, 40, 15);
        doc.setFontSize(22);
        doc.setTextColor(26, 45, 143);
        doc.text("Laporan Pendaftaran Lengkap", 60, 20);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 60, 26);
      } else {
        doc.setFontSize(22);
        doc.setTextColor(26, 45, 143);
        doc.text("Laporan Pendaftaran Armedia_Net", 14, 22);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 14, 30);
      }
      
      doc.text(`Total Pendaftar: ${filteredData.length}`, 14, 38);

      const tableData = filteredData.map((item, index) => [
        index + 1,
        item.Timestamp?.split(",")[0], // Tgl Daftar
        item["Nama Lengkap"],
        item["No HP / WA"],
        item.Paket?.split("(")[0].trim(),
        `${formatDate(item["Tanggal Rencana Pasang"])}\n(${item["Waktu Survei"] || "-"})`, // Rencana Pasang & Survei
        item["Alamat Pemasangan"],
        item["Provider Saat Ini"] || "-",
        item.Prioritas || "-",
        item["Sumber Info"] || "-"
      ]);

      autoTable(doc, {
        startY: 45,
        head: [["No", "Tgl Daftar", "Nama", "No HP / WA", "Paket", "Jadwal (Survei)", "Alamat Pemasangan", "Provider Lama", "Prioritas", "Sumber Info"]],
        body: tableData,
        headStyles: { fillStyle: [26, 45, 143], fontSize: 8 },
        styles: { fontSize: 7, cellPadding: 2, valign: 'middle' },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 18 },
          2: { cellWidth: 30 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 25 },
          6: { cellWidth: 'auto' }, // Alamat fleksibel
          7: { cellWidth: 20 },
          8: { cellWidth: 20 },
          9: { cellWidth: 20 },
        }
      });

      // Show preview instead of direct download
      const blobUrl = doc.output("bloburl");

      setPdfDoc(doc);
      setPdfPreviewUrl(blobUrl);

    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Gagal membuat PDF. Silakan coba lagi.");
    } finally {
      setRefreshing(false);
    }
  };

  const filteredData = data.filter(item => {
    const matchesSearch = 
      item["Nama Lengkap"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item["Alamat Pemasangan"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item["No HP / WA"]?.includes(searchTerm);
    
    const matchesPackage = selectedPackage === "All" || item.Paket?.includes(selectedPackage);
    
    return matchesSearch && matchesPackage;
  }).reverse();

  const stats = {
    total: data.length,
    today: data.filter(item => {
      const dateStr = item.Timestamp?.split(",")[0];
      const todayStr = new Date().toLocaleDateString("id-ID");
      return dateStr === todayStr;
    }).length,
    popularPackage: data.length > 0 ? 
      Object.entries(data.reduce((acc: any, curr) => {
        const pkgName = curr.Paket?.split("(")[0].trim();
        if (pkgName) acc[pkgName] = (acc[pkgName] || 0) + 1;
        return acc;
      }, {})).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "-" : "-",
    topSource: data.length > 0 ? 
      Object.entries(data.reduce((acc: any, curr) => {
        const source = curr["Sumber Info"]?.trim();
        if (source) acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {})).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "-" : "-",
  };

  const packages = ["All", "GUYUB_1", "GUYUB_2", "GUYUB_3", "GUYUB_4", "GUYUB_5"];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#1a2d8f]/10 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#1a2d8f] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-[#1a2d8f]">Memuat Dashboard...</h2>
            <p className="text-slate-500 text-sm mt-1 animate-pulse">Menghubungkan ke database Artha Media</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans text-slate-900 selection:bg-[#1a2d8f]/10">
      {/* Dynamic Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="https://ik.imagekit.io/Gumelar/LogO/logo%20pt.png" 
              alt="Logo PT. Akses Artha Media" 
              className="h-10 sm:h-12 w-auto object-contain animate-float drop-shadow-md"
            />
            <div className="hidden sm:block ml-2 border-l-2 border-slate-200 pl-4">
              <h1 className="text-lg font-black text-slate-400 tracking-widest uppercase">Dashboard</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={onNavigateToForm}
              className="flex items-center gap-2 bg-[#1a2d8f]/10 hover:bg-[#1a2d8f]/20 text-[#1a2d8f] px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tambah Manual</span>
            </button>
            <button 
              onClick={fetchData}
              className={cn(
                "p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all",
                refreshing && "animate-spin text-[#1a2d8f]"
              )}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border border-transparent hover:border-red-100"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-[#1a2d8f]">Selamat Datang, Admin 👋</h2>
          <p className="text-slate-500 mt-1">Berikut adalah ringkasan data pendaftaran terbaru dari jaringan Armedia_Net.</p>
        </div>

        {/* Premium Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard 
            title="Total Pendaftar" 
            value={stats.total} 
            icon={<Users className="w-6 h-6" />} 
            gradient="from-blue-600 to-indigo-700"
            subtitle="+12% bulan ini"
          />
          <StatCard 
            title="Baru Hari Ini" 
            value={stats.today} 
            icon={<CheckCircle2 className="w-6 h-6" />} 
            gradient="from-emerald-500 to-teal-600"
            subtitle="Update otomatis"
          />
          <StatCard 
            title="Paket Favorit" 
            value={stats.popularPackage} 
            icon={<Package className="w-6 h-6" />} 
            gradient="from-orange-500 to-amber-600"
            subtitle="Paling banyak dipilih"
          />
          <StatCard 
            title="Sumber Utama" 
            value={stats.topSource} 
            icon={<Users className="w-6 h-6" />} 
            gradient="from-purple-600 to-fuchsia-600"
            subtitle="Asal pendaftar terbanyak"
          />
        </div>

        {/* Search & Action Bar */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-4 sm:p-6 mb-6 sm:mb-8 border border-white">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1a2d8f] transition-colors w-5 h-5" />
              <input 
                type="text"
                placeholder="Cari nama, alamat, atau nomor HP pelanggan..."
                className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:outline-none focus:border-[#1a2d8f]/20 focus:bg-white transition-all text-sm font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-3.5 sm:py-2.5 rounded-2xl border-2 border-slate-50 flex-1 sm:flex-none">
                <Filter className="w-4 h-4 text-slate-400" />
                <select 
                  className="bg-transparent border-none text-sm font-bold text-slate-700 focus:outline-none cursor-pointer w-full sm:w-auto"
                  value={selectedPackage}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                >
                  {packages.map(p => (
                    <option key={p} value={p}>{p === "All" ? "Semua Paket" : `Paket ${p}`}</option>
                  ))}
                </select>
              </div>
              
              <button 
                onClick={exportToPDF}
                className="flex items-center justify-center gap-2 bg-[#1a2d8f] text-white px-6 py-3.5 sm:py-4 rounded-2xl text-sm font-black hover:bg-[#0f1e6e] transition-all shadow-xl shadow-blue-200 hover:-translate-y-0.5 active:translate-y-0 flex-1 sm:flex-none"
              >
                <FileDown className="w-5 h-5" />
                EXPORT PDF
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-white relative">
          {/* Petunjuk scroll horisontal untuk mobile */}
          <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-white to-transparent md:hidden z-10 pointer-events-none"></div>
          
          <div className="overflow-x-auto pb-2">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-5 sm:px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Detail Pelanggan</th>
                  <th className="px-5 sm:px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Layanan & Jadwal</th>
                  <th className="px-5 sm:px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Lokasi Pemasangan</th>
                  <th className="px-5 sm:px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-5 sm:px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredData.length > 0 ? (
                  filteredData.map((item, idx) => (
                    <tr key={idx} className="group hover:bg-blue-50/30 transition-all">
                      <td className="px-5 sm:px-8 py-4 sm:py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-[#1a2d8f] group-hover:bg-[#1a2d8f] group-hover:text-white transition-all text-sm">
                            {item["Nama Lengkap"]?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 group-hover:text-[#1a2d8f] transition-colors">{item["Nama Lengkap"]}</span>
                            <span className="text-xs text-slate-400 font-medium">{item["No HP / WA"]}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 sm:px-8 py-4 sm:py-6">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-black text-[#1a2d8f]">{item.Paket?.split("(")[0]}</span>
                            <span className="text-[10px] bg-blue-100 text-[#1a2d8f] px-1.5 py-0.5 rounded font-bold">AKTIF</span>
                          </div>
                          <span className="text-xs text-slate-500 flex items-center gap-1.5 whitespace-nowrap">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            Pasang: <span className="font-semibold text-slate-700">{formatDate(item["Tanggal Rencana Pasang"])}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-5 sm:px-8 py-4 sm:py-6">
                        <div className="flex flex-col max-w-[200px] sm:max-w-[240px]">
                          <span className="text-xs text-slate-600 line-clamp-2 sm:line-clamp-1 group-hover:line-clamp-none transition-all duration-300">{item["Alamat Pemasangan"]}</span>
                          <div className="flex items-center gap-3 mt-2">
                            {item["Link Google Maps"] && (
                              <a 
                                href={item["Link Google Maps"]} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-[10px] text-blue-600 font-black hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg w-max"
                              >
                                <MapPin className="w-2.5 h-2.5" />
                                LIHAT MAPS
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 sm:px-8 py-4 sm:py-6">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0"></span>
                          <span className="text-[11px] font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-tight whitespace-nowrap">
                            Menunggu
                          </span>
                        </div>
                      </td>
                      <td className="px-5 sm:px-8 py-4 sm:py-6">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setRegToDelete(item); }}
                            className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm hover:shadow-red-200 hover:scale-110 active:scale-95"
                            title="Hapus Data"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                          <a 
                            href={formatWhatsApp(item["No HP / WA"])}
                            target="_blank"
                            rel="noreferrer"
                            className="p-3 bg-emerald-50 text-emerald-600 hover:bg-[#25D366] hover:text-white rounded-2xl transition-all duration-300 shadow-sm hover:shadow-emerald-200 hover:scale-110 active:scale-95"
                            title="Hubungi via WhatsApp"
                          >
                            <WhatsAppIcon className="w-5 h-5" />
                          </a>
                          <button 
                            onClick={() => setSelectedReg(item)}
                            className="p-3 bg-slate-50 text-slate-400 hover:bg-[#1a2d8f] hover:text-white rounded-2xl transition-all shadow-sm"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                          <Search className="w-8 h-8 text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-bold">Tidak ada data pendaftar yang cocok.</p>
                        <button onClick={() => {setSearchTerm(""); setSelectedPackage("All")}} className="text-[#1a2d8f] text-sm font-bold hover:underline">Reset Filter</button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="bg-slate-50/50 px-8 py-5 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Menampilkan {filteredData.length} dari {data.length} total pendaftar
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase">Live Database</span>
            </div>
          </div>
        </div>
      </main>
      
      {/* Detail Modal */}
      {selectedReg && (
        <DetailModal 
          reg={selectedReg} 
          onClose={() => setSelectedReg(null)} 
          formatWhatsApp={formatWhatsApp}
          formatDate={formatDate}
          onDelete={() => setRegToDelete(selectedReg)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {regToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Hapus Data?</h3>
              <p className="text-sm text-slate-500 font-medium">
                Apakah Anda yakin ingin menghapus pendaftaran atas nama <span className="text-slate-900 font-black">{regToDelete["Nama Lengkap"]}</span>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setRegToDelete(null)}
                className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-all active:scale-95"
              >
                Batal
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-200 active:scale-95"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {pdfPreviewUrl && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 sm:p-6 bg-[#1a2d8f] text-white">
              <h3 className="text-xl font-black flex items-center gap-3">
                <FileDown className="w-6 h-6" />
                Preview Laporan PDF
              </h3>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    if (pdfDoc) {
                      pdfDoc.save(`Armedia_Net_Registrations_${new Date().toISOString().split('T')[0]}.pdf`);
                    }
                  }}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  <FileDown className="w-5 h-5" />
                  <span className="hidden sm:inline">Download PDF</span>
                </button>
                <button 
                  onClick={() => { setPdfPreviewUrl(null); setPdfDoc(null); }}
                  className="flex items-center gap-1.5 px-3 py-2.5 bg-white/10 hover:bg-white/20 hover:text-red-300 rounded-xl transition-all font-bold text-sm active:scale-95"
                  title="Tutup Preview"
                >
                  <X className="w-5 h-5" />
                  <span className="hidden sm:inline">Tutup</span>
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100 p-2 sm:p-4">
              <iframe 
                src={pdfPreviewUrl} 
                className="w-full h-full rounded-2xl border-2 border-slate-200 bg-white" 
                title="PDF Preview"
              ></iframe>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer Branding */}
      <footer className="max-w-7xl mx-auto px-6 py-12 text-center">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
          Powered by LacosDev.com • Version 2.0.4
        </p>
      </footer>
    </div>
  );
}

function DetailModal({ reg, onClose, formatWhatsApp, formatDate, onDelete }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        <div className="bg-[#1a2d8f] p-6 sm:p-8 text-white relative flex-shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <LogOut className="w-5 h-5 rotate-180" />
          </button>
          <div className="flex items-center gap-4 mb-2 sm:mb-4 pr-10">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md flex-shrink-0">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black line-clamp-1">{reg["Nama Lengkap"]}</h3>
              <p className="text-white/60 font-medium text-xs sm:text-sm">Terdaftar pada {reg.Timestamp.split(',')[0]}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <InfoGroup title="Informasi Layanan" icon={<Package className="w-4 h-4" />}>
              <InfoItem label="Paket Dipilih" value={reg.Paket} highlight />
              <InfoItem label="Rencana Pasang" value={formatDate(reg["Tanggal Rencana Pasang"])} />
              <InfoItem label="Provider Saat Ini" value={reg["Provider Saat Ini"]} />
            </InfoGroup>

            <InfoGroup title="Kontak & Lokasi" icon={<MapPin className="w-4 h-4" />}>
              <InfoItem label="No HP / WA" value={reg["No HP / WA"]} />
              <InfoItem label="Alamat" value={reg["Alamat Pemasangan"]} />
              {reg["Link Google Maps"] && (
                <a 
                  href={reg["Link Google Maps"]} 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-2 text-blue-600 font-bold text-xs hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  Buka di Google Maps
                </a>
              )}
            </InfoGroup>

            <InfoGroup title="Detail Tambahan" icon={<Search className="w-4 h-4" />}>
              <InfoItem label="Waktu Survei" value={reg["Waktu Survei"] || "-"} />
              <InfoItem label="Prioritas / Alasan" value={reg.Prioritas || "-"} />
              <InfoItem label="Sumber Info" value={reg["Sumber Info"]} />
            </InfoGroup>

            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Aksi Cepat</h4>
              <a 
                href={formatWhatsApp(reg["No HP / WA"])}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-black py-4 rounded-2xl hover:bg-[#128C7E] transition-all shadow-lg shadow-emerald-100 animate-glow-wa hover:scale-[1.02] active:scale-95"
              >
                <WhatsAppIcon className="w-6 h-6" />
                HUBUNGI VIA WHATSAPP
              </a>
              <button 
                onClick={onDelete}
                className="flex items-center justify-center gap-2 bg-red-50 text-red-600 font-bold py-3 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                Hapus Pendaftar Ini
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoGroup({ title, icon, children }: any) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-[#1a2d8f] border-b border-slate-100 pb-2">
        {icon}
        <h4 className="text-xs font-black uppercase tracking-widest">{title}</h4>
      </div>
      <div className="flex flex-col gap-3">
        {children}
      </div>
    </div>
  );
}

function InfoItem({ label, value, highlight }: any) {
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">{label}</p>
      <p className={cn("text-sm font-semibold text-slate-700", highlight && "text-[#1a2d8f] font-black text-base")}>
        {value || "-"}
      </p>
    </div>
  );
}

function StatCard({ title, value, icon, gradient, subtitle }: any) {
  return (
    <div className="group bg-white p-1 rounded-3xl shadow-xl shadow-slate-200/50 border border-white hover:-translate-y-1 transition-all duration-300">
      <div className="bg-white rounded-[22px] p-6">
        <div className="flex items-start justify-between mb-6">
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br transition-all duration-500 group-hover:scale-110", gradient)}>
            {icon}
          </div>
          <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-blue-50 transition-colors">
            <MoreVertical className="w-4 h-4 text-slate-300" />
          </div>
        </div>
        <div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
          </div>
          <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
