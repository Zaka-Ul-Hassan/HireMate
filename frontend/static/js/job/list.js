// frontend\static\js\job\list.js

document.addEventListener("DOMContentLoaded", function () {
    const jobContainer = document.getElementById("jobContainer");
    const jobTemplate = document.getElementById("jobTemplate");
    const jobAlert = document.getElementById("jobAlert");
    const spinner = document.getElementById("loadingSpinner");

    // Helper: show toaster notification
    function showToast(message, type = "info") {
        const toastContainerId = "toastContainer";
        let toastContainer = document.getElementById(toastContainerId);

        if (!toastContainer) {
            toastContainer = document.createElement("div");
            toastContainer.id = toastContainerId;
            toastContainer.style.position = "fixed";
            toastContainer.style.top = "1rem";
            toastContainer.style.right = "1rem";
            toastContainer.style.zIndex = "9999";
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement("div");
        toast.className = `toast align-items-center text-bg-${type} border-0 show`;
        toast.style.minWidth = "250px";
        toast.style.marginTop = "1rem";
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto"></button>
            </div>
        `;
        toastContainer.appendChild(toast);

        setTimeout(() => toast.remove(), 4000);
    }

    function fetchJobsAndRender(page = 2) {
        spinner.style.display = "block";
        jobContainer.innerHTML = "";
        jobAlert.innerHTML = "";

        makeAuthenticatedRequest(
            "POST",
            `/api/recommend-jobs/recommend/jobs?page=${page}`,
            null,
            function (xhr) {
                spinner.style.display = "none";

                const data = JSON.parse(xhr.responseText);

                if (!data.status) {
                    showToast(data.message || "Something went wrong.", "danger");
                    return;
                }

                const jobs = Array.isArray(data.data) ? data.data : [];

                if (jobs.length === 0) {
                    showToast(data.message || "No relevant jobs available.", "info");
                    return;
                }

                jobAlert.innerHTML = `
                    <span class="badge bg-success fs-6 py-2 px-3">
                        Found ${jobs.length} job(s)
                    </span>
                `;

                jobs.forEach(job => {
                    const clone = jobTemplate.cloneNode(true);
                    clone.style.display = "flex";
                    clone.removeAttribute("id");

                    clone.querySelector(".job-title").textContent = job.job_title || "N/A";
                    clone.querySelector(".company-name").textContent = job.company_name || "N/A";
                    clone.querySelector(".job-location").textContent =
                        `Location: ${job.job_location || "Remote"}`;
                    clone.querySelector(".posted-date").textContent =
                        `Posted Date: ${job.posted_date || "N/A"}`;

                    const tagsContainer = clone.querySelector(".tag-list");
                    tagsContainer.innerHTML = "";
                    (job.tags || []).forEach(tag => {
                        const span = document.createElement("span");
                        span.className = "badge border rounded-pill px-3 py-1 text-dark bg-white";
                        span.textContent = tag;
                        tagsContainer.appendChild(span);
                    });

                    // Job URL
                    const jobViewBtn = clone.querySelector(".job-view-btn");
                    if (job.linkedin_job_url_cleaned) {
                        jobViewBtn.href = job.linkedin_job_url_cleaned;
                    } else {
                        jobViewBtn.classList.add("disabled");
                        jobViewBtn.style.pointerEvents = "none";
                    }

                    // Company URL
                    const companyLink = clone.querySelector(".job-company-link");
                    if (job.linkedin_company_url_cleaned) {
                        companyLink.href = job.linkedin_company_url_cleaned;
                    } else {
                        companyLink.classList.add("disabled");
                        companyLink.style.pointerEvents = "none";
                    }

                    jobContainer.appendChild(clone);
                });
            },
            function () {
                spinner.style.display = "none";
                showToast("Network error. Please try again.", "danger");
            }
        );
    }

    if (window.location.pathname === "/job/list") {
        fetchJobsAndRender();
    }

    window.fetchJobsAndRender = fetchJobsAndRender;
});
