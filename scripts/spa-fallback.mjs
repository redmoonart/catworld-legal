// ينسخ dist/index.html إلى dist/404.html حتى يعمل React Router بروابط نظيفة
// على GitHub Pages (الذي لا يدعم إعادة التوجيه من جهة الخادم).
// ونسخة في dist/admin/index.html حتى تفتح لوحة الإدارة (تطبيق "إدارة متجري") برمز 200.
import { copyFileSync, mkdirSync } from "node:fs";
copyFileSync("dist/index.html", "dist/404.html");
mkdirSync("dist/admin", { recursive: true });
copyFileSync("dist/index.html", "dist/admin/index.html");
console.log("✓ Created dist/404.html and dist/admin/index.html (SPA fallback for GitHub Pages)");
