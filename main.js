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

  /* ============================================================
     MOTION LAYER — Lenis smooth scroll, GSAP, kinetic hero,
     hero canvas (candle field), custom cursor.
     All gracefully disabled under prefers-reduced-motion or
     when libraries fail to load (CDN block / offline).
     ============================================================ */
  var rmq = window.matchMedia("(prefers-reduced-motion: reduce)");
  var prefersReduced = rmq.matches;
  rmq.addEventListener && rmq.addEventListener("change", function (e) { prefersReduced = e.matches; });

  /* ---------- Lenis smooth scroll + GSAP ticker sync ---------- */
  var lenis = null;
  function bootLenis() {
    if (prefersReduced || !window.Lenis) return;
    try {
      lenis = new window.Lenis({
        duration: 1.1,
        easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        smoothWheel: true,
        smoothTouch: false,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5
      });
      if (window.gsap && window.ScrollTrigger) {
        lenis.on("scroll", window.ScrollTrigger.update);
        window.gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
        window.gsap.ticker.lagSmoothing(0);
      } else {
        var raf = function (time) { lenis.raf(time); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
      }
    } catch (err) { lenis = null; }
  }

  /* ---------- Kinetic name: split into chars + cursor-driven parallax ---------- */
  function bootKineticName() {
    var nodes = document.querySelectorAll("[data-kinetic]");
    if (!nodes.length) return;
    nodes.forEach(function (node) {
      var txt = node.textContent;
      node.textContent = "";
      for (var i = 0; i < txt.length; i++) {
        var c = txt.charAt(i);
        var sp = document.createElement("span");
        sp.className = "ch" + (c === " " ? " sp" : "");
        sp.textContent = (c === " " ? " " : c);
        node.appendChild(sp);
      }
    });

    if (prefersReduced || !window.gsap) return;
    var chars = document.querySelectorAll("[data-kinetic] .ch");
    var hero = document.querySelector(".hero");
    if (!chars.length || !hero) return;

    var setters = [];
    chars.forEach(function (ch) {
      setters.push({
        x:  window.gsap.quickTo(ch, "x",        { duration: 0.7, ease: "expo.out" }),
        y:  window.gsap.quickTo(ch, "y",        { duration: 0.7, ease: "expo.out" }),
        rx: window.gsap.quickTo(ch, "rotateX", { duration: 0.7, ease: "expo.out" }),
        ry: window.gsap.quickTo(ch, "rotateY", { duration: 0.7, ease: "expo.out" })
      });
    });

    hero.addEventListener("mousemove", function (e) {
      var rect = hero.getBoundingClientRect();
      var dx = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
      var dy = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
      for (var i = 0; i < chars.length; i++) {
        var depth = 1 + (i % 3) * 0.45;
        setters[i].x(dx * 22 * depth);
        setters[i].y(dy * 12 * depth);
        setters[i].ry(dx * 10 * depth);
        setters[i].rx(-dy * 7 * depth);
      }
    });
    hero.addEventListener("mouseleave", function () {
      for (var i = 0; i < chars.length; i++) {
        setters[i].x(0); setters[i].y(0); setters[i].rx(0); setters[i].ry(0);
      }
    });
  }

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

    function accentRGB() {
      var s = getComputedStyle(document.documentElement);
      var hex = (s.getPropertyValue("--accent") || "#cf924f").trim().replace("#", "");
      if (hex.length === 3) hex = hex.split("").map(function (c) { return c + c; }).join("");
      return [parseInt(hex.substr(0, 2), 16), parseInt(hex.substr(2, 2), 16), parseInt(hex.substr(4, 2), 16)];
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

    function draw() {
      ctx.clearRect(0, 0, w, h);
      var rgb = accentRGB();
      var r = rgb[0], g = rgb[1], b = rgb[2];
      var compress = scrollProgress;
      var centerY = h * 0.58;

      for (var i = 0; i < candles.length; i++) {
        var c = candles[i];
        c.x -= c.speed * (1 - compress * 0.5);
        if (c.x < -24) c.x = w + 24;

        var bob = Math.sin(clock * 0.0009 + c.phase) * 5;
        var y = c.baseY + bob;
        var ch = c.height * (1 - compress * 0.92);
        var ty = y * (1 - compress) + centerY * compress;
        var alpha = (0.08 + c.depth * 0.26) * (1 - compress * 0.7);

        // body
        ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + alpha.toFixed(3) + ")";
        ctx.fillRect(c.x, ty - ch / 2, c.width, ch);
        // wicks
        var wA = (alpha * 0.65).toFixed(3);
        ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + wA + ")";
        var wickLen = c.wick * (1 - compress);
        ctx.fillRect(c.x + c.width / 2 - 0.5, ty - ch / 2 - wickLen, 1, wickLen);
        ctx.fillRect(c.x + c.width / 2 - 0.5, ty + ch / 2,         1, wickLen);
      }

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

    function tick() {
      if (!visible) { rafId = requestAnimationFrame(tick); return; }
      clock += 16;
      draw();
      rafId = requestAnimationFrame(tick);
    }

    // pause when off-screen
    if ("IntersectionObserver" in window) {
      var hvo = new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
      }, { threshold: 0.01 });
      hvo.observe(canvas);
    }

    window.addEventListener("resize", resize);
    // re-seed on theme change so accent recomputes (next frame catches it via getComputedStyle)
    resize();
    tick();

    // scroll-scrub: compress candles into sparkline as hero exits
    if (window.gsap && window.ScrollTrigger) {
      var hero = document.querySelector(".hero");
      if (hero) {
        window.ScrollTrigger.create({
          trigger: hero,
          start: "top top",
          end: "bottom 30%",
          scrub: 0.6,
          onUpdate: function (self) { scrollProgress = self.progress; }
        });
      }
    }
  }

  /* ---------- Custom cursor: dot + trailing ring ---------- */
  function bootCursor() {
    if (prefersReduced) return;
    if (!window.matchMedia("(hover: hover)").matches) return;
    var dot = document.querySelector(".cursor-dot");
    var ring = document.querySelector(".cursor-ring");
    if (!dot || !ring) return;

    document.body.classList.add("has-cursor");
    var dotX = -100, dotY = -100, ringX = -100, ringY = -100;
    var tx = -100, ty = -100;

    document.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!document.body.classList.contains("cursor-ready")) {
        document.body.classList.add("cursor-ready");
        dotX = ringX = tx; dotY = ringY = ty;
      }
    }, { passive: true });
    document.addEventListener("mouseleave", function () { document.body.classList.remove("cursor-ready"); });
    document.addEventListener("mouseenter", function () { document.body.classList.add("cursor-ready"); });
    document.addEventListener("mousedown", function () { document.body.classList.add("cursor-press"); });
    document.addEventListener("mouseup",   function () { document.body.classList.remove("cursor-press"); });

    var hoverSel = 'a, button, .filter, .tag, .chip, .card, [role="button"], input, textarea, label[for]';
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest && e.target.closest(hoverSel)) document.body.classList.add("cursor-hover");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest && e.target.closest(hoverSel)) document.body.classList.remove("cursor-hover");
    });

    (function loop() {
      dotX  += (tx - dotX)  * 0.5;
      dotY  += (ty - dotY)  * 0.5;
      ringX += (tx - ringX) * 0.16;
      ringY += (ty - ringY) * 0.16;
      dot.style.transform  = "translate3d(" + dotX  + "px," + dotY  + "px,0) translate(-50%,-50%)";
      ring.style.transform = "translate3d(" + ringX + "px," + ringY + "px,0) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();
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

    // Reduced-motion / no-GSAP fallback: just light up the first role and leave it.
    if (prefersReduced || !window.gsap || !window.ScrollTrigger) {
      setActive(0);
      return;
    }

    chunks.forEach(function (chunk, i) {
      window.ScrollTrigger.create({
        trigger: chunk,
        start: "top 62%",
        end: "bottom 42%",
        onEnter:     function () { setActive(i); },
        onEnterBack: function () { setActive(i); }
      });
    });
    setActive(0);
  }

  /* ---------- Timeline rail scrub ---------- */
  function bootTimelineScrub() {
    var tls = document.querySelectorAll(".timeline");
    if (!tls.length) return;
    if (prefersReduced || !window.gsap || !window.ScrollTrigger) {
      tls.forEach(function (tl) {
        var fill = tl.querySelector(".timeline-rail-fill");
        if (fill) fill.style.height = "100%";
      });
      return;
    }
    tls.forEach(function (tl) {
      var fill = tl.querySelector(".timeline-rail-fill");
      if (!fill) return;
      window.ScrollTrigger.create({
        trigger: tl,
        start: "top 78%",
        end: "bottom 62%",
        scrub: 0.7,
        onUpdate: function (self) { fill.style.height = (self.progress * 100).toFixed(2) + "%"; }
      });
    });
  }

  /* ---------- Featured-Work card canvases (domain-specific demos) ---------- */
  function bootCardCanvases() {
    var canvases = document.querySelectorAll(".card-canvas");
    if (!canvases.length) return;

    function accent() {
      var s = getComputedStyle(document.documentElement);
      return {
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
      var visible = true;
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          visible = entries[0].isIntersecting;
        }, { threshold: 0.01 }).observe(canvas);
      }
      window.addEventListener("resize", resize);
      return {
        ctx: ctx,
        dims: function () { return { w: w, h: h }; },
        isVisible: function () { return visible; }
      };
    }

    // 1) Equity curve — trading-bot card
    function initEquityCurve(canvas) {
      var s = setupCanvas(canvas); if (!s) return;
      var points = [];
      var t = 0;

      function generate() {
        points = [];
        var n = 90;
        var price = 100;
        for (var i = 0; i < n; i++) {
          var noise = (Math.random() - 0.46) * 1.6;
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
        function py(v) { return h - pad - ((v - min) / range) * (h - pad * 2); }

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
        ctx.fillText("equity · paper $100k", 14, 12);
        ctx.textAlign = "right";
        ctx.fillStyle = c.base;
        var endVal = points[lastVis - 1] || points[0];
        var pct = ((endVal / points[0]) - 1) * 100;
        ctx.fillText((pct >= 0 ? "+" : "") + pct.toFixed(2) + "%", w - 14, 12);
        ctx.textAlign = "left";
        t++;
      }

      function loop() {
        if (s.isVisible() && !prefersReduced) draw();
        else if (!s.isVisible()) { /* idle */ }
        requestAnimationFrame(loop);
      }
      draw(); // initial frame
      if (prefersReduced) { t = 200; draw(); return; }
      loop();
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
        ctx.fillText("// edgar feed · sentiment Δ", pad, 12);

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

      function loop() {
        if (s.isVisible() && !prefersReduced) {
          t++;
          if (t % 110 === 0) activeRow = (activeRow + 1) % rows.length;
          draw();
        }
        requestAnimationFrame(loop);
      }
      draw();
      if (prefersReduced) return;
      loop();
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

      function loop() {
        if (s.isVisible() && !prefersReduced) { t++; draw(); }
        requestAnimationFrame(loop);
      }
      draw();
      if (prefersReduced) return;
      loop();
    }

    canvases.forEach(function (canvas) {
      var type = canvas.getAttribute("data-canvas-type");
      if (type === "equity-curve")   initEquityCurve(canvas);
      else if (type === "filings-feed")   initFilingsFeed(canvas);
      else if (type === "stress-curves")  initStressCurves(canvas);
    });
  }

  /* ---------- Page transitions (cover sweep on outgoing nav) ---------- */
  function bootPageTransitions() {
    if (prefersReduced) return;
    var overlay = document.querySelector(".page-transition");
    if (!overlay) return;

    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a) return;
      var href = a.getAttribute("href");
      if (!href) return;

      // skip non-page-nav links
      if (href.charAt(0) === "#") return;
      if (/^(mailto:|tel:|javascript:)/i.test(href)) return;
      if (a.hasAttribute("download")) return;
      if (a.getAttribute("target") === "_blank") return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      // external link?
      try {
        var url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
      } catch (err) { return; }

      // only intercept .html navigations
      if (!/\.html(\?.*)?$/i.test(href.split("#")[0])) return;
      // same-page link? skip
      if (a.href === window.location.href) return;

      e.preventDefault();
      overlay.classList.add("is-covering");
      setTimeout(function () { window.location.href = href; }, 470);
    });
  }

  /* ---------- Magnetic buttons (subtle pull toward cursor) ---------- */
  function bootMagneticButtons() {
    if (prefersReduced) return;
    if (!window.gsap) return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    var btns = document.querySelectorAll(".btn--primary, .btn--ghost");
    btns.forEach(function (btn) {
      var setX = window.gsap.quickTo(btn, "x", { duration: 0.55, ease: "expo.out" });
      var setY = window.gsap.quickTo(btn, "y", { duration: 0.55, ease: "expo.out" });
      var strength = 0.28;

      btn.addEventListener("mousemove", function (e) {
        var rect = btn.getBoundingClientRect();
        var dx = e.clientX - (rect.left + rect.width / 2);
        var dy = e.clientY - (rect.top + rect.height / 2);
        setX(dx * strength);
        setY(dy * strength);
      });
      btn.addEventListener("mouseleave", function () {
        setX(0); setY(0);
      });
    });
  }

  /* ---------- Counter band ("Receipts") count-up ---------- */
  function bootCounters() {
    var nums = document.querySelectorAll(".stat .num[data-target]");
    if (!nums.length) return;

    function format(n, decimals, prefix, suffix) {
      var s = (decimals > 0) ? n.toFixed(decimals) : Math.floor(n).toString();
      return (prefix || "") + s + (suffix || "");
    }

    nums.forEach(function (el) {
      var target   = parseFloat(el.dataset.target);
      var decimals = parseInt(el.dataset.decimals || "0", 10);
      var prefix   = el.dataset.prefix || "";
      var suffix   = el.dataset.suffix || "";

      // initial frame (zeroed)
      el.textContent = format(0, decimals, prefix, suffix);

      if (prefersReduced || !window.gsap || !window.ScrollTrigger) {
        el.textContent = format(target, decimals, prefix, suffix);
        return;
      }

      var obj = { val: 0 };
      window.ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: function () {
          window.gsap.to(obj, {
            val: target,
            duration: 1.6,
            ease: "expo.out",
            onUpdate: function () { el.textContent = format(obj.val, decimals, prefix, suffix); },
            onComplete: function () { el.textContent = format(target, decimals, prefix, suffix); }
          });
        }
      });
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

  // Boot order — wait briefly so deferred CDN scripts settle, then init.
  function bootMotion() {
    bootLenis();
    bootKineticName();
    bootHeroCanvas();
    bootCursor();
    bootAboutScroll();
    bootTimelineScrub();
    bootCardCanvases();
    bootPageTransitions();
    bootMagneticButtons();
    bootCounters();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootMotion);
  } else {
    // give deferred CDN scripts a tick to attach
    setTimeout(bootMotion, 0);
  }
})();
