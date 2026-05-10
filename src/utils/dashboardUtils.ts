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

  data.forEach(item => {
    const pkg = String(item.Paket || "Unknown").split("(")[0].trim();
    packages[pkg] = (packages[pkg] || 0) + 1;

    const dateStr = item.Timestamp ? item.Timestamp.split(",")[0] : "N/A";
    trends[dateStr] = (trends[dateStr] || 0) + 1;

    const prov = item["Provider Saat Ini"] || "None";
    providers[prov] = (providers[prov] || 0) + 1;

    const src = item["Sumber Info"] || "Direct";
    sources[src] = (sources[src] || 0) + 1;
  });

  const packageData = Object.keys(packages).map(name => ({ name, value: packages[name] }));
  const trendData = Object.keys(trends).map(date => ({ date, count: trends[date] })).slice(-7);
  const providerData = Object.keys(providers).map(name => ({ name, value: providers[name] }));
  const sourceData = Object.keys(sources).map(name => ({ name, value: sources[name] }));

  return { packageData, trendData, providerData, sourceData };
};

export const exportToExcel = (data: RegistrationData[]) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");
  XLSX.writeFile(workbook, `Armedia_Registrations_${new Date().toLocaleDateString()}.xlsx`);
};

export const generatePDFBlobUrl = (data: RegistrationData[]): string => {
  const doc = new jsPDF("l", "mm", "a4");
  const title = "Armedia Net - Registration Report";
  doc.setFontSize(20);
  doc.text(title, 14, 22);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

  const headers = [["No.", "ID", "Name", "WhatsApp", "Package", "Location", "Timestamp"]];
  const rows = data.map((item, idx) => [
    idx + 1,
    getCustomerNo(item.Timestamp),
    item["Nama Lengkap"],
    item["No HP / WA"],
    String(item.Paket || "").split("(")[0],
    item["Alamat Pemasangan"],
    item.Timestamp
  ]);

  autoTable(doc, {
    startY: 40,
    head: headers,
    body: rows,
    theme: "striped",
    headStyles: { fillColor: [26, 45, 143] },
    styles: { fontSize: 8, font: "helvetica" }
  });

  return URL.createObjectURL(doc.output("blob"));
};

export const downloadPDF = (data: RegistrationData[]) => {
  const doc = new jsPDF("l", "mm", "a4");
  const title = "Armedia Net - Registration Report";
  doc.setFontSize(20);
  doc.text(title, 14, 22);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

  const headers = [["No.", "ID", "Name", "WhatsApp", "Package", "Location", "Timestamp"]];
  const rows = data.map((item, idx) => [
    idx + 1,
    getCustomerNo(item.Timestamp),
    item["Nama Lengkap"],
    item["No HP / WA"],
    String(item.Paket || "").split("(")[0],
    item["Alamat Pemasangan"],
    item.Timestamp
  ]);

  autoTable(doc, {
    startY: 40,
    head: headers,
    body: rows,
    theme: "striped",
    headStyles: { fillColor: [26, 45, 143] },
    styles: { fontSize: 8, font: "helvetica" }
  });

  doc.save(`Armedia_Report_${new Date().toLocaleDateString()}.pdf`);
};
