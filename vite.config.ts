// AUDIT FIX: Hapus viteSingleFile() - menghasilkan satu HTML raksasa
// yang TIDAK kompatibel dengan Nginx SPA (dist/ butuh file JS/CSS terpisah)
// Sekarang menggunakan build standar Vite → dist/ dengan JS/CSS terpisah
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

export default defineConfig({
  base: "/",
  plugins: [
    react(),
    tailwindcss(),
    // AUDIT FIX: viteSingleFile() DIHAPUS
    // Alasan: Coolify/Nginx perlu dist/ dengan file JS/CSS terpisah
    // untuk SPA routing, caching immutable assets, dan load time optimal
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    // AUDIT FIX: Output ke dist/ yang di-serve Nginx
    outDir: "dist",
    emptyOutDir: true,
    // Chunk size warning threshold
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // AUDIT FIX: Manual chunking untuk lazy loading lebih baik
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "charts":       ["recharts"],
          "motion":       ["framer-motion"],
          "pdf":          ["jspdf", "jspdf-autotable"],
          "xlsx":         ["xlsx"],
        },
      },
    },
  },
  server: {
    // Dev server proxy ke backend lokal
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
