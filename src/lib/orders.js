import { supabase } from "./supabaseClient";

// رقم طلب قصير يظهر في رسالة واتساب وفي لوحة التحكم (مثال: KF-M3X9A7-4Q)
export function makeOrderRef() {
  const time = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 4).toUpperCase();
  return `KF-${time}-${rand}`;
}

// يحفظ الطلب في جدول orders. لا نطلب .select() لأن الزائر لا يملك صلاحية القراءة.
// يرجع true عند النجاح، ولا يرمي خطأ حتى لا يتعطل إرسال واتساب.
export async function saveOrder(order) {
  try {
    const { error } = await supabase.from("orders").insert(order);
    if (error) {
      console.error("Order save failed:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Order save failed:", err);
    return false;
  }
}

export const ORDER_STATUSES = [
  { value: "new", label: "🆕 جديد" },
  { value: "confirmed", label: "✅ مؤكد" },
  { value: "shipped", label: "🚚 مشحون" },
  { value: "delivered", label: "📦 تم التسليم" },
  { value: "cancelled", label: "❌ ملغى" },
];
