// frontend/static/js/user/logout.js

document.addEventListener("DOMContentLoaded", function () {
    // Use event delegation to handle logout button clicks
    // This ensures it works even if the button is dynamically shown/hidden
    document.addEventListener("click", function(e) {
        const logoutButton = e.target.closest("#logoutButton");
        
        if (logoutButton) {
            e.preventDefault();
            
            // Show confirmation dialog
            Swal.fire({
                title: 'Are you sure?',
                text: "You will be logged out of your account",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, logout',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    performLogout();
                }
            });
        }
    });
});

function performLogout() {
    // Get user ID before clearing localStorage
    const userId = localStorage.getItem('user_id') || 'default';
    
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1:8000/api/users/logout", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.withCredentials = true;
    
    // Get access token from localStorage
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
        xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    }

    xhr.onload = function () {
        // Clear user-specific data first
        clearUserSpecificData(userId);
        
        // Then clear general user data
        localStorage.removeItem('user_data');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_roles');
        
        // Clear sidebar state
        const sidebarKeys = Object.keys(localStorage).filter(key => key.startsWith('sidebar_'));
        sidebarKeys.forEach(key => localStorage.removeItem(key));
        
        if (xhr.status === 200) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Logged out successfully',
                customClass: {
                    popup: 'me-2'
                },
                showConfirmButton: false,
                timer: 2000
            }).then(() => {
                window.location.href = "/";
            });
        } else {
            // Even if logout fails on server, redirect to login
            window.location.href = "/";
        }
    };

    xhr.onerror = function() {
        // Clear user-specific data before clearing all
        clearUserSpecificData(userId);
        
        // Clear all localStorage on error
        localStorage.clear();
        window.location.href = "/";
    };

    xhr.send();
}

// Function to clear user-specific data
function clearUserSpecificData(userId) {
    console.log('Clearing user-specific data for user:', userId);
    
    // Clear chat history for this user
    localStorage.removeItem(`candidate_chat_history_${userId}`);
    localStorage.removeItem(`candidate_chat_session_id_${userId}`);
    
    // Clear sidebar collapse states for this user
    ['userMenu', 'resumeMenu', 'emailMenu'].forEach(menuId => {
        localStorage.removeItem(`sidebar_${menuId}_${userId}`);
    });
    
    // Clear any other user-specific keys (add more as needed)
    // Example: preferences, settings, etc.
    const userSpecificKeys = Object.keys(localStorage).filter(key => 
        key.includes(`_${userId}`) || key.endsWith(`_${userId}`)
    );
    
    userSpecificKeys.forEach(key => {
        console.log('Removing key:', key);
        localStorage.removeItem(key);
    });
    
    console.log('User-specific data cleared successfully');
}