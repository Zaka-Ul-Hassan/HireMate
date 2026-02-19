// frontend/static/js/layout/navbar.js

document.addEventListener("DOMContentLoaded", function () {

    /* ─────────────────────────────────────────
       Role-based menu visibility for navbar
    ───────────────────────────────────────── */
    function getUserRoles() {
        try {
            const rolesJson = localStorage.getItem('user_roles');
            if (!rolesJson) return [];
            const roles = JSON.parse(rolesJson);
            return roles.map(role =>
                (typeof role === 'string' ? role : (role.Name || role.name || '')).toLowerCase()
            );
        } catch (error) {
            console.error('Error parsing user roles:', error);
            return [];
        }
    }

    function filterNavbarByRole() {
        const userRoles = getUserRoles();
        console.log('User roles (navbar):', userRoles);

        const navItems = document.querySelectorAll('.navbar-nav .nav-item[data-role]');
        console.log('Nav items found:', navItems.length);

        navItems.forEach(item => {
            const allowedRoles = item.getAttribute('data-role').split(',').map(r => r.trim().toLowerCase());

            if (userRoles.length === 0) {
                item.style.display = 'none';
                return;
            }

            const hasAccess = userRoles.some(userRole => allowedRoles.includes(userRole));
            item.style.display = hasAccess ? '' : 'none';
            console.log(`Item roles [${allowedRoles}] | User has access: ${hasAccess}`);
        });
    }

    function highlightActiveLink() {
        const currentPath = window.location.pathname;
        document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href && currentPath.includes(href) && href !== '#') {
                link.classList.add('active');
            }
        });
    }

    filterNavbarByRole();
    highlightActiveLink();
});