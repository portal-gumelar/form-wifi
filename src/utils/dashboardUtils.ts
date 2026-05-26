import { RegistrationData, DashboardStats } from "../types";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const getCustomerNo = (timestamp: string) => {
  if (!timestamp) return "AMN-000";
  const clean = String(timestamp).replace(/\D/g, "");
  return `AMN-${clean.slice(-5)}`;
};

export const calculateProRata = (tanggalAktifStr: string, paketStr: string) => {
  if (!tanggalAktifStr || !paketStr) return null;
  
  // Extract price (e.g., "115.000" -> 115000)
  const priceMatch = paketStr.match(/Rp\s*([\d.]+)/i) || paketStr.match(/(\d{3}\.\d{3})/);
  if (!priceMatch) return null;
  const price = parseInt(priceMatch[1].replace(/\./g, ""));

  // Parse Date
  const aktifDate = new Date(tanggalAktifStr);
  if (isNaN(aktifDate.getTime())) return null;

  const year = aktifDate.getFullYear();
  const month = aktifDate.getMonth(); // 0-indexed
  const day = aktifDate.getDate();

  // Get total days in that month
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Calculate remaining days (inclusive of activation day)
  const remainingDays = totalDaysInMonth - day + 1;

  // Pro-rata calculation
  const proRataPrice = Math.round((price / totalDaysInMonth) * remainingDays);

  return {
    normalPrice: price,
    proRataPrice,
    remainingDays,
    totalDaysInMonth,
    day,
    monthName: aktifDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })
  };
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
  const formattedData = data.map((item, idx) => ({
    "No.": idx + 1,
    "ID Pelanggan": getCustomerNo(item.Timestamp),
    "Status": (item.status || "PENGAJUAN").toUpperCase(),
    "Nama Lengkap": item["Nama Lengkap"],
    "No HP / WA": item["No HP / WA"],
    "Alamat Pemasangan": item["Alamat Pemasangan"],
    "RW / RT": (item as any)["RW / RT"] || "-",
    "Desa": item.Desa,
    "Kecamatan": item.Kecamatan,
    "Paket Layanan": item.Paket,
    "Titik Koordinat (Maps)": (item as any)["Titik Koordinat"],
    "Catatan Khusus": item.Catatan || "-",
    "Tanggal Mendaftar": item.Timestamp.split(",")[0],
    "Foto KTP (Sistem)": item["Foto KTP"] ? "Ada Lampiran" : "Tidak Ada"
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data_Pesanan");
  
  // Set column widths for better readability
  worksheet['!cols'] = [
    {wch: 5}, {wch: 15}, {wch: 15}, {wch: 25}, {wch: 18}, 
    {wch: 40}, {wch: 10}, {wch: 15}, {wch: 15}, {wch: 30}, 
    {wch: 35}, {wch: 25}, {wch: 15}, {wch: 15}
  ];

  XLSX.writeFile(workbook, `Armedia_Data_Pesanan_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.xlsx`);
};

const LOGO_URL = "https://ik.imagekit.io/Gumelar/LogO/logo%20pt.png?updatedAt=1778213993513";
const BRAND_COLOR: [number, number, number] = [13, 22, 85]; // Navy corporate brand color for header

const appendKtpAttachments = async (doc: any, data: RegistrationData[]) => {
  const itemsWithKtp = data.filter(item => item["Foto KTP"] && (String(item["Foto KTP"]).startsWith("data:image/") || String(item["Foto KTP"]).startsWith("http")));
  
  if (itemsWithKtp.length === 0) return;

  const ITEMS_PER_PAGE = 12; // Maximized to 12 photos per page
  const COLS = 4;
  
  const colWidth = 60; // 60mm width
  const rowHeight = 38; // 38mm height (maintains ~1.57 KTP aspect ratio)
  
  const startX = 18;
  const startY = 40;
  const gapX = 8;
  const gapY = 20; // 20mm gap for the text below the image
  
  for (let i = 0; i < itemsWithKtp.length; i++) {
    const item = itemsWithKtp[i];
    const ktpData = item["Foto KTP"] as string;
    
    // If it's the first item on a new page
    if (i % ITEMS_PER_PAGE === 0) {
      doc.addPage();
      
      // Outer Frame
      doc.setDrawColor(244, 121, 32); // Brand Orange
      doc.setLineWidth(1);
      doc.rect(14, 14, 269, 182);
      
      // Header Info
      doc.setFontSize(16);
      doc.setTextColor(13, 22, 85); // Navy
      doc.setFont("helvetica", "bold");
      const pageNum = Math.floor(i / ITEMS_PER_PAGE) + 1;
      const totalPages = Math.ceil(itemsWithKtp.length / ITEMS_PER_PAGE);
      doc.text(`LAMPIRAN FOTO KTP (Halaman ${pageNum} dari ${totalPages})`, 20, 26);
      
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      doc.text(`Memuat total ${itemsWithKtp.length} dokumen terlampir`, 20, 32);
      
      // Thin line divider
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 36, 277, 36);
      
      // Footer signature watermark
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("Arsip pendaftaran digital resmi PT. AKSES ARTHA MEDIA (ARMEDIA.ID).", 20, 188);
    }
    
    const indexOnPage = i % ITEMS_PER_PAGE;
    const col = indexOnPage % COLS;
    const row = Math.floor(indexOnPage / COLS);
    
    const x = startX + col * (colWidth + gapX);
    const y = startY + row * (rowHeight + gapY);
    
    try {
      let base64Data = ktpData;
      
      // Fetch if URL
      if (ktpData.startsWith("http")) {
         const response = await fetch(ktpData);
         const blob = await response.blob();
         const reader = new FileReader();
         base64Data = await new Promise<string>((resolve, reject) => {
           reader.onloadend = () => resolve(reader.result as string);
           reader.onerror = reject;
           reader.readAsDataURL(blob);
         });
      }
      
      let format = "JPEG";
      if (base64Data.includes("image/png")) format = "PNG";
      else if (base64Data.includes("image/webp")) format = "WEBP";
      
      // Draw image
      doc.addImage(base64Data, format, x, y, colWidth, rowHeight);
      
      // Draw border
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.5);
      doc.rect(x, y, colWidth, rowHeight, "S");
      
    } catch (err) {
      console.error("Gagal memuat KTP:", err);
      doc.setFillColor(241, 245, 249);
      doc.rect(x, y, colWidth, rowHeight, "F");
      doc.setFontSize(8);
      doc.setTextColor(239, 68, 68);
      doc.text("Gagal memuat gambar", x + 5, y + 25);
    }
    
    // Label under image
    doc.setFontSize(7);
    doc.setTextColor(13, 22, 85);
    doc.setFont("helvetica", "bold");
    const labelName = doc.splitTextToSize((item["Nama Lengkap"] || "-").toUpperCase(), colWidth);
    doc.text(labelName, x, y + rowHeight + 4);
    
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    // Calculate vertical offset in case labelName wrapped to multiple lines
    const nextLineY = y + rowHeight + 7 + (labelName.length - 1) * 3;
    doc.text(`ID: ${getCustomerNo(item.Timestamp)} | WA: ${item["No HP / WA"] || "-"}`, x, nextLineY);
    doc.text(`Paket: ${item.Paket || "-"}`, x, nextLineY + 3);
  }
};

