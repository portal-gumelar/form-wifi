// AUDIT FIX: Activity log middleware - catat semua aksi POST/PUT/DELETE/PATCH
// Digunakan sebagai middleware setelah verifyToken

/**
 * Buat logger untuk aksi tertentu
 * @param {string} action - CREATE, UPDATE, DELETE, PATCH, LOGIN, LOGOUT
 * @param {string} targetTable - nama tabel yang dimodifikasi
 * @param {Function} getDescription - fungsi (req, result) => string deskripsi
 */
export const logActivity = (action, targetTable, getDescription = null) => {
  return async (req, res, next) => {
    // Simpan referensi ke res.json asli
    const originalJson = res.json.bind(res);
    let responseData = null;

    // Override res.json untuk intercept response body
    res.json = (data) => {
      responseData = data;
      return originalJson(data);
    };

    // Lanjutkan ke handler berikutnya
    next();

    // Hook ke finish event untuk log setelah response dikirim
    res.on('finish', async () => {
      // Hanya log jika request berhasil (2xx)
      if (res.statusCode < 200 || res.statusCode >= 300) return;
      // Hanya log jika ada user (authenticated)
      if (!req.user) return;

      try {
        const pool = req.app.locals.pool;
        if (!pool) return;

        const userId = req.user.id;
        const targetId = parseInt(req.params?.id) || responseData?.id || null;
        
        let description = null;
        if (typeof getDescription === 'function') {
          try {
            description = getDescription(req, responseData);
          } catch (e) {
            description = `${action} ${targetTable}`;
          }
        }

        const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';

        await pool.query(
          `INSERT INTO activity_logs 
           (user_id, action, target_table, target_id, description, ip_address, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [userId, action, targetTable, targetId, description, ip]
        );
      } catch (logErr) {
        // Jangan biarkan error logging mengganggu response utama
        console.error('[ActivityLog] Gagal menyimpan log:', logErr.message);
      }
    });
  };
};

/**
 * Helper langsung untuk log tanpa middleware (digunakan di handler secara manual)
 */
export const writeLog = async (pool, userId, action, targetTable, targetId, description, ip) => {
  try {
    await pool.query(
      `INSERT INTO activity_logs 
       (user_id, action, target_table, target_id, description, ip_address, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [userId, action, targetTable, targetId || null, description || null, ip || 'system']
    );
  } catch (err) {
    console.error('[writeLog] Error:', err.message);
  }
};
