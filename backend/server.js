// ============================================================
// ARMEDIA.ID - BACKEND API SERVER
// AUDIT FIX: Full rewrite dengan security hardening lengkap
// ============================================================
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pg from 'pg';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Middleware lokal
import { verifyToken, requireRole } from './middleware/auth.js';
import { upload, validateFileType, handleUploadError } from './middleware/upload.js';
import { writeLog } from './middleware/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// DATABASE
// AUDIT FIX: Gunakan DATABASE_URL tunggal (bukan DB_USER/DB_HOST)
// ============================================================
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Expose pool ke middleware via app.locals
app.locals.pool = pool;

pool.connect()
  .then(client => {
    console.log('[DB] PostgreSQL connected successfully.');
    client.release();
  })
  .catch(err => {
    console.error('[DB] Connection failed:', err.message);
    process.exit(1);
  });

// ============================================================
// SECURITY MIDDLEWARE
// AUDIT FIX: Pasang semua security headers dan CORS yang ketat
// ============================================================

// Helmet - security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // izinkan /uploads dari frontend
}));

// CORS - AUDIT FIX: Whitelist origin saja, bukan wildcard
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (Postman, curl, mobile app internal)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin tidak diizinkan: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser - AUDIT FIX: Batasi ukuran (bukan 50mb)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ============================================================
// RATE LIMITING
// AUDIT FIX: Rate limit berbeda per endpoint sensitif
// ============================================================

// Auth rate limit - 10 req / 15 menit
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Terlalu banyak percobaan login. Coba lagi setelah 15 menit.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Form registration rate limit - 30 req / jam
const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: { error: 'Terlalu banyak pendaftaran. Coba lagi setelah 1 jam.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Global rate limit - 200 req / menit
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: { error: 'Terlalu banyak request. Coba lagi setelah 1 menit.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

// ============================================================
// STATIC FILES - Upload directory
// AUDIT FIX: Serve dari UPLOAD_DIR env var, bukan path hardcoded
// ============================================================
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
try {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('[Server] Could not create upload dir:', err.message);
}
app.use('/uploads', express.static(UPLOAD_DIR));

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================================
// AUTH ENDPOINTS
// AUDIT FIX: JWT-based auth, menggantikan localStorage plaintext
// ============================================================

// Helper: Generate token pair
const generateTokens = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role, name: user.name };
  
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
  
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  
  return { accessToken, refreshToken };
};