const appendNotes = (doc: any) => {
  const finalY = doc.lastAutoTable?.finalY || 40;
  
  doc.setFontSize(10);
  doc.setTextColor(13, 22, 85);
  doc.setFont("helvetica", "bold");
  doc.text("Catatan & Instruksi Kerja:", 14, finalY + 15);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  
  const notes = [
    "1. Prioritas Utama: Segera tindak lanjuti pelanggan berstatus 'Pengajuan' yang sudah mendaftar lebih dari 2 hari.",
    "2. Prosedur Lapangan: Tim teknisi wajib mengecek ketersediaan port ODP terdekat dan mengonfirmasi jadwal via WhatsApp.",
    "3. Privasi Data: Laporan ini di-generate otomatis oleh sistem. Lampiran identitas (KTP) pendaftar terlampir pada halaman selanjutnya."
  ];
  
  let currentY = finalY + 22;
  notes.forEach(note => {
    doc.text(note, 14, currentY);
    currentY += 6;
  });
};

export const generatePDFBlobUrl = async (data: RegistrationData[]): Promise<string> => {
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

  const headers = [["No.", "Customer ID", "Nama Lengkap", "Status", "WhatsApp", "Paket Layanan", "Kec/Desa/Alamat", "Tanggal Daftar"]];
  const rows = data.map((item, idx) => [
    idx + 1,
    getCustomerNo(item.Timestamp),
    item["Nama Lengkap"],
    (item.status || "PENGAJUAN").toUpperCase(),
    item["No HP / WA"],
    String(item.Paket || "").split("(")[0].trim(),
    `${item.Kecamatan || "-"} / ${item.Desa || "-"}\n${item["Alamat Pemasangan"] || "-"}`,
    item.Timestamp.split(",")[0]
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

  appendNotes(doc);
  await appendKtpAttachments(doc, data);

  return URL.createObjectURL(doc.output("blob"));
};

export const downloadPDF = async (data: RegistrationData[]) => {
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

  const headers = [["No.", "Customer ID", "Nama Lengkap", "Status", "WhatsApp", "Paket Layanan", "Kec/Desa/Alamat", "Tanggal Daftar"]];
  const rows = data.map((item, idx) => [
    idx + 1,
    getCustomerNo(item.Timestamp),
    item["Nama Lengkap"],
    (item.status || "PENGAJUAN").toUpperCase(),
    item["No HP / WA"],
    String(item.Paket || "").split("(")[0].trim(),
    `${item.Kecamatan || "-"} / ${item.Desa || "-"}\n${item["Alamat Pemasangan"] || "-"}`,
    item.Timestamp.split(",")[0]
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

  appendNotes(doc);
  await appendKtpAttachments(doc, data);

  doc.save(`Armedia_Report_${new Date().toLocaleDateString()}.pdf`);
};
