# 🌐 BLUEPRINT ARSITEKTUR DIGITAL ARMEDIA.ID
## Migrasi VPS Coolify, Supabase Database, n8n Workflow, & Otomatisasi Billing MikroTik

---

## 1. PENDAHULUAN & TUJUAN STRATEGIS
Dokumen ini disusun sebagai panduan teknis resmi (*blueprint*) untuk meningkatkan infrastruktur **PT. Akses Artha Media (ARMEDIA.ID)** ke tingkat korporat (*enterprise scale*). 

Dengan memindahkan ekosistem dari Vercel/Google Sheets ke **VPS Mandiri (via Coolify PaaS)**, menggunakan **Supabase** sebagai database, **n8n** sebagai pusat otomasi, dan **MikroTik** sebagai pengontrol akses fisik (PPPoE), ARMEDIA.ID akan memiliki sistem operasional **100% Autopilot** yang hemat biaya, super cepat, aman, dan mandiri.

---

## 2. ARSITEKTUR INFRASTRUKTUR VPS (COOLIFY)
Coolify adalah platform PaaS (*Platform-as-a-Service*) *self-hosted* yang diinstal di dalam VPS Linux (seperti Ubuntu Server). Coolify bertindak sebagai pusat kendali untuk meluncurkan berbagai aplikasi dalam kontainer Docker hanya dengan satu klik.

### 2.1. Spesifikasi Server VPS yang Direkomendasikan
* **OS**: Ubuntu 22.04 LTS atau 24.04 LTS (Clean Install).
* **CPU**: Minimal 2 vCPU (Disarankan 4 vCPU untuk performa tinggi).
* **RAM**: Minimal 4GB RAM (Disarankan 8GB RAM agar Supabase, n8n, dan database berjalan lancar bersamaan).
* **Penyimpanan**: Minimal 40GB SSD / NVMe.
* **Provider Terpercaya**: Biznet GIO, Dewaweb, IDCloudHost, DigitalOcean, atau Linode.

### 2.2. Distribusi Aplikasi di Dalam VPS Coolify
Coolify akan mengisolasi setiap layanan ke dalam Docker container-nya masing-masing secara otomatis:
1. **Container 1: Frontend Web Pendaftaran & Dashboard Admin** (React/Vite).
2. **Container 2: Supabase Stack** (PostgreSQL Database, Auth, & Storage untuk foto KTP).
3. **Container 3: n8n Workflow Automation Engine** (Aktivitas Cron Job & Webhook).
4. **Container 4: Nginx Reverse Proxy** (Mengatur domain SSL HTTPS otomatis untuk semua container).

---

## 3. INTEGRASI DATABASE SUPABASE (MIGRASI DARI GOOGLE SHEETS)
Supabase bertindak sebagai backend PostgreSQL relasional yang sangat cepat. Migrasi dari Google Sheets ke Supabase menjamin performa database tetap instan walau data pelanggan mencapai puluhan ribu.

### 3.1. Struktur Tabel Utama (`registrasi`)
Tabel ini menampung data yang dikirim dari form registrasi:
* `id`: UUID / Integer (Primary Key, Auto-increment).
* `created_at`: Timestamp (Waktu pendaftaran otomatis).
* `customer_id`: Varchar (Format unik: `AMN-XXXXX`).
* `nama_lengkap`: Varchar.
* `no_hp_wa`: Varchar.
* `kecamatan`: Varchar.
* `desa`: Varchar.
* `alamat_pemasangan`: Text.
* `paket_layanan`: Varchar.
* `status_pendaftaran`: Varchar (Default: `"PENGAJUAN"`).
* `foto_ktp_url`: Text (Menyimpan tautan publik gambar KTP yang diunggah ke Supabase Storage).
* `catatan`: Text.

### 3.2. Supabase Storage (Penyimpanan Foto KTP)
Foto KTP tidak lagi disimpan sebagai teks Base64 mentah di database, melainkan diunggah langsung ke **Supabase Storage Bucket** bernama `dokumen-ktp`. Database hanya menyimpan URL tautan gambarnya saja, sehingga query database tetap super cepat dan foto dimuat secara instan di PDF Laporan.

---

## 4. SISTEM OTOMASI WORKFLOW (n8n AUTOMATION)
n8n bertindak sebagai "asisten robot" di latar belakang yang menghubungkan aplikasi web, database, layanan chat WhatsApp, dan router MikroTik.

