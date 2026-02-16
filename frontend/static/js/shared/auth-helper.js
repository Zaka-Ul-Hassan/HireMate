// frontend\static\js\shared\auth-helper.js

/**
 * Helper function to make authenticated API requests
 * Automatically adds Authorization header with access token
 */
function makeAuthenticatedRequest(method, url, data = null, callback = null, errorCallback = null) {
    // Check token validity before sending request
    if (!checkTokenValidity()) return;

    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.withCredentials = true;

    // Get access token from localStorage and add to headers
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
        xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    }

    xhr.onload = function () {
        if (xhr.status === 401) {
            // Unauthorized - redirect to login
            handleUnauthorized();
            return;
        }

        if (callback) {
            callback(xhr);
        }
    };

    xhr.onerror = function() {
        if (errorCallback) {
            errorCallback(xhr);
        } else {
            console.error('Request failed:', xhr.statusText);
        }
    };

    if (data) {
        xhr.send(JSON.stringify(data));
    } else {
        xhr.send();
    }

    return xhr;
}

/**
 * Handle unauthorized access - clear localStorage and redirect to login
 */
function handleUnauthorized() {
    // Clear all stored user data
    localStorage.removeItem('user_data');
    localStorage.removeItem('access_token');
    localStorage.removeItem('access_token_expiry');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_roles');

    // Show error message
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Session expired. Please login again.',
        customClass: {
            popup: 'me-2'
        },
        showConfirmButton: false,
        timer: 3000
    }).then(() => {
        window.location.href = "/";
    });
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return checkTokenValidity();
}

/**
 * Check token validity
 */
function checkTokenValidity() {
    const accessToken = localStorage.getItem('access_token');
    const tokenExpiry = localStorage.getItem('access_token_expiry');

    if (!accessToken || !tokenExpiry) {
        handleUnauthorized();
        return false;
    }

    const now = new Date().getTime();
    if (now >= parseInt(tokenExpiry)) {
        handleUnauthorized();
        return false;
    }

    return true;
}

/**
 * Set access token and expiry (call this on login)
 */
function setAccessToken(token, expiresInMinutes = 60) {
    localStorage.setItem('access_token', token);

    const expiryTime = new Date().getTime() + expiresInMinutes * 60 * 1000; // milliseconds
    localStorage.setItem('access_token_expiry', expiryTime.toString());
}

/**
 * Get current user data from localStorage
 */
function getCurrentUser() {
    try {
        const userData = localStorage.getItem('user_data');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
}

/**
 * Get user roles
 */
function getUserRoles() {
    try {
        const rolesJson = localStorage.getItem('user_roles');
        if (!rolesJson) return [];
        const roles = JSON.parse(rolesJson);
        return roles.map(role => role.Name);
    } catch (error) {
        console.error('Error parsing user roles:', error);
        return [];
    }
}

/**
 * Check if user has a specific role
 */
function hasRole(roleName) {
    const roles = getUserRoles();
    return roles.some(role => role.toLowerCase() === roleName.toLowerCase());
}

/**
 * Protect page - redirect to login if not authenticated
 */
function protectPage() {
    if (!isAuthenticated()) {
        window.location.href = "/";
    }
}
