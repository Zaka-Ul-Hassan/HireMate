// frontend/static/js/user/set_password.js

document.addEventListener("DOMContentLoaded", function () {
    
    const BASE_URL = window.APP_CONFIG.FRONTEND_BASE_URL || 'http://127.0.0.1:8000';
    const form = document.querySelector("#setPasswordForm");

    const newPasswordInput = document.querySelector("#new_password");
    const confirmPasswordInput = document.querySelector("#confirm_password");
    const newPasswordError = document.querySelector("#newPasswordError");
    const confirmPasswordError = document.querySelector("#confirmPasswordError");

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).+$/;

    // Token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    // Real-time password validation
    newPasswordInput.addEventListener("input", function () {
        const value = newPasswordInput.value.trim();
        if (!value) {
            newPasswordInput.classList.add("is-invalid");
            newPasswordError.textContent = "New password is required.";
        } else if (!passwordRegex.test(value)) {
            newPasswordInput.classList.add("is-invalid");
            newPasswordError.textContent = "Password must include upper, lower, number, and special character.";
        } else {
            newPasswordInput.classList.remove("is-invalid");
            newPasswordError.textContent = "";
        }

        if (confirmPasswordInput.value.trim()) validateConfirmPassword();
    });

    confirmPasswordInput.addEventListener("input", validateConfirmPassword);

    function validateConfirmPassword() {
        const confirmValue = confirmPasswordInput.value.trim();
        const newValue = newPasswordInput.value.trim();

        if (!confirmValue) {
            confirmPasswordInput.classList.add("is-invalid");
            confirmPasswordError.textContent = "Confirm password is required.";
        } else if (confirmValue !== newValue) {
            confirmPasswordInput.classList.add("is-invalid");
            confirmPasswordError.textContent = "Passwords do not match.";
        } else {
            confirmPasswordInput.classList.remove("is-invalid");
            confirmPasswordError.textContent = "";
        }
    }

    // Form submit
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        let isValid = true;
        if (!newPasswordInput.value.trim() || newPasswordInput.classList.contains("is-invalid")) isValid = false;
        if (!confirmPasswordInput.value.trim() || confirmPasswordInput.classList.contains("is-invalid")) isValid = false;
        if (!isValid) return;

        try {
            const response = await fetch(`${BASE_URL}/api/users/set-password?token=${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    NewPassword: newPasswordInput.value.trim(),
                    ConfirmPassword: confirmPasswordInput.value.trim()
                })
            });

            const data = await response.json();

            if (response.ok) {
                toastr.success(data.message || "Password set successfully!", "", { positionClass: "toast-top-right" });
                setTimeout(() => window.location.href = "/", 1500);
            } else {
                toastr.error(data.detail || data.message || "Failed to set password.", "", { positionClass: "toast-top-right" });
            }
        } catch (error) {
            console.error("Error:", error);
            toastr.error("Something went wrong. Please try again.", "", { positionClass: "toast-top-right" });
        }
    });
});