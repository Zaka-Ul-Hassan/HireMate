// frontend/static/js/job/list.js

const BASE_URL = window.APP_CONFIG.FRONTEND_BASE_URL || 'http://127.0.0.1:8000';
const API_BASE_URL = `${BASE_URL}/api/recommend-jobs`;

let allJobs = [];
let currentTab = 'all'; // 'all' | 'saved'

// ─────────────────────────────────────────
// Toastr global config
// ─────────────────────────────────────────
toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: 'toast-top-right',
    timeOut: 3000,
    extendedTimeOut: 800,
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
// Saved-jobs localStorage helpers
// ─────────────────────────────────────────
function getSavedKey() {
    const userId = localStorage.getItem('user_id') || 'default';
    return `saved_jobs_${userId}`;
}

function getSavedJobs() {
    try {
        const raw = localStorage.getItem(getSavedKey());
        return raw ? JSON.parse(raw) : {};
    } catch (_) {
        return {};
    }
}

function saveJob(job) {
    const saved = getSavedJobs();
    const id = jobId(job);
    saved[id] = job;
    localStorage.setItem(getSavedKey(), JSON.stringify(saved));
}

function unsaveJob(job) {
    const saved = getSavedJobs();
    delete saved[jobId(job)];
    localStorage.setItem(getSavedKey(), JSON.stringify(saved));
}

function isJobSaved(job) {
    return !!getSavedJobs()[jobId(job)];
}

// Build a stable ID from job data (URL or title+company)
function jobId(job) {
    return job.linkedin_job_url_cleaned || `${job.job_title}__${job.company_name}`;
}

// ─────────────────────────────────────────
// Badge helpers
// ─────────────────────────────────────────
function updateSavedBadges() {
    const count = Object.keys(getSavedJobs()).length;
    ['savedBadge', 'tabBadge', 'savedCount'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = count;
    });
}

// ─────────────────────────────────────────
// Initialize
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    attachEventListeners();
    updateSavedBadges();
    loadJobs();
});

function attachEventListeners() {
    // Refresh
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadJobs();
            toast('info', 'Refreshing job listings…');
        });
    }

    const emptyRefreshBtn = document.getElementById('emptyRefreshBtn');
    if (emptyRefreshBtn) {
        emptyRefreshBtn.addEventListener('click', () => loadJobs());
    }

    // Tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentTab = tab.dataset.tab;
            renderCurrentTab();
        });
    });

    // Header saved pill → switch to saved tab
    const savedPill = document.getElementById('savedPill');
    if (savedPill) {
        savedPill.addEventListener('click', () => {
            document.getElementById('tabSaved')?.click();
        });
    }

    // Button in action bar → switch to saved tab
    const showSavedBtn = document.getElementById('showSavedBtn');
    if (showSavedBtn) {
        showSavedBtn.addEventListener('click', () => {
            document.getElementById('tabSaved')?.click();
        });
    }
}

// ─────────────────────────────────────────
// Access Token
// ─────────────────────────────────────────
function getAccessToken() {
    return localStorage.getItem('access_token');
}

// ─────────────────────────────────────────
// Load jobs
// ─────────────────────────────────────────
async function loadJobs(page = 1) {
    const spinner = document.getElementById('loadingSpinner');
    const container = document.getElementById('jobContainer');
    const emptyState = document.getElementById('emptyState');
    const emptySaved = document.getElementById('emptySavedState');

    try {
        if (spinner) spinner.style.display = 'block';
        if (container) container.style.display = 'none';
        if (emptyState) emptyState.style.display = 'none';
        if (emptySaved) emptySaved.style.display = 'none';

        const token = getAccessToken();
        if (!token) throw new Error('Access token not found. Please login.');

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

        if (spinner) spinner.style.display = 'none';

        if (result && result.status === false) {
            allJobs = [];
            updateJobCount(0);
            setEmptyStateMessage(result.message || 'No jobs found');
            renderCurrentTab();
            toast('info', result.message || 'No jobs found');
        } else {
            const jobs = Array.isArray(result)
                ? result
                : (result && Array.isArray(result.data) ? result.data : []);

            if (jobs.length > 0) {
                allJobs = jobs;
                updateJobCount(allJobs.length);
                renderCurrentTab();
                toast('success', `${allJobs.length} jobs loaded`);
            } else {
                allJobs = [];
                updateJobCount(0);
                setEmptyStateMessage('No jobs found');
                renderCurrentTab();
                toast('info', 'No jobs found');
            }
        }

    } catch (error) {
        console.error('Error loading jobs:', error);
        if (spinner) spinner.style.display = 'none';
        updateJobCount(0);
        showEmptyState();
        toast('error', 'Failed to load jobs: ' + error.message);
    }
}

