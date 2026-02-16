// frontend\static\js\resume\resume_list.js

// Global variables
let allResumes = [];
let filteredResumes = [];
const API_BASE_URL = 'http://127.0.0.1:8000/api/resumes';
const EMAIL_GENERATE_API = 'http://127.0.0.1:8000/api/email/generate-content';

// Initialize on page load - SINGLE DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', function () {
    initializeResumeList();
    attachEventListeners();
    setupDelegatedEventListeners();
    
    // Check if there's a search query from the RAG page
    const searchQuery = sessionStorage.getItem('resumeSearchQuery');
    if (searchQuery) {
        // Clear the session storage
        sessionStorage.removeItem('resumeSearchQuery');
        
        // Set the search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = searchQuery;
            
            // Trigger search
            setTimeout(() => {
                handleSearch();
                
                // Show toast
                showToast('success', `Showing results for: ${searchQuery}`);
            }, 300);
        }
    }
});

// Initialize resume list
function initializeResumeList() {
    console.log('Resume List initialized');

    // Get all resume cards from the page
    const cards = document.querySelectorAll('.resume-card');
    allResumes = Array.from(cards);
    filteredResumes = [...allResumes];

    updateStats();
}

// Setup delegated event listeners for dynamically created buttons
function setupDelegatedEventListeners() {
    const resumeGrid = document.getElementById('resumeGrid');

    if (resumeGrid) {
        // View resume buttons
        resumeGrid.addEventListener('click', function (e) {
            const viewBtn = e.target.closest('.btn-view-resume');
            if (viewBtn) {
                const resumeId = viewBtn.getAttribute('data-resume-id');
                if (resumeId) {
                    viewResume(parseInt(resumeId));
                }
            }

            // Download resume buttons
            const downloadBtn = e.target.closest('.btn-download-resume');
            if (downloadBtn) {
                const resumeFile = downloadBtn.getAttribute('data-resume-file');
                if (resumeFile) {
                    downloadResume(resumeFile);
                }
            }

            // Email link clicked - generate email content
            const emailLink = e.target.closest('.contact-link[href^="mailto:"]');
            if (emailLink) {
                e.preventDefault();
                const email = emailLink.getAttribute('href').replace('mailto:', '');
                generateAndComposeEmail(email);
            }
        });
    }
}

// Generate email content and redirect to compose page
async function generateAndComposeEmail(candidateEmail) {
    try {
        // Show full-page loader
        showFullPageLoader('Generating personalized email content...');

        // Get auth token
        const token = localStorage.getItem('access_token');
        if (!token) {
            hideFullPageLoader();
            showToast('error', 'Please login to send emails');
            setTimeout(() => window.location.href = '/', 2000);
            return;
        }

        // Call the API to generate email content
        const response = await fetch(`${EMAIL_GENERATE_API}?email=${encodeURIComponent(candidateEmail)}`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            hideFullPageLoader();
            if (response.status === 401) {
                showToast('error', 'Session expired. Please login again.');
                setTimeout(() => window.location.href = '/', 2000);
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status && result.data) {
            // Store the generated email data in sessionStorage
            sessionStorage.setItem('composeEmailData', JSON.stringify({
                to: result.data.to,
                subject: `Opportunity at ${result.data.employer_name}`,
                body: result.data.email_content,
                candidateName: result.data.candidate_name,
                employerName: result.data.employer_name
            }));

            // Update loader message
            updateLoaderMessage('Email content generated! Redirecting...');

            // Redirect to compose email page (loader will be hidden by the compose page)
            setTimeout(() => {
                window.location.href = '/email/compose-email';
            }, 800);

        } else {
            hideFullPageLoader();
            showToast('error', result.message || 'Failed to generate email content');
        }

    } catch (error) {
        console.error('Error generating email content:', error);
        hideFullPageLoader();
        showToast('error', 'Failed to generate email content. Please try again.');
    }
}

// Show full-page loader
function showFullPageLoader(message = 'Loading...') {
    // Remove existing loader if any
    hideFullPageLoader();

    const loader = document.createElement('div');
    loader.id = 'fullPageLoader';
    loader.innerHTML = `
        <div class="loader-backdrop">
            <div class="loader-content">
                <div class="loader-spinner">
                    <div class="spinner"></div>
                </div>
                <div class="loader-message">${message}</div>
            </div>
        </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.id = 'fullPageLoaderStyles';
    style.textContent = `
        #fullPageLoader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 999999;
        }

        .loader-backdrop {
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        }

        .loader-content {
            text-align: center;
            padding: 3rem;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            min-width: 300px;
            animation: scaleIn 0.3s ease;
        }

        .loader-spinner {
            margin-bottom: 1.5rem;
        }

        .loader-spinner .spinner {
            width: 60px;
            height: 60px;
            margin: 0 auto;
            border: 4px solid #f3f4f6;
            border-top-color: #667eea;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        .loader-message {
            color: #2d3748;
            font-size: 1.1rem;
            font-weight: 600;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }

        @keyframes scaleIn {
            from { 
                opacity: 0;
                transform: scale(0.9);
            }
            to { 
                opacity: 1;
                transform: scale(1);
            }
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(loader);
}

// Update loader message
function updateLoaderMessage(message) {
    const loaderMessage = document.querySelector('#fullPageLoader .loader-message');
    if (loaderMessage) {
        loaderMessage.textContent = message;
    }
}

// Hide full-page loader
function hideFullPageLoader() {
    const loader = document.getElementById('fullPageLoader');
    const styles = document.getElementById('fullPageLoaderStyles');
    
    if (loader) {
        loader.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => loader.remove(), 300);
    }
    
    if (styles) {
        styles.remove();
    }
}

