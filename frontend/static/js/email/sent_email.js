// frontend\static\js\email\sent_email.js

const API_SENT_EMAILS = 'http://127.0.0.1:8000/api/email/get/sent-emails';
let currentUserId = null;
let currentPage = 1;
let pageSize = 25;
let totalCount = 0;
let searchQuery = '';
let searchTimeout = null;

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
    loadSentEmails();
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
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }

    // Clear search button
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', clearSearch);
    }

    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshList);
    }

    // Page size selector
    const pageSizeSelect = document.getElementById('pageSizeSelect');
    if (pageSizeSelect) {
        pageSizeSelect.addEventListener('change', handlePageSizeChange);
    }

    // Pagination buttons
    const firstPageBtn = document.getElementById('firstPageBtn');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    const lastPageBtn = document.getElementById('lastPageBtn');

    if (firstPageBtn) firstPageBtn.addEventListener('click', () => goToPage(1));
    if (prevPageBtn) prevPageBtn.addEventListener('click', () => goToPage(currentPage - 1));
    if (nextPageBtn) nextPageBtn.addEventListener('click', () => goToPage(currentPage + 1));
    if (lastPageBtn) lastPageBtn.addEventListener('click', () => goToPage(getTotalPages()));
}

// ─────────────────────────────────────────
// Handle search input with debounce
// ─────────────────────────────────────────
function handleSearchInput() {
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    
    // Show/hide clear button
    if (clearSearchBtn) {
        clearSearchBtn.style.display = searchInput.value ? 'block' : 'none';
    }

    // Debounce search
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(() => {
        handleSearch();
    }, 500);
}

// ─────────────────────────────────────────
// Handle search
// ─────────────────────────────────────────
function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    searchQuery = searchInput.value.trim();
    currentPage = 1; // Reset to first page
    loadSentEmails();
}

// ─────────────────────────────────────────
// Clear search
// ─────────────────────────────────────────
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');

    if (searchInput) {
        searchInput.value = '';
    }
    if (clearSearchBtn) {
        clearSearchBtn.style.display = 'none';
    }

    searchQuery = '';
    currentPage = 1;
    loadSentEmails();
}

// ─────────────────────────────────────────
// Refresh list
// ─────────────────────────────────────────
function refreshList() {
    currentPage = 1;
    loadSentEmails();
    toast('success', 'Email list refreshed');
}

// ─────────────────────────────────────────
// Handle page size change
// ─────────────────────────────────────────
function handlePageSizeChange() {
    const pageSizeSelect = document.getElementById('pageSizeSelect');
    pageSize = parseInt(pageSizeSelect.value);
    currentPage = 1; // Reset to first page
    loadSentEmails();
}

