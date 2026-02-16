// frontend/static/js/resume/resume_crud.js

const API_BASE_URL  = 'http://127.0.0.1:8000/api/resumes';
let currentUserId   = null;
let currentResumeId = null;
let isUpdateMode    = false;

// ─────────────────────────────────────────
// DOM refs
// ─────────────────────────────────────────
const loadingState       = document.getElementById('loadingState');
const noResumeState      = document.getElementById('noResumeState');
const resumeDisplayState = document.getElementById('resumeDisplayState');
const resumeFormState    = document.getElementById('resumeFormState');
const createResumeBtn    = document.getElementById('createResumeBtn');
const updateResumeBtn    = document.getElementById('updateResumeBtn');
const deleteResumeBtn    = document.getElementById('deleteResumeBtn');
const downloadResumeBtn  = document.getElementById('downloadResumeBtn');
const cancelFormBtn      = document.getElementById('cancelFormBtn');
const cancelBtn          = document.getElementById('cancelBtn');
const resumeForm         = document.getElementById('resumeForm');
const formTitle          = document.getElementById('formTitle');

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
// Toast helpers — always show backend message
// ─────────────────────────────────────────
function toast(type, message, title) {
    toastr[type](message, title || '');
}

// Reads message from backend ResponseSchema and picks success/error
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

    await loadUserResume();
    setupEventListeners();
    setupFormValidation();
    setupDateOfBirthMax();
});

// ─────────────────────────────────────────
// 1. Read user from localStorage (SIMPLIFIED - NO PROFILE IMAGE)
//    Keys: user_id, access_token
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
    createResumeBtn.addEventListener('click',  () => showForm(false));
    updateResumeBtn.addEventListener('click',  () => showForm(true));
    deleteResumeBtn.addEventListener('click',  handleDelete);
    cancelFormBtn.addEventListener('click',    hideForm);
    cancelBtn.addEventListener('click',        hideForm);
    resumeForm.addEventListener('submit',      handleSubmit);
}

// ─────────────────────────────────────────
// 4. Download button
// ─────────────────────────────────────────
function setDownloadButton(userId) {
    if (downloadResumeBtn && userId) {
        downloadResumeBtn.href = `/resume/download/${userId}`;
    }
}

// ─────────────────────────────────────────
// 5. Load resume
//    GET /api/resumes/by-user-id?user_id=X
// ─────────────────────────────────────────
async function loadUserResume() {
    showState('loading');

    try {
        const response = await fetch(
            `${API_BASE_URL}/by-user-id?user_id=${currentUserId}`,
            { headers: authHeaders() }
        );

        if (response.status === 401) {
            toast('error', 'Session expired. Please log in again.');
            setTimeout(() => window.location.href = '/', 2000);
            return;
        }

        const result = await response.json();

        if (result.status && result.data) {
            currentResumeId = result.data.Id;
            displayResume(result.data);
            setDownloadButton(currentUserId);
            showState('display');
        } else {
            // Backend returns status:false when no resume found — normal case
            showState('noResume');
        }

    } catch (error) {
        console.error('Error loading resume:', error);
        toast('error', 'Failed to load resume. Please refresh the page.');
        showState('noResume');
    }
}

// ─────────────────────────────────────────
// 6. Display helpers
// ─────────────────────────────────────────
function showHideSection(sectionId, hasContent) {
    const el = document.getElementById(sectionId);
    if (el) el.style.display = hasContent ? 'block' : 'none';
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || '';
}

function showHideElement(id, shouldShow) {
    const el = document.getElementById(id);
    if (el) el.style.display = shouldShow ? 'flex' : 'none';
}

function setLink(id, url) {
    const el = document.getElementById(id);
    if (!el) return;
    if (url && url.trim()) {
        let href = url.trim();
        if (!href.startsWith('http://') && !href.startsWith('https://')) href = 'https://' + href;
        el.href          = href;
        el.style.display = 'inline-flex';
    } else {
        el.style.display = 'none';
    }
}

