import { RegistrationData, DashboardStats } from "../types";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const getCustomerNo = (timestamp: string) => {
  if (!timestamp) return "AMN-000";
  const clean = timestamp.replace(/\D/g, "");
  return `AMN-${clean.slice(-5)}`;
};

export const calculateStats = (data: RegistrationData[]): DashboardStats => {
  const packages: any = {};
  const trends: any = {};
  const providers: any = {};
  const sources: any = {};
  const regions: any = {};
  let totalRevenue = 0;
  const statusCounts: Record<string, number> = {
    "PENGAJUAN": 0,
    "SURVEY":    0,
    "PROSES":    0,
    "AKTIF":     0,
    "NON AKTIF": 0,
    "BERHENTI BERLANGGANAN": 0,
    // Legacy support untuk data lama
    "BARU":      0,
    "BATAL":     0,
  };

  data.forEach(item => {
    // Package & Revenue
    const pkgRaw = String(item.Paket || "Unknown");
    const pkg = pkgRaw.split("(")[0].trim();
    packages[pkg] = (packages[pkg] || 0) + 1;
    
    // Extract price (e.g., "Rp 115.000")
    if (item.status === "AKTIF") {
      const priceMatch = pkgRaw.match(/Rp\s*([\d.]+)/);
      if (priceMatch) {
        totalRevenue += parseInt(priceMatch[1].replace(/\./g, ""));
      }
    }

    const dateStr = item.Timestamp ? item.Timestamp.split(",")[0] : "N/A";
    trends[dateStr] = (trends[dateStr] || 0) + 1;

    const prov = item["Provider Saat Ini"] || "None";
    providers[prov] = (providers[prov] || 0) + 1;

    const src = item["Sumber Info"] || "Direct";
    sources[src] = (sources[src] || 0) + 1;
    
    const region = item.Desa || "Lainnya";
    regions[region] = (regions[region] || 0) + 1;

    const status = (item.status || "BARU").toUpperCase();
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  const packageData = Object.keys(packages).map(name => ({ name, value: packages[name] }));
  const trendData = Object.keys(trends).map(date => ({ date, count: trends[date] })).slice(-7);
  const providerData = Object.keys(providers).map(name => ({ name, value: providers[name] }));
  const sourceData = Object.keys(sources).map(name => ({ name, value: sources[name] }));
  const regionalData = Object.keys(regions).map(name => ({ name, value: regions[name] })).sort((a,b) => b.value - a.value).slice(0, 5);

  return { packageData, trendData, providerData, sourceData, statusCounts, revenueProjection: totalRevenue, regionalData };
};

export const exportToExcel = (data: RegistrationData[]) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");
  XLSX.writeFile(workbook, `Armedia_Registrations_${new Date().toLocaleDateString()}.xlsx`);
};

const LOGO_URL = "https://ik.imagekit.io/Gumelar/LogO/logo%20pt.png?updatedAt=1778213993513";
const BRAND_COLOR = [13, 22, 85]; // Navy corporate brand color for header

const appendKtpAttachments = (doc: any, data: RegistrationData[]) => {
  data.forEach((item) => {
    const ktpData = item["Foto KTP"];
    if (ktpData && String(ktpData).startsWith("data:image/")) {
      doc.addPage();
      
      // Frame
      doc.setDrawColor(244, 121, 32); // Brand Orange
      doc.setLineWidth(1);
      doc.rect(14, 14, 269, 182);
      
      // Header Info
      doc.setFontSize(16);
      doc.setTextColor(13, 22, 85); // Navy
      doc.setFont("helvetica", "bold");
      doc.text(`LAMPIRAN FOTO KTP - ${String(item["Nama Lengkap"] || "").toUpperCase()}`, 20, 26);
      
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      doc.text(`ID Pelanggan: ${getCustomerNo(item.Timestamp)} | No. WA: ${item["No HP / WA"] || "-"}`, 20, 32);
      doc.text(`Alamat: ${item["Alamat Pemasangan"] || "-"} (${item.Desa || "-"}, ${item.Kecamatan || "-"}) | Paket: ${item.Paket || "-"}`, 20, 37);
      
      // Thin line divider
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 41, 277, 41);
      
      // Render KTP image centered & framed
      try {
        let format = "JPEG";
        if (ktpData.includes("image/png")) format = "PNG";
        else if (ktpData.includes("image/webp")) format = "WEBP";
        
        const imgWidth = 142;
        const imgHeight = 90;
        const imgX = (297 - imgWidth) / 2;
        const imgY = 50;
        
        // Premium gray/orange framing card border for the KTP photo
        doc.setFillColor(248, 250, 252);
        doc.rect(imgX - 4, imgY - 4, imgWidth + 8, imgHeight + 8, "F");
        doc.setDrawColor(203, 213, 225);
        doc.rect(imgX - 4, imgY - 4, imgWidth + 8, imgHeight + 8, "S");
        
        doc.addImage(ktpData, format, imgX, imgY, imgWidth, imgHeight);
        
        // Footer signature watermark
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text("Arsip pendaftaran digital resmi PT. AKSES ARTHA MEDIA (ARMEDIA.ID).", 20, 188);
      } catch (err) {
        console.error("Gagal merawat gambar KTP ke PDF:", err);
        doc.setFontSize(10);
        doc.setTextColor(239, 68, 68);
        doc.setFont("helvetica", "bold");
        doc.text("[Foto KTP tidak dapat ditampilkan secara visual - Format file korup atau tidak didukung]", 20, 60);
      }
    }
  });
};

