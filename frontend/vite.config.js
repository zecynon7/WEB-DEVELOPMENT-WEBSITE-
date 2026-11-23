import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// In development the React app talks to the backend through this proxy (no CORS setup needed).
// In production the frontend and backend are hosted separately: set VITE_API_BASE_URL (see .env.example).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:5000",
      "/seed-assets": "http://localhost:5000",
    },
  },
});
