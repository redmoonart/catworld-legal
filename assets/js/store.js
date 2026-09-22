/* ============================================================
   Kids of the Future — منطق المتجر
   السلة (localStorage) + العرض + الفلترة + الطلب عبر واتساب
   ============================================================ */
(function () {
  "use strict";

  const CFG = window.STORE_CONFIG || {};
  const PRODUCTS = window.PRODUCTS || [];
  const WILAYAS = window.WILAYAS || [];
  const CART_KEY = "kof_cart_v1";
  const cur = CFG.currency || "دج";

  /* ---------- أدوات مساعدة ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const fmt = (n) => Number(n).toLocaleString("fr-DZ").replace(/ /g, " ");
  const money = (n) => `${fmt(n)} ${cur}`;
  const byId = (id) => PRODUCTS.find((p) => p.id === Number(id));
  const catName = (c) => (c === "toys" ? "ألعاب" : "أدوات مدرسية");
  const esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

  /* ---------- السلة ---------- */
  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveCart(cart) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
    updateCartCount();
  }
  function cartCount() { return getCart().reduce((s, i) => s + i.qty, 0); }
  function cartSubtotal() {
    return getCart().reduce((s, i) => {
      const p = byId(i.id); return p ? s + p.price * i.qty : s;
    }, 0);
  }
  function addToCart(id, qty = 1) {
    const p = byId(id);
    if (!p || p.stock === false) return;
    const cart = getCart();
    const line = cart.find((i) => i.id === id);
    if (line) line.qty += qty; else cart.push({ id, qty });
    saveCart(cart);
    toast(`✅ تمت إضافة «${p.name}» إلى السلة`);
  }
  function setQty(id, qty) {
    let cart = getCart();
    qty = Math.max(0, qty);
    if (qty === 0) cart = cart.filter((i) => i.id !== id);
    else { const l = cart.find((i) => i.id === id); if (l) l.qty = qty; }
    saveCart(cart);
  }
  function removeFromCart(id) { saveCart(getCart().filter((i) => i.id !== id)); }

  function updateCartCount() {
    const c = cartCount();
    $$(".cart-count").forEach((el) => {
      el.textContent = c;
      el.style.display = c > 0 ? "grid" : "none";
    });
  }

  /* ---------- توست ---------- */
  let toastTimer;
  function toast(msg) {
    let t = $("#toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
  }

  /* ---------- روابط واتساب ---------- */
  function waLink(text) {
    const num = (CFG.whatsapp || "").replace(/\D/g, "");
    return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
  }
  function openWhatsAppOrder(customer) {
    const cart = getCart();
    if (!cart.length) return;
    const sub = cartSubtotal();
    const delivery = customer ? customer.deliveryPrice : 0;
    const isFree = CFG.freeShippingThreshold && sub >= CFG.freeShippingThreshold;
    const deliveryFinal = isFree ? 0 : delivery;
    const total = sub + deliveryFinal;

    let msg = `🛒 *طلب جديد من ${CFG.name}*\n`;
    msg += `━━━━━━━━━━━━━━━\n`;
    cart.forEach((i) => {
      const p = byId(i.id);
      if (p) msg += `• ${p.name}  ×${i.qty} = ${money(p.price * i.qty)}\n`;
    });
    msg += `━━━━━━━━━━━━━━━\n`;
    msg += `المجموع الفرعي: ${money(sub)}\n`;
    if (customer) {
      msg += `التوصيل (${customer.deliveryType === "office" ? "مكتب" : "منزل"}): ${isFree ? "مجاني 🎉" : money(deliveryFinal)}\n`;
      msg += `*الإجمالي: ${money(total)}*\n`;
      msg += `━━━━━━━━━━━━━━━\n`;
      msg += `👤 الاسم: ${customer.name}\n`;
      msg += `📞 الهاتف: ${customer.phone}\n`;
      msg += `🏙️ الولاية: ${customer.wilaya}\n`;
      if (customer.city) msg += `📍 البلدية/العنوان: ${customer.city}\n`;
      msg += `🚚 نوع التوصيل: ${customer.deliveryType === "office" ? "مكتب التوصيل" : "المنزل"}\n`;
      if (customer.notes) msg += `📝 ملاحظات: ${customer.notes}\n`;
      msg += `💵 الدفع: عند الاستلام\n`;
    } else {
      msg += `*الإجمالي (بدون توصيل): ${money(sub)}*\n`;
    }
    window.open(waLink(msg), "_blank");
  }

  /* ---------- بطاقة منتج ---------- */
  function thumbHTML(p) {
    if (p.image) return `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">`;
    return `<span>${p.emoji || "🎁"}</span>`;
  }
  function productCard(p) {
    const disc = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
    const out = p.stock === false;
    return `
      <article class="pcard">
        <a href="product.html?id=${p.id}" class="thumb">
          ${thumbHTML(p)}
          ${p.badge && !out ? `<span class="badge">${esc(p.badge)}</span>` : ""}
          ${out ? `<span class="badge out">نفذ المخزون</span>` : ""}
          ${disc > 0 && !out ? `<span class="disc">-${disc}%</span>` : ""}
        </a>
        <div class="body">
          <span class="cat-tag">${catName(p.category)}</span>
          <h3><a href="product.html?id=${p.id}">${esc(p.name)}</a></h3>
          <div class="price">
            <span class="now">${fmt(p.price)}</span><span class="cur">${cur}</span>
            ${p.oldPrice ? `<span class="old">${fmt(p.oldPrice)}</span>` : ""}
          </div>
          <div class="actions">
            ${out
              ? `<button class="btn btn-ghost btn-sm" disabled>غير متوفر</button>`
              : `<button class="btn btn-primary btn-sm add-btn" data-id="${p.id}">🛒 أضف للسلة</button>`}
          </div>
        </div>
      </article>`;
  }

  function bindAddButtons(ctx = document) {
    $$(".add-btn", ctx).forEach((b) => {
      b.addEventListener("click", () => addToCart(Number(b.dataset.id)));
    });
  }

  /* ============================================================
     تهيئة الترويسة/الفوتر المشتركة
     ============================================================ */
  function initChrome() {
    // اسم المتجر
    $$("[data-store-name]").forEach((el) => (el.textContent = CFG.name));
    $$("[data-store-name-ar]").forEach((el) => (el.textContent = CFG.nameAr || ""));
    $$("[data-tagline]").forEach((el) => (el.textContent = CFG.tagline || ""));
    $$("[data-email]").forEach((el) => { el.textContent = CFG.email; if (el.tagName === "A") el.href = "mailto:" + CFG.email; });
    $$("[data-phone]").forEach((el) => { el.textContent = CFG.phoneDisplay || ""; });
    $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

    // روابط واتساب العامة
    const waGeneric = waLink(`مرحباً، أرغب في الاستفسار عن منتجات ${CFG.name} 🧸`);
    $$("[data-wa-link]").forEach((el) => (el.href = waGeneric));

    // روابط التواصل
    const socials = { facebook: CFG.facebook, instagram: CFG.instagram, tiktok: CFG.tiktok };
    Object.entries(socials).forEach(([k, v]) => {
      $$(`[data-social="${k}"]`).forEach((el) => {
        if (v) el.href = v; else el.style.display = "none";
      });
    });

    // قائمة الموبايل
    const toggle = $(".menu-toggle");
    const nav = $(".nav");
    if (toggle && nav) toggle.addEventListener("click", () => nav.classList.toggle("open"));

    updateCartCount();
  }

  /* ============================================================
     الصفحة الرئيسية
     ============================================================ */
  function initHome() {
    const feat = $("#featured-grid");
    if (feat) {
      const picks = PRODUCTS.filter((p) => p.badge || p.oldPrice).slice(0, 8);
      const list = picks.length ? picks : PRODUCTS.slice(0, 8);
      feat.innerHTML = list.map(productCard).join("");
      bindAddButtons(feat);
    }
  }

  /* ============================================================
     صفحة المتجر (المنتجات)
     ============================================================ */
  function initShop() {
    const grid = $("#shop-grid");
    if (!grid) return;

    const state = { cat: "all", q: "", sort: "default" };
    const params = new URLSearchParams(location.search);
    if (params.get("cat")) state.cat = params.get("cat");

    const chips = $$(".chip[data-cat]");
    const search = $("#search-input");
    const sortSel = $("#sort-select");
    const countLabel = $("#result-count");

    function render() {
      let list = PRODUCTS.slice();
      if (state.cat !== "all") list = list.filter((p) => p.category === state.cat);
      if (state.q) {
        const q = state.q.trim().toLowerCase();
        list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.desc || "").toLowerCase().includes(q));
      }
      if (state.sort === "price-asc") list.sort((a, b) => a.price - b.price);
      else if (state.sort === "price-desc") list.sort((a, b) => b.price - a.price);
      else if (state.sort === "name") list.sort((a, b) => a.name.localeCompare(b.name, "ar"));

      if (countLabel) countLabel.textContent = `${list.length} منتج`;
      grid.innerHTML = list.length
        ? list.map(productCard).join("")
        : `<div class="empty-state" style="grid-column:1/-1"><div class="em">🔍</div><h3>لا توجد نتائج</h3><p>جرّب كلمة بحث أخرى أو غيّر الفئة.</p></div>`;
      bindAddButtons(grid);
      chips.forEach((c) => c.classList.toggle("active", c.dataset.cat === state.cat));
    }

    chips.forEach((c) => c.addEventListener("click", () => { state.cat = c.dataset.cat; render(); }));
    if (search) search.addEventListener("input", () => { state.q = search.value; render(); });
    if (sortSel) sortSel.addEventListener("change", () => { state.sort = sortSel.value; render(); });
    render();
  }

  /* ============================================================
     صفحة تفاصيل المنتج
     ============================================================ */
  function initProduct() {
    const root = $("#pdp-root");
    if (!root) return;
    const id = Number(new URLSearchParams(location.search).get("id"));
    const p = byId(id);
    if (!p) {
      root.innerHTML = `<div class="empty-state"><div class="em">😕</div><h3>المنتج غير موجود</h3><p>ربما تم حذفه أو تغيّر الرابط.</p><a class="btn btn-primary" href="shop.html">تصفّح المتجر</a></div>`;
      return;
    }
    document.title = `${p.name} — ${CFG.name}`;
    const disc = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
    const out = p.stock === false;
    root.innerHTML = `
      <p class="breadcrumb"><a href="index.html">الرئيسية</a> / <a href="shop.html?cat=${p.category}">${catName(p.category)}</a> / ${esc(p.name)}</p>
      <div class="pdp">
        <div class="gallery">${thumbHTML(p)}</div>
        <div class="info">
          <span class="cat-tag" style="color:var(--primary);font-weight:700">${catName(p.category)}</span>
          <h1>${esc(p.name)}</h1>
          <div class="price">
            <span class="now">${money(p.price)}</span>
            ${p.oldPrice ? `<span class="old">${money(p.oldPrice)}</span>` : ""}
            ${disc > 0 ? `<span class="pdp-disc" style="background:var(--danger);color:#fff;padding:2px 10px;border-radius:999px;font-weight:700;font-size:.85rem">-${disc}%</span>` : ""}
          </div>
          <p class="desc">${esc(p.desc || "")}</p>
          <div class="meta">
            ${p.ageGroup ? `<span class="tag">👶 العمر: ${esc(p.ageGroup)} سنوات</span>` : ""}
            <span class="tag">💵 الدفع عند الاستلام</span>
            <span class="tag">🚚 توصيل لكل الولايات</span>
          </div>
          <p>${out ? '<span class="out-stock">✖ نفذ المخزون حالياً</span>' : '<span class="in-stock">✔ متوفر في المخزون</span>'}</p>
          ${out ? "" : `
          <div class="pdp-actions">
            <div class="qty">
              <button id="q-minus" type="button">−</button>
              <input id="q-input" type="text" value="1" inputmode="numeric" readonly>
              <button id="q-plus" type="button">+</button>
            </div>
            <button class="btn btn-primary btn-lg" id="pdp-add">🛒 أضف إلى السلة</button>
            <button class="btn btn-wa btn-lg" id="pdp-buy">اطلب عبر واتساب</button>
          </div>`}
        </div>
      </div>
      <div class="section-sm"></div>
      <div class="section-head" style="text-align:right;margin-bottom:18px"><h2 style="font-size:1.4rem">منتجات مشابهة</h2></div>
      <div class="products-grid" id="related-grid"></div>`;

    if (!out) {
      const qi = $("#q-input");
      const getQ = () => Math.max(1, parseInt(qi.value, 10) || 1);
      $("#q-minus").addEventListener("click", () => (qi.value = Math.max(1, getQ() - 1)));
      $("#q-plus").addEventListener("click", () => (qi.value = getQ() + 1));
      $("#pdp-add").addEventListener("click", () => addToCart(p.id, getQ()));
      $("#pdp-buy").addEventListener("click", () => {
        addToCart(p.id, getQ());
        const msg = `مرحباً، أرغب في طلب هذا المنتج:\n• ${p.name} ×${getQ()} = ${money(p.price * getQ())}\nمن ${CFG.name}`;
        window.open(waLink(msg), "_blank");
      });
    }

    const rel = PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
    const rg = $("#related-grid");
    rg.innerHTML = rel.map(productCard).join("");
    bindAddButtons(rg);
  }

  /* ============================================================
     صفحة السلة والدفع
     ============================================================ */
  function initCart() {
    const root = $("#cart-root");
    if (!root) return;

    // تعبئة قائمة الولايات
    const wSelect = $("#f-wilaya");
    if (wSelect) {
      wSelect.innerHTML = `<option value="">— اختر الولاية —</option>` +
        WILAYAS.map((w) => `<option value="${w.code}">${w.code} - ${w.name}</option>`).join("");
    }

    let deliveryType = "home";

    function currentDelivery() {
      const code = Number(wSelect && wSelect.value);
      const w = WILAYAS.find((x) => x.code === code);
      if (!w) return { price: CFG.defaultDeliveryPrice || 0, wilaya: null };
      return { price: deliveryType === "office" ? w.office : w.home, wilaya: w };
    }

    function render() {
      const cart = getCart();
      if (!cart.length) {
        root.innerHTML = `<div class="empty-state"><div class="em">🛒</div><h3>سلتك فارغة</h3><p>لم تُضِف أي منتج بعد. اكتشف تشكيلتنا من الألعاب والأدوات المدرسية.</p><a class="btn btn-primary btn-lg" href="shop.html">ابدأ التسوّق</a></div>`;
        return;
      }
      const sub = cartSubtotal();
      const del = currentDelivery();
      const isFree = CFG.freeShippingThreshold && sub >= CFG.freeShippingThreshold;
      const delPrice = isFree ? 0 : del.price;
      const total = sub + delPrice;
      const remain = CFG.freeShippingThreshold ? CFG.freeShippingThreshold - sub : 0;

      root.innerHTML = `
        <div class="cart-layout">
          <div>
            <div class="cart-list">
              ${cart.map((i) => {
                const p = byId(i.id); if (!p) return "";
                return `
                <div class="cart-row">
                  <a href="product.html?id=${p.id}" class="thumb">${thumbHTML(p)}</a>
                  <div>
                    <h4>${esc(p.name)}</h4>
                    <div class="unit">${money(p.price)} للقطعة</div>
                    <div class="qty" style="margin-top:8px">
                      <button type="button" data-dec="${p.id}">−</button>
                      <input type="text" value="${i.qty}" readonly>
                      <button type="button" data-inc="${p.id}">+</button>
                    </div>
                  </div>
                  <div class="right">
                    <span class="line-total">${money(p.price * i.qty)}</span>
                    <button class="remove" data-rem="${p.id}">🗑 حذف</button>
                  </div>
                </div>`;
              }).join("")}
            </div>
          </div>

          <div class="summary">
            <h3>ملخص الطلب</h3>
            <div class="line"><span>المجموع الفرعي</span><span>${money(sub)}</span></div>
            <div class="line"><span>التوصيل ${del.wilaya ? `(${del.wilaya.name})` : ""}</span><span>${isFree ? "مجاني 🎉" : (del.wilaya ? money(delPrice) : "يُحتسب حسب الولاية")}</span></div>
            <div class="line total"><span>الإجمالي</span><span>${money(total)}</span></div>
            ${CFG.freeShippingThreshold && !isFree && remain > 0 ? `<div class="free-note">أضِف بقيمة ${money(remain)} للحصول على توصيل مجاني 🚚</div>` : ""}
            ${isFree ? `<div class="free-note">🎉 تهانينا! حصلت على توصيل مجاني</div>` : ""}

            <div style="margin-top:20px">
              <h3 style="font-size:1.1rem">معلومات التوصيل</h3>
              <form id="order-form" novalidate>
                <div class="form-row">
                  <label>الاسم الكامل <span class="req">*</span></label>
                  <input id="f-name" type="text" placeholder="مثال: أحمد بن علي" autocomplete="name">
                  <div class="field-error" id="e-name">يرجى إدخال الاسم</div>
                </div>
                <div class="form-row">
                  <label>رقم الهاتف <span class="req">*</span></label>
                  <input id="f-phone" type="tel" placeholder="0X XX XX XX XX" inputmode="tel" autocomplete="tel">
                  <div class="field-error" id="e-phone">أدخل رقم هاتف صحيح (10 أرقام)</div>
                </div>
                <div class="form-row">
                  <label>الولاية <span class="req">*</span></label>
                  <select id="f-wilaya"></select>
                  <div class="field-error" id="e-wilaya">يرجى اختيار الولاية</div>
                </div>
                <div class="form-row">
                  <label>البلدية / العنوان</label>
                  <input id="f-city" type="text" placeholder="البلدية أو العنوان التفصيلي">
                </div>
                <div class="form-row">
                  <label>نوع التوصيل</label>
                  <div class="radio-cards">
                    <div class="radio-card ${deliveryType === "home" ? "active" : ""}" data-dtype="home">🏠 إلى المنزل</div>
                    <div class="radio-card ${deliveryType === "office" ? "active" : ""}" data-dtype="office">🏢 مكتب التوصيل</div>
                  </div>
                </div>
                <div class="form-row">
                  <label>ملاحظات (اختياري)</label>
                  <textarea id="f-notes" rows="2" placeholder="أي تفاصيل إضافية حول الطلب"></textarea>
                </div>
                <button type="submit" class="btn btn-wa btn-block btn-lg">📲 تأكيد الطلب عبر واتساب</button>
                <p style="text-align:center;color:var(--muted);font-size:.82rem;margin-top:10px">💵 الدفع عند الاستلام — لا حاجة لبطاقة بنكية</p>
              </form>
            </div>
          </div>
        </div>`;

      // إعادة تعبئة الولايات + الحفاظ على الاختيار
      const sel = $("#f-wilaya");
      sel.innerHTML = `<option value="">— اختر الولاية —</option>` +
        WILAYAS.map((w) => `<option value="${w.code}">${w.code} - ${w.name}</option>`).join("");
      if (savedForm.wilaya) sel.value = savedForm.wilaya;
      if (savedForm.name) $("#f-name").value = savedForm.name;
      if (savedForm.phone) $("#f-phone").value = savedForm.phone;
      if (savedForm.city) $("#f-city").value = savedForm.city;
      if (savedForm.notes) $("#f-notes").value = savedForm.notes;

      bindCartEvents();
    }

    const savedForm = {};
    function stash() {
      savedForm.name = ($("#f-name") || {}).value;
      savedForm.phone = ($("#f-phone") || {}).value;
      savedForm.wilaya = ($("#f-wilaya") || {}).value;
      savedForm.city = ($("#f-city") || {}).value;
      savedForm.notes = ($("#f-notes") || {}).value;
    }

    function bindCartEvents() {
      $$("[data-inc]").forEach((b) => b.addEventListener("click", () => {
        const id = Number(b.dataset.inc); const l = getCart().find((i) => i.id === id);
        setQty(id, (l ? l.qty : 0) + 1); render();
      }));
      $$("[data-dec]").forEach((b) => b.addEventListener("click", () => {
        const id = Number(b.dataset.dec); const l = getCart().find((i) => i.id === id);
        setQty(id, (l ? l.qty : 1) - 1); render();
      }));
      $$("[data-rem]").forEach((b) => b.addEventListener("click", () => { removeFromCart(Number(b.dataset.rem)); render(); }));

      $$("[data-dtype]").forEach((c) => c.addEventListener("click", () => {
        deliveryType = c.dataset.dtype; stash(); render();
      }));

      const wsel = $("#f-wilaya");
      if (wsel) wsel.addEventListener("change", () => { stash(); render(); });

      const form = $("#order-form");
      if (form) form.addEventListener("submit", onSubmit);
    }

    function showErr(id, show) {
      const el = $("#e-" + id);
      if (el) el.classList.toggle("show", show);
    }

    function onSubmit(e) {
      e.preventDefault();
      stash();
      const name = ($("#f-name").value || "").trim();
      const phone = ($("#f-phone").value || "").trim();
      const wsel = $("#f-wilaya");
      const code = Number(wsel.value);
      const w = WILAYAS.find((x) => x.code === code);

      const phoneOk = /^0[5-7]\d{8}$/.test(phone.replace(/\s/g, ""));
      let ok = true;
      showErr("name", !name); if (!name) ok = false;
      showErr("phone", !phoneOk); if (!phoneOk) ok = false;
      showErr("wilaya", !w); if (!w) ok = false;
      if (!ok) return;

      const sub = cartSubtotal();
      const isFree = CFG.freeShippingThreshold && sub >= CFG.freeShippingThreshold;
      const price = deliveryType === "office" ? w.office : w.home;

      openWhatsAppOrder({
        name, phone,
        wilaya: `${w.code} - ${w.name}`,
        city: ($("#f-city").value || "").trim(),
        deliveryType,
        deliveryPrice: isFree ? 0 : price,
        notes: ($("#f-notes").value || "").trim(),
      });
    }

    render();
  }

  /* ============================================================
     FAQ (صفحة التواصل/الأسئلة)
     ============================================================ */
  function initFAQ() {
    $$(".faq-item h4").forEach((h) => h.addEventListener("click", () => h.parentElement.classList.toggle("open")));
  }

  /* ---------- التشغيل ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    initChrome();
    initHome();
    initShop();
    initProduct();
    initCart();
    initFAQ();
  });

  // كشف عام (اختياري للتصحيح)
  window.KOF = { addToCart, getCart, openWhatsAppOrder };
})();
