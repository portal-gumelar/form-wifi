export interface RegistrationData {
  Timestamp: string;
  "Nama Lengkap": string;
  "No HP / WA": string;
  Paket: string;
  "Alamat Pemasangan": string;
  "Provider Saat Ini": string;
  "Sumber Info": string;

  // REVISI SOP: Menyinkronkan properti wilayah untuk eliminasi error dasbor
  Kecamatan: string;
  Desa: string;

  // REVISI SOP: Properti opsional untuk manajemen penjadwalan instalasi tim teknis
  "Tanggal Rencana Pasang"?: string;
  "Waktu Survei"?: string;
  "Link Google Maps"?: string;
  status?: string;
  "Foto KTP"?: string;
  "Persetujuan S&K"?: string;
  "Catatan"?: string;
}

export interface DashboardStats {
  packageData: { name: string; value: number }[];
  trendData: { date: string; count: number }[];
  providerData: { name: string; value: number }[];
  sourceData: { name: string; value: number }[];
  statusCounts: Record<string, number>;
  revenueProjection: number;
  regionalData: { name: string; value: number }[];
}