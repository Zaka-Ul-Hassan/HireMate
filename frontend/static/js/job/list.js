document.addEventListener("DOMContentLoaded", function () {

    const jobContainer = document.getElementById("jobContainer");
    const jobTemplate = document.getElementById("jobTemplate");
    const jobAlert = document.getElementById("jobAlert");
    const spinner = document.getElementById("loadingSpinner");

    async function fetchJobsAndRender() {
        spinner.style.display = "block";
        jobContainer.innerHTML = "";
        jobAlert.innerHTML = "";

        try {

            const res = await fetch("http://127.0.0.1:8000/api/recommend-jobs/recommend/jobs?page=2", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.detail === "Not Found") {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Resume Required',
                        text: 'Please upload your resume before finding jobs.',
                        confirmButtonText: 'Upload Resume'
                    }).then(() => {
                        window.location.href = "/resume-upload";
                    });
                    return;
                }

                throw new Error(data.detail || "Failed to fetch jobs.");
            }

            // Handle backend message object
            if (data.jobs && data.jobs.message) {
                Swal.fire({
                    icon: 'info',
                    title: 'No Jobs Found',
                    text: data.jobs.message,
                });
                return;
            }

            // Ensure jobs is an array
            const jobs = Array.isArray(data.jobs) ? data.jobs : [];

            if (jobs.length === 0) {
                Swal.fire({
                    icon: 'info',
                    title: 'No Jobs Found',
                    text: 'No jobs available at the moment.',
                });
                return;
            }

            // Show total job count
            jobAlert.innerHTML = `<span class="badge bg-success fs-6 py-2 px-3">Found ${jobs.length} job(s)</span>`;

            jobs.forEach(job => {
                const clone = jobTemplate.cloneNode(true);
                clone.style.display = "flex";
                clone.removeAttribute("id");

                clone.querySelector(".job-title").textContent = job.job_title || "N/A";
                clone.querySelector(".company-name").textContent = job.company_name || "N/A";
                clone.querySelector(".job-location").textContent = `Location: ${job.job_location || "Remote"}`;
                clone.querySelector(".posted-date").textContent = `Posted Date: ${job.posted_date || "N/A"}`;

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
                    jobViewBtn.href = "javascript:void(0);";
                    jobViewBtn.classList.add("disabled");
                    jobViewBtn.style.pointerEvents = "none";
                }

                // Company URL
                const companyLink = clone.querySelector(".job-company-link");
                if (job.linkedin_company_url_cleaned) {
                    companyLink.href = job.linkedin_company_url_cleaned;
                } else {
                    companyLink.href = "javascript:void(0);";
                    companyLink.classList.add("disabled");
                    companyLink.style.pointerEvents = "none";
                }

                jobContainer.appendChild(clone);
            });

        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: err.message || "Something went wrong. Please try again.",
            });
        } finally {
            spinner.style.display = "none";
        }
    }

    if (window.location.pathname === "/job/list") {
        fetchJobsAndRender();
    }

    window.fetchJobsAndRender = fetchJobsAndRender;
});
