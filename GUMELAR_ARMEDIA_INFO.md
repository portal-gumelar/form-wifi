# 🌐 DOKUMENTASI SISTEM PORTAL REGISTRASI & DASHBOARD ARMEDIA.ID
## Panduan Komprehensif Arsitektur & Fitur Aplikasi Web (gumelar.armedia.id)

Dokumen ini mendeskripsikan seluruh halaman, antarmuka, tata letak, logika bisnis, dan fitur operasional yang aktif di aplikasi web **ARMEDIA.ID (gumelar.armedia.id)** milik **PT. Akses Artha Media**. Dokumen ini dirancang sebagai panduan lengkap (*blueprint*) untuk dimasukkan ke model AI (seperti Gemini Pro/Nano) guna menghasilkan visualisasi infografis interaktif.

---

## 1. STRUKTUR UTAMA APLIKASI WEB
Aplikasi web ini memiliki arsitektur modular yang membagi sistem menjadi dua bagian utama:
1. **Antarmuka Publik Pelanggan (Customer Registration Portal)**: Form interaktif bertema premium kelas dunia bagi calon pelanggan baru.
2. **Antarmuka Internal Manajemen (Secure Admin Dashboard)**: Portal pengelola data, peta distribusi geografis, ekspor arsip, dan kontrol otomatisasi pelanggan.

---

## 2. PORTAL PENDAFTARAN PELANGGAN (FRONTEND CUSTOMER PORTAL)

### 2.1. Desain Visual & Branding
* **Tema Warna**: Dominan Navy Gelap (`#0D1655`) yang melambangkan keamanan dan profesionalisme, dipadukan dengan aksen Oranye Terang (`#F47920`) dan Kuning Emas (`#FDB913`) khas ARMEDIA.ID.
* **Header Halaman**: 
  * Logo resmi horizontal **PT. Akses Artha Media** terpasang presisi berdampingan dengan teks judul **ARMEDIA.ID** yang tebal dan modern.
  * Dilengkapi tombol navigasi melayang untuk menggulir otomatis ke bagian form.
* **Banner Promo Interaktif**: Kotak promosi mencolok dengan efek gradasi merah-oranye bercahaya (*glowing animation*): *"PROMO CUKUP MBAYAR WULANANE: Mbayar 115,000 langsung aktif kecepatan 20Mbps."*

### 2.2. Blok Form Registrasi (Step-by-Step UI)
Form dirancang interaktif untuk memandu pengguna awam di desa dengan input yang divalidasi secara real-time:

#### 1. 👤 Data Diri & Kontak
* **Nama Lengkap**: Input nama sesuai dokumen resmi.
* **Nomor HP / WhatsApp**: Input nomor aktif pelanggan.
* **Provider Saat Ini**: Pilihan provider internet yang sedang digunakan saat ini (Indihome, RT/RW Net, None/Belum Pasang) untuk kebutuhan riset pasar tim sales.
* **Sumber Info**: Pilihan dari mana pelanggan mengetahui ARMEDIA.ID (Brosur, Teman, Sosial Media, dll).

#### 2. 🏠 Lokasi & Alamat Pemasangan
* **Kecamatan**: Dropdown pilihan wilayah kecamatan aktif.
* **Desa**: Dropdown dinamis nama desa (hanya menampilkan desa yang jaringannya sudah aktif dan siap pasang).
* **Alamat Lengkap**: Input detail RT, RW, nama jalan, atau patokan rumah.
* **Google Maps**: Pilihan koordinat GPS. Pelanggan dapat menyalin link koordinat rumah mereka untuk mempermudah survei tim teknisi.

#### 3. 📦 Layanan & Biaya Pro-rata (Billing Matrix)
* **Pilihan Paket Layanan**: Tombol berbentuk kartu mini (*pill selector*) berisi kecepatan internet (misal: 10Mbps, 20Mbps, 30Mbps, dll).
* **Kalkulator Biaya Pro-rata**: Panel billing otomatis responsif yang langsung menghitung biaya pasang dan biaya bulanan pertama yang disesuaikan secara adil berdasarkan sisa hari di bulan tersebut (*pro-rata cost*).

#### 4. 🔒 Dokumen KTP & Persetujuan Etika Moralitas
* **Unggah Foto KTP**: Kamera otomatis terbuka pada smartphone untuk mengambil foto fisik KTP (dengan kompresi data maksimal 5MB sebelum diunggah).
* **Prinsip Harmoni & Etika ARMEDIA**:
  * Pesan resmi: *"Di ARMEDIA, kami menjunjung tinggi Etika, Sopan Santun, dan Moralitas."*
  * **Izin Tarik Kabel Tetangga (SOP Mutlak)**: Kotak persetujuan wajib dicentang yang menyatakan bahwa pelanggan telah meminta izin secara sopan jika penarikan kabel fiber optik melintasi atap atau lahan milik tetangga rumah mereka.
