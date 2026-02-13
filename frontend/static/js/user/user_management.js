// frontend/static/js/user/user_management.js

const API_BASE_URL = 'http://127.0.0.1:8000/api/users';
let allUsers = [];
let filteredUsers = [];
let availableRoles = [];
let currentPage = 1;
let usersPerPage = 12;
let isUpdateMode = false;
let currentEditUserId = null;

// ─────────────────────────────────────────
// DOM refs
// ─────────────────────────────────────────
const loadingState = document.getElementById('loadingState');
const userListState = document.getElementById('userListState');
const userFormState = document.getElementById('userFormState');
const createUserBtn = document.getElementById('createUserBtn');
const userCardsContainer = document.getElementById('userCardsContainer');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const cancelBtn = document.getElementById('cancelBtn');
const userForm = document.getElementById('userForm');
const formTitle = document.getElementById('formTitle');
const searchInput = document.getElementById('searchInput');
const roleFilter = document.getElementById('roleFilter');
const statusFilter = document.getElementById('statusFilter');
const applyFiltersBtn = document.getElementById('applyFiltersBtn');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageInfo = document.getElementById('pageInfo');
const paginationContainer = document.getElementById('paginationContainer');
const roleCheckboxes = document.getElementById('roleCheckboxes');

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

function toastFromResponse(result, fallbackSuccess, fallbackError) {
    const msg = result?.message || (result?.status ? fallbackSuccess : fallbackError);
    const type = result?.status ? 'success' : 'error';
    toast(type, msg);
}

// ─────────────────────────────────────────
// Auth headers
// ─────────────────────────────────────────
function authHeaders() {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

// ─────────────────────────────────────────
// Init
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
        toast('error', 'Session expired. Please log in again.');
        setTimeout(() => window.location.href = '/', 2000);
        return;
    }

    await loadRoles();
    await loadUsers();
    setupEventListeners();
    setupFormValidation();
});

// ─────────────────────────────────────────
// Event listeners
// ─────────────────────────────────────────
function setupEventListeners() {
    createUserBtn.addEventListener('click', () => showForm(false));
    cancelFormBtn.addEventListener('click', hideForm);
    cancelBtn.addEventListener('click', hideForm);
    userForm.addEventListener('submit', handleSubmit);
    
    // Apply filters on button click
    applyFiltersBtn.addEventListener('click', handleFilters);
    
    // Reset filters
    resetFiltersBtn.addEventListener('click', resetFilters);
    
    // Allow Enter key in search box to apply filters
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleFilters();
        }
    });
    
    prevPageBtn.addEventListener('click', () => changePage(-1));
    nextPageBtn.addEventListener('click', () => changePage(1));
}

// ─────────────────────────────────────────
// Check if user is SuperAdmin
// ─────────────────────────────────────────
function isSuperAdmin(user) {
    // Check by email
    if (user.Email && user.Email.toLowerCase() === 'superadmin') {
        return true;
    }
    
    // Check by name
    const fullName = `${user.FirstName} ${user.LastName}`.toLowerCase();
    if (fullName.includes('super') && fullName.includes('admin')) {
        return true;
    }
    
    // Check by role
    if (user.Roles && user.Roles.some(role => role.Name.toLowerCase() === 'superadmin')) {
        return true;
    }
    
    return false;
}

// ─────────────────────────────────────────
// Load Roles
// ─────────────────────────────────────────
async function loadRoles() {
    try {
        const response = await fetch(`${API_BASE_URL}/roles/list`, {
            headers: authHeaders()
        });

        if (response.status === 401) {
            toast('error', 'Session expired. Please log in again.');
            setTimeout(() => window.location.href = '/', 2000);
            return;
        }

        const result = await response.json();

        if (result.status && result.data) {
            availableRoles = result.data;
            renderRoleCheckboxes();
        }

    } catch (error) {
        console.error('Error loading roles:', error);
        toast('error', 'Failed to load roles.');
    }
}

// ─────────────────────────────────────────
// Render Role Checkboxes
// ─────────────────────────────────────────
function renderRoleCheckboxes() {
    roleCheckboxes.innerHTML = '';
    
    availableRoles.forEach(role => {
        const checkbox = document.createElement('div');
        checkbox.className = 'role-checkbox-item';
        checkbox.innerHTML = `
            <input type="checkbox" id="role_${role.Id}" name="roleIds" value="${role.Id}">
            <label for="role_${role.Id}">${role.Name}</label>
        `;
        roleCheckboxes.appendChild(checkbox);
    });
}

