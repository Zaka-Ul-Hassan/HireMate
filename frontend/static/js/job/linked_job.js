// frontend/static/js/job/linked_job.js

const BASE_URL = window.APP_CONFIG.FRONTEND_BASE_URL || 'http://127.0.0.1:8000';
const LI_API_URL = `${BASE_URL}/jobs`;

let allJobs        = [];
let currentTab     = 'all';
let searchPerformed = false;
let isFetching      = false;

// ─────────────────────────────────────────
// Toastr config
// ─────────────────────────────────────────
toastr.options = {
    closeButton: true, progressBar: true,
    positionClass: 'toast-top-right',
    timeOut: 3500, extendedTimeOut: 1000,
    showEasing: 'swing', hideEasing: 'linear',
    showMethod: 'fadeIn', hideMethod: 'fadeOut',
    preventDuplicates: true, newestOnTop: true,
};
function toast(type, msg, title) { toastr[type](msg, title || ''); }

// ─────────────────────────────────────────
// User helpers
// ─────────────────────────────────────────
function getUserId()      { return localStorage.getItem('user_id') || 'default'; }
function getAccessToken() { return localStorage.getItem('access_token'); }

// ─────────────────────────────────────────
// Filter localStorage
// ─────────────────────────────────────────
function getFilterKey() { return `linkedin_filters_${getUserId()}`; }

function saveFiltersToStorage(f) {
    try { localStorage.setItem(getFilterKey(), JSON.stringify(f)); } catch (_) {}
}
function loadFiltersFromStorage() {
    try {
        const raw = localStorage.getItem(getFilterKey());
        return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
}

// ─────────────────────────────────────────
// Saved-jobs localStorage
// ─────────────────────────────────────────
function getSavedKey() { return `linkedin_saved_jobs_${getUserId()}`; }

function getSavedJobs() {
    try { return JSON.parse(localStorage.getItem(getSavedKey()) || '{}'); }
    catch (_) { return {}; }
}
function saveJob(job) {
    try { const s = getSavedJobs(); s[jobId(job)] = job; localStorage.setItem(getSavedKey(), JSON.stringify(s)); }
    catch (_) {}
}
function unsaveJob(job) {
    try { const s = getSavedJobs(); delete s[jobId(job)]; localStorage.setItem(getSavedKey(), JSON.stringify(s)); }
    catch (_) {}
}
function isJobSaved(job) { return !!getSavedJobs()[jobId(job)]; }
// Fixed jobId function to use correct field names from API
function jobId(job) { 
    return job.job_id || job.id || `${job.job_title || job.title || ''}__${job.company_name || job.companyName || ''}`; 
}

// ─────────────────────────────────────────
// Badge counters
// ─────────────────────────────────────────
function updateSavedBadges() {
    const count = Object.keys(getSavedJobs()).length;
    ['savedBadge', 'tabBadge', 'savedCount'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = count;
    });
}

// ─────────────────────────────────────────
// Chip-select component
// ─────────────────────────────────────────
class ChipSelect {
    constructor(wrapId, options) {
        this.wrap = document.getElementById(wrapId);
        if (!this.wrap) return;
        this.options  = options;
        this.selected = [];
        this.box      = this.wrap.querySelector('.chip-input-box');
        this.dropdown = this.wrap.querySelector('.chip-dropdown');
        if (!this.box || !this.dropdown) return;
        this._build();
        this._bind();
    }

    _build() {
        this.dropdown.innerHTML = '';
        this.options.forEach(opt => {
            const div = document.createElement('div');
            div.className   = 'chip-option';
            div.dataset.value = opt.value;
            div.innerHTML   = `<span class="check" style="display:none">&#10003;</span> ${opt.label}`;
            this.dropdown.appendChild(div);
        });
        this._renderChips();
    }

    _bind() {
        this.box.addEventListener('click', e => {
            if (e.target.classList.contains('chip-remove')) return;
            // Close all other open dropdowns
            document.querySelectorAll('.chip-dropdown.open').forEach(d => {
                if (d !== this.dropdown) {
                    d.classList.remove('open');
                    d.closest('.chip-input-wrap')?.querySelector('.chip-input-box')?.classList.remove('open');
                }
            });
            const isOpen = this.dropdown.classList.contains('open');
            this._toggle(!isOpen);
        });

        this.dropdown.addEventListener('click', e => {
            const opt = e.target.closest('.chip-option');
            if (!opt) return;
            const val = opt.dataset.value;
            this.selected = this.selected.includes(val)
                ? this.selected.filter(v => v !== val)
                : [...this.selected, val];
            this._renderChips();
            this._renderOptions();
        });

        document.addEventListener('click', e => {
            if (this.wrap && !this.wrap.contains(e.target)) this._toggle(false);
        });
    }

