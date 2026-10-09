// Contact page: show a thank-you message after sending
const form = document.getElementById("contact-form");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  form.reset();
  document.getElementById("success").style.display = "block";
});
