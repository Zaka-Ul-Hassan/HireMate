// frontend\static\js\email\compose_email.js

const API_SEND_EMAIL = 'http://127.0.0.1:8000/api/email/client';
let currentUserId = null;

// ─────────────────────────────────────────
// Toastr global config
// ─────────────────────────────────────────
toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: 'toast-top-right',
    timeOut: 3500,
    extendedTimeOut: 1000,
    showEasing: 'swing',
    hideEasing: 'linear',
    showMethod: 'fadeIn',
    hideMethod: 'fadeOut',
    preventDuplicates: true,
    newestOnTop: true,
};

// ─────────────────────────────────────────
// Toast helpers
// ─────────────────────────────────────────
function toast(type, message, title) {
    toastr[type](message, title || '');
}

// ─────────────────────────────────────────
// DOM refs
// ─────────────────────────────────────────
const toInput = document.getElementById('to');
const toError = document.getElementById('email_error');
const subjectInput = document.getElementById('subject');
const bodyInput = document.getElementById('body');
const subjectError = document.getElementById("subject_error");
const bodyError = document.getElementById("body_error");
const form = document.getElementById('composeForm');
const sendBtn = document.getElementById('sendBtn');
const discardBtn = document.getElementById('discardBtn');
const charCount = document.getElementById('charCount');

// ─────────────────────────────────────────
// Email regex validation
// ─────────────────────────────────────────
const emailRegex = /^(([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?))$/;

// ─────────────────────────────────────────
// Init
// ─────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
    loadUserFromLocalStorage();

    if (!currentUserId) {
        toast('error', 'Session expired. Please log in again.');
        setTimeout(() => window.location.href = '/', 2000);
        return;
    }

    setupEventListeners();
    updateCharacterCount();
});

// ─────────────────────────────────────────
// Load user from localStorage
// ─────────────────────────────────────────
function loadUserFromLocalStorage() {
    currentUserId = localStorage.getItem('user_id');
}

// ─────────────────────────────────────────
// Setup event listeners
// ─────────────────────────────────────────
function setupEventListeners() {
    // Real-time email validation
    toInput.addEventListener('input', validateEmailField);
    
    // Real-time subject validation
    subjectInput.addEventListener('input', validateSubjectField);
    
    // Real-time body validation
    bodyInput.addEventListener('input', function() {
        validateBodyField();
        updateCharacterCount();
    });

    // Form submit
    form.addEventListener("submit", handleSubmit);

    // Discard button
    discardBtn.addEventListener('click', handleDiscard);

    // Remove invalid class on focus
    [toInput, subjectInput, bodyInput].forEach(input => {
        input.addEventListener('focus', function() {
            this.classList.remove('is-invalid');
        });
    });
}

// ─────────────────────────────────────────
// Character count update
// ─────────────────────────────────────────
function updateCharacterCount() {
    const count = bodyInput.value.length;
    charCount.textContent = count.toLocaleString();
}

// ─────────────────────────────────────────
// Validation functions
// ─────────────────────────────────────────
function validateEmailField() {
    const emails = toInput.value.split(/[,;]+/).map(e => e.trim()).filter(e => e);
    
    if (!emails.length) {
        toInput.classList.add('is-invalid');
        toError.textContent = 'At least one email address is required.';
        return false;
    }
    
    const allValid = emails.every(email => emailRegex.test(email));
    
    if (!allValid) {
        toInput.classList.add('is-invalid');
        toError.textContent = 'One or more email addresses are invalid. Separate them with commas or semicolons.';
        return false;
    }
    
    toInput.classList.remove('is-invalid');
    toError.textContent = '';
    return true;
}

function validateSubjectField() {
    const subject = subjectInput.value.trim();
    
    if (!subject) {
        subjectInput.classList.add('is-invalid');
        subjectError.textContent = "Subject is required.";
        return false;
    }
    
    subjectInput.classList.remove('is-invalid');
    subjectError.textContent = "";
    return true;
}

