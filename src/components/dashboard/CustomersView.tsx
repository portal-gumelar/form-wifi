import React, { useState } from "react";
import { RegistrationData } from "../../types";
import { RegistrationTable } from "./RegistrationTable";
import * as Lucide from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PDFPreviewModal } from "./Modals";
import * as XLSX from "xlsx";

interface CustomersViewProps {
  data: RegistrationData[];
  isDarkMode: boolean;
  onViewDetails: (item: RegistrationData) => void;
  onEdit?: (item: RegistrationData) => void;
  onDelete: (timestamp: string) => void;
  onUpdateStatus: (timestamp: string, status: string) => void;
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
  
  if (clean.includes("20MBPS") || clean.includes("20.MBPS") || clean.includes("GUYUB_1") || clean === "20") {
    return "20 Mbps";
  }
  if (clean.includes("30MBPS") || clean.includes("30.MBPS") || clean.includes("GUYUB_2") || clean === "30") {
    return "30 Mbps";
  }
  if (clean.includes("50MBPS") || clean.includes("50.MBPS") || clean.includes("GUYUB_3") || clean === "50") {
    return "50 Mbps";
  }
  if (clean.includes("75MBPS") || clean.includes("75.MBPS") || clean.includes("GUYUB_4") || clean === "75") {
    return "75 Mbps";
  }
  if (clean.includes("100MBPS") || clean.includes("100.MBPS") || clean.includes("GUYUB_5") || clean === "100") {
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
  const headers = [["No.", "Customer ID", "Nama Lengkap", "No. WhatsApp", "Paket", "Desa", "Status", "Tanggal Daftar"]];
  const rows = data.map((item, idx) => [
    idx + 1,
    getCustomerNo(item.Timestamp),
    item["Nama Lengkap"] || "-",
    item["No HP / WA"] || "-",
    String(item.Paket || "").split("(")[0].trim(),
    item.Desa || "-",
    String(item.status || "").toUpperCase(),
    item.Timestamp ? String(item.Timestamp).split(",")[0] : "-",
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
    "Customer ID": getCustomerNo(item.Timestamp),
    "Nama Lengkap": item["Nama Lengkap"] || "",
    "No. WhatsApp": item["No HP / WA"] || "",
    "Paket": String(item.Paket || "").split("(")[0].trim(),
    "Desa": item.Desa || "",
    "Status": String(item.status || "").toUpperCase(),
    "Tanggal Daftar": item.Timestamp ? String(item.Timestamp).split(",")[0] : "",
    "Alamat Pemasangan": item["Alamat Pemasangan"] || "",
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data Pelanggan");
  XLSX.writeFile(wb, `Armedia_DataPelanggan_${filterLabel}_${new Date().toLocaleDateString("id-ID").replace(/\//g, "-")}.xlsx`);
};

export const CustomersView: React.FC<CustomersViewProps> = ({
  data, isDarkMode, onViewDetails, onEdit, onDelete, onUpdateStatus
}) => {
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPackage, setFilterPackage] = useState<string | null>(null);
  const [filterDesa, setFilterDesa] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<jsPDF | null>(null);

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
          (item["Nama Lengkap"] && String(item["Nama Lengkap"]).toLowerCase().includes(q)) ||
          (item["No HP / WA"] && String(item["No HP / WA"]).toLowerCase().includes(q)) ||
          (item["Alamat Pemasangan"] && String(item["Alamat Pemasangan"]).toLowerCase().includes(q)) ||
          (item.Timestamp && getCustomerNo(item.Timestamp).toLowerCase().includes(q))
        );
      });
    }

    // Package Filter
    if (filterPackage) {
      result = result.filter(item => {
        return standardizePackageName(item.Paket || "") === filterPackage;
      });
    }

    // Desa Filter
    if (filterDesa) {
      result = result.filter(item => {
        const d = String(item.Desa || "").toUpperCase().trim();
        return d === filterDesa;
      });
    }

    return result;
  }, [activeAndInactiveData, filterStatus, searchQuery, filterPackage, filterDesa]);

  const countAktif    = activeAndInactiveData.filter(d => String(d.status || "").toUpperCase() === "AKTIF").length;
  const countNonAktif = activeAndInactiveData.filter(d => {
    const s = String(d.status || "").toUpperCase();
    return s === "NON AKTIF" || s === "BERHENTI BERLANGGANAN";
  }).length;

  const uniqueVillages = React.useMemo(() => {
    const vSet = new Set<string>([
      "GUMELAR",
      "CIHONJE",
      "TLAGA",
      "SAMUDRA KULON",
      "SAMUDRA",
      "CILANGKAP",
      "PANINGKABAN",
      "KARANG KEMOJING",
      "GANCANG",
      "KEDUNG URANG"
    ]);
    activeAndInactiveData.forEach(item => {
      if (item.Desa) {
        vSet.add(item.Desa.toUpperCase().trim());
      }
    });
    return Array.from(vSet).sort();
  }, [activeAndInactiveData]);

  const uniquePackages = React.useMemo(() => {
    return [
      "20 Mbps",
      "30 Mbps",
      "50 Mbps",
      "75 Mbps",
      "100 Mbps"
    ];
  }, []);

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
      const pkg = standardizePackageName(item.Paket || "");
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
      if (item.Desa) {
        const d = item.Desa.toUpperCase().trim();
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
    { id: "All",      label: "Semua",     count: activeAndInactiveData.length, icon: Lucide.Users,        activeClass: "bg-[#1a2d8f] text-white shadow-lg shadow-blue-500/20" },
    { id: "Active",   label: "Aktif",     count: countAktif,                   icon: Lucide.CheckCircle2,  activeClass: "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" },
    { id: "Inactive", label: "Non-Aktif", count: countNonAktif,                icon: Lucide.PauseCircle,   activeClass: "bg-slate-500 text-white shadow-lg shadow-slate-500/20" },
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    isActive
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
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                searchQuery.trim() ? "text-blue-500" : "text-slate-400"
              }`}
            />
            <input
              type="text"
              placeholder="Cari nama, ID, WA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 border rounded-xl text-xs font-bold outline-none transition-all shadow-sm ${
                searchQuery.trim()
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
            className={`flex items-center justify-center flex-1 md:flex-initial gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 ${
              isExportingPdf
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
          <div className="flex items-center gap-1.5 flex-wrap">
            {["", "20", "30", "50", "75", "100"].map((mbps) => {
              const pkgName = mbps === "" ? "" : `${mbps} Mbps`;
              const isActive = mbps === "" ? filterPackage === null : filterPackage === pkgName;
              
              // find count from packageStats
              let count = 0;
              if (mbps !== "") {
                const found = packageStats.find(([name]) => name === pkgName);
                if (found) count = found[1];
              }

              return (
                <button
                  key={mbps}
                  onClick={() => setFilterPackage(mbps === "" ? null : pkgName)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black transition-all border ${
                    isActive
                      ? "bg-[#F47920] text-white border-[#F47920]"
                      : "bg-slate-50 text-slate-500 border-slate-200 hover:border-[#F47920]"
                  }`}
                >
                  <span>{mbps === "" ? "Semua" : `${mbps} Mbps`}</span>
                  {mbps !== "" && (
                    <span className={`px-1 rounded text-[8px] font-black ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Desa */}
        <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl px-4 py-2.5 shadow-sm">
          <Lucide.MapPin size={14} className="text-[#0d1655] shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">Desa:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {["", "GUMELAR", "CIHONJE", "TLAGA", "SAMUDRA", "SAMUDRA KULON", "CILANGKAP", "PANINGKABAN", "KARANG KEMOJING", "GANCANG", "KEDUNG URANG"].map((desa) => {
              const isActive = desa === "" ? filterDesa === null : filterDesa === desa;
              const count = desa === "" ? 0 : (villageStats[desa] || 0);

              return (
                <button
                  key={desa}
                  onClick={() => setFilterDesa(desa === "" ? null : desa)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black transition-all border ${
                    isActive
                      ? "bg-[#0d1655] text-white border-[#0d1655]"
                      : "bg-slate-50 text-slate-500 border-slate-200 hover:border-[#0d1655]"
                  }`}
                >
                  <span>{desa === "" ? "Semua Desa" : desa}</span>
                  {desa !== "" && count > 0 && (
                    <span className={`px-1 rounded text-[8px] font-black ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Empty state ───────────────────────────────────────── */}
      {activeAndInactiveData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Lucide.Users size={28} className="text-slate-300" />
          </div>
          <p className="text-sm font-black text-slate-400">Belum ada data pelanggan</p>
          <p className="text-xs text-slate-400 mt-1 text-center max-w-xs">
            Data muncul otomatis saat status pesanan diubah menjadi{" "}
            <span className="font-bold text-emerald-600">Aktif</span> atau{" "}
            <span className="font-bold text-slate-600">Non-Aktif</span> di menu Kelola Pesanan
          </p>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────── */}
      {activeAndInactiveData.length > 0 && (
        <RegistrationTable
          data={subFilteredData}
          isDarkMode={isDarkMode}
          onViewDetails={onViewDetails}
          onEdit={onEdit ?? (() => {})}
          onDelete={onDelete}
          onUpdateStatus={onUpdateStatus}
          hideHeader={true}
          allowedStatuses={["AKTIF", "NON AKTIF"]}
        />
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
