// frontend\static\js\shared\password-toggle.js

function togglePassword() {
  const password = document.getElementById("password");
  const icon = document.getElementById("toggleIcon");

  if (password.type === "password") {
    password.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    password.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}
