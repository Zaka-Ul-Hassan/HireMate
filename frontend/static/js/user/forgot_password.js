// frontend/static/js/user/forgot_password.js

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#forgotPasswordForm");
    const emailInput = document.getElementById("email");
    const emailError = document.getElementById("email_error");
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

    // Real-time email validation
    emailInput.addEventListener("input", () => {
        const value = emailInput.value.trim();

        if (!value) {
            emailInput.classList.add("is-invalid");
            emailError.textContent = "Email is required.";
        } else if (!emailRegex.test(value)) {
            emailInput.classList.add("is-invalid");
            emailError.textContent = "Please enter a valid email address.";
        } else {
            emailInput.classList.remove("is-invalid");
            emailError.textContent = "";
        }
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();
        let isValid = true;

        // Final check before submit
        if (!email) {
            emailInput.classList.add("is-invalid");
            emailError.textContent = "Email is required.";
            isValid = false;
        } else if (!emailRegex.test(email)) {
            emailInput.classList.add("is-invalid");
            emailError.textContent = "Please enter a valid email address.";
            isValid = false;
        } else {
            emailInput.classList.remove("is-invalid");
            emailError.textContent = "";
        }

        if (!isValid) return;

        try {
            const response = await fetch("http://127.0.0.1:8000/api/users/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ Email: email }),
            });

            const result = await response.json();

            if (!response.ok) {
                toastr.error(result.detail || "Something went wrong.", "", { positionClass: "toast-top-right" });
                return;
            }

            toastr.success("Reset email sent! Check your inbox.", "", { positionClass: "toast-top-right" });
            setTimeout(() => {
                window.location.href = `/reset-request-sent?email=${encodeURIComponent(email)}`;
            }, 1500);
        } catch (error) {
            console.error("Error:", error);
            toastr.error("An error occurred. Please try again.", "", { positionClass: "toast-top-right" });
        }
    });
});
