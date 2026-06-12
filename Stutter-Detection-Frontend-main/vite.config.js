/*import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
})

*/
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  base: "/", // ✅ VERY IMPORTANT FOR DOCKER
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:6822",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:6822",
        changeOrigin: true,
      },
      "/analysis_results": {
        target: "http://localhost:6822",
        changeOrigin: true,
      },
    },
  },
})

