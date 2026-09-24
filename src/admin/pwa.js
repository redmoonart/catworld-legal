// تحويل لوحة الإدارة إلى تطبيق قابل للتثبيت باسم "إدارة متجري"
const BASE = import.meta.env.BASE_URL; // "/kidsoffuturestore/"

function addHead(tag, attrs) {
  const sel = Object.entries(attrs).filter(([k]) => k === "rel" || k === "name").map(([k, v]) => `[${k}="${v}"]`).join("");
  let el = sel ? document.head.querySelector(`${tag}${sel}`) : null;
  if (!el) {
    el = document.createElement(tag);
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
}

let installEvent = null;
const listeners = new Set();
export function onInstallAvailable(fn) {
  listeners.add(fn);
  fn(!!installEvent);
  return () => listeners.delete(fn);
}
export async function promptInstall() {
  if (!installEvent) return false;
  installEvent.prompt();
  const { outcome } = await installEvent.userChoice;
  installEvent = null;
  listeners.forEach((fn) => fn(false));
  return outcome === "accepted";
}

let done = false;
export function setupAdminPwa() {
  if (done || typeof window === "undefined") return;
  done = true;
  document.title = "إدارة متجري";
  addHead("link", { rel: "manifest", href: `${BASE}admin-manifest.webmanifest` });
  addHead("meta", { name: "theme-color", content: "#d87943" });
  addHead("link", { rel: "apple-touch-icon", href: `${BASE}admin-apple-icon.png` });
  addHead("meta", { name: "apple-mobile-web-app-capable", content: "yes" });
  addHead("meta", { name: "mobile-web-app-capable", content: "yes" });
  addHead("meta", { name: "apple-mobile-web-app-title", content: "إدارة متجري" });

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    installEvent = e;
    listeners.forEach((fn) => fn(true));
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register(`${BASE}admin-sw.js`, { scope: `${BASE}admin` })
      .catch((err) => console.warn("SW registration failed:", err));
  }
}

export function isStandalone() {
  return window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
}
