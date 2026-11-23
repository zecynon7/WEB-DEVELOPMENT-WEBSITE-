/* ==========================================================================
   MOTION ENGINE (no libraries)
   Reveals, split text, counters, header, tilt + spotlight, magnetic buttons,
   parallax, page-transition curtain and the home preloader.
   If anything throws, html.no-motion is added and the page shows normally.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  var BB = (window.BB = {
    reduce: reduce, fine: fine, ready: false, vel: 0, y: 0,
    frames: [], resizers: [], queue: []
  });
  BB.clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  BB.onFrame = function (fn) { BB.frames.push(fn); };
  BB.onResize = function (fn) { BB.resizers.push(fn); };
  BB.whenReady = function (fn) { if (BB.ready) fn(); else BB.queue.push(fn); };

  function setReady() {
    if (BB.ready) return;
    BB.ready = true;
    root.classList.add("is-ready");
    BB.queue.splice(0).forEach(function (fn) { fn(); });
  }

  if (reduce) {
    root.classList.add("no-motion", "is-ready");
    root.classList.remove("is-loading");
    BB.ready = true;
    return;
  }

  /* Split text into words. mode "w" = masked words that rise (headings),
     mode "sw" = plain words that can be lit one by one while scrolling. */
  BB.split = function (el, mode) {
    var idx = 0;
    function walk(node, inAccent) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            var outer = document.createElement("span");
            if (mode === "w") {
              var inner = document.createElement("span");
              inner.textContent = part;
              inner.style.setProperty("--i", idx);
              if (inAccent) inner.className = "accent-w";
              outer.className = "w";
              outer.appendChild(inner);
            } else {
              outer.className = "sw";
              outer.textContent = part;
              outer.style.setProperty("--i", idx);
            }
            idx++;
            frag.appendChild(outer);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== "BR") {
          var acc = inAccent || child.classList.contains("accent");
          if (child.classList.contains("accent")) child.classList.add("is-split");
          walk(child, acc);
        }
      });
    }
    walk(el, false);
    el.style.setProperty("--n", idx);
    el.setAttribute("data-split-done", "");
    return idx;
  };

  /* Replay the entrance of a list of elements (menu tabs, filters) */
  BB.replay = function (els, step) {
    els = Array.prototype.slice.call(els);
    els.forEach(function (e) { e.classList.remove("is-in", "is-done"); });
    void document.body.offsetWidth;
    els.forEach(function (e, i) { e.style.setProperty("--d", (i % 8) * (step || 70)); });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { els.forEach(function (e) { e.classList.add("is-in"); }); });
    });
  };

  function start() {
    /* ---------- frame loop ---------- */
    var last = performance.now(), prevY = window.scrollY;
    function tick(now) {
      var dt = Math.min(0.05, (now - last) / 1000) || 0.016;
      last = now;
      var y = window.scrollY;
      BB.vel += (((y - prevY) / dt) - BB.vel) * 0.15;
      prevY = y;
      BB.y = y;
      for (var i = 0; i < BB.frames.length; i++) BB.frames[i](dt, y);
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    var rt;
    function fireResize() { BB.resizers.forEach(function (fn) { fn(); }); }
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(fireResize, 120); });
    window.addEventListener("load", fireResize);
    if (window.ResizeObserver) new ResizeObserver(function () { clearTimeout(rt); rt = setTimeout(fireResize, 150); }).observe(document.body);

    /* ---------- split headings, auto-stagger children ---------- */
    document.querySelectorAll("[data-split]").forEach(function (el) { BB.split(el, "w"); });
    document.querySelectorAll("[data-stagger]").forEach(function (parent) {
      var variant = parent.getAttribute("data-stagger") || "rise";
      var cols = +parent.getAttribute("data-cols") || 6;
      var step = +parent.getAttribute("data-step") || 90;
      Array.prototype.forEach.call(parent.children, function (c, i) {
        if (!c.hasAttribute("data-reveal")) c.setAttribute("data-reveal", variant);
        c.style.setProperty("--d", (i % cols) * step);
      });
    });

    /* ---------- reveal on scroll ---------- */
    document.querySelectorAll("[data-count]").forEach(function (el) {
      el._target = parseFloat(el.getAttribute("data-count"));
      el._suffix = el.getAttribute("data-suffix") || "";
      el.textContent = "0" + el._suffix;
    });
    function runCount(el) {
      var t0 = performance.now(), dur = 1800, target = el._target;
      var plain = el.hasAttribute("data-plain");
      (function step(now) {
        var k = BB.clamp((now - t0) / dur, 0, 1);
        var e = k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
        var v = Math.round(target * e);
        el.textContent = (plain ? String(v) : v.toLocaleString("en-US")) + el._suffix;
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    }
    function show(el) {
      el.classList.add("is-in");
      if (el.hasAttribute("data-count")) runCount(el);
      el.querySelectorAll && el.querySelectorAll("[data-count]").forEach(function (c) { if (!c._done) { c._done = true; runCount(c); } });
      if (el.getAttribute("data-reveal") === "clip" || el.getAttribute("data-reveal") === "wipe") {
        var done = function (e) { if (e.propertyName === "clip-path") { el.classList.add("is-done"); el.removeEventListener("transitionend", done); } };
        el.addEventListener("transitionend", done);
        setTimeout(function () { el.classList.add("is-done"); }, 3200);
      }
      if (el.classList.contains("cup-host")) el.classList.add("cup-play");
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        BB.whenReady(function () { show(en.target); });
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    /* clip / wipe elements are fully clipped before they show, which hides them from
       IntersectionObserver, so they are checked by position instead */
    var clipped = [], waiting = [];
    document.querySelectorAll("[data-reveal], [data-split], [data-count], .cup-host").forEach(function (el) {
      var v = el.getAttribute("data-reveal");
      if (v === "clip" || v === "wipe") clipped.push(el); else { io.observe(el); waiting.push(el); }
    });
    /* anything the visitor scrolled straight past (End key, reload mid-page) shows itself */
    var tickN = 0;
    BB.onFrame(function () {
      if (!BB.ready || ++tickN % 20) return;
      for (var i = waiting.length - 1; i >= 0; i--) {
        var el = waiting[i];
        if (el.classList.contains("is-in")) { waiting.splice(i, 1); continue; }
        if (el.getBoundingClientRect().bottom < -40) { io.unobserve(el); waiting.splice(i, 1); show(el); }
      }
    });
    BB.onFrame(function () {
      if (!clipped.length || !BB.ready) return;
      var vh = window.innerHeight;
      for (var i = clipped.length - 1; i >= 0; i--) {
        var r = clipped[i].getBoundingClientRect();
        if (r.height && r.top < vh * 0.92) { show(clipped[i]); clipped.splice(i, 1); }
      }
    });
    

    /* ---------- header: hides on scroll down, returns on scroll up ---------- */
    var header = document.querySelector(".site-header");
    var bar = document.querySelector(".scroll-progress");
    var lastY = window.scrollY;
    BB.onFrame(function (dt, y) {
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.setProperty("--sp", docH > 0 ? (y / docH).toFixed(4) : 0);
      if (!header) return;
      header.classList.toggle("is-scrolled", y > 40);
      if (Math.abs(y - lastY) < 3) return;
      var menuOpen = header.classList.contains("is-menu-open");
      if (y > 160 && y > lastY && !menuOpen) header.classList.add("is-hidden");
      else header.classList.remove("is-hidden");
      root.classList.toggle("hdr-hidden", header.classList.contains("is-hidden"));
      lastY = y;
    });

    /* ---------- nav: a pill glides between links ---------- */
    var nav = document.querySelector(".site-nav");
    if (nav && fine) {
      var pill = document.createElement("span");
      pill.className = "nav__pill";
      nav.insertBefore(pill, nav.firstChild);
      var move = function (a, instant) {
        var r = a.getBoundingClientRect(), n = nav.getBoundingClientRect();
        if (instant) pill.style.transition = "none";
        pill.style.setProperty("--nx", r.left - n.left + "px");
        pill.style.setProperty("--nw", r.width + "px");
        pill.classList.add("is-on");
        if (instant) { void pill.offsetWidth; pill.style.transition = ""; }
      };
      var rest = function (instant) {
        var cur = nav.querySelector('a[aria-current="page"]');
        if (cur) move(cur, instant); else pill.classList.remove("is-on");
      };
      nav.querySelectorAll("ul a:not(.btn)").forEach(function (a) {
        a.addEventListener("mouseenter", function () { move(a); });
        a.addEventListener("focus", function () { move(a); });
      });
      nav.addEventListener("mouseleave", function () { rest(); });
      rest(true);
      BB.onResize(function () { rest(true); });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { rest(true); });
    }

    /* ---------- tilt + spotlight on cards ---------- */
    if (fine) {
      var live = [];
      document.querySelectorAll("[data-tilt]").forEach(function (el) {
        var st = { el: el, rx: 0, ry: 0, trx: 0, tryy: 0, h: 0, th: 0, on: false };
        var amp = el.offsetWidth > 520 ? 0.4 : 1;
        function wake() { if (!st.on) { st.on = true; live.push(st); } }
        el.addEventListener("pointermove", function (e) {
          var r = el.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
          st.tryy = (px - 0.5) * 12 * amp;
          st.trx = -(py - 0.5) * 10 * amp;
          st.th = 1;
          el.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
          el.style.setProperty("--my", (py * 100).toFixed(1) + "%");
          wake();
        });
        el.addEventListener("pointerleave", function () { st.trx = 0; st.tryy = 0; st.th = 0; wake(); });
      });
      BB.onFrame(function (dt) {
        var k = 1 - Math.exp(-dt * 12);
        for (var i = live.length - 1; i >= 0; i--) {
          var s = live[i];
          s.rx += (s.trx - s.rx) * k; s.ry += (s.tryy - s.ry) * k; s.h += (s.th - s.h) * k;
          s.el.style.setProperty("--rx", s.rx.toFixed(2) + "deg");
          s.el.style.setProperty("--ry", s.ry.toFixed(2) + "deg");
          s.el.style.setProperty("--hover", s.h.toFixed(3));
          if (Math.abs(s.rx - s.trx) < 0.01 && Math.abs(s.ry - s.tryy) < 0.01 && Math.abs(s.h - s.th) < 0.01 && !s.th) {
            s.el.style.setProperty("--rx", "0deg"); s.el.style.setProperty("--ry", "0deg"); s.el.style.setProperty("--hover", 0);
            s.on = false; live.splice(i, 1);
          }
        }
      });

      /* magnetic buttons */
      var mags = [];
      document.querySelectorAll(".btn--lg, .btn--primary, [data-magnet]").forEach(function (b) {
        var m = { el: b, x: 0, y: 0, tx: 0, ty: 0, on: false };
        function wake() { if (!m.on) { m.on = true; mags.push(m); } }
        b.addEventListener("pointermove", function (e) {
          var r = b.getBoundingClientRect();
          m.tx = (e.clientX - (r.left + r.width / 2)) * 0.28;
          m.ty = (e.clientY - (r.top + r.height / 2)) * 0.4;
          wake();
        });
        b.addEventListener("pointerleave", function () { m.tx = 0; m.ty = 0; wake(); });
      });
      BB.onFrame(function (dt) {
        var k = 1 - Math.exp(-dt * 10);
        for (var i = mags.length - 1; i >= 0; i--) {
          var m = mags[i];
          m.x += (m.tx - m.x) * k; m.y += (m.ty - m.y) * k;
          m.el.style.translate = m.x.toFixed(2) + "px " + m.y.toFixed(2) + "px";
          if (!m.tx && !m.ty && Math.abs(m.x) < 0.05 && Math.abs(m.y) < 0.05) { m.el.style.translate = ""; m.on = false; mags.splice(i, 1); }
        }
      });
    }

    /* ---------- parallax images inside frames ---------- */
    var pars = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
    BB.onFrame(function () {
      var vh = window.innerHeight;
      for (var i = 0; i < pars.length; i++) {
        var el = pars[i], r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) continue;
        var img = el.querySelector("img");
        if (!img) continue;
        var f = +el.getAttribute("data-parallax") || 0.1;
        var max = r.height * 0.08;
        var s = BB.clamp((r.top + r.height / 2 - vh / 2) * -f, -max, max);
        img.style.translate = "0 " + s.toFixed(1) + "px";
      }
    });

    /* ---------- pointer parallax for floating beans ---------- */
    var beans = Array.prototype.slice.call(document.querySelectorAll(".bean[data-depth]"));
    if (beans.length && fine) {
      var mx = 0, my = 0, cx = 0, cy = 0;
      window.addEventListener("pointermove", function (e) {
        mx = e.clientX / window.innerWidth - 0.5;
        my = e.clientY / window.innerHeight - 0.5;
      });
      BB.onFrame(function (dt) {
        var k = 1 - Math.exp(-dt * 4);
        cx += (mx - cx) * k; cy += (my - cy) * k;
        for (var i = 0; i < beans.length; i++) {
          var d = +beans[i].getAttribute("data-depth");
          beans[i].style.translate = (cx * d * -70).toFixed(1) + "px " + (cy * d * -70).toFixed(1) + "px";
        }
      });
    }

    /* ---------- page transition curtain ---------- */
    var curtain = document.querySelector(".page-curtain");
    function leave(href) {
      toggleMenu(false);
      curtain.classList.remove("is-open");
      curtain.classList.add("is-below");
      void curtain.offsetWidth;
      curtain.classList.remove("is-below");
      curtain.classList.add("is-closing");
      setTimeout(function () { window.location.href = href; }, 780);
    }
    if (curtain) {
      document.addEventListener("click", function (e) {
        var a = e.target.closest && e.target.closest("a[href]");
        if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if ((a.target && a.target !== "_self") || a.hasAttribute("download")) return;
        var url;
        try { url = new URL(a.href, window.location.href); } catch (err) { return; }
        if (url.protocol !== window.location.protocol || url.host !== window.location.host) return;
        if (url.pathname === window.location.pathname && (url.hash || url.search === window.location.search)) return;
        if (!/\.html?$|\/$/.test(url.pathname)) return;
        e.preventDefault();
        leave(url.href);
      });
      window.addEventListener("pageshow", function (e) {
        if (e.persisted) { curtain.classList.remove("is-closing"); curtain.classList.add("is-open"); }
      });
    }

    /* ---------- entrance: preloader on home, curtain lift elsewhere ---------- */
    var pre = document.getElementById("preloader");
    if (root.classList.contains("is-loading") && pre) {
      if (curtain) curtain.classList.add("is-open", "no-anim");
      if (curtain) curtain.style.display = "none";
      var counter = pre.querySelector(".preloader__count");
      var t0 = performance.now(), MIN = 2400, assets = false;
      var hero = document.querySelector(".hero-photo img");
      var imgP = hero && !hero.complete ? new Promise(function (r) { hero.addEventListener("load", r); hero.addEventListener("error", r); setTimeout(r, 3500); }) : Promise.resolve();
      Promise.all([document.fonts ? document.fonts.ready : Promise.resolve(), imgP]).then(function () { assets = true; });
      (function step(now) {
        var base = Math.min(1, (now - t0) / MIN);
        var shown = assets ? base : Math.min(base, 0.92);
        var e = 1 - Math.pow(1 - shown, 3);
        counter.textContent = Math.round(e * 100);
        pre.style.setProperty("--pl", e.toFixed(3));
        if (shown >= 1 && assets) { finish(); return; }
        requestAnimationFrame(step);
      })(t0);
      var finish = function () {
        counter.textContent = "100";
        pre.style.setProperty("--pl", 1);
        pre.classList.add("is-done");
        setTimeout(setReady, 520);
        setTimeout(function () {
          root.classList.remove("is-loading");
          try { sessionStorage.setItem("bb-pre", "1"); } catch (err) {}
        }, 1300);
      };
    } else if (curtain) {
      var go = function () {
        requestAnimationFrame(function () {
          curtain.classList.add("is-open");
          setTimeout(setReady, 480);
        });
      };
      var fontsP = document.fonts ? document.fonts.ready : Promise.resolve();
      Promise.race([fontsP, new Promise(function (r) { setTimeout(r, 900); })]).then(go);
    } else {
      setReady();
    }
  }

  try {
    start();
    root.classList.add("motion-ready");
  } catch (err) {
    if (window.console) console.error("Motion disabled:", err);
    root.classList.add("no-motion", "is-ready");
    root.classList.remove("is-loading");
    BB.ready = true;
  }
})();
