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
const paginationContainer = document.getElementById('paginationContainer');
const roleCheckboxes = document.getElementById('roleCheckboxes');

// Pagination elements
const firstPageBtn = document.getElementById('firstPageBtn');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const lastPageBtn = document.getElementById('lastPageBtn');
const pageNumbers = document.getElementById('pageNumbers');
const showingFrom = document.getElementById('showingFrom');
const showingTo = document.getElementById('showingTo');
const totalUsers = document.getElementById('totalUsers');
const pageSizeSelect = document.getElementById('pageSizeSelect');

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
    
    applyFiltersBtn.addEventListener('click', handleFilters);
    resetFiltersBtn.addEventListener('click', resetFilters);
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleFilters();
        }
    });
    
    // Pagination
    firstPageBtn.addEventListener('click', () => goToPage(1));
    prevPageBtn.addEventListener('click', () => changePage(-1));
    nextPageBtn.addEventListener('click', () => changePage(1));
    lastPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
        goToPage(totalPages);
    });
    
    pageSizeSelect.addEventListener('change', (e) => {
        usersPerPage = parseInt(e.target.value);
        currentPage = 1;
        renderUsers();
    });
}

// ─────────────────────────────────────────
// Check if user is SuperAdmin
// ─────────────────────────────────────────
function isSuperAdmin(user) {
    if (user.Email && user.Email.toLowerCase() === 'superadmin') {
        return true;
    }
    
    const fullName = `${user.FirstName} ${user.LastName}`.toLowerCase();
    if (fullName.includes('super') && fullName.includes('admin')) {
        return true;
    }
    
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
// Handle Filters
// ─────────────────────────────────────────
function handleFilters() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const roleFilterValue = roleFilter.value;
    const statusFilterValue = statusFilter.value;

    filteredUsers = allUsers.filter(user => {
        const matchesSearch = !searchTerm || 
            (user.FirstName && user.FirstName.toLowerCase().includes(searchTerm)) ||
            (user.LastName && user.LastName.toLowerCase().includes(searchTerm)) ||
            (user.Email && user.Email.toLowerCase().includes(searchTerm)) ||
            (user.PhoneNumber && user.PhoneNumber.toLowerCase().includes(searchTerm)) ||
            (user.Roles && user.Roles.some(role => role.Name.toLowerCase().includes(searchTerm)));

        const matchesRole = !roleFilterValue || 
            (user.Roles && user.Roles.some(role => role.Name === roleFilterValue));

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
                <i class="bi bi-person-x"></i>
                <h3>No Users Found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        paginationContainer.style.display = 'none';
        return;
    }

    usersToShow.forEach(user => {
        const card = createUserCard(user);
        userCardsContainer.appendChild(card);
    });

    if (totalPages > 1) {
        paginationContainer.style.display = 'flex';
        updatePaginationInfo(startIndex, endIndex);
        renderPageNumbers(totalPages);
    } else {
        paginationContainer.style.display = 'none';
    }
}

// ─────────────────────────────────────────
// Update Pagination Info
// ─────────────────────────────────────────
function updatePaginationInfo(startIndex, endIndex) {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const actualEndIndex = Math.min(endIndex, filteredUsers.length);
    
    showingFrom.textContent = filteredUsers.length > 0 ? startIndex + 1 : 0;
    showingTo.textContent = actualEndIndex;
    totalUsers.textContent = filteredUsers.length;
    
    // Update button states
    firstPageBtn.disabled = currentPage === 1;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    lastPageBtn.disabled = currentPage === totalPages;
}

// ─────────────────────────────────────────
// Render Page Numbers
// ─────────────────────────────────────────
function renderPageNumbers(totalPages) {
    pageNumbers.innerHTML = '';
    
    // Show max 5 page numbers
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // Adjust if we're near the end
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-number ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => goToPage(i);
        pageNumbers.appendChild(pageBtn);
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
// Create User Card (NEW VERSION WITHOUT AVATAR)
// ─────────────────────────────────────────
function createUserCard(user) {
    const card = document.createElement('div');
    const isSuperAdminUser = isSuperAdmin(user);
    
    card.className = 'user-card';
    
    const statusClass = user.IsActive ? 'active' : 'inactive';
    const statusText = user.IsActive ? 'Active' : 'Inactive';
    const roles = user.Roles ? user.Roles.map(r => r.Name).join(', ') : 'No roles';

    card.innerHTML = `
        <!-- Card Header -->
        <div class="user-card-header">
            <div class="user-info">
                <h3 class="user-name">${user.FirstName} ${user.LastName}</h3>
                <div class="user-email">
                    <i class="bi bi-envelope"></i>
                    <span>${user.Email}</span>
                </div>
                ${isSuperAdminUser ? '<span class="superadmin-badge"><i class="bi bi-star-fill"></i> Super Admin</span>' : ''}
            </div>
            <span class="user-status-badge status-${statusClass}">
                ${statusText}
            </span>
        </div>
        
        <!-- Card Body -->
        <div class="user-card-body">
            <div class="user-details">
                ${user.PhoneNumber ? `
                    <div class="detail-item">
                        <i class="bi bi-telephone"></i>
                        <span>${user.PhoneNumber}</span>
                    </div>
                ` : ''}
                
                <div class="detail-item">
                    <i class="bi bi-briefcase"></i>
                    <span>${roles}</span>
                </div>
                
                <div class="detail-item">
                    <i class="bi bi-calendar"></i>
                    <span>Joined ${formatDate(user.CreatedAt)}</span>
                </div>
                
                ${user.CreatedBy ? `
                    <div class="detail-item">
                        <i class="bi bi-person-badge"></i>
                        <span>Created by ${user.CreatedBy}</span>
                    </div>
                ` : ''}
            </div>
        </div>
        
        <!-- Card Footer with Actions -->
        ${!isSuperAdminUser ? `
            <div class="user-card-footer">
                ${!user.IsActive ? `
                    <button class="btn btn-info" onclick="resendConfirmation(${user.Id})" title="Resend confirmation email">
                        <i class="bi bi-envelope-check"></i>
                        <span>Resend Email</span>
                    </button>
                ` : ''}
                <button class="btn btn-${user.IsActive ? 'warning' : 'success'}" onclick="toggleUserStatus(${user.Id}, ${user.IsActive})" title="${user.IsActive ? 'Deactivate user' : 'Activate user'}">
                    <i class="bi bi-${user.IsActive ? 'pause-circle' : 'play-circle'}"></i>
                    <span>${user.IsActive ? 'Deactivate' : 'Activate'}</span>
                </button>
                <button class="btn btn-danger" onclick="deleteUser(${user.Id})" title="Delete user permanently">
                    <i class="bi bi-trash"></i>
                    <span>Delete</span>
                </button>
            </div>
        ` : `
            <div class="user-card-footer">
                <span style="color: #667eea; font-weight: 600; font-size: 0.9rem;">
                    <i class="bi bi-shield-fill-check"></i> Protected Account
                </span>
            </div>
        `}
    `;

    return card;
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
// Go to Specific Page
// ─────────────────────────────────────────
function goToPage(page) {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
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
// Populate Form
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
// Simple Validation (Like Register)
// ─────────────────────────────────────────
const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function validateField(input, errorSpan, label) {
    if (!input.value.trim()) {
        input.classList.add('is-invalid');
        errorSpan.textContent = `${label} is required.`;
        return false;
    } else {
        input.classList.remove('is-invalid');
        errorSpan.textContent = '';
        return true;
    }
}

function clearValidation() {
    document.querySelectorAll('#userForm .is-invalid')
        .forEach(el => el.classList.remove('is-invalid'));
    document.querySelectorAll('#userForm .invalid-feedback')
        .forEach(el => el.textContent = '');
}

function validateForm() {
    let isValid = true;

    const firstNameEl = document.getElementById('firstName');
    const firstNameError = firstNameEl.nextElementSibling;
    if (!validateField(firstNameEl, firstNameError, 'First Name')) isValid = false;

    const lastNameEl = document.getElementById('lastName');
    const lastNameError = lastNameEl.nextElementSibling;
    if (!validateField(lastNameEl, lastNameError, 'Last Name')) isValid = false;

    const emailEl = document.getElementById('email');
    const emailError = emailEl.nextElementSibling;
    const emailValue = emailEl.value.trim();
    
    if (!emailValue) {
        emailEl.classList.add('is-invalid');
        emailError.textContent = 'Email is required.';
        isValid = false;
    } else if (!emailRegex.test(emailValue)) {
        emailEl.classList.add('is-invalid');
        emailError.textContent = 'Please enter a valid email address.';
        isValid = false;
    } else {
        emailEl.classList.remove('is-invalid');
        emailError.textContent = '';
    }

    const selectedRoles = document.querySelectorAll('#roleCheckboxes input[type="checkbox"]:checked');
    if (selectedRoles.length === 0) {
        roleCheckboxes.classList.add('is-invalid');
        isValid = false;
    } else {
        roleCheckboxes.classList.remove('is-invalid');
    }

    if (!isValid) {
        toast('warning', 'Please fill in all required fields correctly.');
    }

    return isValid;
}

// ─────────────────────────────────────────
// Setup Form Validation
// ─────────────────────────────────────────
function setupFormValidation() {
    const firstNameEl = document.getElementById('firstName');
    const firstNameError = firstNameEl.nextElementSibling;
    
    firstNameEl.addEventListener('input', function () {
        if (firstNameEl.value.trim()) {
            firstNameEl.classList.remove('is-invalid');
            firstNameError.textContent = '';
        }
    });

    const lastNameEl = document.getElementById('lastName');
    const lastNameError = lastNameEl.nextElementSibling;
    
    lastNameEl.addEventListener('input', function () {
        if (lastNameEl.value.trim()) {
            lastNameEl.classList.remove('is-invalid');
            lastNameError.textContent = '';
        }
    });

    const emailEl = document.getElementById('email');
    const emailError = emailEl.nextElementSibling;
    
    emailEl.addEventListener('input', function () {
        const value = emailEl.value.trim();
        
        if (!value) {
            emailEl.classList.add('is-invalid');
            emailError.textContent = 'Email is required.';
        } else if (!emailRegex.test(value)) {
            emailEl.classList.add('is-invalid');
            emailError.textContent = 'Please enter a valid email address.';
        } else {
            emailEl.classList.remove('is-invalid');
            emailError.textContent = '';
        }
    });

    document.querySelectorAll('#roleCheckboxes input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
            const anyChecked = document.querySelectorAll('#roleCheckboxes input[type="checkbox"]:checked').length > 0;
            if (anyChecked) {
                roleCheckboxes.classList.remove('is-invalid');
            }
        });
    });
}