// ─────────────────────────────────────────
// Render based on current tab
// ─────────────────────────────────────────
function renderCurrentTab() {
    const sectionTitle = document.getElementById('sectionTitle');

    if (currentTab === 'saved') {
        if (sectionTitle) sectionTitle.innerHTML = `<i class="bi bi-heart-fill"></i> Saved Jobs`;
        const savedMap = getSavedJobs();
        const savedList = Object.values(savedMap);
        if (savedList.length === 0) {
            showEmptySavedState();
        } else {
            renderJobs(savedList);
        }
    } else {
        if (sectionTitle) sectionTitle.innerHTML = `<i class="bi bi-list-check"></i> Available Positions`;
        if (allJobs.length === 0) {
            showEmptyState();
        } else {
            renderJobs(allJobs);
        }
    }
}

// ─────────────────────────────────────────
// Render jobs
// ─────────────────────────────────────────
function renderJobs(jobs) {
    const container = document.getElementById('jobContainer');
    const emptyState = document.getElementById('emptyState');
    const emptySaved = document.getElementById('emptySavedState');

    if (!container) return;

    if (emptyState) emptyState.style.display = 'none';
    if (emptySaved) emptySaved.style.display = 'none';

    if (jobs.length === 0) {
        container.style.display = 'none';
        if (currentTab === 'saved') {
            if (emptySaved) emptySaved.style.display = 'block';
        } else {
            if (emptyState) emptyState.style.display = 'block';
        }
        return;
    }

    container.style.display = 'flex';
    container.innerHTML = '';

    jobs.forEach(job => {
        container.appendChild(createJobItem(job));
    });
}

// ─────────────────────────────────────────
// Create job item
// ─────────────────────────────────────────
function createJobItem(job) {
    const div = document.createElement('div');
    const saved = isJobSaved(job);
    div.className = `job-item${saved ? ' is-saved' : ''}`;
    div.dataset.jobId = jobId(job);

    // ── Company initials ──
    const initials = (job.company_name || '?')
        .split(' ')
        .slice(0, 2)
        .map(w => w[0] || '')
        .join('')
        .toUpperCase();

    // ── Tags ──
    let tagsHTML = '';
    if (job.tags && job.tags.length > 0) {
        tagsHTML = job.tags.map(tag => {
            let cls = 'job-tag';
            if (/intern/i.test(tag)) cls += ' tag-internship';
            if (/remote/i.test(tag)) cls += ' tag-remote';
            return `<span class="${cls}">${tag}</span>`;
        }).join('');
    }

    const viewDisabled = !job.linkedin_job_url_cleaned ? 'disabled' : '';
    const compDisabled = !job.linkedin_company_url_cleaned ? 'disabled' : '';
    const heartClass = saved ? ' active' : '';
    const heartTitle = saved ? 'Remove from saved' : 'Save this job';
    const postedDate = job.posted_date || 'Date N/A';
    const location = job.job_location || 'Remote';

    div.innerHTML = `
        <div class="saved-ribbon"><i class="bi bi-heart-fill"></i> Saved</div>

        <div class="job-header-row">
            <div class="company-logo">${initials}</div>

            <div class="job-info">
                <div class="job-title-row">
                    <h3 class="job-title">${job.job_title || 'N/A'}</h3>
                    <button class="heart-btn${heartClass}"
                            title="${heartTitle}"
                            aria-label="${heartTitle}"
                            data-job-id="${jobId(job)}">
                        <i class="bi bi-heart${saved ? '-fill' : ''}"></i>
                        <div class="burst"></div>
                    </button>
                </div>

                <div class="company-name">
                    <i class="bi bi-building"></i>
                    ${job.company_name || 'N/A'}
                </div>

                ${tagsHTML ? `<div class="tag-list">${tagsHTML}</div>` : ''}

                <div class="job-meta">
                    <div class="job-meta-item">
                        <i class="bi bi-geo-alt-fill"></i>
                        <span>${location}</span>
                    </div>
                    <div class="job-meta-item">
                        <i class="bi bi-clock-fill"></i>
                        <span>${postedDate}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="job-footer">
            <a href="${job.linkedin_job_url_cleaned || '#'}"
               target="_blank" rel="noopener"
               class="job-view-btn ${viewDisabled}">
                <i class="bi bi-box-arrow-up-right"></i>
                View Job
            </a>
            <div class="footer-right">
                <a href="${job.linkedin_company_url_cleaned || '#'}"
                   target="_blank" rel="noopener"
                   class="job-company-link ${compDisabled}">
                    <i class="bi bi-globe2"></i>
                    Company Website
                </a>
            </div>
        </div>
    `;

    // Heart click handler
    const heartBtn = div.querySelector('.heart-btn');
    heartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSave(job, heartBtn, div);
    });

    return div;
}