export const generatePDFBlobUrl = (data: RegistrationData[]): string => {
  const doc = new jsPDF("l", "mm", "a4");
  
  // Header with Logo
  doc.addImage(LOGO_URL, "PNG", 14, 10, 15, 15);
  doc.setFontSize(22);
  doc.setTextColor(13, 22, 85);
  doc.setFont("helvetica", "bold");
  doc.text("ARMEDIA.ID", 32, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(112, 126, 174);
  doc.setFont("helvetica", "normal");
  doc.text("Laporan Registrasi Pelanggan Baru", 32, 26);
  
  doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 280, 20, { align: "right" });

  const headers = [["No.", "Customer ID", "Nama Lengkap", "WhatsApp", "Paket Layanan", "Kecamatan / Desa", "Tanggal Daftar", "KTP"]];
  const rows = data.map((item, idx) => [
    idx + 1,
    getCustomerNo(item.Timestamp),
    item["Nama Lengkap"],
    item["No HP / WA"],
    String(item.Paket || "").split("(")[0],
    `${item.Kecamatan || "-"} / ${item.Desa || "-"}`,
    item.Timestamp.split(",")[0],
    item["Foto KTP"] ? "ADA (Lampiran)" : "TIDAK"
  ]);

  autoTable(doc, {
    startY: 40,
    head: headers,
    body: rows,
    theme: "grid",
    headStyles: { fillColor: BRAND_COLOR, textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 8, font: "helvetica", cellPadding: 4 },
    alternateRowStyles: { fillColor: [244, 247, 254] },
    margin: { top: 40 }
  });

  appendKtpAttachments(doc, data);

  return URL.createObjectURL(doc.output("blob"));
};

export const downloadPDF = (data: RegistrationData[]) => {
  const doc = new jsPDF("l", "mm", "a4");
  
  // Header with Logo
  doc.addImage(LOGO_URL, "PNG", 14, 10, 15, 15);
  doc.setFontSize(22);
  doc.setTextColor(13, 22, 85);
  doc.setFont("helvetica", "bold");
  doc.text("ARMEDIA.ID", 32, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(112, 126, 174);
  doc.setFont("helvetica", "normal");
  doc.text("Laporan Registrasi Pelanggan Baru", 32, 26);
  
  doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 280, 20, { align: "right" });

  const headers = [["No.", "Customer ID", "Nama Lengkap", "WhatsApp", "Paket Layanan", "Kecamatan / Desa", "Tanggal Daftar", "KTP"]];
  const rows = data.map((item, idx) => [
    idx + 1,
    getCustomerNo(item.Timestamp),
    item["Nama Lengkap"],
    item["No HP / WA"],
    String(item.Paket || "").split("(")[0],
    `${item.Kecamatan || "-"} / ${item.Desa || "-"}`,
    item.Timestamp.split(",")[0],
    item["Foto KTP"] ? "ADA (Lampiran)" : "TIDAK"
  ]);

  autoTable(doc, {
    startY: 40,
    head: headers,
    body: rows,
    theme: "grid",
    headStyles: { fillColor: BRAND_COLOR, textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 8, font: "helvetica", cellPadding: 4 },
    alternateRowStyles: { fillColor: [244, 247, 254] },
    margin: { top: 40 }
  });

  appendKtpAttachments(doc, data);

  doc.save(`Armedia_Report_${new Date().toLocaleDateString()}.pdf`);
};
