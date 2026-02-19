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
const loadingState         = document.getElementById('loadingState');
const userListState        = document.getElementById('userListState');
const userFormState        = document.getElementById('userFormState');
const createUserBtn        = document.getElementById('createUserBtn');
const userCardsContainer   = document.getElementById('userCardsContainer');
const cancelFormBtn        = document.getElementById('cancelFormBtn');
const cancelBtn            = document.getElementById('cancelBtn');
const userForm             = document.getElementById('userForm');
const formTitle            = document.getElementById('formTitle');
const searchInput          = document.getElementById('searchInput');
const roleFilter           = document.getElementById('roleFilter');
const statusFilter         = document.getElementById('statusFilter');
const applyFiltersBtn      = document.getElementById('applyFiltersBtn');
const resetFiltersBtn      = document.getElementById('resetFiltersBtn');
const paginationContainer  = document.getElementById('paginationContainer');
const roleCheckboxes       = document.getElementById('roleCheckboxes');

// Pagination
const firstPageBtn   = document.getElementById('firstPageBtn');
const prevPageBtn    = document.getElementById('prevPageBtn');
const nextPageBtn    = document.getElementById('nextPageBtn');
const lastPageBtn    = document.getElementById('lastPageBtn');
const pageNumbers    = document.getElementById('pageNumbers');
const showingFrom    = document.getElementById('showingFrom');
const showingTo      = document.getElementById('showingTo');
const totalUsersEl   = document.getElementById('totalUsers');
const pageSizeSelect = document.getElementById('pageSizeSelect');

// Change Password Modal
const changePasswordModal = document.getElementById('changePasswordModal');
const changePasswordForm  = document.getElementById('changePasswordForm');
const cpUserId            = document.getElementById('cpUserId');
const cpUserName          = document.getElementById('cpUserName');
const cpNewPassword       = document.getElementById('cpNewPassword');
const cpConfirmPassword   = document.getElementById('cpConfirmPassword');
const cpAlert             = document.getElementById('cpAlert');
const cpSubmitBtn         = document.getElementById('cpSubmitBtn');
const cpBtnText           = document.getElementById('cpBtnText');
const cpBtnSpinner        = document.getElementById('cpBtnSpinner');
const cpStrengthFill      = document.getElementById('cpStrengthFill');
const cpStrengthLabel     = document.getElementById('cpStrengthLabel');
const closeChangePassword = document.getElementById('closeChangePassword');
const cpCancelBtn         = document.getElementById('cpCancelBtn');

// ─────────────────────────────────────────
// Toastr config
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

function toast(type, message, title) { toastr[type](message, title || ''); }

function toastFromResponse(result, fallbackSuccess, fallbackError) {
    const msg  = result?.message || (result?.status ? fallbackSuccess : fallbackError);
    const type = result?.status ? 'success' : 'error';
    toast(type, msg);
}

// ─────────────────────────────────────────
// Auth helpers
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
    setupChangePasswordModal();
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
        if (e.key === 'Enter') handleFilters();
    });

    firstPageBtn.addEventListener('click', () => goToPage(1));
    prevPageBtn.addEventListener('click',  () => changePage(-1));
    nextPageBtn.addEventListener('click',  () => changePage(1));
    lastPageBtn.addEventListener('click',  () => {
        goToPage(Math.ceil(filteredUsers.length / usersPerPage));
    });

    pageSizeSelect.addEventListener('change', (e) => {
        usersPerPage = parseInt(e.target.value);
        currentPage  = 1;
        renderUsers();
    });
}

// ─────────────────────────────────────────
// Change Password Modal Setup
// ─────────────────────────────────────────
function setupChangePasswordModal() {
    // Close buttons
    [closeChangePassword, cpCancelBtn].forEach(btn => {
        btn.addEventListener('click', closeChangePasswordModal);
    });

    // Close on backdrop click
    changePasswordModal.addEventListener('click', (e) => {
        if (e.target === changePasswordModal) closeChangePasswordModal();
    });

    // Toggle password visibility
    document.querySelectorAll('.cp-toggle-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const targetId = this.dataset.target;
            const input    = document.getElementById(targetId);
            const icon     = this.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('bi-eye-slash', 'bi-eye');
            } else {
                input.type = 'password';
                icon.classList.replace('bi-eye', 'bi-eye-slash');
            }
        });
    });

    // Password strength on input
    cpNewPassword.addEventListener('input', () => {
        updateCpStrength(cpNewPassword.value);
        clearCpError('err_cpNewPassword');
    });

    cpConfirmPassword.addEventListener('input', () => clearCpError('err_cpConfirmPassword'));

    // Submit
    changePasswordForm.addEventListener('submit', handleChangePasswordSubmit);
}

