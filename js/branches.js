// Branches page: search box, region buttons and the map
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
    // search only the branch name and area (not the button labels)
    const name = card.querySelector("h3").textContent;
    const area = card.querySelector(".small").textContent;
    const textMatch = (name + " " + area).toLowerCase().includes(text);
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

// ----- Map -----
function showOnMap(name, area) {
  const place = "Café BLK & BRWN " + area;
  document.getElementById("map").src =
    "https://www.google.com/maps?q=" + encodeURIComponent(place) + "&output=embed";
  document.getElementById("map-title").textContent = name;
  document.getElementById("map-box").scrollIntoView({ behavior: "smooth", block: "center" });
}

// Add a "Show on map" button to every branch card
document.querySelectorAll(".branch-card").forEach((card) => {
  const name = card.querySelector("h3").textContent;
  const area = card.querySelector(".small").textContent;

  const button = document.createElement("button");
  button.className = "btn btn-dark";
  button.textContent = "Show on map";
  button.addEventListener("click", () => showOnMap(name, area));

  card.querySelector(".buttons").appendChild(button);
});