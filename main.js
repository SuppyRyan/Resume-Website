/* Ryan Lin — site behaviour: theme, mobile nav, scroll header, reveals,
   project modal, gallery lightbox, project filters. Vanilla JS, no deps. */
(function () {
  "use strict";
  var root = document.documentElement;

  /* ---------- theme ---------- */
  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    try { localStorage.setItem("rl-theme", t); } catch (e) {}
    var b = document.querySelector(".theme-toggle");
    if (b) b.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
  }
  // initial theme is set inline in <head> to avoid flash; just wire the button.
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest(".theme-toggle");
    if (!t) return;
    applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });

  /* ---------- mobile nav ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".mobile-nav");
  function closeNav() { document.body.classList.remove("nav-open"); if (mobileNav) mobileNav.classList.remove("open"); if (navToggle) navToggle.setAttribute("aria-expanded", "false"); }
  function toggleNav() {
    var open = document.body.classList.toggle("nav-open");
    if (mobileNav) mobileNav.classList.toggle("open", open);
    if (navToggle) navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  }
  if (navToggle) navToggle.addEventListener("click", toggleNav);
  if (mobileNav) mobileNav.addEventListener("click", function (e) { if (e.target.tagName === "A") closeNav(); });

  /* ---------- sticky header shadow ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("scrolled", window.scrollY > 8); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- project filters ---------- */
  var filterBar = document.querySelector(".filters");
  if (filterBar) {
    var items = document.querySelectorAll("[data-cats]");
    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter");
      if (!btn) return;
      filterBar.querySelectorAll(".filter").forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      var cat = btn.getAttribute("data-filter");
      items.forEach(function (it) {
        var show = cat === "all" || (" " + it.getAttribute("data-cats") + " ").indexOf(" " + cat + " ") > -1;
        it.classList.toggle("hide", !show);
      });
    });
  }

  /* ---------- modal / lightbox ---------- */
  var modal = document.querySelector(".modal");
  var lastFocus = null;
  function openModal(html) {
    if (!modal) return;
    var card = modal.querySelector(".modal-card-inner");
    if (card) card.innerHTML = html;
    lastFocus = document.activeElement;
    modal.classList.add("open");
    document.body.classList.add("modal-open");
    var c = modal.querySelector(".modal-close");
    if (c) c.focus();
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    document.body.classList.remove("modal-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target.closest(".modal-close") || e.target.classList.contains("modal-backdrop")) closeModal();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { if (modal && modal.classList.contains("open")) closeModal(); else if (document.body.classList.contains("nav-open")) closeNav(); }
    if (e.key === "Tab" && modal && modal.classList.contains("open")) {
      var f = modal.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // open project modal from a card whose details live in a <template> sibling/by id
  document.addEventListener("click", function (e) {
    var trg = e.target.closest("[data-modal]");
    if (!trg) return;
    e.preventDefault();
    var tpl = document.getElementById(trg.getAttribute("data-modal"));
    if (tpl) openModal(tpl.innerHTML);
  });

  // gallery lightbox: data-lightbox holds an image src (or it's a styled placeholder div)
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-lightbox]");
    if (!t) return;
    e.preventDefault();
    var src = t.getAttribute("data-lightbox");
    var cap = t.getAttribute("data-caption") || "";
    var inner = '<button class="modal-close" aria-label="Close">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>';
    if (src && src !== "#") {
      inner += '<div class="m-thumb" style="aspect-ratio:auto"><img src="' + src + '" alt="' + cap.replace(/"/g, "&quot;") + '"></div>';
    } else {
      // clone the placeholder visual
      var ph = t.querySelector(".ph");
      inner += '<div class="m-thumb" style="aspect-ratio:16/10">' + (ph ? ph.outerHTML : "") + '</div>';
    }
    if (cap) inner += '<div class="m-body"><p style="margin:0">' + cap + '</p></div>';
    openModal(inner);
  });

  /* ---------- footer year ---------- */
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
