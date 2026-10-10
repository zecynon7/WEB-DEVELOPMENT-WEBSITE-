// Gallery page: filter buttons and the photo popup (lightbox)
const items = document.querySelectorAll(".gallery__item");
const lightbox = document.getElementById("lightbox");
const lightboxImage = lightbox.querySelector("img");
const lightboxCaption = lightbox.querySelector("p");

function filterGallery(button, category) {
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("on"));
  button.classList.add("on");

  items.forEach((item) => {
    item.hidden = category !== "all" && item.dataset.cat !== category;
  });
}

function openPhoto(button) {
  const picture = button.querySelector("img");
  lightboxImage.src = button.dataset.full;
  lightboxImage.alt = picture.alt;
  lightboxCaption.textContent = button.dataset.caption;
  lightbox.showModal();
}

function closePhoto() {
  lightbox.close();
}

// clicking the dark area around the photo also closes it
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closePhoto();
  }
});
