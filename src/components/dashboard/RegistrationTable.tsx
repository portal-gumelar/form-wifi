import React, { useState, useRef, useEffect } from "react";
import { RegistrationData } from "../../types";
import { getCustomerNo } from "../../utils/dashboardUtils";
import * as Lucide from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RegistrationTableProps {
  data: RegistrationData[];
  isDarkMode: boolean;
  onViewDetails: (item: RegistrationData) => void;
  onDelete: (timestamp: string) => void;
  onUpdateStatus: (timestamp: string, status: string) => void;
  mini?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  PENGAJUAN: { label: "PENGAJUAN", color: "text-blue-600", bg: "bg-blue-50", icon: Lucide.PlusCircle },
  SURVEY: { label: "SURVEY", color: "text-indigo-600", bg: "bg-indigo-50", icon: Lucide.Search },
  PROSES: { label: "PROSES", color: "text-amber-600", bg: "bg-amber-50", icon: Lucide.Loader2 },
  AKTIF: { label: "AKTIF", color: "text-emerald-600", bg: "bg-emerald-50", icon: Lucide.CheckCircle2 },
  BELUM_AKTIF: { label: "NON-AKTIF", color: "text-slate-400", bg: "bg-slate-50", icon: Lucide.PauseCircle },
  PENDING: { label: "PENDING", color: "text-orange-600", bg: "bg-orange-50", icon: Lucide.Clock },
  BATAL: { label: "BATAL", color: "text-red-600", bg: "bg-red-50", icon: Lucide.XCircle },
};

