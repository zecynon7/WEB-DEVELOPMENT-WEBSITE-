// Menu page: show one category at a time, with the cards dealing in again each time
function showCategory(button, id) {
  const tabs = button.closest(".tabs");
  tabs.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("on"));
  button.classList.add("on");
  glideTabs(tabs);
  const bar = tabs.parentElement;
  if (bar && bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: button.offsetLeft - (bar.clientWidth - button.offsetWidth) / 2, behavior: "smooth" });

  document.querySelectorAll(".menu-group").forEach((group) => group.classList.remove("show"));
  const group = document.getElementById(id);
  group.classList.add("show");
  if (window.BB && !BB.reduce) BB.replay(group.querySelectorAll(".menu-grid > li"), 60);
  if (history.replaceState) history.replaceState(null, "", "#" + id);
}

// open the category named in the address (menu.html#hot)
(function () {
  const id = location.hash.slice(1);
  const group = id && document.getElementById(id);
  if (group && group.classList.contains("menu-group")) {
    const button = document.querySelector('.tab[data-target="' + id + '"]');
    if (button) {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("on"));
      document.querySelectorAll(".menu-group").forEach((g) => g.classList.remove("show"));
      button.classList.add("on");
      group.classList.add("show");
    }
  }
})();
