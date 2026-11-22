// Shared by every page: phone menu, footer year, and the sliding highlight behind filter tabs.

function toggleMenu(open) {
  const nav = document.getElementById("nav");
  const button = document.querySelector(".nav-toggle");
  if (!nav || !button) return;
  const isOpen = typeof open === "boolean" ? open : !nav.classList.contains("open");
  nav.classList.toggle("open", isOpen);
  button.setAttribute("aria-expanded", String(isOpen));
  const header = document.querySelector(".site-header");
  if (header) header.classList.toggle("is-menu-open", isOpen);
}

document.querySelectorAll(".site-nav li").forEach((li, i) => li.style.setProperty("--i", i));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") toggleMenu(false); });
document.querySelectorAll(".site-nav a").forEach((a) => a.addEventListener("click", () => toggleMenu(false)));

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

// Tab highlight: a pill that glides under whichever .tab has the class "on".
function glideTabs(tabs) {
  const glide = tabs.querySelector(".tabs__glide");
  const on = tabs.querySelector(".tab.on");
  if (!glide || !on || !on.offsetWidth) return;
  // offset sizes ignore transforms, so this also works while the bar is still animating in
  glide.style.setProperty("--gx", on.offsetLeft + "px");
  glide.style.setProperty("--gy", on.offsetTop - 8 + "px");
  glide.style.setProperty("--gw", on.offsetWidth + "px");
}
function glideAll() { document.querySelectorAll(".tabs").forEach(glideTabs); }
window.glideTabs = glideTabs;
window.addEventListener("load", glideAll);
window.addEventListener("resize", glideAll);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(glideAll);
glideAll();

// Floating coffee beans behind the title block of every inner page (the home page has its own in the hero).
document.querySelectorAll(".page-intro").forEach((intro) => {
  if (intro.querySelector(".beans")) return;
  // size, left, top, depth, blur, opacity, seconds, dx, dy, rotate from, rotate to, delay, colour
  const beans = [
    [64, "72%", "14%", 0.9, 0, 1, 9, 26, -34, -25, 30, 0, "#7a4e2d"],
    [38, "90%", "50%", 0.5, 1, 0.9, 11, -18, 28, 40, -20, -2, "#4a2f1d"],
    [88, "58%", "62%", 1.4, 5, 0.55, 13, 30, -40, 10, 70, -4, "#b9824f"],
    [46, "4%", "66%", 0.7, 0, 1, 10, 22, -30, -50, 15, -1, "#261710"],
    [30, "82%", "8%", 0.4, 2, 0.8, 8, -14, 22, 60, 0, -5, "#e2c3a3"],
    [26, "40%", "80%", 0.3, 1, 0.9, 9, 12, 20, 20, 80, -6, "#b9824f"],
  ];
  const layer = document.createElement("div");
  layer.className = "beans";
  layer.setAttribute("aria-hidden", "true");
  layer.innerHTML = beans
    .map(([s, l, t, d, b, o, du, dx, dy, r0, r1, dl, col]) =>
      `<span class="bean" data-depth="${d}" style="--s:${s}px;left:${l};top:${t};--b:${b}px;--o:${o};--t:${du}s;--dx:${dx}px;--dy:${dy}px;--r0:${r0}deg;--r1:${r1}deg;--dl:${dl}s;--bc:${col}"><svg viewBox="0 0 40 60"><use href="#i-bean"></use></svg></span>`)
    .join("");
  intro.prepend(layer);
});
