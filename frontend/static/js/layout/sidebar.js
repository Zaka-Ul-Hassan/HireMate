// frontend\static\js\layout\sidebar.js
document.addEventListener("DOMContentLoaded", function () {
  
    // Find Job Button
    const findJobBtn = document.getElementById("findJobButton");
    if (findJobBtn) {
        findJobBtn.addEventListener("click", function (e) {
            e.preventDefault(); // Prevent normal link behavior
            window.location.href = "/job/list"; // Navigate to job list
        });
    }

    // Find Candidates Button
    const findCandidateButton = document.getElementById('findCandidateButton');
    if (findCandidateButton) {
        findCandidateButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/resume/rag'; // Navigate to AI candidate finder
        });
    }

    // Highlight active menu item based on current URL
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.sidebar-menu .nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath.includes(href) && href !== '#') {
            link.classList.add('active');
            
            // If it's a submenu link, also expand the parent
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

    // Store collapse state in localStorage
    const collapseElements = document.querySelectorAll('.collapse');
    
    collapseElements.forEach(collapse => {
        const collapseId = collapse.id;
        const storageKey = `sidebar_${collapseId}`;
        
        // Restore state from localStorage
        const savedState = localStorage.getItem(storageKey);
        if (savedState === 'show') {
            collapse.classList.add('show');
            const toggle = document.querySelector(`[href="#${collapseId}"]`);
            if (toggle) {
                toggle.setAttribute('aria-expanded', 'true');
            }
        }
        
        // Save state on change
        collapse.addEventListener('shown.bs.collapse', function() {
            localStorage.setItem(storageKey, 'show');
        });
        
        collapse.addEventListener('hidden.bs.collapse', function() {
            localStorage.setItem(storageKey, 'hide');
        });
    });

    // Smooth scroll for sidebar menu
    const sidebarMenu = document.querySelector('.sidebar-menu');
    if (sidebarMenu) {
        sidebarMenu.style.scrollBehavior = 'smooth';
    }

    // Arrow rotation animation for dropdowns
    const dropdownToggles = document.querySelectorAll('[data-bs-toggle="collapse"]');
    
    dropdownToggles.forEach(toggle => {
        const targetId = toggle.getAttribute('href');
        const target = document.querySelector(targetId);
        const arrow = toggle.querySelector('.menu-arrow');
        
        if (target && arrow) {
            target.addEventListener('show.bs.collapse', function() {
                arrow.style.transform = 'rotate(180deg)';
            });
            
            target.addEventListener('hide.bs.collapse', function() {
                arrow.style.transform = 'rotate(0deg)';
            });
            
            // Set initial arrow state
            if (target.classList.contains('show')) {
                arrow.style.transform = 'rotate(180deg)';
            }
        }
    });

    // Add hover effect for menu items
    const menuItems = document.querySelectorAll('.sidebar-menu .nav-link');
    
    menuItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateX(5px)';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });
});

