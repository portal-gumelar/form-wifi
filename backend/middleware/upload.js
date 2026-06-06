// AUDIT FIX: Multer upload middleware dengan validasi magic bytes
// Menggantikan upload tanpa filter tipe file yang aman
// Kompatibel dengan multer v2
import multerPkg from 'multer';
const { diskStorage, MulterError } = multerPkg;
const multer = multerPkg.default || multerPkg;
import path from 'path';
import fs from 'fs';
import { fileTypeFromBuffer } from 'file-type';

// AUDIT FIX: Allowed MIME types - cek magic bytes bukan hanya ekstensi
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || '2') * 1024 * 1024;

const getUploadDir = () => {
  const dir = process.env.UPLOAD_DIR || './uploads';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

// Konfigurasi storage multer (gunakan diskStorage dari multerPkg)
const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, getUploadDir());
  },
  filename: (req, file, cb) => {
    // AUDIT FIX: Nama file sanitized - tidak boleh ada path traversal
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
    const safeExt = allowedExts.includes(ext) ? ext : '.jpg';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    cb(null, `photo_${timestamp}_${random}${safeExt}`);
  }
});

// Filter awal berdasarkan MIME type yang dilaporkan browser
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipe file tidak diizinkan. Hanya JPEG, PNG, WebP. Anda mengunggah: ${file.mimetype}`), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter
});

/**
 * Middleware validasi magic bytes SETELAH file diterima
 * AUDIT FIX: Double-check tipe file dengan membaca actual bytes,
 *            bukan hanya header yang bisa dipalsukan
 */
export const validateFileType = async (req, res, next) => {
  if (!req.file) return next();

  try {
    // Baca 4100 bytes pertama untuk cek magic bytes
    const buffer = Buffer.alloc(4100);
    const fd = fs.openSync(req.file.path, 'r');
    fs.readSync(fd, buffer, 0, 4100, 0);
    fs.closeSync(fd);

    const fileType = await fileTypeFromBuffer(buffer);

    if (!fileType || !ALLOWED_MIME_TYPES.includes(fileType.mime)) {
      // Hapus file yang tidak valid
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        error: `File yang diunggah bukan gambar valid. Terdeteksi: ${fileType?.mime || 'unknown'}`
      });
    }

    next();
  } catch (err) {
    // Hapus file jika terjadi error
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
    return res.status(500).json({ error: 'Gagal memvalidasi tipe file.' });
  }
};

// Error handler untuk multer
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: `Ukuran file melebihi batas. Maksimum ${process.env.MAX_FILE_SIZE_MB || 2}MB.`
      });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};