// Attach all event listeners
function attachEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
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

    // Filter dropdowns
    const experienceFilter = document.getElementById('experienceFilter');
    if (experienceFilter) {
        experienceFilter.addEventListener('change', applyFilters);
    }

    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
        sortFilter.addEventListener('change', handleSort);
    }

    // Header action buttons
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshList);
    }

    const exportListBtn = document.getElementById('exportListBtn');
    if (exportListBtn) {
        exportListBtn.addEventListener('click', exportList);
    }

    // Clear all filters button
    const clearAllFiltersBtn = document.getElementById('clearAllFiltersBtn');
    if (clearAllFiltersBtn) {
        clearAllFiltersBtn.addEventListener('click', clearAllFilters);
    }
}

// Load resumes from API
async function loadResumesFromAPI(searchQuery = '') {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resumeGrid = document.getElementById('resumeGrid');

    try {
        // Show loading
        if (loadingIndicator) loadingIndicator.style.display = 'block';
        if (resumeGrid) resumeGrid.style.display = 'none';

        // Build API URL with search parameter - use /all endpoint
        let apiUrl = `${API_BASE_URL}/all`;
        if (searchQuery) {
            apiUrl += `?name=${encodeURIComponent(searchQuery)}`;
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
        if (resumeGrid) resumeGrid.style.display = 'grid';

        if (result.status && result.data && result.data.length > 0) {
            renderResumes(result.data);
            updateStats(result.data.length, result.data.length);

            showToast('success', `${result.data.length} resume(s) loaded successfully`);
        } else {
            showNoResults();
            updateStats(0, 0);
            showToast('info', 'No resumes found');
        }

    } catch (error) {
        console.error('Error loading resumes:', error);

        // Hide loading
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        if (resumeGrid) resumeGrid.style.display = 'grid';

        showToast('error', 'Failed to load resumes from API: ' + error.message);
    }
}

// Render resumes dynamically
function renderResumes(resumes) {
    const resumeGrid = document.getElementById('resumeGrid');
    if (!resumeGrid) return;

    if (resumes.length === 0) {
        showNoResults();
        return;
    }

    // Clear current cards
    resumeGrid.innerHTML = '';

    // Create cards for each resume
    resumes.forEach(resume => {
        const card = createResumeCard(resume);
        resumeGrid.appendChild(card);
    });

    // Update the allResumes array for filtering
    allResumes = Array.from(document.querySelectorAll('.resume-card'));
    filteredResumes = [...allResumes];
}

// Utility function to normalize URLs
function normalizeUrl(url) {
    if (!url) return '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return 'https://' + url;
    }
    return url;
}

