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
        if (xhr.status === 200) {
            try {
                const response = JSON.parse(xhr.responseText);

                if (response.status && response.data) {
                    // Store user data
                    localStorage.setItem('user_data', JSON.stringify(response.data));
                    localStorage.setItem('user_id', response.data.Id);
                    localStorage.setItem('user_email', response.data.Email);
                    localStorage.setItem('user_name', response.data.Name);
                    localStorage.setItem('user_roles', JSON.stringify(response.data.Roles));

                    // Set token and expiry (60 minutes)
                    setAccessToken(response.data.AccessToken, 60);

                    // Show success message
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'Login successful!',
                        customClass: {
                            popup: 'me-2'
                        },
                        showConfirmButton: false,
                        timer: 2000
                    }).then(() => {
                        window.location.href = "/dashboard";
                    });
                } else {
                    throw new Error('Invalid response format');
                }
            } catch (error) {
                console.error('Error parsing response:', error);
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'error',
                    title: 'Login failed. Please try again.',
                    customClass: {
                        popup: 'me-2'
                    },
                    showConfirmButton: false,
                    timer: 3000
                });
            }
        } else {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Invalid email or password',
                customClass: {
                    popup: 'me-2'
                },
                showConfirmButton: false,
                timer: 3000
            });
        }
    };

    xhr.onerror = function() {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: 'Network error. Please try again.',
            customClass: {
                popup: 'me-2'
            },
            showConfirmButton: false,
            timer: 3000
        });
    };

    xhr.send(JSON.stringify({
        Email: email,
        Password: password
    }));
});
