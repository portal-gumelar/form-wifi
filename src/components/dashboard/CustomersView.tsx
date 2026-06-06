import React, { useState } from "react";
import { RegistrationData } from "../../types";
import { RegistrationTable } from "./RegistrationTable";
import * as Lucide from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PDFPreviewModal } from "./Modals";
import * as XLSX from "xlsx";
import { api } from "../../utils/apiClient";
import { normalizeRow } from "../../utils/dashboardUtils";

interface CustomersViewProps {
  data: RegistrationData[];
  isDarkMode: boolean;
  onViewDetails: (item: RegistrationData) => void;
  onEdit?: (item: RegistrationData) => void;
  onDelete: (timestamp: string) => void;
  onUpdateStatus: (timestamp: string, status: string) => void;
  userRole?: string;
}

const LOGO_URL = "https://ik.imagekit.io/Gumelar/LogO/logo%20pt.png?updatedAt=1778213993513";
const NAVY = [13, 22, 85] as [number, number, number];
const ORANGE = [244, 121, 32] as [number, number, number];

const getCustomerNo = (timestamp: string) => {
  if (!timestamp) return "AMN-000";
  const clean = String(timestamp).replace(/\D/g, "");
  return `AMN-${clean.slice(-5)}`;
};

const standardizePackageName = (rawPaket: string): string => {
  if (!rawPaket) return "Tanpa Paket";
  const clean = rawPaket.toUpperCase().replace(/\s/g, "");

  if (clean.includes("20MBPS") || clean.includes("20.MBPS") || clean.includes("PAKET_1") || clean === "20") {
    return "20 Mbps";
  }
  if (clean.includes("30MBPS") || clean.includes("30.MBPS") || clean.includes("PAKET_2") || clean === "30") {
    return "30 Mbps";
  }
  if (clean.includes("50MBPS") || clean.includes("50.MBPS") || clean.includes("PAKET_3") || clean === "50") {
    return "50 Mbps";
  }
  if (clean.includes("75MBPS") || clean.includes("75.MBPS") || clean.includes("PAKET_4") || clean === "75") {
    return "75 Mbps";
  }
  if (clean.includes("100MBPS") || clean.includes("100.MBPS") || clean.includes("PAKET_5") || clean === "100") {
    return "100 Mbps";
  }

  return rawPaket; // fallback
};

const generateCustomersPDFDoc = async (data: RegistrationData[], filterLabel: string) => {
  const doc = new jsPDF("l", "mm", "a4");

  // ── Header bar ────────────────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, 297, 36, "F");

  // Logo (load from URL via canvas)
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.crossOrigin = "anonymous";
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = LOGO_URL;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext("2d")!.drawImage(img, 0, 0);
    const dataUrl = canvas.toDataURL("image/png");
    doc.addImage(dataUrl, "PNG", 10, 7, 20, 20);
  } catch {
    // Logo gagal dimuat — tetap lanjutkan
  }

  // Brand text
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("ARMEDIA.ID", 35, 19);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 195, 230);
  doc.text("PT. AKSES ARTHA MEDIA — Laporan Data Pelanggan", 35, 26);

  // Right info
  doc.setFontSize(8);
  doc.setTextColor(200, 210, 240);
  doc.text(`Filter: ${filterLabel}`, 285, 16, { align: "right" });
  doc.text(`Dicetak: ${new Date().toLocaleString("id-ID")}`, 285, 23, { align: "right" });
  doc.text(`Total: ${data.length} pelanggan`, 285, 30, { align: "right" });

  // ── Orange accent line ─────────────────────────────────────
  doc.setFillColor(...ORANGE);
  doc.rect(0, 36, 297, 2, "F");

  // ── Table ─────────────────────────────────────────────────
  const headers = [["No.", "Customer ID", "nama_lengkap", "No. WhatsApp", "paket", "desa", "Status", "Tanggal Daftar"]];
  const rows = data.map((item, idx) => [
    idx + 1,
    getCustomerNo(item.timestamp),
    item.nama_lengkap || "-",
    item.no_hp_wa || "-",
    String(item.paket || "").split("(")[0].trim(),
    item.desa || "-",
    String(item.status || "").toUpperCase(),
    item.timestamp ? String(item.timestamp).split(",")[0] : "-",
  ]);

  autoTable(doc, {
    startY: 43,
    head: headers,
    body: rows,
    theme: "grid",
    headStyles: {
      fillColor: NAVY,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [244, 247, 254] },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      6: { halign: "center" },
    },
    didParseCell: (hookData) => {
      if (hookData.section === "body" && hookData.column.index === 6) {
        const val = String(hookData.cell.raw || "");
        if (val === "AKTIF") hookData.cell.styles.textColor = [5, 150, 105];
        else if (val === "NON AKTIF" || val === "BERHENTI BERLANGGANAN")
          hookData.cell.styles.textColor = [100, 116, 139];
      }
    },
    margin: { left: 10, right: 10 },
  });

  // ── Footer ────────────────────────────────────────────────
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(150, 160, 185);
    doc.text(
      "Dokumen resmi PT. AKSES ARTHA MEDIA (ARMEDIA.ID) — Dilarang menyebarluaskan tanpa izin",
      148.5, 202, { align: "center" }
    );
    doc.text(`Halaman ${i} / ${pageCount}`, 285, 202, { align: "right" });
  }

  return doc;
};

