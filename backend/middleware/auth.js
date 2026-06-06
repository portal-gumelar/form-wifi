// AUDIT FIX: JWT middleware - verifyToken + requireRole
// Menggantikan autentikasi localStorage yang tidak aman
import jwt from 'jsonwebtoken';

/**
 * Middleware: Verifikasi JWT accessToken dari header Authorization
 * Format: Authorization: Bearer <token>
 */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token tidak ditemukan. Silakan login kembali.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token tidak valid.' });
  }

  try {
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not set");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role, name }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Silakan refresh token.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Token tidak valid atau sudah diubah.' });
  }
};

/**
 * Middleware factory: Cek role pengguna
 * Contoh: requireRole('superadmin')
 * AUDIT FIX: Role check server-side, bukan localStorage
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Belum terautentikasi.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Akses ditolak. Dibutuhkan role: ${allowedRoles.join(' atau ')}.`
      });
    }
    next();
  };
};
