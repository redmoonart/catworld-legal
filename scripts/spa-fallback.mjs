// ينسخ dist/index.html إلى dist/404.html حتى يعمل React Router بروابط نظيفة
// على GitHub Pages (الذي لا يدعم إعادة التوجيه من جهة الخادم).
import { copyFileSync } from "node:fs";
copyFileSync("dist/index.html", "dist/404.html");
console.log("✓ Created dist/404.html (SPA fallback for GitHub Pages)");
