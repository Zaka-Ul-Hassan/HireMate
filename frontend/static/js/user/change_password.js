// frontend/static/js/user/change_password.js

document.addEventListener('DOMContentLoaded', function() {
    const BASE_URL = 'http://127.0.0.1:8000';

    console.log('Change password page loaded');

    // Check authentication
    protectPage();

    /* ═══════════════════════════════════════════════════
       HELPERS
    ═══════════════════════════════════════════════════ */
    function getUserId() {
        return localStorage.getItem('user_id') || null;
    }

    function showAlert(message, type = 'error') {
        const alertEl = document.getElementById('passwordAlert');
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
        const alertEl = document.getElementById('passwordAlert');
        if (alertEl) alertEl.style.display = 'none';
    }

    function setError(id, msg) {
        const el = document.getElementById(id);
        if (el) el.textContent = msg;
    }

    function clearErrors() {
        const errorIds = ['err_currentPassword', 'err_newPassword', 'err_confirmPassword'];
        errorIds.forEach(id => setError(id, ''));
    }

    /* ═══════════════════════════════════════════════════
       PASSWORD TOGGLE VISIBILITY
       fa-eye-slash = password hidden  (click to reveal)
       fa-eye       = password visible (click to hide)
    ═══════════════════════════════════════════════════ */
    const toggleButtons = document.querySelectorAll('.toggle-password');

    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = this.querySelector('i');

            if (input.type === 'password') {
                // Reveal password — show plain eye (visible)
                input.type = 'text';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                // Hide password — show slashed eye (hidden)
                input.type = 'password';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        });
    });

    /* ═══════════════════════════════════════════════════
       PASSWORD STRENGTH CHECKER
    ═══════════════════════════════════════════════════ */
    const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).+$/;

    const newPasswordInput = document.getElementById('newPassword');
    const strengthFill = document.getElementById('strengthFill');
    const strengthLabel = document.getElementById('strengthLabel');

    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function() {
            checkPasswordStrength(this.value);
            
            // Also check if confirm password matches
            const confirmPassword = document.getElementById('confirmPassword').value;
            if (confirmPassword) {
                if (confirmPassword !== this.value) {
                    setError('err_confirmPassword', 'Passwords do not match.');
                } else {
                    setError('err_confirmPassword', '');
                }
            }
        });
    }

    function checkPasswordStrength(password) {
        const requirements = {
            length: password.length >= 8,
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password),
            digit: /\d/.test(password),
            special: /[^a-zA-Z\d]/.test(password)
        };

        // Update requirement indicators
        updateRequirement('req_length', requirements.length);
        updateRequirement('req_upper', requirements.upper);
        updateRequirement('req_lower', requirements.lower);
        updateRequirement('req_digit', requirements.digit);
        updateRequirement('req_special', requirements.special);

        if (!password) {
            resetStrengthMeter();
            return;
        }

        // Calculate strength
        const passedCount = Object.values(requirements).filter(Boolean).length;
        
        let strength = 'weak';
        let strengthText = 'Weak';

        if (passedCount >= 5) {
            strength = 'strong';
            strengthText = 'Strong';
        } else if (passedCount >= 4) {
            strength = 'good';
            strengthText = 'Good';
        } else if (passedCount >= 2) {
            strength = 'fair';
            strengthText = 'Fair';
        }

        // Update UI
        if (strengthFill) {
            strengthFill.className = `strength-fill ${strength}`;
        }
        if (strengthLabel) {
            strengthLabel.className = `strength-label ${strength}`;
            strengthLabel.textContent = strengthText;
        }
    }

    function updateRequirement(id, passed) {
        const el = document.getElementById(id);
        if (!el) return;

        if (passed) {
            el.classList.add('passed');
        } else {
            el.classList.remove('passed');
        }
    }

    function resetStrengthMeter() {
        if (strengthFill) {
            strengthFill.className = 'strength-fill';
        }
        if (strengthLabel) {
            strengthLabel.className = 'strength-label';
            strengthLabel.textContent = '';
        }

        // Reset all requirements
        ['req_length', 'req_upper', 'req_lower', 'req_digit', 'req_special'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('passed');
        });
    }

    /* ═══════════════════════════════════════════════════
       CONFIRM PASSWORD VALIDATION
    ═══════════════════════════════════════════════════ */
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            const newPassword = document.getElementById('newPassword').value;
            
            if (this.value && this.value !== newPassword) {
                setError('err_confirmPassword', 'Passwords do not match.');
            } else {
                setError('err_confirmPassword', '');
            }
        });
    }

    /* ═══════════════════════════════════════════════════
       FORM SUBMISSION
    ═══════════════════════════════════════════════════ */
    const form = document.getElementById('changePasswordForm');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            await submitPasswordChange();
        });
    }

    async function submitPasswordChange() {
        hideAlert();
        clearErrors();

        // Get form values
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validation
        let isValid = true;

        if (!currentPassword) {
            setError('err_currentPassword', 'Current password is required.');
            isValid = false;
        }

        if (!newPassword) {
            setError('err_newPassword', 'New password is required.');
            isValid = false;
        } else if (newPassword.length < 8) {
            setError('err_newPassword', 'Password must be at least 8 characters long.');
            isValid = false;
        } else if (!PASSWORD_REGEX.test(newPassword)) {
            setError('err_newPassword', 'Password must include uppercase, lowercase, number, and special character.');
            isValid = false;
        }

        if (!confirmPassword) {
            setError('err_confirmPassword', 'Please confirm your new password.');
            isValid = false;
        } else if (confirmPassword !== newPassword) {
            setError('err_confirmPassword', 'Passwords do not match.');
            isValid = false;
        }

        if (!isValid) {
            showAlert('Please fix the errors above.', 'error');
            return;
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
            const response = await fetch(`${BASE_URL}/api/users/change-password?user_id=${userId}`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    OldPassword: currentPassword,
                    NewPassword: newPassword,
                    ConfirmPassword: confirmPassword
                })
            });

            const result = await response.json();

            if (result.status) {
                showAlert(result.message || 'Password changed successfully!', 'success');

                // Clear form
                document.getElementById('changePasswordForm').reset();
                resetStrengthMeter();

                // Redirect after short delay
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 2000);
            } else {
                showAlert(result.message || result.detail || 'Failed to change password.', 'error');
            }
        } catch (error) {
            console.error('Password change error:', error);
            showAlert('Network error. Please check your connection and try again.', 'error');
        } finally {
            if (btnText) btnText.style.display = 'inline-flex';
            if (spinner) spinner.style.display = 'none';
            if (saveBtn) saveBtn.disabled = false;
        }
    }
});