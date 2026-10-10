// Shared by every page: phone menu button and the year in the footer
function toggleMenu() {
  const nav = document.getElementById("nav");
  const button = document.querySelector(".menu-button");
  const isOpen = nav.classList.toggle("open");
  button.setAttribute("aria-expanded", isOpen);
}

const year = document.getElementById("year");
if (year) {
  year.textContent = new Date().getFullYear();
}
