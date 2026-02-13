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
                maxCount: 1000 // Get all users for client-side filtering
            })
        });

        if (response.status === 401) {
            toast('error', 'Session expired. Please log in again.');
            setTimeout(() => window.location.href = '/', 2000);
            return;
        }

        const result = await response.json();

        if (result.status && result.data) {
            // API returns 'item' not 'users', and roles are already included
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
// Handle Filters
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

        // Status filter
        const matchesStatus = !statusFilterValue || 
            (statusFilterValue === 'active' && user.IsActive) ||
            (statusFilterValue === 'inactive' && !user.IsActive);

        return matchesSearch && matchesRole && matchesStatus;
    });

    currentPage = 1;
    renderUsers();
    
    // Show feedback
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
// Create User Card
// ─────────────────────────────────────────
function createUserCard(user) {
    const card = document.createElement('div');
    const isSuperAdminUser = isSuperAdmin(user);
    
    // No blur class, just regular card
    card.className = 'user-card';
    
    const initials = getInitials(user.FirstName, user.LastName);
    const statusClass = user.IsActive ? 'active' : 'inactive';
    const statusText = user.IsActive ? 'Active' : 'Inactive';
    const roles = user.Roles ? user.Roles.map(r => r.Name).join(', ') : 'No roles';

    card.innerHTML = `
        <div class="user-card-header">
            <div class="user-avatar">
                ${user.Image ? 
                    `<img src="${user.Image.startsWith('/') ? user.Image : '/' + user.Image.replace(/\\/g, '/')}" alt="${user.FirstName}">` :
                    `<div class="user-initials">${initials}</div>`
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
                    <i class="bi bi-envelope"></i>
                    <span>${user.Email}</span>
                </div>
                ${user.PhoneNumber ? `
                    <div class="detail-item">
                        <i class="bi bi-telephone"></i>
                        <span>${user.PhoneNumber}</span>
                    </div>
                ` : ''}
                <div class="detail-item">
                    <i class="bi bi-shield-check"></i>
                    <span>${roles}</span>
                </div>
            </div>
        </div>
        
        ${!isSuperAdminUser ? `
            <div class="user-card-actions">
                ${!user.IsActive ? `
                    <button class="btn btn-sm btn-info" onclick="resendConfirmation(${user.Id})">
                        <i class="bi bi-envelope-check"></i>
                        <span>Resend Email</span>
                    </button>
                ` : ''}
                <button class="btn btn-sm btn-${user.IsActive ? 'warning' : 'success'}" onclick="toggleUserStatus(${user.Id}, ${user.IsActive})">
                    <i class="bi bi-${user.IsActive ? 'pause-circle' : 'play-circle'}"></i>
                    <span>${user.IsActive ? 'Deactivate' : 'Activate'}</span>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.Id})">
                    <i class="bi bi-trash"></i>
                    <span>Delete</span>
                </button>
            </div>
        ` : ''}
    `;

    return card;
}

// ─────────────────────────────────────────
// Get Initials
// ─────────────────────────────────────────
function getInitials(firstName, lastName) {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return first + last || '??';
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
        // Uncheck all role checkboxes
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

    // Check appropriate role checkboxes
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

    // Get selected role IDs
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
        confirmButtonColor: currentStatus ? '#ffc107' : '#28a745',
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
        confirmButtonColor: '#dc3545',
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
        // API expects user_id as query parameter, not in body
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
// Validation
// ─────────────────────────────────────────
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function clearValidation() {
    document.querySelectorAll('#userForm .is-invalid')
        .forEach(el => el.classList.remove('is-invalid'));
}

function validateForm() {
    clearValidation();
    let isValid = true;

    const required = [
        { id: 'firstName' },
        { id: 'lastName' },
        { id: 'email' }
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

function setupFormValidation() {
    document.querySelectorAll('#userForm .form-control').forEach(el => {
        el.addEventListener('input', () => el.classList.remove('is-invalid'));
        el.addEventListener('change', () => el.classList.remove('is-invalid'));
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