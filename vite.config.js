import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    preserveSymlinks: false,
  },
  build: {
    outDir: "output",
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./src/main.js", import.meta.url)),
      },
      output: {
        entryFileNames: "st/index.js",
        chunkFileNames: "st/[name].js",
        assetFileNames: "st/index.[ext]",
      },
    },
  },
});