// ─────────────────────────────────────────
// 7. Render resume into display view (UPDATED)
// ─────────────────────────────────────────
function displayResume(resume) {
    // Header info
    setText('displayFullName', resume.FullName);
    setText('displayEmail', resume.Email || 'N/A');
    
    // Phone
    if (resume.PhoneNumber) {
        setText('displayPhoneNumber', resume.PhoneNumber);
        showHideElement('phoneMetaItem', true);
    } else {
        showHideElement('phoneMetaItem', false);
    }
    
    // Address
    if (resume.Address) {
        setText('displayAddress', resume.Address);
        showHideElement('addressMetaItem', true);
    } else {
        showHideElement('addressMetaItem', false);
    }
    
    // Developer Type Badge
    if (resume.DeveloperType) {
        setText('displayDeveloperType', resume.DeveloperType);
        showHideElement('developerTypeBadge', true);
    } else {
        showHideElement('developerTypeBadge', false);
    }

    // Contact Information Section
    setText('displayDateOfBirth', resume.DateOfBirth || 'N/A');
    
    if (resume.Country) {
        setText('displayCountry', resume.Country);
        showHideElement('countryItem', true);
    } else {
        showHideElement('countryItem', false);
    }
    
    if (resume.Nationality) {
        setText('displayNationality', resume.Nationality);
        showHideElement('nationalityItem', true);
    } else {
        showHideElement('nationalityItem', false);
    }
    
    if (resume.Gender) {
        setText('displayGender', resume.Gender);
        showHideElement('genderItem', true);
    } else {
        showHideElement('genderItem', false);
    }

    // Summary / Objective / Skills
    showHideSection('summarySection',   resume.Summary);
    setText('displaySummary',   resume.Summary);
    showHideSection('objectiveSection', resume.Objective);
    setText('displayObjective', resume.Objective);
    showHideSection('skillsSection',    resume.Skills);
    setText('displaySkills',    resume.Skills);

    // Experience
    const hasExp = resume.ExperienceTitle || resume.ExperienceCompany ||
                   resume.ExperienceDuration || resume.ExperienceDescription;
    showHideSection('experienceSection', hasExp);
    if (hasExp) {
        setText('displayExperienceTitle',       resume.ExperienceTitle);
        setText('displayExperienceCompany',     resume.ExperienceCompany);
        setText('displayExperienceDuration',    resume.ExperienceDuration);
        setText('displayExperienceDescription', resume.ExperienceDescription);
    }

    // Education
    const hasEdu = resume.Education1 || resume.Education2 || resume.Education3;
    showHideSection('educationSection', hasEdu);
    if (hasEdu) {
        ['Education1', 'Education2', 'Education3'].forEach((key, i) => {
            const el = document.getElementById(`displayEducation${i + 1}`);
            if (el) {
                el.textContent   = resume[key] || '';
                el.style.display = resume[key] ? 'list-item' : 'none';
            }
        });
    }

    // Projects
    const hasProj = resume.Project1 || resume.Project2;
    showHideSection('projectsSection', hasProj);
    if (hasProj) {
        ['Project1', 'Project2'].forEach((key, i) => {
            const el = document.getElementById(`displayProject${i + 1}`);
            if (el) {
                el.textContent   = resume[key] || '';
                el.style.display = resume[key] ? 'list-item' : 'none';
            }
        });
    }

    // Links
    showHideSection('linksSection', resume.LinkedIn || resume.GitHub);
    setLink('displayLinkedIn', resume.LinkedIn);
    setLink('displayGitHub',   resume.GitHub);
}

// ─────────────────────────────────────────
// 8. Form visibility
// ─────────────────────────────────────────
function showForm(updateMode) {
    isUpdateMode          = updateMode;
    formTitle.textContent = updateMode ? 'Update Resume' : 'Create Resume';

    if (updateMode) {
        populateFormWithResumeData();
    } else {
        resumeForm.reset();
        clearValidation();
    }

    showState('form');
    window.scrollTo(0, 0);
}

function hideForm() {
    showState(currentResumeId ? 'display' : 'noResume');
}

// ─────────────────────────────────────────
// 9. Populate form for update
//     GET /api/resumes/by-id?resume_id=X
// ─────────────────────────────────────────
async function populateFormWithResumeData() {
    if (!currentResumeId) return;

    try {
        const response = await fetch(
            `${API_BASE_URL}/by-id?resume_id=${currentResumeId}`,
            { headers: authHeaders() }
        );
        const result = await response.json();

        if (!result.status || !result.data) {
            toast('error', result.message || 'Failed to load resume for editing.');
            return;
        }

        const r = result.data;

        const fieldMap = {
            fullName:              r.FullName,
            email:                 r.Email,
            phoneNumber:           r.PhoneNumber,
            dateOfBirth:           r.DateOfBirth,
            gender:                r.Gender,
            country:               r.Country,
            nationality:           r.Nationality,
            address:               r.Address,
            developerType:         r.DeveloperType,
            summary:               r.Summary,
            objective:             r.Objective,
            skills:                r.Skills,
            experienceTitle:       r.ExperienceTitle,
            experienceCompany:     r.ExperienceCompany,
            experienceDuration:    r.ExperienceDuration,
            totalExperience:       r.TotalExperience,
            experienceDescription: r.ExperienceDescription,
            education1:            r.Education1,
            education2:            r.Education2,
            education3:            r.Education3,
            project1:              r.Project1,
            project2:              r.Project2,
            languages:             r.Languages,
            linkedIn:              r.LinkedIn,
            gitHub:                r.GitHub,
            certifications:        r.Certifications
        };

        Object.entries(fieldMap).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.value = value || '';
        });

    } catch (error) {
        console.error('Error populating form:', error);
        toast('error', 'Network error. Could not load resume data.');
    }
}