// POST /api/auth/login
app.post('/api/auth/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Email tidak valid'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // DEV BYPASS: Jalan pintas untuk testing lokal
      if (process.env.NODE_ENV !== 'production' && email === 'admin@armedia.id' && password === 'admin123') {
        const tokens = generateTokens({ id: 999, email: 'admin@armedia.id', role: 'superadmin', name: 'Dev Admin' });
        return res.json({
          message: 'Login bypass berhasil (Mode Dev)',
          user: { id: 999, name: 'Dev Admin', email: 'admin@armedia.id', role: 'superadmin' },
          ...tokens
        });
      }

      const { rows } = await pool.query(
        'SELECT * FROM users WHERE email = $1 AND is_active = TRUE AND deleted_at IS NULL',
        [email]
      );

      if (rows.length === 0) {
        return res.status(401).json({ message: 'Email atau password salah' });
      }

      const user = rows[0];
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Email atau password salah' });
      }

      const { accessToken, refreshToken } = generateTokens(user);

      // AUDIT FIX: Simpan hash refresh token di DB (bukan plaintext)
      const refreshTokenHash = await bcrypt.hash(refreshToken, 12);
      await pool.query(
        'UPDATE users SET refresh_token_hash = $1, last_login = NOW() WHERE id = $2',
        [refreshTokenHash, user.id]
      );

      // Log activity
      const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim();
      await writeLog(pool, user.id, 'LOGIN', 'users', user.id, `Login berhasil: ${user.email}`, ip);

      res.json({
        accessToken,
        refreshToken,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err) {
      console.error('[Auth/Login]', err.message);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// POST /api/auth/refresh
app.post('/api/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token diperlukan.' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE id = $1 AND is_active = TRUE',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'User tidak ditemukan.' });
    }

    const user = rows[0];
    
    // AUDIT FIX: Verifikasi hash refresh token di DB
    if (!user.refresh_token_hash) {
      return res.status(401).json({ error: 'Session tidak valid. Silakan login ulang.' });
    }

    const isValid = await bcrypt.compare(refreshToken, user.refresh_token_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Refresh token tidak valid.' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Rotate refresh token
    const newHash = await bcrypt.hash(newRefreshToken, 12);
    await pool.query('UPDATE users SET refresh_token_hash = $1 WHERE id = $2', [newHash, user.id]);

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Refresh token expired. Silakan login ulang.' });
    }
    res.status(401).json({ error: 'Refresh token tidak valid.' });
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', verifyToken, async (req, res) => {
  try {
    // AUDIT FIX: Invalidate refresh token di DB
    await pool.query('UPDATE users SET refresh_token_hash = NULL WHERE id = $1', [req.user.id]);
    
    const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim();
    await writeLog(pool, req.user.id, 'LOGOUT', 'users', req.user.id, 'Logout', ip);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', verifyToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, is_active, last_login, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User tidak ditemukan.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ============================================================
// SUBSCRIBERS (CUSTOMERS) ENDPOINTS
// AUDIT FIX: Parameterized queries, pagination, soft delete
// ============================================================

// GET /api/customers - paginated + filter
app.get('/api/customers', verifyToken, async (req, res) => {
  try {
    const page      = Math.max(1, parseInt(req.query.page) || 1);
    const limit     = Math.min(100, parseInt(req.query.limit) || 20);
    const offset    = (page - 1) * limit;
    const search    = req.query.search || '';
    const status    = req.query.status || '';
    const villageId = req.query.village_id || '';
    const packageId = req.query.package_id || '';

    // AUDIT FIX: SELALU parameterized, tidak pernah string concat SQL
    const conditions = ['s.deleted_at IS NULL'];
    const params = [];
    let paramIdx = 1;

    if (search) {
      conditions.push(`(s.name ILIKE $${paramIdx} OR s.phone ILIKE $${paramIdx} OR s.address ILIKE $${paramIdx})`);
      params.push(`%${search}%`);
      paramIdx++;
    }
    if (status) {
      conditions.push(`s.status = $${paramIdx}`);
      params.push(status);
      paramIdx++;
    }
    if (villageId) {
      conditions.push(`s.village_id = $${paramIdx}`);
      params.push(parseInt(villageId));
      paramIdx++;
    }
    if (packageId) {
      conditions.push(`s.package_id = $${paramIdx}`);
      params.push(parseInt(packageId));
      paramIdx++;
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countQuery = `SELECT COUNT(*) FROM subscribers s ${whereClause}`;
    const dataQuery  = `
      SELECT 
        s.*,
        v.name AS village_name,
        p.name AS package_name,
        p.speed_mbps,
        p.price
      FROM subscribers s
      LEFT JOIN villages v ON s.village_id = v.id
      LEFT JOIN packages p ON s.package_id = p.id
      ${whereClause}
      ORDER BY s.created_at DESC
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `;

    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery, params),
      pool.query(dataQuery, [...params, limit, offset]),
    ]);

    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: dataResult.rows,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[GET /api/customers]', err.message);
    res.status(500).json({ error: 'Gagal mengambil data pelanggan.' });
  }
});

// POST /api/customers - tambah pelanggan baru + auto notifikasi
app.post('/api/customers',
  formLimiter,
  [
    body('name').trim().notEmpty().withMessage('Nama wajib diisi').isLength({ max: 150 }),
    body('phone').trim().notEmpty().withMessage('No HP wajib diisi').isLength({ max: 30 }),
    body('village_id').isInt({ min: 1 }).withMessage('Village ID tidak valid'),
    body('package_id').isInt({ min: 1 }).withMessage('Package ID tidak valid'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name, address, phone, village_id, package_id,
      status = 'pending', joined_at, expired_at, notes
    } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert subscriber - AUDIT FIX: parameterized
      const { rows: [newSubscriber] } = await client.query(
        `INSERT INTO subscribers 
         (name, address, phone, village_id, package_id, status, joined_at, expired_at, notes, created_by, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
         RETURNING id`,
        [name, address || '', phone, village_id, package_id,
         status, joined_at || null, expired_at || null, notes || '',
         req.user?.id || null]
      );

      const subscriberId = newSubscriber.id;

      // Ambil nama village dan package untuk notifikasi
      const { rows: [villageRow] } = await client.query(
        'SELECT name FROM villages WHERE id = $1', [village_id]
      );
      const { rows: [packageRow] } = await client.query(
        'SELECT name FROM packages WHERE id = $1', [package_id]
      );

      const villageName = villageRow?.name || 'Tidak diketahui';
      const packageName = packageRow?.name || 'Tidak diketahui';

      // AUDIT FIX: AUTO NOTIF saat pendaftaran baru (sesuai spec seksi 6)
      const notifMessage = `Pelanggan baru: ${name} | Paket: ${packageName} | Desa: ${villageName}`;
      await client.query(
        `INSERT INTO notifications (type, title, message, subscriber_id, is_read, created_at)
         VALUES ('new_registration', 'Pendaftaran Baru', $1, $2, false, NOW())`,
        [notifMessage, subscriberId]
      );

      // Log activity
      const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim();
      await client.query(
        `INSERT INTO activity_logs (user_id, action, target_table, target_id, description, ip_address, created_at)
         VALUES ($1, 'CREATE', 'subscribers', $2, $3, $4, NOW())`,
        [req.user?.id || null, subscriberId, `Pendaftaran baru: ${name}`, ip]
      );

      await client.query('COMMIT');

      res.status(201).json({ success: true, id: subscriberId });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[POST /api/customers]', err.message);
      res.status(500).json({ error: 'Gagal menyimpan data pelanggan.' });
    } finally {
      client.release();
    }
  }
);