// ─────────────────────────────────────────
// Load Users
// ─────────────────────────────────────────
async function loadUsers() {
    showState('loading');

    try {
        const response = await fetch(`${API_BASE_URL}/list`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
                search: '',
                skipCount: 0,
                maxCount: 1000
            })
        });

        if (response.status === 401) {
            toast('error', 'Session expired. Please log in again.');
            setTimeout(() => window.location.href = '/', 2000);
            return;
        }

        const result = await response.json();

        if (result.status && result.data) {
            allUsers = result.data.item || [];
            
            filteredUsers = [...allUsers];
            currentPage = 1;
            renderUsers();
            showState('userList');
        } else {
            toast('error', result.message || 'Failed to load users.');
            showState('userList');
        }

    } catch (error) {
        console.error('Error loading users:', error);
        toast('error', 'Failed to load users. Please refresh the page.');
        showState('userList');
    }
}

// ─────────────────────────────────────────
// Handle Filters - FIXED
// ─────────────────────────────────────────
function handleFilters() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const roleFilterValue = roleFilter.value;
    const statusFilterValue = statusFilter.value;

    filteredUsers = allUsers.filter(user => {
        // Search filter
        const matchesSearch = !searchTerm || 
            (user.FirstName && user.FirstName.toLowerCase().includes(searchTerm)) ||
            (user.LastName && user.LastName.toLowerCase().includes(searchTerm)) ||
            (user.Email && user.Email.toLowerCase().includes(searchTerm)) ||
            (user.PhoneNumber && user.PhoneNumber.toLowerCase().includes(searchTerm)) ||
            (user.Roles && user.Roles.some(role => role.Name.toLowerCase().includes(searchTerm)));

        // Role filter
        const matchesRole = !roleFilterValue || 
            (user.Roles && user.Roles.some(role => role.Name === roleFilterValue));

        // Status filter - FIXED: Check boolean directly
        let matchesStatus = true;
        if (statusFilterValue === 'active') {
            matchesStatus = user.IsActive === true;
        } else if (statusFilterValue === 'inactive') {
            matchesStatus = user.IsActive === false;
        }

        return matchesSearch && matchesRole && matchesStatus;
    });

    currentPage = 1;
    renderUsers();
    
    toast('success', `Found ${filteredUsers.length} user(s)`, '');
}

// ─────────────────────────────────────────
// Reset Filters
// ─────────────────────────────────────────
function resetFilters() {
    searchInput.value = '';
    roleFilter.value = '';
    statusFilter.value = '';
    
    filteredUsers = [...allUsers];
    currentPage = 1;
    renderUsers();
    
    toast('info', 'Filters reset', '');
}

// ─────────────────────────────────────────
// Render Users
// ─────────────────────────────────────────
function renderUsers() {
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const usersToShow = filteredUsers.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    userCardsContainer.innerHTML = '';

    if (usersToShow.length === 0) {
        userCardsContainer.innerHTML = `
            <div class="no-users-found">
                <i class="bi bi-inbox"></i>
                <p>No users found</p>
            </div>
        `;
        paginationContainer.style.display = 'none';
        return;
    }

    usersToShow.forEach(user => {
        const card = createUserCard(user);
        userCardsContainer.appendChild(card);
    });

    // Update pagination
    if (totalPages > 1) {
        paginationContainer.style.display = 'flex';
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
    } else {
        paginationContainer.style.display = 'none';
    }
}

