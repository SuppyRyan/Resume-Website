/* Ryan Lin — site behaviour: theme, mobile nav, scroll header, reveals,
   project modal, gallery lightbox, project filters, and the motion layer. */
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
  // Projects are linkable (/work#tickmark) and live in history: Back closes an open project instead of
  // leaving the page. A project opened by the page (from a link) closes by dropping the hash.
  function isOpen() { return modal && modal.classList.contains("open"); }
  function requestClose() {
    if (!isOpen()) return;
    if (history.state && history.state.project) history.back();
    else { closeModal(); if (location.hash) history.replaceState(null, "", location.pathname + location.search); }
  }
  function openProject(row, push) {
    var tpl = document.getElementById(row.getAttribute("data-modal"));
    if (!tpl) return;
    openModal(tpl.innerHTML);
    lastFocus = row;
    if (push && row.id) history.pushState({ project: row.id }, "", "#" + row.id);
  }
  window.addEventListener("popstate", function () {
    var id = history.state && history.state.project;
    if (!id && isOpen()) closeModal();
    else if (id && !isOpen()) { var row = document.getElementById(id); if (row) openProject(row, false); }
  });
  if (location.hash.length > 1) {
    var linked = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (linked && linked.hasAttribute("data-modal")) { linked.scrollIntoView({ block: "center" }); openProject(linked, false); }
  }
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target.closest(".modal-close") || e.target.classList.contains("modal-backdrop")) requestClose();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { if (isOpen()) requestClose(); else if (document.body.classList.contains("nav-open")) closeNav(); }
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
    openProject(trg, true);
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

  /* ============================================================
     MOTION LAYER: hero canvas (candle field), About roles, card canvases.
     No animation library. Scrolling and the pointer are the browser's own:
     a smoothed scroll, a drawn cursor, magnetic buttons and letters that
     chase the mouse all trail the hand, which reads as lag. The timeline
     rail is a CSS scroll-driven animation (styles.css).
     Page changes use the native View Transition (styles.css), so a click
     starts loading the next page immediately.
     All disabled under prefers-reduced-motion.
     ============================================================ */
  var rmq = window.matchMedia("(prefers-reduced-motion: reduce)");
  var prefersReduced = rmq.matches;
  rmq.addEventListener && rmq.addEventListener("change", function (e) { prefersReduced = e.matches; });

  // Canvas colours come from CSS variables. Reading them is a style recalculation, so it
  // happens once per theme, not once per frame.
  var themeVersion = 0;
  new MutationObserver(function () { themeVersion++; }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

  /* ---------- Hero canvas: drifting candle field + scroll-scrub compression ---------- */
  function bootHeroCanvas() {
    var canvas = document.getElementById("hero-canvas");
    if (!canvas) return;
    if (prefersReduced) { canvas.style.display = "none"; return; }
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0;
    var candles = [];
    var scrollProgress = 0;
    var clock = 0;
    var rafId = 0;
    var visible = true;

    var rgbCache = null, rgbVersion = -1;
    function accentRGB() {
      if (rgbVersion === themeVersion) return rgbCache;
      var s = getComputedStyle(document.documentElement);
      var hex = (s.getPropertyValue("--accent") || "#cf924f").trim().replace("#", "");
      if (hex.length === 3) hex = hex.split("").map(function (c) { return c + c; }).join("");
      rgbCache = [parseInt(hex.substr(0, 2), 16), parseInt(hex.substr(2, 2), 16), parseInt(hex.substr(4, 2), 16)];
      rgbVersion = themeVersion;
      return rgbCache;
    }

    function seed() {
      candles = [];
      var n = Math.max(28, Math.floor(w / 28));
      for (var i = 0; i < n; i++) {
        var depth = Math.random();
        candles.push({
          x: Math.random() * w,
          baseY: h * (0.32 + Math.random() * 0.5),
          width: 3 + depth * 7,
          height: 16 + Math.random() * 92,
          wick: 6 + Math.random() * 22,
          speed: 0.06 + depth * 0.42,
          depth: depth,
          phase: Math.random() * Math.PI * 2,
          bull: Math.random() > 0.42
        });
      }
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width  = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    // step: how many 16 ms frames of motion this draw covers (2 at the 30 fps cap).
    function draw(step) {
      step = step || 1;
      ctx.clearRect(0, 0, w, h);
      var rgb = accentRGB();
      var r = rgb[0], g = rgb[1], b = rgb[2];
      // One colour string per theme; each candle varies only its opacity.
      ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
      var compress = scrollProgress;
      var centerY = h * 0.58;

      for (var i = 0; i < candles.length; i++) {
        var c = candles[i];
        c.x -= c.speed * step * (1 - compress * 0.5);
        if (c.x < -24) c.x = w + 24;

        var bob = Math.sin(clock * 0.0009 + c.phase) * 5;
        var y = c.baseY + bob;
        var ch = c.height * (1 - compress * 0.92);
        var ty = y * (1 - compress) + centerY * compress;
        var alpha = (0.08 + c.depth * 0.26) * (1 - compress * 0.7);

        // body
        ctx.globalAlpha = alpha;
        ctx.fillRect(c.x, ty - ch / 2, c.width, ch);
        // wicks
        ctx.globalAlpha = alpha * 0.65;
        var wickLen = c.wick * (1 - compress);
        ctx.fillRect(c.x + c.width / 2 - 0.5, ty - ch / 2 - wickLen, 1, wickLen);
        ctx.fillRect(c.x + c.width / 2 - 0.5, ty + ch / 2,         1, wickLen);
      }

      ctx.globalAlpha = 1;

      // sparkline emerging during compression
      if (compress > 0.04) {
        var lineAlpha = Math.min(1, (compress - 0.04) * 1.4);
        ctx.beginPath();
        ctx.strokeStyle = "rgba(" + r + "," + g + "," + b + "," + lineAlpha.toFixed(3) + ")";
        ctx.lineWidth = 1.3;
        var steps = 64;
        for (var j = 0; j <= steps; j++) {
          var xx = (j / steps) * w;
          var yy = centerY + Math.sin(j * 0.34 + clock * 0.0011) * 9 * (1 - compress * 0.55);
          if (j === 0) ctx.moveTo(xx, yy);
          else ctx.lineTo(xx, yy);
        }
        ctx.stroke();
      }
    }

    // Off-screen, the loop stops entirely instead of spinning empty frames. On screen it draws at
    // 30 fps: the drift is slow enough that 60 looks no different and costs twice the CPU.
    // Scroll-scrub: the candles compress into a sparkline as the hero leaves, from its top at the
    // top of the viewport until its bottom is 30% down. The loop already runs while the hero is on
    // screen, so it reads scrollY (no layout cost) instead of listening to scroll, and eases toward
    // it so a wheel notch glides rather than jumps.
    var heroEl = document.querySelector(".hero"), scrubFrom = 0, scrubTo = 1;
    function measureScrub() {
      if (!heroEl) return;
      var r = heroEl.getBoundingClientRect();
      scrubFrom = r.top + window.scrollY;
      scrubTo = Math.max(scrubFrom + 1, r.bottom + window.scrollY - window.innerHeight * 0.3);
    }
    var lastDraw = 0;
    function tick(now) {
      if (!visible) { rafId = 0; lastDraw = 0; return; }
      rafId = requestAnimationFrame(tick);
      if (lastDraw && now - lastDraw < 30) return;
      var elapsed = lastDraw ? Math.min(now - lastDraw, 100) : 16;
      lastDraw = now;
      clock += elapsed;
      var target = Math.min(1, Math.max(0, (window.scrollY - scrubFrom) / (scrubTo - scrubFrom)));
      scrollProgress += (target - scrollProgress) * (1 - Math.exp(-elapsed / 180));
      draw(elapsed / 16);
    }
    function start() { if (!rafId) rafId = requestAnimationFrame(tick); }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) start();
      }, { threshold: 0.01 }).observe(canvas);
    }

    window.addEventListener("resize", function () { resize(); measureScrub(); });
    resize();
    measureScrub();
    start();

  }

  /* ---------- About scrollytelling: swap roles as chunks scroll past ---------- */
  function bootAboutScroll() {
    var roles = document.querySelectorAll(".about-roles .role");
    var chunks = document.querySelectorAll(".about-col .about-chunk");
    if (!roles.length || !chunks.length) return;

    function setActive(i) {
      for (var r = 0; r < roles.length; r++) {
        roles[r].classList.toggle("is-active", r === i);
      }
    }

    // Reduced motion: light up the first role and leave it.
    setActive(0);
    if (prefersReduced || !("IntersectionObserver" in window)) return;
    // A role lights up while its chunk crosses the band 42% to 62% down the viewport.
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) setActive(Array.prototype.indexOf.call(chunks, en.target));
      });
    }, { rootMargin: "-42% 0px -38% 0px" });
    chunks.forEach(function (chunk) { io.observe(chunk); });
  }

  /* ---------- Featured-Work card canvases (domain-specific demos) ---------- */
  function bootCardCanvases() {
    var canvases = document.querySelectorAll(".card-canvas");
    if (!canvases.length) return;

    var accentCache = null, accentVersion = -1;
    function accent() {
      if (accentVersion === themeVersion) return accentCache;
      accentVersion = themeVersion;
      var s = getComputedStyle(document.documentElement);
      return accentCache = {
        bright: (s.getPropertyValue("--accent-bright") || "#e7ad6a").trim(),
        base:   (s.getPropertyValue("--accent")        || "#cf924f").trim(),
        deep:   (s.getPropertyValue("--accent-deep")   || "#a96c30").trim(),
        text:   (s.getPropertyValue("--text")          || "#f2ead7").trim(),
        dim:    (s.getPropertyValue("--text-faint")    || "#857a66").trim()
      };
    }

    function setupCanvas(canvas) {
      var ctx = canvas.getContext("2d");
      if (!ctx) return null;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = 0, h = 0;
      function resize() {
        var r = canvas.getBoundingClientRect();
        w = r.width; h = r.height;
        canvas.width = Math.max(1, Math.floor(w * dpr));
        canvas.height = Math.max(1, Math.floor(h * dpr));
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      resize();
      var visible = true, step = null, rafId = 0;
      // Animates only while on screen; off-screen the loop stops rather than spinning empty frames.
      function frame() { if (!visible || !step) { rafId = 0; return; } step(); rafId = requestAnimationFrame(frame); }
      function resume() { if (!rafId && step && !prefersReduced) rafId = requestAnimationFrame(frame); }
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          visible = entries[0].isIntersecting;
          if (visible) resume();
        }, { threshold: 0.01 }).observe(canvas);
      }
      window.addEventListener("resize", resize);
      return {
        ctx: ctx,
        dims: function () { return { w: w, h: h }; },
        run: function (fn) { step = fn; resume(); }
      };
    }

    // 1) Equity curve — trading-bot card
    function initEquityCurve(canvas) {
      var s = setupCanvas(canvas); if (!s) return;
      var points = [];
      var t = 0;

      // Fixed seed: an illustrative curve that is identical on every load (a random one read as a
      // result that changed each time the page was reloaded).
      var seed = 20240701;
      function rand() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
      function generate() {
        points = [];
        var n = 90;
        var price = 100;
        for (var i = 0; i < n; i++) {
          var noise = (rand() - 0.46) * 1.6;
          var trend = 0.16;
          price = price + noise + trend;
          if (i > 30 && i < 40) price -= 0.5; // small drawdown
          points.push(price);
        }
      }
      generate();

      function draw() {
        var d = s.dims(); var w = d.w, h = d.h;
        var ctx = s.ctx;
        ctx.clearRect(0, 0, w, h);
        var c = accent();

        var max = -Infinity, min = Infinity;
        for (var i = 0; i < points.length; i++) {
          if (points[i] > max) max = points[i];
          if (points[i] < min) min = points[i];
        }
        var range = (max - min) || 1;
        var pad = 14;

        function px(i) { return pad + (i / (points.length - 1)) * (w - pad * 2); }
        function py(v) { return h - pad - ((v - min) / range) * (h - pad - 34); }  // top 34 px kept for the labels

        ctx.strokeStyle = "rgba(150,135,110,.16)";
        ctx.lineWidth = 1;
        for (var g = 1; g < 4; g++) {
          var gy = pad + ((h - pad * 2) * g) / 4;
          ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
        }

        var grow = Math.min(1, t / 90);
        var lastVis = Math.max(2, Math.floor(grow * points.length));

        ctx.beginPath();
        for (var i = 0; i < lastVis; i++) {
          var x = px(i), y = py(points[i]);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.lineTo(px(lastVis - 1), h);
        ctx.lineTo(px(0), h);
        ctx.closePath();
        var grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, "rgba(207,146,79,.28)");
        grad.addColorStop(1, "rgba(207,146,79,0)");
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = c.bright;
        ctx.lineWidth = 2.4;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        for (var i = 0; i < lastVis; i++) {
          var x = px(i), y = py(points[i]);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        if (lastVis > 0) {
          var lx = px(lastVis - 1), ly = py(points[lastVis - 1]);
          var pulse = 3.4 + Math.sin(t * 0.09) * 1.6;
          ctx.beginPath();
          ctx.arc(lx, ly, pulse + 7, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(231,173,106,.16)";
          ctx.fill();
          ctx.beginPath();
          ctx.arc(lx, ly, pulse, 0, Math.PI * 2);
          ctx.fillStyle = c.bright;
          ctx.fill();
        }

        ctx.font = "10px 'Space Mono', monospace";
        ctx.fillStyle = c.dim;
        ctx.textBaseline = "top";
        ctx.fillText("equity · illustrative", 14, 12);
        ctx.textAlign = "right";
        ctx.fillStyle = c.base;
        var endVal = points[lastVis - 1] || points[0];
        var pct = ((endVal / points[0]) - 1) * 100;
        ctx.fillText((pct >= 0 ? "+" : "") + pct.toFixed(2) + "%", w - 14, 12);
        ctx.textAlign = "left";
        t++;
      }

      draw(); // initial frame
      if (prefersReduced) { t = 200; draw(); return; }
      s.run(draw);
    }

    // 2) Filings feed — EDGAR screener card
    function initFilingsFeed(canvas) {
      var s = setupCanvas(canvas); if (!s) return;
      var rows = [
        { ticker: "AAPL", filing: "10-K", sentiment: 0.72, delta: +0.04 },
        { ticker: "MSFT", filing: "10-Q", sentiment: 0.85, delta: +0.02 },
        { ticker: "NVDA", filing: "10-Q", sentiment: 0.91, delta: -0.01 },
        { ticker: "TSLA", filing: "10-K", sentiment: 0.41, delta: -0.08 },
        { ticker: "AMZN", filing: "10-Q", sentiment: 0.68, delta: +0.05 }
      ];
      var t = 0, activeRow = 0;

      function draw() {
        var d = s.dims(); var w = d.w, h = d.h;
        var ctx = s.ctx;
        ctx.clearRect(0, 0, w, h);
        var c = accent();
        var pad = 14;

        // header
        ctx.font = "10px 'Space Mono', monospace";
        ctx.fillStyle = c.dim;
        ctx.textBaseline = "top";
        ctx.fillText("// edgar feed · illustrative", pad, 12);

        // rows
        var rowsTop = 36;
        var rowH = (h - rowsTop - pad) / rows.length;
        for (var i = 0; i < rows.length; i++) {
          var r = rows[i];
          var y = rowsTop + i * rowH + rowH / 2;

          // active row highlight
          if (i === activeRow) {
            ctx.fillStyle = "rgba(207,146,79,.10)";
            ctx.fillRect(pad - 6, rowsTop + i * rowH + 2, w - (pad - 6) * 2, rowH - 4);
          }

          ctx.textBaseline = "middle";
          ctx.font = "bold 11px 'Space Mono', monospace";
          ctx.fillStyle = (i === activeRow) ? c.bright : c.text;
          ctx.fillText(r.ticker, pad, y);

          ctx.font = "10px 'Space Mono', monospace";
          ctx.fillStyle = c.dim;
          ctx.fillText(r.filing, pad + 50, y);

          // sentiment bar
          var barX = pad + 96;
          var barW = w - barX - pad - 56;
          var barH = 3;
          ctx.fillStyle = "rgba(150,135,110,.20)";
          ctx.fillRect(barX, y - 1.5, barW, barH);
          ctx.fillStyle = (i === activeRow) ? c.bright : c.base;
          ctx.fillRect(barX, y - 1.5, barW * r.sentiment, barH);

          // delta
          ctx.font = "10px 'Space Mono', monospace";
          ctx.fillStyle = r.delta >= 0 ? "#7fb88a" : "#d97b6a";
          ctx.textAlign = "right";
          ctx.fillText((r.delta >= 0 ? "+" : "") + r.delta.toFixed(2), w - pad, y);
          ctx.textAlign = "left";
          ctx.textBaseline = "top";
        }
      }

      draw();
      s.run(function () {
        t++;
        if (t % 110 === 0) activeRow = (activeRow + 1) % rows.length;
        draw();
      });
    }

    // 3) Stress curves — R modeling card
    function initStressCurves(canvas) {
      var s = setupCanvas(canvas); if (!s) return;
      var t = 0;
      function draw() {
        var d = s.dims(); var w = d.w, h = d.h;
        var ctx = s.ctx;
        ctx.clearRect(0, 0, w, h);
        var c = accent();
        var pad = 14;

        // grid
        ctx.strokeStyle = "rgba(150,135,110,.16)";
        ctx.lineWidth = 1;
        for (var g = 1; g < 4; g++) {
          var gy = pad + ((h - pad * 2) * g) / 4;
          ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
        }

        var curves = [
          { color: c.bright, offset:  0.00, width: 2.5, dash: [],     label: "baseline" },
          { color: c.base,   offset:  0.22, width: 1.8, dash: [],     label: "+200bps"  },
          { color: c.dim,    offset: -0.20, width: 1.5, dash: [3, 4], label: "-200bps"  }
        ];

        curves.forEach(function (cv, idx) {
          ctx.beginPath();
          ctx.strokeStyle = cv.color;
          ctx.lineWidth = cv.width;
          ctx.setLineDash(cv.dash);
          var steps = 64;
          for (var i = 0; i <= steps; i++) {
            var frac = i / steps;
            var base = 1 - Math.pow(frac, 1.45 + cv.offset);
            var wobble = Math.sin(t * 0.012 + frac * 5 + idx * 1.3) * 0.018;
            var x = pad + frac * (w - pad * 2);
            var y = pad + (1 - base - wobble) * (h - pad * 2);
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();
        });
        ctx.setLineDash([]);

        // legend
        ctx.font = "10px 'Space Mono', monospace";
        ctx.textBaseline = "top";
        ctx.fillStyle = c.dim;
        ctx.fillText("// amortization · ±200bps stress", pad, 12);
      }

      draw();
      s.run(function () { t++; draw(); });
    }

    // Tickmark: practice questions per exam section, one row lit at a time.
    function initQuestionBank(canvas) {
      var s = setupCanvas(canvas); if (!s) return;
      var rows = [
        { code: "FAR", n: 4988 }, { code: "CFA L1", n: 1024 }, { code: "CAPM", n: 1004 },
        { code: "SIE", n: 806 }, { code: "TCP", n: 567 }, { code: "AUD", n: 504 }
      ];
      var max = 4988, t = 0, activeRow = 0;

      function draw() {
        var d = s.dims(); var w = d.w, h = d.h;
        var ctx = s.ctx;
        ctx.clearRect(0, 0, w, h);
        var c = accent();
        var pad = 14;

        ctx.font = "10px 'Space Mono', monospace";
        ctx.fillStyle = c.dim;
        ctx.textBaseline = "top";
        ctx.fillText("// tickmark · questions by exam", pad, 12);

        var rowsTop = 36;
        var rowH = (h - rowsTop - pad) / rows.length;
        for (var i = 0; i < rows.length; i++) {
          var r = rows[i];
          var y = rowsTop + i * rowH + rowH / 2;
          if (i === activeRow) {
            ctx.fillStyle = "rgba(207,146,79,.10)";
            ctx.fillRect(pad - 6, rowsTop + i * rowH + 2, w - (pad - 6) * 2, rowH - 4);
          }
          ctx.textBaseline = "middle";
          ctx.font = "bold 11px 'Space Mono', monospace";
          ctx.fillStyle = (i === activeRow) ? c.bright : c.text;
          ctx.fillText(r.code, pad, y);

          // square-root scale so the smaller banks still read next to FAR
          var barX = pad + 62;
          var barW = w - barX - pad - 48;
          ctx.fillStyle = "rgba(150,135,110,.20)";
          ctx.fillRect(barX, y - 1.5, barW, 3);
          ctx.fillStyle = (i === activeRow) ? c.bright : c.base;
          ctx.fillRect(barX, y - 1.5, barW * Math.sqrt(r.n / max), 3);

          ctx.font = "10px 'Space Mono', monospace";
          ctx.fillStyle = c.dim;
          ctx.textAlign = "right";
          ctx.fillText(r.n.toLocaleString("en-US"), w - pad, y);
          ctx.textAlign = "left";
          ctx.textBaseline = "top";
        }
      }

      draw();
      s.run(function () {
        t++;
        if (t % 110 === 0) activeRow = (activeRow + 1) % rows.length;
        draw();
      });
    }

    canvases.forEach(function (canvas) {
      var type = canvas.getAttribute("data-canvas-type");
      if (type === "equity-curve")   initEquityCurve(canvas);
      else if (type === "filings-feed")   initFilingsFeed(canvas);
      else if (type === "stress-curves")  initStressCurves(canvas);
      else if (type === "question-bank")  initQuestionBank(canvas);
    });
  }

  /* ---------- Console signature (DevTools easter egg) ---------- */
  (function signCon() {
    if (!window.console || !console.log) return;
    if (window.__rl_signed) return;
    window.__rl_signed = true;
    var sig = [
      "",
      "    %c┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓",
      "    %c┃  %cRyan Lin  %c·  %cAudit · Models · Code%c     ┃",
      "    %c┃  %cest. 2026 · Fremont, California%c     ┃",
      "    %c┃                                    ┃",
      "    %c┃  %cryanlinbusinesses@gmail.com%c         ┃",
      "    %c┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛",
      ""
    ].join("\n");
    var dim    = "color:#857a66;font-family:monospace;";
    var copper = "color:#cf924f;font-family:monospace;";
    var bright = "color:#e7ad6a;font-family:monospace;font-weight:700;";
    try {
      console.log(
        sig,
        copper,
        copper, bright, copper, copper, copper,
        copper, dim, copper,
        copper,
        copper, bright, copper,
        copper
      );
      console.log("%c→ looking at the code? say hi.", "color:#cf924f;font-family:monospace;font-style:italic;");
    } catch (e) {}
  })();

  function bootMotion() {
    bootHeroCanvas();
    bootAboutScroll();
    bootCardCanvases();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootMotion);
  else bootMotion();
})();
