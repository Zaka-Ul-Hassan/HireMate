// frontend\static\js\layout\sidebar.js

document.addEventListener("DOMContentLoaded", function () {
  
    const findJobBtn = document.getElementById("findJobButton");
    console.log(findJobBtn);
    if (findJobBtn) {
        findJobBtn.addEventListener("click", function (e) {
          
            e.preventDefault(); // Prevent normal link behavior
            window.location.href = "/job/list"; // Navigate to job list
        });
    }
});


document.addEventListener("DOMContentLoaded", () => {
  console.log("Sidebar.js loaded after DOM ready");

  document.body.addEventListener("click", (e) => {
    const target = e.target.closest("#logoutButton");
    if (target) {
      e.preventDefault();
      console.log("Logout clicked");

      Swal.fire({
        title: 'Confirm Logout',
        text: 'Are you sure you want to log out?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, logout',
        cancelButtonText: 'Cancel',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/logout";
        }
      });
    }
  });
});
