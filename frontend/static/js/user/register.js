// frontend\static\js\user\register.js

document.addEventListener("DOMContentLoaded", function () {

  const BASE_URL = window.APP_CONFIG.FRONTEND_BASE_URL || 'http://127.0.0.1:8000';
  const emailInput = document.getElementById('email');
  const emailError = document.getElementById('email_error');
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  const passwordInput = document.getElementById('password');
  const passwordError = document.getElementById('password_error');
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).+$/;

  const requiredFields = [
    { id: 'first_name', label: 'First Name' },
    { id: 'age', label: 'Age' },
    { id: 'gender', label: 'Gender' },
    { id: 'dob', label: 'Date of Birth' },
    { id: 'address', label: 'Address' },
    { id: 'country', label: 'Country' },
    { id: 'phone_number', label: 'Phone Number' },
    { id: 'email', label: 'Email' },
    { id: 'password', label: 'Password' }
  ];

  // Generic required field validation (except email & password)
  function validateField(input, errorSpan, label) {
    if (!input.value.trim()) {
      input.classList.add('is-invalid');
      errorSpan.textContent = `${label} is required.`;
      return false;
    } else {
      input.classList.remove('is-invalid');
      errorSpan.textContent = '';
      return true;
    }
  }

  // Email real-time validation
  emailInput.addEventListener('input', function () {
    const value = emailInput.value.trim();

    if (!value) {
      emailInput.classList.add('is-invalid');
      emailError.textContent = 'Email is required.';
    } else if (!emailRegex.test(value)) {
      emailInput.classList.add('is-invalid');
      emailError.textContent = 'Please enter a valid email address.';
    } else {
      emailInput.classList.remove('is-invalid');
      emailError.textContent = '';
    }
  });

  // Password real-time validation
  passwordInput.addEventListener('input', function () {
    const value = passwordInput.value.trim();

    if (!value) {
      passwordInput.classList.add('is-invalid');
      passwordError.textContent = 'Password is required.';
    } else if (!passwordRegex.test(value)) {
      passwordInput.classList.add('is-invalid');
      passwordError.textContent = 'Password must include 1 uppercase, 1 lowercase, 1 number, and 1 special character.';
    } else {
      passwordInput.classList.remove('is-invalid');
      passwordError.textContent = '';
    }
  });

  // Input/change event for other fields
  requiredFields.forEach(({ id, label }) => {
    const input = document.getElementById(id);
    const error = document.getElementById(id + '_error');

    const eventType = input.tagName === 'SELECT' ? 'change' : 'input';

    input.addEventListener(eventType, function () {
      if (id === 'email' || id === 'password') return; // already handled
      validateField(input, error, label);
    });
  });

  // Form submit handler
  document.getElementById("registerForm").addEventListener("submit", function (e) {
    e.preventDefault();
    let isValid = true;

    requiredFields.forEach(({ id, label }) => {
      const input = document.getElementById(id);
      const error = document.getElementById(id + '_error');

      if (id === 'email') {
        const value = input.value.trim();
        if (!value) {
          input.classList.add('is-invalid');
          error.textContent = 'Email is required.';
          isValid = false;
        } else if (!emailRegex.test(value)) {
          input.classList.add('is-invalid');
          error.textContent = 'Please enter a valid email address.';
          isValid = false;
        } else {
          input.classList.remove('is-invalid');
          error.textContent = '';
        }
      } else if (id === 'password') {
        const value = input.value.trim();
        if (!value) {
          input.classList.add('is-invalid');
          error.textContent = 'Password is required.';
          isValid = false;
        } else if (!passwordRegex.test(value)) {
          input.classList.add('is-invalid');
          error.textContent = 'Password must include 1 uppercase, 1 lowercase, 1 number, and 1 special character.';
          isValid = false;
        } else {
          input.classList.remove('is-invalid');
          error.textContent = '';
        }
      } else {
        const valid = validateField(input, error, label);
        if (!valid) isValid = false;
      }
    });

    if (!isValid) return;

    // Send form if valid
    const form = document.getElementById("registerForm");
    const formData = new FormData(form);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}/api/users/register`, true);

    xhr.onload = function () {
      if (xhr.status === 200) {
        Swal.fire({
          position: "top",
          icon: "success",
          title: "Registration successful!",
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          form.reset();
          window.location.href = "/";
        });
      } else {
        try {
          const response = JSON.parse(xhr.responseText);
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: response.detail || JSON.stringify(response),
            confirmButtonText: "Ok"
          });
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "An error occurred",
            text: xhr.responseText || "Something went wrong during registration.",
            confirmButtonText: "Ok"
          });
        }
      }
    };

    xhr.onerror = function () {
      Swal.fire({
        icon: "error",
        title: "An error occurred",
        text: "Network error occurred during registration.",
        confirmButtonText: "Ok"
      });
    };

    xhr.send(formData);
  });
});