// Create a resume card element
function createResumeCard(resume) {
    const card = document.createElement('div');
    card.className = 'resume-card';
    card.setAttribute('data-resume-id', resume.Id);
    card.setAttribute('data-name', (resume.FullName || '').toLowerCase());
    card.setAttribute('data-skills', (resume.Skills || '').toLowerCase());
    card.setAttribute('data-email', (resume.Email || '').toLowerCase());
    card.setAttribute('data-position', (resume.DeveloperType || '').toLowerCase());
    card.setAttribute('data-experience', resume.TotalExperience || '');
    card.setAttribute('data-created', resume.CreatedAt || '');
    card.setAttribute('data-resume-file', resume.ResumeFile || '');

    // Profile image or placeholder
    let profileHTML = '';
    if (resume.ProfileImage) {
        const imagePath = resume.ProfileImage.replace(/\\/g, '/');
        profileHTML = `<img src="/${imagePath}" alt="${resume.FullName}" class="profile-image">`;
    } else {
        const initial = resume.FullName ? resume.FullName.charAt(0) : '?';
        profileHTML = `<div class="profile-placeholder">${initial}</div>`;
    }

    // Skills
    let skillsHTML = '';
    if (resume.Skills) {
        const skillsList = resume.Skills.split(',');
        const skillTags = skillsList.map(skill =>
            `<span class="skill-tag">${skill.trim()}</span>`
        ).join('');

        skillsHTML = `
            <div class="skills-section">
                <div class="section-title">
                    <i class="bi bi-code-square"></i> Skills
                </div>
                <div class="skills-tags">
                    ${skillTags}
                </div>
            </div>
        `;
    }

    // Summary
    let summaryHTML = '';
    if (resume.Summary) {
        summaryHTML = `
            <div class="card-summary">
                <div class="section-title">
                    <i class="bi bi-file-text"></i> Professional Summary
                </div>
                <p class="summary-text">${resume.Summary}</p>
            </div>
        `;
    }

    // Objective
    let objectiveHTML = '';
    if (resume.Objective) {
        objectiveHTML = `
            <div class="card-summary">
                <div class="section-title">
                    <i class="bi bi-bullseye"></i> Objective
                </div>
                <p class="summary-text">${resume.Objective}</p>
            </div>
        `;
    }

    // Experience
    let experienceHTML = '';
    if (resume.ExperienceDescription || resume.TotalExperience) {
        experienceHTML = `
            <div class="experience-section">
                <div class="section-title">
                    <i class="bi bi-briefcase-fill"></i> Experience
                </div>
                ${resume.TotalExperience ? `<p class="info-line"><strong>Total Experience:</strong> ${resume.TotalExperience}</p>` : ''}
                ${resume.ExperienceTitle ? `<p class="info-line"><strong>Title:</strong> ${resume.ExperienceTitle}</p>` : ''}
                ${resume.ExperienceCompany ? `<p class="info-line"><strong>Company:</strong> ${resume.ExperienceCompany}</p>` : ''}
                ${resume.ExperienceDuration ? `<p class="info-line"><strong>Duration:</strong> ${resume.ExperienceDuration}</p>` : ''}
                ${resume.ExperienceDescription ? `<p class="description-text">${resume.ExperienceDescription}</p>` : ''}
            </div>
        `;
    }

    // Education
    let educationHTML = '';
    if (resume.Education1 || resume.Education2 || resume.Education3) {
        educationHTML = `
            <div class="education-section">
                <div class="section-title">
                    <i class="bi bi-mortarboard-fill"></i> Education
                </div>
                ${resume.Education1 ? `<p class="education-item">• ${resume.Education1}</p>` : ''}
                ${resume.Education2 ? `<p class="education-item">• ${resume.Education2}</p>` : ''}
                ${resume.Education3 ? `<p class="education-item">• ${resume.Education3}</p>` : ''}
            </div>
        `;
    }

    // Projects
    let projectsHTML = '';
    if (resume.Project1 || resume.Project2) {
        projectsHTML = `
            <div class="projects-section">
                <div class="section-title">
                    <i class="bi bi-kanban-fill"></i> Projects
                </div>
                ${resume.Project1 ? `<p class="project-item">• ${resume.Project1}</p>` : ''}
                ${resume.Project2 ? `<p class="project-item">• ${resume.Project2}</p>` : ''}
            </div>
        `;
    }

    // Personal Info
    let personalInfoHTML = '';
    if (resume.DateOfBirth || resume.Gender || resume.Nationality) {
        personalInfoHTML = `
            <div class="info-section">
                <div class="section-title">
                    <i class="bi bi-person-badge"></i> Personal Information
                </div>
                <div class="info-grid">
                    ${resume.DateOfBirth ? `
                        <div class="info-item">
                            <i class="bi bi-calendar-event"></i>
                            <span><strong>DOB:</strong> ${resume.DateOfBirth}</span>
                        </div>
                    ` : ''}
                    ${resume.Gender ? `
                        <div class="info-item">
                            <i class="bi bi-person"></i>
                            <span><strong>Gender:</strong> ${resume.Gender}</span>
                        </div>
                    ` : ''}
                    ${resume.Nationality ? `
                        <div class="info-item">
                            <i class="bi bi-flag"></i>
                            <span><strong>Nationality:</strong> ${resume.Nationality}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Languages & Certifications
    let additionalInfoHTML = '';
    if (resume.Languages || resume.Certifications) {
        additionalInfoHTML = `
            <div class="additional-info">
                ${resume.Languages ? `
                    <div class="info-block">
                        <div class="section-title">
                            <i class="bi bi-translate"></i> Languages
                        </div>
                        <p>${resume.Languages}</p>
                    </div>
                ` : ''}
                ${resume.Certifications ? `
                    <div class="info-block">
                        <div class="section-title">
                            <i class="bi bi-award-fill"></i> Certifications
                        </div>
                        <p>${resume.Certifications}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Format date
    const createdDate = resume.CreatedAt ?
        new Date(resume.CreatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) :
        'N/A';

    card.innerHTML = `
        <div class="card-header-section">
            <div class="profile-section">
                ${profileHTML}
                <div class="profile-info">
                    <h3 class="candidate-name">${resume.FullName || 'N/A'}</h3>
                    <p class="candidate-position">${resume.DeveloperType || 'Developer'}</p>
                    <div class="candidate-meta">
                        <span class="meta-item">
                            <i class="bi bi-geo-alt"></i> ${resume.Address || resume.Country || 'N/A'}
                        </span>
                        <span class="meta-item">
                            <i class="bi bi-briefcase"></i> ${resume.TotalExperience || 'N/A'}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        ${summaryHTML}
        ${objectiveHTML}
        ${skillsHTML}
        ${experienceHTML}
        ${educationHTML}
        ${projectsHTML}
        ${personalInfoHTML}
        ${additionalInfoHTML}

        <div class="contact-section">
            <div class="section-title">
                <i class="bi bi-envelope-fill"></i> Contact Information
            </div>
            <div class="contact-grid">
                <div class="contact-item">
                    <i class="bi bi-envelope"></i>
                    <a href="mailto:${resume.Email}" class="contact-link" title="Click to compose personalized email">${resume.Email}</a>
                </div>
                ${resume.PhoneNumber ? `
                    <div class="contact-item">
                        <i class="bi bi-telephone"></i>
                        <span>${resume.PhoneNumber}</span>
                    </div>
                ` : ''}
                ${resume.LinkedIn ? `
                    <div class="contact-item">
                        <i class="bi bi-linkedin"></i>
                        <a href="${normalizeUrl(resume.LinkedIn)}" target="_blank" rel="noopener noreferrer" class="contact-link">LinkedIn Profile</a>
                    </div>
                ` : ''}
                ${resume.GitHub ? `
                    <div class="contact-item">
                        <i class="bi bi-github"></i>
                        <a href="${normalizeUrl(resume.GitHub)}" target="_blank" rel="noopener noreferrer" class="contact-link">GitHub Profile</a>
                    </div>
                ` : ''}
            </div>
        </div>

        <div class="card-footer-section">
            <small class="text-muted">
                <i class="bi bi-calendar"></i> Added ${createdDate}
            </small>
        </div>
    `;

    return card;
}

// Handle search
function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchQuery = searchInput.value.trim().toLowerCase();
    const clearSearchBtn = document.getElementById('clearSearchBtn');

    // Show/hide clear button
    if (clearSearchBtn) {
        clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
    }

    // If search query is empty, reload all resumes
    if (!searchQuery) {
        loadResumesFromAPI();
        return;
    }

    // Load from API with search query
    loadResumesFromAPI(searchQuery);
}

// Clear search
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');

    if (searchInput) {
        searchInput.value = '';
    }
    if (clearSearchBtn) {
        clearSearchBtn.style.display = 'none';
    }

    loadResumesFromAPI();
}

