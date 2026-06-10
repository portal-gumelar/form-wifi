// RT/RW structure
export interface RwRt {
  id: string;
  rw: string;
  rt: string;
  customerCount: number;
  fundAmount: number; // 2000 per customer
}

// Village structure with RT/RW
export interface Village {
  id: string;
  name: string;
  customerCount: number;
  fundAmount: number; // 2000 per customer
  rws: RwRt[];
  createdAt: string;
}

// Village Fund Summary
export interface VillageFundSummary {
  totalCustomers: number;
  totalVillageFund: number;
  totalRwRtFund: number;
  grandTotal: number;
}

export interface RegistrationData {
  id?: number; // PostgreSQL primary key (integer auto-increment)
  timestamp: string;
  nik?: string;
  nama_lengkap: string;
  no_hp_wa: string;
  paket: string;
  alamat_pemasangan: string;
  provider_saat_ini: string;
  sumber_info: string;

  // REVISI SOP: Menyinkronkan properti wilayah untuk eliminasi error dasbor
  kecamatan: string;
  desa: string;
  village_id?: number;
  package_id?: number;
  
  // Dana Desa fields
  rw?: string;
  rt?: string;

  // REVISI SOP: Properti opsional untuk manajemen penjadwalan instalasi tim teknis
  tanggal_rencana_pasang?: string;
  waktu_survei?: string;
  link_google_maps?: string;
  status?: string;
  foto_ktp?: string;
  persetujuan_sk?: string;
  catatan?: string;
  tanggal_aktif?: string;
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
