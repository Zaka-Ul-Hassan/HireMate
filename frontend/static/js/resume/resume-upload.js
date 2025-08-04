// frontend\static\js\resume\resume-upload.js

const resumeInput = document.getElementById('resumeUpload');
const fileInfoBox = document.getElementById('fileInfoBox');
const fileNameDisplay = document.getElementById('fileName');
const clearFileBtn = document.getElementById('clearFileBtn');
const uploadContainer = document.querySelector('.upload-container');
const uploadBtn = document.getElementById('uploadBtn');
const fileIcon = fileInfoBox.querySelector('i'); // Icon inside file info box

// Show file info box and set file name + icon
function showFileBox(file) {
    if (file) {
        const fileName = file.name;
        const fileExt = fileName.split('.').pop().toLowerCase();

        fileNameDisplay.textContent = fileName;
        fileInfoBox.classList.remove('d-none');

        // Set icon based on file type
        if (fileExt === 'pdf') {
            fileIcon.className = 'fas fa-file-pdf text-danger';
        } else if (fileExt === 'doc' || fileExt === 'docx') {
            fileIcon.className = 'fas fa-file-word text-primary';
        } else {
            fileIcon.className = 'fas fa-file-alt text-secondary';
        }
    }
}

// Clear selected file
function clearFileSelection() {
    resumeInput.value = '';
    fileNameDisplay.textContent = '';
    fileInfoBox.classList.add('d-none');
}

// Handle file selection via input
resumeInput.addEventListener('change', function () {
    if (this.files && this.files[0]) {
        showFileBox(this.files[0]);
    }
});

// Handle drag-over
uploadContainer.addEventListener('dragover', function (e) {
    e.preventDefault();
});

// Handle file drop
uploadContainer.addEventListener('drop', function (e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
        resumeInput.files = e.dataTransfer.files;
        showFileBox(file);
    }
});

// Prevent drop outside container
['dragover', 'drop'].forEach(evt =>
    document.addEventListener(evt, function (e) {
        if (!uploadContainer.contains(e.target)) {
            e.preventDefault();
        }
    })
);

// Clear button handler
clearFileBtn.addEventListener('click', clearFileSelection);

// Upload button handler
uploadBtn.addEventListener('click', function () {
    const file = resumeInput.files[0];
    if (!file) {
        Swal.fire("Error", "Please select a resume to upload.", "error");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    Swal.fire({
        title: 'Uploading...',
        text: 'Please wait while we process your resume.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/resume-parser/store-process-resume', true);

    xhr.onload = function () {
        Swal.close();
        clearFileSelection();

        if (xhr.status === 200) {
            Swal.fire("Success", "Resume uploaded successfully!", "success");
        } else {
            try {
                const response = JSON.parse(xhr.responseText);
                const errorMessage = response.error || "Failed to upload resume.";
                Swal.fire("Error", errorMessage, "error");
            } catch {
                Swal.fire("Error", "Failed to upload resume. Please try again.", "error");
            }
        }
    };

    xhr.onerror = function () {
        Swal.close();
        Swal.fire("Error", "Network error occurred while uploading.", "error");
    };

    xhr.send(formData);
});
