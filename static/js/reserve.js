// Reserve page: progress bar fills as fields are completed, the browser checks the
// required fields, then a thank-you message draws itself.
const form = document.getElementById("reserve-form");
const fill = document.getElementById("progress-fill");
const count = document.getElementById("progress-count");
const dateInput = document.getElementById("date");

// no past dates
dateInput.min = new Date().toISOString().split("T")[0];

const needed = ["name", "phone", "email", "branch", "guests", "date", "time"].map((id) => document.getElementById(id));

function updateProgress() {
  const done = needed.filter((field) => field.value.trim() !== "" && field.checkValidity()).length;
  fill.parentElement.style.setProperty("--value", (done / needed.length) * 100 + "%");
  count.textContent = done + " of " + needed.length + " ready";
}
form.addEventListener("input", updateProgress);
form.addEventListener("change", updateProgress);
updateProgress();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  form.reset();
  updateProgress();
  const ok = document.getElementById("success");
  ok.classList.remove("is-shown");
  void ok.offsetWidth;
  ok.classList.add("is-shown");
  ok.scrollIntoView({ behavior: "smooth", block: "center" });
});