* **Syarat & Ketentuan**: Persetujuan berlangganan resmi.

### 2.3. Halaman Sukses (Success Confirmation Screen)
* Menampilkan animasi centang hijau besar berdenyut.
* Tombol **"⚡ Konfirmasi ke Admin via WhatsApp"**: Mengarahkan pelanggan langsung membuka obrolan dengan nomor WhatsApp admin ARMEDIA secara otomatis, mengirimkan pesan draf pendaftaran resmi instan.

---

## 3. PORTAL DASHBOARD INTERNAL ADMINISTRASI (ADMIN PORTAL)

### 3.1. Keamanan Pintu Masuk (Secure Login Gate)
* Administrator wajib memasukkan sandi keamanan khusus.
* Sandi dienkripsi secara satu arah di sisi klien menggunakan algoritme kriptografi tingkat militer **SHA-256 Web Crypto API** sebelum dicocokkan, mencegah kebocoran kredensial.

### 3.2. Panel Statistik Data (Bento Analytics Grid)
Kumpulan grafik dan kartu data analitik performa bisnis ARMEDIA.ID secara visual:
* **Statistik Utama**: Total pelanggan terdaftar, jumlah pendaftar berstatus "PENGAJUAN", grafik pertumbuhan tren pendaftaran harian.
* **Distribusi Pasar**: Grafik donat (*pie chart*) interaktif yang memvisualisasikan paket Mbps terpopuler, rasio persaingan provider kompetitor, dan peta persentase wilayah kecamatan/desa teraktif.
* **Estimasi Pendapatan**: Kalkulasi potensi pendapatan bulanan dan proyeksi biaya instalasi awal.

### 3.3. Konsol Pengelolaan Pesanan (Order Management Console)
* **Sistem Manajemen Status**:
  * Setiap pendaftar dipantau melalui 6 status berwarna kontras:
    1. `PENGAJUAN` (Biru cerah - status bawaan pendaftar baru).
    2. `SURVEY` (Kuning - proses pemeriksaan tiang dan kabel).
    3. `PROSES` (Oranye - instalasi kabel dan modem).
    4. `AKTIF` (Hijau - internet menyala dan siap pakai).
    5. `NON AKTIF` (Merah - pelanggan dinonaktifkan sementara).
    6. `BERHENTI BERLANGGANAN` (Abu-abu - putus kontrak resmi).
* **Fungsi Pencarian & Penyaringan**: Menyaring data pelanggan berdasarkan status, kecepatan Mbps, nama desa, atau nama pelanggan secara instan.
* **Pratinjau KTP**: Pop-up visual yang menampilkan foto KTP pelanggan secara jelas dan detail untuk keperluan verifikasi.

### 3.4. WhatsApp Quick-Template Launcher (Otomasi Chat Sales)
Aksi sekali klik pada baris pelanggan untuk membuka template pesan WhatsApp otomatis yang langsung terisi variabel Nama, Alamat, Desa, dan Paket:
1. **Template 1 (Jadwal Survei)**: Pemberitahuan kunjungan tim teknisi ke lokasi.
2. **Template 2 (Instalasi & Etika Kabel)**: Penjadwalan pasang baru disertai pengingat izin atap tetangga.
3. **Template 3 (Rincian Invoice & Aktivasi)**: Invoice tagihan pertama yang dihitung secara adil (*pro-rata*).

### 3.5. Peta Geografis Pelanggan (Geographical Distribution Map)
* Peta digital berbasis Leaflet interaktif yang menandai lokasi rumah seluruh pelanggan berdasarkan koordinat yang diinput.
* **Glow Marker Status**: Warna pin di peta otomatis berubah sesuai status (misal: Pin biru untuk PENGAJUAN, Pin hijau untuk AKTIF).
* **Navigation Routing**: Klik pada pin membuka kartu informasi ID Pelanggan unik (format: `AMN-[Timestamp]`), Nama, Paket, dan tombol navigasi rute instan ke Google Maps GPS.

### 3.6. Ekspor Arsip Laporan
* **Ekspor Excel**: Mengunduh seluruh database pendaftar secara rapi ke file `.xlsx`.
* **PDF Dossier Pelanggan (Premium)**: Menghasilkan dokumen laporan profesional A4 Landscape:
  * **Halaman 1**: Tabel rekapitulasi utama daftar pelanggan.
  * **Halaman Lampiran**: Secara otomatis menyisipkan halaman lampiran baru untuk setiap pelanggan yang berisi foto dokumen KTP asli mereka yang dibingkai elegan beserta tanda validitas resmi ARMEDIA.ID.

---
*Dokumen spesifikasi arsitektur sistem ini 100% akurat sesuai kode sumber aktif aplikasi web gumelar.armedia.id.*
