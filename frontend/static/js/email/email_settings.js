// frontend\static\js\email\email_settings.js

const BASE_URL = window.APP_CONFIG.FRONTEND_BASE_URL || 'http://127.0.0.1:8000';
const API_BASE_URL  = `${BASE_URL}/api/email-settings/settings`;
let currentUserId   = null;
let currentSettingsId = null;
let isUpdateMode    = false;

// ─────────────────────────────────────────
// DOM refs
// ─────────────────────────────────────────
const loadingState       = document.getElementById('loadingState');
const noSettingsState    = document.getElementById('noSettingsState');
const settingsDisplayState = document.getElementById('settingsDisplayState');
const settingsFormState  = document.getElementById('settingsFormState');
const createSettingsBtn  = document.getElementById('createSettingsBtn');
const updateSettingsBtn  = document.getElementById('updateSettingsBtn');
const deleteSettingsBtn  = document.getElementById('deleteSettingsBtn');
const cancelFormBtn      = document.getElementById('cancelFormBtn');
const cancelBtn          = document.getElementById('cancelBtn');
const settingsForm       = document.getElementById('settingsForm');
const formTitle          = document.getElementById('formTitle');
const togglePassword     = document.getElementById('togglePassword');

// ─────────────────────────────────────────
// Toastr global config
// ─────────────────────────────────────────
toastr.options = {
    closeButton:       true,
    progressBar:       true,
    positionClass:     'toast-top-right',
    timeOut:           3500,
    extendedTimeOut:   1000,
    showEasing:        'swing',
    hideEasing:        'linear',
    showMethod:        'fadeIn',
    hideMethod:        'fadeOut',
    preventDuplicates: true,
    newestOnTop:       true,
};

// ─────────────────────────────────────────
// Toast helpers
// ─────────────────────────────────────────
function toast(type, message, title) {
    toastr[type](message, title || '');
}

function toastFromResponse(result, fallbackSuccess, fallbackError) {
    const msg  = result?.message || (result?.status ? fallbackSuccess : fallbackError);
    const type = result?.status  ? 'success' : 'error';
    toast(type, msg);
}

// ─────────────────────────────────────────
// Init
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    loadUserFromLocalStorage();

    if (!currentUserId) {
        toast('error', 'Session expired. Please log in again.');
        setTimeout(() => window.location.href = '/', 2000);
        return;
    }

    await loadUserSettings();
    setupEventListeners();
    setupFormValidation();
});

// ─────────────────────────────────────────
// 1. Read user from localStorage
// ─────────────────────────────────────────
function loadUserFromLocalStorage() {
    currentUserId = localStorage.getItem('user_id');
}

// ─────────────────────────────────────────
// 2. Auth headers
// ─────────────────────────────────────────
function authHeaders() {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

// ─────────────────────────────────────────
// 3. Event listeners
// ─────────────────────────────────────────
function setupEventListeners() {
    createSettingsBtn.addEventListener('click',  () => showForm(false));
    updateSettingsBtn.addEventListener('click',  () => showForm(true));
    deleteSettingsBtn.addEventListener('click',  handleDelete);
    cancelFormBtn.addEventListener('click',      hideForm);
    cancelBtn.addEventListener('click',          hideForm);
    settingsForm.addEventListener('submit',      handleSubmit);

    // Password toggle
    if (togglePassword) {
        togglePassword.addEventListener('click', togglePasswordVisibility);
    }
}

// ─────────────────────────────────────────
// 4. Password toggle
//    bi-eye-slash = password hidden  (click to reveal)
//    bi-eye       = password visible (click to hide)
// ─────────────────────────────────────────
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const icon = togglePassword.querySelector('i');

    if (passwordInput.type === 'password') {
        // Reveal password — show plain eye (visible)
        passwordInput.type = 'text';
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
    } else {
        // Hide password — show slashed eye (hidden)
        passwordInput.type = 'password';
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
    }
}

// ─────────────────────────────────────────
// 5. Load settings
//    GET /api/email-settings/settings/by-user?user_id=X
// ─────────────────────────────────────────
async function loadUserSettings() {
    showState('loading');

    try {
        const response = await fetch(
            `${API_BASE_URL}/by-user?user_id=${currentUserId}`,
            { headers: authHeaders() }
        );

        if (response.status === 401) {
            toast('error', 'Session expired. Please log in again.');
            setTimeout(() => window.location.href = '/', 2000);
            return;
        }

        const result = await response.json();

        if (result.status && result.data) {
            currentSettingsId = result.data.Id;
            displaySettings(result.data);
            showState('display');
        } else {
            // No settings found - normal case
            showState('noSettings');
        }

    } catch (error) {
        console.error('Error loading settings:', error);
        toast('error', 'Failed to load email settings. Please refresh the page.');
        showState('noSettings');
    }
}

// ─────────────────────────────────────────
// 6. Display helpers
// ─────────────────────────────────────────
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || 'N/A';
}

// ─────────────────────────────────────────
// 7. Render settings into display view
// ─────────────────────────────────────────
function displaySettings(settings) {
    setText('displayEmailAddress', settings.EmailAddress);
    setText('displayEmailFull',    settings.EmailAddress);
    setText('displaySmtpServer',   settings.SmtpServer || 'smtp.gmail.com');
    setText('displaySmtpPort',     settings.SmtpPort || '587');

    // Password status
    const passwordStatus = document.getElementById('displayPasswordStatus');
    if (passwordStatus && settings.Password) {
        passwordStatus.innerHTML = '<i class="bi bi-check-circle"></i> Configured';
        passwordStatus.className = 'badge-success';
    }
}

