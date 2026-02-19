// frontend/static/js/user/update_profile.js

document.addEventListener('DOMContentLoaded', function() {
    const BASE_URL = 'http://127.0.0.1:8000';

    console.log('Update profile page loaded');

    // Check authentication
    protectPage();

    /* ═══════════════════════════════════════════════════
       HELPERS
    ═══════════════════════════════════════════════════ */
    function getUserId() {
        return localStorage.getItem('user_id') || null;
    }

    function showAlert(message, type = 'error') {
        const alertEl = document.getElementById('profileAlert');
        if (!alertEl) return;

        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        alertEl.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
        alertEl.className = `alert-container ${type}`;
        alertEl.style.display = 'flex';

        // Scroll to alert
        alertEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                alertEl.style.display = 'none';
            }, 5000);
        }
    }

    function hideAlert() {
        const alertEl = document.getElementById('profileAlert');
        if (alertEl) alertEl.style.display = 'none';
    }

    function setError(id, msg) {
        const el = document.getElementById(id);
        if (el) el.textContent = msg;
    }

    function clearErrors() {
        const errorIds = ['err_firstName', 'err_lastName', 'err_dob', 'err_gender'];
        errorIds.forEach(id => setError(id, ''));
    }

    /* ═══════════════════════════════════════════════════
       LOAD PROFILE DATA
    ═══════════════════════════════════════════════════ */
    async function loadProfileData() {
        const userId = getUserId();
        if (!userId) {
            showAlert('User not found. Please log in again.', 'error');
            setTimeout(() => window.location.href = '/', 2000);
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/api/users/${userId}`, {
                headers: { 'accept': 'application/json' }
            });

            const result = await response.json();

            if (result.status && result.data) {
                populateForm(result.data);
            } else {
                // Try from localStorage
                const storedData = localStorage.getItem('user_data');
                if (storedData) {
                    populateForm(JSON.parse(storedData));
                }
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            showAlert('Failed to load profile data. Please try again.', 'error');
        }
    }

    function populateForm(data) {
        console.log('Populating form with data:', data);

        // Text inputs
        document.getElementById('firstName').value = data.FirstName || '';
        document.getElementById('lastName').value = data.LastName || '';
        document.getElementById('phoneNumber').value = data.PhoneNumber || '';
        document.getElementById('address').value = data.Address || '';
        document.getElementById('country').value = data.Country || '';
        document.getElementById('gender').value = data.Gender || '';

        // Date of Birth
        if (data.Dob) {
            const dobDate = data.Dob.split('T')[0]; // Extract YYYY-MM-DD
            document.getElementById('dob').value = dobDate;
            calculateAge();
        }

        // Age
        document.getElementById('age').value = data.Age || '';

        // Avatar
        renderAvatar(data);

        // Set max date for DOB (15 years ago)
        setDobMaxDate();
    }

    function renderAvatar(data) {
        const avatarEl = document.getElementById('currentAvatar');
        if (!avatarEl) return;

        const firstName = data.FirstName || '';
        const lastName = data.LastName || '';

        if (data.Image) {
            const imgSrc = data.Image.startsWith('http')
                ? data.Image
                : `${BASE_URL}/${data.Image.replace(/\\/g, '/')}`;

            avatarEl.innerHTML = '';
            const img = document.createElement('img');
            img.src = imgSrc;
            img.alt = 'Profile';
            img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
            img.onerror = () => {
                avatarEl.innerHTML = buildInitials(firstName, lastName);
            };
            avatarEl.appendChild(img);
        } else {
            avatarEl.innerHTML = buildInitials(firstName, lastName);
        }
    }

    function buildInitials(first, last) {
        let initials = '';
        if (first) initials += first.charAt(0).toUpperCase();
        if (last) initials += last.charAt(0).toUpperCase();
        return initials || '<i class="fas fa-user"></i>';
    }

    /* ═══════════════════════════════════════════════════
       IMAGE UPLOAD
    ═══════════════════════════════════════════════════ */
    const imageInput = document.getElementById('profileImageInput');
    const imagePreview = document.getElementById('imagePreview');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const removePreviewBtn = document.getElementById('removePreviewBtn');

    if (imageInput) {
        imageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (!file) return;

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                showAlert('Image size must be less than 5 MB.', 'error');
                this.value = '';
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                showAlert('Please select a valid image file.', 'error');
                this.value = '';
                return;
            }

            // Show preview
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreviewContainer.style.display = 'block';
            };
            reader.readAsDataURL(file);
        });
    }

    if (removePreviewBtn) {
        removePreviewBtn.addEventListener('click', function() {
            imageInput.value = '';
            imagePreview.src = '';
            imagePreviewContainer.style.display = 'none';
        });
    }

    /* ═══════════════════════════════════════════════════
       DOB & AGE CALCULATION
    ═══════════════════════════════════════════════════ */
    function setDobMaxDate() {
        const dobInput = document.getElementById('dob');
        if (!dobInput) return;

        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() - 15);
        dobInput.max = maxDate.toISOString().split('T')[0];
    }

    function calculateAge() {
        const dobInput = document.getElementById('dob');
        const ageInput = document.getElementById('age');
        
        if (!dobInput || !ageInput) return;

        const dobValue = dobInput.value;
        if (!dobValue) {
            ageInput.value = '';
            return;
        }

        const dob = new Date(dobValue);
        const today = new Date();
        
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }

        if (age < 15) {
            setError('err_dob', 'You must be at least 15 years old.');
            ageInput.value = '';
        } else {
            setError('err_dob', '');
            ageInput.value = age;
        }
    }

    const dobInput = document.getElementById('dob');
    if (dobInput) {
        dobInput.addEventListener('change', calculateAge);
    }

    /* ═══════════════════════════════════════════════════
       FORM SUBMISSION
    ═══════════════════════════════════════════════════ */
    const form = document.getElementById('updateProfileForm');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            await submitProfile();
        });
    }

    async function submitProfile() {
        hideAlert();
        clearErrors();

        // Get form values
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const dob = document.getElementById('dob').value;
        const age = document.getElementById('age').value;
        const gender = document.getElementById('gender').value;
        const phoneNumber = document.getElementById('phoneNumber').value.trim();
        const address = document.getElementById('address').value.trim();
        const country = document.getElementById('country').value.trim();

        // Validation
        let isValid = true;

        if (!firstName) {
            setError('err_firstName', 'First name is required.');
            isValid = false;
        }

        if (!lastName) {
            setError('err_lastName', 'Last name is required.');
            isValid = false;
        }

        if (!dob) {
            setError('err_dob', 'Date of birth is required.');
            isValid = false;
        } else {
            const dobDate = new Date(dob);
            const today = new Date();
            let calculatedAge = today.getFullYear() - dobDate.getFullYear();
            const m = today.getMonth() - dobDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
                calculatedAge--;
            }
            
            if (calculatedAge < 15) {
                setError('err_dob', 'You must be at least 15 years old.');
                isValid = false;
            }
        }

        if (!gender) {
            setError('err_gender', 'Gender is required.');
            isValid = false;
        }

        if (!isValid) {
            showAlert('Please fix the errors above.', 'error');
            return;
        }

        // Prepare form data
        const formData = new FormData();
        formData.append('FirstName', firstName);
        formData.append('LastName', lastName);
        formData.append('Dob', dob);
        formData.append('Age', age || '0');
        formData.append('Gender', gender);
        formData.append('PhoneNumber', phoneNumber);
        formData.append('Address', address);
        formData.append('Country', country);

        // Add image if selected
        const imageFile = imageInput.files[0];
        if (imageFile) {
            formData.append('Image', imageFile);
        }

        const userId = getUserId();
        if (!userId) {
            showAlert('User not found. Please log in again.', 'error');
            return;
        }

        // Show loading state
        const btnText = document.getElementById('saveBtnText');
        const spinner = document.getElementById('saveBtnSpinner');
        const saveBtn = document.getElementById('saveBtn');
        
        if (btnText) btnText.style.display = 'none';
        if (spinner) spinner.style.display = 'inline-flex';
        if (saveBtn) saveBtn.disabled = true;

        try {
            const response = await fetch(`${BASE_URL}/api/users/update-profile?user_id=${userId}`, {
                method: 'PUT',
                headers: { 'accept': 'application/json' },
                body: formData
            });

            const result = await response.json();

            if (result.status && result.data) {
                // Update localStorage
                const storedData = JSON.parse(localStorage.getItem('user_data') || '{}');
                const mergedData = { ...storedData, ...result.data };
                localStorage.setItem('user_data', JSON.stringify(mergedData));

                showAlert(result.message || 'Profile updated successfully!', 'success');

                // Reload data
                await loadProfileData();

                // Redirect after short delay
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 2000);
            } else {
                showAlert(result.message || result.detail || 'Failed to update profile.', 'error');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            showAlert('Network error. Please check your connection and try again.', 'error');
        } finally {
            if (btnText) btnText.style.display = 'inline-flex';
            if (spinner) spinner.style.display = 'none';
            if (saveBtn) saveBtn.disabled = false;
        }
    }

    /* ═══════════════════════════════════════════════════
       INITIALIZE
    ═══════════════════════════════════════════════════ */
    loadProfileData();
});