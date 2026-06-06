-- ============================================================
-- ARMEDIA.ID - FULL DATABASE SCHEMA
-- AUDIT FIX: Menggantikan tabel registrations tunggal dengan
--            skema relasional lengkap sesuai deployment spec
-- ============================================================

-- Extension untuk UUID (opsional, kita pakai SERIAL sebagai PK)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- 1. VILLAGES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS villages (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  area        VARCHAR(100),
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 2. PACKAGES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS packages (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  speed_mbps  INTEGER NOT NULL,
  price       INTEGER NOT NULL,          -- dalam Rupiah
  description TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 3. USERS (Admin / Superadmin)
-- AUDIT FIX: password_hash wajib, tidak ada plaintext
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'admin'
                  CHECK (role IN ('superadmin', 'admin')),
  is_active     BOOLEAN DEFAULT TRUE,
  last_login    TIMESTAMP,
  refresh_token_hash VARCHAR(255),      -- AUDIT FIX: simpan hash refresh token
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 4. SUBSCRIBERS (Pelanggan)
-- AUDIT FIX: Soft delete via deleted_at, foreign keys ke village & package
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscribers (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  address     TEXT,
  phone       VARCHAR(30),
  village_id  INTEGER REFERENCES villages(id) ON DELETE SET NULL,
  package_id  INTEGER REFERENCES packages(id) ON DELETE SET NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'active', 'suspended', 'deleted')),
  joined_at   TIMESTAMP,
  expired_at  TIMESTAMP,
  notes       TEXT,
  created_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  deleted_at  TIMESTAMP,               -- AUDIT FIX: soft delete
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 5. PHOTOS
-- AUDIT FIX: type enum, url_path ke /uploads/
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS photos (
  id            SERIAL PRIMARY KEY,
  subscriber_id INTEGER NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  type          VARCHAR(20) NOT NULL DEFAULT 'other'
                  CHECK (type IN ('ktp', 'house', 'other')),
  filename      VARCHAR(255) NOT NULL,
  url_path      VARCHAR(500) NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 6. NOTIFICATIONS
-- AUDIT FIX: subscriber_id nullable, is_read tracking
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id            SERIAL PRIMARY KEY,
  type          VARCHAR(50) NOT NULL DEFAULT 'info',
  title         VARCHAR(200) NOT NULL,
  message       TEXT NOT NULL,
  subscriber_id INTEGER REFERENCES subscribers(id) ON DELETE SET NULL,
  is_read       BOOLEAN DEFAULT FALSE,
  created_by    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 7. ACTIVITY_LOGS
-- AUDIT FIX: Audit trail semua aksi POST/PUT/DELETE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_logs (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action       VARCHAR(50) NOT NULL,    -- CREATE, UPDATE, DELETE, LOGIN, LOGOUT
  target_table VARCHAR(50),
  target_id    INTEGER,
  description  TEXT,
  ip_address   VARCHAR(45),
  created_at   TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- AUDIT FIX: Indexes untuk query yang sering digunakan
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_subscribers_status
  ON subscribers (status);

CREATE INDEX IF NOT EXISTS idx_subscribers_village_id
  ON subscribers (village_id);

CREATE INDEX IF NOT EXISTS idx_subscribers_package_id
  ON subscribers (package_id);

CREATE INDEX IF NOT EXISTS idx_subscribers_deleted_at
  ON subscribers (deleted_at);

CREATE INDEX IF NOT EXISTS idx_notifications_is_read
  ON notifications (is_read);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at
  ON notifications (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id
  ON activity_logs (user_id);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at
  ON activity_logs (created_at DESC);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Villages (Kecamatan Gumelar)
INSERT INTO villages (name, area) VALUES
  ('GUMELAR',       'Kecamatan Gumelar'),
  ('CIHONJE',       'Kecamatan Gumelar'),
  ('TLAGA',         'Kecamatan Gumelar'),
  ('SAMUDRA',       'Kecamatan Gumelar'),
  ('SAMUDRA KULON', 'Kecamatan Gumelar'),
  ('CILANGKAP',     'Kecamatan Gumelar'),
  ('PANINGKABAN',   'Kecamatan Gumelar'),
  ('KARANG KEMOJING','Kecamatan Gumelar'),
  ('GANCANG',       'Kecamatan Gumelar'),
  ('KEDUNG URANG',  'Kecamatan Gumelar')
ON CONFLICT (name) DO NOTHING;

-- Packages
INSERT INTO packages (name, speed_mbps, price, description, is_active) VALUES
  ('PAKET STARTER',  20, 115000, 'Paket entry-level 20 Mbps unlimited', TRUE),
  ('PAKET BASIC',    30, 150000, 'Paket rumahan 30 Mbps unlimited',     TRUE),
  ('PAKET STANDARD', 50, 200000, 'Paket standar 50 Mbps unlimited',     TRUE),
  ('PAKET PREMIUM',  75, 250000, 'Paket premium 75 Mbps unlimited',     TRUE),
  ('PAKET ULTRA',   100, 350000, 'Paket ultra 100 Mbps unlimited',      TRUE)
ON CONFLICT DO NOTHING;

-- AUDIT FIX: Seed superadmin dengan bcrypt hash
-- Password: superadmin123 (ganti di produksi via UPDATE)
-- Hash ini harus di-generate ulang menggunakan bcrypt rounds 12
-- Gunakan: node -e "const b=require('bcryptjs');console.log(b.hashSync('superadmin123',12))"
-- Hash di bawah adalah PLACEHOLDER - WAJIB diganti sebelum deploy!
INSERT INTO users (name, email, password_hash, role, is_active) VALUES
  (
    'Super Administrator',
    'superadmin@armedia.id',
    '$2b$12$PLACEHOLDER_HASH_REPLACE_BEFORE_PRODUCTION_USE_ONLY_HERE',
    'superadmin',
    TRUE
  )
ON CONFLICT (email) DO NOTHING;
