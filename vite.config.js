import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/ssonsoles-tasks/",
  // API URL is now hardcoded in src/services/api.js
});
