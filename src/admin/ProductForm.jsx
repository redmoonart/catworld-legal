import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { SUBCATS } from "./SUBCATS";

const BLANK = {
  id: "",
  category: "toys",
  subCategory: "",
  emoji: "",
  image: "",
  name: "",
  nameFr: "",
  nameEn: "",
  desc: "",
  descFr: "",
  descEn: "",
  price: "",
  oldPrice: "",
  badge: "",
  ageGroup: "",
  stock: true,
};

function toRow(f) {
  return {
    id: Number(f.id),
    category: f.category,
    sub_category: f.subCategory || null,
    emoji: f.emoji || null,
    image: f.image || null,
    name: f.name,
    name_fr: f.nameFr || null,
    name_en: f.nameEn || null,
    description: f.desc || null,
    description_fr: f.descFr || null,
    description_en: f.descEn || null,
    price: Number(f.price),
    old_price: f.oldPrice ? Number(f.oldPrice) : null,
    badge: f.badge || null,
    age_group: f.ageGroup || null,
    stock: !!f.stock,
  };
}

export default function ProductForm({ initial, nextId, onCancel, onSaved }) {
  const isEdit = !!initial;
  const [f, setF] = useState(() => (initial ? { ...BLANK, ...initial } : { ...BLANK, id: nextId }));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  function set(key) {
    return (e) => {
      const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setF((prev) => ({ ...prev, [key]: v }));
    };
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage.from("product-images").upload(path, file);
    if (upErr) {
      setUploading(false);
      setError("فشل رفع الصورة: " + upErr.message);
      return;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setF((prev) => ({ ...prev, image: data.publicUrl }));
    setUploading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!f.id || !f.name || !f.price) {
      setError("الرقم التعريفي والاسم والسعر مطلوبون");
      return;
    }
    setBusy(true);
    const { error: err } = await supabase.from("products").upsert(toRow(f));
    setBusy(false);
    if (err) setError(err.message);
    else onSaved();
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit} dir="rtl">
      <h3>{isEdit ? `تعديل المنتج #${f.id}` : "إضافة منتج جديد"}</h3>

      <div className="admin-form-grid">
        <label>
          الرقم التعريفي (id)
          <input type="number" value={f.id} onChange={set("id")} disabled={isEdit} required />
        </label>
        <label>
          الفئة
          <select value={f.category} onChange={set("category")}>
            <option value="toys">ألعاب</option>
            <option value="school">أدوات مدرسية</option>
          </select>
        </label>
        <label>
          الفئة الفرعية
          <select value={f.subCategory} onChange={set("subCategory")}>
            {SUBCATS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>
        <label>
          الإيموجي
          <input type="text" value={f.emoji} onChange={set("emoji")} placeholder="🧸" />
        </label>
        <label className="admin-span-2">
          صورة المنتج (اختياري — إن تُركت فارغة يظهر الإيموجي)
          <div className="admin-image-row">
            {f.image && <img src={f.image} alt="" className="admin-image-preview" />}
            <div className="admin-image-controls">
              <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
              {uploading && <span className="admin-uploading">جارٍ الرفع...</span>}
              {f.image && !uploading && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setF((prev) => ({ ...prev, image: "" }))}>
                  إزالة الصورة
                </button>
              )}
              <input
                type="text"
                value={f.image}
                onChange={set("image")}
                placeholder="أو الصق رابط صورة مباشرة"
                className="admin-image-url"
              />
            </div>
          </div>
        </label>
      </div>

      <div className="admin-form-grid">
        <label>
          الاسم (عربي)
          <input type="text" value={f.name} onChange={set("name")} required />
        </label>
        <label>
          الاسم (فرنسي)
          <input type="text" value={f.nameFr} onChange={set("nameFr")} />
        </label>
        <label>
          الاسم (إنجليزي)
          <input type="text" value={f.nameEn} onChange={set("nameEn")} />
        </label>
      </div>

      <div className="admin-form-grid">
        <label className="admin-span-3">
          الوصف (عربي)
          <textarea rows={2} value={f.desc} onChange={set("desc")} />
        </label>
        <label className="admin-span-3">
          الوصف (فرنسي)
          <textarea rows={2} value={f.descFr} onChange={set("descFr")} />
        </label>
        <label className="admin-span-3">
          الوصف (إنجليزي)
          <textarea rows={2} value={f.descEn} onChange={set("descEn")} />
        </label>
      </div>

      <div className="admin-form-grid">
        <label>
          السعر (دج)
          <input type="number" value={f.price} onChange={set("price")} required min="0" />
        </label>
        <label>
          السعر قبل الخصم (اختياري)
          <input type="number" value={f.oldPrice} onChange={set("oldPrice")} min="0" />
        </label>
        <label>
          شارة (اختياري)
          <input type="text" value={f.badge} onChange={set("badge")} placeholder="جديد / عرض / الأكثر مبيعاً" />
        </label>
        <label>
          الفئة العمرية (اختياري)
          <input type="text" value={f.ageGroup} onChange={set("ageGroup")} placeholder="3+" />
        </label>
        <label className="admin-checkbox">
          <input type="checkbox" checked={f.stock} onChange={set("stock")} />
          متوفر في المخزون
        </label>
      </div>

      {error && <p className="admin-auth-error">{error}</p>}

      <div className="admin-form-actions">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "جارٍ الحفظ..." : "حفظ"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          إلغاء
        </button>
      </div>
    </form>
  );
}
