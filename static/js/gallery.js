// Gallery page: filter buttons and the photo popup (lightbox) that grows out of the thumbnail
const items = document.querySelectorAll(".gallery__item");
const lightbox = document.getElementById("lightbox");
const lightboxImage = lightbox.querySelector("img");
const lightboxCaption = lightbox.querySelector("p");

function filterGallery(button, category) {
  const tabs = button.closest(".tabs");
  tabs.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("on"));
  button.classList.add("on");
  glideTabs(tabs);

  const shown = [];
  items.forEach((item) => {
    const hide = category !== "all" && item.dataset.cat !== category;
    item.hidden = hide;
    if (!hide) shown.push(item);
  });
  if (window.BB && !BB.reduce) BB.replay(shown, 60);
}

function openPhoto(button) {
  const picture = button.querySelector("img");
  lightboxImage.src = button.dataset.full;
  lightboxImage.alt = picture.alt;
  lightboxCaption.textContent = button.dataset.caption;
  const from = picture.getBoundingClientRect();
  lightbox.showModal();

  // grow the big photo out of the thumbnail that was clicked
  if (lightboxImage.animate && !(window.BB && BB.reduce)) {
    const to = lightboxImage.getBoundingClientRect();
    if (to.width) {
      const dx = from.left + from.width / 2 - (to.left + to.width / 2);
      const dy = from.top + from.height / 2 - (to.top + to.height / 2);
      lightboxImage.animate(
        [
          { transform: "translate(" + dx + "px," + dy + "px) scale(" + from.width / to.width + ")", borderRadius: "28px" },
          { transform: "none", borderRadius: "20px" }
        ],
        { duration: 650, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
      );
    }
  }
}

function closePhoto() { lightbox.close(); }

// clicking the dark area around the photo also closes it
lightbox.addEventListener("click", (event) => { if (event.target === lightbox) closePhoto(); });
