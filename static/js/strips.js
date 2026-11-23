// Home page: clicking a photo in the "Stay a little longer" strips opens it in a popup that grows out of the thumbnail.
const dialog = document.createElement("dialog");
dialog.className = "lightbox";
dialog.setAttribute("aria-label", "Photo viewer");
dialog.innerHTML =
  '<button class="lightbox__close" type="button" aria-label="Close photo"><svg class="icon" aria-hidden="true"><use href="#i-x"></use></svg></button><img src="" alt="" />';
document.body.append(dialog);
const big = dialog.querySelector("img");

dialog.querySelector(".lightbox__close").addEventListener("click", () => dialog.close());
// clicking the dark area around the photo also closes it
dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });

// one listener on the strips, so the looping copies of each photo work too
document.querySelectorAll(".strip").forEach((strip) => {
  strip.addEventListener("click", (event) => {
    const thumb = event.target.closest(".marquee__item")?.querySelector("img");
    if (!thumb) return;
    big.src = thumb.currentSrc || thumb.src;
    big.alt = thumb.alt;
    const from = thumb.getBoundingClientRect();
    dialog.showModal();
    if (big.animate && !(window.BB && BB.reduce)) {
      const to = big.getBoundingClientRect();
      if (!to.width) return;
      const dx = from.left + from.width / 2 - (to.left + to.width / 2);
      const dy = from.top + from.height / 2 - (to.top + to.height / 2);
      big.animate(
        [
          { transform: "translate(" + dx + "px," + dy + "px) scale(" + from.width / to.width + ")", borderRadius: "28px" },
          { transform: "none", borderRadius: "20px" }
        ],
        { duration: 650, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
      );
    }
  });
  strip.querySelectorAll(".marquee__item").forEach((item) => { item.style.cursor = "zoom-in"; });
});
