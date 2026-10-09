// Contact page: checks the message form and saves it

document.getElementById("contact-form").addEventListener("submit", function (event) {
  event.preventDefault();

  var name = document.getElementById("cname").value.trim();
  var email = document.getElementById("cemail").value.trim();
  var message = document.getElementById("cmessage").value.trim();
  var problem = "";

  if (name === "") { problem = "Please enter your name."; }
  else if (!validEmail(email)) { problem = "Please enter a valid email address."; }
  else if (message.length < 5) { problem = "Please write a short message."; }

  document.getElementById("form-error").textContent = problem;
  if (problem !== "") {
    return;
  }

  addToList("cb_inquiries", {
    name: name,
    email: email,
    topic: document.getElementById("topic").value,
    message: message
  });

  document.getElementById("contact-form").reset();
  document.getElementById("success").style.display = "block";
});