// ─────────────────────────────────────────
// Load sent emails from API
// ─────────────────────────────────────────
async function loadSentEmails() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const emailList = document.getElementById('emailList');
    const noResults = document.getElementById('noResults');
    const paginationContainer = document.getElementById('paginationContainer');

    try {
        // Show loading
        if (loadingIndicator) loadingIndicator.style.display = 'block';
        if (emailList) emailList.style.display = 'none';
        if (noResults) noResults.style.display = 'none';
        if (paginationContainer) paginationContainer.style.display = 'none';

        // Calculate skip count
        const skipCount = (currentPage - 1) * pageSize;

        // Build API URL
        let apiUrl = `${API_SENT_EMAILS}?user_id=${currentUserId}&skipCount=${skipCount}&maxCount=${pageSize}`;
        
        if (searchQuery) {
            apiUrl += `&search=${encodeURIComponent(searchQuery)}`;
        }

        console.log('Fetching from:', apiUrl);

        // Fetch data
        const response = await fetch(apiUrl, {
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

        if (result.status && result.data && result.data.item && result.data.item.length > 0) {
            totalCount = result.data.totalCount;
            renderEmails(result.data.item);
            updateStats();
            updatePagination();
            
            if (emailList) emailList.style.display = 'flex';
            if (paginationContainer) paginationContainer.style.display = 'flex';
        } else {
            totalCount = 0;
            updateStats();
            if (noResults) noResults.style.display = 'block';
        }

    } catch (error) {
        console.error('Error loading emails:', error);
        
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
        
        toast('error', 'Failed to load emails: ' + error.message);
    }
}

// ─────────────────────────────────────────
// Render emails
// ─────────────────────────────────────────
function renderEmails(emails) {
    const emailList = document.getElementById('emailList');
    if (!emailList) return;

    // Clear current list
    emailList.innerHTML = '';

    // Create email cards
    emails.forEach(email => {
        const card = createEmailCard(email);
        emailList.appendChild(card);
    });
}

// ─────────────────────────────────────────
// Create email card element
// ─────────────────────────────────────────
function createEmailCard(email) {
    const card = document.createElement('div');
    card.className = 'email-card';
    card.onclick = () => viewEmailDetail(email);

    // Format date
    const sentDate = email.SentAt ? 
        new Date(email.SentAt).toLocaleString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'N/A';

    // Get recipients
    const recipients = email.ToEmail || [];
    const recipientCount = recipients.length;

    // Get preview of body (strip HTML and limit length)
    const bodyPreview = stripHtml(email.Body || '').substring(0, 150) + '...';

    card.innerHTML = `
        <div class="email-card-header">
            <h3 class="email-subject">${email.Subject || 'No Subject'}</h3>
            <span class="email-date">
                <i class="bi bi-clock"></i> ${sentDate}
            </span>
        </div>

        <div class="email-recipients">
            <i class="bi bi-send"></i>
            ${recipients.slice(0, 3).map(recipient => 
                `<span class="recipient-badge">${recipient}</span>`
            ).join('')}
            ${recipientCount > 3 ? `<span class="recipient-badge">+${recipientCount - 3} more</span>` : ''}
        </div>

        <p class="email-preview">${bodyPreview}</p>

        <div class="email-footer">
            <div class="email-meta">
                <span class="meta-badge">
                    <i class="bi bi-person-fill"></i>
                    ${recipientCount} recipient${recipientCount !== 1 ? 's' : ''}
                </span>
                ${email.ThreadId ? `
                    <span class="meta-badge">
                        <i class="bi bi-chat-dots"></i>
                        Thread
                    </span>
                ` : ''}
            </div>
            <span class="status-badge">
                <i class="bi bi-check-circle"></i>
                ${email.Status || 'Sent'}
            </span>
        </div>
    `;

    return card;
}

// ─────────────────────────────────────────
// Strip HTML tags
// ─────────────────────────────────────────
function stripHtml(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
}

// ─────────────────────────────────────────
// View email detail
// ─────────────────────────────────────────
function viewEmailDetail(email) {
    const modalContent = document.getElementById('emailDetailContent');
    if (!modalContent) return;

    // Format date
    const sentDate = email.SentAt ? 
        new Date(email.SentAt).toLocaleString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'N/A';

    const recipients = email.ToEmail || [];
    const fromEmails = email.FromEmail || [];

    modalContent.innerHTML = `
        <div class="email-detail-view">
            <div class="detail-section">
                <div class="detail-label">
                    <i class="bi bi-envelope-fill"></i> Subject
                </div>
                <div class="detail-content">
                    <strong>${email.Subject || 'No Subject'}</strong>
                </div>
            </div>

            <div class="detail-section">
                <div class="detail-label">
                    <i class="bi bi-person-fill"></i> From
                </div>
                <div class="detail-content">
                    ${fromEmails.join(', ') || 'N/A'}
                </div>
            </div>

            <div class="detail-section">
                <div class="detail-label">
                    <i class="bi bi-send"></i> To
                </div>
                <div class="detail-content">
                    ${recipients.join(', ') || 'N/A'}
                </div>
            </div>

            <div class="detail-section">
                <div class="detail-label">
                    <i class="bi bi-clock"></i> Sent At
                </div>
                <div class="detail-content">
                    ${sentDate}
                </div>
            </div>

            ${email.ThreadId ? `
                <div class="detail-section">
                    <div class="detail-label">
                        <i class="bi bi-chat-dots"></i> Thread ID
                    </div>
                    <div class="detail-content">
                        <code>${email.ThreadId}</code>
                    </div>
                </div>
            ` : ''}

            ${email.MessageId ? `
                <div class="detail-section">
                    <div class="detail-label">
                        <i class="bi bi-hash"></i> Message ID
                    </div>
                    <div class="detail-content">
                        <code>${email.MessageId}</code>
                    </div>
                </div>
            ` : ''}

            <div class="detail-section">
                <div class="detail-label">
                    <i class="bi bi-file-text"></i> Message Content
                </div>
                <div class="email-body-content">
                    ${email.Body || 'No content'}
                </div>
            </div>
        </div>
    `;

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('emailDetailModal'));
    modal.show();
}

