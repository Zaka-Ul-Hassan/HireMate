// frontend\static\js\user\login.js

document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1:8000/api/users/login", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    // Required to include the cookie in the response
    xhr.withCredentials = true;

    
    xhr.onload = function () {
        if (xhr.status === 200) {
            window.location.href = "/dashboard"; // Redirect after login
        } else {
                Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Invalid email or password',
                customClass: {
                    popup: 'me-2' // Adds right spacing
                },
                showConfirmButton: false,
                timer: 3000
                });
        }
    };

    xhr.send(JSON.stringify({
        Email: email,
        Password: password
    }));
});
