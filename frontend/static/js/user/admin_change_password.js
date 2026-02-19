// frontend/static/js/user/admin_change_password.js

const ACP_API = 'http://127.0.0.1:8000/api/users/admin/users/change-password';

// ─────────────────────────────────────────
// DOM refs
// ─────────────────────────────────────────
const acpForm           = document.getElementById('acpForm');
const acpUserId         = document.getElementById('acpUserId');
const acpNewPassword    = document.getElementById('acpNewPassword');
const acpConfirmPassword= document.getElementById('acpConfirmPassword');
const acpAlert          = document.getElementById('acpAlert');
const acpSubmitBtn      = document.getElementById('acpSubmitBtn');
const acpBtnText        = document.getElementById('acpBtnText');
const acpBtnSpinner     = document.getElementById('acpBtnSpinner');
const acpStrengthFill   = document.getElementById('acpStrengthFill');
const acpStrengthLabel  = document.getElementById('acpStrengthLabel');

// ─────────────────────────────────────────
// Auth
// ─────────────────────────────────────────
function authHeaders() {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

// ─────────────────────────────────────────
// Init
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        showAlert('error', '<i class="bi bi-exclamation-circle-fill"></i> Session expired. Redirecting to login...');
        setTimeout(() => window.location.href = '/', 2000);
        return;
    }

    // Check if userId was passed via URL query param
    const params = new URLSearchParams(window.location.search);
    const uid    = params.get('userId');
    if (uid) acpUserId.value = uid;

    setupListeners();
});

// ─────────────────────────────────────────
// Setup
// ─────────────────────────────────────────
function setupListeners() {
    // Toggle password visibility
    document.querySelectorAll('.acp-toggle').forEach(btn => {
        btn.addEventListener('click', function () {
            const targetId = this.dataset.target;
            const input    = document.getElementById(targetId);
            const icon     = this.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('bi-eye-slash', 'bi-eye');
            } else {
                input.type = 'password';
                icon.classList.replace('bi-eye', 'bi-eye-slash');
            }
        });
    });

    // Password strength
    acpNewPassword.addEventListener('input', () => {
        updateStrength(acpNewPassword.value);
        clearError('err_acpNewPassword');
    });

    acpConfirmPassword.addEventListener('input', () => clearError('err_acpConfirmPassword'));
    acpUserId.addEventListener('input', () => clearError('err_acpUserId'));

    // Form submit
    acpForm.addEventListener('submit', handleSubmit);
}

// ─────────────────────────────────────────
// Handle Submit
// ─────────────────────────────────────────
async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) return;

    const userId     = parseInt(acpUserId.value);
    const newPw      = acpNewPassword.value;
    const confirmPw  = acpConfirmPassword.value;

    // Loading state
    setLoading(true);
    acpAlert.style.display = 'none';

    try {
        const response = await fetch(ACP_API, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({
                UserId:          userId,
                NewPassword:     newPw,
                ConfirmPassword: confirmPw
            })
        });

        if (response.status === 401) {
            showAlert('error', '<i class="bi bi-exclamation-circle-fill"></i> Session expired. Please log in again.');
            setTimeout(() => window.location.href = '/', 2000);
            return;
        }

        const result = await response.json();

        if (result.status) {
            showAlert('success', `<i class="bi bi-check-circle-fill"></i> ${result.message || 'Password updated successfully!'}`);
            acpForm.reset();
            resetRequirements();
            acpStrengthFill.className   = 'acp-strength-fill';
            acpStrengthLabel.textContent = '';
            acpStrengthLabel.className   = 'acp-strength-label';
        } else {
            showAlert('error', `<i class="bi bi-exclamation-circle-fill"></i> ${result.message || 'Failed to update password.'}`);
        }

    } catch (error) {
        console.error('Change password error:', error);
        showAlert('error', '<i class="bi bi-exclamation-circle-fill"></i> Network error. Please try again.');
    } finally {
        setLoading(false);
    }
}

// ─────────────────────────────────────────
// Validation
// ─────────────────────────────────────────
function validateForm() {
    let valid = true;

    // User ID
    const uid = acpUserId.value.trim();
    if (!uid || isNaN(parseInt(uid)) || parseInt(uid) < 1) {
        showError('err_acpUserId', 'Please enter a valid User ID.');
        valid = false;
    }

    // New password
    const newPw = acpNewPassword.value;
    if (!newPw) {
        showError('err_acpNewPassword', 'New password is required.');
        valid = false;
    } else if (newPw.length < 8) {
        showError('err_acpNewPassword', 'Password must be at least 8 characters.');
        valid = false;
    }

    // Confirm password
    const confirmPw = acpConfirmPassword.value;
    if (!confirmPw) {
        showError('err_acpConfirmPassword', 'Please confirm the new password.');
        valid = false;
    } else if (newPw !== confirmPw) {
        showError('err_acpConfirmPassword', 'Passwords do not match.');
        valid = false;
    }

    return valid;
}

// ─────────────────────────────────────────
// Password Strength
// ─────────────────────────────────────────
function updateStrength(pw) {
    const reqs = {
        acp_req_length:  pw.length >= 8,
        acp_req_upper:   /[A-Z]/.test(pw),
        acp_req_lower:   /[a-z]/.test(pw),
        acp_req_digit:   /\d/.test(pw),
        acp_req_special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw)
    };

    let passed = 0;
    Object.entries(reqs).forEach(([id, ok]) => {
        const li = document.getElementById(id);
        if (!li) return;
        li.classList.toggle('acp-passed', ok);
        if (ok) passed++;
    });

    const levels = ['', 'acp-weak', 'acp-fair', 'acp-good', 'acp-strong', 'acp-strong'];
    const labels = ['', 'Weak',     'Fair',     'Good',     'Strong',     'Strong'];

    acpStrengthFill.className   = `acp-strength-fill ${pw ? levels[passed] : ''}`;
    acpStrengthLabel.className  = `acp-strength-label ${pw ? levels[passed] : ''}`;
    acpStrengthLabel.textContent = pw ? labels[passed] : '';
}

function resetRequirements() {
    ['acp_req_length','acp_req_upper','acp_req_lower','acp_req_digit','acp_req_special'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('acp-passed');
    });
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────
function showAlert(type, html) {
    acpAlert.innerHTML        = html;
    acpAlert.className        = `acp-alert acp-${type}`;
    acpAlert.style.display    = 'flex';
    acpAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
}

function clearError(id) {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
}

function setLoading(loading) {
    acpBtnText.style.display    = loading ? 'none'        : 'inline-flex';
    acpBtnSpinner.style.display = loading ? 'inline-flex' : 'none';
    acpSubmitBtn.disabled       = loading;
}