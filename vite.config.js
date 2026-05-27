import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { VitePWA } from 'vite-plugin-pwa'

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        map: resolve(__dirname, "/pages/map/index.html"),
      },
    plugins: [
        VitePWA({ 
          registerType: 'autoUpdate',
          devOptions: {
        enabled: true
      }})
      ]
    },
  },
});