    _toggle(open) {
        if (!this.dropdown || !this.box) return;
        this.dropdown.classList.toggle('open', open);
        this.box.classList.toggle('open', open);
    }

    _renderChips() {
        if (!this.box) return;
        this.box.querySelectorAll('.chip, .chip-placeholder').forEach(el => el.remove());
        if (this.selected.length === 0) {
            const ph = document.createElement('span');
            ph.className = 'chip-placeholder';
            ph.textContent = 'Select…';
            this.box.appendChild(ph);
        } else {
            this.selected.forEach(val => {
                const label = (this.options.find(o => o.value === val) || {}).label || val;
                const chip  = document.createElement('span');
                chip.className = 'chip';
                chip.innerHTML = `${label} <span class="chip-remove" data-value="${val}">✕</span>`;
                chip.querySelector('.chip-remove').addEventListener('click', () => {
                    this.selected = this.selected.filter(v => v !== val);
                    this._renderChips();
                    this._renderOptions();
                });
                this.box.appendChild(chip);
            });
        }
    }

    _renderOptions() {
        if (!this.dropdown) return;
        this.dropdown.querySelectorAll('.chip-option').forEach(opt => {
            const sel = this.selected.includes(opt.dataset.value);
            opt.classList.toggle('selected', sel);
            const ck = opt.querySelector('.check');
            if (ck) ck.style.display = sel ? 'inline' : 'none';
        });
    }

    getValues()     { return [...this.selected]; }
    setValues(vals) {
        this.selected = Array.isArray(vals) ? [...vals] : [];
        this._renderChips();
        this._renderOptions();
    }
    reset() { this.setValues([]); }
}

// ─────────────────────────────────────────
// Chip-select instances
// ─────────────────────────────────────────
let csExperience, csJobType, csRemote, csIndustry;

// ─────────────────────────────────────────
// Value mappings for API (UI value → API code)
// ─────────────────────────────────────────
const EXPERIENCE_MAP = {
    'Internship':       '1',
    'Entry level':      '2',
    'Associate':        '3',
    'Mid-Senior level': '4',
    'Director':         '5',
    'Executive':        '6'
};

const JOB_TYPE_MAP = {
    'Full-time':  'F',
    'Part-time':  'P',
    'Contract':   'C',
    'Temporary':  'T',
    'Internship': 'I'
};

const REMOTE_MAP = {
    'Remote':  '1',
    'On-Site': '2',
    'Hybrid':  '3'
};

// ─────────────────────────────────────────
// Collect filter values
// ─────────────────────────────────────────
function collectFilters() {
    const compRaw = (document.getElementById('f_company')?.value || '').trim();
    
    // Get UI values
    const experienceUI = csExperience?.getValues() ?? [];
    const jobTypeUI = csJobType?.getValues() ?? [];
    const remoteUI = csRemote?.getValues() ?? [];
    
    // Map to API codes
    const experienceCodes = experienceUI.map(v => EXPERIENCE_MAP[v]).filter(Boolean);
    const jobTypeCodes = jobTypeUI.map(v => JOB_TYPE_MAP[v]).filter(Boolean);
    const remoteCodes = remoteUI.map(v => REMOTE_MAP[v]).filter(Boolean);
    
    return {
        job_title:        (document.getElementById('f_job_title')?.value   || '').trim(),
        job_location:     (document.getElementById('f_job_location')?.value || '').trim(),
        company_name:     compRaw ? compRaw.split(',').map(s => s.trim()).filter(Boolean) : [],
        number_records:   parseInt(document.getElementById('f_records')?.value) || 5,
        sort_by:          document.getElementById('f_sort')?.value || 'R',
        date_posted:      document.getElementById('f_date')?.value || '',
        experience_level: experienceCodes,
        job_type:         jobTypeCodes,
        remote_type:      remoteCodes,
        industry:         csIndustry?.getValues() ?? [],
    };
}

