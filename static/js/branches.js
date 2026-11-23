// Branches page: search box, region buttons, the map, and cards that re-deal when you filter
let region = "All";

function setRegion(button, name) {
  region = name;
  const tabs = button.closest(".tabs");
  tabs.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("on"));
  button.classList.add("on");
  glideTabs(tabs);
  filterBranches();
}

function filterBranches() {
  const text = document.getElementById("search").value.toLowerCase();
  const shown = [];

  document.querySelectorAll(".branch-grid > li").forEach((li) => {
    const card = li.querySelector(".branch-card");
    // search only the branch name and area (not the button labels)
    const name = card.querySelector("h2").textContent;
    const area = card.querySelector(".branch-card__place").textContent;
    const textMatch = (name + " " + area).toLowerCase().includes(text);
    const regionMatch = region === "All" || card.dataset.region === region;
    li.hidden = !(textMatch && regionMatch);
    if (!li.hidden) shown.push(li);
  });

  document.getElementById("count").textContent = "Showing " + shown.length + " of 7 branches";
  document.getElementById("empty").hidden = shown.length > 0;
  if (window.BB && !BB.reduce) BB.replay(shown, 70);
}

// ===== MAP (Leaflet + OpenStreetMap: free, no API key) =====
// The pins are APPROXIMATE (town level). For an exact pin: open Google Maps,
// right-click the branch, click the numbers at the top of the menu to copy
// them, then paste them below as lat, lng.
const places = [
  { name: "Capipisa, Tanza – Main Branch", area: "Tanza, Cavite", lat: 14.3945, lng: 120.851 },
  { name: "Naic Branch", area: "Naic, Cavite", lat: 14.3188, lng: 120.766 },
  { name: "General Trias Branch", area: "General Trias, Cavite", lat: 14.3869, lng: 120.8814 },
  { name: "Kawit Branch", area: "Kawit, Cavite", lat: 14.4436, lng: 120.9061 },
  { name: "Trece Martires Branch", area: "Trece Martires City, Cavite", lat: 14.2822, lng: 120.8669 },
  { name: "SM City Tanza Branch", area: "SM City Tanza, Cavite", lat: 14.356, lng: 120.859 },
  { name: "Festival Mall Alabang Branch", area: "Festival Mall, Alabang, Metro Manila", lat: 14.417, lng: 121.0395 }
];

let map;
const markers = [];

function showAllPins() {
  if (!map) return;
  map.fitBounds(L.featureGroup(markers).getBounds(), { padding: [40, 40] });
}

function showOnMap(name) {
  if (!map) return;
  const index = places.findIndex((place) => place.name === name);
  map.flyTo([places[index].lat, places[index].lng], 16);
  markers[index].openPopup();
  document.getElementById("map-box").scrollIntoView({ behavior: "smooth", block: "center" });
}

if (typeof L === "undefined") {
  // the map library did not load (no internet)
  document.getElementById("map").textContent = "The map could not load. Please check your internet connection.";
} else {
  map = L.map("map");

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  // the café logo is used as the pin
  const pin = L.icon({
    iconUrl: "assets/logo.jpg",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
    className: "map-pin"
  });

  places.forEach((place) => {
    const directions =
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent("Café BLK & BRWN " + place.area);

    const marker = L.marker([place.lat, place.lng], { icon: pin, title: place.name }).addTo(map);
    marker.bindPopup(
      "<b>" + place.name + "</b><br>" + place.area +
      '<br><a href="' + directions + '" target="_blank">Get Directions</a>'
    );
    markers.push(marker);
  });

  showAllPins();
}

// Add a "Show on map" button to every branch card
document.querySelectorAll(".branch-card").forEach((card) => {
  const name = card.dataset.name;

  const button = document.createElement("button");
  button.className = "btn btn--secondary btn--sm";
  button.type = "button";
  button.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-map-pin"></use></svg> Show on map';
  button.addEventListener("click", () => showOnMap(name));

  card.querySelector(".branch-card__actions").insertBefore(button, card.querySelector(".text-link"));
});
