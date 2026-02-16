// frontend\static\js\user\login.js

document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1:8000/api/users/login", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.withCredentials = true;

    xhr.onload = function () {
        let response;

        // Parse response safely
        try {
            response = JSON.parse(xhr.responseText);
            console.log("Login response:", response);
        } catch (error) {
            showToast("error", "Invalid server response");
            return;
        }

        // SUCCESS
        if (xhr.status === 200 && response.status === true) {

            // Clear previous user data if different user
            const oldUserId = localStorage.getItem("user_id");
            if (oldUserId && oldUserId !== String(response.data.Id)) {
                clearUserSpecificData(oldUserId);
            }

            // Store user data
            localStorage.setItem("user_data", JSON.stringify(response.data));
            localStorage.setItem("user_id", response.data.Id);
            localStorage.setItem("user_email", response.data.Email);
            localStorage.setItem("user_name", response.data.Name || "");
            localStorage.setItem("user_roles", JSON.stringify(response.data.Roles));

            // Store token (60 minutes)
            setAccessToken(response.data.AccessToken, 60);

            // Show backend success message
            showToast("success", response.message || "Login successful");

            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 1500);
        }

        // BACKEND FAILURE (status=false)
        else if (xhr.status === 200 && response.status === false) {
            showToast("error", response.message || "Login failed");
        }

        // HTTP ERROR (401, 403, 404, etc.)
        else {
            showToast("error", response.message || "Invalid email or password");
        }
    };

    xhr.onerror = function () {
        showToast("error", "Network error. Please try again.");
    };

    xhr.send(JSON.stringify({
        Email: email,
        Password: password
    }));
});


// ===============================
// Toast Helper
// ===============================
function showToast(type, message) {
    Swal.fire({
        toast: true,
        position: "top-end",
        icon: type,
        title: message,
        showConfirmButton: false,
        timer: 3000,
        customClass: {
            popup: "me-2"
        }
    });
}


// ===============================
//  Clear old user data
// ===============================
function clearUserSpecificData(userId) {
    console.log("Clearing data for old user:", userId);

    localStorage.removeItem(`candidate_chat_history_${userId}`);
    localStorage.removeItem(`candidate_chat_session_id_${userId}`);

    ["userMenu", "resumeMenu", "emailMenu"].forEach(menuId => {
        localStorage.removeItem(`sidebar_${menuId}_${userId}`);
    });

    console.log("Old user data cleared");
}
