import 'dotenv/config';
import pg from 'pg';
import fetch from 'node-fetch'; // assuming node-fetch is available, or we can use native fetch if Node >= 18

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set in .env");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: false
});

const GAS_API_URL = "https://script.google.com/macros/s/AKfycbysJJibkHgTnACVYXaYCwG1R4JnnQHuxe8tmvEuHWqLjJ0s0bN1DtQuc5_9uv9gOw6EEw/exec";

async function runSync() {
  console.log("Fetching data from Google Sheets...");
  let data;
  try {
    const res = await fetch(GAS_API_URL);
    data = await res.json();
  } catch (err) {
    console.error("Failed to fetch Google Sheets data:", err.message);
    process.exit(1);
  }

  console.log(`Found ${data.length} records in Google Sheets.`);

  // Auto-migrate missing columns first
  try {
    await pool.query('ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS rt VARCHAR(10), ADD COLUMN IF NOT EXISTS rw VARCHAR(10), ADD COLUMN IF NOT EXISTS nik VARCHAR(50), ADD COLUMN IF NOT EXISTS kecamatan VARCHAR(100), ADD COLUMN IF NOT EXISTS current_provider VARCHAR(100), ADD COLUMN IF NOT EXISTS source_info VARCHAR(150), ADD COLUMN IF NOT EXISTS link_google_maps TEXT, ADD COLUMN IF NOT EXISTS tanggal_rencana_pasang VARCHAR(50)');
    console.log("DB Auto-migrated in sync script");
  } catch (err) {
    console.error("DB migration failed:", err.message);
  }

  // Load packages and villages to map IDs
  const { rows: packages } = await pool.query('SELECT * FROM packages');
  const { rows: villages } = await pool.query('SELECT * FROM villages');

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const row of data) {
    try {
      const name = String(row["Nama Lengkap"] || "Tanpa Nama").trim().slice(0, 150);
      let rawPhone = String(row["No HP / WA"] || "").trim();
      let phone = rawPhone.replace(/[^0-9+\-\s]/g, "").trim();
      if (phone.length < 8) phone = "080000000000";

      const address = String(row["Alamat Pemasangan"] || "-").trim();
      const paketStr = String(row["Paket"] || "").toLowerCase();
      const villageStr = String(row["Desa"] || "").toUpperCase();

      // Attempt to find package_id
      let package_id = 1; // Default
      for (const p of packages) {
        if (paketStr.includes(p.name.toLowerCase()) || paketStr.includes(String(p.speed_mbps))) {
          package_id = p.id;
          break;
        }
      }

      // Attempt to find village_id
      let village_id = 1; // Default
      for (const v of villages) {
        if (v.name.toUpperCase() === villageStr) {
          village_id = v.id;
          break;
        }
      }

      const status = row["Status"] === "AKTIF" ? "active" : 
                     row["Status"] === "BATAL" ? "deleted" : 
                     "pending";
                     
      const notes = row["Catatan"] || "";
      const rw = row["RW"] || "";
      const rt = row["RT"] || "";
      const nik = row["NIK"] || "";
      const kecamatan = row["Kecamatan"] || "GUMELAR";
      const current_provider = row["Provider Saat Ini"] || "Belum Pernah Pasang";
      const source_info = row["Sumber Info"] || "";
      const link_google_maps = row["Link Google Maps"] || "";
      const tanggal_rencana_pasang = row["Tanggal Rencana Pasang"] ? String(row["Tanggal Rencana Pasang"]).split("T")[0] : "";
      const created_at = row["Timestamp"] ? new Date(row["Timestamp"]) : new Date();

      // Check if exists
      const { rows: existing } = await pool.query(
        'SELECT id FROM subscribers WHERE phone = $1 AND name = $2',
        [phone, name]
      );

      if (existing.length > 0) {
        // Update the existing record with missing columns instead of skipping
        await pool.query(
          `UPDATE subscribers SET 
             nik = COALESCE(NULLIF(nik, ''), $1),
             kecamatan = COALESCE(NULLIF(kecamatan, ''), $2),
             current_provider = COALESCE(NULLIF(current_provider, ''), $3),
             source_info = COALESCE(NULLIF(source_info, ''), $4),
             link_google_maps = COALESCE(NULLIF(link_google_maps, ''), $5),
             tanggal_rencana_pasang = COALESCE(NULLIF(tanggal_rencana_pasang, ''), $6)
           WHERE id = $7`,
          [nik, kecamatan, current_provider, source_info, link_google_maps, tanggal_rencana_pasang, existing[0].id]
        );
        skipCount++;
        continue;
      }

      await pool.query(
        `INSERT INTO subscribers 
         (name, address, phone, village_id, package_id, status, notes, rt, rw, nik, kecamatan, current_provider, source_info, link_google_maps, tanggal_rencana_pasang, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [name, address, phone, village_id, package_id, status, notes, rt, rw, nik, kecamatan, current_provider, source_info, link_google_maps, tanggal_rencana_pasang, created_at]
      );

      successCount++;
    } catch (err) {
      console.error("Error inserting row:", row["Nama Lengkap"], err.message);
      errorCount++;
    }
  }

  console.log(`Sync complete! Inserted: ${successCount}, Skipped: ${skipCount}, Errors: ${errorCount}`);
  pool.end();
}

runSync();
