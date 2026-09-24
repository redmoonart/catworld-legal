// Service worker لتطبيق "إدارة متجري" — نطاقه لوحة الإدارة فقط.
// لا يخزّن بيانات الطلبات؛ فقط يعرض صفحة بديلة عند انقطاع الإنترنت ويُظهر الإشعارات.
const OFFLINE_HTML = `<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>إدارة متجري</title>
<body style="font-family:sans-serif;text-align:center;padding:60px 20px;background:#fbf7f2;color:#333">
<h2>لا يوجد اتصال بالإنترنت</h2><p>تحقق من الاتصال ثم أعد المحاولة.</p>
<button onclick="location.reload()" style="padding:10px 20px;border:0;border-radius:8px;background:#d87943;color:#fff;font-size:16px">إعادة المحاولة</button>
</body></html>`;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    fetch(event.request).catch(
      () => new Response(OFFLINE_HTML, { headers: { "Content-Type": "text/html; charset=utf-8" } })
    )
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) if ("focus" in c) return c.focus();
      return self.clients.openWindow(self.registration.scope + "/");
    })
  );
});
