// frontend\static\js\job\list.js

document.addEventListener("DOMContentLoaded", function () {
    debugger
    const jobContainer = document.getElementById("jobContainer");
    const jobTemplate = document.getElementById("jobTemplate");
    const jobAlert = document.getElementById("jobAlert");
    const spinner = document.getElementById("loadingSpinner");

    async function fetchJobsAndRender() {
        spinner.style.display = "block";
        jobContainer.innerHTML = "";
        jobAlert.innerHTML = "";

        try {
            debugger
            const res = await fetch("http://127.0.0.1:8000/api/recommend-jobs/recommend/jobs?page=2", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            debugger
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

            const jobs = data.jobs || [];

            if (jobs.length === 0) {
                Swal.fire({
                    icon: 'info',
                    title: 'No Jobs Found',
                    text: 'No relevant jobs found. Please update your resume.',
                });
                return;
            }

            jobs.forEach(job => {
                const clone = jobTemplate.cloneNode(true);
                clone.style.display = "flex";
                clone.removeAttribute("id");

                clone.querySelector(".job-title").textContent = job.job_title;
                clone.querySelector(".company-name").textContent = job.company_name;
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

                // Set job URL only if it exists
                const jobViewBtn = clone.querySelector(".job-view-btn");
                if (job.linkedin_job_url_cleaned) {
                    jobViewBtn.href = job.linkedin_job_url_cleaned;
                } else {
                    jobViewBtn.href = "javascript:void(0);";
                    jobViewBtn.classList.add("disabled");
                    jobViewBtn.style.pointerEvents = "none";
                }

                // Set company URL only if it exists
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