// ─────────────────────────────────────────
// Format Date
// ─────────────────────────────────────────
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// ─────────────────────────────────────────
// Create User Card - ENHANCED
// ─────────────────────────────────────────
function createUserCard(user) {
    const card = document.createElement('div');
    const isSuperAdminUser = isSuperAdmin(user);
    
    card.className = 'user-card';
    
    const initials = getInitials(user.FirstName, user.LastName);
    const statusClass = user.IsActive ? 'active' : 'inactive';
    const statusText = user.IsActive ? 'Active' : 'Inactive';
    const roles = user.Roles ? user.Roles.map(r => r.Name).join(', ') : 'No roles';
    
    // Get avatar color based on first letter
    const avatarColor = getAvatarColor(user.FirstName);

    card.innerHTML = `
        <div class="user-card-header">
            <div class="user-avatar">
                ${user.Image ? 
                    `<img src="${user.Image.startsWith('/') ? user.Image : '/' + user.Image.replace(/\\/g, '/')}" alt="${user.FirstName}">` :
                    `<div class="user-initials" style="background: ${avatarColor};">${initials}</div>`
                }
            </div>
            <div class="user-info">
                <h3 class="user-name">${user.FirstName} ${user.LastName}</h3>
                ${isSuperAdminUser ? '<div class="superadmin-badge"><i class="bi bi-shield-fill-check"></i> Super Admin</div>' : ''}
            </div>
            <div class="user-status-badge status-${statusClass}">${statusText}</div>
        </div>
        
        <div class="user-card-body">
            <div class="user-details">
                <div class="detail-item">
                    <i class="bi bi-envelope-fill"></i>
                    <span>${user.Email}</span>
                </div>
                ${user.PhoneNumber ? `
                    <div class="detail-item">
                        <i class="bi bi-telephone-fill"></i>
                        <span>${user.PhoneNumber}</span>
                    </div>
                ` : ''}
                <div class="detail-item">
                    <i class="bi bi-shield-check"></i>
                    <span>${roles}</span>
                </div>
                <div class="detail-item">
                    <i class="bi bi-calendar-check"></i>
                    <span>Joined: ${formatDate(user.CreatedAt)}</span>
                </div>
                ${user.CreatedBy ? `
                    <div class="detail-item">
                        <i class="bi bi-person-badge"></i>
                        <span>By: ${user.CreatedBy}</span>
                    </div>
                ` : ''}
            </div>
        </div>
        
        ${!isSuperAdminUser ? `
            <div class="user-card-actions">
                ${!user.IsActive ? `
                    <button class="btn btn-sm btn-info" onclick="resendConfirmation(${user.Id})" title="Resend confirmation email">
                        <i class="bi bi-envelope-check"></i>
                        <span>Resend</span>
                    </button>
                ` : ''}
                <button class="btn btn-sm btn-${user.IsActive ? 'warning' : 'success'}" onclick="toggleUserStatus(${user.Id}, ${user.IsActive})" title="${user.IsActive ? 'Deactivate user' : 'Activate user'}">
                    <i class="bi bi-${user.IsActive ? 'pause-circle' : 'play-circle'}"></i>
                    <span>${user.IsActive ? 'Deactivate' : 'Activate'}</span>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.Id})" title="Delete user permanently">
                    <i class="bi bi-trash"></i>
                    <span>Delete</span>
                </button>
            </div>
        ` : ''}
    `;

    return card;
}

// ─────────────────────────────────────────
// Get Initials - IMPROVED
// ─────────────────────────────────────────
function getInitials(firstName, lastName) {
    const first = firstName ? firstName.trim().charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.trim().charAt(0).toUpperCase() : '';
    return (first + last) || '??';
}

// ─────────────────────────────────────────
// Get Avatar Color - NEW
// ─────────────────────────────────────────
function getAvatarColor(name) {
    const colors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)'
    ];
    
    const firstChar = name ? name.trim().charAt(0).toUpperCase() : 'A';
    const index = firstChar.charCodeAt(0) % colors.length;
    return colors[index];
}

// ─────────────────────────────────────────
// Change Page
// ─────────────────────────────────────────
function changePage(direction) {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderUsers();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ─────────────────────────────────────────
// Show/Hide Form
// ─────────────────────────────────────────
function showForm(updateMode, userId = null) {
    isUpdateMode = updateMode;
    currentEditUserId = userId;
    formTitle.textContent = updateMode ? 'Update User' : 'Create New User';

    if (updateMode && userId) {
        populateFormWithUserData(userId);
    } else {
        userForm.reset();
        clearValidation();
        document.querySelectorAll('#roleCheckboxes input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
    }

    showState('form');
    window.scrollTo(0, 0);
}

function hideForm() {
    showState('userList');
    userForm.reset();
    clearValidation();
    isUpdateMode = false;
    currentEditUserId = null;
}

// ─────────────────────────────────────────
// Populate Form (for updates)
// ─────────────────────────────────────────
function populateFormWithUserData(userId) {
    const user = allUsers.find(u => u.Id === userId);
    if (!user) return;

    document.getElementById('firstName').value = user.FirstName || '';
    document.getElementById('lastName').value = user.LastName || '';
    document.getElementById('email').value = user.Email || '';
    document.getElementById('phone').value = user.PhoneNumber || '';

    document.querySelectorAll('#roleCheckboxes input[type="checkbox"]').forEach(cb => {
        const roleId = parseInt(cb.value);
        cb.checked = user.Roles && user.Roles.some(role => role.Id === roleId);
    });
}

// ─────────────────────────────────────────
// Handle Submit
// ─────────────────────────────────────────
async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData(userForm);
    const data = {
        FirstName: formData.get('FirstName').trim(),
        LastName: formData.get('LastName').trim(),
        Email: formData.get('Email').trim(),
        Phone: formData.get('Phone')?.trim() || "",
        RoleIds: []
    };

    document.querySelectorAll('#roleCheckboxes input[type="checkbox"]:checked').forEach(cb => {
        data.RoleIds.push(parseInt(cb.value));
    });

    if (data.RoleIds.length === 0) {
        toast('warning', 'Please select at least one role.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/Create`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(data)
        });

        const result = await response.json();
        toastFromResponse(result, 'User created successfully!', 'Failed to create user.');

        if (result.status) {
            hideForm();
            await loadUsers();
        }

    } catch (error) {
        console.error('Submit error:', error);
        toast('error', 'Network error. Please try again.');
    }
}