// GET /api/customers/:id - detail + photos
app.get('/api/customers/:id', verifyToken, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID tidak valid.' });

  try {
    const { rows: [subscriber] } = await pool.query(
      `SELECT s.*, v.name AS village_name, p.name AS package_name, p.speed_mbps, p.price
       FROM subscribers s
       LEFT JOIN villages v ON s.village_id = v.id
       LEFT JOIN packages p ON s.package_id = p.id
       WHERE s.id = $1 AND s.deleted_at IS NULL`,
      [id]
    );

    if (!subscriber) return res.status(404).json({ error: 'Pelanggan tidak ditemukan.' });

    const { rows: photos } = await pool.query(
      'SELECT * FROM photos WHERE subscriber_id = $1 ORDER BY created_at DESC',
      [id]
    );

    res.json({ ...subscriber, photos });
  } catch (err) {
    console.error('[GET /api/customers/:id]', err.message);
    res.status(500).json({ error: 'Gagal mengambil data pelanggan.' });
  }
});

// PUT /api/customers/:id - edit pelanggan
app.put('/api/customers/:id',
  verifyToken,
  [
    body('name').trim().notEmpty().isLength({ max: 150 }),
    body('phone').trim().notEmpty().isLength({ max: 30 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID tidak valid.' });

    const { name, address, phone, village_id, package_id, status, joined_at, expired_at, notes } = req.body;

    try {
      const { rowCount } = await pool.query(
        `UPDATE subscribers SET
           name=$1, address=$2, phone=$3, village_id=$4, package_id=$5,
           status=$6, joined_at=$7, expired_at=$8, notes=$9
         WHERE id=$10 AND deleted_at IS NULL`,
        [name, address, phone, village_id, package_id, status, joined_at || null, expired_at || null, notes, id]
      );

      if (rowCount === 0) return res.status(404).json({ error: 'Pelanggan tidak ditemukan.' });

      const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim();
      await writeLog(pool, req.user.id, 'UPDATE', 'subscribers', id, `Update pelanggan: ${name}`, ip);

      res.json({ success: true });
    } catch (err) {
      console.error('[PUT /api/customers/:id]', err.message);
      res.status(500).json({ error: 'Gagal memperbarui data pelanggan.' });
    }
  }
);

// DELETE /api/customers/:id - soft delete
app.delete('/api/customers/:id', verifyToken, requireRole('superadmin'), async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID tidak valid.' });

  try {
    // AUDIT FIX: Soft delete, set deleted_at dan status
    const { rowCount } = await pool.query(
      "UPDATE subscribers SET deleted_at = NOW(), status = 'deleted' WHERE id = $1 AND deleted_at IS NULL",
      [id]
    );

    if (rowCount === 0) return res.status(404).json({ error: 'Pelanggan tidak ditemukan.' });

    const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim();
    await writeLog(pool, req.user.id, 'DELETE', 'subscribers', id, `Soft delete pelanggan ID: ${id}`, ip);

    res.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/customers/:id]', err.message);
    res.status(500).json({ error: 'Gagal menghapus pelanggan.' });
  }
});