function openChangePasswordModal(userId, fullName) {
    cpUserId.value = userId;
    cpUserName.textContent = `for ${fullName}`;
    changePasswordForm.reset();
    cpAlert.style.display = 'none';
    resetCpRequirements();
    cpStrengthFill.className  = 'cp-strength-fill';
    cpStrengthLabel.textContent = '';
    cpStrengthLabel.className   = 'cp-strength-label';
    changePasswordModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setTimeout(() => cpNewPassword.focus(), 200);
}

function closeChangePasswordModal() {
    changePasswordModal.style.display = 'none';
    document.body.style.overflow = '';
    changePasswordForm.reset();
    cpAlert.style.display = 'none';
    resetCpRequirements();
}

async function handleChangePasswordSubmit(e) {
    e.preventDefault();

    const newPw      = cpNewPassword.value;
    const confirmPw  = cpConfirmPassword.value;
    const userId     = parseInt(cpUserId.value);
    let valid        = true;

    // Validate new password
    if (!newPw) {
        showCpError('err_cpNewPassword', 'New password is required.');
        valid = false;
    } else if (newPw.length < 8) {
        showCpError('err_cpNewPassword', 'Password must be at least 8 characters.');
        valid = false;
    }

    // Validate confirm
    if (!confirmPw) {
        showCpError('err_cpConfirmPassword', 'Please confirm the password.');
        valid = false;
    } else if (newPw !== confirmPw) {
        showCpError('err_cpConfirmPassword', 'Passwords do not match.');
        valid = false;
    }

    if (!valid) return;

    // Show loading
    cpBtnText.style.display    = 'none';
    cpBtnSpinner.style.display = 'inline-flex';
    cpSubmitBtn.disabled       = true;
    cpAlert.style.display      = 'none';

    try {
        const response = await fetch('http://127.0.0.1:8000/api/users/admin/users/change-password', {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({
                UserId:          userId,
                NewPassword:     newPw,
                ConfirmPassword: confirmPw
            })
        });

        const result = await response.json();

        if (result.status) {
            showCpAlert('success', `<i class="bi bi-check-circle-fill me-2"></i>${result.message || 'Password updated successfully!'}`);
            setTimeout(() => closeChangePasswordModal(), 2000);
        } else {
            showCpAlert('error', `<i class="bi bi-exclamation-circle-fill me-2"></i>${result.message || 'Failed to update password.'}`);
        }

    } catch (error) {
        console.error('Change password error:', error);
        showCpAlert('error', '<i class="bi bi-exclamation-circle-fill me-2"></i>Network error. Please try again.');
    } finally {
        cpBtnText.style.display    = 'inline-flex';
        cpBtnSpinner.style.display = 'none';
        cpSubmitBtn.disabled       = false;
    }
}

function showCpAlert(type, html) {
    cpAlert.innerHTML   = html;
    cpAlert.className   = `cp-alert cp-${type}`;
    cpAlert.style.display = 'flex';
}

function showCpError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
}

function clearCpError(id) {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
}

// ─────────────────────────────────────────
// Password strength checker (modal)
// ─────────────────────────────────────────
function updateCpStrength(pw) {
    const reqs = {
        cpReq_length:  pw.length >= 8,
        cpReq_upper:   /[A-Z]/.test(pw),
        cpReq_lower:   /[a-z]/.test(pw),
        cpReq_digit:   /\d/.test(pw),
        cpReq_special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw)
    };

    let passed = 0;
    Object.entries(reqs).forEach(([id, ok]) => {
        const li = document.getElementById(id);
        if (!li) return;
        li.classList.toggle('cp-passed', ok);
        if (ok) passed++;
    });

    const levels = ['', 'cp-weak', 'cp-fair', 'cp-good', 'cp-strong', 'cp-strong'];
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Strong'];

    cpStrengthFill.className  = `cp-strength-fill ${pw ? levels[passed] : ''}`;
    cpStrengthLabel.className = `cp-strength-label ${pw ? levels[passed] : ''}`;
    cpStrengthLabel.textContent = pw ? labels[passed] : '';
}

function resetCpRequirements() {
    ['cpReq_length','cpReq_upper','cpReq_lower','cpReq_digit','cpReq_special'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('cp-passed');
    });
    document.getElementById('err_cpNewPassword').textContent    = '';
    document.getElementById('err_cpConfirmPassword').textContent = '';
}