// ─────────────────────────────────────────
// Toggle User Status
// ─────────────────────────────────────────
async function toggleUserStatus(userId, currentStatus) {
    const action = currentStatus ? 'deactivate' : 'activate';
    
    const confirm = await Swal.fire({
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} User?`,
        text: `Are you sure you want to ${action} this user?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: currentStatus ? '#f59e0b' : '#10b981',
        cancelButtonColor: '#6c757d',
        confirmButtonText: `Yes, ${action}!`,
        cancelButtonText: 'Cancel'
    });

    if (!confirm.isConfirmed) return;

    try {
        const response = await fetch(`${API_BASE_URL}/toggle-activation/${userId}`, {
            method: 'POST',
            headers: authHeaders()
        });

        const result = await response.json();
        toastFromResponse(result, `User ${action}d successfully!`, `Failed to ${action} user.`);

        if (result.status) {
            await loadUsers();
        }

    } catch (error) {
        console.error('Toggle status error:', error);
        toast('error', 'Network error. Could not toggle user status.');
    }
}

// ─────────────────────────────────────────
// Delete User
// ─────────────────────────────────────────
async function deleteUser(userId) {
    const confirm = await Swal.fire({
        title: 'Delete User?',
        text: 'This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    });

    if (!confirm.isConfirmed) return;

    try {
        const response = await fetch(`${API_BASE_URL}/${userId}`, {
            method: 'DELETE',
            headers: authHeaders()
        });

        const result = await response.json();
        toastFromResponse(result, 'User deleted successfully!', 'Failed to delete user.');

        if (result.status) {
            await loadUsers();
        }

    } catch (error) {
        console.error('Delete error:', error);
        toast('error', 'Network error. Could not delete user.');
    }
}

// ─────────────────────────────────────────
// Resend Confirmation Email
// ─────────────────────────────────────────
async function resendConfirmation(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/resend-confirmation-email?user_id=${userId}`, {
            method: 'POST',
            headers: authHeaders()
        });

        const result = await response.json();
        toastFromResponse(result, 'Confirmation email sent successfully!', 'Failed to send confirmation email.');

    } catch (error) {
        console.error('Resend confirmation error:', error);
        toast('error', 'Network error. Could not send confirmation email.');
    }
}

// ─────────────────────────────────────────
// State Machine
// ─────────────────────────────────────────
function showState(state) {
    [loadingState, userListState, userFormState].forEach(el => {
        if (el) el.style.display = 'none';
    });

    const stateMap = {
        loading: loadingState,
        userList: userListState,
        form: userFormState
    };

    if (stateMap[state]) {
        stateMap[state].style.display = 'block';
    }
}

// ─────────────────────────────────────────
// Validation - ENHANCED WITH REAL-TIME
// ─────────────────────────────────────────
function validateEmail(email) {
    // Comprehensive email regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

function validateName(name) {
    // Name should only contain letters, spaces, and hyphens
    const nameRegex = /^[a-zA-Z\s-]+$/;
    return nameRegex.test(name) && name.trim().length >= 2;
}

function clearValidation() {
    document.querySelectorAll('#userForm .is-invalid')
        .forEach(el => el.classList.remove('is-invalid'));
    document.querySelectorAll('#userForm .is-valid')
        .forEach(el => el.classList.remove('is-valid'));
}

function validateForm() {
    clearValidation();
    let isValid = true;

    // First Name validation
    const firstNameEl = document.getElementById('firstName');
    if (!firstNameEl.value.trim()) {
        firstNameEl.classList.add('is-invalid');
        isValid = false;
    } else if (!validateName(firstNameEl.value.trim())) {
        firstNameEl.classList.add('is-invalid');
        const feedback = firstNameEl.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = 'Name should only contain letters and be at least 2 characters.';
        }
        isValid = false;
    } else {
        firstNameEl.classList.add('is-valid');
    }

    // Last Name validation
    const lastNameEl = document.getElementById('lastName');
    if (!lastNameEl.value.trim()) {
        lastNameEl.classList.add('is-invalid');
        isValid = false;
    } else if (!validateName(lastNameEl.value.trim())) {
        lastNameEl.classList.add('is-invalid');
        const feedback = lastNameEl.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = 'Name should only contain letters and be at least 2 characters.';
        }
        isValid = false;
    } else {
        lastNameEl.classList.add('is-valid');
    }

    // Email validation
    const emailEl = document.getElementById('email');
    if (!emailEl.value.trim()) {
        emailEl.classList.add('is-invalid');
        const feedback = emailEl.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = 'Email is required.';
        }
        isValid = false;
    } else if (!validateEmail(emailEl.value.trim())) {
        emailEl.classList.add('is-invalid');
        const feedback = emailEl.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = 'Please enter a valid email address.';
        }
        isValid = false;
    } else {
        emailEl.classList.add('is-valid');
    }

    // Role validation
    const selectedRoles = document.querySelectorAll('#roleCheckboxes input[type="checkbox"]:checked');
    if (selectedRoles.length === 0) {
        roleCheckboxes.classList.add('is-invalid');
        isValid = false;
    } else {
        roleCheckboxes.classList.remove('is-invalid');
    }

    if (!isValid) {
        toast('warning', 'Please fill in all required fields correctly.');
        const first = document.querySelector('#userForm .is-invalid');
        if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return isValid;
}

// ─────────────────────────────────────────
// Setup Real-Time Form Validation
// ─────────────────────────────────────────
function setupFormValidation() {
    // First Name real-time validation
    const firstNameEl = document.getElementById('firstName');
    firstNameEl.addEventListener('input', () => {
        firstNameEl.classList.remove('is-invalid', 'is-valid');
        const value = firstNameEl.value.trim();
        if (value) {
            if (validateName(value)) {
                firstNameEl.classList.add('is-valid');
            } else {
                firstNameEl.classList.add('is-invalid');
                const feedback = firstNameEl.nextElementSibling;
                if (feedback && feedback.classList.contains('invalid-feedback')) {
                    feedback.textContent = 'Name should only contain letters and be at least 2 characters.';
                }
            }
        }
    });

    // Last Name real-time validation
    const lastNameEl = document.getElementById('lastName');
    lastNameEl.addEventListener('input', () => {
        lastNameEl.classList.remove('is-invalid', 'is-valid');
        const value = lastNameEl.value.trim();
        if (value) {
            if (validateName(value)) {
                lastNameEl.classList.add('is-valid');
            } else {
                lastNameEl.classList.add('is-invalid');
                const feedback = lastNameEl.nextElementSibling;
                if (feedback && feedback.classList.contains('invalid-feedback')) {
                    feedback.textContent = 'Name should only contain letters and be at least 2 characters.';
                }
            }
        }
    });

    // Email real-time validation
    const emailEl = document.getElementById('email');
    emailEl.addEventListener('input', () => {
        emailEl.classList.remove('is-invalid', 'is-valid');
        const value = emailEl.value.trim();
        if (value) {
            if (validateEmail(value)) {
                emailEl.classList.add('is-valid');
            } else {
                emailEl.classList.add('is-invalid');
                const feedback = emailEl.nextElementSibling;
                if (feedback && feedback.classList.contains('invalid-feedback')) {
                    feedback.textContent = 'Please enter a valid email address.';
                }
            }
        }
    });

    // Phone validation (optional but add visual feedback)
    const phoneEl = document.getElementById('phone');
    phoneEl.addEventListener('input', () => {
        phoneEl.classList.remove('is-invalid', 'is-valid');
        const value = phoneEl.value.trim();
        if (value) {
            phoneEl.classList.add('is-valid');
        }
    });

    // Role checkbox validation
    document.querySelectorAll('#roleCheckboxes input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
            const anyChecked = document.querySelectorAll('#roleCheckboxes input[type="checkbox"]:checked').length > 0;
            if (anyChecked) {
                roleCheckboxes.classList.remove('is-invalid');
            }
        });
    });
}