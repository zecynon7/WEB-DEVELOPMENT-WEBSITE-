// Reserve page: fills the dropdowns, checks the form, and saves the request

var form = document.getElementById("reserve-form");

// branch dropdown
var branchHtml = "";
for (var i = 0; i < branches.length; i++) {
  branchHtml += '<option value="' + branches[i].name + '">' + branches[i].name + "</option>";
}
document.getElementById("branch").innerHTML = branchHtml;

// pre-select a branch if we came from the Branches page
var wanted = new URLSearchParams(window.location.search).get("branch");
for (var k = 0; k < branches.length; k++) {
  if (branches[k].id === wanted) {
    document.getElementById("branch").value = branches[k].name;
  }
}

// guests dropdown (1 to 12)
var guestHtml = "";
for (var g = 1; g <= 12; g++) {
  guestHtml += '<option value="' + g + '">' + g + (g === 1 ? " guest" : " guests") + "</option>";
}
document.getElementById("guests").innerHTML = guestHtml;
document.getElementById("guests").value = "2";

// time dropdown (10:00 to 21:30)
var timeHtml = '<option value="">Select a time</option>';
for (var h = 10; h <= 21; h++) {
  timeHtml += "<option>" + h + ":00</option><option>" + h + ":30</option>";
}
document.getElementById("time").innerHTML = timeHtml;

// do not allow past dates
document.getElementById("date").min = new Date().toISOString().slice(0, 10);

form.addEventListener("submit", function (event) {
  event.preventDefault();

  var name = document.getElementById("name").value.trim();
  var phone = document.getElementById("phone").value.trim();
  var email = document.getElementById("email").value.trim();
  var date = document.getElementById("date").value;
  var time = document.getElementById("time").value;
  var message = "";

  if (name.length < 2) { message = "Please enter your full name."; }
  else if (phone.length < 7) { message = "Please enter a valid phone number."; }
  else if (!validEmail(email)) { message = "Please enter a valid email address."; }
  else if (date === "") { message = "Please choose a date."; }
  else if (time === "") { message = "Please choose a time."; }

  document.getElementById("form-error").textContent = message;
  if (message !== "") {
    return;
  }

  addToList("cb_reservations", {
    id: Date.now(),
    name: name,
    phone: phone,
    email: email,
    branch: document.getElementById("branch").value,
    guests: document.getElementById("guests").value,
    date: date,
    time: time,
    note: document.getElementById("note").value,
    status: "Pending"
  });

  form.reset();
  document.getElementById("guests").value = "2";
  document.getElementById("success").style.display = "block";
});
