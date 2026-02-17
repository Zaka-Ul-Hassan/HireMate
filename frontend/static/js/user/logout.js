// frontend/static/js/user/logout.js

document.addEventListener("DOMContentLoaded", function () {
    document.addEventListener("click", function(e) {
        const logoutButton = e.target.closest("#logoutButton");

        if (logoutButton) {
            e.preventDefault();

            Swal.fire({
                title: 'Are you sure?',
                text: "You will be logged out of your account",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#2563eb',
                cancelButtonColor: '#dc2626',
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
    const userId = localStorage.getItem('user_id') || 'default';

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1:8000/api/users/logout", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.withCredentials = true;

    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
        xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    }

    xhr.onload = function () {
        clearUserSpecificData(userId);

        localStorage.removeItem('user_data');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_roles');

        // Clear sidebar state
        Object.keys(localStorage)
            .filter(k => k.startsWith('sidebar_'))
            .forEach(k => localStorage.removeItem(k));

        if (xhr.status === 200) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Logged out successfully',
                customClass: { popup: 'me-2' },
                showConfirmButton: false,
                timer: 2000
            }).then(() => {
                window.location.href = "/";
            });
        } else {
            window.location.href = "/";
        }
    };

    xhr.onerror = function() {
        clearUserSpecificData(userId);
        localStorage.clear();
        window.location.href = "/";
    };

    xhr.send();
}

function clearUserSpecificData(userId) {
    console.log('Clearing user-specific data for user:', userId);

    // ── Clear saved jobs for this user ──────────────────
    localStorage.removeItem(`saved_jobs_${userId}`);

    // Clear chat history
    localStorage.removeItem(`candidate_chat_history_${userId}`);
    localStorage.removeItem(`candidate_chat_session_id_${userId}`);

    // Clear sidebar collapse states
    ['userMenu', 'resumeMenu', 'emailMenu'].forEach(menuId => {
        localStorage.removeItem(`sidebar_${menuId}_${userId}`);
    });

    // Clear any other keys ending in _userId
    Object.keys(localStorage)
        .filter(k => k.includes(`_${userId}`) || k.endsWith(`_${userId}`))
        .forEach(k => {
            console.log('Removing key:', k);
            localStorage.removeItem(k);
        });

    console.log('User-specific data cleared successfully');
}