const exportCustomersExcel = (data: RegistrationData[], filterLabel: string) => {
  const rows = data.map((item, idx) => ({
    "No.": idx + 1,
    "Customer ID": getCustomerNo(item.timestamp),
    nama_lengkap: item.nama_lengkap || "",
    "No. WhatsApp": item.no_hp_wa || "",
    paket: String(item.paket || "").split("(")[0].trim(),
    desa: item.desa || "",
    "Status": String(item.status || "").toUpperCase(),
    "Tanggal Daftar": item.timestamp ? String(item.timestamp).split(",")[0] : "",
    alamat_pemasangan: item.alamat_pemasangan || "",
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data Pelanggan");
  XLSX.writeFile(wb, `Armedia_DataPelanggan_${filterLabel}_${new Date().toLocaleDateString("id-ID").replace(/\//g, "-")}.xlsx`);
};

export const CustomersView: React.FC<CustomersViewProps> = ({
  data, isDarkMode, onViewDetails, onEdit, onDelete, onUpdateStatus, userRole = "admin"
}) => {
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPackage, setFilterPackage] = useState<string | null>(null);
  const [filterDesa, setFilterDesa] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<jsPDF | null>(null);

  // FIX: Tambah state pagination & fetch dari API
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<RegistrationData[]>([]);

  // FIX: Fetch data dari API dengan normalizeRow agar kolom PostgreSQL
  // (name, phone, address, village_name, package_name, created_at, notes)
  // dipetakan ke format RegistrationData yang diharapkan UI.
  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await api.getCustomers({
        page,
        limit: 10,
        search: searchQuery,
        status: filterStatus === "Active" ? "AKTIF" : filterStatus === "Inactive" ? "NON AKTIF" : undefined,
      });
      // Normalisasi setiap baris agar properti seperti nama_lengkap, no_hp_wa,
      // paket, desa, dll. terisi dengan benar dari kolom PostgreSQL.
      const normalized = (res.data || []).map(normalizeRow);
      setCustomers(normalized);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Gagal fetch pelanggan", err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, searchQuery, filterStatus]);

  // Hanya tampilkan pelanggan AKTIF dan NON AKTIF
  const activeAndInactiveData = React.useMemo(() => {
    return data.filter(item => {
      const s = String(item.status || "").toUpperCase();
      return s === "AKTIF" || s === "NON AKTIF" || s === "BERHENTI BERLANGGANAN";
    });
  }, [data]);

  const subFilteredData = React.useMemo(() => {
    let result = activeAndInactiveData;

    // Status Filter
    if (filterStatus !== "All") {
      result = result.filter(item => {
        const s = String(item.status || "").toUpperCase();
        if (filterStatus === "Active") return s === "AKTIF";
        if (filterStatus === "Inactive") return s === "NON AKTIF" || s === "BERHENTI BERLANGGANAN";
        return true;
      });
    }

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => {
        return (
          (item.nama_lengkap && String(item.nama_lengkap).toLowerCase().includes(q)) ||
          (item.no_hp_wa && String(item.no_hp_wa).toLowerCase().includes(q)) ||
          (item.alamat_pemasangan && String(item.alamat_pemasangan).toLowerCase().includes(q)) ||
          (item.timestamp && getCustomerNo(item.timestamp).toLowerCase().includes(q))
        );
      });
    }

    // Package Filter
    if (filterPackage) {
      result = result.filter(item => {
        return standardizePackageName(item.paket || "") === filterPackage;
      });
    }

    // Desa Filter
    if (filterDesa) {
      result = result.filter(item => {
        const d = String(item.desa || "").toUpperCase().trim();
        return d === filterDesa;
      });
    }

    return result;
  }, [activeAndInactiveData, filterStatus, searchQuery, filterPackage, filterDesa]);

  const countAktif = activeAndInactiveData.filter(d => String(d.status || "").toUpperCase() === "AKTIF").length;
  const countNonAktif = activeAndInactiveData.filter(d => {
    const s = String(d.status || "").toUpperCase();
    return s === "NON AKTIF" || s === "BERHENTI BERLANGGANAN";
  }).length;

  const packageStats = React.useMemo(() => {
    const activeData = activeAndInactiveData.filter(d => String(d.status || "").toUpperCase() === "AKTIF");
    const counts: Record<string, number> = {
      "20 Mbps": 0,
      "30 Mbps": 0,
      "50 Mbps": 0,
      "75 Mbps": 0,
      "100 Mbps": 0
    };
    activeData.forEach(item => {
      const pkg = standardizePackageName(item.paket || "");
      counts[pkg] = (counts[pkg] || 0) + 1;
    });

    const standardPackages = ["20 Mbps", "30 Mbps", "50 Mbps", "75 Mbps", "100 Mbps"];
    const allPackages = Array.from(new Set([...standardPackages, ...Object.keys(counts)]));

    return allPackages.map(pkg => [pkg, counts[pkg] || 0] as [string, number]);
  }, [activeAndInactiveData]);

  const villageStats = React.useMemo(() => {
    const activeData = activeAndInactiveData.filter(d => String(d.status || "").toUpperCase() === "AKTIF");
    const counts: Record<string, number> = {};
    activeData.forEach(item => {
      if (item.desa) {
        const d = item.desa.toUpperCase().trim();
        counts[d] = (counts[d] || 0) + 1;
      }
    });
    return counts;
  }, [activeAndInactiveData]);

  const filterLabel = [
    filterStatus === "Active" ? "Aktif" : filterStatus === "Inactive" ? "Non-Aktif" : "Semua Status",
    filterDesa ? `Desa ${filterDesa}` : "Semua Desa",
    filterPackage ? `Paket ${filterPackage}` : "Semua Paket"
  ].join(" - ");

  const tabs = [
    { id: "All", label: "Semua", count: activeAndInactiveData.length, icon: Lucide.Users, activeClass: "bg-[#1a2d8f] text-white shadow-lg shadow-blue-500/20" },
    { id: "Active", label: "Aktif", count: countAktif, icon: Lucide.CheckCircle2, activeClass: "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" },
    { id: "Inactive", label: "Non-Aktif", count: countNonAktif, icon: Lucide.PauseCircle, activeClass: "bg-slate-500 text-white shadow-lg shadow-slate-500/20" },
  ];

  const handlePreviewPdf = async () => {
    setIsExportingPdf(true);
    try {
      const doc = await generateCustomersPDFDoc(subFilteredData, filterLabel);
      setPdfDoc(doc);
      setPdfPreviewUrl(URL.createObjectURL(doc.output("blob")));
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadPdf = () => {
    if (pdfDoc) {
      pdfDoc.save(`Armedia_DataPelanggan_${filterLabel}_${new Date().toLocaleDateString("id-ID").replace(/\//g, "-")}.pdf`);
      setPdfPreviewUrl(null);
      setPdfDoc(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header Stats (Title removed to prevent duplication) ───────────────── */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-black text-emerald-700">{countAktif} Aktif</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span className="text-xs font-black text-slate-600">{countNonAktif} Non-Aktif</span>
          </div>
        </div>
      </div>

      {/* ── Filter Tabs + Search + Export Buttons ──────────────── */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full xl:w-auto">
          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = filterStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isActive
                    ? tab.activeClass
                    : isDarkMode
                      ? "bg-slate-800 text-slate-400"
                      : "bg-white text-slate-500 border border-slate-200 hover:border-[#0d1655]/30 shadow-sm"
                    }`}
                >
                  <Icon size={13} />
                  {tab.label}
                  <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${isActive ? "bg-white/20" : "bg-slate-100 text-slate-500"}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-48 shrink-0">
            <Lucide.Search
              size={14}
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${searchQuery.trim() ? "text-blue-500" : "text-slate-400"
                }`}
            />
            <input
              type="text"
              placeholder="Cari nama, ID, WA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 border rounded-xl text-xs font-bold outline-none transition-all shadow-sm ${searchQuery.trim()
                ? "bg-blue-50/40 border-blue-400 text-[#0d1655] font-black"
                : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 focus:border-[#0d1655]"
                }`}
            />
          </div>

          {/* Reset Filters Button */}
          {(filterStatus !== "All" || filterPackage !== null || filterDesa !== null || searchQuery.trim() !== "") && (
            <button
              onClick={() => {
                setFilterStatus("All");
                setFilterPackage(null);
                setFilterDesa(null);
                setSearchQuery("");
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-black transition-all border border-rose-100 active:scale-95 shrink-0"
              title="Reset Semua Filter"
            >
              <Lucide.RotateCcw size={12} /> Reset
            </button>
          )}
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          {/* Excel */}
          <button
            onClick={() => exportCustomersExcel(subFilteredData, filterLabel)}
            className="flex items-center justify-center flex-1 md:flex-initial gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-md shadow-emerald-500/30 active:scale-95"
          >
            <Lucide.FileSpreadsheet size={15} />
            <span>Excel</span>
          </button>

          {/* PDF — menonjol dengan warna brand */}
          <button
            onClick={handlePreviewPdf}
            disabled={isExportingPdf}
            className={`flex items-center justify-center flex-1 md:flex-initial gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 ${isExportingPdf
              ? "bg-slate-300 text-slate-500 cursor-not-allowed"
              : "bg-[#F47920] hover:bg-[#d86617] text-white shadow-orange-400/40 hover:shadow-orange-500/50 hover:shadow-lg"
              }`}
          >
            {isExportingPdf ? (
              <Lucide.Loader2 size={15} className="animate-spin" />
            ) : (
              <Lucide.FileText size={15} />
            )}
            <span>{isExportingPdf ? "Menyiapkan PDF..." : "Export PDF"}</span>
          </button>
        </div>
      </div>

      {/* ── Filter Mbps & Desa (Unified style matching Dashboard.tsx) ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter Mbps */}
        <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl px-4 py-2.5 shadow-sm">
          <Lucide.Zap size={14} className="text-[#F47920] shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">Mbps:</span>
          <div className="relative">
            <select
              value={filterPackage ? filterPackage.split(' ')[0] : ""}
              onChange={(e) => setFilterPackage(e.target.value === "" ? null : `${e.target.value} Mbps`)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-black rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:border-[#F47920] hover:border-[#F47920] transition-all cursor-pointer"
            >
              <option value="">Semua Mbps</option>
              {["20", "30", "50", "75", "100"].map((mbps) => {
                const pkgName = `${mbps} Mbps`;
                let count = 0;
                const found = packageStats.find(([name]) => name === pkgName);
                if (found) count = found[1];
                return (
                  <option key={mbps} value={mbps}>
                    {mbps} Mbps {count > 0 ? `(${count})` : ''}
                  </option>
                );
              })}
            </select>
            <Lucide.ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Filter Desa */}
        <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl px-4 py-2.5 shadow-sm">
          <Lucide.MapPin size={14} className="text-[#0d1655] shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">desa:</span>
          <div className="relative">
            <select
              value={filterDesa || ""}
              onChange={(e) => setFilterDesa(e.target.value === "" ? null : e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-black rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:border-[#0d1655] hover:border-[#0d1655] transition-all cursor-pointer"
            >
              <option value="">Semua Desa</option>
              {["GUMELAR", "CIHONJE", "TLAGA", "SAMUDRA", "SAMUDRA KULON", "CILANGKAP", "PANINGKABAN", "KARANG KEMOJING", "GANCANG", "KEDUNG URANG"].map((desa) => {
                const count = villageStats[desa] || 0;
                return (
                  <option key={desa} value={desa}>
                    {desa} {count > 0 ? `(${count})` : ''}
                  </option>
                );
              })}
            </select>
            <Lucide.ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────── */}
      {customers.length > 0 ? (
        <>
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
                <Lucide.Loader2 className="w-8 h-8 text-[#0d1655] animate-spin" />
              </div>
            )}
            <RegistrationTable
              data={customers}
              isDarkMode={isDarkMode}
              onViewDetails={onViewDetails}
              onEdit={onEdit ?? (() => { })}
              onDelete={async (ts) => {
                await onDelete(ts);
                fetchCustomers();
              }}
              onUpdateStatus={async (ts, st) => {
                await onUpdateStatus(ts, st);
                fetchCustomers();
              }}
              hideHeader={true}
              allowedStatuses={["AKTIF", "NON AKTIF"]}
              userRole={userRole}
            />
          </div>

          {/* FIX: Pagination Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400">
              Halaman {page} dari {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1 || isLoading}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-[10px] font-black uppercase disabled:opacity-50 hover:bg-slate-50 transition-all"
              >
                Prev
              </button>
              <button
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-[10px] font-black uppercase disabled:opacity-50 hover:bg-slate-50 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Lucide.Users size={28} className="text-slate-300" />
          </div>
          <p className="text-sm font-black text-slate-400">Belum ada data pelanggan</p>
        </div>
      )}

      {/* ── PDF Preview Modal ─────────────────────────────────── */}
      <PDFPreviewModal
        url={pdfPreviewUrl}
        onClose={() => { setPdfPreviewUrl(null); setPdfDoc(null); }}
        onDownload={handleDownloadPdf}
      />
    </div>
  );
};
