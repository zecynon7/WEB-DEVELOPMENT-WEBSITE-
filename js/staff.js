// Staff page (demo only): a simple login and a "Mark Confirmed" button
const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.getElementById("semail").value;
  const password = document.getElementById("spassword").value;

  if (email === "staff@cafeblkbrwn.com" && password === "brwn2026") {
    document.getElementById("login").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");
  } else {
    document.getElementById("login-error").textContent = "Email or password is incorrect.";
  }
});

function logout() {
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("login").classList.remove("hidden");
}

// switch between the two tables
function showTable(button, id) {
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("on"));
  document.querySelectorAll(".table-box").forEach((box) => box.classList.add("hidden"));
  button.classList.add("on");
  document.getElementById(id).classList.remove("hidden");
}

function confirmBooking(button) {
  const pill = button.closest("tr").querySelector(".pill");
  pill.textContent = "Confirmed";
  pill.className = "pill confirmed";
  button.remove();

  const pending = document.getElementById("count-pending");
  const confirmed = document.getElementById("count-confirmed");
  pending.textContent = Number(pending.textContent) - 1;
  confirmed.textContent = Number(confirmed.textContent) + 1;
}
