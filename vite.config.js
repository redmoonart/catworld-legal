import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// موقع مشروع على GitHub Pages: https://redmoonart.github.io/catworld-legal/
export default defineConfig({
  plugins: [react()],
  base: "/catworld-legal/",
  build: {
    outDir: "dist",
  },
});
