import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Client-only build configuration (no server dependencies)
export default defineConfig({
  build: {
    outDir: "dist/spa",
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    }
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});