// Apply filters (experience, etc.)
function applyFilters() {
    const experienceFilter = document.getElementById('experienceFilter').value;

    filteredResumes = allResumes.filter(card => {
        // Experience filter
        if (experienceFilter) {
            const experience = card.getAttribute('data-experience') || '';
            const years = parseExperience(experience);

            if (!matchesExperienceRange(years, experienceFilter)) {
                return false;
            }
        }

        return true;
    });

    displayFilteredResumes();
    updateStats();
}

// Parse experience string to years
function parseExperience(expString) {
    if (!expString) return 0;

    const match = expString.match(/(\d+)\s*year/i);
    return match ? parseInt(match[1]) : 0;
}

// Check if years match experience range
function matchesExperienceRange(years, range) {
    switch (range) {
        case '0-2':
            return years >= 0 && years <= 2;
        case '2-5':
            return years > 2 && years <= 5;
        case '5-10':
            return years > 5 && years <= 10;
        case '10+':
            return years > 10;
        default:
            return true;
    }
}

// Handle sorting
function handleSort() {
    const sortValue = document.getElementById('sortFilter').value;

    switch (sortValue) {
        case 'newest':
            filteredResumes.sort((a, b) => {
                const dateA = new Date(a.getAttribute('data-created'));
                const dateB = new Date(b.getAttribute('data-created'));
                return dateB - dateA;
            });
            break;
        case 'oldest':
            filteredResumes.sort((a, b) => {
                const dateA = new Date(a.getAttribute('data-created'));
                const dateB = new Date(b.getAttribute('data-created'));
                return dateA - dateB;
            });
            break;
        case 'name-asc':
            filteredResumes.sort((a, b) => {
                const nameA = a.getAttribute('data-name');
                const nameB = b.getAttribute('data-name');
                return nameA.localeCompare(nameB);
            });
            break;
        case 'name-desc':
            filteredResumes.sort((a, b) => {
                const nameA = a.getAttribute('data-name');
                const nameB = b.getAttribute('data-name');
                return nameB.localeCompare(nameA);
            });
            break;
    }

    displayFilteredResumes();
}

