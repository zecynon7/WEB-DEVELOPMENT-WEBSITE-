// Contact page: check the form, then show a thank-you or an error message
const form = document.getElementById("contact-form");
const status = document.getElementById("form-status");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("cname");
  const email = document.getElementById("cemail");
  const message = document.getElementById("cmessage");

  const nameOk = name.value.trim() !== "";
  const emailOk = email.value.includes("@") && email.value.includes(".");
  const messageOk = message.value.trim() !== "";

  name.classList.toggle("is-invalid", !nameOk);
  email.classList.toggle("is-invalid", !emailOk);
  message.classList.toggle("is-invalid", !messageOk);

  if (nameOk && emailOk && messageOk) {
    form.reset();
    status.textContent = "Thank you! Your message has been sent.";
    status.className = "form__status ok";
  } else {
    status.textContent = "Please fill in all required fields with valid information.";
    status.className = "form__status bad";
  }
});
