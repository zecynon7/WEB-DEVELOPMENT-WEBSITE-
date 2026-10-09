// Menu page: shows the items of the chosen category

function showCategory(category) {
  var items = menu[category];
  var html = "";

  for (var i = 0; i < items.length; i++) {
    var colorClass = "ph" + (i % 4 + 1);
    var price = '<span class="price soon">Price coming soon</span>';
    if (items[i].price !== "") {
      price = '<span class="price">₱' + items[i].price + "</span>";
    }
    html += '<div class="card">';
    html += '<div class="ph ' + colorClass + '">Photo: ' + items[i].name + "</div>";
    html += "<h3>" + items[i].name + "</h3>";
    html += '<p class="small">' + items[i].desc + "</p>";
    html += price + "</div>";
  }
  document.getElementById("menu-grid").innerHTML = html;

  // highlight the chosen tab
  var tabs = document.getElementsByClassName("tab");
  for (var j = 0; j < tabs.length; j++) {
    if (tabs[j].textContent === category) {
      tabs[j].classList.add("on");
    } else {
      tabs[j].classList.remove("on");
    }
  }
}

// Build the tab buttons, then show the first category
var tabHtml = "";
for (var name in menu) {
  tabHtml += '<button class="tab" onclick="showCategory(\'' + name + '\')">' + name + "</button>";
}
document.getElementById("tabs").innerHTML = tabHtml;
showCategory("Freskaró Juices");