const StatusDropdown = ({ 
  currentStatus, 
  onSelect 
}: { 
  currentStatus: string; 
  onSelect: (status: string) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const activeConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.PENGAJUAN;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all border-2 ${activeConfig.bg} ${activeConfig.color} border-transparent hover:border-current/10 shadow-sm`}
      >
        <activeConfig.icon size={12} className={currentStatus === 'PROSES' ? 'animate-spin' : ''} />
        <span className="truncate max-w-[70px] sm:max-w-none">{activeConfig.label}</span>
        <Lucide.ChevronDown size={10} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            // Perbaikan Kursi: 'right-0' menjamin kotak menu dropdown tidak pernah keluar dari batas kanan layar HP
            className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.15)] border border-slate-100 z-[110] p-1.5"
          >
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2.5 py-1.5 mb-1 border-b border-slate-100">Pilih Status</div>
            <div className="space-y-0.5 max-h-[180px] overflow-y-auto custom-scrollbar">
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => {
                    onSelect(key);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all text-left group ${
                    currentStatus === key 
                    ? `${config.bg} ${config.color} font-black` 
                    : 'hover:bg-slate-50 text-slate-600 font-medium'
                  }`}
                >
                  <config.icon size={13} className={currentStatus === key ? config.color : 'text-slate-300 group-hover:text-slate-500'} />
                  <span className="text-xs">{config.label}</span>
                  {currentStatus === key && <Lucide.Check size={12} className="ml-auto" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const RegistrationTable: React.FC<RegistrationTableProps> = ({ 
  data, onViewDetails, onDelete, onUpdateStatus, mini = false 
}) => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof RegistrationData | 'status'; direction: 'asc' | 'desc' } | null>(null);
  const [selectedWaCustomer, setSelectedWaCustomer] = useState<RegistrationData | null>(null);

  const sortedData = React.useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const valA = String(a[sortConfig.key] || "").toLowerCase();
        const valB = String(b[sortConfig.key] || "").toLowerCase();
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const requestSort = (key: any) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return <Lucide.ChevronsUpDown size={12} className="text-slate-300" />;
    return sortConfig.direction === 'asc' ? <Lucide.ArrowUp size={12} className="text-[#F47920]" /> : <Lucide.ArrowDown size={12} className="text-[#F47920]" />;
  };

  return (
    // Penggantian kolabo-card ke struktur kemas yang solid & aman dari kebocoran layout
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden w-full">
      <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky left-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
            <Lucide.LayoutList size={16} className="text-[#0d1655]" />
          </div>
          <h3 className="text-sm sm:text-base font-black text-[#0d1655] tracking-tight">
            {mini ? "Aktivitas Terbaru" : "Manajemen Pesanan"}
          </h3>
        </div>
      </div>
      
      {/* Container ini menjamin tabel dapat digeser secara internal di HP tanpa merusak halaman utama */}
      <div className="w-full overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse table-auto text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th 
                className="px-4 sm:px-6 py-3.5 font-black text-[#0d1655] uppercase text-[10px] sm:text-xs tracking-widest cursor-pointer hover:text-[#F47920] transition-colors"
                onClick={() => requestSort('Nama Lengkap')}
              >
                <div className="flex items-center gap-1.5 whitespace-nowrap">Pelanggan {getSortIcon('Nama Lengkap')}</div>
              </th>
              {!mini && (
                <th 
                  className="px-4 sm:px-6 py-3.5 font-black text-[#0d1655] uppercase text-[10px] sm:text-xs tracking-widest cursor-pointer hover:text-[#F47920] transition-colors"
                  onClick={() => requestSort('Alamat Pemasangan')}
                >
                  <div className="flex items-center gap-1.5 whitespace-nowrap">Alamat Wilayah {getSortIcon('Alamat Pemasangan')}</div>
                </th>
              )}
              <th 
                className="px-4 sm:px-6 py-3.5 font-black text-[#0d1655] uppercase text-[10px] sm:text-xs tracking-widest text-center cursor-pointer hover:text-[#F47920] transition-colors"
                onClick={() => requestSort('status')}
              >
                <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">Status Progres {getSortIcon('status')}</div>
              </th>
              {!mini && <th className="px-4 sm:px-6 py-3.5 font-black text-[#0d1655] uppercase text-[10px] sm:text-xs tracking-widest whitespace-nowrap text-center">Progress</th>}
              <th className="px-4 sm:px-6 py-3.5 font-black text-[#0d1655] uppercase text-[10px] sm:text-xs tracking-widest text-right whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedData.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/40 transition-colors group">
                <td className="px-4 sm:px-6 py-3.5">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-[#0d1655] text-xs sm:text-sm shrink-0 border border-slate-200">
                      {item["Nama Lengkap"]?.charAt(0) || "U"}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-800 text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[160px]">{item["Nama Lengkap"]}</p>
                        {item["Foto KTP"] ? (
                          <span className="bg-emerald-50 text-emerald-700 text-[8px] font-black border border-emerald-200/60 px-1.5 py-0.5 rounded-md leading-none select-none uppercase tracking-widest shrink-0 scale-95">KTP OK</span>
                        ) : (
                          <span className="bg-slate-50 text-slate-400 text-[8px] font-black border border-slate-200/60 px-1.5 py-0.5 rounded-md leading-none select-none uppercase tracking-widest shrink-0 scale-95">No KTP</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold">ID: #{getCustomerNo(item.Timestamp).split('-')[1] || "00"}</p>
                    </div>
                  </div>
                </td>
                {!mini && (
                  <td className="px-4 sm:px-6 py-3.5">
                    {(() => {
                      const address = item["Alamat Pemasangan"] || "";
                      const lowerAddr = address.toLowerCase();
                      let colorConfig = { color: "text-blue-600", bg: "bg-blue-50 border-blue-100" };
                      
                      const keywords: Record<string, { color: string, bg: string }> = {
                        "gumelar": { color: "text-amber-700", bg: "bg-amber-50 border-amber-100" },
                        "cihonje": { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
                        "tlaga": { color: "text-blue-700", bg: "bg-blue-50 border-blue-100" },
                        "samudra kulon": { color: "text-purple-700", bg: "bg-purple-50 border-purple-100" },
                        "samudra": { color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-100" },
                        "cilangkap": { color: "text-sky-700", bg: "bg-sky-50 border-sky-100" },
                        "paningkaban": { color: "text-rose-700", bg: "bg-rose-50 border-rose-100" },
                      };

                      for (const key in keywords) {
                        if (lowerAddr.includes(key)) {
                          colorConfig = keywords[key];
                          break;
                        }
                      }

                      return (
                        <div className={`inline-block px-2.5 py-1 rounded-lg border ${colorConfig.bg} max-w-[160px] sm:max-w-[240px] truncate`}>
                          <p className={`text-[11px] font-black truncate ${colorConfig.color}`}>
                            {address}
                          </p>
                        </div>
                      );
                    })()}
                  </td>
                )}
                <td className="px-4 sm:px-6 py-3.5 text-center">
                  <StatusDropdown 
                    currentStatus={item.status || "PENGAJUAN"} 
                    onSelect={(newStatus) => onUpdateStatus(item.Timestamp, newStatus)} 
                  />
                </td>
                {!mini && (
                  <td className="px-4 sm:px-6 py-3.5 text-center">
                    <div className="w-16 sm:w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden inline-block">
                       <div className="bg-[#F47920] h-full transition-all duration-1000 ease-out" style={{ width: item.status === 'AKTIF' ? '100%' : item.status === 'PROSES' ? '70%' : item.status === 'SURVEY' ? '40%' : '15%' }}></div>
                    </div>
                  </td>
                )}
                <td className="px-4 sm:px-6 py-3.5 text-right">
                  <div className="flex items-center gap-1.5 sm:gap-2 justify-end">
                    <button 
                      onClick={() => onViewDetails(item)} 
                      title="Edit Data"
                      className="p-2 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all border border-blue-100"
                    >
                      <Lucide.Edit3 size={14} strokeWidth={2.5} />
                    </button>
                    <button 
                      onClick={() => setSelectedWaCustomer(item)} 
                      title="Chat WhatsApp (Template)"
                      className="p-2 rounded-xl text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all border border-emerald-100 active:scale-95 flex items-center justify-center"
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d="M12.031 2c-5.514 0-9.99 4.476-9.99 9.99 0 1.761.461 3.477 1.336 4.996L2 22l5.184-1.361c1.465.8 3.109 1.22 4.847 1.22 5.514 0 9.99-4.476 9.99-9.99S17.545 2 12.031 2zm0 1.662c4.6 0 8.328 3.737 8.328 8.328 0 4.59-3.728 8.328-8.328 8.328-1.579 0-3.084-.44-4.385-1.272l-.314-.2-.196.115-2.73.717.729-2.65-.213-.343c-.854-1.282-1.306-2.784-1.306-4.34 0-4.6 3.737-8.328 8.315-8.328zm-3.69 3.68c-.13 0-.272.015-.41.04-.377.067-.624.237-.783.535-.292.548-.426 1.472-.426 2.378 0 1.096.34 2.158.981 3.064 1.116 1.579 2.766 2.88 4.67 3.682.747.315 1.534.502 2.277.542.413.023.793-.01 1.1-.097.433-.122.75-.38.895-.733.2-.487.327-1.127.327-1.636 0-.175-.084-.282-.24-.36l-1.92-.96c-.156-.078-.328-.06-.445.056l-.587.587c-.12.12-.296.14-.445.048-.483-.298-.946-.667-1.368-1.09-.423-.422-.792-.885-1.09-1.368-.092-.149-.072-.325.048-.445l.587-.587c.116-.117.134-.289.056-.445l-.96-1.92c-.078-.156-.185-.24-.36-.24z"/>
                      </svg>
                    </button>
                    <button 
                      onClick={() => onDelete(item.Timestamp)} 
                      title="Hapus Data"
                      className="p-2 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all border border-rose-100"
                    >
                      <Lucide.Trash2 size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* WhatsApp Template Launcher Modal */}
      <AnimatePresence>
        {selectedWaCustomer && (
          <div className="fixed inset-0 bg-[#0d1655]/45 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-lg overflow-hidden border border-slate-100 shadow-2xl relative"
            >
              {/* Header */}
              <div className="px-6 py-5 bg-[#0d1655] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Lucide.MessageCircle size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-black text-xs uppercase tracking-widest text-white">WhatsApp Template</h3>
                    <p className="text-[10px] text-slate-300 font-bold mt-0.5">Kirim pesan cepat ke {selectedWaCustomer["Nama Lengkap"]}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedWaCustomer(null)}
                  className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                  <Lucide.X size={16} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-start gap-3">
                  <Lucide.Info size={16} className="text-[#F47920] mt-0.5 shrink-0" />
                  <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                    Pilih template di bawah untuk membuka WhatsApp dengan pesan yang sudah diisi secara otomatis sesuai data pendaftaran pelanggan.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      title: "1. Konfirmasi & Jadwal Survei Jalur",
                      desc: "Kirim pesan perkenalan teknisi dan rencana survei lokasi rumah pendaftar baru.",
                      message: `*ARMEDIA NET - SURVEI LOKASI* 📍\n\nHalo Kak *${selectedWaCustomer["Nama Lengkap"]}*,\n\nTerima kasih telah mengajukan pendaftaran pasang baru internet unlimited ARMEDIA Net untuk alamat *${selectedWaCustomer["Alamat Pemasangan"] || "-"}* (${selectedWaCustomer.Desa || "-"}).\n\nTim teknis kami berencana untuk melakukan survei jalur kabel ke rumah Kakak pada:\n📅 *Hari*: ....................\n⏰ *Jam*: ....................\n\nApakah Kakak/kerabat ada di rumah pada waktu tersebut untuk membantu menunjukkan lokasi survei? Terima kasih atas kerjasamanya.\n\nSalam Hangat,\n*ARMEDIA Net* ⚡`
                    },
                    {
                      title: "2. Penjadwalan & Etika Tarik Kabel",
                      desc: "Jadwal penarikan kabel/modem serta panduan sopan santun melintasi lahan tetangga.",
                      message: `*ARMEDIA NET - JADWAL INSTALASI & PERIZINAN* 🔌\n\nHalo Kak *${selectedWaCustomer["Nama Lengkap"]}*,\n\nSelamat, pendaftaran internet ARMEDIA Net Anda telah disetujui! Tim teknisi kami dijadwalkan untuk melakukan penarikan kabel dan instalasi modem pada:\n📅 *Hari*: ....................\n⏰ *Jam*: ....................\n\n*PENTING (Etika & Moralitas)*:\nDi ARMEDIA, kami sangat menjunjung tinggi Etika, Sopan Santun, dan Moralitas. Jika penarikan kabel tim kami harus melintas di atas rumah atau lahan tetangga, mohon bantuannya untuk *meminta izin kepada tetangga/kerabat tersebut sebelum proses pengerjaan dimulai* agar berjalan lancar.\n\nTerima kasih atas kerjasamanya! 🙏\n\nSalam Hangat,\n*ARMEDIA Net* ⚡`
                    },
                    {
                      title: "3. Rincian Tagihan Pro-rata & Aktivasi",
                      desc: "Kirim informasi kelayakan internet aktif beserta notifikasi pro-rata billing bulan pertama.",
                      message: `*ARMEDIA NET - AKTIVASI & PRO-RATA BILLING* 💳\n\nHalo Kak *${selectedWaCustomer["Nama Lengkap"]}*,\n\nLayanan internet ARMEDIA Net Anda di *${selectedWaCustomer["Alamat Pemasangan"] || "-"}* telah aktif sepenuhnya dan siap digunakan! 🎉\n\nBerikut informasi rincian paket Anda:\n📦 *Paket*: ${selectedWaCustomer.Paket || "-"}\n💰 *Status Tagihan*: Pro-rata bulan pertama otomatis terhitung sesuai tanggal On Anda.\n\nSelamat menikmati internet cepat dan unlimited tanpa batas dari ARMEDIA Net!\n\nSalam Hangat,\n*ARMEDIA Net* ⚡`
                    }
                  ].map((tpl, i) => {
                    const handleSend = () => {
                      const phone = String(selectedWaCustomer["No HP / WA"] || "").replace(/\D/g, "");
                      const waPhone = phone.startsWith("0") ? "62" + phone.slice(1) : phone;
                      const encodedMsg = encodeURIComponent(tpl.message);
                      window.open(`https://wa.me/${waPhone}?text=${encodedMsg}`, "_blank");
                      setSelectedWaCustomer(null);
                    };

                    return (
                      <div key={i} className="p-4 bg-white border border-slate-100 hover:border-emerald-500 rounded-2xl transition-all shadow-sm flex flex-col justify-between gap-3 group">
                        <div>
                          <h4 className="text-xs font-black text-[#0d1655] group-hover:text-emerald-600 transition-colors uppercase tracking-wider">{tpl.title}</h4>
                          <p className="text-[10px] text-slate-400 font-bold mt-1 leading-relaxed">{tpl.desc}</p>
                        </div>
                        <button 
                          onClick={handleSend}
                          className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all shadow-md shadow-emerald-500/10 active:scale-95"
                        >
                          <Lucide.Send size={12} /> Kirim via WhatsApp
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};