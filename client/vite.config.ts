import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The dev server proxies API + user-uploaded media to the OjaX API server
// so the browser only ever talks to one origin (no CORS surprises).
const API_TARGET = process.env.OJAX_API_URL || "http://127.0.0.1:4000";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: true, // dev convenience for LAN/preview hosts
    proxy: {
      "/api": { target: API_TARGET, changeOrigin: true },
      "/uploads": { target: API_TARGET, changeOrigin: true },
      "/media": { target: API_TARGET, changeOrigin: true },
      "/healthz": { target: API_TARGET, changeOrigin: true },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 900,
  },
});
