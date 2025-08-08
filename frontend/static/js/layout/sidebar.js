// frontend\static\js\layout\sidebar.js

document.addEventListener("DOMContentLoaded", function () {
  
    const findJobBtn = document.getElementById("findJobButton");
    if (findJobBtn) {
        findJobBtn.addEventListener("click", function (e) {
          
            e.preventDefault(); // Prevent normal link behavior
            window.location.href = "/job/list"; // Navigate to job list
        });
    }
});