// ─────────────────────────────────────────
// Update statistics
// ─────────────────────────────────────────
function updateStats() {
    const totalCountEl = document.getElementById('totalCount');
    const displayCountEl = document.getElementById('displayCount');
    const filterStatusEl = document.getElementById('filterStatus');

    if (totalCountEl) {
        totalCountEl.textContent = totalCount;
    }

    const currentDisplayCount = Math.min(pageSize, totalCount - ((currentPage - 1) * pageSize));
    if (displayCountEl) {
        displayCountEl.textContent = Math.max(0, currentDisplayCount);
    }

    if (filterStatusEl) {
        if (searchQuery) {
            filterStatusEl.textContent = `Search: "${searchQuery}"`;
        } else {
            filterStatusEl.textContent = 'No filters applied';
        }
    }
}

// ─────────────────────────────────────────
// Update pagination
// ─────────────────────────────────────────
function updatePagination() {
    const totalPages = getTotalPages();
    
    // Update pagination info
    const showingFrom = ((currentPage - 1) * pageSize) + 1;
    const showingTo = Math.min(currentPage * pageSize, totalCount);
    
    document.getElementById('showingFrom').textContent = showingFrom;
    document.getElementById('showingTo').textContent = showingTo;
    document.getElementById('totalEmails').textContent = totalCount;

    // Update button states
    const firstPageBtn = document.getElementById('firstPageBtn');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    const lastPageBtn = document.getElementById('lastPageBtn');

    if (firstPageBtn) firstPageBtn.disabled = currentPage === 1;
    if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
    if (nextPageBtn) nextPageBtn.disabled = currentPage >= totalPages;
    if (lastPageBtn) lastPageBtn.disabled = currentPage >= totalPages;

    // Render page numbers
    renderPageNumbers(totalPages);
}

// ─────────────────────────────────────────
// Render page numbers
// ─────────────────────────────────────────
function renderPageNumbers(totalPages) {
    const pageNumbersContainer = document.getElementById('pageNumbers');
    if (!pageNumbersContainer) return;

    pageNumbersContainer.innerHTML = '';

    // Show max 5 page numbers
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    // Adjust if we're near the end
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('span');
        pageBtn.className = 'page-number' + (i === currentPage ? ' active' : '');
        pageBtn.textContent = i;
        pageBtn.onclick = () => goToPage(i);
        pageNumbersContainer.appendChild(pageBtn);
    }
}

// ─────────────────────────────────────────
// Get total pages
// ─────────────────────────────────────────
function getTotalPages() {
    return Math.ceil(totalCount / pageSize);
}

// ─────────────────────────────────────────
// Go to page
// ─────────────────────────────────────────
function goToPage(page) {
    const totalPages = getTotalPages();
    
    if (page < 1 || page > totalPages) {
        return;
    }

    currentPage = page;
    loadSentEmails();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}