// Display filtered resumes
function displayFilteredResumes() {
    const resumeGrid = document.getElementById('resumeGrid');
    const noResults = document.getElementById('noResults');

    if (filteredResumes.length === 0) {
        if (resumeGrid) resumeGrid.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
    } else {
        if (resumeGrid) resumeGrid.style.display = 'grid';
        if (noResults) noResults.style.display = 'none';

        // Clear and re-append
        resumeGrid.innerHTML = '';
        filteredResumes.forEach(card => {
            resumeGrid.appendChild(card);
        });
    }
}

// Show no results message
function showNoResults() {
    const resumeGrid = document.getElementById('resumeGrid');
    const noResults = document.getElementById('noResults');

    if (resumeGrid) resumeGrid.style.display = 'none';
    if (noResults) noResults.style.display = 'block';
}

// Update statistics
function updateStats(total = null, display = null) {
    const totalCount = document.getElementById('totalCount');
    const displayCount = document.getElementById('displayCount');
    const filterStatus = document.getElementById('filterStatus');

    if (total !== null && totalCount) {
        totalCount.textContent = total;
    }

    if (display !== null && displayCount) {
        displayCount.textContent = display;
    } else if (displayCount) {
        displayCount.textContent = filteredResumes.length;
    }

    // Update filter status
    const searchInput = document.getElementById('searchInput');
    const experienceFilter = document.getElementById('experienceFilter');

    let filters = [];
    if (searchInput && searchInput.value) {
        filters.push('Search active');
    }
    if (experienceFilter && experienceFilter.value) {
        filters.push('Experience filtered');
    }

    if (filterStatus) {
        filterStatus.textContent = filters.length > 0 ? filters.join(', ') : 'No filters applied';
    }
}

