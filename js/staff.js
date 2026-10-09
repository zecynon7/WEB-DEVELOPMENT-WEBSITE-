// Staff page. DEMO ONLY: this login runs in the browser, so it is not truly secure.

var staffEmail = "staff@cafeblkbrwn.com";
var staffPassword = "brwn2026";
var currentTab = "reservations";

function checkLogin() {
  var loggedIn = sessionStorage.getItem("cb_staff") === "yes";
  document.getElementById("login").style.display = loggedIn ? "none" : "block";
  document.getElementById("dashboard").style.display = loggedIn ? "block" : "none";
  if (loggedIn) {
    showTable();
  }
}

document.getElementById("login-form").addEventListener("submit", function (event) {
  event.preventDefault();
  var email = document.getElementById("semail").value.trim();
  var password = document.getElementById("spassword").value;
  if (email === staffEmail && password === staffPassword) {
    sessionStorage.setItem("cb_staff", "yes");
    checkLogin();
  } else {
    document.getElementById("login-error").textContent = "Email or password is incorrect.";
  }
});

function logout() {
  sessionStorage.removeItem("cb_staff");
  checkLogin();
}

function changeTab(tab) {
  currentTab = tab;
  document.getElementById("tab-reservations").classList.toggle("on", tab === "reservations");
  document.getElementById("tab-inquiries").classList.toggle("on", tab === "inquiries");
  showTable();
}

function confirmReservation(id) {
  var list = getList("cb_reservations");
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      list[i].status = "Confirmed";
    }
  }
  localStorage.setItem("cb_reservations", JSON.stringify(list));
  showTable();
}

function showTable() {
  var reservations = getList("cb_reservations");
  var inquiries = getList("cb_inquiries");
  var pending = 0;
  var confirmed = 0;
  var html = "";

  for (var i = 0; i < reservations.length; i++) {
    if (reservations[i].status === "Pending") { pending++; } else { confirmed++; }
  }
  document.getElementById("count-pending").textContent = pending;
  document.getElementById("count-confirmed").textContent = confirmed;
  document.getElementById("count-inquiries").textContent = inquiries.length;

  if (currentTab === "reservations") {
    if (reservations.length === 0) {
      html = '<p style="padding:20px">No reservations yet. Requests from the Reserve page will appear here.</p>';
    } else {
      html = "<table><tr><th>Guest</th><th>Branch</th><th>Date and time</th><th>Guests</th><th>Status</th><th>Action</th></tr>";
      for (var j = 0; j < reservations.length; j++) {
        var r = reservations[j];
        html += "<tr>";
        html += "<td>" + safe(r.name) + "<br>" + safe(r.phone) + "</td>";
        html += "<td>" + safe(r.branch) + "</td>";
        html += "<td>" + safe(r.date) + ", " + safe(r.time) + "</td>";
        html += "<td>" + safe(r.guests) + "</td>";
        html += '<td><span class="pill ' + r.status.toLowerCase() + '">' + r.status + "</span></td>";
        if (r.status === "Pending") {
          html += '<td><button class="link-button" onclick="confirmReservation(' + r.id + ')">Mark Confirmed</button></td>';
        } else {
          html += "<td>-</td>";
        }
        html += "</tr>";
      }
      html += "</table>";
    }
  } else {
    if (inquiries.length === 0) {
      html = '<p style="padding:20px">No inquiries yet. Messages from the Contact page will appear here.</p>';
    } else {
      html = "<table><tr><th>Name</th><th>Email</th><th>Topic</th><th>Message</th></tr>";
      for (var k = 0; k < inquiries.length; k++) {
        var q = inquiries[k];
        html += "<tr><td>" + safe(q.name) + "</td><td>" + safe(q.email) + "</td><td>" + safe(q.topic) + "</td><td>" + safe(q.message) + "</td></tr>";
      }
      html += "</table>";
    }
  }
  document.getElementById("table-area").innerHTML = html;
}

checkLogin();