// ─────────────────────────────────────────
// SuperAdmin check
// ─────────────────────────────────────────
function isSuperAdmin(user) {
    if (user.Email && user.Email.toLowerCase() === 'superadmin') return true;
    const fullName = `${user.FirstName} ${user.LastName}`.toLowerCase();
    if (fullName.includes('super') && fullName.includes('admin')) return true;
    if (user.Roles && user.Roles.some(r => r.Name.toLowerCase() === 'superadmin')) return true;
    return false;
}

// ─────────────────────────────────────────
// Load Roles
// ─────────────────────────────────────────
async function loadRoles() {
    try {
        const response = await fetch(`${API_BASE_URL}/roles/list`, { headers: authHeaders() });
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

function renderRoleCheckboxes() {
    roleCheckboxes.innerHTML = '';
    availableRoles.forEach(role => {
        const div = document.createElement('div');
        div.className = 'role-checkbox-item';
        div.innerHTML = `
            <input type="checkbox" id="role_${role.Id}" name="roleIds" value="${role.Id}">
            <label for="role_${role.Id}">${role.Name}</label>
        `;
        roleCheckboxes.appendChild(div);
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
            body: JSON.stringify({ search: '', skipCount: 0, maxCount: 1000 })
        });
        if (response.status === 401) {
            toast('error', 'Session expired. Please log in again.');
            setTimeout(() => window.location.href = '/', 2000);
            return;
        }
        const result = await response.json();
        if (result.status && result.data) {
            allUsers      = result.data.item || [];
            filteredUsers = [...allUsers];
            currentPage   = 1;
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
// Filters
// ─────────────────────────────────────────
function handleFilters() {
    const searchTerm    = searchInput.value.toLowerCase().trim();
    const roleVal       = roleFilter.value;
    const statusVal     = statusFilter.value;

    filteredUsers = allUsers.filter(user => {
        const matchSearch = !searchTerm ||
            (user.FirstName   && user.FirstName.toLowerCase().includes(searchTerm))   ||
            (user.LastName    && user.LastName.toLowerCase().includes(searchTerm))    ||
            (user.Email       && user.Email.toLowerCase().includes(searchTerm))       ||
            (user.PhoneNumber && user.PhoneNumber.toLowerCase().includes(searchTerm)) ||
            (user.Roles       && user.Roles.some(r => r.Name.toLowerCase().includes(searchTerm)));

        const matchRole = !roleVal || (user.Roles && user.Roles.some(r => r.Name === roleVal));

        let matchStatus = true;
        if (statusVal === 'active')   matchStatus = user.IsActive === true;
        if (statusVal === 'inactive') matchStatus = user.IsActive === false;

        return matchSearch && matchRole && matchStatus;
    });

    currentPage = 1;
    renderUsers();
    toast('success', `Found ${filteredUsers.length} user(s)`, '');
}

function resetFilters() {
    searchInput.value  = '';
    roleFilter.value   = '';
    statusFilter.value = '';
    filteredUsers      = [...allUsers];
    currentPage        = 1;
    renderUsers();
    toast('info', 'Filters reset', '');
}

// ─────────────────────────────────────────
// Render Users
// ─────────────────────────────────────────
function renderUsers() {
    const startIndex  = (currentPage - 1) * usersPerPage;
    const endIndex    = startIndex + usersPerPage;
    const usersToShow = filteredUsers.slice(startIndex, endIndex);
    const totalPages  = Math.ceil(filteredUsers.length / usersPerPage);

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

    usersToShow.forEach(user => userCardsContainer.appendChild(createUserCard(user)));

    paginationContainer.style.display = totalPages > 1 ? 'flex' : 'none';
    if (totalPages > 1) {
        updatePaginationInfo(startIndex, endIndex);
        renderPageNumbers(totalPages);
    }
}

function updatePaginationInfo(startIndex, endIndex) {
    const totalPages    = Math.ceil(filteredUsers.length / usersPerPage);
    const actualEnd     = Math.min(endIndex, filteredUsers.length);

    showingFrom.textContent  = filteredUsers.length > 0 ? startIndex + 1 : 0;
    showingTo.textContent    = actualEnd;
    totalUsersEl.textContent = filteredUsers.length;

    firstPageBtn.disabled = currentPage === 1;
    prevPageBtn.disabled  = currentPage === 1;
    nextPageBtn.disabled  = currentPage === totalPages;
    lastPageBtn.disabled  = currentPage === totalPages;
}

function renderPageNumbers(totalPages) {
    pageNumbers.innerHTML = '';
    let startPage = Math.max(1, currentPage - 2);
    let endPage   = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.className = `page-number ${i === currentPage ? 'active' : ''}`;
        btn.textContent = i;
        btn.onclick = () => goToPage(i);
        pageNumbers.appendChild(btn);
    }
}

function changePage(dir) {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const newPage    = currentPage + dir;
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderUsers();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function goToPage(page) {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderUsers();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ─────────────────────────────────────────
// Format Date
// ─────────────────────────────────────────
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ─────────────────────────────────────────
// Create User Card
// ─────────────────────────────────────────
function createUserCard(user) {
    const card             = document.createElement('div');
    const isSuperAdminUser = isSuperAdmin(user);
    const fullName         = `${user.FirstName} ${user.LastName}`;
    const statusClass      = user.IsActive ? 'active' : 'inactive';
    const statusText       = user.IsActive ? 'Active' : 'Inactive';
    const roles            = user.Roles ? user.Roles.map(r => r.Name).join(', ') : 'No roles';

    card.className = 'user-card';

    card.innerHTML = `
        <!-- Header -->
        <div class="user-card-header">
            <div class="user-info">
                <h3 class="user-name">${fullName}</h3>
                <div class="user-email">
                    <i class="bi bi-envelope"></i>
                    <span>${user.Email}</span>
                </div>
                ${isSuperAdminUser ? '<span class="superadmin-badge"><i class="bi bi-star-fill"></i> Super Admin</span>' : ''}
            </div>
            <div class="user-card-header-right">
                ${!isSuperAdminUser ? `
                <div class="header-toggle-wrap" title="${user.IsActive ? 'Click to deactivate' : 'Click to activate'}">
                    <label class="toggle-switch">
                        <input type="checkbox" ${user.IsActive ? 'checked' : ''} onchange="toggleUserStatus(${user.Id}, ${user.IsActive})">
                        <span class="toggle-track"></span>
                    </label>
                    <span class="header-toggle-label ${user.IsActive ? 'is-active' : 'is-inactive'}">
                        ${user.IsActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
                ` : `<span class="user-status-badge status-${statusClass}">${statusText}</span>`}
            </div>
        </div>

        <!-- Body -->
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

        <!-- Footer -->
        ${!isSuperAdminUser ? `
            <div class="user-card-footer">
                ${!user.IsActive ? `
                    <button class="btn-resend" onclick="resendConfirmation(${user.Id})" title="Resend confirmation email">
                        <i class="bi bi-envelope-check"></i>
                        <span>Resend Email</span>
                    </button>
                ` : ''}

                <!-- Change Password -->
                <button class="btn-change-pw" onclick="openChangePasswordModal(${user.Id}, '${fullName.replace(/'/g, "\\'")}')" title="Change password">
                    <i class="bi bi-key"></i>
                    <span>Change Password</span>
                </button>

                <!-- Delete -->
                <button class="btn-delete" onclick="deleteUser(${user.Id})" title="Delete user permanently">
                    <i class="bi bi-trash"></i>
                    <span>Delete</span>
                </button>
            </div>
        ` : `
            <div class="user-card-footer">
                <span class="protected-badge">
                    <i class="bi bi-shield-fill-check"></i> Protected Account
                </span>
            </div>
        `}
    `;

    return card;
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

    if (!confirm.isConfirmed) {
        // Re-render to reset toggle visually
        renderUsers();
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/toggle-activation/${userId}`, {
            method: 'POST',
            headers: authHeaders()
        });
        const result = await response.json();
        toastFromResponse(result, `User ${action}d successfully!`, `Failed to ${action} user.`);
        if (result.status) await loadUsers();
        else renderUsers(); // reset toggle if failed
    } catch (error) {
        console.error('Toggle status error:', error);
        toast('error', 'Network error. Could not toggle user status.');
        renderUsers();
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
        if (result.status) await loadUsers();
    } catch (error) {
        console.error('Delete error:', error);
        toast('error', 'Network error. Could not delete user.');
    }
}

// ─────────────────────────────────────────
// Resend Confirmation
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
// Show / Hide Form
// ─────────────────────────────────────────
function showForm(updateMode, userId = null) {
    isUpdateMode      = updateMode;
    currentEditUserId = userId;
    formTitle.textContent = updateMode ? 'Update User' : 'Create New User';

    if (updateMode && userId) {
        populateFormWithUserData(userId);
    } else {
        userForm.reset();
        clearValidation();
        document.querySelectorAll('#roleCheckboxes input[type="checkbox"]').forEach(cb => cb.checked = false);
    }

    showState('form');
    window.scrollTo(0, 0);
}

function hideForm() {
    showState('userList');
    userForm.reset();
    clearValidation();
    isUpdateMode      = false;
    currentEditUserId = null;
}

function populateFormWithUserData(userId) {
    const user = allUsers.find(u => u.Id === userId);
    if (!user) return;
    document.getElementById('firstName').value = user.FirstName || '';
    document.getElementById('lastName').value  = user.LastName  || '';
    document.getElementById('email').value     = user.Email     || '';
    document.getElementById('phone').value     = user.PhoneNumber || '';

    document.querySelectorAll('#roleCheckboxes input[type="checkbox"]').forEach(cb => {
        cb.checked = user.Roles && user.Roles.some(r => r.Id === parseInt(cb.value));
    });
}

// ─────────────────────────────────────────
// Submit Create User
// ─────────────────────────────────────────
async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData(userForm);
    const data = {
        FirstName: formData.get('FirstName').trim(),
        LastName:  formData.get('LastName').trim(),
        Email:     formData.get('Email').trim(),
        Phone:     formData.get('Phone')?.trim() || '',
        RoleIds:   []
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
        if (result.status) { hideForm(); await loadUsers(); }
    } catch (error) {
        console.error('Submit error:', error);
        toast('error', 'Network error. Please try again.');
    }
}

// ─────────────────────────────────────────
// State Machine
// ─────────────────────────────────────────
function showState(state) {
    [loadingState, userListState, userFormState].forEach(el => { if (el) el.style.display = 'none'; });
    const map = { loading: loadingState, userList: userListState, form: userFormState };
    if (map[state]) map[state].style.display = 'block';
}

// ─────────────────────────────────────────
// Form Validation
// ─────────────────────────────────────────
const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function validateField(input, errorSpan, label) {
    if (!input.value.trim()) {
        input.classList.add('is-invalid');
        errorSpan.textContent = `${label} is required.`;
        return false;
    }
    input.classList.remove('is-invalid');
    errorSpan.textContent = '';
    return true;
}

function clearValidation() {
    document.querySelectorAll('#userForm .is-invalid').forEach(el => el.classList.remove('is-invalid'));
    document.querySelectorAll('#userForm .invalid-feedback').forEach(el => el.textContent = '');
}

function validateForm() {
    let isValid = true;

    const fnEl = document.getElementById('firstName');
    if (!validateField(fnEl, fnEl.nextElementSibling, 'First Name')) isValid = false;

    const lnEl = document.getElementById('lastName');
    if (!validateField(lnEl, lnEl.nextElementSibling, 'Last Name')) isValid = false;

    const emEl    = document.getElementById('email');
    const emError = emEl.nextElementSibling;
    const emVal   = emEl.value.trim();

    if (!emVal) {
        emEl.classList.add('is-invalid');
        emError.textContent = 'Email is required.';
        isValid = false;
    } else if (!emailRegex.test(emVal)) {
        emEl.classList.add('is-invalid');
        emError.textContent = 'Please enter a valid email address.';
        isValid = false;
    } else {
        emEl.classList.remove('is-invalid');
        emError.textContent = '';
    }

    const selectedRoles = document.querySelectorAll('#roleCheckboxes input[type="checkbox"]:checked');
    if (selectedRoles.length === 0) { roleCheckboxes.classList.add('is-invalid'); isValid = false; }
    else roleCheckboxes.classList.remove('is-invalid');

    if (!isValid) toast('warning', 'Please fill in all required fields correctly.');
    return isValid;
}

function setupFormValidation() {
    const fnEl = document.getElementById('firstName');
    fnEl.addEventListener('input', () => {
        if (fnEl.value.trim()) { fnEl.classList.remove('is-invalid'); fnEl.nextElementSibling.textContent = ''; }
    });

    const lnEl = document.getElementById('lastName');
    lnEl.addEventListener('input', () => {
        if (lnEl.value.trim()) { lnEl.classList.remove('is-invalid'); lnEl.nextElementSibling.textContent = ''; }
    });

    const emEl = document.getElementById('email');
    emEl.addEventListener('input', () => {
        const val = emEl.value.trim();
        if (!val) {
            emEl.classList.add('is-invalid');
            emEl.nextElementSibling.textContent = 'Email is required.';
        } else if (!emailRegex.test(val)) {
            emEl.classList.add('is-invalid');
            emEl.nextElementSibling.textContent = 'Please enter a valid email address.';
        } else {
            emEl.classList.remove('is-invalid');
            emEl.nextElementSibling.textContent = '';
        }
    });

    document.querySelectorAll('#roleCheckboxes input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
            if (document.querySelectorAll('#roleCheckboxes input:checked').length > 0) {
                roleCheckboxes.classList.remove('is-invalid');
            }
        });
    });
}