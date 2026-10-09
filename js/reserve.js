// Reserve page: the browser checks the required fields, then we show a thank-you message
const form = document.getElementById("reserve-form");

// no past dates
document.getElementById("date").min = new Date().toISOString().split("T")[0];

form.addEventListener("submit", (event) => {
  event.preventDefault();
  form.reset();
  document.getElementById("success").style.display = "block";
});
