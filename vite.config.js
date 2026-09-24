import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// موقع مشروع على GitHub Pages: https://redmoonart.github.io/kidsoffuturestore/
export default defineConfig({
  plugins: [react()],
  base: "/kidsoffuturestore/",
  build: {
    outDir: "dist",
  },
});
