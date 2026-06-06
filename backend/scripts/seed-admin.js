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
  console.log('\n=== ARMEDIA.ID - Tambah User (Admin / Superadmin) ===\n');

  const name     = await ask('Nama user: ');
  const email    = await ask('Email user: ');
  const password = await ask('Password (min 8 char): ');
  let role       = await ask('Role (superadmin / admin) [default: admin]: ');
  
  if (password.length < 8) {
    console.error('Password terlalu pendek!');
    process.exit(1);
  }

  role = role.trim().toLowerCase() === 'superadmin' ? 'superadmin' : 'admin';

  const hash = await bcrypt.hash(password, 12);
  console.log('\nMembuat user...');

  try {
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, $4, TRUE)
       ON CONFLICT (email) DO UPDATE SET
         name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash,
         role = EXCLUDED.role,
         is_active = TRUE`,
      [name, email, hash, role]
    );
    console.log(`\n✅ User berhasil dibuat:`);
    console.log(`- Email : ${email}`);
    console.log(`- Role  : ${role}`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
    rl.close();
  }
}

main();