// ─────────────────────────────────────────
// Toggle save
// ─────────────────────────────────────────
function toggleSave(job, btn, itemEl) {
    const wasSaved = isJobSaved(job);

    if (wasSaved) {
        unsaveJob(job);
        btn.classList.remove('active');
        btn.querySelector('i').className = 'bi bi-heart';
        btn.title = 'Save this job';
        btn.setAttribute('aria-label', 'Save this job');
        itemEl.classList.remove('is-saved');

        // If on saved tab, remove card with animation
        if (currentTab === 'saved') {
            itemEl.style.transition = 'opacity .25s, transform .25s';
            itemEl.style.opacity = '0';
            itemEl.style.transform = 'translateX(-12px)';
            setTimeout(() => {
                itemEl.remove();
                // If no more saved items, show empty state
                const container = document.getElementById('jobContainer');
                if (container && container.children.length === 0) {
                    showEmptySavedState();
                }
            }, 260);
        }

        toast('info', `Removed "${job.job_title}" from saved`);
    } else {
        saveJob(job);
        btn.classList.add('active');
        btn.querySelector('i').className = 'bi bi-heart-fill';
        btn.title = 'Remove from saved';
        btn.setAttribute('aria-label', 'Remove from saved');
        itemEl.classList.add('is-saved');
        animateBurst(btn);
        toast('success', `Saved "${job.job_title}"`, '❤️ Job Saved');
    }

    updateSavedBadges();
}

// ─────────────────────────────────────────
// Burst animation on save
// ─────────────────────────────────────────
function animateBurst(btn) {
    const burst = btn.querySelector('.burst');
    if (!burst) return;

    burst.innerHTML = '';
    const count = 7;
    for (let i = 0; i < count; i++) {
        const span = document.createElement('span');
        const angle = (360 / count) * i;
        const distance = 18 + Math.random() * 8;
        span.style.cssText = `
            transform: rotate(${angle}deg) translateY(-${distance}px) scale(0);
            animation: burstOut .5s ease forwards;
            animation-delay: ${i * 0.03}s;
        `;
        burst.appendChild(span);
    }
    setTimeout(() => { burst.innerHTML = ''; }, 600);
}

// Inject burst keyframe once
(function injectBurstKeyframe() {
    if (document.getElementById('burst-style')) return;
    const style = document.createElement('style');
    style.id = 'burst-style';
    style.textContent = `
        @keyframes burstOut {
            0%   { opacity: 1; transform: rotate(var(--a,0deg)) translateY(-20px) scale(0); }
            50%  { opacity: 1; transform: rotate(var(--a,0deg)) translateY(-22px) scale(1.2); }
            100% { opacity: 0; transform: rotate(var(--a,0deg)) translateY(-28px) scale(0); }
        }
    `;
    document.head.appendChild(style);
})();

// ─────────────────────────────────────────
// Update job count
// ─────────────────────────────────────────
function updateJobCount(count) {
    const el = document.getElementById('jobCount');
    if (el) el.textContent = count;
}

// ─────────────────────────────────────────
// Show states
// ─────────────────────────────────────────
function showEmptyState() {
    const container = document.getElementById('jobContainer');
    const emptyState = document.getElementById('emptyState');
    const emptySaved = document.getElementById('emptySavedState');
    if (container) container.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    if (emptySaved) emptySaved.style.display = 'none';
}

function showEmptySavedState() {
    const container = document.getElementById('jobContainer');
    const emptyState = document.getElementById('emptyState');
    const emptySaved = document.getElementById('emptySavedState');
    if (container) container.style.display = 'none';
    if (emptyState) emptyState.style.display = 'none';
    if (emptySaved) emptySaved.style.display = 'block';
}

function setEmptyStateMessage(message) {
    const emptyState = document.getElementById('emptyState');
    const description = emptyState?.querySelector('p');
    if (description) description.textContent = message;
}