function validateBodyField() {
    const body = bodyInput.value.trim();
    
    if (!body) {
        bodyInput.classList.add('is-invalid');
        bodyError.textContent = "Message body is required.";
        return false;
    }
    
    bodyInput.classList.remove('is-invalid');
    bodyError.textContent = "";
    return true;
}

function validateForm() {
    const emailValid = validateEmailField();
    const subjectValid = validateSubjectField();
    const bodyValid = validateBodyField();
    
    return emailValid && subjectValid && bodyValid;
}

// ─────────────────────────────────────────
// Handle form submit
// ─────────────────────────────────────────
async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
        toast('warning', 'Please fill in all required fields correctly.');
        // Scroll to first invalid field
        const firstInvalid = form.querySelector('.is-invalid');
        if (firstInvalid) {
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstInvalid.focus();
        }
        return;
    }

    // Get and parse email addresses
    const toEmails = toInput.value
        .split(/[,;]+/)
        .map(e => e.trim())
        .filter(e => e);
    
    const subject = subjectInput.value.trim();
    const body = bodyInput.value.trim();

    // Disable button and show loading state
    sendBtn.disabled = true;
    sendBtn.classList.add('loading');
    const originalBtnContent = sendBtn.innerHTML;
    sendBtn.innerHTML = '<i class="bi bi-hourglass-split"></i><span>Sending...</span>';

    // Prepare payload according to API spec
    const payload = {
        Recipient: toEmails,
        Subject: subject,
        Body: body,
        UserId: Number(currentUserId),
        ParentMessageId: ""  // Empty for new emails
    };

    try {
        const response = await fetch(API_SEND_EMAIL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        // Reset button state
        sendBtn.disabled = false;
        sendBtn.classList.remove('loading');
        sendBtn.innerHTML = originalBtnContent;

        // Handle response based on status
        if (result.status === true) {
            // Success - show only toaster notification with backend message
            toast('success', result.message || 'Email sent successfully!');
            
            // Clear form
            form.reset();
            updateCharacterCount();
            
        } else if (result.status === false) {
            // Error from backend - show only toaster notification with backend message
            toast('error', result.message || 'Failed to send email.');
            
        } else {
            // Unexpected response format
            toast('error', 'Unexpected response from server.');
            console.error('Unexpected response:', result);
        }

    } catch (error) {
        console.error('Send email error:', error);
        
        // Reset button state
        sendBtn.disabled = false;
        sendBtn.classList.remove('loading');
        sendBtn.innerHTML = originalBtnContent;

        toast('error', 'Network error. Please check your connection and try again.');
    }
}

// ─────────────────────────────────────────
// Handle discard
// ─────────────────────────────────────────
async function handleDiscard() {
    // Check if form has content
    const hasContent = toInput.value.trim() || 
                      subjectInput.value.trim() || 
                      bodyInput.value.trim();

    if (!hasContent) {
        form.reset();
        updateCharacterCount();
        toast('info', 'Draft discarded.');
        return;
    }

    // Confirm discard
    const result = await Swal.fire({
        title: 'Discard Draft?',
        text: 'Your unsaved email will be lost.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Discard',
        cancelButtonText: 'Keep Editing'
    });

    if (result.isConfirmed) {
        form.reset();
        updateCharacterCount();
        
        // Clear all validation states
        [toInput, subjectInput, bodyInput].forEach(input => {
            input.classList.remove('is-invalid');
        });
        [toError, subjectError, bodyError].forEach(error => {
            error.textContent = '';
        });

        toast('info', 'Draft discarded.');
    }
}

// ─────────────────────────────────────────
// Warn user before leaving with unsaved changes
// ─────────────────────────────────────────
window.addEventListener('beforeunload', function(e) {
    const hasContent = toInput.value.trim() || 
                      subjectInput.value.trim() || 
                      bodyInput.value.trim();
    
    if (hasContent) {
        e.preventDefault();
        e.returnValue = '';
        return '';
    }
});