// Refresh list
function refreshList() {
    clearAllFilters();
    loadResumesFromAPI();
    showToast('success', 'Resume list refreshed');
}

// Clear all filters
function clearAllFilters() {
    // Clear search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';

    // Clear filters
    const experienceFilter = document.getElementById('experienceFilter');
    if (experienceFilter) experienceFilter.value = '';

    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) sortFilter.value = 'newest';

    // Hide clear search button
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    if (clearSearchBtn) clearSearchBtn.style.display = 'none';

    // Reset
    filteredResumes = [...allResumes];
    displayFilteredResumes();
    updateStats();
}

// View resume details
async function viewResume(resumeId) {
    try {
        // Fetch resume details from API - use /{id} endpoint
        const response = await fetch(`${API_BASE_URL}/${resumeId}`, {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status && result.data) {
            displayResumeModal(result.data);
        } else {
            showToast('error', 'Resume details not found');
        }

    } catch (error) {
        console.error('Error fetching resume details:', error);
        showToast('error', 'Failed to load resume details');
    }
}

// Display resume in modal
function displayResumeModal(resume) {
    const modalContent = document.getElementById('resumeDetailContent');

    if (!modalContent) return;

    // Build detailed HTML
    const detailHTML = `
        <div class="resume-detail-view">
            <div class="row">
                <div class="col-md-4 text-center mb-4">
                    ${resume.ProfileImage ?
            `<img src="/${resume.ProfileImage.replace(/\\/g, '/')}" class="img-fluid rounded mb-3" style="max-width: 200px;">` :
            `<div class="profile-placeholder mx-auto mb-3" style="width: 150px; height: 150px; font-size: 60px;">${resume.FullName.charAt(0)}</div>`
        }
                    <h4>${resume.FullName}</h4>
                    <p class="text-muted">${resume.DeveloperType || 'Developer'}</p>
                </div>
                <div class="col-md-8">
                    <h5>Contact Information</h5>
                    <p><strong>Email:</strong> ${resume.Email}</p>
                    <p><strong>Phone:</strong> ${resume.PhoneNumber || 'N/A'}</p>
                    <p><strong>Address:</strong> ${resume.Address || resume.Country || 'N/A'}</p>
                    ${resume.LinkedIn ? `
                        <p><strong>LinkedIn:</strong> 
                            <a href="${normalizeUrl(resume.LinkedIn)}" 
                               target="_blank" 
                               rel="noopener noreferrer">
                               LinkedIn Profile
                            </a>
                        </p>
                    ` : ''}
                    ${resume.GitHub ? `
                        <p><strong>GitHub:</strong> 
                            <a href="${normalizeUrl(resume.GitHub)}" 
                               target="_blank" 
                               rel="noopener noreferrer">
                               GitHub Profile
                            </a>
                        </p>
                    ` : ''}
                </div>
            </div>

            <hr>

            ${resume.Summary ? `
                <div class="mb-4">
                    <h5>Professional Summary</h5>
                    <p>${resume.Summary}</p>
                </div>
            ` : ''}

            ${resume.Objective ? `
                <div class="mb-4">
                    <h5>Objective</h5>
                    <p>${resume.Objective}</p>
                </div>
            ` : ''}

            ${resume.Skills ? `
                <div class="mb-4">
                    <h5>Skills</h5>
                    <div class="skills-tags">
                        ${resume.Skills.split(',').map(skill => `<span class="skill-tag">${skill.trim()}</span>`).join('')}
                    </div>
                </div>
            ` : ''}

            ${resume.TotalExperience || resume.ExperienceDescription ? `
                <div class="mb-4">
                    <h5>Experience</h5>
                    ${resume.TotalExperience ? `<p><strong>Total Experience:</strong> ${resume.TotalExperience}</p>` : ''}
                    ${resume.ExperienceTitle ? `<p><strong>Title:</strong> ${resume.ExperienceTitle}</p>` : ''}
                    ${resume.ExperienceCompany ? `<p><strong>Company:</strong> ${resume.ExperienceCompany}</p>` : ''}
                    ${resume.ExperienceDuration ? `<p><strong>Duration:</strong> ${resume.ExperienceDuration}</p>` : ''}
                    ${resume.ExperienceDescription ? `<p>${resume.ExperienceDescription}</p>` : ''}
                </div>
            ` : ''}

            ${resume.Education1 || resume.Education2 || resume.Education3 ? `
                <div class="mb-4">
                    <h5>Education</h5>
                    ${resume.Education1 ? `<p>• ${resume.Education1}</p>` : ''}
                    ${resume.Education2 ? `<p>• ${resume.Education2}</p>` : ''}
                    ${resume.Education3 ? `<p>• ${resume.Education3}</p>` : ''}
                </div>
            ` : ''}

            ${resume.Project1 || resume.Project2 ? `
                <div class="mb-4">
                    <h5>Projects</h5>
                    ${resume.Project1 ? `<p>• ${resume.Project1}</p>` : ''}
                    ${resume.Project2 ? `<p>• ${resume.Project2}</p>` : ''}
                </div>
            ` : ''}

            ${resume.Languages ? `
                <div class="mb-4">
                    <h5>Languages</h5>
                    <p>${resume.Languages}</p>
                </div>
            ` : ''}

            ${resume.Certifications ? `
                <div class="mb-4">
                    <h5>Certifications</h5>
                    <p>${resume.Certifications}</p>
                </div>
            ` : ''}

            ${resume.ResumeFile ? `
                <div class="text-center mt-4">
                    <button class="btn btn-primary btn-download-resume-modal" data-resume-file="${resume.ResumeFile}">
                        <i class="bi bi-download"></i> Download Full Resume
                    </button>
                </div>
            ` : ''}
        </div>
    `;

    modalContent.innerHTML = detailHTML;

    // Add event listener for download button in modal
    const downloadBtnModal = modalContent.querySelector('.btn-download-resume-modal');
    if (downloadBtnModal) {
        downloadBtnModal.addEventListener('click', function () {
            const resumeFile = this.getAttribute('data-resume-file');
            if (resumeFile) {
                downloadResume(resumeFile);
            }
        });
    }

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('resumeDetailModal'));
    modal.show();
}

// Download resume
function downloadResume(filename) {
    if (!filename) {
        showToast('error', 'Resume file not available');
        return;
    }

    const downloadUrl = `/${filename.replace(/\\/g, '/')}`;
    window.open(downloadUrl, '_blank');
    showToast('success', 'Downloading resume...');
}

// Export list
function exportList() {
    showToast('info', 'Export functionality coming soon');
}

// Utility: Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Toast notification
function showToast(type, message) {
    const backgrounds = {
        success: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        error: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        info: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        warning: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    };

    if (typeof Toastify !== 'undefined') {
        Toastify({
            text: message,
            duration: 3000,
            gravity: 'top',
            position: 'right',
            style: {
                background: backgrounds[type] || backgrounds.info
            }
        }).showToast();
    } else {
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}