// ─────────────────────────────────────────
// 10. Submit — create or update
//     POST /api/resumes/create
//     PUT  /api/resumes/update?resume_id=X
// ─────────────────────────────────────────
async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData(resumeForm);
    const data     = {};
    for (const [key, value] of formData.entries()) {
        data[key] = value.trim() !== '' ? value.trim() : null;
    }
    data.UserId = Number(currentUserId);

    try {
        let response;

        if (isUpdateMode) {
            // PUT /api/resumes/update?resume_id=X
            response = await fetch(
                `${API_BASE_URL}/update?resume_id=${currentResumeId}`,
                { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) }
            );
        } else {
            // Soft-delete old resume if one somehow exists
            if (currentResumeId) await softDeleteResume(currentResumeId);

            // POST /api/resumes/create
            response = await fetch(
                `${API_BASE_URL}/create`,
                { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }
            );
        }

        const result = await response.json();
        toastFromResponse(result, 'Resume saved successfully!', 'Failed to save resume.');

        if (result.status) {
            await loadUserResume();
        }

    } catch (error) {
        console.error('Submit error:', error);
        toast('error', 'Network error. Please try again.');
    }
}

// ─────────────────────────────────────────
// 11. Delete
//     DELETE /api/resumes/delete?resume_id=X
// ─────────────────────────────────────────
async function softDeleteResume(resumeId) {
    try {
        await fetch(
            `${API_BASE_URL}/delete?resume_id=${resumeId}`,
            { method: 'DELETE', headers: authHeaders() }
        );
    } catch (err) {
        console.error('Soft delete error:', err);
    }
}

async function handleDelete() {
    const confirm = await Swal.fire({
        title:              'Delete Resume?',
        text:               'This action cannot be undone.',
        icon:               'warning',
        showCancelButton:   true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor:  '#6c757d',
        confirmButtonText:  'Yes, delete it!',
        cancelButtonText:   'Cancel'
    });

    if (!confirm.isConfirmed) return;

    try {
        const response = await fetch(
            `${API_BASE_URL}/delete?resume_id=${currentResumeId}`,
            { method: 'DELETE', headers: authHeaders() }
        );

        const result = await response.json();
        toastFromResponse(result, 'Resume deleted successfully!', 'Failed to delete resume.');

        if (result.status) {
            currentResumeId = null;
            showState('noResume');
        }

    } catch (error) {
        console.error('Delete error:', error);
        toast('error', 'Network error. Could not delete resume.');
    }
}

// ─────────────────────────────────────────
// 12. State machine
// ─────────────────────────────────────────
function showState(state) {
    [loadingState, noResumeState, resumeDisplayState, resumeFormState]
        .forEach(el => { if (el) el.style.display = 'none'; });

    const map = {
        loading:  loadingState,
        noResume: noResumeState,
        display:  resumeDisplayState,
        form:     resumeFormState
    };

    if (map[state]) map[state].style.display = 'block';
}

// ─────────────────────────────────────────
// 13. Validation
// ─────────────────────────────────────────
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function clearValidation() {
    document.querySelectorAll('#resumeForm .is-invalid')
            .forEach(el => el.classList.remove('is-invalid'));
}

function validateForm() {
    clearValidation();
    let isValid = true;

    const required = [
        { id: 'fullName' },
        { id: 'email' },
        { id: 'skills' },
        { id: 'developerType' },
        { id: 'gender' },
        { id: 'dateOfBirth' },
        { id: 'address' }
    ];

    required.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (!el || !el.value.trim()) {
            if (el) el.classList.add('is-invalid');
            isValid = false;
        }
    });

    // Email format
    const emailEl = document.getElementById('email');
    if (emailEl && emailEl.value.trim() && !validateEmail(emailEl.value.trim())) {
        emailEl.classList.add('is-invalid');
        isValid = false;
    }

    if (!isValid) {
        toast('warning', 'Please fill in all required fields correctly.');
        const first = document.querySelector('#resumeForm .is-invalid');
        if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return isValid;
}

function setupFormValidation() {
    document.querySelectorAll('#resumeForm .form-control').forEach(el => {
        el.addEventListener('input',  () => el.classList.remove('is-invalid'));
        el.addEventListener('change', () => el.classList.remove('is-invalid'));
    });
}

// ─────────────────────────────────────────
// 14. Set max date for Date of Birth (15 years ago)
// ─────────────────────────────────────────
function setupDateOfBirthMax() {
    const dobInput = document.getElementById('dateOfBirth');
    if (!dobInput) return;

    const today = new Date();
    const fifteenYearsAgo = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate());

    // Format as yyyy-mm-dd
    const yyyy = fifteenYearsAgo.getFullYear();
    const mm   = String(fifteenYearsAgo.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd   = String(fifteenYearsAgo.getDate()).padStart(2, '0');

    const maxDate = `${yyyy}-${mm}-${dd}`;
    dobInput.max = maxDate;

    // Optionally, set default value to 15 years ago
    dobInput.value = maxDate;
}