// frontend/static/js/job/list.js

const API_BASE_URL = 'http://127.0.0.1:8000/api/recommend-jobs';
let allJobs = [];

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

function toast(type, message, title) {
    toastr[type](message, title || '');
}

// ─────────────────────────────────────────
// Initialize
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    attachEventListeners();
    loadJobs();
});

function attachEventListeners() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadJobs();
            toast('info', 'Refreshing job listings...');
        });
    }
}

// ─────────────────────────────────────────
// Access Token Helper
// ─────────────────────────────────────────
function getAccessToken() {
    return localStorage.getItem('access_token'); // stored during login
}

// ─────────────────────────────────────────
// Load jobs from API
// ─────────────────────────────────────────
async function loadJobs(page = 1) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const jobContainer = document.getElementById('jobContainer');
    const emptyState = document.getElementById('emptyState');

    try {
        if (loadingSpinner) loadingSpinner.style.display = 'block';
        if (jobContainer) jobContainer.style.display = 'none';
        if (emptyState) emptyState.style.display = 'none';

        const token = getAccessToken();
        if (!token) {
            throw new Error('Access token not found. Please login.');
        }

        const response = await fetch(`${API_BASE_URL}/recommend/jobs?page=${page}`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        console.log('API Response:', result);

        if (loadingSpinner) loadingSpinner.style.display = 'none';

        // ✅ Check if result is array
        if (Array.isArray(result) && result.length > 0) {
            allJobs = result;
            renderJobs(allJobs);
            updateJobCount();
            toast('success', 'Jobs loaded successfully');
        } else {
            allJobs = [];
            showEmptyState();
            updateJobCount();
            toast('info', 'No jobs found');
        }

    } catch (error) {
        console.error('Error loading jobs:', error);
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        showEmptyState();
        toast('error', 'Failed to load jobs: ' + error.message);
    }
}


// ─────────────────────────────────────────
// Render jobs
// ─────────────────────────────────────────
function renderJobs(jobs) {
    const jobContainer = document.getElementById('jobContainer');
    const emptyState = document.getElementById('emptyState');

    if (!jobContainer) return;

    if (jobs.length === 0) {
        jobContainer.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    jobContainer.style.display = 'flex';
    if (emptyState) emptyState.style.display = 'none';
    jobContainer.innerHTML = '';

    jobs.forEach(job => {
        const jobItem = createJobItem(job);
        jobContainer.appendChild(jobItem);
    });
}

// ─────────────────────────────────────────
// Create job item element
// ─────────────────────────────────────────
function createJobItem(job) {
    const div = document.createElement('div');
    div.className = 'job-item';

    let tagsHTML = '';
    if (job.tags && job.tags.length > 0) {
        tagsHTML = job.tags.map(tag => `<span class="job-tag">${tag}</span>`).join('');
    }

    const viewBtnDisabled = !job.linkedin_job_url_cleaned ? 'disabled' : '';
    const companyLinkDisabled = !job.linkedin_company_url_cleaned ? 'disabled' : '';

    div.innerHTML = `
        <div class="job-header-row">
            <div class="job-info">
                <h3 class="job-title">${job.job_title || 'N/A'}</h3>
                <div class="company-name">
                    <i class="bi bi-building"></i>
                    ${job.company_name || 'N/A'}
                </div>
                ${tagsHTML ? `<div class="tag-list">${tagsHTML}</div>` : ''}
                <div class="job-meta">
                    <div class="job-meta-item">
                        <i class="bi bi-geo-alt-fill"></i>
                        <span>${job.job_location || 'Remote'}</span>
                    </div>
                    <div class="job-meta-item">
                        <i class="bi bi-clock-fill"></i>
                        <span>${job.posted_date || 'N/A'}</span>
                    </div>
                </div>
            </div>
            <div class="job-actions">
                <a href="${job.linkedin_job_url_cleaned || '#'}" 
                   target="_blank" 
                   class="btn btn-primary job-view-btn ${viewBtnDisabled}">
                    <i class="bi bi-box-arrow-up-right"></i>
                    View Job
                </a>
                <a href="${job.linkedin_company_url_cleaned || '#'}" 
                   target="_blank" 
                   class="job-company-link ${companyLinkDisabled}">
                    Company Website
                    <i class="bi bi-arrow-up-right"></i>
                </a>
            </div>
        </div>
    `;
    return div;
}

// ─────────────────────────────────────────
// Update job count
// ─────────────────────────────────────────
function updateJobCount() {
    const jobCount = document.getElementById('jobCount');
    if (jobCount) jobCount.textContent = allJobs.length;
}

// ─────────────────────────────────────────
// Show empty state
// ─────────────────────────────────────────
function showEmptyState() {
    const jobContainer = document.getElementById('jobContainer');
    const emptyState = document.getElementById('emptyState');

    if (jobContainer) jobContainer.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
}
