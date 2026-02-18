// frontend/static/js/layout/sidebar.js

document.addEventListener("DOMContentLoaded", function () {
    const BASE_URL = 'http://127.0.0.1:8000';

    console.log('Sidebar.js loaded');

    /* ═══════════════════════════════════════════════════
       HELPERS
    ═══════════════════════════════════════════════════ */
    function getUserId() {
        return localStorage.getItem('user_id') || null;
    }

    /* ═══════════════════════════════════════════════════
       1. POPULATE SIDEBAR PROFILE
    ═══════════════════════════════════════════════════ */
    async function populateProfile() {
        const avatarEl  = document.getElementById('sidebarAvatar');
        const nameEl    = document.getElementById('sidebarName');
        const roleEl    = document.getElementById('sidebarRole');
        const addressEl = document.getElementById('sidebarAddress');

        const userId = getUserId();
        let userData = null;

        if (userId) {
            try {
                const res = await fetch(`${BASE_URL}/api/users/${userId}`, {
                    headers: { 'accept': 'application/json' }
                });
                const json = await res.json();
                if (json.status && json.data) {
                    userData = json.data;
                    const stored = JSON.parse(localStorage.getItem('user_data') || '{}');
                    const merged = { ...stored, ...userData };
                    localStorage.setItem('user_data', JSON.stringify(merged));
                }
            } catch (e) {
                console.warn('Could not fetch fresh profile:', e);
            }
        }

        if (!userData) {
            try {
                userData = JSON.parse(localStorage.getItem('user_data') || 'null');
            } catch (e) { userData = null; }
        }

        let firstName = (userData && userData.FirstName) || '';
        let lastName  = (userData && userData.LastName)  || '';

        if (!firstName && !lastName) {
            const nameParts = ((userData && userData.Name) || '').trim().split(/\s+/);
            firstName = nameParts[0] || '';
            lastName  = nameParts.slice(1).join(' ') || '';
        }

        const fullName = [firstName, lastName].filter(Boolean).join(' ');
        if (nameEl) nameEl.textContent = fullName || 'Guest';

        if (roleEl) {
            try {
                const roles = JSON.parse(localStorage.getItem('user_roles') || '[]');
                const roleLabel = roles.map(r => typeof r === 'string' ? r : (r.Name || '')).join(', ');
                if (roleLabel) {
                    roleEl.textContent = roleLabel;
                    roleEl.style.display = 'inline-block';
                }
            } catch (e) { }
        }

        renderAvatar(avatarEl, userData, firstName, lastName);

        if (addressEl) {
            const address = (userData && userData.Address) || '';
            if (address) {
                addressEl.textContent = address;
                addressEl.style.display = '';
            }
        }
    }

    function renderAvatar(avatarEl, userData, firstName, lastName) {
        if (!avatarEl) return;

        const image = userData && userData.Image;
        if (image) {
            const imgSrc = image.startsWith('http')
                ? image
                : `${BASE_URL}/${image.replace(/\\/g, '/')}`;

            avatarEl.innerHTML = '';
            const img = document.createElement('img');
            img.src = imgSrc;
            img.alt = 'Profile';
            img.className = 'avatar-img';
            img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;';
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
        if (last)  initials += last.charAt(0).toUpperCase();
        return initials || '?';
    }

    /* ═══════════════════════════════════════════════════
       2. ROLE-BASED MENU FILTERING
    ═══════════════════════════════════════════════════ */
    function filterMenuByRole() {
        try {
            const rolesJson = localStorage.getItem('user_roles');
            if (!rolesJson) return;
            const roles = JSON.parse(rolesJson).map(r =>
                (typeof r === 'string' ? r : (r.Name || r.name || '')).toLowerCase()
            );
            document.querySelectorAll('.sidebar-menu .nav-item[data-role]').forEach(item => {
                const allowed = item.getAttribute('data-role').split(',').map(r => r.trim().toLowerCase());
                item.style.display = roles.some(r => allowed.includes(r)) ? '' : 'none';
            });
        } catch (e) { console.error('filterMenuByRole error:', e); }
    }

    /* ═══════════════════════════════════════════════════
       3. ACTIVE LINK HIGHLIGHT
    ═══════════════════════════════════════════════════ */
    function highlightActiveLink() {
        const currentPath = window.location.pathname;
        document.querySelectorAll('.sidebar-menu .nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href && href !== '#' && currentPath.includes(href)) {
                link.classList.add('active');
                const parentCollapse = link.closest('.collapse');
                if (parentCollapse) {
                    parentCollapse.classList.add('show');
                    const toggle = document.querySelector(`[href="#${parentCollapse.id}"]`);
                    if (toggle) toggle.setAttribute('aria-expanded', 'true');
                }
            }
        });
    }

    /* ═══════════════════════════════════════════════════
       4. COLLAPSE STATE
    ═══════════════════════════════════════════════════ */
    function initCollapseState() {
        const userId = getUserId() || 'default';
        document.querySelectorAll('.collapse').forEach(collapse => {
            const key = `sidebar_${collapse.id}_${userId}`;
            if (localStorage.getItem(key) === 'show') {
                collapse.classList.add('show');
                const toggle = document.querySelector(`[href="#${collapse.id}"]`);
                if (toggle) toggle.setAttribute('aria-expanded', 'true');
            }
            collapse.addEventListener('shown.bs.collapse',  () => localStorage.setItem(key, 'show'));
            collapse.addEventListener('hidden.bs.collapse', () => localStorage.setItem(key, 'hide'));
        });
    }

    /* ═══════════════════════════════════════════════════
       5. ARROW ANIMATION
    ═══════════════════════════════════════════════════ */
    function initArrowAnimation() {
        document.querySelectorAll('[data-bs-toggle="collapse"]').forEach(toggle => {
            const targetId = toggle.getAttribute('href');
            const target   = document.querySelector(targetId);
            const arrow    = toggle.querySelector('.menu-arrow');
            if (target && arrow) {
                if (target.classList.contains('show')) arrow.style.transform = 'rotate(180deg)';
                target.addEventListener('show.bs.collapse', () => arrow.style.transform = 'rotate(180deg)');
                target.addEventListener('hide.bs.collapse', () => arrow.style.transform = 'rotate(0deg)');
            }
        });
    }

    /* ═══════════════════════════════════════════════════
       INITIALIZE ALL
    ═══════════════════════════════════════════════════ */
    console.log('Initializing sidebar...');
    populateProfile();
    filterMenuByRole();
    highlightActiveLink();
    initCollapseState();
    initArrowAnimation();
    console.log('Sidebar initialization complete');
});