CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
    "Timestamp" VARCHAR(255) UNIQUE NOT NULL,
    "NIK" VARCHAR(100),
    "Nama Lengkap" VARCHAR(255),
    "No HP / WA" VARCHAR(100),
    "Alamat Pemasangan" TEXT,
    "Kecamatan" VARCHAR(100),
    "Desa" VARCHAR(100),
    "RW" VARCHAR(50),
    "RT" VARCHAR(50),
    "Paket" VARCHAR(255),
    "status" VARCHAR(50),
    "Provider Saat Ini" VARCHAR(255),
    "Sumber Info" VARCHAR(255),
    "Link Google Maps" TEXT,
    "Foto KTP" TEXT,
    "Persetujuan S&K" TEXT,
    "Catatan" TEXT,
    "Tanggal Aktif" DATE,
    "Tanggal Rencana Pasang" DATE,
    "Waktu Survei" VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations (status);
CREATE INDEX IF NOT EXISTS idx_registrations_desa ON registrations ("Desa");
CREATE INDEX IF NOT EXISTS idx_registrations_paket ON registrations ("Paket");
