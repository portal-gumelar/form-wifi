export interface RegistrationData {
  Timestamp: string;
  "Nama Lengkap": string;
  "No HP / WA": string;
  Paket: string;
  "Alamat Pemasangan": string;
  "Provider Saat Ini": string;
  "Sumber Info": string;
  "Link Google Maps"?: string;
  status?: string;
}

export interface DashboardStats {
  packageData: { name: string; value: number }[];
  trendData: { date: string; count: number }[];
  providerData: { name: string; value: number }[];
  sourceData: { name: string; value: number }[];
  statusCounts: Record<string, number>;
}
