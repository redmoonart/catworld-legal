import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

const POLL_MS = 30000;

// صوت تنبيه قصير (بدون ملفات صوتية)
function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    [0, 0.18].forEach((t) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.15);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + 0.16);
    });
    setTimeout(() => ctx.close(), 600);
  } catch {
    /* ignore */
  }
}

async function notify(title, body) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    const reg = await navigator.serviceWorker?.getRegistration?.(import.meta.env.BASE_URL + "admin");
    const opts = { body, icon: import.meta.env.BASE_URL + "admin-icon-192.png", tag: "new-order", renotify: true, dir: "rtl", lang: "ar" };
    if (reg) await reg.showNotification(title, opts);
    else new Notification(title, opts);
  } catch {
    /* ignore */
  }
}

/**
 * يفحص الطلبات كل 30 ثانية. عند وصول طلب جديد: صوت + إشعار + شارة على أيقونة التطبيق.
 * يرجع { newCount, tick } — tick يزيد عند كل طلب جديد لإعادة تحميل قائمة الطلبات.
 */
export function useNewOrdersAlert() {
  const [newCount, setNewCount] = useState(0);
  const [tick, setTick] = useState(0);
  const lastId = useRef(null);

  const check = useCallback(async () => {
    const [{ data: latest, error: e1 }, { count, error: e2 }] = await Promise.all([
      supabase.from("orders").select("id, customer_name, total").order("id", { ascending: false }).limit(1),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "new"),
    ]);
    if (e1 || e2) return;

    const c = count || 0;
    setNewCount(c);
    try {
      if (c > 0) navigator.setAppBadge?.(c);
      else navigator.clearAppBadge?.();
    } catch {
      /* ignore */
    }

    const top = latest?.[0];
    if (!top) return;
    if (lastId.current !== null && top.id > lastId.current) {
      beep();
      notify("🛒 طلب جديد!", `${top.customer_name} — ${top.total} دج`);
      setTick((t) => t + 1);
    }
    lastId.current = Math.max(lastId.current ?? 0, top.id);
  }, []);

  useEffect(() => {
    check();
    const id = setInterval(check, POLL_MS);
    const onVis = () => document.visibilityState === "visible" && check();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [check]);

  return { newCount, tick, recheck: check };
}