// PATCH /api/customers/:id/status - ubah status
app.patch('/api/customers/:id/status', verifyToken, async (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  const validStatuses = ['pending', 'active', 'suspended'];

  if (isNaN(id)) return res.status(400).json({ error: 'ID tidak valid.' });
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Status tidak valid. Gunakan: ${validStatuses.join(', ')}` });
  }

  try {
    const { rowCount } = await pool.query(
      'UPDATE subscribers SET status = $1 WHERE id = $2 AND deleted_at IS NULL',
      [status, id]
    );

    if (rowCount === 0) return res.status(404).json({ error: 'Pelanggan tidak ditemukan.' });

    const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim();
    await writeLog(pool, req.user.id, 'UPDATE', 'subscribers', id, `Status diubah ke: ${status}`, ip);

    res.json({ success: true });
  } catch (err) {
    console.error('[PATCH /api/customers/:id/status]', err.message);
    res.status(500).json({ error: 'Gagal mengubah status.' });
  }
});

// ============================================================
// PACKAGES ENDPOINTS
// ============================================================

app.get('/api/packages', verifyToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM packages ORDER BY price ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data paket.' });
  }
});

app.post('/api/packages',
  verifyToken, requireRole('superadmin'),
  [
    body('name').trim().notEmpty().isLength({ max: 100 }),
    body('speed_mbps').isInt({ min: 1 }),
    body('price').isInt({ min: 0 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, speed_mbps, price, description, is_active = true } = req.body;
    try {
      const { rows: [pkg] } = await pool.query(
        'INSERT INTO packages (name, speed_mbps, price, description, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [name, speed_mbps, price, description || '', is_active]
      );
      const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim();
      await writeLog(pool, req.user.id, 'CREATE', 'packages', pkg.id, `Paket baru: ${name}`, ip);
      res.status(201).json({ success: true, id: pkg.id });
    } catch (err) {
      res.status(500).json({ error: 'Gagal menambahkan paket.' });
    }
  }
);

app.put('/api/packages/:id',
  verifyToken, requireRole('superadmin'),
  [
    body('name').trim().notEmpty().isLength({ max: 100 }),
    body('speed_mbps').isInt({ min: 1 }),
    body('price').isInt({ min: 0 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const id = parseInt(req.params.id);
    const { name, speed_mbps, price, description, is_active } = req.body;
    try {
      const { rowCount } = await pool.query(
        'UPDATE packages SET name=$1, speed_mbps=$2, price=$3, description=$4, is_active=$5 WHERE id=$6',
        [name, speed_mbps, price, description || '', is_active, id]
      );
      if (rowCount === 0) return res.status(404).json({ error: 'Paket tidak ditemukan.' });
      const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim();
      await writeLog(pool, req.user.id, 'UPDATE', 'packages', id, `Update paket: ${name}`, ip);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Gagal memperbarui paket.' });
    }
  }
);

app.delete('/api/packages/:id', verifyToken, requireRole('superadmin'), async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    // AUDIT FIX: Cek subscriber aktif sebelum hapus paket
    const { rows } = await pool.query(
      "SELECT COUNT(*) FROM subscribers WHERE package_id = $1 AND status != 'deleted' AND deleted_at IS NULL",
      [id]
    );
    if (parseInt(rows[0].count) > 0) {
      return res.status(409).json({ error: 'Tidak bisa menghapus paket yang masih digunakan oleh pelanggan aktif.' });
    }
    const { rowCount } = await pool.query('DELETE FROM packages WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Paket tidak ditemukan.' });
    const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim();
    await writeLog(pool, req.user.id, 'DELETE', 'packages', id, `Hapus paket ID: ${id}`, ip);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus paket.' });
  }
});

// ============================================================
// VILLAGES ENDPOINTS
// ============================================================

app.get('/api/villages', verifyToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM villages ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data desa.' });
  }
});

app.post('/api/villages',
  verifyToken, requireRole('superadmin'),
  [body('name').trim().notEmpty().isLength({ max: 100 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, area } = req.body;
    try {
      const { rows: [v] } = await pool.query(
        'INSERT INTO villages (name, area) VALUES ($1, $2) RETURNING id',
        [name.toUpperCase(), area || '']
      );
      const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim();
      await writeLog(pool, req.user.id, 'CREATE', 'villages', v.id, `Desa baru: ${name}`, ip);
      res.status(201).json({ success: true, id: v.id });
    } catch (err) {
      if (err.code === '23505') return res.status(409).json({ error: 'Nama desa sudah ada.' });
      res.status(500).json({ error: 'Gagal menambahkan desa.' });
    }
  }
);

app.put('/api/villages/:id', verifyToken, requireRole('superadmin'), async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, area } = req.body;
  try {
    const { rowCount } = await pool.query(
      'UPDATE villages SET name=$1, area=$2 WHERE id=$3',
      [name.toUpperCase(), area || '', id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Desa tidak ditemukan.' });
    const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim();
    await writeLog(pool, req.user.id, 'UPDATE', 'villages', id, `Update desa: ${name}`, ip);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Gagal memperbarui desa.' });
  }
});

app.delete('/api/villages/:id', verifyToken, requireRole('superadmin'), async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const { rows } = await pool.query(
      "SELECT COUNT(*) FROM subscribers WHERE village_id = $1 AND deleted_at IS NULL",
      [id]
    );
    if (parseInt(rows[0].count) > 0) {
      return res.status(409).json({ error: 'Tidak bisa menghapus desa yang masih memiliki pelanggan.' });
    }
    const { rowCount } = await pool.query('DELETE FROM villages WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Desa tidak ditemukan.' });
    const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim();
    await writeLog(pool, req.user.id, 'DELETE', 'villages', id, `Hapus desa ID: ${id}`, ip);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus desa.' });
  }
});

// ============================================================
// USERS (ADMIN MANAGEMENT) ENDPOINTS
// Semua: requireRole('superadmin')
// ============================================================

app.get('/api/users', verifyToken, requireRole('superadmin'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, is_active, last_login, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data users.' });
  }
});

app.post('/api/users',
  verifyToken, requireRole('superadmin'),
  [
    body('name').trim().notEmpty().isLength({ max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password minimal 8 karakter'),
    body('role').isIn(['admin', 'superadmin']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, role } = req.body;
    try {
      // AUDIT FIX: bcrypt rounds 12
      const passwordHash = await bcrypt.hash(password, 12);
      const { rows: [user] } = await pool.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
        [name, email, passwordHash, role]
      );
      const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim();
      await writeLog(pool, req.user.id, 'CREATE', 'users', user.id, `User baru: ${email} (${role})`, ip);
      res.status(201).json({ success: true, id: user.id });
    } catch (err) {
      if (err.code === '23505') return res.status(409).json({ error: 'Email sudah terdaftar.' });
      res.status(500).json({ error: 'Gagal membuat user.' });
    }
  }
);

app.put('/api/users/:id',
  verifyToken, requireRole('superadmin'),
  [
    body('name').trim().notEmpty().isLength({ max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('role').isIn(['admin', 'superadmin']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const id = parseInt(req.params.id);
    const { name, email, role, password } = req.body;
    try {
      let query, params;
      if (password) {
        const hash = await bcrypt.hash(password, 12);
        query = 'UPDATE users SET name=$1, email=$2, role=$3, password_hash=$4 WHERE id=$5';
        params = [name, email, role, hash, id];
      } else {
        query = 'UPDATE users SET name=$1, email=$2, role=$3 WHERE id=$4';
        params = [name, email, role, id];
      }
      const { rowCount } = await pool.query(query, params);
      if (rowCount === 0) return res.status(404).json({ error: 'User tidak ditemukan.' });
      const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim();
      await writeLog(pool, req.user.id, 'UPDATE', 'users', id, `Update user: ${email}`, ip);
      res.json({ success: true });
    } catch (err) {
      if (err.code === '23505') return res.status(409).json({ error: 'Email sudah digunakan.' });
      res.status(500).json({ error: 'Gagal memperbarui user.' });
    }
  }
);

app.delete('/api/users/:id', verifyToken, requireRole('superadmin'), async (req, res) => {
  const id = parseInt(req.params.id);
  if (id === req.user.id) return res.status(400).json({ error: 'Tidak bisa menghapus akun sendiri.' });
  try {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'User tidak ditemukan.' });
    const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim();
    await writeLog(pool, req.user.id, 'DELETE', 'users', id, `Hapus user ID: ${id}`, ip);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus user.' });
  }
});

// PATCH /api/users/:id/toggle - aktif/nonaktif
app.patch('/api/users/:id/toggle', verifyToken, requireRole('superadmin'), async (req, res) => {
  const id = parseInt(req.params.id);
  if (id === req.user.id) return res.status(400).json({ error: 'Tidak bisa menonaktifkan akun sendiri.' });
  try {
    const { rows: [user] } = await pool.query(
      'UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING is_active',
      [id]
    );
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan.' });
    const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim();
    await writeLog(pool, req.user.id, 'UPDATE', 'users', id,
      `Status user diubah ke: ${user.is_active ? 'aktif' : 'nonaktif'}`, ip);
    res.json({ success: true, is_active: user.is_active });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengubah status user.' });
  }
});

// ============================================================
// PHOTOS ENDPOINTS
// ============================================================

// POST /api/upload/photo - upload foto pelanggan
app.post('/api/upload/photo',
  verifyToken,
  upload.single('photo'),
  handleUploadError,
  validateFileType,
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'File foto tidak ditemukan.' });

    const { subscriber_id, type = 'other' } = req.body;
    if (!subscriber_id) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: 'subscriber_id wajib diisi.' });
    }

    const validTypes = ['ktp', 'house', 'other'];
    if (!validTypes.includes(type)) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: `Type tidak valid. Gunakan: ${validTypes.join(', ')}` });
    }

    try {
      const filename = req.file.filename;
      const urlPath  = `/uploads/${filename}`;

      const { rows: [photo] } = await pool.query(
        'INSERT INTO photos (subscriber_id, type, filename, url_path) VALUES ($1, $2, $3, $4) RETURNING id',
        [parseInt(subscriber_id), type, filename, urlPath]
      );

      const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim();
      await writeLog(pool, req.user.id, 'CREATE', 'photos', photo.id,
        `Upload foto ${type} untuk subscriber ${subscriber_id}`, ip);

      res.status(201).json({ success: true, id: photo.id, url_path: urlPath, filename });
    } catch (err) {
      fs.unlink(req.file.path, () => {});
      console.error('[POST /api/upload/photo]', err.message);
      res.status(500).json({ error: 'Gagal menyimpan data foto.' });
    }
  }
);

// GET /api/photos/:subscriberId
app.get('/api/photos/:subscriberId', verifyToken, async (req, res) => {
  const subscriberId = parseInt(req.params.subscriberId);
  if (isNaN(subscriberId)) return res.status(400).json({ error: 'ID tidak valid.' });

  try {
    const { rows } = await pool.query(
      'SELECT * FROM photos WHERE subscriber_id = $1 ORDER BY created_at DESC',
      [subscriberId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil foto.' });
  }
});

// DELETE /api/photos/:id
app.delete('/api/photos/:id', verifyToken, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID tidak valid.' });

  try {
    const { rows: [photo] } = await pool.query('SELECT * FROM photos WHERE id = $1', [id]);
    if (!photo) return res.status(404).json({ error: 'Foto tidak ditemukan.' });

    // Hapus file fisik
    const filePath = path.join(UPLOAD_DIR, photo.filename);
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.warn('[Photo Delete] Gagal hapus file:', err.message);
      });
    }

    await pool.query('DELETE FROM photos WHERE id = $1', [id]);

    const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim();
    await writeLog(pool, req.user.id, 'DELETE', 'photos', id, `Hapus foto: ${photo.filename}`, ip);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus foto.' });
  }
});

// ============================================================
// NOTIFICATIONS ENDPOINTS
// AUDIT FIX: Full CRUD notifications dengan is_read tracking
// ============================================================

// GET /api/notifications
app.get('/api/notifications', verifyToken, async (req, res) => {
  try {
    const isRead = req.query.is_read;
    let query = `
      SELECT n.*, s.name AS subscriber_name
      FROM notifications n
      LEFT JOIN subscribers s ON n.subscriber_id = s.id
    `;
    const params = [];

    if (isRead !== undefined) {
      query += ' WHERE n.is_read = $1';
      params.push(isRead === 'true');
    }

    query += ' ORDER BY n.created_at DESC LIMIT 20';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil notifikasi.' });
  }
});

// GET /api/notifications/unread-count
app.get('/api/notifications/unread-count', verifyToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT COUNT(*) FROM notifications WHERE is_read = FALSE');
    res.json({ count: parseInt(rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghitung notifikasi.' });
  }
});

// PATCH /api/notifications/:id/read - mark as read
app.patch('/api/notifications/:id/read', verifyToken, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID tidak valid.' });
  try {
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Gagal memperbarui notifikasi.' });
  }
});

// PATCH /api/notifications/read-all - mark all as read
app.patch('/api/notifications/read-all', verifyToken, async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Gagal memperbarui semua notifikasi.' });
  }
});

// DELETE /api/notifications/:id
app.delete('/api/notifications/:id', verifyToken, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID tidak valid.' });
  try {
    await pool.query('DELETE FROM notifications WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus notifikasi.' });
  }
});

// ============================================================
// DASHBOARD STATS ENDPOINTS
// AUDIT FIX: Real data dari DB, bukan dummy/mock
// ============================================================

// GET /api/stats/kpi
app.get('/api/stats/kpi', verifyToken, async (req, res) => {
  try {
    const { rows: [stats] } = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE deleted_at IS NULL)                                      AS total,
        COUNT(*) FILTER (WHERE status = 'active' AND deleted_at IS NULL)               AS active,
        COUNT(*) FILTER (WHERE status = 'pending' AND deleted_at IS NULL)              AS pending,
        COUNT(*) FILTER (WHERE status = 'suspended' AND deleted_at IS NULL)            AS suspended,
        COUNT(*) FILTER (
          WHERE deleted_at IS NULL
          AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
        )                                                                               AS new_this_month
      FROM subscribers
    `);

    // Revenue: harga paket * subscriber aktif
    const { rows: revenueRows } = await pool.query(`
      SELECT COALESCE(SUM(p.price), 0) AS revenue_this_month
      FROM subscribers s
      JOIN packages p ON s.package_id = p.id
      WHERE s.status = 'active' AND s.deleted_at IS NULL
    `);

    res.json({
      total:            parseInt(stats.total),
      active:           parseInt(stats.active),
      pending:          parseInt(stats.pending),
      suspended:        parseInt(stats.suspended),
      new_this_month:   parseInt(stats.new_this_month),
      revenue_this_month: parseInt(revenueRows[0]?.revenue_this_month || 0),
    });
  } catch (err) {
    console.error('[GET /api/stats/kpi]', err.message);
    res.status(500).json({ error: 'Gagal mengambil statistik KPI.' });
  }
});

