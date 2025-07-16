document.addEventListener("DOMContentLoaded", function () {
  const toInput = document.getElementById('to');
  const toError = document.getElementById('email_error');
  const subjectInput = document.getElementById('subject');
  const bodyInput = document.getElementById('body');
  const form = document.getElementById('composeForm');

  // RFC-like email regex
  const emailRegex = /^(([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?))$/;

  // Real-time validation
  toInput.addEventListener('input', function () {
    const emails = toInput.value.split(/[,;]+/).map(e => e.trim()).filter(e => e);
    const allValid = emails.every(email => emailRegex.test(email));

    if (!emails.length) {
      toInput.classList.add('is-invalid');
      toError.textContent = 'Email is required.';
    } else if (!allValid) {
      toInput.classList.add('is-invalid');
      toError.textContent = 'One or more email addresses are invalid. Separate them with commas or semicolons.';
    } else {
      toInput.classList.remove('is-invalid');
      toError.textContent = '';
    }
  });

  // Submit handler
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Disable button to prevent double submission
  const sendBtn = form.querySelector("button[type='submit']");
  sendBtn.disabled = true;
  sendBtn.textContent = "Sending...";


    const toEmails = toInput.value.split(/[,;]+/).map(e => e.trim()).filter(e => e);
    const allValid = toEmails.every(email => emailRegex.test(email));
    const subject = subjectInput.value.trim();
    const body = bodyInput.value.trim();

    if (!toEmails.length) {
      toInput.classList.add('is-invalid');
      toError.textContent = "Email is required.";
      return;
    } else if (!allValid) {
      toInput.classList.add('is-invalid');
      toError.textContent = "One or more email addresses are invalid.";
      return;
    } else {
      toInput.classList.remove('is-invalid');
      toError.textContent = '';
    }

    const payload = {
      to: toEmails,
      subject: subject,
      body: body
    };

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1:8000/api/email/send-email", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function () {

        sendBtn.disabled = false;
        sendBtn.textContent = "Send";
        
      if (xhr.status === 200) {
        form.reset();
        Swal.fire({
          position: "top",
          icon: "success",
          title: "Email sent successfully!",
          showConfirmButton: false,
          timer: 1500
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: xhr.responseText || "Sending failed."
        });
      }
    };

    xhr.onerror = function () {
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Could not reach the email server."
      });
    };

    xhr.send(JSON.stringify(payload));
  });
});