// ─────────────────────────────────────────
// Apply saved filters to UI
// ─────────────────────────────────────────
function applyFiltersToUI(f) {
    if (!f) return;
    const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val ?? '';
    };
    set('f_job_title',   f.job_title    || '');
    set('f_job_location',f.job_location || '');
    set('f_company',     Array.isArray(f.company_name) ? f.company_name.join(', ') : '');
    set('f_records',     f.number_records || 5);
    set('f_sort',        f.sort_by || 'R');
    set('f_date',        f.date_posted || '');
    csExperience?.setValues(f.experience_level || []);
    csJobType?.setValues(f.job_type         || []);
    csRemote?.setValues(f.remote_type       || []);
    csIndustry?.setValues(f.industry        || []);
}

// ─────────────────────────────────────────
// Clear all filter inputs
// ─────────────────────────────────────────
function clearAllFilters() {
    ['f_job_title','f_job_location','f_company'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const rec = document.getElementById('f_records'); if (rec) rec.value = '5';
    const srt = document.getElementById('f_sort');    if (srt) srt.value = 'R';
    const dat = document.getElementById('f_date');    if (dat) dat.value = '';
    csExperience?.reset();
    csJobType?.reset();
    csRemote?.reset();
    csIndustry?.reset();
}

// ─────────────────────────────────────────
// DOMContentLoaded
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Initialise chip selects
    csExperience = new ChipSelect('cs-experience', [
        { value:'Internship',       label:'Internship'       },
        { value:'Entry level',      label:'Entry level'      },
        { value:'Associate',        label:'Associate'        },
        { value:'Mid-Senior level', label:'Mid-Senior level' },
        { value:'Director',         label:'Director'         },
        { value:'Executive',        label:'Executive'        },
    ]);
    csJobType = new ChipSelect('cs-jobtype', [
        { value:'Full-time',  label:'Full-time'  },
        { value:'Part-time',  label:'Part-time'  },
        { value:'Contract',   label:'Contract'   },
        { value:'Temporary',  label:'Temporary'  },
        { value:'Internship', label:'Internship' },
    ]);
    csRemote = new ChipSelect('cs-remote', [
        { value:'Remote',  label:'Remote'  },
        { value:'On-Site', label:'On-Site' },
        { value:'Hybrid',  label:'Hybrid'  },
    ]);
    csIndustry = new ChipSelect('cs-industry', [
        { value:'Banking',                              label:'Banking'                   },
        { value:'IT Services and IT Consulting',        label:'IT Services & Consulting'  },
        { value:'Human Resources Services',             label:'Human Resources'           },
        { value:'Business Consulting and Services',     label:'Business Consulting'       },
        { value:'Software Development',                 label:'Software Development'      },
        { value:'Financial Services',                   label:'Financial Services'        },
        { value:'Staffing and Recruiting',              label:'Staffing & Recruiting'     },
        { value:'Professional Services',                label:'Professional Services'     },
        { value:'Technology, Information and Internet', label:'Technology & Internet'     },
        { value:'Healthcare',                           label:'Healthcare'                },
        { value:'Education',                            label:'Education'                 },
        { value:'Manufacturing',                        label:'Manufacturing'             },
        { value:'Retail',                               label:'Retail'                    },
        { value:'Media and Entertainment',              label:'Media & Entertainment'     },
        { value:'Real Estate',                          label:'Real Estate'               },
    ]);

    // Restore saved filters
    const saved = loadFiltersFromStorage();
    if (saved) {
        applyFiltersToUI(saved);
        showSavedIndicator('Saved filters loaded');
    }

    updateSavedBadges();
    attachEventListeners();
    showState('prompt');   // start with prompt
});

// ─────────────────────────────────────────
// Event listeners
// ─────────────────────────────────────────
function attachEventListeners() {
    document.getElementById('applyBtn')?.addEventListener('click', () => {
        if (isFetching) return;
        searchPerformed = true;
        fetchJobs();
    });

    document.getElementById('saveFilterBtn')?.addEventListener('click', () => {
        saveFiltersToStorage(collectFilters());
        showSavedIndicator('Filters saved!');
        toast('success', 'Filters saved — will reload automatically next visit.');
    });

    document.getElementById('clearFilterBtn')?.addEventListener('click', () => {
        clearAllFilters();
        localStorage.removeItem(getFilterKey());
        hideSavedIndicator();
        toast('info', 'Filters cleared');
    });

    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentTab = tab.dataset.tab;
            renderCurrentTab();
        });
    });

    document.getElementById('savedPill')?.addEventListener('click',   () => document.getElementById('tabSaved')?.click());
    document.getElementById('showSavedBtn')?.addEventListener('click', () => document.getElementById('tabSaved')?.click());
}

