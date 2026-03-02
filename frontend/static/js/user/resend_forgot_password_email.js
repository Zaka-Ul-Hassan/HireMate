// frontend\static\js\user\resend_forgot_password_email.js

document.addEventListener("DOMContentLoaded", function () {

  const BASE_URL = window.APP_CONFIG.FRONTEND_BASE_URL || 'http://127.0.0.1:8000';
  const resendBtn = document.getElementById('resendEmailBtn');
  if (!resendBtn) return;

  const emailEl = document.querySelector("p strong");
  const email = emailEl ? emailEl.innerText.trim() : "";

  resendBtn.addEventListener('click', function (e) {
    e.preventDefault();

    resendBtn.disabled = true;

    fetch(`${BASE_URL}/api/users/forgot-password`, {  
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    })
    .then(async response => {
      const data = await response.json();
      if (response.ok) {
        toastr.success(data.message || 'Reset email resent successfully!', '', { positionClass: 'toast-top-right' });
      } else {
        toastr.error(data.message || 'Failed to resend reset email.', '', { positionClass: 'toast-top-right' });
      }
    })
    .catch(error => {
      console.error('Error:', error);
      toastr.error('Something went wrong. Please try again.', '', { positionClass: 'toast-top-right' });
    })
    .finally(() => {
      resendBtn.disabled = false;
    });
  });
});


