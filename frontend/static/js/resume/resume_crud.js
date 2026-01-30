// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api';
let currentUserId = null;
let currentResumeId = null;
let isUpdateMode = false;

// DOM Elements
const loadingState = document.getElementById('loadingState');
const noResumeState = document.getElementById('noResumeState');
const resumeDisplayState = document.getElementById('resumeDisplayState');
const resumeFormState = document.getElementById('resumeFormState');

const createResumeBtn = document.getElementById('createResumeBtn');
const updateResumeBtn = document.getElementById('updateResumeBtn');
const deleteResumeBtn = document.getElementById('deleteResumeBtn');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const cancelBtn = document.getElementById('cancelBtn');
const resumeForm = document.getElementById('resumeForm');
const formTitle = document.getElementById('formTitle');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await fetchCurrentUser();
    await loadUserResume();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    createResumeBtn.addEventListener('click', () => showForm(false));
    updateResumeBtn.addEventListener('click', () => showForm(true));
    deleteResumeBtn.addEventListener('click', handleDelete);
    cancelFormBtn.addEventListener('click', hideForm);
    cancelBtn.addEventListener('click', hideForm);
    resumeForm.addEventListener('submit', handleSubmit);
}

// Fetch Current User
async function fetchCurrentUser() {
    try {
        const response = await fetch(`${API_BASE_URL}/users/current-user`);
        if (!response.ok) throw new Error('Failed to fetch user');
        
        const data = await response.json();
        currentUserId = data.UserId;
        
        // Store in localStorage
        localStorage.setItem('userId', currentUserId);
        
        console.log('Current User ID:', currentUserId);
    } catch (error) {
        console.error('Error fetching user:', error);
        toastr.error('Failed to fetch user information');
    }
}