// ─────────────────────────────────────────
// Saved-filter indicator
// ─────────────────────────────────────────
function showSavedIndicator(msg) {
    const el = document.getElementById('filterSavedIndicator');
    if (el) el.innerHTML = `<span class="filter-saved-toast">
        <i class="bi bi-bookmark-check-fill"></i> ${msg}
    </span>`;
}
function hideSavedIndicator() {
    const el = document.getElementById('filterSavedIndicator');
    if (el) el.innerHTML = '';
}

// ─────────────────────────────────────────
// Fetch from API
// ─────────────────────────────────────────
async function fetchJobs() {
    if (isFetching) return;
    isFetching = true;

    const applyBtn = document.getElementById('applyBtn');
    if (applyBtn) { applyBtn.disabled = true; applyBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Searching…'; }

    showState('loading');

    try {
        const payload = collectFilters();
        const token   = getAccessToken();
        const headers = { 'accept': 'application/json', 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        console.log('LinkedIn search payload:', payload);
        const resp = await fetch(LI_API_URL, { method:'POST', headers, body: JSON.stringify(payload) });

        let result = null;
        try { result = await resp.json(); } catch (_) { result = null; }
        console.log('LinkedIn API response:', result);

        // App-level error (status: false)
        if (result && result.status === false) {
            toast('error', result.message || 'Server error — please try again.', 'Search Failed');
            allJobs = [];
            updateJobCount(0);
            showState('empty');
            return;
        }

        // HTTP error
        if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.statusText}`);

        // Extract array from various shapes
        let jobs = [];
        if (Array.isArray(result))                       jobs = result;
        else if (result && Array.isArray(result.data))   jobs = result.data;
        else if (result && result.status === true && Array.isArray(result.data)) jobs = result.data;

        if (jobs.length > 0) {
            allJobs = jobs;
            updateJobCount(jobs.length);
            // Force "all" tab active
            document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === 'all'));
            currentTab = 'all';
            renderCurrentTab();
            toast('success', `Found ${jobs.length} LinkedIn jobs`);
        } else {
            allJobs = [];
            updateJobCount(0);
            showState('empty');
            toast('info', 'No jobs matched — try broadening your filters.');
        }
    } catch (err) {
        console.error('LinkedIn fetch error:', err);
        allJobs = [];
        updateJobCount(0);
        showState('empty');
        toast('error', `Request failed: ${err.message}`);
    } finally {
        isFetching = false;
        if (applyBtn) { applyBtn.disabled = false; applyBtn.innerHTML = '<i class="bi bi-search"></i> Apply Filters'; }
    }
}

// ─────────────────────────────────────────
// Render current tab
// ─────────────────────────────────────────
function renderCurrentTab() {
    const titleEl = document.getElementById('sectionTitle');

    if (currentTab === 'saved') {
        if (titleEl) titleEl.innerHTML = `<i class="bi bi-heart-fill"></i> Saved LinkedIn Jobs`;
        const savedList = Object.values(getSavedJobs());
        savedList.length === 0 ? showState('emptySaved') : renderJobs(savedList);
    } else {
        if (titleEl) titleEl.innerHTML = `<i class="bi bi-linkedin"></i> LinkedIn Results`;
        if (!searchPerformed)      showState('prompt');
        else if (allJobs.length === 0) showState('empty');
        else                           renderJobs(allJobs);
    }
}

// ─────────────────────────────────────────
// Centralised state switcher
// ─────────────────────────────────────────
const STATE_MAP = {
    loading:    'loadingSpinner',
    empty:      'emptyState',
    emptySaved: 'emptySavedState',
    prompt:     'promptState',
    jobs:       'jobContainer',
};

function showState(which) {
    Object.entries(STATE_MAP).forEach(([key, id]) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.style.display = (key === which) ? (key === 'jobs' ? 'flex' : 'block') : 'none';
    });
}

// ─────────────────────────────────────────
// Render list of job cards
// ─────────────────────────────────────────
function renderJobs(jobs) {
    const container = document.getElementById('jobContainer');
    if (!container) return;

    if (!jobs || jobs.length === 0) {
        showState(currentTab === 'saved' ? 'emptySaved' : 'empty');
        return;
    }

    showState('jobs');
    container.innerHTML = '';
    jobs.forEach(job => {
        try { container.appendChild(createJobItem(job)); }
        catch (e) { console.warn('Card render error:', e, job); }
    });
}

// ─────────────────────────────────────────
// Build one job card - CORRECT API FIELD NAMES
// ─────────────────────────────────────────
function createJobItem(job) {
    const div   = document.createElement('div');
    const saved = isJobSaved(job);
    div.className     = `job-item${saved ? ' is-saved' : ''}`;
    div.dataset.jobId = jobId(job);

    // Use company_name from API response
    const companyName = job.company_name || 'Unknown Company';
    const initials = companyName
        .split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '?';

    // Tags - using correct API field names
    const tags = [];
    
    // Job Employment Type (Full-time, Part-time, etc.)
    if (job.job_employment_type) {
        const isFullTime = job.job_employment_type.toLowerCase().includes('full');
        tags.push({ 
            label: job.job_employment_type, 
            cls: isFullTime ? 'tag-ft' : 'tag-contract' 
        });
    }
    
    // Experience Level
    if (job.job_seniority_level && job.job_seniority_level !== 'Not Applicable') {
        tags.push({ label: job.job_seniority_level, cls: '' });
    }
    
    // Remote/Location check
    if (job.job_location && /remote/i.test(job.job_location)) {
        tags.push({ label: 'Remote', cls: 'tag-remote' });
    }
    
    // Salary
    if (job.job_salary_info && job.job_salary_info.trim()) {
        tags.push({ label: job.job_salary_info, cls: 'tag-salary' });
    }
    
    const tagsHTML = tags.map(t => `<span class="job-tag ${t.cls}">${esc(t.label)}</span>`).join('');

    // Applicants count - using applicants_count
    let appBadge = '';
    if (job.applicants_count) {
        const early = /first/i.test(job.applicants_count) || /be one of/i.test(job.applicants_count);
        appBadge = `<span class="applicants-badge ${early ? 'early' : 'active'}">
            <i class="bi bi-people-fill"></i> ${esc(String(job.applicants_count))}
        </span>`;
    }

    // Benefits (first line only)
    let benBadge = '';
    if (job.benefits && job.benefits.trim()) {
        const firstBen = job.benefits.split('\n')[0].trim();
        if (firstBen) {
            benBadge = `<span class="applicants-badge active">
                <i class="bi bi-star-fill"></i> ${esc(firstBen)}
            </span>`;
        }
    }

    // Using correct API field names
    const viewHref = job.job_link || job.apply_link || '#';
    const compHref = job.company_linkedin_url || '';
    const viewDis  = (!job.job_link && !job.apply_link) ? 'disabled' : '';
    const posted   = job.job_posted_time || job.job_published_at || 'N/A';
    const hCls     = saved ? ' active' : '';
    const jobTitle = job.job_title || 'No Title';
    const location = job.job_location || 'Not specified';

    // Additional metadata
    const metaItems = [];
    
    // Location (always show)
    metaItems.push(`<div class="job-meta-item">
        <i class="bi bi-geo-alt-fill"></i>
        <span>${esc(location)}</span>
    </div>`);
    
    // Posted time (always show)
    metaItems.push(`<div class="job-meta-item">
        <i class="bi bi-clock-fill"></i>
        <span>${esc(String(posted))}</span>
    </div>`);
    
    // Job Function
    if (job.job_function) {
        metaItems.push(`<div class="job-meta-item">
            <i class="bi bi-briefcase-fill"></i>
            <span>${esc(job.job_function)}</span>
        </div>`);
    }
    
    // Job Industries
    if (job.job_industries) {
        metaItems.push(`<div class="job-meta-item">
            <i class="bi bi-building-fill"></i>
            <span>${esc(job.job_industries)}</span>
        </div>`);
    }

    div.innerHTML = `
        <div class="saved-ribbon"><i class="bi bi-heart-fill"></i> Saved</div>
        <div class="job-header-row">
            <div class="company-logo">${esc(initials)}</div>
            <div class="job-info">
                <div class="job-title-row">
                    <h3 class="job-title">${esc(jobTitle)}</h3>
                    <button class="heart-btn${hCls}" type="button"
                            title="${saved ? 'Remove from saved' : 'Save job'}"
                            aria-label="${saved ? 'Remove from saved' : 'Save job'}">
                        <i class="bi bi-heart${saved ? '-fill' : ''}"></i>
                        <div class="burst"></div>
                    </button>
                </div>
                <div class="company-name">
                    <i class="bi bi-building"></i> ${esc(companyName)}
                </div>
                ${tagsHTML ? `<div class="tag-list">${tagsHTML}</div>` : ''}
                <div class="job-meta">
                    ${metaItems.join('')}
                </div>
            </div>
        </div>
        <div class="job-footer">
            <a href="${viewHref}" target="_blank" rel="noopener" class="job-view-btn ${viewDis}">
                <i class="bi bi-linkedin"></i> View on LinkedIn
            </a>
            <div class="footer-meta">
                ${appBadge}
                ${benBadge}
                ${compHref ? `<a href="${compHref}" target="_blank" rel="noopener" 
                    style="color:var(--text-muted);font-size:.82rem;text-decoration:none;">
                    <i class="bi bi-globe2"></i> Company
                </a>` : ''}
            </div>
        </div>`;

    div.querySelector('.heart-btn').addEventListener('click', e => {
        e.stopPropagation();
        toggleSave(job, div.querySelector('.heart-btn'), div);
    });
    return div;
}

// ─────────────────────────────────────────
// Toggle save
// ─────────────────────────────────────────
function toggleSave(job, btn, itemEl) {
    if (!btn || !itemEl) return;
    const wasSaved = isJobSaved(job);
    const jobTitle = job.job_title || job.title || 'this job';
    
    if (wasSaved) {
        unsaveJob(job);
        btn.classList.remove('active');
        btn.querySelector('i').className = 'bi bi-heart';
        btn.title = 'Save job';
        itemEl.classList.remove('is-saved');
        if (currentTab === 'saved') {
            itemEl.style.transition = 'opacity .25s, transform .25s';
            itemEl.style.opacity    = '0';
            itemEl.style.transform  = 'translateX(-12px)';
            setTimeout(() => {
                itemEl.remove();
                const c = document.getElementById('jobContainer');
                if (c && c.children.length === 0) showState('emptySaved');
            }, 260);
        }
        toast('info', `Removed "${esc(jobTitle)}" from saved`);
    } else {
        saveJob(job);
        btn.classList.add('active');
        btn.querySelector('i').className = 'bi bi-heart-fill';
        btn.title = 'Remove from saved';
        itemEl.classList.add('is-saved');
        animateBurst(btn);
        toast('success', `Saved "${esc(jobTitle)}"`, '❤️ Saved');
    }
    updateSavedBadges();
}

// ─────────────────────────────────────────
// Burst animation
// ─────────────────────────────────────────
function animateBurst(btn) {
    const burst = btn.querySelector('.burst');
    if (!burst) return;
    burst.innerHTML = '';
    for (let i = 0; i < 7; i++) {
        const span = document.createElement('span');
        const angle = (360/7)*i, dist = 18 + Math.random()*8;
        span.style.cssText = `transform:rotate(${angle}deg) translateY(-${dist}px) scale(0);animation:burstOut .5s ease forwards;animation-delay:${i*0.03}s;`;
        burst.appendChild(span);
    }
    setTimeout(() => { burst.innerHTML = ''; }, 600);
}
(function() {
    if (document.getElementById('li-burst-style')) return;
    const s = document.createElement('style');
    s.id = 'li-burst-style';
    s.textContent = `@keyframes burstOut{0%{opacity:1;transform:translateY(-20px) scale(0)}50%{opacity:1;transform:translateY(-22px) scale(1.2)}100%{opacity:0;transform:translateY(-28px) scale(0)}}`;
    document.head.appendChild(s);
})();

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────
function updateJobCount(n) {
    const el = document.getElementById('jobCount');
    if (el) el.textContent = n;
}
function esc(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}