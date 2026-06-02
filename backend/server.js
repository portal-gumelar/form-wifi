import express from 'express';
import cors from 'cors';
import pg from 'pg';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// PostgreSQL Database Connection
const { Pool } = pg;
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'armedia',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

pool.connect().then(async (client) => {
  console.log('Connected to pure PostgreSQL database.');
  try {
    await client.query('ALTER TABLE registrations ADD COLUMN IF NOT EXISTS "NIK" VARCHAR(100)');
    
    // Safely cast dates
    await client.query(`
      ALTER TABLE registrations 
      ALTER COLUMN "Tanggal Aktif" TYPE DATE 
      USING NULLIF(TRIM("Tanggal Aktif"), '')::DATE
    `).catch(e => console.warn("Cast Tanggal Aktif failed:", e.message));

    await client.query(`
      ALTER TABLE registrations 
      ALTER COLUMN "Tanggal Rencana Pasang" TYPE DATE 
      USING NULLIF(TRIM("Tanggal Rencana Pasang"), '')::DATE
    `).catch(e => console.warn("Cast Tanggal Rencana Pasang failed:", e.message));

    // Create Indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations (status)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_registrations_desa ON registrations ("Desa")');
    await client.query('CREATE INDEX IF NOT EXISTS idx_registrations_paket ON registrations ("Paket")');

    console.log('Database schema verified and optimized.');
  } catch (e) {
    console.error('Migration error:', e.message);
  } finally {
    client.release();
  }
}).catch(err => {
  console.error('Failed to connect to pure PostgreSQL:', err.message);
});

// Configure Multer for KTP Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads', 'dokumen-ktp');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate filename based on timestamp
    const timestamp = Math.floor(Date.now() / 1000);
    // file.originalname is fine, but we can also use a clean name
    cb(null, `KTP_${timestamp}_${file.originalname}`);
  }
});
const upload = multer({ storage });

// API ROUTES

// 1. Get all registrations
app.get('/api/registrations', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM registrations ORDER BY id DESC');
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// 2. Insert or Update Registration
app.post('/api/registrations', async (req, res) => {
  try {
    const data = req.body;
    
    const query = `
      INSERT INTO registrations (
        "Timestamp", "NIK", "Nama Lengkap", "No HP / WA", "Alamat Pemasangan",
        "Kecamatan", "Desa", "RW", "RT", "Paket", "status", "Provider Saat Ini",
        "Sumber Info", "Link Google Maps", "Foto KTP", "Persetujuan S&K",
        "Catatan", "Tanggal Aktif", "Tanggal Rencana Pasang", "Waktu Survei"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      )
      ON CONFLICT ("Timestamp") DO UPDATE SET
        "NIK" = EXCLUDED."NIK",
        "Nama Lengkap" = EXCLUDED."Nama Lengkap",
        "No HP / WA" = EXCLUDED."No HP / WA",
        "Alamat Pemasangan" = EXCLUDED."Alamat Pemasangan",
        "Kecamatan" = EXCLUDED."Kecamatan",
        "Desa" = EXCLUDED."Desa",
        "RW" = EXCLUDED."RW",
        "RT" = EXCLUDED."RT",
        "Paket" = EXCLUDED."Paket",
        "status" = EXCLUDED."status",
        "Provider Saat Ini" = EXCLUDED."Provider Saat Ini",
        "Sumber Info" = EXCLUDED."Sumber Info",
        "Link Google Maps" = EXCLUDED."Link Google Maps",
        "Foto KTP" = EXCLUDED."Foto KTP",
        "Persetujuan S&K" = EXCLUDED."Persetujuan S&K",
        "Catatan" = EXCLUDED."Catatan",
        "Tanggal Aktif" = EXCLUDED."Tanggal Aktif",
        "Tanggal Rencana Pasang" = EXCLUDED."Tanggal Rencana Pasang",
        "Waktu Survei" = EXCLUDED."Waktu Survei"
    `;

    const values = [
      data.Timestamp, data.NIK || "", data["Nama Lengkap"], data["No HP / WA"], data["Alamat Pemasangan"],
      data["Kecamatan"], data["Desa"], data["RW"], data["RT"], data["Paket"],
      data["status"], data["Provider Saat Ini"], data["Sumber Info"],
      data["Link Google Maps"], data["Foto KTP"], data["Persetujuan S&K"],
      data["Catatan"], 
      data["Tanggal Aktif"] || null, 
      data["Tanggal Rencana Pasang"] || null, 
      data["Waktu Survei"]
    ];
    
    await pool.query(query, values);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// 3. Update Status only
app.patch('/api/registrations/:timestamp/status', async (req, res) => {
  try {
    const { timestamp } = req.params;
    const { status } = req.body;
    await pool.query('UPDATE registrations SET status = $1 WHERE "Timestamp" = $2', [status, timestamp]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// 4. Delete Registration
app.delete('/api/registrations/:timestamp', async (req, res) => {
  try {
    const { timestamp } = req.params;
    await pool.query('DELETE FROM registrations WHERE "Timestamp" = $1', [timestamp]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// 5. Upload KTP Endpoint (returns public URL)
app.post('/api/upload-ktp', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Construct the public URL
  const publicUrl = `${req.protocol}://${req.get('host')}/uploads/dokumen-ktp/${req.file.filename}`;
  res.json({ publicUrl });
});

app.listen(port, () => {
  console.log(`Backend API running on http://localhost:${port}`);
});