// Load User Resume
async function loadUserResume() {
    if (!currentUserId) {
        toastr.error('User ID not found');
        showState('noResume');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/resumes/user/${currentUserId}`);
        
        if (response.ok) {
            const result = await response.json();
            if (result.status && result.data) {
                currentResumeId = result.data.Id;
                displayResume(result.data);
                showState('display');
            } else {
                showState('noResume');
            }
        } else if (response.status === 404) {
            showState('noResume');
        } else {
            throw new Error('Failed to fetch resume');
        }
    } catch (error) {
        console.error('Error loading resume:', error);
        showState('noResume');
    }
}

// Display Resume Data
function displayResume(resume) {
    // Profile Section
    const profileImage = document.getElementById('displayProfileImage');
    if (resume.ProfileImage) {
        profileImage.src = '/' + resume.ProfileImage.replace(/\\/g, '/');
    } else {
        profileImage.src = '/static/images/default-avatar.png';
    }
    
    document.getElementById('displayFullName').textContent = resume.FullName || '';
    document.getElementById('displayDeveloperType').textContent = resume.DeveloperType || '';

    // Contact Information
    document.getElementById('displayEmail').textContent = resume.Email || '';
    document.getElementById('displayPhoneNumber').textContent = resume.PhoneNumber || '';
    document.getElementById('displayAddress').textContent = resume.Address || '';
    document.getElementById('displayDateOfBirth').textContent = resume.DateOfBirth || '';

    // Professional Info
    document.getElementById('displaySummary').textContent = resume.Summary || '';
    document.getElementById('displayObjective').textContent = resume.Objective || '';
    document.getElementById('displaySkills').textContent = resume.Skills || '';

    // Experience
    document.getElementById('displayExperienceTitle').textContent = resume.ExperienceTitle || '';
    document.getElementById('displayExperienceCompany').textContent = resume.ExperienceCompany || '';
    document.getElementById('displayExperienceDuration').textContent = resume.ExperienceDuration || '';
    document.getElementById('displayExperienceDescription').textContent = resume.ExperienceDescription || '';

    // Education
    const edu1 = document.getElementById('displayEducation1');
    const edu2 = document.getElementById('displayEducation2');
    const edu3 = document.getElementById('displayEducation3');
    
    edu1.textContent = resume.Education1 || '';
    edu2.textContent = resume.Education2 || '';
    edu3.textContent = resume.Education3 || '';
    
    edu1.style.display = resume.Education1 ? 'list-item' : 'none';
    edu2.style.display = resume.Education2 ? 'list-item' : 'none';
    edu3.style.display = resume.Education3 ? 'list-item' : 'none';

    // Projects
    const proj1 = document.getElementById('displayProject1');
    const proj2 = document.getElementById('displayProject2');
    
    proj1.textContent = resume.Project1 || '';
    proj2.textContent = resume.Project2 || '';
    
    proj1.style.display = resume.Project1 ? 'list-item' : 'none';
    proj2.style.display = resume.Project2 ? 'list-item' : 'none';

    // Links
    const linkedInLink = document.getElementById('displayLinkedIn');
    const gitHubLink = document.getElementById('displayGitHub');
    
    if (resume.LinkedIn) {
        linkedInLink.href = resume.LinkedIn;
        linkedInLink.style.display = 'inline-block';
    } else {
        linkedInLink.style.display = 'none';
    }
    
    if (resume.GitHub) {
        gitHubLink.href = resume.GitHub;
        gitHubLink.style.display = 'inline-block';
    } else {
        gitHubLink.style.display = 'none';
    }
}

// Show Form
function showForm(updateMode) {
    isUpdateMode = updateMode;
    formTitle.textContent = updateMode ? 'Update Resume' : 'Create Resume';
    
    if (updateMode) {
        populateFormWithResumeData();
    } else {
        resumeForm.reset();
    }
    
    showState('form');
    window.scrollTo(0, 0);
}

// Populate Form with Existing Data
async function populateFormWithResumeData() {
    if (!currentResumeId) return;

    try {
        const response = await fetch(`${API_BASE_URL}/resumes/${currentResumeId}`);
        if (!response.ok) throw new Error('Failed to fetch resume');
        
        const result = await response.json();
        const resume = result.data;

        // Populate all form fields
        document.getElementById('fullName').value = resume.FullName || '';
        document.getElementById('email').value = resume.Email || '';
        document.getElementById('phoneNumber').value = resume.PhoneNumber || '';
        document.getElementById('dateOfBirth').value = resume.DateOfBirth || '';
        document.getElementById('gender').value = resume.Gender || '';
        document.getElementById('country').value = resume.Country || '';
        document.getElementById('nationality').value = resume.Nationality || '';
        document.getElementById('address').value = resume.Address || '';
        document.getElementById('developerType').value = resume.DeveloperType || '';
        document.getElementById('summary').value = resume.Summary || '';
        document.getElementById('objective').value = resume.Objective || '';
        document.getElementById('skills').value = resume.Skills || '';
        document.getElementById('experienceTitle').value = resume.ExperienceTitle || '';
        document.getElementById('experienceCompany').value = resume.ExperienceCompany || '';
        document.getElementById('experienceDuration').value = resume.ExperienceDuration || '';
        document.getElementById('totalExperience').value = resume.TotalExperience || '';
        document.getElementById('experienceDescription').value = resume.ExperienceDescription || '';
        document.getElementById('education1').value = resume.Education1 || '';
        document.getElementById('education2').value = resume.Education2 || '';
        document.getElementById('education3').value = resume.Education3 || '';
        document.getElementById('project1').value = resume.Project1 || '';
        document.getElementById('project2').value = resume.Project2 || '';
        document.getElementById('languages').value = resume.Languages || '';
        document.getElementById('linkedIn').value = resume.LinkedIn || '';
        document.getElementById('gitHub').value = resume.GitHub || '';
        document.getElementById('certifications').value = resume.Certifications || '';
    } catch (error) {
        console.error('Error populating form:', error);
        toastr.error('Failed to load resume data');
    }
}

// Hide Form
function hideForm() {
    if (currentResumeId) {
        showState('display');
    } else {
        showState('noResume');
    }
}

// Handle Form Submit
async function handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(resumeForm);
    const data = {};
    
    // Convert FormData to JSON
    for (let [key, value] of formData.entries()) {
        data[key] = value || null;
    }
    
    // Add UserId
    data.UserId = currentUserId;
    
    // Remove empty strings, replace with null
    Object.keys(data).forEach(key => {
        if (data[key] === '') {
            data[key] = null;
        }
    });

    try {
        let response;
        
        if (isUpdateMode) {
            // Update existing resume
            response = await fetch(`${API_BASE_URL}/resumes/resumes/${currentResumeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
        } else {
            // Soft delete existing resume if any, then create new one
            if (currentResumeId) {
                await softDeleteExistingResume();
            }
            
            // Create new resume
            response = await fetch(`${API_BASE_URL}/resumes/resumes/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
        }

        if (!response.ok) {
            throw new Error('Failed to save resume');
        }

        const result = await response.json();
        toastr.success(isUpdateMode ? 'Resume updated successfully!' : 'Resume created successfully!');
        
        // Reload resume data
        await loadUserResume();
        
    } catch (error) {
        console.error('Error saving resume:', error);
        toastr.error('Failed to save resume');
    }
}

// Soft Delete Existing Resume
async function softDeleteExistingResume() {
    try {
        const response = await fetch(`${API_BASE_URL}/resumes/resumes/${currentResumeId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete existing resume');
        }
        
        console.log('Previous resume soft deleted');
    } catch (error) {
        console.error('Error deleting existing resume:', error);
    }
}

// Handle Delete
async function handleDelete() {
    // Use SweetAlert2 for confirmation
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to delete this resume?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/resumes/resumes/${currentResumeId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete resume');
        }

        toastr.success('Resume deleted successfully!');
        currentResumeId = null;
        showState('noResume');
    } catch (error) {
        console.error('Error deleting resume:', error);
        toastr.error('Failed to delete resume');
    }
}

// Show State
function showState(state) {
    loadingState.style.display = 'none';
    noResumeState.style.display = 'none';
    resumeDisplayState.style.display = 'none';
    resumeFormState.style.display = 'none';

    switch (state) {
        case 'loading':
            loadingState.style.display = 'block';
            break;
        case 'noResume':
            noResumeState.style.display = 'block';
            break;
        case 'display':
            resumeDisplayState.style.display = 'block';
            break;
        case 'form':
            resumeFormState.style.display = 'block';
            break;
    }
}