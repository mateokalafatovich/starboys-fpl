import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/api": "http://localhost:4000"
    },
  },
  build: {
    rollupOptions: {
      input: {
        seasonal: resolve(__dirname, "index.html"),
        weekly:   resolve(__dirname, "weekly/index.html"),
        gameweek: resolve(__dirname, "gameweek/index.html"),
      },
    },
  },
});