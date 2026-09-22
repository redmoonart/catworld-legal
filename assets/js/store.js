/* ============================================================
   Kids of the Future — منطق المتجر
   السلة (localStorage) + العرض + الفلترة + الطلب عبر واتساب
   يدعم العربية / الفرنسية / الإنجليزية عبر i18n.js
   ============================================================ */
(function () {
  "use strict";

  const CFG = window.STORE_CONFIG || {};
  const PRODUCTS = window.PRODUCTS || [];
  const WILAYAS = window.WILAYAS || [];
  const I18N = window.I18N || { t: (k) => k, getLang: () => "ar", apply: () => {}, setLang: () => {} };
  const CART_KEY = "kof_cart_v1";
  const cur = CFG.currency || "دج";

  const rerenderers = [];

  /* ---------- أدوات مساعدة ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const t = (k, v) => {
    let s = I18N.t(k);
    if (v && typeof s === "string") Object.keys(v).forEach((key) => (s = s.replace("{" + key + "}", v[key])));
    return s;
  };
  const lang = () => I18N.getLang();
  const fmt = (n) => Number(n).toLocaleString("fr-DZ").replace(/ /g, " ");
  const money = (n) => `${fmt(n)} ${cur}`;
  const byId = (id) => PRODUCTS.find((p) => p.id === Number(id));
  const esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

  // اسم/وصف المنتج حسب اللغة (مع الرجوع للعربية)
  function pName(p) { const l = lang(); return (l === "fr" && p.nameFr) || (l === "en" && p.nameEn) || p.name; }
  function pDesc(p) { const l = lang(); return (l === "fr" && p.descFr) || (l === "en" && p.descEn) || p.desc || ""; }
  function catLabel(c) { return t(c === "toys" ? "card.toys" : "card.school"); }
  function wName(w) { return lang() === "ar" ? w.name : (w.latin || w.name); }

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
    return getCart().reduce((s, i) => { const p = byId(i.id); return p ? s + p.price * i.qty : s; }, 0);
  }
  function addToCart(id, qty = 1) {
    const p = byId(id);
    if (!p || p.stock === false) return;
    const cart = getCart();
    const line = cart.find((i) => i.id === id);
    if (line) line.qty += qty; else cart.push({ id, qty });
    saveCart(cart);
    toast(`✅ ${pName(p)}`);
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
    $$(".cart-count").forEach((el) => { el.textContent = c; el.style.display = c > 0 ? "grid" : "none"; });
  }

  /* ---------- توست ---------- */
  let toastTimer;
  function toast(msg) {
    let el = $("#toast");
    if (!el) { el = document.createElement("div"); el.id = "toast"; el.className = "toast"; document.body.appendChild(el); }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
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
    const isFree = CFG.freeShippingThreshold && sub >= CFG.freeShippingThreshold;
    const deliveryFinal = isFree ? 0 : customer.deliveryPrice;
    const total = sub + deliveryFinal;

    let msg = t("wa.new_order", { store: CFG.name }) + "\n";
    msg += `━━━━━━━━━━━━━━━\n`;
    cart.forEach((i) => { const p = byId(i.id); if (p) msg += `• ${pName(p)}  ×${i.qty} = ${money(p.price * i.qty)}\n`; });
    msg += `━━━━━━━━━━━━━━━\n`;
    msg += `${t("wa.subtotal")}: ${money(sub)}\n`;
    const dtLabel = customer.deliveryType === "office" ? t("wa.office") : t("wa.home");
    msg += `${t("wa.delivery")} (${dtLabel}): ${isFree ? t("cart.free") : money(deliveryFinal)}\n`;
    msg += `*${t("wa.total")}: ${money(total)}*\n`;
    msg += `━━━━━━━━━━━━━━━\n`;
    msg += `👤 ${t("wa.name")}: ${customer.name}\n`;
    msg += `📞 ${t("wa.phone")}: ${customer.phone}\n`;
    msg += `🏙️ ${t("wa.wilaya")}: ${customer.wilaya}\n`;
    if (customer.city) msg += `📍 ${t("wa.address")}: ${customer.city}\n`;
    msg += `🚚 ${t("wa.dtype")}: ${customer.deliveryType === "office" ? t("wa.dtype_office") : t("wa.dtype_home")}\n`;
    if (customer.notes) msg += `📝 ${t("wa.notes")}: ${customer.notes}\n`;
    msg += `💵 ${t("wa.payment")}: ${t("wa.cod")}\n`;
    window.open(waLink(msg), "_blank");
  }

  /* ---------- بطاقة منتج ---------- */
  function thumbHTML(p) {
    if (p.image) return `<img src="${esc(p.image)}" alt="${esc(pName(p))}" loading="lazy">`;
    return `<span>${p.emoji || "🎁"}</span>`;
  }
  function productCard(p) {
    const disc = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
    const out = p.stock === false;
    return `
      <article class="pcard">
        <span class="tilt-shine"></span>
        <a href="product.html?id=${p.id}" class="thumb">
          ${thumbHTML(p)}
          ${p.badge && !out ? `<span class="badge">${esc(p.badge)}</span>` : ""}
          ${out ? `<span class="badge out">${t("card.out")}</span>` : ""}
          ${disc > 0 && !out ? `<span class="disc">-${disc}%</span>` : ""}
        </a>
        <div class="body">
          <span class="cat-tag">${catLabel(p.category)}</span>
          <h3><a href="product.html?id=${p.id}">${esc(pName(p))}</a></h3>
          <div class="price">
            <span class="now">${fmt(p.price)}</span><span class="cur">${cur}</span>
            ${p.oldPrice ? `<span class="old">${fmt(p.oldPrice)}</span>` : ""}
          </div>
          <div class="actions">
            ${out
              ? `<button class="btn btn-ghost btn-sm" disabled>${t("card.unavailable")}</button>`
              : `<button class="btn btn-primary btn-sm add-btn" data-id="${p.id}">${t("card.add")}</button>`}
          </div>
        </div>
      </article>`;
  }
  function bindAddButtons(ctx = document) {
    $$(".add-btn", ctx).forEach((b) => b.addEventListener("click", () => addToCart(Number(b.dataset.id))));
  }

  /* ============================================================
     الترويسة/الفوتر + مبدّل اللغة
     ============================================================ */
  function initChrome() {
    $$("[data-store-name]").forEach((el) => (el.textContent = CFG.name));
    $$("[data-email]").forEach((el) => { el.textContent = CFG.email; if (el.tagName === "A") el.href = "mailto:" + CFG.email; });
    $$("[data-phone]").forEach((el) => { el.textContent = CFG.phoneDisplay || ""; });
    $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

    const socials = { facebook: CFG.facebook, instagram: CFG.instagram, tiktok: CFG.tiktok };
    Object.entries(socials).forEach(([k, v]) => {
      $$(`[data-social="${k}"]`).forEach((el) => { if (v) el.href = v; else el.style.display = "none"; });
    });

    const toggle = $(".menu-toggle");
    const nav = $(".nav");
    if (toggle && nav) toggle.addEventListener("click", () => nav.classList.toggle("open"));

    // مبدّل اللغة
    $$(".lang-switch").forEach((sw) => {
      const btn = $(".lang-btn", sw);
      if (btn) btn.addEventListener("click", (e) => { e.stopPropagation(); sw.classList.toggle("open"); });
      $$("[data-lang-opt]", sw).forEach((opt) => {
        opt.addEventListener("click", () => { I18N.setLang(opt.getAttribute("data-lang-opt")); sw.classList.remove("open"); });
      });
    });
    document.addEventListener("click", () => $$(".lang-switch.open").forEach((s) => s.classList.remove("open")));

    refreshWaLinks();
    updateCartCount();
  }

  function refreshWaLinks() {
    const waGeneric = waLink(t("wa.generic", { store: CFG.name }));
    $$("[data-wa-link]").forEach((el) => (el.href = waGeneric));
  }

  /* ============================================================
     الصفحة الرئيسية
     ============================================================ */
  function initHome() {
    const feat = $("#featured-grid");
    if (!feat) return;
    function render() {
      const picks = PRODUCTS.filter((p) => p.badge || p.oldPrice).slice(0, 8);
      const list = picks.length ? picks : PRODUCTS.slice(0, 8);
      feat.innerHTML = list.map(productCard).join("");
      bindAddButtons(feat);
    }
    rerenderers.push(render);
    render();
  }

  /* ============================================================
     صفحة المتجر
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
        list = list.filter((p) => [p.name, p.nameFr, p.nameEn, p.desc, p.descFr, p.descEn]
          .some((s) => (s || "").toLowerCase().includes(q)));
      }
      if (state.sort === "price-asc") list.sort((a, b) => a.price - b.price);
      else if (state.sort === "price-desc") list.sort((a, b) => b.price - a.price);
      else if (state.sort === "name") list.sort((a, b) => pName(a).localeCompare(pName(b), lang()));

      if (countLabel) countLabel.textContent = `${list.length} ${t("shop.count_unit")}`;
      grid.innerHTML = list.length
        ? list.map(productCard).join("")
        : `<div class="empty-state" style="grid-column:1/-1"><div class="em">🔍</div><h3>${t("shop.no_results_t")}</h3><p>${t("shop.no_results_p")}</p></div>`;
      bindAddButtons(grid);
      chips.forEach((c) => c.classList.toggle("active", c.dataset.cat === state.cat));
    }

    chips.forEach((c) => c.addEventListener("click", () => { state.cat = c.dataset.cat; render(); }));
    if (search) search.addEventListener("input", () => { state.q = search.value; render(); });
    if (sortSel) sortSel.addEventListener("change", () => { state.sort = sortSel.value; render(); });
    rerenderers.push(render);
    render();
  }

  /* ============================================================
     صفحة تفاصيل المنتج
     ============================================================ */
  function initProduct() {
    const root = $("#pdp-root");
    if (!root) return;
    const id = Number(new URLSearchParams(location.search).get("id"));

    let qty = 1;
    function render() {
      const p = byId(id);
      if (!p) {
        root.innerHTML = `<div class="empty-state"><div class="em">😕</div><h3>${t("pdp.notfound_t")}</h3><p>${t("pdp.notfound_p")}</p><a class="btn btn-primary" href="shop.html">${t("pdp.notfound_btn")}</a></div>`;
        return;
      }
      document.title = `${pName(p)} — ${CFG.name}`;
      const disc = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
      const out = p.stock === false;
      root.innerHTML = `
        <p class="breadcrumb"><a href="index.html">${t("nav.home")}</a> / <a href="shop.html?cat=${p.category}">${catLabel(p.category)}</a> / ${esc(pName(p))}</p>
        <div class="pdp">
          <div class="product-stage">
            <div class="stage-glow"></div>
            <div class="gallery">
              <span class="tilt-shine"></span>
              ${thumbHTML(p)}
              ${disc > 0 && !out ? `<span class="disc">-${disc}%</span>` : ""}
            </div>
          </div>
          <div class="info">
            <span class="cat-tag" style="color:var(--primary);font-weight:700">${catLabel(p.category)}</span>
            <h1>${esc(pName(p))}</h1>
            <div class="price">
              <span class="now">${money(p.price)}</span>
              ${p.oldPrice ? `<span class="old">${money(p.oldPrice)}</span>` : ""}
            </div>
            <p class="desc">${esc(pDesc(p))}</p>
            <div class="meta">
              ${p.ageGroup ? `<span class="tag">${t("pdp.age", { v: esc(p.ageGroup) })}</span>` : ""}
              <span class="tag">${t("pdp.cod_tag")}</span>
              <span class="tag">${t("pdp.delivery_tag")}</span>
            </div>
            <p>${out ? `<span class="out-stock">${t("pdp.out_stock")}</span>` : `<span class="in-stock">${t("pdp.in_stock")}</span>`}</p>
            ${out ? "" : `
            <div class="pdp-actions">
              <div class="qty">
                <button id="q-minus" type="button">−</button>
                <input id="q-input" type="text" value="${qty}" inputmode="numeric" readonly>
                <button id="q-plus" type="button">+</button>
              </div>
              <button class="btn btn-primary btn-lg" id="pdp-add">${t("pdp.add")}</button>
              <button class="btn btn-wa btn-lg" id="pdp-buy">${t("pdp.buy")}</button>
            </div>`}
          </div>
        </div>
        <div class="section-sm"></div>
        <div class="section-head" style="text-align:start;margin-bottom:18px"><h2 style="font-size:1.4rem">${t("pdp.related")}</h2></div>
        <div class="products-grid" id="related-grid"></div>`;

      if (!out) {
        const qi = $("#q-input");
        const getQ = () => Math.max(1, parseInt(qi.value, 10) || 1);
        $("#q-minus").addEventListener("click", () => { qi.value = Math.max(1, getQ() - 1); qty = Number(qi.value); });
        $("#q-plus").addEventListener("click", () => { qi.value = getQ() + 1; qty = Number(qi.value); });
        $("#pdp-add").addEventListener("click", () => addToCart(p.id, getQ()));
        $("#pdp-buy").addEventListener("click", () => {
          addToCart(p.id, getQ());
          const msg = `${t("pdp.wa_msg")}\n• ${pName(p)} ×${getQ()} = ${money(p.price * getQ())}\n${CFG.name}`;
          window.open(waLink(msg), "_blank");
        });
      }

      const rel = PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
      const rg = $("#related-grid");
      rg.innerHTML = rel.map(productCard).join("");
      bindAddButtons(rg);
    }
    rerenderers.push(render);
    render();
  }

  /* ============================================================
     صفحة السلة والدفع
     ============================================================ */
  function initCart() {
    const root = $("#cart-root");
    if (!root) return;

    let deliveryType = "home";
    const savedForm = {};

    function currentDelivery() {
      const sel = $("#f-wilaya");
      const code = Number(sel && sel.value);
      const w = WILAYAS.find((x) => x.code === code);
      if (!w) return { price: CFG.defaultDeliveryPrice || 0, wilaya: null };
      return { price: deliveryType === "office" ? w.office : w.home, wilaya: w };
    }

    function stash() {
      if ($("#f-name")) savedForm.name = $("#f-name").value;
      if ($("#f-phone")) savedForm.phone = $("#f-phone").value;
      if ($("#f-wilaya")) savedForm.wilaya = $("#f-wilaya").value;
      if ($("#f-city")) savedForm.city = $("#f-city").value;
      if ($("#f-notes")) savedForm.notes = $("#f-notes").value;
    }

    function render() {
      const cart = getCart();
      if (!cart.length) {
        root.innerHTML = `<div class="empty-state"><div class="em">🛒</div><h3>${t("cart.empty_t")}</h3><p>${t("cart.empty_p")}</p><a class="btn btn-primary btn-lg" href="shop.html">${t("cart.empty_btn")}</a></div>`;
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
                    <h4>${esc(pName(p))}</h4>
                    <div class="unit">${money(p.price)} ${t("cart.per_piece")}</div>
                    <div class="qty" style="margin-top:8px">
                      <button type="button" data-dec="${p.id}">−</button>
                      <input type="text" value="${i.qty}" readonly>
                      <button type="button" data-inc="${p.id}">+</button>
                    </div>
                  </div>
                  <div class="right">
                    <span class="line-total">${money(p.price * i.qty)}</span>
                    <button class="remove" data-rem="${p.id}">${t("cart.remove")}</button>
                  </div>
                </div>`;
              }).join("")}
            </div>
          </div>

          <div class="summary">
            <h3>${t("cart.summary")}</h3>
            <div class="line"><span>${t("cart.subtotal")}</span><span>${money(sub)}</span></div>
            <div class="line"><span>${t("cart.delivery")} ${del.wilaya ? `(${wName(del.wilaya)})` : ""}</span><span>${isFree ? t("cart.free") : (del.wilaya ? money(delPrice) : t("cart.by_wilaya"))}</span></div>
            <div class="line total"><span>${t("cart.total")}</span><span>${money(total)}</span></div>
            ${CFG.freeShippingThreshold && !isFree && remain > 0 ? `<div class="free-note">${t("cart.free_add_pre")}${money(remain)}${t("cart.free_add_post")}</div>` : ""}
            ${isFree ? `<div class="free-note">${t("cart.free_congrats")}</div>` : ""}

            <div style="margin-top:20px">
              <h3 style="font-size:1.1rem">${t("cart.info_title")}</h3>
              <form id="order-form" novalidate>
                <div class="form-row">
                  <label>${t("cart.f_name")} <span class="req">*</span></label>
                  <input id="f-name" type="text" placeholder="${t("cart.ph_name")}" autocomplete="name">
                  <div class="field-error" id="e-name">${t("cart.err_name")}</div>
                </div>
                <div class="form-row">
                  <label>${t("cart.f_phone")} <span class="req">*</span></label>
                  <input id="f-phone" type="tel" placeholder="${t("cart.ph_phone")}" inputmode="tel" autocomplete="tel">
                  <div class="field-error" id="e-phone">${t("cart.err_phone")}</div>
                </div>
                <div class="form-row">
                  <label>${t("cart.f_wilaya")} <span class="req">*</span></label>
                  <select id="f-wilaya"></select>
                  <div class="field-error" id="e-wilaya">${t("cart.err_wilaya")}</div>
                </div>
                <div class="form-row">
                  <label>${t("cart.f_city")}</label>
                  <input id="f-city" type="text" placeholder="${t("cart.ph_city")}">
                </div>
                <div class="form-row">
                  <label>${t("cart.dtype")}</label>
                  <div class="radio-cards">
                    <div class="radio-card ${deliveryType === "home" ? "active" : ""}" data-dtype="home">${t("cart.dtype_home")}</div>
                    <div class="radio-card ${deliveryType === "office" ? "active" : ""}" data-dtype="office">${t("cart.dtype_office")}</div>
                  </div>
                </div>
                <div class="form-row">
                  <label>${t("cart.f_notes")}</label>
                  <textarea id="f-notes" rows="2" placeholder="${t("cart.ph_notes")}"></textarea>
                </div>
                <button type="submit" class="btn btn-wa btn-block btn-lg">${t("cart.submit")}</button>
                <p style="text-align:center;color:var(--muted);font-size:.82rem;margin-top:10px">${t("cart.cod_note")}</p>
              </form>
            </div>
          </div>
        </div>`;

      const sel = $("#f-wilaya");
      sel.innerHTML = `<option value="">${t("cart.choose_wilaya")}</option>` +
        WILAYAS.map((w) => `<option value="${w.code}">${w.code} - ${wName(w)}</option>`).join("");
      if (savedForm.wilaya) sel.value = savedForm.wilaya;
      if (savedForm.name) $("#f-name").value = savedForm.name;
      if (savedForm.phone) $("#f-phone").value = savedForm.phone;
      if (savedForm.city) $("#f-city").value = savedForm.city;
      if (savedForm.notes) $("#f-notes").value = savedForm.notes;

      bindCartEvents();
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
      $$("[data-dtype]").forEach((c) => c.addEventListener("click", () => { deliveryType = c.dataset.dtype; stash(); render(); }));
      const wsel = $("#f-wilaya");
      if (wsel) wsel.addEventListener("change", () => { stash(); render(); });
      const form = $("#order-form");
      if (form) form.addEventListener("submit", onSubmit);
    }

    function showErr(id, show) { const el = $("#e-" + id); if (el) el.classList.toggle("show", show); }

    function onSubmit(e) {
      e.preventDefault();
      stash();
      const name = ($("#f-name").value || "").trim();
      const phone = ($("#f-phone").value || "").trim();
      const code = Number($("#f-wilaya").value);
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
        wilaya: `${w.code} - ${wName(w)}`,
        city: ($("#f-city").value || "").trim(),
        deliveryType,
        deliveryPrice: isFree ? 0 : price,
        notes: ($("#f-notes").value || "").trim(),
      });
    }

    rerenderers.push(render);
    render();
  }

  /* ============================================================
     FAQ
     ============================================================ */
  function initFAQ() {
    $$(".faq-item h4").forEach((h) => h.addEventListener("click", () => h.parentElement.classList.toggle("open")));
  }

  /* ---------- التشغيل ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    I18N.apply(document);
    initChrome();
    initHome();
    initShop();
    initProduct();
    initCart();
    initFAQ();
  });

  // إعادة الرسم عند تغيير اللغة
  document.addEventListener("langchange", function () {
    refreshWaLinks();
    rerenderers.forEach((fn) => { try { fn(); } catch (e) {} });
  });

  window.KOF = { addToCart, getCart, openWhatsAppOrder };
})();