```text
               +--------------------------------------+
               |  Aktivitas Pelanggan / Cron Schedule  |
               +--------------------------------------+
                                  |
                                  v
                    +---------------------------+
                    |    n8n Webhook / Trigger  |
                    +---------------------------+
                                  |
         +------------------------+------------------------+
         |                        |                        |
         v                        v                        v
+------------------+     +------------------+     +------------------+
| Simpan/Update    |     |  Kirim Notifikasi|     | Kirim Perintah   |
| Database         |     |  WhatsApp (WA)   |     | API ke MikroTik  |
| (Supabase/ERP)   |     +------------------+     +------------------+
+------------------+
```

### 4.1. Alur Kerja 1: Pendaftaran Baru (Real-time Webhook)
* **Trigger**: Calon pelanggan mengirim formulir pendaftaran.
* **Aksi n8n**:
  1. Menerima data pendaftaran baru.
  2. Mengunggah gambar KTP ke Supabase Storage dan menyimpan data teks lengkap ke tabel database.
  3. Mengirim bot notifikasi otomatis ke **Grup Telegram/Discord Tim Teknis ARMEDIA.ID**:
     *"🚨 PENDAFTAR BARU! Nama: Budi, Desa: Gumelar, Paket: Guyub 1. Mohon jadwalkan survei lapangan."*
  4. Mengirim WhatsApp ucapan terima kasih ke nomor HP pelanggan secara instan.

### 4.2. Alur Kerja 2: Penagihan & Isolir Otomatis MikroTik (Cron Job)
* **Trigger**: Setiap tanggal jatuh tempo (misal: Tanggal 20 setiap bulan pukul 00:05 WIB).
* **Aksi n8n**:
  1. Melakukan query ke database Supabase untuk mencari daftar pelanggan aktif dengan status tagihan `"Belum Bayar"`.
  2. Untuk setiap pelanggan menunggak, n8n menghubungi router MikroTik via **MikroTik REST API (Port 8729)** atau **SSH**:
     * Perintah mengubah profil PPPoE menjadi isolir:
       `/ppp secret set [find name="budi_gumelar"] profile="ISOLIR"`
     * Memutus koneksi PPPoE aktif agar modem pelanggan login ulang dengan profil isolir:
       `/interface pppoe-server active remove [find user="budi_gumelar"]`
  3. Mengirimkan pesan WhatsApp otomatis berisi notifikasi isolir layanan dan tautan pembayaran QRIS/Transfer.

### 4.3. Alur Kerja 3: Pembukaan Isolir Instan (Setelah Pembayaran)
* **Trigger**: n8n menerima Webhook sukses pembayaran dari Payment Gateway (Midtrans/Xendit/Duitku) atau konfirmasi manual dari admin di ERPNext.
* **Aksi n8n**:
  1. Mengubah status pembayaran pelanggan di database menjadi `"LUNAS"`.
  2. Menghubungi router MikroTik secara instan (real-time):
     * Mengembalikan profil PPPoE ke kecepatan normal sesuai paket:
       `/ppp secret set [find name="budi_gumelar"] profile="NORMAL_20Mbps"`
     * Memutus koneksi PPPoE aktif agar modem pelanggan login ulang dan langsung mendapatkan internet kecepatan penuh kembali:
       `/interface pppoe-server active remove [find user="budi_gumelar"]`
  3. Mengirim WhatsApp terima kasih: *"Terima kasih Kak Budi! Pembayaran Anda telah terverifikasi. Layanan internet ARMEDIA.ID Anda telah aktif kembali secara otomatis. Selamat berinternet!"*

---

## 5. KEAMANAN INTEGRASI MIKROTIK & VPS
Untuk memastikan router utama MikroTik ARMEDIA.ID aman dari upaya peretasan pihak luar:
1. **IP Whitelisting**: Port REST API MikroTik (`8729`) atau SSH (`22`) dikonfigurasi di menu `/ip service` MikroTik agar **hanya menerima koneksi dari alamat IP VPS Coolify** Anda. Koneksi dari IP lain akan otomatis ditolak.
2. **Kredensial Terenkripsi**: Username dan password administrator MikroTik disimpan dengan aman di dalam fitur *Vault Credentials* n8n yang terenkripsi penuh (AES-256).
3. **Write-Only Permissions**: Akun user di MikroTik yang dibuat khusus untuk n8n hanya diberikan izin akses *read* dan *write* pada modul PPP, tanpa izin untuk mengubah konfigurasi core router lainnya.

---
*Dokumen Blueprint Arsitektur ini disiapkan khusus sebagai panduan standarisasi sistem IT PT. Akses Artha Media.*
