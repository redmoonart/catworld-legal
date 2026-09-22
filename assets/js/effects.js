/* ============================================================
   Kids of the Future — تأثيرات التصميم الفاخر (3D / حركة)
   ظهور عند التمرير + إمالة ثلاثية الأبعاد + بارالاكس للهيرو
   يحترم تفضيل تقليل الحركة، ويعمل فقط على الأجهزة المكتبية للإمالة
   ============================================================ */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function onReady(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  onReady(function () {
    setupReveal();
    if (!reduce && fine) {
      setupTilt();
      setupHeroParallax();
    }
  });

  /* ---------- ظهور تدريجي عند التمرير ---------- */
  function setupReveal() {
    var sel = ".section-head,.feature,.cat-card,.info-card,.cod-banner,.products-grid,.prose,.faq-item,.hero-trust,.summary,.cart-list,.pdp";
    var els = [].slice.call(document.querySelectorAll(sel));
    els.forEach(function (el, i) {
      el.classList.add("reveal");
      // تأخير متدرّج للعناصر المتجاورة داخل نفس الصف
      if (el.parentElement && el.parentElement.children.length > 1) {
        var idx = Array.prototype.indexOf.call(el.parentElement.children, el);
        el.style.transitionDelay = Math.min(idx, 5) * 70 + "ms";
      }
    });
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("reveal-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("reveal-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- إمالة ثلاثية الأبعاد تتبع المؤشر ---------- */
  function setupTilt() {
    var sel = ".pcard,.cat-card,.feature,.info-card";
    var current = null;

    // حقن طبقة اللمعان في البطاقات الثابتة (المنتجات تحملها من القالب)
    [].slice.call(document.querySelectorAll(".cat-card,.feature,.info-card")).forEach(function (el) {
      if (!el.querySelector(".tilt-shine")) {
        var s = document.createElement("span");
        s.className = "tilt-shine";
        el.appendChild(s);
      }
    });

    function clear(el) {
      el.style.transform = "";
      el.style.transition = "transform .35s cubic-bezier(.16,.84,.44,1)";
      el.style.zIndex = "";
      var sh = el.querySelector(".tilt-shine");
      if (sh) sh.style.opacity = "0";
    }

    document.addEventListener("pointermove", function (e) {
      var card = e.target.closest ? e.target.closest(sel) : null;
      if (current && current !== card) { clear(current); current = null; }
      if (!card) return;
      current = card;
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform =
        "perspective(760px) rotateX(" + (-py * 6).toFixed(2) + "deg) rotateY(" +
        (px * 8).toFixed(2) + "deg) translateY(-6px)";
      card.style.transition = "transform .05s linear";
      card.style.zIndex = "3";
      var sh = card.querySelector(".tilt-shine");
      if (sh) {
        sh.style.opacity = "1";
        sh.style.background =
          "radial-gradient(320px circle at " + (px * 100 + 50) + "% " + (py * 100 + 50) +
          "%, rgba(255,255,255,.35), transparent 45%)";
      }
    }, { passive: true });

    document.addEventListener("pointerleave", function () {
      if (current) { clear(current); current = null; }
    });
  }

  /* ---------- بارالاكس للهيرو ---------- */
  function setupHeroParallax() {
    var stage = document.querySelector(".hero-cine");
    if (!stage) return;
    var img = stage.querySelector(".hero-key-img");
    var fx = stage.querySelector(".hero-fx");
    var raf = null, tx = 0, ty = 0;

    stage.addEventListener("pointermove", function (e) {
      var r = stage.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(apply);
    });
    stage.addEventListener("pointerleave", function () {
      tx = 0; ty = 0;
      if (!raf) raf = requestAnimationFrame(apply);
    });
    function apply() {
      raf = null;
      if (img) img.style.transform = "scale(1.05) translate(" + (tx * -12) + "px," + (ty * -9) + "px)";
      if (fx) fx.style.transform = "translate(" + (tx * 18) + "px," + (ty * 14) + "px)";
    }
  }
})();
