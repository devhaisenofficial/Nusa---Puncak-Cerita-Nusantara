import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Mendengarkan di semua antarmuka jaringan (0.0.0.0)
    port: 5173,
    allowedHosts: ["api.haisen.my.id"],
  },
  preview: {
    host: true, // Berlaku saat menjalankan hasil build (npm run preview)
    port: 4173,
    allowedHosts: ["api.haisen.my.id"],
  },
});