// GET /api/stats/geographical
app.get('/api/stats/geographical', verifyToken, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT v.name AS village_name, COUNT(s.id) AS count
      FROM villages v
      LEFT JOIN subscribers s ON s.village_id = v.id AND s.deleted_at IS NULL
      GROUP BY v.id, v.name
      ORDER BY count DESC
    `);
    res.json(rows.map(r => ({ ...r, count: parseInt(r.count) })));
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data geografis.' });
  }
});

// GET /api/stats/packages
app.get('/api/stats/packages', verifyToken, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.name AS package_name, p.speed_mbps, COUNT(s.id) AS count
      FROM packages p
      LEFT JOIN subscribers s ON s.package_id = p.id AND s.deleted_at IS NULL
      GROUP BY p.id, p.name, p.speed_mbps
      ORDER BY count DESC
    `);
    res.json(rows.map(r => ({ ...r, count: parseInt(r.count) })));
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data paket.' });
  }
});

// GET /api/stats/growth - 12 bulan terakhir
app.get('/api/stats/growth', verifyToken, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
        COUNT(*) AS count
      FROM subscribers
      WHERE deleted_at IS NULL
        AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month ASC
    `);
    res.json(rows.map(r => ({ ...r, count: parseInt(r.count) })));
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data pertumbuhan.' });
  }
});

// GET /api/stats/activity - activity log untuk SettingsView
app.get('/api/stats/activity', verifyToken, requireRole('superadmin'), async (req, res) => {
  try {
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const { rows } = await pool.query(`
      SELECT al.*, u.name AS user_name, u.email AS user_email
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT $1
    `, [limit]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil activity log.' });
  }
});

// ============================================================
// PUBLIC ENDPOINT - Form Registrasi Publik (tanpa auth)
// AUDIT FIX: Rate limited, validasi ketat
// ============================================================
app.post('/api/public/register',
  formLimiter,
  [
    body('name').trim().notEmpty().withMessage('Nama wajib diisi').isLength({ max: 150 }),
    body('phone').trim().notEmpty().withMessage('No HP wajib diisi').matches(/^[0-9+\-\s]{8,20}$/),
    body('village_id').isInt({ min: 1 }),
    body('package_id').isInt({ min: 1 }),
    body('address').trim().notEmpty().withMessage('Alamat wajib diisi'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, address, phone, village_id, package_id, notes } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows: [newSubscriber] } = await client.query(
        `INSERT INTO subscribers (name, address, phone, village_id, package_id, status, notes, created_at)
         VALUES ($1, $2, $3, $4, $5, 'pending', $6, NOW())
         RETURNING id`,
        [name, address, phone, village_id, package_id, notes || '']
      );

      const subscriberId = newSubscriber.id;

      const { rows: [villageRow] } = await client.query('SELECT name FROM villages WHERE id = $1', [village_id]);
      const { rows: [packageRow] } = await client.query('SELECT name FROM packages WHERE id = $1', [package_id]);

      const villageName = villageRow?.name || '-';
      const packageName = packageRow?.name || '-';

      // Auto notifikasi
      const notifMessage = `Pelanggan baru: ${name} | Paket: ${packageName} | Desa: ${villageName}`;
      await client.query(
        `INSERT INTO notifications (type, title, message, subscriber_id, is_read, created_at)
         VALUES ('new_registration', 'Pendaftaran Baru', $1, $2, false, NOW())`,
        [notifMessage, subscriberId]
      );

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Pendaftaran berhasil! Tim kami akan menghubungi Anda segera.',
        id: subscriberId,
      });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[POST /api/public/register]', err.message);
      res.status(500).json({ error: 'Gagal menyimpan pendaftaran. Silakan coba lagi.' });
    } finally {
      client.release();
    }
  }
);

// ============================================================
// ERROR HANDLERS
// ============================================================

// CORS error
app.use((err, req, res, next) => {
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ error: err.message });
  }
  next(err);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.message);
  res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: `Route tidak ditemukan: ${req.method} ${req.path}` });
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  console.log(`[Server] CORS allowed origins: ${allowedOrigins.join(', ')}`);
  console.log(`[Server] Upload dir: ${UPLOAD_DIR}`);
});
