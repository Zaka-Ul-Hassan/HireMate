// frontend/static/js/resume/resume-upload.js

const BASE_URL = window.APP_CONFIG.FRONTEND_BASE_URL || 'http://127.0.0.1:8000';
const resumeInput = document.getElementById('resumeUpload');
const fileInfoBox = document.getElementById('fileInfoBox');
const fileNameDisplay = document.getElementById('fileName');
const clearFileBtn = document.getElementById('clearFileBtn');
const uploadContainer = document.querySelector('.upload-container');
const uploadBtn = document.getElementById('uploadBtn');
const fileIcon = fileInfoBox.querySelector('i');

/* ================= TOAST (SAME AS JOB LIST) ================= */
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

/* ================= FILE UI ================= */
function showFileBox(file) {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    fileNameDisplay.textContent = file.name;
    fileInfoBox.classList.remove('d-none');

    fileIcon.className =
        ext === 'pdf' ? 'fas fa-file-pdf text-danger' :
        (ext === 'doc' || ext === 'docx') ? 'fas fa-file-word text-primary' :
        'fas fa-file-alt text-secondary';
}

function clearFileSelection() {
    resumeInput.value = '';
    fileNameDisplay.textContent = '';
    fileInfoBox.classList.add('d-none');
}

resumeInput.addEventListener('change', e => showFileBox(e.target.files[0]));
uploadContainer.addEventListener('dragover', e => e.preventDefault());
uploadContainer.addEventListener('drop', e => {
    e.preventDefault();
    resumeInput.files = e.dataTransfer.files;
    showFileBox(e.dataTransfer.files[0]);
});
clearFileBtn.addEventListener('click', clearFileSelection);

/* ================= AUTHENTICATED FORM UPLOAD ================= */
function sendAuthenticatedFormData(url, formData, success, failure) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.withCredentials = true;

    // ONLY Authorization header
    const token = localStorage.getItem("access_token");
    if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.onload = () => success(xhr);
    xhr.onerror = () => failure(xhr);

    xhr.send(formData);
}

/* ================= UPLOAD ================= */
uploadBtn.addEventListener('click', function () {
    const file = resumeInput.files[0];
    if (!file) {
        showToast("Please select a resume to upload.", "danger");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    // Get access token from localStorage
    const token = localStorage.getItem("access_token");
    if (!token) {
        showToast("Session expired. Please log in again.", "danger");
        return;
    }

    Swal.fire({
        title: 'Uploading...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    // Send request with Authorization header
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/resume-parser/store-process-resume", true);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.onload = () => {
        Swal.close();

        let res;
        try { res = JSON.parse(xhr.responseText); }
        catch { return showToast("Invalid server response", "danger"); }

        if (!res.status) {
            showToast(res.message || "Upload failed", "danger");
            return;
        }

        if (res.data?.resume_exists) {
            Swal.fire({
                title: "Resume already exists",
                text: res.message,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, replace it"
            }).then(result => {
                if (!result.isConfirmed) return clearFileSelection();

                const updateForm = new FormData();
                updateForm.append("file", file);
                updateForm.append("update_existing", "true");

                Swal.fire({
                    title: 'Updating...',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading()
                });

                const uXhr = new XMLHttpRequest();
                uXhr.open("POST", "/api/resume-parser/store-process-resume", true);
                uXhr.setRequestHeader("Authorization", `Bearer ${token}`);
                uXhr.onload = () => {
                    Swal.close();
                    const uRes = JSON.parse(uXhr.responseText);
                    uRes.status
                        ? showToast(uRes.message, "success")
                        : showToast(uRes.message, "danger");
                    clearFileSelection();
                };
                uXhr.onerror = () => {
                    Swal.close();
                    showToast("Network error", "danger");
                };
                uXhr.send(updateForm);
            });
        } else {
            showToast(res.message, "success");
            clearFileSelection();
        }
    };
    xhr.onerror = () => {
        Swal.close();
        showToast("Network error occurred", "danger");
    };
    xhr.send(formData);
});
