import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import biomePlugin from "vite-plugin-biome";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    biomePlugin({
      mode: "check",
      files: "src/**/*.**",
      applyFixes: "false",
    }),
  ],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        map: resolve(__dirname, "/pages/map/index.html"),
      },
    },
  },
});
