// AUDIT FIX: Script untuk membuat superadmin dengan bcrypt hash yang benar
// Jalankan: node scripts/seed-admin.js
// PENTING: Jalankan sekali saja setelah deploy pertama

import 'dotenv/config';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import readline from 'readline';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(resolve => rl.question(q, resolve));

async function main() {
  console.log('\n=== ARMEDIA.ID - Seed Superadmin ===\n');

  const name     = await ask('Nama superadmin: ');
  const email    = await ask('Email superadmin: ');
  const password = await ask('Password (min 8 char): ');

  if (password.length < 8) {
    console.error('Password terlalu pendek!');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  console.log('\nMembuat user...');

  try {
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, 'superadmin', TRUE)
       ON CONFLICT (email) DO UPDATE SET
         name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash,
         role = 'superadmin',
         is_active = TRUE`,
      [name, email, hash]
    );
    console.log(`\n✅ Superadmin berhasil dibuat: ${email}`);
    console.log('⚠️  HAPUS SCRIPT INI setelah dijalankan di produksi!\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
    rl.close();
  }
}

main();
