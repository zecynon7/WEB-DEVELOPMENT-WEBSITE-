// Menu page: show only the category that was clicked
function showCategory(button, id) {
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("on"));
  document.querySelectorAll(".menu-group").forEach((group) => group.classList.remove("show"));

  button.classList.add("on");
  document.getElementById(id).classList.add("show");
}
