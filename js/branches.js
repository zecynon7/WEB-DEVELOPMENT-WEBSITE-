// Branches page: search box and region buttons
let region = "All";

function setRegion(button, name) {
  region = name;
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("on"));
  button.classList.add("on");
  filterBranches();
}

function filterBranches() {
  const text = document.getElementById("search").value.toLowerCase();
  let shown = 0;

  document.querySelectorAll(".branch-card").forEach((card) => {
    const textMatch = card.textContent.toLowerCase().includes(text);
    const regionMatch = region === "All" || card.dataset.region === region;

    if (textMatch && regionMatch) {
      card.style.display = "block";
      shown++;
    } else {
      card.style.display = "none";
    }
  });

  document.getElementById("count").textContent = "Showing " + shown + " of 7 branches";
}
