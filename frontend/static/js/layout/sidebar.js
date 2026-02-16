// frontend/static/js/layout/sidebar.js

document.addEventListener("DOMContentLoaded", function () {

    /* ─────────────────────────────────────────
       1. Populate profile section from localStorage
    ───────────────────────────────────────── */
    function populateProfile() {
        const avatarEl  = document.getElementById('sidebarAvatar');
        const nameEl    = document.getElementById('sidebarName');
        const addressEl = document.getElementById('sidebarAddress');

        console.log('=== POPULATING PROFILE ===');

        // Prefer the full user_data object stored at login
        let userData = null;
        try {
            const userDataStr = localStorage.getItem('user_data');
            console.log('Raw user_data from localStorage:', userDataStr);
            userData = userDataStr ? JSON.parse(userDataStr) : null;
            console.log('Parsed user_data:', userData);
        } catch (e) {
            console.error('Error parsing user_data:', e);
        }

        // ── Name ──────────────────────────────
        let firstName = '';
        let lastName  = '';

        if (userData) {
            // Login response stores Name as a single string e.g. "John Doe"
            const nameParts = (userData.Name || '').trim().split(/\s+/);
            firstName = nameParts[0] || '';
            lastName  = nameParts.slice(1).join(' ') || '';

            console.log('Name from userData.Name:', userData.Name);
            console.log('Extracted firstName:', firstName, 'lastName:', lastName);

            // Fallback: some APIs return separate fields
            if (!firstName) firstName = userData.FirstName || '';
            if (!lastName)  lastName  = userData.LastName  || '';
        }

        // Last resort: user_name key set explicitly in login.js
        if (!firstName && !lastName) {
            const userName = localStorage.getItem('user_name');
            console.log('Trying user_name from localStorage:', userName);
            const rawName = (userName || '').trim().split(/\s+/);
            firstName = rawName[0] || '';
            lastName  = rawName.slice(1).join(' ') || '';
            console.log('Extracted from user_name - firstName:', firstName, 'lastName:', lastName);
        }

        const fullName = [firstName, lastName].filter(Boolean).join(' ');
        console.log('Final fullName:', fullName);
        
        if (nameEl) {
            nameEl.textContent = fullName || 'Guest';
            console.log('Set nameEl.textContent to:', nameEl.textContent);
        } else {
            console.error('nameEl element not found!');
        }

        // ── Avatar: image or initials ─────────
        if (avatarEl) {
            const image = userData && userData.Image;
            if (image) {
                avatarEl.innerHTML = `<img src="/${image.replace(/\\/g, '/')}" alt="Profile" class="img-fluid" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
                console.log('Set avatar image:', image);
            } else {
                // Generate initials from first and last name
                let initials = '';
                
                // Try to get initials from firstName and lastName
                if (firstName && firstName.length > 0) {
                    initials += firstName.charAt(0).toUpperCase();
                }
                
                if (lastName && lastName.length > 0) {
                    initials += lastName.charAt(0).toUpperCase();
                }
                
                // If still no initials, try to extract from full name
                if (!initials && fullName) {
                    const parts = fullName.trim().split(/\s+/);
                    if (parts.length > 0 && parts[0]) {
                        initials = parts[0].charAt(0).toUpperCase();
                    }
                    if (parts.length > 1 && parts[parts.length - 1]) {
                        initials += parts[parts.length - 1].charAt(0).toUpperCase();
                    }
                }
                
                // Final fallback
                if (!initials) {
                    initials = '?';
                }
                
                avatarEl.textContent = initials;
                console.log('Generated initials:', initials, 'from firstName:', firstName, 'lastName:', lastName);
            }
        } else {
            console.error('avatarEl element not found!');
        }

        // ── Address (optional) ────────────────
        if (addressEl) {
            const address = (userData && userData.Address) || '';
            if (address) {
                addressEl.textContent = address;
                addressEl.style.display = '';
                console.log('Set address:', address);
            }
        }

        console.log('=== PROFILE POPULATION COMPLETE ===');
    }

    /* ─────────────────────────────────────────
       2. Role-based menu visibility
    ───────────────────────────────────────── */
    function getUserRoles() {
        try {
            const rolesJson = localStorage.getItem('user_roles');
            if (!rolesJson) return [];
            const roles = JSON.parse(rolesJson);
            // Handle both [{Name: "user"}] and ["user"] formats
            return roles.map(role =>
                (typeof role === 'string' ? role : (role.Name || role.name || '')).toLowerCase()
            );
        } catch (error) {
            console.error('Error parsing user roles:', error);
            return [];
        }
    }

    function filterMenuByRole() {
        const userRoles = getUserRoles();
        console.log('User roles:', userRoles);

        if (userRoles.length === 0) {
            console.warn('No user roles found in localStorage');
            return;
        }

        const menuItems = document.querySelectorAll('.sidebar-menu .nav-item[data-role]');

        menuItems.forEach(item => {
            const allowedRoles = item.getAttribute('data-role').split(',').map(r => r.trim().toLowerCase());
            const hasAccess = userRoles.some(userRole => allowedRoles.includes(userRole));
            item.style.display = hasAccess ? '' : 'none';
        });
    }

    /* ─────────────────────────────────────────
       3. Active link highlight + auto-expand
    ───────────────────────────────────────── */
    function highlightActiveLink() {
        const currentPath = window.location.pathname;

        document.querySelectorAll('.sidebar-menu .nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href && currentPath.includes(href) && href !== '#') {
                link.classList.add('active');

                // Expand parent collapse if inside one
                const parentCollapse = link.closest('.collapse');
                if (parentCollapse) {
                    parentCollapse.classList.add('show');
                    const parentToggle = document.querySelector(`[href="#${parentCollapse.id}"]`);
                    if (parentToggle) {
                        parentToggle.setAttribute('aria-expanded', 'true');
                    }
                }
            }
        });
    }

    /* ─────────────────────────────────────────
       4. Persist collapse state in localStorage
    ───────────────────────────────────────── */
    function initCollapseState() {
        // Get current user ID to namespace the storage keys
        const userId = localStorage.getItem('user_id') || 'default';
        
        document.querySelectorAll('.collapse').forEach(collapse => {
            const collapseId  = collapse.id;
            const storageKey  = `sidebar_${collapseId}_${userId}`;
            const savedState  = localStorage.getItem(storageKey);

            if (savedState === 'show') {
                collapse.classList.add('show');
                const toggle = document.querySelector(`[href="#${collapseId}"]`);
                if (toggle) toggle.setAttribute('aria-expanded', 'true');
            }

            collapse.addEventListener('shown.bs.collapse',  () => localStorage.setItem(storageKey, 'show'));
            collapse.addEventListener('hidden.bs.collapse', () => localStorage.setItem(storageKey, 'hide'));
        });
    }

    /* ─────────────────────────────────────────
       5. Dropdown arrow rotation
    ───────────────────────────────────────── */
    function initArrowAnimation() {
        document.querySelectorAll('[data-bs-toggle="collapse"]').forEach(toggle => {
            const targetId = toggle.getAttribute('href');
            const target   = document.querySelector(targetId);
            const arrow    = toggle.querySelector('.menu-arrow');

            if (target && arrow) {
                // Set initial state
                if (target.classList.contains('show')) {
                    arrow.style.transform = 'rotate(180deg)';
                }
                target.addEventListener('show.bs.collapse', () => arrow.style.transform = 'rotate(180deg)');
                target.addEventListener('hide.bs.collapse', () => arrow.style.transform = 'rotate(0deg)');
            }
        });
    }

    /* ─────────────────────────────────────────
       6. Hover slide effect on nav links
    ───────────────────────────────────────── */
    function initHoverEffects() {
        document.querySelectorAll('.sidebar-menu .nav-link').forEach(item => {
            item.addEventListener('mouseenter', function () {
                if (!this.classList.contains('active')) {
                    this.style.transform = 'translateX(5px)';
                }
            });
            item.addEventListener('mouseleave', function () {
                this.style.transform = 'translateX(0)';
            });
        });
    }

    /* ─────────────────────────────────────────
       7. Button click handlers
    ───────────────────────────────────────── */
    function initButtonHandlers() {
        // Find Jobs button
        const findJobBtn = document.getElementById('findJobButton');
        if (findJobBtn) {
            findJobBtn.addEventListener('click', function (e) {
                e.preventDefault();
                window.location.href = '/job/list';
            });
        }

        // Find Candidates button
        const findCandidateButton = document.getElementById('findCandidateButton');
        if (findCandidateButton) {
            findCandidateButton.addEventListener('click', function (e) {
                e.preventDefault();
                window.location.href = '/resume/rag';
            });
        }

        // Email Settings link - ensure it navigates properly
        const emailSettingsLink = document.querySelector('a[href="/email/settings"]');
        if (emailSettingsLink) {
            emailSettingsLink.addEventListener('click', function (e) {
                e.preventDefault();
                console.log('Email Settings clicked, navigating...');
                window.location.href = '/email/settings';
            });
        }

        // Compose Email link
        const composeEmailLink = document.querySelector('a[href="/email/compose-email"]');
        if (composeEmailLink) {
            composeEmailLink.addEventListener('click', function (e) {
                e.preventDefault();
                console.log('Compose Email clicked, navigating...');
                window.location.href = '/email/compose-email';
            });
        }

        // Inbox link
        const inboxLink = document.querySelector('a[href="/email/inbox"]');
        if (inboxLink) {
            inboxLink.addEventListener('click', function (e) {
                e.preventDefault();
                console.log('Inbox clicked, navigating...');
                window.location.href = '/email/inbox';
            });
        }

        // Resume Management link
        const resumeManageLink = document.querySelector('a[href="/resume/manage"]');
        if (resumeManageLink) {
            resumeManageLink.addEventListener('click', function (e) {
                e.preventDefault();
                console.log('Resume Management clicked, navigating...');
                window.location.href = '/resume/manage';
            });
        }

        // Resume List link
        const resumeListLink = document.querySelector('a[href="/resume/list"]');
        if (resumeListLink) {
            resumeListLink.addEventListener('click', function (e) {
                e.preventDefault();
                console.log('Resume List clicked, navigating...');
                window.location.href = '/resume/list';
            });
        }

        // User Management link
        const userManageLink = document.querySelector('a[href="/user/manage"]');
        if (userManageLink) {
            userManageLink.addEventListener('click', function (e) {
                e.preventDefault();
                console.log('User Management clicked, navigating...');
                window.location.href = '/user/manage';
            });
        }
    }

    /* ─────────────────────────────────────────
       Init — order matters
    ───────────────────────────────────────── */
    console.log('Sidebar initialization starting...');
    populateProfile();       // 1. Show name + avatar first
    filterMenuByRole();      // 2. Hide items user can't access
    highlightActiveLink();   // 3. Mark current page
    initCollapseState();     // 4. Restore open/closed menus
    initArrowAnimation();    // 5. Sync arrow icons
    initHoverEffects();      // 6. Hover animations
    initButtonHandlers();    // 7. Click handlers
    console.log('Sidebar initialization complete!');

    // Smooth scroll
    const sidebarMenu = document.querySelector('.sidebar-menu');
    if (sidebarMenu) sidebarMenu.style.scrollBehavior = 'smooth';
});