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
                console.log('Login response:', response);

                if (response.status && response.data) {
                    // Clear any old user data first
                    const oldUserId = localStorage.getItem('user_id');
                    if (oldUserId && oldUserId !== String(response.data.Id)) {
                        // New user logging in - clear all old data
                        console.log('Different user detected, clearing old data...');
                        clearUserSpecificData(oldUserId);
                    }
                    
                    // Store user data
                    console.log('Storing user data in localStorage...');
                    localStorage.setItem('user_data', JSON.stringify(response.data));
                    localStorage.setItem('user_id', response.data.Id);
                    localStorage.setItem('user_email', response.data.Email);
                    
                    // Store name - ensure it's stored correctly
                    const fullName = response.data.Name || '';
                    localStorage.setItem('user_name', fullName);
                    
                    // Store roles
                    localStorage.setItem('user_roles', JSON.stringify(response.data.Roles));

                    // Set token and expiry (60 minutes)
                    setAccessToken(response.data.AccessToken, 60);

                    // Debug logging
                    console.log('=== LOGIN DATA STORED ===');
                    console.log('User ID:', response.data.Id);
                    console.log('User Name:', fullName);
                    console.log('User Email:', response.data.Email);
                    console.log('User Roles:', response.data.Roles);
                    console.log('Full user data:', response.data);
                    console.log('localStorage user_data:', localStorage.getItem('user_data'));
                    console.log('localStorage user_name:', localStorage.getItem('user_name'));
                    console.log('=========================');

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

// Function to clear user-specific data when switching users
function clearUserSpecificData(userId) {
    console.log('Clearing data for old user:', userId);
    
    // Clear chat history
    localStorage.removeItem(`candidate_chat_history_${userId}`);
    localStorage.removeItem(`candidate_chat_session_id_${userId}`);
    
    // Clear sidebar collapse states
    ['userMenu', 'resumeMenu', 'emailMenu'].forEach(menuId => {
        localStorage.removeItem(`sidebar_${menuId}_${userId}`);
    });
    
    console.log('Old user data cleared');
}