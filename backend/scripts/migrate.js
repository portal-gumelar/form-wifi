import 'dotenv/config';
import fs from 'fs';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL is not set in environment variables!");
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: false, // Coolify internal network
});

async function runMigration() {
  console.log('\n=== ARMEDIA.ID - Menjalankan Migrasi Database ===\n');
  try {
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Menjalankan file schema.sql...');
    await pool.query(schemaSql);
    
    console.log('\n✅ Migrasi berhasil! Seluruh tabel (users, subscribers, packages, villages) telah dibuat.');
    console.log('Sekarang Anda bisa menjalankan: npm run seed-admin\n');
  } catch (err) {
    console.error('\n❌ Gagal menjalankan migrasi:', err.message);
  } finally {
    await pool.end();
  }
}

runMigration();
