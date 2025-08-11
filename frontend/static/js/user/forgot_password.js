// frontend\static\js\user\forgot_password.js

document.addEventListener("DOMContentLoaded", () => {
    debugger
    const form = document.querySelector("#forgotPasswordForm");

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Stop normal form submit

        const email = form.querySelector("input[name='email']").value.trim();

        try {
            const response = await fetch("http://127.0.0.1:8000/api/users/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: email }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.detail || "Something went wrong.");
                return;
            }

            // On success → redirect to reset password page
            window.location.href = `/reset-request-sent?email=${encodeURIComponent(email)}`;
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Please try again.");
        }
    });
});
