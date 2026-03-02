// frontend\static\js\email\email_inbox.js

const BASE_URL = window.APP_CONFIG.FRONTEND_BASE_URL || 'http://127.0.0.1:8000';
const API_BASE_URL = `${BASE_URL}/api/email`;
let allEmails = [];
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
// Toast helper
// ─────────────────────────────────────────
function toast(type, message, title) {
    toastr[type](message, title || '');
}

// ─────────────────────────────────────────
// Initialize on page load
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    loadUserFromLocalStorage();

    if (!currentUserId) {
        toast('error', 'Session expired. Please log in again.');
        setTimeout(() => window.location.href = '/', 2000);
        return;
    }

    attachEventListeners();
    loadEmails();
});

// ─────────────────────────────────────────
// Load user from localStorage
// ─────────────────────────────────────────
function loadUserFromLocalStorage() {
    currentUserId = localStorage.getItem('user_id');
    
    if (!currentUserId) {
        // Try to get from user_data
        const userData = localStorage.getItem('user_data');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                currentUserId = user.id || user.user_id || null;
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
    }
}

// ─────────────────────────────────────────
// Attach event listeners
// ─────────────────────────────────────────
function attachEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadEmails();
            toast('info', 'Refreshing inbox...');
        });
    }
}

// ─────────────────────────────────────────
// Load emails from API
// ─────────────────────────────────────────
async function loadEmails() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const emailList = document.getElementById('emailList');
    const emptyState = document.getElementById('emptyState');

    try {
        // Show loading
        if (loadingIndicator) loadingIndicator.style.display = 'block';
        if (emailList) emailList.style.display = 'none';
        if (emptyState) emptyState.style.display = 'none';

        // Fetch emails from API
        const response = await fetch(`${API_BASE_URL}/Inbox-emails?user_id=${currentUserId}`, {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('API Response:', result);

        // Hide loading
        if (loadingIndicator) loadingIndicator.style.display = 'none';

        if (result.status && result.data && result.data.length > 0) {
            allEmails = result.data;
            
            renderEmails(allEmails);
            updateEmailCount();
            
            // Show success message from backend
            toast('success', result.message || 'Emails loaded successfully');
        } else {
            allEmails = [];
            showEmptyState();
            updateEmailCount();
            
            // Show info message from backend
            toast('info', result.message || 'No emails found');
        }

    } catch (error) {
        console.error('Error loading emails:', error);
        
        // Hide loading
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        
        showEmptyState();
        toast('error', 'Failed to load emails: ' + error.message);
    }
}

// ─────────────────────────────────────────
// Render emails
// ─────────────────────────────────────────
function renderEmails(emails) {
    const emailList = document.getElementById('emailList');
    const emptyState = document.getElementById('emptyState');

    if (!emailList) return;

    if (emails.length === 0) {
        emailList.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    emailList.style.display = 'flex';
    if (emptyState) emptyState.style.display = 'none';

    emailList.innerHTML = '';

    emails.forEach(email => {
        const emailItem = createEmailItem(email);
        emailList.appendChild(emailItem);
    });
}

// ─────────────────────────────────────────
// Create email item element
// ─────────────────────────────────────────
function createEmailItem(email) {
    const div = document.createElement('div');
    div.className = 'email-item';
    div.onclick = () => viewEmailDetail(email);

    // Get sender initial
    const senderInitial = email.Sender ? email.Sender.charAt(0).toUpperCase() : '?';

    // Format date
    const emailDate = formatEmailDate(email.Date);

    // Get email preview (from Text or Html)
    let preview = '';
    if (email.Text) {
        preview = email.Text.substring(0, 150) + (email.Text.length > 150 ? '...' : '');
    } else if (email.Html) {
        // Strip HTML tags for preview
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = email.Html;
        preview = tempDiv.textContent.substring(0, 150) + '...';
    }

    div.innerHTML = `
        <div class="email-header-row">
            <div class="email-sender">
                <div class="sender-avatar">${senderInitial}</div>
                <div class="sender-info">
                    <div class="sender-name">${email.Sender || 'Unknown Sender'}</div>
                    <div class="sender-email">${email.Sender || ''}</div>
                </div>
            </div>
            <div class="email-date">${emailDate}</div>
        </div>
        <div class="email-subject">${email.Subject || '(No Subject)'}</div>
        <div class="email-preview">${preview || 'No content preview available'}</div>
    `;

    return div;
}

// ─────────────────────────────────────────
// Format email date
// ─────────────────────────────────────────
function formatEmailDate(dateString) {
    if (!dateString) return 'Unknown date';

    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    } catch (e) {
        return 'Invalid date';
    }
}

// ─────────────────────────────────────────
// View email detail in modal
// ─────────────────────────────────────────
function viewEmailDetail(email) {
    const modalContent = document.getElementById('emailDetailContent');
    if (!modalContent) return;

    const fullDate = email.Date ? new Date(email.Date).toLocaleString() : 'Unknown date';

    let bodyContent = '';
    if (email.Html) {
        bodyContent = `<iframe srcdoc="${email.Html.replace(/"/g, '&quot;')}" style="border:none; width:100%; min-height:400px;" sandbox="allow-same-origin"></iframe>`;
    } else if (email.Text) {
        bodyContent = `<pre>${email.Text}</pre>`;
    } else {
        bodyContent = '<p class="text-muted">No content available</p>';
    }

    modalContent.innerHTML = `
        <div class="email-detail-section">
            <div class="email-detail-label">
                <i class="bi bi-person-circle"></i> From
            </div>
            <div class="email-detail-value">${email.Sender || 'Unknown Sender'}</div>
        </div>

        <div class="email-detail-section">
            <div class="email-detail-label">
                <i class="bi bi-envelope"></i> Subject
            </div>
            <div class="email-detail-value">${email.Subject || '(No Subject)'}</div>
        </div>

        <div class="email-detail-section">
            <div class="email-detail-label">
                <i class="bi bi-calendar-event"></i> Date
            </div>
            <div class="email-detail-value">${fullDate}</div>
        </div>

        <div class="email-detail-section">
            <div class="email-detail-label">
                <i class="bi bi-chat-text"></i> Message
            </div>
            <div class="email-body-content">
                ${bodyContent}
            </div>
        </div>
    `;

    // Setup reply button
    const replyBtn = document.getElementById('replyBtn');
    if (replyBtn) {
        replyBtn.onclick = () => {
            // Store reply data and redirect to compose
            sessionStorage.setItem('composeEmailData', JSON.stringify({
                to: email.Sender,
                subject: 'Re: ' + (email.Subject || ''),
                body: '',
                inReplyTo: email.MessageId
            }));
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('emailDetailModal'));
            if (modal) modal.hide();
            
            // Redirect to compose
            window.location.href = '/email/compose-email';
        };
    }

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('emailDetailModal'));
    modal.show();
}

// ─────────────────────────────────────────
// Update email count
// ─────────────────────────────────────────
function updateEmailCount() {
    const emailCount = document.getElementById('emailCount');
    if (emailCount) {
        emailCount.textContent = allEmails.length;
    }
}

// ─────────────────────────────────────────
// Show empty state
// ─────────────────────────────────────────
function showEmptyState() {
    const emailList = document.getElementById('emailList');
    const emptyState = document.getElementById('emptyState');

    if (emailList) emailList.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
}