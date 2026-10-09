// Branches page: search box + region filter

var chosenRegion = "All";

function showBranches() {
  var search = document.getElementById("search").value.toLowerCase();
  var html = "";
  var count = 0;

  for (var i = 0; i < branches.length; i++) {
    var b = branches[i];
    var text = (b.name + " " + b.area).toLowerCase();
    var regionOk = (chosenRegion === "All" || b.region === chosenRegion);

    if (regionOk && text.indexOf(search) !== -1) {
      count++;
      var mapLink = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Café BLK & BRWN " + b.area);
      html += '<div class="card">';
      html += '<p class="region">' + b.region + "</p>";
      html += "<h3>" + b.name + "</h3>";
      html += '<p class="small">' + b.area + "</p>";
      html += '<p class="small">' + b.note + "</p>";
      html += '<p class="small"><i>Hours coming soon.</i></p>';
      html += '<div class="buttons">';
      html += '<a class="btn btn-primary" href="' + mapLink + '" target="_blank">Get Directions</a>';
      html += '<a class="btn btn-outline" href="reserve.html?branch=' + b.id + '">Reserve Here</a>';
      html += "</div></div>";
    }
  }

  if (count === 0) {
    html = "<p>No branch found. Try a name like Kawit.</p>";
  }
  document.getElementById("branch-grid").innerHTML = html;
  document.getElementById("count").textContent = "Showing " + count + " of " + branches.length + " branches";
}

function setRegion(region) {
  chosenRegion = region;
  var buttons = document.getElementsByClassName("tab");
  for (var i = 0; i < buttons.length; i++) {
    if (buttons[i].textContent === region) {
      buttons[i].classList.add("on");
    } else {
      buttons[i].classList.remove("on");
    }
  }
  showBranches();
}

showBranches();