// ─────────────────────────────────────────
// 8. Form visibility
// ─────────────────────────────────────────
function showForm(updateMode) {
    isUpdateMode          = updateMode;
    formTitle.textContent = updateMode ? 'Update Email Settings' : 'Setup Email Settings';

    if (updateMode) {
        populateFormWithSettings();
    } else {
        settingsForm.reset();
        // Set default values
        document.getElementById('smtpServer').value = 'smtp.gmail.com';
        document.getElementById('smtpPort').value = '587';
        clearValidation();
    }

    // Reset password field visibility and icon when opening form
    const passwordInput = document.getElementById('password');
    const icon = togglePassword ? togglePassword.querySelector('i') : null;
    if (passwordInput) passwordInput.type = 'password';
    if (icon) {
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
    }

    showState('form');
    window.scrollTo(0, 0);
}

function hideForm() {
    showState(currentSettingsId ? 'display' : 'noSettings');
}

// ─────────────────────────────────────────
// 9. Populate form for update
//    GET /api/email-settings/settings/by-id?id=X
// ─────────────────────────────────────────
async function populateFormWithSettings() {
    if (!currentSettingsId) return;

    try {
        const response = await fetch(
            `${API_BASE_URL}/by-id?id=${currentSettingsId}`,
            { headers: authHeaders() }
        );
        const result = await response.json();

        if (!result.status || !result.data) {
            toast('error', result.message || 'Failed to load settings for editing.');
            return;
        }

        const s = result.data;

        document.getElementById('emailAddress').value = s.EmailAddress || '';
        document.getElementById('password').value = s.Password || '';
        document.getElementById('smtpServer').value = s.SmtpServer || 'smtp.gmail.com';
        document.getElementById('smtpPort').value = s.SmtpPort || 587;

    } catch (error) {
        console.error('Error populating form:', error);
        toast('error', 'Network error. Could not load settings data.');
    }
}

// ─────────────────────────────────────────
// 10. Submit — create or update
//     POST /api/email-settings/settings/create
//     PUT  /api/email-settings/settings/update
// ─────────────────────────────────────────
async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData(settingsForm);
    const data     = {
        UserId: Number(currentUserId)
    };

    for (const [key, value] of formData.entries()) {
        data[key] = value.trim() !== '' ? value.trim() : null;
    }

    try {
        let response;

        if (isUpdateMode) {
            // PUT /api/email-settings/settings/update
            response = await fetch(
                `${API_BASE_URL}/update`,
                { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }
            );
        } else {
            // POST /api/email-settings/settings/create
            response = await fetch(
                `${API_BASE_URL}/create`,
                { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }
            );
        }

        const result = await response.json();
        toastFromResponse(result, 'Email settings saved successfully!', 'Failed to save settings.');

        if (result.status) {
            await loadUserSettings();
        }

    } catch (error) {
        console.error('Submit error:', error);
        toast('error', 'Network error. Please try again.');
    }
}

// ─────────────────────────────────────────
// 11. Delete
//     DELETE /api/email-settings/settings/delete?id=X
// ─────────────────────────────────────────
async function handleDelete() {
    const confirm = await Swal.fire({
        title:              'Delete Email Settings?',
        text:               'This action cannot be undone.',
        icon:               'warning',
        showCancelButton:   true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor:  '#6c757d',
        confirmButtonText:  'Yes, delete it!',
        cancelButtonText:   'Cancel'
    });

    if (!confirm.isConfirmed) return;

    try {
        const response = await fetch(
            `${API_BASE_URL}/delete?id=${currentSettingsId}`,
            { method: 'DELETE', headers: authHeaders() }
        );

        const result = await response.json();
        toastFromResponse(result, 'Email settings deleted successfully!', 'Failed to delete settings.');

        if (result.status) {
            currentSettingsId = null;
            showState('noSettings');
        }

    } catch (error) {
        console.error('Delete error:', error);
        toast('error', 'Network error. Could not delete settings.');
    }
}

// ─────────────────────────────────────────
// 12. State machine
// ─────────────────────────────────────────
function showState(state) {
    [loadingState, noSettingsState, settingsDisplayState, settingsFormState]
        .forEach(el => { if (el) el.style.display = 'none'; });

    const map = {
        loading:    loadingState,
        noSettings: noSettingsState,
        display:    settingsDisplayState,
        form:       settingsFormState
    };

    if (map[state]) map[state].style.display = 'block';
}

// ─────────────────────────────────────────
// 14. Validation
// ─────────────────────────────────────────
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function clearValidation() {
    document.querySelectorAll('#settingsForm .is-invalid')
            .forEach(el => el.classList.remove('is-invalid'));
}

function validateForm() {
    clearValidation();
    let isValid = true;

    // Email validation
    const emailEl = document.getElementById('emailAddress');
    if (!emailEl.value.trim() || !validateEmail(emailEl.value.trim())) {
        emailEl.classList.add('is-invalid');
        isValid = false;
    }

    // Password validation
    const passwordEl = document.getElementById('password');
    if (!passwordEl.value.trim()) {
        passwordEl.classList.add('is-invalid');
        isValid = false;
    }

    if (!isValid) {
        toast('warning', 'Please fill in all required fields correctly.');
        const first = document.querySelector('#settingsForm .is-invalid');
        if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return isValid;
}

function setupFormValidation() {
    document.querySelectorAll('#settingsForm .form-control').forEach(el => {
        el.addEventListener('input',  () => el.classList.remove('is-invalid'));
        el.addEventListener('change', () => el.classList.remove('is-invalid'));
    });
}