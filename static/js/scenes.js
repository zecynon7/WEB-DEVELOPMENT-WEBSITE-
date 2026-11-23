/* ==========================================================================
   SCENES: scroll-linked storytelling.
   Every [data-scene] element gets a smoothed number --p (0 to 1).
     data-scene="pin"  -> progress while a tall section is pinned on screen
     data-scene="view" -> progress while the element travels through the screen
   Also: infinite marquees whose speed reacts to scrolling.
   ========================================================================== */
(function () {
  "use strict";
  var BB = window.BB;
  if (!BB || document.documentElement.classList.contains("no-motion")) return;

  var clamp = BB.clamp;
  var vh = window.innerHeight;
  var scenes = [];

  /* ---------- scene registry ---------- */
  document.querySelectorAll("[data-scene]").forEach(function (el) {
    var range = (el.getAttribute("data-range") || "0,1").split(",").map(Number);
    var s = { el: el, kind: el.getAttribute("data-scene"), range: range, p: 0, t: 0, start: 0, len: 1, last: -1, on: null };
    el._scene = s;
    scenes.push(s);
  });

  function measure() {
    vh = window.innerHeight;
    scenes.forEach(function (s) {
      if (s.kind !== "pin") return;
      var r = s.el.getBoundingClientRect();
      s.start = r.top + window.scrollY;
      s.len = Math.max(1, s.el.offsetHeight - vh);
    });
  }

  function write(s) {
    if (s.p === s.last) return;
    s.last = s.p;
    s.el.style.setProperty("--p", s.p.toFixed(4));
    if (s.on) s.on(s.p);
  }

  /* ---------- effects ---------- */
  var fx = {};

  fx.hero = function (el) {
    var overlay = el.querySelector(".hero-overlay");
    if (overlay) BB.split(overlay, "sw");
    el._scene.on = function (p) { el.classList.toggle("copy-gone", p > 0.42); };
  };

  fx.scrub = function (el) { BB.split(el, "sw"); };

  fx.drinks = function (el) {
    var s = el._scene;
    var items = Array.prototype.slice.call(el.querySelectorAll("[data-i]"));
    var buttons = el.querySelectorAll(".drinks__list button");
    var n = buttons.length || 1;
    var cur = -1;
    function set(i) {
      if (i === cur) return;
      cur = i;
      items.forEach(function (node) {
        var k = +node.getAttribute("data-i");
        node.classList.toggle("is-active", k === i);
        node.classList.toggle("is-before", k < i);
        node.classList.toggle("is-after", k > i);
      });
    }
    s.on = function (p) { set(Math.min(n - 1, Math.floor(p * n * 0.9999))); };
    set(0);
    var clickers = el.querySelectorAll(".drinks__list button, .drinks__dots button");
    Array.prototype.forEach.call(clickers, function (b) {
      var i = +b.getAttribute("data-i");
      b.addEventListener("click", function () {
        var range = s.range;
        var p = range[0] + ((i + 0.5) / n) * (range[1] - range[0]);
        window.scrollTo({ top: s.start + p * s.len, behavior: "smooth" });
      });
    });
  };

  fx.hscroll = function (el) {
    var s = el._scene;
    var track = el.querySelector(".hscroll__track");
    var cards = Array.prototype.slice.call(track.querySelectorAll(".hcard"));
    var dist = 0, ox = [], ow = [];
    function size() {
      track.style.transform = "none";
      dist = Math.max(0, track.scrollWidth - window.innerWidth);
      el.style.height = window.innerHeight + dist + window.innerHeight * 0.25 + "px";
      ox = cards.map(function (c) { return c.offsetLeft + c.offsetWidth / 2; });
      s.len = Math.max(1, el.offsetHeight - window.innerHeight);
      s.last = -1;
    }
    size();
    BB.onResize(function () { size(); measure(); });
    s.on = function (p) {
      var x = -p * dist;
      track.style.transform = "translate3d(" + x.toFixed(1) + "px,0,0)";
      for (var i = 0; i < cards.length; i++) {
        var img = cards[i].querySelector(".hcard__photo img");
        if (!img) continue;
        var off = ox[i] + x - window.innerWidth / 2;
        img.style.transform = "translate3d(" + (off * -0.09).toFixed(1) + "px,0,0)";
      }
    };
  };

  fx.how = function (el) { /* driven purely by CSS (--p) */ };

  scenes.forEach(function (s) {
    var name = s.el.getAttribute("data-fx");
    if (name && fx[name]) fx[name](s.el);
  });
  measure();
  BB.onResize(measure);
  window.addEventListener("load", measure);

  BB.onFrame(function (dt, y) {
    var k = 1 - Math.exp(-dt * 9);
    for (var i = 0; i < scenes.length; i++) {
      var s = scenes[i], raw;
      if (s.kind === "pin") {
        raw = (y - s.start) / s.len;
      } else {
        var r = s.el.getBoundingClientRect();
        raw = (vh - r.top) / (vh + r.height);
      }
      raw = clamp(raw, 0, 1);
      s.t = clamp((raw - s.range[0]) / (s.range[1] - s.range[0]), 0, 1);
      if (s.p !== s.t) {
        s.p += (s.t - s.p) * k;
        if (Math.abs(s.t - s.p) < 0.0005) s.p = s.t;
      }
      write(s);
    }
  });

  /* ---------- marquees ---------- */
  document.querySelectorAll("[data-marquee]").forEach(function (m) {
    var track = m.querySelector(".marquee__track");
    var group = track.querySelector(".marquee__group");
    var speed = +m.getAttribute("data-speed") || 70;
    var dir = m.getAttribute("data-dir") === "right" ? 1 : -1;
    var x = 0, gw = 0, visible = true;

    function build() {
      track.querySelectorAll("[data-clone]").forEach(function (n) { n.remove(); });
      gw = group.getBoundingClientRect().width;
      if (!gw) return;
      var count = Math.ceil((m.clientWidth * 2) / gw) + 1;
      for (var i = 0; i < count; i++) {
        var c = group.cloneNode(true);
        c.setAttribute("data-clone", "");
        c.setAttribute("aria-hidden", "true");
        track.appendChild(c);
      }
      if (dir > 0) x = -gw;
    }
    build();
    BB.onResize(build);

    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(m);

    BB.onFrame(function (dt) {
      if (!visible || !gw) return;
      var v = BB.vel;
      var boost = 1 + Math.min(5, Math.abs(v) / 700);
      x += dir * speed * boost * dt;
      if (dir < 0 && x <= -gw) x += gw;
      if (dir > 0 && x >= 0) x -= gw;
      var skew = clamp(-v / 160, -9, 9);
      track.style.transform = "translate3d(" + x.toFixed(2) + "px,0,0) skewX(" + skew.toFixed(2) + "deg)";
    });
  });
})();
