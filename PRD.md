# 🌐 ARMEDIA NET REGISTRATION PORTAL & ADMIN SYSTEM
## Product Requirements Document (PRD) & Specifications

---

## 1. PENDAHULUAN & TUJUAN UTAMA
Dokumen Persyaratan Produk (PRD) ini mendefinisikan arsitektur teknis, standar operasional (SOP), dan spesifikasi fitur premium dari **Sistem Pendaftaran & Portal Administrasi ARMEDIA Net** yang dikembangkan khusus untuk **PT. Akses Artha Media**. 

Tujuan utama dari platform ini adalah menyediakan jalur akuisisi pelanggan (sales conversion) yang ramah pengguna, berwawasan etika moralitas, serta didukung oleh portal rekapitulasi data yang kuat, aman, dan dapat dicetak sebagai arsip digital resmi.

---

## 2. SPESIFIKASI FITUR PREMIUM & OPERASIONAL (SOP)

### 2.1. Form Registrasi Pelanggan Baru
* **Status Bawaan (Default Status)**: Setiap data pendaftaran yang masuk dari formulir wajib memiliki status awal `"PENGAJUAN"` (ditandai dengan warna biru cerah).
* **Prinsip Harmoni & Etika (Moralitas)**:
  * Menampilkan pesan komitmen ARMEDIA: *"Di ARMEDIA, kami sangat menjunjung tinggi Etika, Sopan Santun, dan Moralitas."*
  * Pengguna wajib menyetujui syarat penarikan kabel melintasi lahan tetangga (*"Ijin Tarik Kabel ke Tetangga"*) sebelum mengirimkan formulir.
* **Pricing Billing Matrix**:
  * Pilihan paket terintegrasi secara dinamis antara pill selector kecepatan Mbps dengan form input.
  * Mendukung kalkulasi billing pro-rata bulan pertama secara transparan pada perangkat mobile maupun desktop (responsif).
* **Unggah Dokumen**: Mewajibkan pengambilan/unggahan foto KTP (Base64) dengan batas maksimal 5MB.

### 2.2. WhatsApp Quick-Template Launcher
* **Deskripsi**: Aksi klik ikon WhatsApp resmi (SVG brand logo) di kolom tabel tidak hanya membuka chat kosong, melainkan memicu modal interaktif dengan 3 pilihan draf pesan:
  1. **Konfirmasi & Jadwal Survei Jalur**: Notifikasi penjadwalan survei lokasi rumah.
  2. **Jadwal Instalasi & Etika Kabel**: Penjadwalan instalasi modem beserta pengingat etika izin melintasi lahan tetangga.
  3. **Rincian Tagihan Pro-rata & Aktivasi**: Pengumuman internet aktif disertai rincian biaya billing pro-rata pertama.
* **Integrasi Data**: Variabel nama pendaftar `{Nama}`, `{Alamat}`, `{Desa}`, dan `{Paket}` otomatis terisi sesuai baris pelanggan yang diklik.

### 2.3. Badge Notifikasi Pengajuan Baru (Sidebar)
* **Status Real-time**: Sidebar admin mendeteksi jumlah baris yang memiliki status `"PENGAJUAN"`.
* **Indikator Visual**:
  * **Sidebar Terbuka**: Badge lingkaran oranye berdenyut (`animate-pulse`) menampilkan angka jumlah pengajuan aktif di samping menu "KELOLA PESANAN".
  * **Sidebar Tertutup**: Dot kecil oranye menyala di pojok kanan ikon menu sebagai petunjuk cepat.

### 2.4. Google Maps Routing & Geo-Distribution
* **Peta Interaktif**: Menampilkan koordinat pendaftar menggunakan marker dinamis.
* **Premium Popup Card**: Klik marker memicu pop-up berisi ID Pelanggan unik (format: `AMN-[5-digit-Timestamp]`), Nama, status badge, paket badge, dan tombol **"📍 Buka Rute GPS"**.
* **GPS Navigasi**: Tombol rute mengarahkan tim teknisi lapangan langsung ke aplikasi navigasi Google Maps secara instan.

### 2.5. Dossier PDF dengan Lampiran KTP Otomatis
* **Halaman Master**: Menghasilkan daftar rekapitulasi tabel grid bersih di halaman pertama.
* **Dossier Halaman KTP**: Untuk setiap baris pelanggan yang memiliki unggahan berkas foto KTP (Base64), sistem secara otomatis menambahkan halaman baru (page break) di bagian akhir PDF:
  * Bingkai oranye artistik.
  * Header Dossier Arsip Resmi (Nama, ID, WA, Alamat, Desa).
  * Cetak foto KTP resolusi tinggi di tengah dengan bingkai bayangan abu-abu (*framing border card*).
  * Watermark kaki keabsahan dokumen ARMEDIA.

---

## 3. INTEGRASI DATABASE GOOGLE SHEETS
* **Apps Script Endpoint**: Pengiriman form menggunakan metode HTTP POST ke Google Apps Script (GAS) Web App.
* **Auto-Column Generation**: Sistem backend GAS dikonfigurasi secara dinamis. Jika ada parameter kunci baru yang dikirim oleh form frontend (misal: `"Persetujuan S&K"` atau `"Catatan"`), sistem GAS otomatis membuat dan menyisipkan kolom baru tersebut pada Baris 1 spreadsheet pada pengiriman pertama tanpa merusak baris yang sudah ada.

---

## 4. KEAMANAN AKSES ADMINISTRATOR
* **SHA-256 Hashing**: Login administrator diverifikasi menggunakan metode enkripsi satu arah SHA-256 via Web Crypto API (`crypto.subtle.digest`).
* **Keamanan Kredensial**: Password admin tidak disimpan dalam bentuk teks biasa (plain text) di dalam source code, melainkan dicocokkan dengan hash aman (`240be518fabd...` untuk sandi default), menjamin perlindungan maksimal dari kebocoran sisi klien.

---

## 5. STANDAR OPERASIONAL PROSEDUR (SOP) FOLDER & KODE
Aplikasi wajib mematuhi standar arsitektur **Clean & Component-Driven React/Vite**:
1. **Pages (`src/pages/`)**: Berisi container halaman utama yang mengontrol *state data*.
2. **Components (`src/components/`)**: Berisi komponen visual terisolasi.
3. **Constants (`src/constants/`)**: Berisi semua konfigurasi statis (paket, desa). Dilarang menulis hardcode di dalam file UI.
4. **Utils (`src/utils/`)**: Berisi fungsi logika murni (PDF & Excel) agar mudah diuji secara independen.

---
*Dokumen ini merupakan panduan keabsahan produk resmi dan spesifikasi rujukan tim engineering PT. Akses Artha Media.*
