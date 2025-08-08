// frontend/static/js/user/logout.js
if (!window.logoutHandlerAttached) {
  window.logoutHandlerAttached = true;

  document.addEventListener("DOMContentLoaded", () => {

    const logoutModalEl = document.getElementById("logoutModal");
    let logoutModal = null;

    if (logoutModalEl) {
      logoutModal = new bootstrap.Modal(logoutModalEl);
    }

    toastr.options = {
      closeButton: true,
      progressBar: true,
      positionClass: "toast-top-right",
      timeOut: "1200"
    };

    logoutModalEl?.addEventListener("hidden.bs.modal", () => {
      document.body.classList.remove("modal-open");
      document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
    });

    document.body.addEventListener("click", (e) => {
      const target = e.target;

      if (target.closest("#logoutButton")) {
        e.preventDefault();
        logoutModal?.show();
        return;
      }

      if (target.matches("#confirmLogout")) {
        logoutModal?.hide();
        toastr.info("Logging you out...");

        fetch("/api/users/logout", { method: "POST" })
          .then(res => {
            if (res.ok) {
              setTimeout(() => window.location.href = "/", 900);
            } else {
              toastr.error("Logout failed.");
            }
          })
          .catch(() => toastr.error("Network error while logging out."));
        return;
      }

      if (target.matches("#cancelLogout")) {
        toastr.info("Logout cancelled.");
        logoutModal?.hide();
      }
    });
  });
}
